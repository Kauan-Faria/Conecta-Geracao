---
unit: 001-oracle-consumption-api
bolt: 034-oracle-consumption-api
stage: model
status: complete
updated: 2026-09-26T14:10:00Z
---

# Static Model - Oracle Consumption API

## Bounded Context

**Consumo da IA no Oracle do admin.** O bolt 033 deixou a série simulada, o indicador e o texto formatado. Este bolt grava o alerta, emite o relatório por usuário e deixa o operador disparar a rotina pelo `admin-api`, sem trazer a série para o Postgres.

A tela Angular fica no bolt 035. Flutter, NestJS e usuários reais continuam fora.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| UsuarioConsumo | id, nome, identificadorExterno | Herdada do bolt 033. Pessoa simulada. Sem este usuário não há indicador, texto, alerta nem linha verdadeira de consumo zero. |
| LeituraConsumo | id, usuarioId, quantidadeTokens, instante | Herdada do bolt 033. A soma no período fechado continua sendo `FN_INDICADOR_TOKENS`. A procedure não refaz essa conta em outro lugar. |
| AlertaConsumo | id, usuarioId, inicio, fim, totalTokens, mensagem, criadoEm | Nasce quando o total do período atinge o limite. Guarda usuário, período, total e mensagem. Um único alerta por usuário e período. Abaixo do limite, nenhum alerta novo. Reexecutar não cria o segundo. |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| PeriodoConsumo | inicio, fim | Intervalo fechado, herdado do bolt 033. Início posterior ao fim, ou data ausente, é período inválido. O cliente recebe a recusa antes da procedure. |
| LimiteConsumoAlto | valor inteiro | Padrão 10.000. A procedure compara com o parâmetro recebido. Nulo vira 10.000. Negativo é limite inválido. |
| MensagemAlerta | uma string | Frase do alerta gravado: nome, total sem separador de milhar e o texto `Consumo alto.` Só existe quando o alerta é inserido. |
| LinhaRelatorio | usuarioId, nome, totalTokens, temAlerta | Uma linha por usuário simulado. Total igual à soma do período. Sem leituras, total 0 e sem alerta. `temAlerta` é verdadeiro só se já existe alerta daquele usuário naquele período. |
| ResultadoAlerta | alertaId ou nenhum | Com total no limite ou acima, devolve o id do alerta único. Abaixo do limite, nenhum id e nenhuma linha nova. |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| UsuarioConsumo | LeituraConsumo | Inalterado: toda leitura aponta para um usuário existente. O seed idempotente do bolt 033 permanece a fonte da série. |
| AlertaConsumo | nenhum membro | Referencia um UsuarioConsumo. A UK `(usuario, inicio, fim)` impede o segundo alerta. Falha no meio do insert não deixa linha parcial. O relatório lê este aggregate; não o altera. |

