-- FN_CONSUMO_FORMATADO: uma frase em português com nome, total e status.
-- Reutiliza FN_INDICADOR_TOKENS. Limite de consumo alto: 10000 tokens no período.
-- Igual ou acima do limite é alto. Abaixo é normal.
-- Não transforma usuário inexistente nem período inválido em frase de consumo zero.

SET DEFINE OFF
WHENEVER SQLERROR EXIT FAILURE

CREATE OR REPLACE FUNCTION fn_consumo_formatado (
  p_usuario_id IN usuario_consumo.id%TYPE,
  p_inicio     IN TIMESTAMP,
  p_fim        IN TIMESTAMP
) RETURN VARCHAR2
IS
  -- Monta o texto do operador a partir do indicador.
  -- Limite padrão de consumo alto: 10000 tokens no período.
  c_limite NUMBER := 10000;
  v_total  NUMBER;
  v_nome   usuario_consumo.nome%TYPE;
  v_status VARCHAR2(20);
BEGIN
  v_total := fn_indicador_tokens(p_usuario_id, p_inicio, p_fim);

  SELECT nome
    INTO v_nome
    FROM usuario_consumo
   WHERE id = p_usuario_id;

  IF v_total >= c_limite THEN
    v_status := 'Consumo alto.';
  ELSE
    v_status := 'Consumo normal.';
  END IF;

  RETURN v_nome
    || ' consumiu '
    || TO_CHAR(v_total, 'FM999999999999')
    || ' tokens no período. '
    || v_status;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END fn_consumo_formatado;
/

SHOW ERRORS FUNCTION fn_consumo_formatado

DECLARE
  v_status user_objects.status%TYPE;
BEGIN
  SELECT status
    INTO v_status
    FROM user_objects
   WHERE object_name = 'FN_CONSUMO_FORMATADO'
     AND object_type = 'FUNCTION';

  IF v_status <> 'VALID' THEN
    RAISE_APPLICATION_ERROR(-20100, 'FN_CONSUMO_FORMATADO não compilou.');
  END IF;
END;
/
