---
bolt: 033-oracle-consumption-api
created: 2026-09-26T13:10:00Z
status: accepted
---

# ADR-019: Oracle local isolado do Postgres

## Context

O padrão do projeto persiste no Supabase via Prisma, e esta intent precisa de Oracle sem mover o app. O Flutter, o NestJS e o backoffice atual continuam no Postgres. O consumo da IA desta disciplina é uma série simulada, visível só para o operador do admin.

Levar essas tabelas para o Prisma misturaria um banco acadêmico com o schema do produto. Copiar usuários reais do Supabase vazaria dado de produção para a instância local.

## Decision

A série simulada de consumo fica só no Oracle local. Postgres, Prisma e usuários reais permanecem intactos.

- Tabelas `USUARIO_CONSUMO`, `LEITURA_CONSUMO` e `ALERTA_CONSUMO` existem apenas no Oracle.
- Nenhum script deste bolt aponta o datasource Postgres para o Oracle.
- `ddl-auto: validate` do schema Postgres não muda.
- O seed usa identificadores fictícios (`sim-abaixo-limite`, `sim-no-limite`, `sim-sem-leitura`).

O segundo datasource Spring fica para o bolt 034. Este bolt só cria os objetos no schema do usuário Oracle conectado.

## Rationale

O enunciado pede modelo, seed e PL/SQL no Oracle. O isolamento evita que uma falha da instância local derrube o chat, o NestJS ou as migrations Prisma.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Migrar o produto para Oracle | Um banco só | Quebra Flutter, NestJS e Supabase | Fora de escopo |
| Tabelas de consumo no Postgres, com SQL comum no lugar de PL/SQL | Reusa Prisma | Não cumpre function e procedure Oracle | O indicador precisa nascer no Oracle |
| Sincronizar mensagens reais do chat para o Oracle | Dado “ao vivo” | Acopla os dois bancos e copia usuário real | A série é simulada de propósito |

## Consequences

### Positive

- O app continua no Supabase se o Oracle estiver desligado.
- O avaliador vê um modelo Oracle separado, com dado fictício.

### Negative

- O admin passa a ter dois bancos quando o bolt 034 ligar o JDBC.
- Não há join SQL entre leitura de tokens e mensagem real do chat.

### Risks

- Alguém criar a tabela de consumo numa migration Prisma. Mitigação: scripts Oracle ficam em pasta própria do `admin-api`, longe do Prisma.

## Related

- **Stories**: 001-oracle-schema-and-seed
- **Standards**: desvio intencional de `tech-stack.md` e `data-stack.md` para esta intent
- **Previous ADRs**: nenhum
