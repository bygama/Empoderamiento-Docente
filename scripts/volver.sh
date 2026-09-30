#!/usr/bin/env bash
# Vuelve el sitio del VPS a una versión anterior de la imagen `app` (las guarda
# `scripts/desplegar.sh`, las últimas 5, con el commit como etiqueta).
#
#   scripts/volver.sh            → lista las versiones que hay
#   scripts/volver.sh <versión>  → la pone a correr
#
# Ojo con las migraciones: una migración aplicada no se revierte. Volver a una
# versión anterior a una migración deja código viejo sobre el esquema nuevo;
# es seguro si la migración solo agregó (tablas, columnas con default), y no
# lo es si renombró o borró algo que el código viejo usa (docs/deploy/vps.md).
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1

# Las imágenes llevan el nombre del proyecto (compose.yaml).
sitio="$(docker compose config --no-interpolate | sed -n 's/^name: //p')-sitio"
versiones() { docker images "$sitio" --format '  {{.Tag}}  {{.CreatedAt}}' | grep -v '^ *actual ' || echo '  (ninguna)'; }

if [ $# -ne 1 ]; then
  echo "Uso: scripts/volver.sh <versión>. Las que hay:"
  versiones
  exit 2
fi
if ! docker image inspect "$sitio:$1" >/dev/null 2>&1; then
  echo "No hay una imagen $sitio:$1. Las que hay:" >&2
  versiones >&2
  exit 1
fi

docker tag "$sitio:$1" "$sitio:actual"
# Solo `app`: las migraciones no vuelven atrás, y el resto no cambió.
docker compose up -d --wait --no-deps app
# La versión vieja puede tener otros archivos en `public/` con el mismo
# nombre: la caché de imágenes se vacía (desplegar.sh).
docker compose exec -T app sh -c 'rm -rf .next/cache/images/*' </dev/null
echo "Listo: corre $1."
