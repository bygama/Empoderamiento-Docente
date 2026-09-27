#!/bin/sh
# El `next build` del VPS: lo corre el servicio `construir` del compose, adentro
# de la red y con la base, porque el sitio se prerenderiza leyendo el contenido
# publicado (ADR-0018). Deja en /compilado (el `.compilado/` del host) lo que la
# imagen `app` copia: el standalone, `.next/static` y `public/`.
set -eu

pnpm build

destino=/compilado
find "$destino" -mindepth 1 -delete
cp -a apps/sitio/.next/standalone/. "$destino/"
# El standalone no trae los estáticos ni `public/` entero: van al lado del
# server.js. Con `/.` se copia el contenido aunque la carpeta ya exista.
mkdir -p "$destino/apps/sitio/.next/static" "$destino/apps/sitio/public"
cp -a apps/sitio/.next/static/. "$destino/apps/sitio/.next/static/"
cp -a apps/sitio/public/. "$destino/apps/sitio/public/"

# Next copia al standalone los .env que encuentra. Acá no hay ninguno (la
# imagen `fuente` no los trae), pero si alguno apareciera, no viaja.
find "$destino" -name ".env*" -not -name ".env.example" -delete

echo "construir: listo en $destino ($(du -sh "$destino" | cut -f1))"
