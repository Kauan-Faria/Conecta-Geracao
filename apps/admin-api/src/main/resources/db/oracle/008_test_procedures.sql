-- Teste repetível do bolt 034. Aplica-se depois de 001 a 007.
-- Apaga alertas no início e no fim para a suíte 005 continuar vendo a tabela vazia.
-- Sem URL, usuário ou senha. Falha com ORA-20101 se algum critério não bater.

SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT FAILURE

DECLARE
  c_inicio CONSTANT TIMESTAMP := TIMESTAMP '2026-09-01 00:00:00';
  c_fim    CONSTANT TIMESTAMP := TIMESTAMP '2026-09-30 23:59:59';
  c_ponto  CONSTANT TIMESTAMP := TIMESTAMP '2026-09-15 12:00:00';
  v_ana           NUMBER;
  v_bruno         NUMBER;
  v_alerta_id     NUMBER;
  v_alerta_id_2   NUMBER;
  v_count         NUMBER;
  v_total         NUMBER;
  v_tem           NUMBER;
  v_nome          VARCHAR2(120);
  v_usuario_id    NUMBER;
  v_linhas        NUMBER;
  v_mensagem      VARCHAR2(400);
  v_cursor        SYS_REFCURSOR;
  v_t0            NUMBER;
  v_cs            NUMBER;
  v_achou_ana     NUMBER;
  v_achou_bruno   NUMBER;
  v_achou_clara   NUMBER;

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
    v_id     NUMBER;
    v_alerta NUMBER;
    v_saida  SYS_REFCURSOR;
  BEGIN
    v_id := id_de('sim-abaixo-limite');

    IF p_chamada = 'ALERTA_INEXISTENTE' THEN
      pr_registrar_alerta_consumo(999999, c_inicio, c_fim, 10000, v_alerta);
    ELSIF p_chamada = 'ALERTA_PERIODO' THEN
      pr_registrar_alerta_consumo(v_id, c_fim, c_inicio, 10000, v_alerta);
    ELSIF p_chamada = 'ALERTA_LIMITE' THEN
      pr_registrar_alerta_consumo(v_id, c_inicio, c_fim, -1, v_alerta);
    ELSIF p_chamada = 'RELATORIO_PERIODO' THEN
      pr_relatorio_consumo(c_fim, c_inicio, v_saida);
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

  PROCEDURE conferir_relatorio(p_rotulo IN VARCHAR2, p_bruno_tem IN NUMBER) IS
  BEGIN
    v_t0 := DBMS_UTILITY.GET_TIME;
    pr_relatorio_consumo(c_inicio, c_fim, v_cursor);
    v_cs := DBMS_UTILITY.GET_TIME - v_t0;
    DBMS_OUTPUT.PUT_LINE('TEMPO ' || p_rotulo || ' ' || v_cs);

    IF v_cs >= 300 THEN
      RAISE_APPLICATION_ERROR(-20101, p_rotulo || ' passou de 3s: ' || v_cs);
    END IF;
    ok(p_rotulo || ' abaixo de 3s');

    v_linhas := 0;
    v_achou_ana := 0;
    v_achou_bruno := 0;
    v_achou_clara := 0;

    LOOP
      FETCH v_cursor INTO v_usuario_id, v_nome, v_total, v_tem;
      EXIT WHEN v_cursor%NOTFOUND;
      v_linhas := v_linhas + 1;

      IF v_nome = 'Ana Clara' THEN
        v_achou_ana := 1;
        assert_equal(p_rotulo || ' ana total', '3500', TO_CHAR(v_total));
        assert_equal(p_rotulo || ' ana alerta', '0', TO_CHAR(v_tem));
      ELSIF v_nome = 'Bruno Alves' THEN
        v_achou_bruno := 1;
        assert_equal(p_rotulo || ' bruno total', '10000', TO_CHAR(v_total));
        assert_equal(p_rotulo || ' bruno alerta', TO_CHAR(p_bruno_tem), TO_CHAR(v_tem));
      ELSIF v_nome = 'Clara Sem Leituras' THEN
        v_achou_clara := 1;
        assert_equal(p_rotulo || ' clara total', '0', TO_CHAR(v_total));
        assert_equal(p_rotulo || ' clara alerta', '0', TO_CHAR(v_tem));
      END IF;
    END LOOP;
    CLOSE v_cursor;

    assert_equal(p_rotulo || ' uma linha por usuario', '3', TO_CHAR(v_linhas));
    assert_equal(p_rotulo || ' achou ana', '1', TO_CHAR(v_achou_ana));
    assert_equal(p_rotulo || ' achou bruno', '1', TO_CHAR(v_achou_bruno));
    assert_equal(p_rotulo || ' achou clara', '1', TO_CHAR(v_achou_clara));
  END;
