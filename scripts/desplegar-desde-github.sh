#!/usr/bin/env bash
# Lo que corre el botón «Desplegar» de GitHub (.github/workflows/desplegar.yml)
# en el VPS: trae main y corre scripts/desplegar.sh. Es el comando forzado de
# la llave del botón en ~/.ssh/authorized_keys (docs/deploy/vps.md §14), así
# que esa llave no puede hacer otra cosa, ni elegir rama.
#
# El deploy corre desprendido de la conexión y acá solo se sigue su log: si
# GitHub corta a mitad del build (o alguien cancela la corrida), el deploy
# termina igual, y su log queda en ~/desplegues/.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p "$HOME/desplegues"
log="$HOME/desplegues/$(date -u +%Y-%m-%dT%H%M%SZ).log"
# Quedan los últimos 20 (el nombre es la hora, así que ordenar por nombre es
# ordenar por fecha).
printf '%s\n' "$HOME"/desplegues/*.log | sort -r | tail -n +20 | xargs -r -d '\n' rm -f --

# setsid: el deploy sale del grupo de la sesión SSH, y un corte no lo mata.
setsid bash -c 'git pull --ff-only && scripts/desplegar.sh; echo "exit=$?"' \
  >"$log" 2>&1 </dev/null &
tail -n +1 -f --pid=$! "$log"

codigo=$(sed -n 's/^exit=//p' "$log" | tail -n 1)
exit "${codigo:-1}"
