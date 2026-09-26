---
bolt: 033-oracle-consumption-api
created: 2026-09-26T13:10:00Z
status: accepted
---

# ADR-022: Credenciais Oracle somente por ambiente

## Context

A instância local varia de máquina para máquina e a senha não pode entrar no Git. Service name, usuário com `CREATE` e porta não são iguais em todo ambiente. O desenho do bolt pede a URL por ambiente.

Um `CONNECT` ou uma JDBC URL com senha dentro do script versionado vazaria segredo e quebraria na máquina seguinte.

## Decision

URL, usuário e senha ficam em variável de ambiente. O SQL não contém connect string.

- Variáveis previstas: `ORACLE_URL`, `ORACLE_USERNAME`, `ORACLE_PASSWORD`.
- O operador aplica os scripts já conectado no SQLcl ou no SQL*Plus.
- Este bolt não cria `application.yml` nem datasource Spring. O bolt 034 lê as mesmas variáveis.

## Rationale

O script permanece portátil. O segredo fica no ambiente, alinhado à regra de não versionar senha.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| JDBC URL fixa no repositório | Roda sem configurar nada numa máquina | Service name e senha errados nas outras | Não é por ambiente |
| Perfil Spring commitado com senha | O Java conecta sozinho | Segredo no Git | Proibido pela intent |
| Wallet ou secret manager | Mais seguro em produção | Infra além da demonstração local | Peso desnecessário agora |

## Consequences

### Positive

- Os quatro scripts SQL podem ir para o Git.
- Trocar de instância não exige editar SQL.

### Negative

- Sem as variáveis, o bolt 034 não conecta. A falha tem de aparecer como erro da API nova, sem derrubar o Postgres.
- Este bolt não valida sozinho se a variável existe. Quem aplica o script já está autenticado no cliente.

### Risks

- Alguém colar a senha num comentário do script. Mitigação: revisão do SQL antes de commit; nenhum exemplo de URL com credencial na pasta `db/oracle`.

## Related

- **Stories**: 001-oracle-schema-and-seed
- **Standards**: reforça `coding-standards.md` (não versionar segredo) neste banco novo
- **Previous ADRs**: ADR-019
