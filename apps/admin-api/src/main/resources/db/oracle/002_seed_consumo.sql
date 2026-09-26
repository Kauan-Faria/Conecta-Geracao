-- Série simulada de consumo. Sem usuário real do Supabase.
-- Período de demonstração, intervalo fechado:
--   2026-09-01 00:00:00 até 2026-09-30 23:59:59
-- Totais nesse período: Ana Clara 3500, Bruno Alves 10000, Clara Sem Leituras 0.
-- Reexecutar não duplica usuário nem leitura.

SET DEFINE OFF
WHENEVER SQLERROR EXIT FAILURE

DECLARE
  PROCEDURE inserir_leitura(
    p_identificador IN VARCHAR2,
    p_tokens        IN NUMBER,
    p_instante      IN TIMESTAMP
  ) IS
  BEGIN
    INSERT INTO leitura_consumo (usuario_id, quantidade_tokens, instante)
    SELECT u.id, p_tokens, p_instante
      FROM usuario_consumo u
     WHERE u.identificador_externo = p_identificador
       AND NOT EXISTS (
         SELECT 1
           FROM leitura_consumo l
          WHERE l.usuario_id = u.id
            AND l.instante = p_instante
            AND l.quantidade_tokens = p_tokens
       );
  END;
BEGIN
  MERGE INTO usuario_consumo destino
  USING (
    SELECT 'Ana Clara' AS nome, 'sim-abaixo-limite' AS identificador_externo FROM dual
    UNION ALL
    SELECT 'Bruno Alves', 'sim-no-limite' FROM dual
    UNION ALL
    SELECT 'Clara Sem Leituras', 'sim-sem-leitura' FROM dual
  ) origem
  ON (destino.identificador_externo = origem.identificador_externo)
  WHEN MATCHED THEN
    UPDATE SET destino.nome = origem.nome
  WHEN NOT MATCHED THEN
    INSERT (nome, identificador_externo)
    VALUES (origem.nome, origem.identificador_externo);

  -- Fora do período: não entra na soma de setembro.
  inserir_leitura('sim-abaixo-limite', 9000, TIMESTAMP '2026-08-31 23:59:59');
  -- Bordas fechadas do período.
  inserir_leitura('sim-abaixo-limite', 1500, TIMESTAMP '2026-09-01 00:00:00');
  inserir_leitura('sim-abaixo-limite', 2000, TIMESTAMP '2026-09-15 12:00:00');

  inserir_leitura('sim-no-limite', 4000, TIMESTAMP '2026-09-01 00:00:00');
  inserir_leitura('sim-no-limite', 6000, TIMESTAMP '2026-09-30 23:59:59');
  -- Fora do período.
  inserir_leitura('sim-no-limite', 5000, TIMESTAMP '2026-10-01 00:00:00');

  COMMIT;
END;
/
