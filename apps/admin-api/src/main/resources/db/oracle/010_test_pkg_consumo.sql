-- Teste repetível do package, da trigger de auditoria e do SQL dinâmico.
-- Aplica-se depois de 001 a 009. Apaga alertas e logs no início e no fim
-- para a suíte 005 continuar vendo a tabela de alerta vazia.
-- Sem URL, usuário ou senha. Falha com ORA-20101 se algum critério não bater.

SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT FAILURE

DECLARE
  c_inicio CONSTANT TIMESTAMP := TIMESTAMP '2026-09-01 00:00:00';
  c_fim    CONSTANT TIMESTAMP := TIMESTAMP '2026-09-30 23:59:59';
  v_ana           NUMBER;
  v_bruno         NUMBER;
  v_clara         NUMBER;
  v_alerta_id     NUMBER;
  v_count         NUMBER;
  v_total         NUMBER;
  v_texto         VARCHAR2(400);
  v_operacao      VARCHAR2(10);

  PROCEDURE ok(p_rotulo IN VARCHAR2) IS
  BEGIN
    DBMS_OUTPUT.PUT_LINE('OK ' || p_rotulo);
  END;

  PROCEDURE assert_equal(
    p_rotulo   IN VARCHAR2,
    p_esperado IN VARCHAR2,
    p_obtido   IN VARCHAR2
  ) IS
  BEGIN
    IF p_esperado = p_obtido
       OR (p_esperado IS NULL AND p_obtido IS NULL) THEN
      ok(p_rotulo);
      RETURN;
    END IF;
    RAISE_APPLICATION_ERROR(
      -20101,
      p_rotulo || ' esperava [' || p_esperado || '] obteve [' || p_obtido || ']'
    );
  END;

  FUNCTION id_de(p_identificador IN VARCHAR2) RETURN NUMBER IS
    v_id NUMBER;
  BEGIN
    SELECT id
      INTO v_id
      FROM usuario_consumo
     WHERE identificador_externo = p_identificador;
    RETURN v_id;
  END;

  PROCEDURE espera_erro(
    p_rotulo  IN VARCHAR2,
    p_codigo  IN NUMBER,
    p_chamada IN VARCHAR2
  ) IS
    v_numero NUMBER;
    v_id     NUMBER;
  BEGIN
    v_id := id_de('sim-abaixo-limite');

    IF p_chamada = 'DINAMICO_ORIGEM' THEN
      v_numero := pkg_consumo_ia.fn_consultar_total_dinamico('XYZ', v_id);
    ELSIF p_chamada = 'DINAMICO_INJECAO' THEN
      v_numero := pkg_consumo_ia.fn_consultar_total_dinamico('LEITURA; DROP', v_id);
    ELSIF p_chamada = 'DINAMICO_NULO' THEN
      v_numero := pkg_consumo_ia.fn_consultar_total_dinamico('LEITURA', NULL);
    ELSE
      RAISE_APPLICATION_ERROR(-20101, 'Chamada de teste desconhecida: ' || p_chamada);
    END IF;

    RAISE_APPLICATION_ERROR(-20101, p_rotulo || ' devolveu valor em vez de exceção.');
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE = p_codigo THEN
        ok(p_rotulo);
      ELSIF SQLCODE = -20101 THEN
        RAISE;
      ELSE
        RAISE_APPLICATION_ERROR(
          -20101,
          p_rotulo || ' esperava ' || p_codigo || ' obteve ' || SQLCODE || ' ' || SQLERRM
        );
      END IF;
  END;
