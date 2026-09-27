#!/usr/bin/env bash
# Vuelve el sitio del VPS a un respaldo: la base del sitio, la de Umami, las
# fotos y los CV, como estaban ese día (docs/deploy/vps.md, «Restaurar»). Lo
# que pasó después se pierde, y por eso pide confirmación.
#
#   scripts/restaurar.sh               → lista los respaldos que hay
#   scripts/restaurar.sh <AAAA-MM-DD>  → restaura ese
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1

respaldos() { ls -1 respaldos 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | sed 's/^/  /'; }

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

docker compose stop app analitica cron
docker compose run --rm --no-deps -T respaldo sh /respaldo/restaurar.sh "$1"
docker compose up -d --wait
echo "Listo: el sitio está como el $1."
