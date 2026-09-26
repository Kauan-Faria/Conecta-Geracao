---
stage: implement
bolt: 035-admin-consumption-ui
created: 2026-09-26T14:50:00Z
---

## Implementation Walkthrough: 002-admin-consumption-ui

### Summary

O painel Angular ganhou a rota autenticada de consumo. A página mostra indicador, texto formatado, alertas e relatório do período de demonstração, e dispara a rotina de alerta pelo admin-api. A home só aponta para essa rota; conteúdos, dicas e campanhas continuam no fluxo que já existia.

### Structure Overview

Modelos e serviço HttpClient ficam ao lado dos demais serviços do admin. A página é um componente standalone, no mesmo desenho de conteúdos: link de volta ao dashboard, banner de erro e estilos próprios. A rota usa o guarda de login já existente. O interceptor de JWT não foi alterado.

Na abertura a consulta parte do id inicial. Se o relatório trouxer o usuário de consumo alto do seed, a tela consulta de novo com esse id e passa a usá-lo como foco. As linhas do relatório trocam o usuário em foco. O disparo desabilita o botão até a resposta e, em seguida, recarrega os blocos. Erro de carga esvazia os blocos e oferece nova tentativa. Erro só do disparo mantém o que já estava na tela. Falha 404 abre um campo para informar o id. A sessão não é apagada por falha do Oracle.

### Completed Work

- [x] `apps/admin/src/app/models/consumption.ts` - tipos da consulta e do disparo, período do seed e nome do foco da demonstração
- [x] `apps/admin/src/app/services/consumption.ts` - consulta e disparo no admin-api, sem limite editável e sem chamada direta ao Oracle
- [x] `apps/admin/src/app/pages/consumo/consumo.ts` - carga, troca de usuário, disparo único e mensagens de erro
- [x] `apps/admin/src/app/pages/consumo/consumo.html` - quatro blocos, botão de disparo, nova carga e campo de id quando o usuário não existe
- [x] `apps/admin/src/app/pages/consumo/consumo.css` - layout dos blocos, no visual das outras páginas do admin
- [x] `apps/admin/src/app/app.routes.ts` - rota `/admin/consumo` com o guarda de autenticação
- [x] `apps/admin/src/app/pages/home/home.html` - item Consumo no menu e atalho em Ações rápidas

### Key Decisions

- **Foco inicial em Bruno Alves**: o id do seed não é estável, então a primeira consulta usa o id 1 e, com o relatório, troca para o nome de consumo alto. Escolha manual depois disso não é sobrescrita.
- **Home desacoplada**: o serviço de consumo não entra na home. Se a consulta falhar, conteúdos, dicas e campanhas seguem pelos serviços que já carregam o dashboard.
- **Erro de disparo separado do erro de carga**: a lista já visível permanece quando só o POST falha.

### Deviations from Plan

Nenhuma.

### Dependencies Added

Nenhuma.

### Developer Notes

O `ng build` do admin não rodou neste ambiente: o Angular CLI pede Node 22.22.3 ou mais novo, e a máquina está em 22.14.0. A checagem de tipos com `tsc` no `tsconfig.app.json` passou. Não há ESLint no app admin. Testes do componente e a passagem no browser ficam no estágio de teste.
