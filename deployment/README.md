# CI/CD do Conecta Geração

O workflow [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) entrega os dois produtos do monorepo:

- app: NestJS + Flutter Web, com APK disponível como artefato;
- serviço web: Spring Boot + Angular;
- dados: PostgreSQL compartilhado e Oracle Free para as rotinas PL/SQL de consumo.

## Fluxo

| Evento | Build e testes | Imagens GHCR | Staging | Produção |
|---|---:|---:|---:|---:|
| Pull request para `main` | Sim | Não | Não | Não |
| Push em `main` | Sim | Sim | Automático | Não |
| Execução manual `staging` | Sim | Sim | Automático | Não |
| Execução manual `production` | Sim | Sim | Automático | Após staging e aprovação do ambiente |

Os jobs geram cobertura/relatórios para NestJS, Flutter, Maven, Angular e Oracle. Os logs de cada deploy são anexados à execução por 30 dias. As quatro imagens usam a tag imutável `sha-<12 caracteres do commit>`.

## Configuração no GitHub

Crie os environments `staging` e `production` em **Settings → Environments**. Em `production`, configure required reviewers para manter a aprovação humana antes de afetar usuários.

Cadastre os mesmos nomes em cada environment, com valores próprios:

### Secrets

- `DEPLOY_HOST`: hostname ou IP do servidor Linux;
- `DEPLOY_USER`: usuário SSH com acesso ao Docker;
- `DEPLOY_SSH_KEY`: chave privada SSH;
- `DEPLOY_SSH_KNOWN_HOSTS`: linha do `known_hosts` validada previamente;
- `DEPLOY_ENV_FILE`: conteúdo baseado em [`.env.example`](.env.example), sem `IMAGE_PREFIX` e `IMAGE_TAG` (a pipeline acrescenta ambos).

O conteúdo de `DEPLOY_ENV_FILE` também é carregado por um shell POSIX. Use o formato `CHAVE=valor`, uma variável por linha, e coloque entre aspas simples valores que tenham espaços ou caracteres de shell.

### Variables

- `APP_URL`: URL exibida na página do deployment do GitHub;
- `DEPLOY_PATH`: diretório remoto, padrão `/opt/conecta-geracao`;
- `DEPLOY_SSH_PORT`: porta SSH, padrão `22`;
- `MOBILE_API_BASE_URL`: URL pública da API usada no APK, por exemplo `https://api.exemplo.com`.

Se os pacotes GHCR forem privados, `GHCR_TOKEN` dentro de `DEPLOY_ENV_FILE` precisa de `read:packages`. O `GITHUB_TOKEN` da Action publica as imagens automaticamente.

## Servidor de destino

O servidor precisa de Docker Engine, Docker Compose v2, espaço para as imagens e memória suficiente para o Oracle Free. As portas padrão são:

- `3000`: API NestJS;
- `8080`: Flutter Web;
- `8081`: API Spring Boot;
- `4200`: painel Angular.

Altere as portas no secret `DEPLOY_ENV_FILE` quando houver proxy reverso ou conflito local. PostgreSQL e Oracle não são expostos publicamente.

Na implantação, [`deploy.sh`](deploy.sh) executa esta sequência:

1. valida o Compose e baixa as quatro imagens;
2. sobe PostgreSQL e Oracle e aguarda os health checks;
3. aplica DDL, seed, functions e procedures Oracle idempotentes;
4. sobe o NestJS, que aplica as migrations Prisma;
5. sobe Spring Boot, Flutter Web e Angular;
6. verifica a saúde de todos os serviços e imprime estado e logs.

As suítes destrutivas `005_test_consumo.sql`, `008_test_procedures.sql` e `010_test_pkg_consumo.sql` rodam somente no Oracle descartável da CI. Elas não são executadas no banco implantado.

## Logs, relatórios e rollback

- Cada job mantém seu log nativo no GitHub Actions.
- Coberturas, relatórios Surefire, log PL/SQL, APK e logs do Compose aparecem em **Artifacts**.
- `docker compose logs -f <serviço>` acompanha um serviço no servidor.
- Para rollback, execute manualmente o workflow a partir do commit estável na seleção de branch/tag do GitHub Actions. A mesma versão passa novamente por CI, staging e, quando escolhido, aprovação de produção.

O APK atual usa a configuração de assinatura de desenvolvimento existente no projeto. Para publicar em Google Play, configure keystore de release e Play Console como uma etapa separada; o artefato atual atende instalação e validação interna.
