-- Teste repetível do bolt 033. Não insere linha nova.
-- Pré-condição: 001, 002, 003 e 004 já aplicados no schema conectado.
-- Sem URL, usuário ou senha.
-- Falha com ORA-20101 se algum critério não bater.
-- Rodar de novo, depois de reaplicar 002, deve continuar passando.
-- A tabela de alerta precisa estar vazia: este teste é anterior à procedure do bolt 034.

SET DEFINE OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT FAILURE

DECLARE
  c_inicio CONSTANT TIMESTAMP := TIMESTAMP '2026-09-01 00:00:00';
  c_fim    CONSTANT TIMESTAMP := TIMESTAMP '2026-09-30 23:59:59';
  v_id     NUMBER;
  v_total  NUMBER;
  v_soma   NUMBER;
  v_texto  VARCHAR2(400);
  v_count  NUMBER;

  PROCEDURE ok(p_rotulo IN VARCHAR2) IS
  BEGIN
    DBMS_OUTPUT.PUT_LINE('OK ' || p_rotulo);
  END;

  PROCEDURE assert_equal(
    p_rotulo    IN VARCHAR2,
    p_esperado  IN VARCHAR2,
    p_obtido    IN VARCHAR2
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
    p_rotulo   IN VARCHAR2,
    p_codigo   IN NUMBER,
    p_chamada  IN VARCHAR2
  ) IS
    v_numero NUMBER;
    v_texto  VARCHAR2(400);
    v_id     NUMBER;
  BEGIN
    v_id := id_de('sim-abaixo-limite');

    IF p_chamada = 'INDICADOR_INEXISTENTE' THEN
      v_numero := fn_indicador_tokens(999999, c_inicio, c_fim);
    ELSIF p_chamada = 'FORMATADO_INEXISTENTE' THEN
      v_texto := fn_consumo_formatado(999999, c_inicio, c_fim);
    ELSIF p_chamada = 'INDICADOR_PERIODO' THEN
      v_numero := fn_indicador_tokens(v_id, c_fim, c_inicio);
    ELSIF p_chamada = 'FORMATADO_PERIODO' THEN
      v_texto := fn_consumo_formatado(v_id, c_fim, c_inicio);
    ELSIF p_chamada = 'INDICADOR_NULO' THEN
      v_numero := fn_indicador_tokens(NULL, c_inicio, c_fim);
    ELSIF p_chamada = 'INDICADOR_DATA_NULA' THEN
      v_numero := fn_indicador_tokens(v_id, NULL, c_fim);
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
    FROM user_tables
   WHERE table_name IN ('USUARIO_CONSUMO', 'LEITURA_CONSUMO', 'ALERTA_CONSUMO');
  assert_equal('tres tabelas', '3', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_constraints
   WHERE constraint_name = 'FK_LEITURA_USUARIO'
     AND constraint_type = 'R';
  assert_equal('fk leitura', '1', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_constraints
   WHERE constraint_name = 'UK_ALERTA_USUARIO_PERIODO';
  assert_equal('uk alerta', '1', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_indexes
   WHERE index_name = 'IX_LEITURA_USUARIO_INSTANTE';
  assert_equal('indice leitura', '1', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM user_objects
   WHERE object_name IN ('FN_INDICADOR_TOKENS', 'FN_CONSUMO_FORMATADO')
     AND object_type = 'FUNCTION'
     AND status = 'VALID';
  assert_equal('functions validas', '2', TO_CHAR(v_count));

  SELECT COUNT(*) INTO v_count FROM usuario_consumo;
  assert_equal('somente tres usuarios simulados', '3', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM usuario_consumo
   WHERE identificador_externo NOT LIKE 'sim-%';
  assert_equal('nenhum identificador fora do seed', '0', TO_CHAR(v_count));

  SELECT COUNT(*) INTO v_count FROM leitura_consumo;
  assert_equal('seis leituras', '6', TO_CHAR(v_count));

  SELECT COUNT(*) INTO v_count FROM alerta_consumo;
  assert_equal('alerta vazio', '0', TO_CHAR(v_count));

  v_id := id_de('sim-abaixo-limite');
  SELECT NVL(SUM(quantidade_tokens), 0)
    INTO v_soma
    FROM leitura_consumo
   WHERE usuario_id = v_id
     AND instante >= c_inicio
     AND instante <= c_fim;
  v_total := fn_indicador_tokens(v_id, c_inicio, c_fim);
  assert_equal('ana soma crua', '3500', TO_CHAR(v_soma));
  assert_equal('ana indicador', TO_CHAR(v_soma), TO_CHAR(v_total));
  v_texto := fn_consumo_formatado(v_id, c_inicio, c_fim);
  assert_equal(
    'ana texto',
    'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
    v_texto
  );

  v_id := id_de('sim-no-limite');
  v_total := fn_indicador_tokens(v_id, c_inicio, c_fim);
  assert_equal('bruno indicador', '10000', TO_CHAR(v_total));
  v_texto := fn_consumo_formatado(v_id, c_inicio, c_fim);
  assert_equal(
    'bruno texto',
    'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
    v_texto
  );

  v_id := id_de('sim-sem-leitura');
  v_total := fn_indicador_tokens(v_id, c_inicio, c_fim);
  assert_equal('clara indicador', '0', TO_CHAR(v_total));
  v_texto := fn_consumo_formatado(v_id, c_inicio, c_fim);
  assert_equal(
    'clara texto',
    'Clara Sem Leituras consumiu 0 tokens no período. Consumo normal.',
    v_texto
  );

  SELECT COUNT(*)
    INTO v_count
    FROM leitura_consumo l
    JOIN usuario_consumo u ON u.id = l.usuario_id
   WHERE u.identificador_externo = 'sim-abaixo-limite'
     AND l.instante = TIMESTAMP '2026-08-31 23:59:59'
     AND l.quantidade_tokens = 9000;
  assert_equal('leitura de agosto fora da soma', '1', TO_CHAR(v_count));

  SELECT COUNT(*)
    INTO v_count
    FROM leitura_consumo l
    JOIN usuario_consumo u ON u.id = l.usuario_id
   WHERE u.identificador_externo = 'sim-no-limite'
     AND l.instante = TIMESTAMP '2026-09-30 23:59:59'
     AND l.quantidade_tokens = 6000;
  assert_equal('borda final entra no seed', '1', TO_CHAR(v_count));

  espera_erro('indicador usuario inexistente', -20001, 'INDICADOR_INEXISTENTE');
  espera_erro('formatado usuario inexistente', -20001, 'FORMATADO_INEXISTENTE');
  espera_erro('indicador periodo invalido', -20002, 'INDICADOR_PERIODO');
  espera_erro('formatado periodo invalido', -20002, 'FORMATADO_PERIODO');
  espera_erro('indicador id nulo', -20001, 'INDICADOR_NULO');
  espera_erro('indicador data nula', -20002, 'INDICADOR_DATA_NULA');

  ok('suite concluida');
END;
/