O relatório não é aggregate. É uma leitura calculada: cursor sobre os usuários, indicador de cada um e a marca de alerta.

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| AlertaConsumoRegistrado | Procedure grava o primeiro alerta do usuário naquele período | alertaId, usuarioId, período, totalTokens, mensagem |
| AlertaConsumoJaExistia | Procedure roda de novo e encontra o alerta | alertaId, usuarioId, período |
| AlertaConsumoDispensado | Total do período fica abaixo do limite informado | usuarioId, período, totalTokens, limite |
| RelatorioConsumoEmitido | Cursor termina e a saída só então é publicada | período, uma linha por usuário |
| PeriodoInvalido | Início posterior ao fim, ou data ausente, na procedure ou no pedido HTTP | início, fim |
| UsuarioConsumoInexistente | Alerta ou indicador para id que não está na série | usuarioId |
| OracleIndisponivel | Credencial ausente ou instância inacessível na hora da chamada | nenhum segredo, nenhuma linha de alerta |

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| RegistrarAlertaConsumo | Validar período e limite. Obter o total por IndicadorTokens. Se o total é menor que o limite, dispensar. Se já há alerta do mesmo usuário e período, devolver o id existente. Senão, gravar uma linha com total e mensagem. Exceção de usuário, período ou limite sobe sem linha parcial. | IndicadorTokens, UsuarioConsumo, AlertaConsumo, LimiteConsumoAlto |
| RelatorioConsumo | Validar o período. Percorrer cada UsuarioConsumo com cursor e loop. Para cada um, obter o total e marcar com IF se há alerta naquele período. Publicar as linhas só ao fim. Falha no meio não devolve lista parcial. | IndicadorTokens, UsuarioConsumo, AlertaConsumo |
| ConsultaConsumo | Para um usuário e período, devolver o indicador, o texto formatado, os alertas daquele par e o relatório de todos os simulados. Usuário inexistente ou período inválido falha a consulta inteira. | IndicadorTokens, ConsumoFormatado, AlertaConsumo, RelatorioConsumo |
| DisparoAlerta | Operador autenticado pede a rotina. A chamada JDBC executa RegistrarAlertaConsumo. Sem autenticação, o pedido nem chega ao Oracle. | RegistrarAlertaConsumo |

IndicadorTokens e ConsumoFormatado permanecem as functions do bolt 033. Este modelo não recalcula a soma no Java.

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| AlertaConsumoRepository | AlertaConsumo | buscar por usuário e período; registrar se o total atinge o limite, devolvendo o id único ou nenhum |
| RelatorioConsumoRepository | LinhaRelatorio | emitir o resumo do período, uma linha por usuário simulado |
| UsuarioConsumoRepository | UsuarioConsumo | obter por id, já definido no bolt 033 |
| LeituraConsumoRepository | LeituraConsumo | somar no período, já definido no bolt 033 e exposto por FN_INDICADOR_TOKENS |

A porta HTTP não é repositório. Ela autentica o operador e traduz a falha do Oracle para a resposta da API, deixando o Postgres de pé.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Alerta | Linha em `ALERTA_CONSUMO` para um usuário e um período cujo total atingiu o limite. |
| Limite | Parâmetro da rotina de alerta. Padrão 10.000 tokens. A comparação usa o valor recebido. |
| Rotina de alerta | `PR_REGISTRAR_ALERTA_CONSUMO`, disparada pelo Java. |
| Relatório | Resumo com uma linha por usuário simulado: nome, total e se houve alerta. |
| Cursor | Percurso explícito dos usuários dentro de `PR_RELATORIO_CONSUMO`. |
| Disparo | POST autenticado que executa a rotina de alerta via JDBC. |
| Consulta de consumo | GET autenticado com indicador, texto, alertas e relatório. |
| Segundo datasource | Pool Oracle usado só por esta consulta. O `JdbcTemplate` do Postgres não aponta para ele. |
| Oracle indisponível | A rota de consumo falha com erro claro. Login, saúde e dashboard do Postgres seguem. |

## Cobertura das stories

| Story | O que o modelo cobre |
|-------|----------------------|
| 004-high-consumption-alert-procedure | RegistrarAlertaConsumo: grava no limite ou acima, não grava abaixo, não duplica, exceção sem linha parcial, limite parametrizado |
| 005-per-user-consumption-report | RelatorioConsumo: uma linha por usuário, total igual à soma, marca de alerta, usuário sem leitura com total 0, falha sem lista parcial |
| 006-java-jdbc-procedure-call | ConsultaConsumo e DisparoAlerta: JWT para chegar, procedure via JDBC, Oracle indisponível isolado do Postgres, período inválido recusado antes da chamada |
| 007-oracle-model-documentation | Linguagem e objetos que o documento precisa nomear: tabelas, functions herdadas, duas procedures, fluxo até o Java e o limite de 10.000 |

## Fora deste modelo

- Componentes Angular e a rota do painel.
- Flutter, NestJS, Prisma e schema Supabase.
- Recalcular tokens em memória no Java.
