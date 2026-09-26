---
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
unit_type: backend
default_bolt_type: ddd-construction-bolt
phase: inception
status: complete
created: 2026-09-26T12:43:00.000Z
updated: 2026-09-26T12:43:00.000Z
---

# Unit Brief: Oracle Consumption API

## Purpose

Persistir no Oracle local a série simulada de consumo da IA e expor, pelo `admin-api`, o indicador de tokens, o texto formatado, os alertas e o relatório. Uma procedure roda por JDBC quando o operador dispara a rotina.

## Scope

### In Scope
- Tabelas de usuário simulado, leitura de tokens e alerta
- Seed com pelo menos um usuário abaixo de 10.000 tokens no período e um acima
- `FN_INDICADOR_TOKENS` e `FN_CONSUMO_FORMATADO`
- `PR_REGISTRAR_ALERTA_CONSUMO` e `PR_RELATORIO_CONSUMO`
- Segundo datasource Oracle no Spring, sem alterar o datasource Postgres
- Endpoints JWT: consulta e disparo da procedure de alerta
- DER e texto do propósito de cada objeto PL/SQL

### Out of Scope
- Tela Angular (`002-admin-consumption-ui`)
- Flutter, NestJS, Prisma e schema Supabase
- Sensores, custo em reais e sincronismo com mensagens reais do chat

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Modelo Oracle, tabelas e seed simulado | Must |
| FR-2 | Function de indicador de tokens | Must |
| FR-3 | Function de consumo formatado | Must |
| FR-4 | Procedure de alerta por consumo alto | Must |
| FR-5 | Procedure de relatório por usuário | Must |
| FR-6 | Endpoint Java que chama a procedure | Must |
| FR-8 | DER e documentação do PL/SQL | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| UsuarioConsumo | Pessoa simulada do Conecta Geração | id, nome, identificador externo fictício |
| LeituraConsumo | Ponto da série de tokens | id, usuário, tokens, instante |
| AlertaConsumo | Registro de consumo alto | id, usuário, início, fim, total de tokens, mensagem, criado em |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| Indicador | Soma tokens do usuário no período | usuário, início, fim | número |
| Formatado | Texto em português com status alto ou normal | usuário, início, fim | string |
| Registrar alerta | Grava alerta se o total atinge o limite; não duplica | usuário, período, limite (padrão 10.000) | linha de alerta ou nenhuma |
| Relatório | Uma linha por usuário | período | nome, total de tokens, se há alerta |
| Disparo Java | CallableStatement da procedure de alerta | JWT, usuário, período | efeito no Oracle |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 7 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-oracle-schema-and-seed | Tabelas e série simulada | Must | draft |
| 002-token-indicator-function | Function de indicador | Must | draft |
| 003-formatted-consumption-function | Function de texto formatado | Must | draft |
| 004-high-consumption-alert-procedure | Procedure de alerta | Must | draft |
| 005-per-user-consumption-report | Procedure de relatório | Must | draft |
| 006-java-jdbc-procedure-call | API JDBC | Must | draft |
| 007-oracle-model-documentation | DER e documentação | Must | draft |

---

## Dependencies

### Depends On

Nenhuma unit deste intent.

### Depended By

| Unit | Reason |
|------|--------|
| 002-admin-consumption-ui | Consome os endpoints de consulta e disparo |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| Oracle local | Persistência e PL/SQL | Alto se a instância não estiver no ar |
| JWT do admin-api | Proteger os endpoints novos | Baixo — já existe |

---

## Technical Context

### Suggested Technology

Spring Boot no `apps/admin-api`. Segundo `DataSource` / `JdbcTemplate` nomeado para Oracle. Scripts SQL versionados ao lado da API, separados do Prisma. Driver JDBC Oracle. Credenciais por ambiente (`ORACLE_URL`, `ORACLE_USERNAME`, `ORACLE_PASSWORD`).

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| Angular admin | API | REST JSON + Bearer JWT |
| Oracle | DB | JDBC, `CallableStatement` e SQL das functions |

### Data Storage

| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Série simulada e alertas | Oracle | Dezenas de leituras | Enquanto durar a demonstração local |

---

## Constraints

- Não apontar o `JdbcTemplate` atual do Postgres para o Oracle.
- `ddl-auto` do schema Postgres permanece `validate`.
- Limite padrão: 10.000 tokens no período.
- Exceção PL/SQL tratada dentro da function ou procedure.
- Seed sem usuários reais do Supabase.

---

## Success Criteria

### Functional
- [ ] Consulta SQL das duas functions bate com a soma do seed
- [ ] Procedure de alerta grava uma vez quando o total atinge 10.000 e não grava abaixo disso
- [ ] Relatório tem uma linha por usuário simulado
- [ ] POST autenticado executa a procedure; request sem JWT é recusado

### Non-Functional
- [ ] Oracle fora do ar devolve erro da API nova e os endpoints do Postgres seguem respondendo
- [ ] Segredos do Oracle fora do Git

### Quality
- [ ] Critérios de aceite das 7 stories cobertos por teste automatizado ou script SQL repetível
- [ ] DER e o texto de cada objeto PL/SQL publicados

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 033-oracle-consumption-api | ddd-construction-bolt | 001, 002, 003 | Schema, seed e functions |
| 034-oracle-consumption-api | ddd-construction-bolt | 004, 005, 006, 007 | Procedures, JDBC e documentação |

---

## Notes

O “sensor” do enunciado é a leitura de tokens. A procedure acionada pelo backend é `PR_REGISTRAR_ALERTA_CONSUMO`. O relatório pode ser lido pelo mesmo conjunto de endpoints, mas o evento de backend exigido pelo enunciado é o disparo do alerta.
