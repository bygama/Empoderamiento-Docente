#!/bin/sh
# Restaura un respaldo de `respaldos/<AAAA-MM-DD>/`: recrea las bases `ed` y
# `umami` desde sus dumps y reemplaza el contenido de los volúmenes de fotos y
# CV. Lo corre `scripts/restaurar.sh`, que antes para `app`, `analitica` y
# `cron` (nadie puede estar usando las bases) y después los vuelve a levantar.
set -eu

fecha="${1:?Uso: restaurar.sh <AAAA-MM-DD>}"
origen="/respaldos/$fecha"
for archivo in ed.dump umami.dump fotos.tar.gz cv.tar.gz; do
  [ -f "$origen/$archivo" ] || { echo "Falta $origen/$archivo: ese respaldo no está entero." >&2; exit 1; }
done

for base in ed umami; do
  echo "[restaurar] la base $base"
  dropdb -h db -U postgres --if-exists --force "$base"
  # El usuario de cada base se llama como ella (deploy/db/crear-bases.sh).
  createdb -h db -U postgres -O "$base" "$base"
  psql -h db -U postgres -q -c "REVOKE ALL ON DATABASE $base FROM PUBLIC"
  pg_restore -h db -U postgres -d "$base" --exit-on-error "$origen/$base.dump"
done

for volumen in fotos cv; do
  echo "[restaurar] los archivos de $volumen"
  find "/datos/$volumen" -mindepth 1 -delete
  tar -xzf "$origen/$volumen.tar.gz" -C "/datos/$volumen"
done

echo "[restaurar] listo: todo como el $fecha"
