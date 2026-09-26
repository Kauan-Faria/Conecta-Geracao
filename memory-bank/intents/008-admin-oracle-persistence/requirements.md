---
intent: 008-admin-oracle-persistence
phase: inception
status: complete
created: 2026-09-26T12:07:00.000Z
updated: 2026-09-26T12:43:00.000Z
---

# Requirements: Persistência Oracle e consumo da IA no admin

## Intent Overview

Estender o backoffice do Conecta Geração com uma camada Oracle instalada na máquina, visível só para o operador do painel admin. O PostgreSQL (Supabase) continua sendo o banco do app Flutter, do NestJS e do backoffice já existente (conteúdos, dicas, campanhas).

O domínio é o **consumo da IA por usuário**, medido em **tokens**. O Oracle guarda uma **série simulada** de consumo. Quando o consumo de um usuário fica alto, o banco registra um alerta. Não há sensores físicos: a leitura de consumo ocupa o lugar que o enunciado chama de leitura crítica.

O `admin-api` (Spring Boot) usa um segundo datasource Oracle. Functions e procedures PL/SQL calculam o indicador, formatam o dado, registram o alerta e montam o relatório. Uma procedure é chamada pelo Java (Angular → REST autenticado → Spring → JDBC → Oracle).

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Operador acompanha tokens gastos por usuário | A tela autenticada mostra o total de tokens do usuário no período, vindo da function PL/SQL | Must |
| Consumo alto vira alerta no banco | Procedure grava alerta quando os tokens do usuário passam do limite | Must |
| Enunciado de PL/SQL cumprido no admin | 2 functions e 2 procedures documentadas; uma procedure disparada pelo endpoint Java | Must |
| App permanece no Supabase | Nenhuma tabela do Flutter/NestJS migra para o Oracle | Must |

---

## Functional Requirements

### FR-1: Modelo Oracle do consumo da IA
- **Description**: Criar no Oracle local o modelo das entidades do consumo: usuário simulado do Conecta Geração, leitura da série de consumo (tokens e instante) e alerta. Implantar as tabelas e carregar uma série simulada com pelo menos um usuário abaixo do limite e um acima.
- **Acceptance Criteria**:
  - As tabelas existem na instância Oracle local e o DER relacional está documentado junto com a lista de tabelas e colunas.
  - O seed insere usuários simulados e várias leituras por usuário ao longo do tempo.
  - Nenhum dado de produção do Supabase é copiado para o Oracle.
- **Priority**: Must
- **Related Stories**: 001-oracle-schema-and-seed

### FR-2: Function de indicador de tokens
- **Description**: Function PL/SQL que recebe o usuário e o período (parâmetros IN) e retorna (RETURN) a quantidade total de tokens gastos naquele intervalo. Inclui comentários e tratamento de exceção.
- **Acceptance Criteria**:
  - Uma consulta SQL que chama a function devolve a soma dos tokens das leituras daquele usuário dentro do período.
  - Usuário inexistente ou período inválido é tratado por exceção e não devolve um total silencioso incorreto.
- **Priority**: Must
- **Related Stories**: 002-token-indicator-function

### FR-3: Function de consumo formatado
- **Description**: Function PL/SQL que recebe o usuário e o período (IN) e retorna (RETURN) um texto em português com o nome do usuário, o total de tokens e se o consumo está alto ou normal em relação ao limite.
- **Acceptance Criteria**:
  - Uma consulta SQL que chama a function devolve uma única string legível para o operador.
  - O texto marca consumo alto exatamente quando o total de tokens do período atinge o limite.
  - Exceções são tratadas dentro da function.
- **Priority**: Must
- **Related Stories**: 003-formatted-consumption-function

### FR-4: Procedure de alerta por consumo alto
- **Description**: Procedure PL/SQL que avalia as leituras de um usuário e, se o total de tokens no período atingir o limite, registra um alerta. Usa IF e tratamento de exceção. Não duplica o alerta do mesmo usuário e do mesmo período.
- **Acceptance Criteria**:
  - Com a série simulada acima do limite, a procedure insere um alerta com usuário, período, total de tokens e mensagem.
  - Com a série abaixo do limite, nenhum alerta novo é inserido.
  - Executar de novo para o mesmo usuário e período não cria um segundo alerta.
- **Priority**: Must
- **Related Stories**: 004-high-consumption-alert-procedure

### FR-5: Procedure de relatório resumido por usuário
- **Description**: Procedure PL/SQL que percorre os usuários simulados (CURSOR e LOOP) e produz um resumo de consumo por usuário: nome, total de tokens no período e se houve alerta.
- **Acceptance Criteria**:
  - O resultado tem uma linha por usuário simulado presente no seed.
  - O total de tokens de cada linha coincide com a soma das leituras daquele usuário no período.
  - Exceções do cursor são tratadas.
- **Priority**: Must
- **Related Stories**: 005-per-user-consumption-report