BEGIN
  SELECT COUNT(*)
    INTO v_count
    FROM user_objects
   WHERE object_name = 'PKG_CONSUMO_IA'
     AND object_type IN ('PACKAGE', 'PACKAGE BODY')
     AND status = 'VALID';
  assert_equal('package valido', '2', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_objects
   WHERE object_name = 'TRG_LOG_ALERTA_CONSUMO'
     AND object_type = 'TRIGGER'
     AND status = 'VALID';
  assert_equal('trigger valida', '1', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_tables
   WHERE table_name = 'LOG_ALERTA_CONSUMO';
  assert_equal('tabela de log', '1', TO_CHAR(v_count));

  DELETE FROM alerta_consumo;
  DELETE FROM log_alerta_consumo;
  COMMIT;

  v_ana := id_de('sim-abaixo-limite');
  v_bruno := id_de('sim-no-limite');
  v_clara := id_de('sim-sem-leitura');

  v_total := pkg_consumo_ia.fn_indicador_tokens(v_ana, c_inicio, c_fim);
  assert_equal('package ana indicador', '3500', TO_CHAR(v_total));
  assert_equal(
    'fachada ana igual ao package',
    TO_CHAR(v_total),
    TO_CHAR(fn_indicador_tokens(v_ana, c_inicio, c_fim))
  );

  v_texto := pkg_consumo_ia.fn_consumo_formatado(v_bruno, c_inicio, c_fim);
  assert_equal(
    'package bruno texto',
    'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
    v_texto
  );

  -- Soma de todas as leituras, não só o período. Demonstra a consulta flexível.
  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('LEITURA', v_ana);
  assert_equal('dinamico leitura ana', '12500', TO_CHAR(v_total));
  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('  leitura  ', v_bruno);
  assert_equal('dinamico leitura bruno', '15000', TO_CHAR(v_total));
  v_total := fn_consultar_total_dinamico('LEITURA', v_clara);
  assert_equal('fachada dinamica clara', '0', TO_CHAR(v_total));

  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('ALERTA', v_bruno);
  assert_equal('dinamico alerta vazio', '0', TO_CHAR(v_total));
  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('LOG', v_bruno);
  assert_equal('dinamico log vazio', '0', TO_CHAR(v_total));

  pkg_consumo_ia.pr_registrar_alerta_consumo(v_bruno, c_inicio, c_fim, 10000, v_alerta_id);
  assert_equal('bruno alerta gravado', '1', CASE WHEN v_alerta_id IS NOT NULL THEN '1' ELSE '0' END);

  SELECT COUNT(*), MAX(operacao)
    INTO v_count, v_operacao
    FROM log_alerta_consumo
   WHERE alerta_id = v_alerta_id
     AND usuario_id = v_bruno;
  assert_equal('trigger insert uma linha', '1', TO_CHAR(v_count));
  assert_equal('trigger insert operacao', 'INSERT', v_operacao);

  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('ALERTA', v_bruno);
  assert_equal('dinamico alerta depois', '1', TO_CHAR(v_total));
  v_total := pkg_consumo_ia.fn_consultar_total_dinamico('LOG', v_bruno);
  assert_equal('dinamico log depois', '1', TO_CHAR(v_total));

  UPDATE alerta_consumo
     SET mensagem = mensagem
   WHERE id = v_alerta_id;
  SELECT COUNT(*)
    INTO v_count
    FROM log_alerta_consumo
   WHERE alerta_id = v_alerta_id
     AND operacao = 'UPDATE';
  assert_equal('trigger update', '1', TO_CHAR(v_count));

  DELETE FROM alerta_consumo WHERE id = v_alerta_id;
  SELECT COUNT(*)
    INTO v_count
    FROM log_alerta_consumo
   WHERE alerta_id = v_alerta_id
     AND operacao = 'DELETE';
  assert_equal('trigger delete', '1', TO_CHAR(v_count));

  espera_erro('origem invalida', -20004, 'DINAMICO_ORIGEM');
  espera_erro('origem injetada recusada', -20004, 'DINAMICO_INJECAO');
  espera_erro('usuario nulo no dinamico', -20001, 'DINAMICO_NULO');

  DELETE FROM alerta_consumo;
  DELETE FROM log_alerta_consumo;
  COMMIT;
  SELECT COUNT(*) INTO v_count FROM alerta_consumo;
  assert_equal('alertas limpos', '0', TO_CHAR(v_count));
  SELECT COUNT(*) INTO v_count FROM log_alerta_consumo;
  assert_equal('logs limpos', '0', TO_CHAR(v_count));

  ok('suite concluida');
END;
/
