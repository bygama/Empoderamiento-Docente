#!/usr/bin/env bash
# Vuelve el sitio del VPS a un respaldo: la base del sitio, la de Umami, las
# fotos y los CV, como estaban ese día (docs/deploy/vps.md, «Los respaldos»).
# Lo que pasó después se pierde, y por eso pide confirmación.
#
#   scripts/restaurar.sh               → lista los respaldos que hay
#   scripts/restaurar.sh <AAAA-MM-DD>  → restaura ese
#
# Sirve igual con el compose andando, con el compose bajado y en un VPS nuevo
# (con la carpeta del respaldo traída a `respaldos/`): levanta la base si no
# corre, y al final corre el deploy, que migra (si el respaldo es de antes de
# una migración) y vuelve a armar las páginas del sitio, que se prerenderizan
# leyendo la base, con la base restaurada.
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1

respaldos() { ls -1 respaldos 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | sed 's/^/  /' || echo '  (ninguno)'; }

if [ $# -ne 1 ]; then
  echo "Uso: scripts/restaurar.sh <AAAA-MM-DD>. Los que hay:"
  respaldos
  exit 2
fi
if [ ! -d "respaldos/$1" ]; then
  echo "No hay un respaldo del $1. Los que hay:" >&2
  respaldos >&2
  exit 1
fi

echo "Esto reemplaza la base, las fotos y los CV de hoy por los del $1."
read -r -p "Para seguir, escribí «restaurar»: " respuesta
[ "$respuesta" = "restaurar" ] || { echo "No se tocó nada."; exit 1; }

# La base tiene que correr para restaurarla; los que la usan, no.
docker compose up -d --wait db
docker compose stop app analitica cron
docker compose run --rm --no-deps -T respaldo sh /respaldo/restaurar.sh "$1"

# Si ya había un sitio, vuelve enseguida con su imagen mientras se arma la
# nueva (en un VPS nuevo todavía no hay ninguna).
sitio="$(docker compose config --no-interpolate | sed -n 's/^name: //p')-sitio"
if docker image inspect "$sitio:actual" >/dev/null 2>&1; then
  docker compose up -d --wait
fi
printf '\nLa base, las fotos y los CV están como el %s. Ahora el deploy, para que el sitio se arme con ellos.\n' "$1"
exec scripts/desplegar.sh
