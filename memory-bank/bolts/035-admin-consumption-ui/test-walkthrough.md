---
stage: test
bolt: 035-admin-consumption-ui
created: 2026-09-26T14:59:00Z
---

## Test Report: 002-admin-consumption-ui

### Summary

- **Tests**: 23/23 passed
- **Coverage**: não medida. O runner pede `@vitest/coverage-v8` ou `@vitest/coverage-istanbul`, e esse pacote não está no admin.

Comando: `ng test --watch=false` no `apps/admin`, com Node 22.22.3. O Node ativo da máquina (22.14.0) é recusado pelo Angular CLI. A versão 22.22.3 foi instalada pelo nvm e usada só nesse comando; o Node padrão não foi trocado.

### Test Files

- [x] `apps/admin/src/app/pages/consumo/consumo.spec.ts` - quatro blocos, foco em Bruno Alves, lista vazia, disparo, alerta único, consumo abaixo do limite, duplo clique, erro 503, erro só no disparo, nova carga, id manual no 404, sessão no 401, guarda da rota e home sem chamar a API de consumo
- [x] `apps/admin/src/app/pages/admin/admin.spec.ts` - import corrigido para a classe real, para a suíte voltar a compilar
- [x] `apps/admin/src/app/pages/login/login.spec.ts` - mesmo ajuste de import, com os providers que o login já exige
- [x] `apps/admin/src/app/app.spec.ts` - o teste do título "Hello, admin" foi trocado pela presença do router outlet, que é o que a raiz renderiza

### Acceptance Criteria Validation

- ✅ **Operador autenticado vê indicador, texto, alertas e relatório**: o componente, com a API simulada, mostra os quatro blocos no período do seed e foca Bruno Alves depois da primeira consulta.
- ✅ **A home tem caminho até a rota e não chama `/api/consumption`**: o template da home tem o item do menu e o atalho; a carga do dashboard não dispara essa URL.
- ✅ **Sem JWT a rota não abre**: a rota declara `authGuard` e, sem token, o guarda devolve `/login`.
- ✅ **Disparo com consumo no limite mostra o alerta depois da atualização**: o POST vai sem `limit` e a lista fica com uma linha.
- ✅ **Disparo abaixo do limite não cria alerta novo**: a mensagem informa que não houve alerta e a lista continua vazia.
- ✅ **O mesmo usuário e período não duplica o alerta**: o segundo disparo redesenha uma única linha.
- ✅ **Clique duplo gera uma chamada em voo**: dois cliques no botão produzem um POST.
- ✅ **Erro 503 encerra o carregamento, mostra a mensagem e não apaga o JWT**.
- ✅ **Erro só no disparo preserva os blocos já carregados**.
- ✅ **Carregar de novo, com a API respondendo, volta a mostrar os blocos**.
- ❌ **Quatro blocos em menos de 3 s com a API local no ar**: não verificado no browser. Não há ferramenta de browser nesta sessão, e o `ng serve` não foi exercitado contra o admin-api e o Oracle.

### Issues Found

Nenhum defeito na tela de consumo. A suíte do admin não compilava por três specs antigos (`Admin`, `Login` e o título "Hello, admin"). Foram alinhados ao código atual para o `ng test` conseguir rodar.

### Notes

A verificação manual pedida no bolt (login, carga, disparo e falha simulada no browser) não foi feita. O substituto foi o `HttpClientTesting`: as respostas de consulta, disparo, 503, 404 e 401 foram controladas no teste do componente.
