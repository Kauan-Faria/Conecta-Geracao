---
configured: 2026-10-17T18:20:58Z
status: awaiting-environment-configuration
workflow: .github/workflows/ci-cd.yml
---

# CI/CD e entrega contínua

## Escopo

- NestJS + Flutter (APK e frontend web conteinerizado)
- Spring Boot + Angular
- PostgreSQL compartilhado
- Oracle Free com schema, functions e procedures PL/SQL

## Estado

A automação de build, testes, publicação no GHCR, staging, produção, health checks e coleta de logs está implementada. O primeiro deployment aguarda a configuração dos environments e secrets descritos em `deployment/README.md`.

## Progressão

1. Pull request: build, testes e relatórios.
2. Push em `main`: build, testes, imagens imutáveis e staging.
3. Execução manual para produção: repete staging, exige aprovação do environment `production` e promove a mesma tag SHA.

## Rollback

Executar o workflow manualmente a partir do commit estável. A versão passa novamente pelos testes e por staging antes da aprovação de produção.