### FR-6: Acionamento da procedure pelo backend Java
- **Description**: Um endpoint autenticado do `admin-api` chama uma das procedures (alerta ou relatório) via JDBC. O Angular do admin dispara esse endpoint.
- **Acceptance Criteria**:
  - Requisição com JWT de operador executa a procedure e o efeito fica visível no Oracle (alerta gravado ou relatório retornado).
  - Requisição sem JWT é recusada.
  - Credenciais do Oracle vêm de variável de ambiente e não entram no repositório.
- **Priority**: Must
- **Related Stories**: 006-java-jdbc-procedure-call

### FR-7: Tela do operador
- **Description**: Nova área do painel admin, acessível só ao operador logado, mostra o indicador de tokens, o texto formatado, os alertas e o relatório por usuário. O operador consegue disparar a rotina que chama a procedure no Java.
- **Acceptance Criteria**:
  - Com o operador autenticado, a tela exibe os quatro resultados obtidos do Oracle via `admin-api`.
  - A ação de disparo chama o endpoint do FR-6 e a tela passa a refletir o resultado.
  - Visitante sem login não acessa a área.
- **Priority**: Must
- **Related Stories**: 001-consumption-screen, 002-trigger-alert-routine, 003-consumption-error-state

### FR-8: Documentação do valor agregado
- **Description**: Documentar o modelo (DER e tabelas), o propósito e o funcionamento de cada function e procedure, e o que essa camada acrescenta ao dashboard atual, que só conta perguntas no Supabase.
- **Acceptance Criteria**:
  - O documento cobre tabelas, as duas functions, as duas procedures e o fluxo Angular → Spring → JDBC → Oracle.
  - O limite que caracteriza consumo alto está escrito de forma explícita.
- **Priority**: Must
- **Related Stories**: 007-oracle-model-documentation

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Consulta da tela de consumo | Tempo até os quatro blocos aparecerem, com o seed local | < 3 s na máquina do operador |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Volume do seed | Usuários simulados × leituras | Suficiente para demonstrar alerta e relatório (dezenas de leituras, não carga de produção) |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Autenticação | JWT do admin-api já existente | Só o operador autenticado chama os endpoints novos |
| Segredo do banco | Variável de ambiente | URL, usuário e senha do Oracle fora do Git |
| Dados | Série simulada | Não importar usuários reais do Supabase |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Falha do Oracle | Resposta da API | Erro claro para o operador, sem derrubar os endpoints atuais do Postgres |
| PL/SQL | Exceção | Functions e procedures tratam exceção e não gravam alerta parcial inconsistente |

### Compliance
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Escopo acadêmico | Enunciado de Oracle e PL/SQL | Modelo, seed, DER, 2 functions, 2 procedures, uma chamada pelo Java |
| Isolamento | Postgres intacto | Migrations Prisma e `ddl-auto: validate` do schema atual permanecem |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Required standards will be loaded from memory-bank standards folder by Construction Agent

**Intent-specific constraints**:
- Oracle instalado na máquina (sem Docker), acessível por JDBC a partir do `admin-api`.
- Segundo datasource. O `JdbcTemplate`/JPA atual do Postgres não passa a apontar para o Oracle.
- DDL do Oracle versionado em scripts SQL do `admin-api`, separado das migrations Prisma.
- Limite de consumo alto é parâmetro da rotina, com padrão documentado: **10.000 tokens no período**. Abaixo disso o status é normal.

### Business Constraints
- Público da tela: somente o operador do admin.
- Flutter, NestJS e o schema Supabase ficam fora desta intent.
- A série de consumo nasce e permanece no Oracle. Não há sincronismo contínuo com as mensagens reais do chat.

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Há uma instância Oracle local com listener acessível (porta típica 1521) e um schema em que o `admin-api` pode criar tabelas e PL/SQL | A construção para na conexão | Credenciais e URL só por ambiente; a tela mostra erro claro se o Oracle estiver desligado |
| O limite de 10.000 tokens no período representa “consumo alto” | Alertas disparam cedo ou tarde demais na demonstração | O limite é parâmetro; o seed inclui um usuário acima e outro abaixo desse padrão |
| Dados simulados bastam para a disciplina | O avaliador espera leitura ao vivo do Gemini | O documento deixa explícito que a série é simulada e o chat real continua no Supabase |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Quem usa a tela | Inception | 2026-09-26 | Resolvido: somente o operador |
| O que medir | Inception | 2026-09-26 | Resolvido: tokens por usuário; alerta quando o consumo fica alto |
| Onde roda o Oracle | Inception | 2026-09-26 | Resolvido: instalação na máquina |
| Como saber que ficou pronto | Inception | 2026-09-26 | Resolvido: tela mostra indicador, texto formatado, alerta e relatório por usuário |
| O que o Oracle persiste | Inception | 2026-09-26 | Resolvido: a série simulada de consumo |

---

## Fora de escopo

- Migrar o produto para Oracle.
- Sensores, leituras de hardware ou IoT.
- Cobrança real, fatura do provedor de IA ou cota bloqueando o chat do usuário final.
- Expor o consumo no app Flutter.
