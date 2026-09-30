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
# Un deploy a la vez: el botón de GitHub y alguien por SSH se pueden cruzar, y
# dos builds juntos pasan la memoria del VPS. El candado vive lo que vive el
# proceso, así que un deploy cortado no lo deja trabado. Git Bash no trae
# `flock`: en la prueba local se sigue sin candado.
if command -v flock >/dev/null; then
  exec 9>"${TMPDIR:-/tmp}/ed-desplegar.candado"
  flock -n 9 || { echo "Ya hay un deploy corriendo en este servidor: esperá a que termine." >&2; exit 1; }
fi
version=$(git rev-parse --short=12 HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Hay cambios sin commitear: la imagen diría $version y no sería eso." >&2
  exit 1
fi

paso() { printf '\n== %s\n' "$*"; }

# Las imágenes llevan el nombre del proyecto (`ed`, o el COMPOSE_PROJECT_NAME
# del .env: compose.yaml), y la poda de abajo solo toca las de este.
proyecto=$(docker compose config --no-interpolate | sed -n 's/^name: //p')
sitio="$proyecto-sitio"

paso "1/5 La imagen fuente (dependencias y Prisma)"
# --pull: la base de Node (y abajo, la de la imagen app) se trae de nuevo si
# salió un parche; sin esto, la etiqueta flotante se queda en la primera que bajó.
docker compose build --pull migrar

paso "2/5 La base"
docker compose up -d --wait db

paso "3/5 Las migraciones"
docker compose run --rm migrar

# La versión que corre ahora, para saber después qué cambió. Vacía en el
# primer deploy.
previa=$(docker image inspect "$sitio:actual" --format '{{join .RepoTags "\n"}}' 2>/dev/null \
  | sed -n "s/^$sitio://p" | grep -vx actual | head -n 1 || true)

paso "4/5 El build del sitio con la base, y la imagen app $version"
# -T: sin terminal, para que por stdout salga solo el tar.
docker compose run --rm -T --no-deps construir | docker build --pull --target app -t "$sitio:$version" -
docker tag "$sitio:$version" "$sitio:actual"

paso "5/5 Levantar todo con la versión nueva"
docker compose up -d --wait --remove-orphans
# Caddy no relee su archivo solo. Y el Caddyfile está montado como archivo
# suelto: `git pull` lo reemplaza por uno nuevo (otro inodo) y el contenedor
# sigue viendo el viejo, así que un `caddy reload` recargaría lo de antes. Si
# cambió, se recrea el proxy (un corte de un segundo; los certificados quedan
# en su volumen); si no, se recarga sin cortar conexiones.
if docker compose exec -T proxy cat /etc/caddy/Caddyfile </dev/null | cmp -s - deploy/Caddyfile; then
  docker compose exec -T proxy caddy reload --config /etc/caddy/Caddyfile </dev/null
else
  echo "El Caddyfile cambió: se recrea el proxy."
  docker compose up -d --wait --force-recreate --no-deps proxy
fi
# La caché de next/image sobrevive al deploy (su volumen, compose.yaml) y
# guarda una imagen por URL. Si un archivo de `public/` cambió sin cambiar de
# nombre, se vería el viejo hasta 4 h: se vacía cuando `public/` cambió, o
# cuando no se sabe qué corría. Las fotos del admin no la necesitan: cada una
# nueva tiene su URL.
if [ -z "$previa" ] || ! git diff --quiet "$previa" HEAD -- apps/sitio/public 2>/dev/null; then
  echo "Cambió public/ (o no se sabe qué corría): se vacía la caché de imágenes."
  docker compose exec -T app sh -c 'rm -rf .next/cache/images/*' </dev/null
fi

paso "Quedan las últimas $GUARDAR imágenes de app"
docker images "$sitio" --format '{{.CreatedAt}}|{{.Tag}}' \
  | grep -v '|actual$' | sort -r | tail -n +$((GUARDAR + 1)) | cut -d'|' -f2 \
  | while read -r vieja; do docker rmi "$sitio:$vieja" >/dev/null && echo "borrada $sitio:$vieja"; done
docker images "$sitio" --format '  {{.Tag}}  {{.CreatedAt}}'

printf '\nListo: https://%s corre %s.\n' "$(grep -E '^DOMINIO=' .env | cut -d= -f2)" "$version"
