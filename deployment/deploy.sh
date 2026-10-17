#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
COMPOSE="docker compose --project-directory $PROJECT_DIR --env-file $PROJECT_DIR/deployment/.env -f $PROJECT_DIR/deployment/docker-compose.yml"

cd "$PROJECT_DIR"

# O mesmo arquivo alimenta o Compose e as credenciais de login no GHCR.
set -a
. "$PROJECT_DIR/deployment/.env"
set +a

deployment_logs() {
  echo ":: Estado dos containers"
  $COMPOSE ps || true
  echo ":: Ultimas 200 linhas de log"
  $COMPOSE logs --no-color --tail=200 || true
}

trap deployment_logs EXIT

wait_for_healthy() {
  service=$1
  timeout=$2
  elapsed=0

  while [ "$elapsed" -lt "$timeout" ]; do
    container_id=$($COMPOSE ps -q "$service")
    if [ -n "$container_id" ]; then
      status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
      if [ "$status" = "healthy" ]; then
        echo "$service esta healthy"
        return 0
      fi
      if [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
        echo "$service terminou com status $status" >&2
        return 1
      fi
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done

  echo "Timeout aguardando $service ficar healthy" >&2
  return 1
}

apply_oracle_scripts() {
  for script in \
    001_ddl_consumo.sql \
    002_seed_consumo.sql \
    003_fn_indicador_tokens.sql \
    004_fn_consumo_formatado.sql \
    006_pr_registrar_alerta_consumo.sql \
    007_pr_relatorio_consumo.sql \
    009_pkg_consumo_ia.sql
  do
    echo "Aplicando Oracle: $script"
    $COMPOSE exec -T oracle sh -lc \
      'sqlplus -s "$APP_USER/$APP_USER_PASSWORD@//localhost:1521/FREEPDB1" @"$1"' \
      _ "/opt/conecta/oracle/$script"
  done
}

echo "Validando configuracao do Compose"
$COMPOSE config --quiet

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

echo "Baixando imagens da versao ${IMAGE_TAG}"
$COMPOSE pull backend admin-api mobile admin

echo "Subindo bancos"
$COMPOSE up -d postgres oracle
wait_for_healthy postgres 120
wait_for_healthy oracle 600
apply_oracle_scripts

echo "Subindo backend do app"
$COMPOSE up -d backend
wait_for_healthy backend 240

echo "Subindo admin-api e frontends"
$COMPOSE up -d admin-api mobile admin
wait_for_healthy admin-api 240
wait_for_healthy mobile 120
wait_for_healthy admin 120

echo "Deploy concluido com a tag ${IMAGE_TAG}"
