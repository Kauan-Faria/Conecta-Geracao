-- PR_REGISTRAR_ALERTA_CONSUMO: grava um alerta se o total do período atinge o limite.
-- Não duplica o mesmo usuário e período. Abaixo do limite não insere.
-- Reutiliza FN_INDICADOR_TOKENS. Limite padrão: 10000 tokens.
-- -20001 usuário inexistente. -20002 período inválido. -20003 limite negativo.

SET DEFINE OFF
WHENEVER SQLERROR EXIT FAILURE

CREATE OR REPLACE PROCEDURE pr_registrar_alerta_consumo (
  p_usuario_id IN  usuario_consumo.id%TYPE,
  p_inicio     IN  TIMESTAMP,
  p_fim        IN  TIMESTAMP,
  p_limite     IN  NUMBER DEFAULT 10000,
  p_alerta_id  OUT alerta_consumo.id%TYPE
) IS
  -- Decide o insert com IF. O EXCEPTION desfaz efeito parcial e traduz a causa.
  e_usuario_inexistente EXCEPTION;
  e_periodo_invalido    EXCEPTION;
  e_limite_invalido     EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_usuario_inexistente, -20001);
  PRAGMA EXCEPTION_INIT(e_periodo_invalido, -20002);
  PRAGMA EXCEPTION_INIT(e_limite_invalido, -20003);
  v_limite   NUMBER;
  v_total    NUMBER;
  v_nome     usuario_consumo.nome%TYPE;
  v_mensagem alerta_consumo.mensagem%TYPE;
BEGIN
  p_alerta_id := NULL;
  v_limite := NVL(p_limite, 10000);

  IF p_inicio IS NULL OR p_fim IS NULL OR p_inicio > p_fim THEN
    RAISE e_periodo_invalido;
  END IF;

  IF v_limite < 0 THEN
    RAISE e_limite_invalido;
  END IF;

  v_total := fn_indicador_tokens(p_usuario_id, p_inicio, p_fim);

  IF v_total < v_limite THEN
    RETURN;
  END IF;

  BEGIN
    SELECT id
      INTO p_alerta_id
      FROM alerta_consumo
     WHERE usuario_id = p_usuario_id
       AND inicio = p_inicio
       AND fim = p_fim;
    RETURN;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      NULL;
  END;

  SELECT nome
    INTO v_nome
    FROM usuario_consumo
   WHERE id = p_usuario_id;

  v_mensagem := v_nome
    || ' consumiu '
    || TO_CHAR(v_total, 'FM999999999999')
    || ' tokens no período. Consumo alto.';

  INSERT INTO alerta_consumo (
    usuario_id, inicio, fim, total_tokens, mensagem
  ) VALUES (
    p_usuario_id, p_inicio, p_fim, v_total, v_mensagem
  ) RETURNING id INTO p_alerta_id;
EXCEPTION
  WHEN e_periodo_invalido THEN
    RAISE_APPLICATION_ERROR(-20002, 'Período inválido: início posterior ao fim.');
  WHEN e_usuario_inexistente THEN
    RAISE_APPLICATION_ERROR(-20001, 'Usuário de consumo inexistente.');
  WHEN e_limite_invalido THEN
    RAISE_APPLICATION_ERROR(-20003, 'Limite de consumo inválido.');
  WHEN DUP_VAL_ON_INDEX THEN
    SELECT id
      INTO p_alerta_id
      FROM alerta_consumo
     WHERE usuario_id = p_usuario_id
       AND inicio = p_inicio
       AND fim = p_fim;
  WHEN OTHERS THEN
    RAISE;
END pr_registrar_alerta_consumo;
/

SHOW ERRORS PROCEDURE pr_registrar_alerta_consumo

DECLARE
  v_status user_objects.status%TYPE;
BEGIN
  SELECT status
    INTO v_status
    FROM user_objects
   WHERE object_name = 'PR_REGISTRAR_ALERTA_CONSUMO'
     AND object_type = 'PROCEDURE';

  IF v_status <> 'VALID' THEN
    RAISE_APPLICATION_ERROR(-20100, 'PR_REGISTRAR_ALERTA_CONSUMO não compilou.');
  END IF;
END;
/
