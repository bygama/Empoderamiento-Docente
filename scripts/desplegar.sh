#!/usr/bin/env bash
# El deploy del VPS, entero y en orden (docs/deploy/vps.md, ADR-0018). Es la
# única entrada: sirve para el primero y para cada versión nueva, y se puede
# correr dos veces sin romper nada. Frena en el primer paso que falla, y hasta
# el último paso el `app` que está corriendo no se toca.
#
#   scripts/desplegar.sh
#
# Por qué no `docker compose up` a secas: el sitio se prerenderiza leyendo la
# base, y un `docker build` no llega a la base del compose. Así que primero se
# migra, después el servicio `construir` corre `next build` adentro de la red
# y saca el standalone como un tar, que es el contexto de la imagen `app`,
# etiquetada con el commit para poder volver (`scripts/volver.sh`).
set -euo pipefail
cd "$(dirname "$0")/.."
# En Git Bash (Windows, la prueba local) las rutas de Linux no se traducen.
export MSYS_NO_PATHCONV=1

# Cuántas imágenes de `app` se guardan para volver atrás.
GUARDAR=5

if [ ! -f .env ]; then
  echo "Falta .env: copiá .env.example y completalo (docs/deploy/vps.md)." >&2
  exit 1
fi
version=$(git rev-parse --short=12 HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Hay cambios sin commitear: la imagen diría $version y no sería eso." >&2
  exit 1
fi

paso() { printf '\n== %s\n' "$*"; }

paso "1/5 La imagen fuente (dependencias y Prisma)"
docker compose build migrar

paso "2/5 La base"
docker compose up -d --wait db

paso "3/5 Las migraciones"
docker compose run --rm migrar

paso "4/5 El build del sitio con la base, y la imagen app $version"
# -T: sin terminal, para que por stdout salga solo el tar.
docker compose run --rm -T --no-deps construir | docker build --target app -t "ed-sitio:$version" -
docker tag "ed-sitio:$version" ed-sitio:actual

paso "5/5 Levantar todo con la versión nueva"
docker compose up -d --wait --remove-orphans
# Caddy no relee su archivo solo: si el deploy trajo un Caddyfile nuevo, así
# entra sin cortar conexiones.
docker compose exec -T proxy caddy reload --config /etc/caddy/Caddyfile

paso "Quedan las últimas $GUARDAR imágenes de app"
docker images ed-sitio --format '{{.CreatedAt}}|{{.Tag}}' \
  | grep -v '|actual$' | sort -r | tail -n +$((GUARDAR + 1)) | cut -d'|' -f2 \
  | while read -r vieja; do docker rmi "ed-sitio:$vieja" >/dev/null && echo "borrada ed-sitio:$vieja"; done
docker images ed-sitio --format '  {{.Tag}}  {{.CreatedAt}}'

printf '\nListo: https://%s corre %s.\n' "$(grep -E '^DOMINIO=' .env | cut -d= -f2)" "$version"
