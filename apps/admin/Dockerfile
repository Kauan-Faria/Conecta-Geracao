FROM node:22.22.3-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.4.0 --activate
WORKDIR /workspace

COPY package.json pnpm-lock.yaml ./
# O contexto desta imagem é apenas apps/admin, então o bloco `allowBuilds` do
# pnpm-workspace.yaml da raiz não está disponível aqui. Sem ele, o pnpm 11
# aborta o install com ERR_PNPM_IGNORED_BUILDS por causa das dependências
# nativas do Angular CLI. Mantém-se a mesma lista autorizada na raiz.
RUN printf 'allowBuilds:\n  "@parcel/watcher": true\n  esbuild: true\n  lmdb: true\n  msgpackr-extract: true\n' > pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY . ./
RUN pnpm build --configuration production

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/admin/browser /usr/share/nginx/html

EXPOSE 80
