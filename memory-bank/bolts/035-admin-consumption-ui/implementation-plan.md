---
stage: plan
bolt: 035-admin-consumption-ui
created: 2026-09-26T14:42:00Z
---

## Implementation Plan: 002-admin-consumption-ui

### Objective

Área autenticada no painel Angular para o operador ver o consumo simulado que o `admin-api` lê do Oracle e disparar a rotina de alerta, com mensagem clara quando essa API falha e sem acoplar a home a essa consulta.

### Deliverables

- Rota `/admin/consumo` protegida pelo `authGuard` já usado em `/home` e `/admin`.
- Acesso a partir da home: item Consumo no menu lateral e um atalho em Ações rápidas. A home não chama `/api/consumption`.
- Página com quatro blocos vindos de `GET /api/consumption`: total de tokens, texto formatado, alertas do usuário em foco e uma linha por usuário do relatório.
- Botão que chama `POST /api/consumption/alerts` e, ao voltar, recarrega os quatro blocos. Enquanto a chamada está em voo, o botão não aceita outro clique.
- Estados de carregamento, erro de carga e erro só do disparo. Botão para carregar de novo depois da falha.
- Modelos e serviço HttpClient no padrão de `dashboard` e `knowledge`. O JWT continua no interceptor existente.
- Testes do componente com `HttpClientTesting` cobrindo carga, disparo, lista vazia, duplo clique e falha da API. Verificação no browser fica para o estágio de teste.

### Dependencies

- **034-oracle-consumption-api**: contrato já implementado. Consulta e disparo exigem JWT. Sem token o filtro responde 401 e o Oracle não é chamado.
- **admin-api em `http://localhost:8081`**: `environment.apiBaseUrl` já aponta para essa base. Nenhuma dependência npm nova.
- **Período de demonstração do seed**: `2026-09-01T00:00:00` até `2026-09-30T23:59:59`, sem fuso, no formato que o `DateTimeFormat` ISO da API aceita.
- **Limite padrão da procedure**: 10.000 tokens. A tela não envia `limit` e não oferece edição desse valor.
- **Usuários do seed, por nome**: Ana Clara (3.500, abaixo), Bruno Alves (10.000, no limite), Clara Sem Leituras (0). Os ids são IDENTITY e não entram fixos no código além do chute inicial da primeira consulta.

### Technical Approach

A página segue o desenho de `conteudos`: componente standalone, link de volta ao dashboard, banner de erro e CSS próprio. O menu completo permanece na home. Conteúdos, dicas e campanhas não passam a importar o serviço de consumo.

Contrato usado, sem envelope `data`:

- `GET /api/consumption?userId&periodStart&periodEnd` devolve `tokenTotal`, `formattedText`, `alerts[]` e `report[]`.
- `POST /api/consumption/alerts` recebe `userId`, `periodStart` e `periodEnd`. A resposta traz `alertId` e `recorded`. Abaixo do limite, `alertId` é nulo e `recorded` é falso. O mesmo usuário e período não gera segunda linha: a API devolve o alerta já existente e a tela só redesenha a lista que a consulta devolver.

A consulta precisa de um `userId` para indicador, texto e alertas. O relatório, no mesmo payload, traz todos os simulados. Na abertura a tela pede a consulta com `userId` 1, que é o primeiro IDENTITY quando o schema nasce vazio (Ana Clara). Com o relatório em mãos, o foco passa para Bruno Alves se esse nome existir, porque é o caso de consumo alto da demonstração. As linhas do relatório viram o seletor: escolher outra linha troca o usuário em foco e consulta de novo. Se o id 1 responder 404, a tela para o carregamento, mostra a mensagem e oferece um campo numérico para o operador informar o id e tentar de novo. Não há retry em loop.

Erros seguem o `mapHttpError` de conteúdos, com mensagens próprias:

- Status 0: sem conexão com o admin-api.
- 401: sessão inválida, no texto que a página de conteúdos já usa. Esta tela não cria outro fluxo de login e não apaga o JWT por falha do Oracle.
- 503 `ORACLE_UNAVAILABLE`: mostra o `message` da API (“Oracle de consumo indisponível. Os demais dados do painel continuam no Postgres.”).
- Demais status: o `message` do corpo, ou um texto curto de carga ou de disparo.

Falha na carga zera o spinner e deixa os blocos sem dados. Falha só no disparo, com dados já na tela, mantém os quatro blocos e explica a falha do disparo num aviso separado. Relatório vazio mostra a lista vazia e preserva o indicador.

### Acceptance Criteria

- [ ] Operador autenticado, ao abrir `/admin/consumo`, vê total de tokens, texto formatado, alertas e uma linha por usuário do relatório, no período do seed.
- [ ] A home tem um caminho até essa rota e continua carregando conteúdos, dicas e campanhas sem chamar a API de consumo.
- [ ] Visitante sem JWT não entra na rota: o `authGuard` manda para `/login`.
- [ ] Disparo com Bruno Alves (consumo no limite) chama o POST e, depois da atualização, o alerta desse usuário e período aparece.
- [ ] Disparo com Ana Clara (abaixo do limite) não acrescenta alerta novo.
- [ ] Disparar de novo o mesmo usuário e período não duplica a linha de alerta na lista.
- [ ] Clique duplo no disparo gera uma chamada em voo; o botão fica desabilitado até ela terminar.
- [ ] Erro da API de consumo (em especial 503) mostra mensagem, encerra o carregamento e não redireciona nem limpa a sessão.
- [ ] Com os blocos já visíveis, erro só no disparo preserva os dados e explica a falha.
- [ ] O botão de carregar de novo, com a API respondendo, volta a mostrar os quatro blocos.
- [ ] Com a API local no ar, a meta da intent continua: os quatro blocos em menos de 3 s. A tela não adiciona polling.

### Stories in Scope

- **001-consumption-screen**: rota, guarda, quatro blocos, caminho a partir da home, lista vazia sem quebrar o indicador.
- **002-trigger-alert-routine**: botão de disparo, atualização da lista, uma chamada por vez, sem alerta novo abaixo do limite e sem duplicata.
- **003-consumption-error-state**: erro visível, fim do carregamento, painel restante íntegro, nova carga quando a API volta. 401 fica com o texto de sessão já usado no admin.
