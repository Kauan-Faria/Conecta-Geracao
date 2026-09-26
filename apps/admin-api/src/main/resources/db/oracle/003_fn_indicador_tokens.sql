-- FN_INDICADOR_TOKENS: soma os tokens do usuário no período fechado.
-- -20001 usuário inexistente. -20002 período inválido.
-- Usuário existente sem leituras no período retorna 0.

SET DEFINE OFF
WHENEVER SQLERROR EXIT FAILURE

CREATE OR REPLACE FUNCTION fn_indicador_tokens (
  p_usuario_id IN usuario_consumo.id%TYPE,
  p_inicio     IN TIMESTAMP,
  p_fim        IN TIMESTAMP
) RETURN NUMBER
IS
  -- Soma as leituras daquele usuário com instante dentro do período fechado.
  -- Não devolve zero quando o usuário não existe ou o período é inválido.
  e_usuario_inexistente EXCEPTION;
  e_periodo_invalido    EXCEPTION;
  v_existe              NUMBER;
  v_total               NUMBER;
BEGIN
  IF p_inicio IS NULL OR p_fim IS NULL OR p_inicio > p_fim THEN
    RAISE e_periodo_invalido;
  END IF;

  IF p_usuario_id IS NULL THEN
    RAISE e_usuario_inexistente;
  END IF;

  SELECT COUNT(*)
    INTO v_existe
    FROM usuario_consumo
   WHERE id = p_usuario_id;

  IF v_existe = 0 THEN
    RAISE e_usuario_inexistente;
  END IF;

  SELECT NVL(SUM(quantidade_tokens), 0)
    INTO v_total
    FROM leitura_consumo
   WHERE usuario_id = p_usuario_id
     AND instante >= p_inicio
     AND instante <= p_fim;

  RETURN v_total;
EXCEPTION
  WHEN e_usuario_inexistente THEN
    RAISE_APPLICATION_ERROR(-20001, 'Usuário de consumo inexistente.');
  WHEN e_periodo_invalido THEN
    RAISE_APPLICATION_ERROR(-20002, 'Período inválido: início posterior ao fim.');
  WHEN OTHERS THEN
    RAISE;
END fn_indicador_tokens;
/

SHOW ERRORS FUNCTION fn_indicador_tokens

DECLARE
  v_status user_objects.status%TYPE;
BEGIN
  SELECT status
    INTO v_status
    FROM user_objects
   WHERE object_name = 'FN_INDICADOR_TOKENS'
     AND object_type = 'FUNCTION';

  IF v_status <> 'VALID' THEN
    RAISE_APPLICATION_ERROR(-20100, 'FN_INDICADOR_TOKENS não compilou.');
  END IF;
END;
/