BEGIN
  SELECT COUNT(*)
    INTO v_count
    FROM user_objects
   WHERE object_name IN ('PR_REGISTRAR_ALERTA_CONSUMO', 'PR_RELATORIO_CONSUMO')
     AND object_type = 'PROCEDURE'
     AND status = 'VALID';
  assert_equal('procedures validas', '2', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_tables
   WHERE table_name = 'RELATORIO_CONSUMO_TMP';
  assert_equal('temporaria do relatorio', '1', TO_CHAR(v_count));

  DELETE FROM alerta_consumo;
  COMMIT;

  v_ana := id_de('sim-abaixo-limite');
  v_bruno := id_de('sim-no-limite');

  v_t0 := DBMS_UTILITY.GET_TIME;
  pr_registrar_alerta_consumo(v_ana, c_inicio, c_fim, 10000, v_alerta_id);
  v_cs := DBMS_UTILITY.GET_TIME - v_t0;
  DBMS_OUTPUT.PUT_LINE('TEMPO alerta ana ' || v_cs);
  IF v_cs >= 300 THEN
    RAISE_APPLICATION_ERROR(-20101, 'alerta ana passou de 3s: ' || v_cs);
  END IF;
  ok('alerta ana abaixo de 3s');

  assert_equal('ana abaixo do limite sem id', '1', CASE WHEN v_alerta_id IS NULL THEN '1' ELSE '0' END);
  SELECT COUNT(*) INTO v_count FROM alerta_consumo;
  assert_equal('ana nao grava alerta', '0', TO_CHAR(v_count));

  conferir_relatorio('antes', 0);

  pr_registrar_alerta_consumo(v_bruno, c_inicio, c_fim, NULL, v_alerta_id);
  assert_equal('bruno grava id', '1', CASE WHEN v_alerta_id IS NOT NULL THEN '1' ELSE '0' END);

  SELECT COUNT(*), MAX(mensagem)
    INTO v_count, v_mensagem
    FROM alerta_consumo
   WHERE usuario_id = v_bruno
     AND inicio = c_inicio
     AND fim = c_fim;
  assert_equal('bruno um alerta', '1', TO_CHAR(v_count));
  assert_equal(
    'bruno mensagem',
    'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
    v_mensagem
  );

  pr_registrar_alerta_consumo(v_bruno, c_inicio, c_fim, 10000, v_alerta_id_2);
  assert_equal('bruno mesmo id', TO_CHAR(v_alerta_id), TO_CHAR(v_alerta_id_2));
  SELECT COUNT(*) INTO v_count FROM alerta_consumo WHERE usuario_id = v_bruno;
  assert_equal('bruno continua unico', '1', TO_CHAR(v_count));

  conferir_relatorio('depois', 1);

  SELECT COUNT(*) INTO v_count FROM alerta_consumo;
  pr_registrar_alerta_consumo(v_ana, c_ponto, c_ponto, 3000, v_alerta_id_2);
  assert_equal('limite 3000 no ponto nao grava', '1', CASE WHEN v_alerta_id_2 IS NULL THEN '1' ELSE '0' END);
  SELECT COUNT(*) INTO v_linhas FROM alerta_consumo;
  assert_equal('contagem estavel no limite alto', TO_CHAR(v_count), TO_CHAR(v_linhas));

  pr_registrar_alerta_consumo(v_ana, c_ponto, c_ponto, 1500, v_alerta_id_2);
  SELECT total_tokens, mensagem
    INTO v_total, v_mensagem
    FROM alerta_consumo
   WHERE id = v_alerta_id_2;
  assert_equal('limite informado 1500', '2000', TO_CHAR(v_total));
  assert_equal(
    'mensagem do limite informado',
    'Ana Clara consumiu 2000 tokens no período. Consumo alto.',
    v_mensagem
  );

  espera_erro('alerta usuario inexistente', -20001, 'ALERTA_INEXISTENTE');
  SELECT COUNT(*) INTO v_count FROM alerta_consumo WHERE usuario_id = 999999;
  assert_equal('inexistente sem linha', '0', TO_CHAR(v_count));

  espera_erro('alerta periodo invalido', -20002, 'ALERTA_PERIODO');
  espera_erro('alerta limite negativo', -20003, 'ALERTA_LIMITE');
  espera_erro('relatorio periodo invalido', -20002, 'RELATORIO_PERIODO');

  SELECT COUNT(*) INTO v_count FROM relatorio_consumo_tmp;
  assert_equal('periodo invalido sem linha publicada', '0', TO_CHAR(v_count));

  DELETE FROM alerta_consumo;
  COMMIT;
  SELECT COUNT(*) INTO v_count FROM alerta_consumo;
  assert_equal('alertas limpos', '0', TO_CHAR(v_count));

  ok('suite concluida');
END;
/
