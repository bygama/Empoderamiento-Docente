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
# y deja el standalone en `.compilado/`, y recién con eso se arma la imagen
# `app`, etiquetada con el commit para poder volver (`scripts/volver.sh`).
set -euo pipefail
cd "$(dirname "$0")/.."

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

paso "1/6 La imagen fuente (dependencias y Prisma)"
docker compose build migrar

paso "2/6 La base"
docker compose up -d --wait db

paso "3/6 Las migraciones"
docker compose run --rm migrar

paso "4/6 El build del sitio, con la base"
mkdir -p .compilado
docker compose run --rm --no-deps construir

paso "5/6 La imagen app, versión $version"
ED_VERSION="$version" docker compose build app
docker tag "ed-sitio:$version" ed-sitio:actual

paso "6/6 Levantar todo con la versión nueva"
docker compose up -d --wait --remove-orphans

paso "Quedan las últimas $GUARDAR imágenes de app"
docker images ed-sitio --format '{{.CreatedAt}}|{{.Tag}}' \
  | grep -v '|actual$' | sort -r | tail -n +$((GUARDAR + 1)) | cut -d'|' -f2 \
  | while read -r vieja; do docker rmi "ed-sitio:$vieja" >/dev/null && echo "borrada ed-sitio:$vieja"; done
docker images ed-sitio --format '  {{.Tag}}  {{.CreatedAt}}'

printf '\nListo: https://%s corre %s.\n' "$(grep -E '^DOMINIO=' .env | cut -d= -f2)" "$version"
