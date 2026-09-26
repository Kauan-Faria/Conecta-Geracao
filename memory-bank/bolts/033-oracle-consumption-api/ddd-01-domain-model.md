---
unit: 001-oracle-consumption-api
bolt: 033-oracle-consumption-api
stage: model
status: complete
updated: 2026-09-26T12:50:00Z
---

# Static Model - Oracle Consumption API

## Bounded Context

**Consumo da IA no Oracle do admin.** Mede tokens gastos por um usuário simulado do Conecta Geração, em uma série que nasce e permanece no Oracle local.

Este contexto não é o chat, o NestJS nem o Supabase. Não há sensor físico, custo em reais nem sincronismo com mensagens reais. A leitura de tokens ocupa o lugar da leitura crítica do enunciado.

O bolt 033 modela a série, o indicador numérico e o texto de status. A gravação do alerta, o relatório por cursor e a chamada JDBC ficam no bolt 034; a tabela de alerta entra aqui porque o schema da story 001 a cria vazia.

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| UsuarioConsumo | id, nome, identificadorExterno | Pessoa simulada. O identificador externo é fictício e nunca é um usuário real importado do Supabase. O nome preserva acentos. Sem usuário, não existe indicador nem texto de consumo. |
| LeituraConsumo | id, usuarioId, quantidadeTokens, instante | Ponto da série. Pertence a exatamente um UsuarioConsumo. Várias leituras do mesmo usuário ao longo do tempo. Quantidade de tokens é inteira e não negativa. O instante entra na soma quando cai dentro do período fechado. |
| AlertaConsumo | id, usuarioId, inicio, fim, totalTokens, mensagem, criadoEm | Registro de consumo alto. Neste bolt a entidade só existe como estrutura: nenhuma operação daqui a grava. A unicidade por usuário e período é invariante do contexto e será aplicada pela procedure do bolt 034. |

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| QuantidadeTokens | valor inteiro | Maior ou igual a zero. Soma de leituras também é inteira e não negativa. |
| PeriodoConsumo | inicio, fim | Intervalo fechado: instante maior ou igual ao início e menor ou igual ao fim entra na soma. Início posterior ao fim é período inválido. |
| IdentificadorExterno | texto fictício | Não corresponde a usuário real do Supabase nem a credencial de produção. |
| LimiteConsumoAlto | valor inteiro | Padrão do contexto: 10.000 tokens no período. Abaixo do limite o status é normal. Igual ou acima é alto. |
| StatusConsumo | alto ou normal | Derivado da comparação do total com o limite. Total exatamente 10.000 é alto. |
| TextoConsumo | uma string | Frase única em português com o nome do usuário, o total de tokens e o status. Preserva acentos do nome. Não é frase de consumo zero quando o usuário não existe. |
| CenarioDemonstracao | período de demonstração, papel de cada usuário | O seed deixa, nesse período, pelo menos um usuário com total abaixo de 10.000 e um com total igual ou acima de 10.000. |

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| UsuarioConsumo | LeituraConsumo | Toda leitura aponta para um usuário existente. Excluir ou recriar o usuário não deixa leitura órfã. Reaplicar o seed não duplica a série nem viola a identidade do usuário ou da leitura. |
| AlertaConsumo | nenhum membro | Um alerta, quando existir, referencia um usuário do aggregate UsuarioConsumo e guarda o período, o total e a mensagem. Neste bolt o aggregate permanece vazio. A regra de não duplicar o mesmo usuário e período pertence ao bolt 034. |

O indicador e o texto formatado não são aggregates. São resultados calculados sobre as leituras do UsuarioConsumo.

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| SerieSimuladaCarregada | Seed aplicado com sucesso, inclusive na reexecução idempotente | usuários simulados, período de demonstração, totais que provam um caso abaixo e um caso igual ou acima do limite |
| UsuarioConsumoInexistente | Consulta de indicador ou texto para um usuário que não está na série | identificador pedido |
| PeriodoInvalido | Consulta cujo início é posterior ao fim | início, fim |

Consultas bem-sucedidas não publicam evento persistido. O evento AlertaConsumoRegistrado existe na linguagem do contexto, mas o gatilho é a procedure do bolt 034, fora das operações deste modelo.

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| IndicadorTokens | Somar os tokens do usuário no período fechado. Usuário existente sem leituras no período devolve 0, sem exceção. Usuário inexistente sinaliza UsuarioConsumoInexistente e não devolve 0 silencioso. Início posterior ao fim sinaliza PeriodoInvalido. | UsuarioConsumo, LeituraConsumo, PeriodoConsumo |
| ConsumoFormatado | Montar o TextoConsumo com nome, total e status. Reutiliza IndicadorTokens para a soma. Total maior ou igual a 10.000 marca alto; total menor marca normal. Usuário inexistente ou período inválido propaga a mesma falha do indicador e não devolve frase de consumo zero. | IndicadorTokens, UsuarioConsumo, LimiteConsumoAlto, StatusConsumo |

## Repository Interfaces

| Repository | Entity | Methods |
|------------|--------|---------|
| UsuarioConsumoRepository | UsuarioConsumo | obter por id; verificar existência; gravar a série simulada de forma idempotente |
| LeituraConsumoRepository | LeituraConsumo | somar tokens do usuário no período fechado; listar leituras do usuário |
| AlertaConsumoRepository | AlertaConsumo | apenas reservar o armazenamento vazio neste bolt. Inclusão e leitura ficam no bolt 034 |

Os dois domain services são as functions do enunciado. O repositório, neste bolt, é o Oracle local. Não há porta HTTP nem JDBC.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Consumo da IA | Tokens atribuídos a um usuário simulado na série Oracle. Não é custo em reais nem mensagem real do chat. |
| Usuário simulado | Pessoa fictícia do Conecta Geração usada só nesta demonstração. |
| Leitura | Um ponto da série: quantidade de tokens em um instante. |
| Série simulada | Conjunto de leituras carregado pelo seed. Nasce e permanece no Oracle. |
| Período | Janela fechada entre início e fim usada para somar leituras. |
| Indicador | Número total de tokens do usuário naquele período. |
| Consumo alto | Total do período maior ou igual a 10.000 tokens. |
| Consumo normal | Total do período menor que 10.000 tokens. |
| Texto formatado | Frase única em português com nome, total e status. |
| Período de demonstração | Janela do seed em que um usuário fica abaixo do limite e outro fica igual ou acima. |
| Alerta | Registro de consumo alto. A tabela existe neste bolt; a gravação não. |

## Cobertura das stories

| Story | O que o modelo cobre |
|-------|----------------------|
| 001-oracle-schema-and-seed | UsuarioConsumo, LeituraConsumo e AlertaConsumo; série com vários pontos no tempo; cenário com um total abaixo e outro igual ou acima de 10.000; identificador fictício; seed idempotente |
| 002-token-indicator-function | IndicadorTokens: soma no intervalo fechado, 0 quando o usuário existe e não há leituras, falha explícita para usuário inexistente e para período inválido |
| 003-formatted-consumption-function | ConsumoFormatado: uma string com nome, total e status; alto a partir de 10.000 inclusive; reutiliza o indicador; não finge consumo zero se o usuário não existe; acento do nome preservado |

## Fora deste modelo

- Procedure de alerta, procedure de relatório, endpoint Java e DER narrado (bolt 034).
- Tela Angular.
- Flutter, NestJS, Prisma e schema Supabase.
