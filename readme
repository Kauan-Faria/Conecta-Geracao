# Conecta Geração — referência rápida de desenvolvimento

Monorepo: API NestJS em `apps/backend`, app Flutter em `apps/mobile`.

## Setup

1. Copie as variáveis de ambiente:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
2. Preencha `apps/backend/.env` com credenciais reais (Supabase, Firebase, Gemini, Google Maps).
3. **Nunca** commite `.env` nem cole senhas/chaves neste arquivo.

## API (backend)

```bash
pnpm api:dev              # sobe a API (porta 3000)
pnpm api:prisma:migrate   # aplica migrations Prisma
pnpm api:prisma:seed      # reexecuta seed (idempotente)
pnpm api:test             # testes Jest
```

Swagger: http://localhost:3000/api/docs

### Docker (opcional)

```bash
cd apps/backend
pnpm docker:up            # sobe API em background
pnpm docker:down          # para o container
pnpm docker:logs          # logs da API
pnpm docker:build         # build + sobe em background
```

## Mobile (Flutter)

```bash
cd apps/mobile
flutter run
```

Atalhos no `flutter run`:

| Tecla | Ação |
|-------|------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | Quit |

## Documentação do projeto

Arquitetura e decisões: `memory-bank/standards/`
Intents, stories e bolts: `memory-bank/intents/`, `memory-bank/bolts/`
