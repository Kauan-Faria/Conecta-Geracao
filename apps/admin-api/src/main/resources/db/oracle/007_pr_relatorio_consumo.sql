-- PR_RELATORIO_CONSUMO: uma linha por usuário simulado no período.
-- Cursor e loop. Total vem de FN_INDICADOR_TOKENS. IF marca o alerta.
-- A saída JDBC é um SYS_REFCURSOR aberto só depois do loop.
-- -20002 período inválido. Falha no meio não publica linha parcial.

SET DEFINE OFF
WHENEVER SQLERROR EXIT FAILURE

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_count
    FROM user_tables
   WHERE table_name = 'RELATORIO_CONSUMO_TMP';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE GLOBAL TEMPORARY TABLE RELATORIO_CONSUMO_TMP (
        USUARIO_ID NUMBER NOT NULL,
        NOME VARCHAR2(120 CHAR) NOT NULL,
        TOTAL_TOKENS NUMBER(12) NOT NULL,
        TEM_ALERTA NUMBER(1) NOT NULL,
        CONSTRAINT CK_RELATORIO_TMP_TOKENS CHECK (TOTAL_TOKENS >= 0),
        CONSTRAINT CK_RELATORIO_TMP_ALERTA CHECK (TEM_ALERTA IN (0, 1))
      ) ON COMMIT PRESERVE ROWS';
  END IF;
END;
/

COMMENT ON TABLE RELATORIO_CONSUMO_TMP IS
  'Rascunho de sessão do relatório. Não é série de consumo.';

CREATE OR REPLACE PROCEDURE pr_relatorio_consumo (
  p_inicio    IN  TIMESTAMP,
  p_fim       IN  TIMESTAMP,
  p_resultado OUT SYS_REFCURSOR
) IS
  -- Monta o resumo em memória de sessão e só então abre o cursor de saída.
  e_periodo_invalido EXCEPTION;
  CURSOR c_usuarios IS
    SELECT id, nome
      FROM usuario_consumo
     ORDER BY id;
  v_total      NUMBER;
  v_qtd_alerta NUMBER;
  v_tem_alerta NUMBER(1);
BEGIN
  DELETE FROM relatorio_consumo_tmp;

  IF p_inicio IS NULL OR p_fim IS NULL OR p_inicio > p_fim THEN
    RAISE e_periodo_invalido;
  END IF;

  FOR r_usuario IN c_usuarios LOOP
    v_total := fn_indicador_tokens(r_usuario.id, p_inicio, p_fim);

    SELECT COUNT(*)
      INTO v_qtd_alerta
      FROM alerta_consumo
     WHERE usuario_id = r_usuario.id
       AND inicio = p_inicio
       AND fim = p_fim;

    IF v_qtd_alerta > 0 THEN
      v_tem_alerta := 1;
    ELSE
      v_tem_alerta := 0;
    END IF;

    INSERT INTO relatorio_consumo_tmp (
      usuario_id, nome, total_tokens, tem_alerta
    ) VALUES (
      r_usuario.id, r_usuario.nome, v_total, v_tem_alerta
    );
  END LOOP;

  OPEN p_resultado FOR
    SELECT usuario_id, nome, total_tokens, tem_alerta
      FROM relatorio_consumo_tmp
     ORDER BY usuario_id;
EXCEPTION
  WHEN e_periodo_invalido THEN
    RAISE_APPLICATION_ERROR(-20002, 'Período inválido: início posterior ao fim.');
  WHEN OTHERS THEN
    DELETE FROM relatorio_consumo_tmp;
    RAISE;
END pr_relatorio_consumo;
/

SHOW ERRORS PROCEDURE pr_relatorio_consumo

DECLARE
  v_status user_objects.status%TYPE;
BEGIN
  SELECT status
    INTO v_status
    FROM user_objects
   WHERE object_name = 'PR_RELATORIO_CONSUMO'
     AND object_type = 'PROCEDURE';

  IF v_status <> 'VALID' THEN
    RAISE_APPLICATION_ERROR(-20100, 'PR_RELATORIO_CONSUMO não compilou.');
  END IF;
END;
/
