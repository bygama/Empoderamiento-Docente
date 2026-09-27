#!/bin/sh
# El `next build` del VPS: lo corre el servicio `construir` del compose, adentro
# de la red y con la base, porque el sitio se prerenderiza leyendo el contenido
# publicado (ADR-0018).
#
# Su salida es un tar por stdout, y nada más: el contexto de `docker build`
# para la imagen `app` (`scripts/desplegar.sh` los encadena). Adentro van el
# Dockerfile y, en `compilado/`, el standalone con `.next/static` y `public/`.
# Todo lo demás (el log del build) va a stderr, para no ensuciar el tar.
#
# Por qué un tar y no una carpeta del host: los node_modules del standalone son
# symlinks de pnpm, y en una carpeta compartida con Windows (Docker Desktop) no
# sobreviven. Por el tar llegan intactos, y el build no deja nada en el disco.
set -eu

pnpm build >&2

salida=$(mktemp -d)
compilado="$salida/compilado"
mkdir -p "$compilado"
cp -a apps/sitio/.next/standalone/. "$compilado/"
# El standalone no trae los estáticos ni `public/` entero: van al lado del
# server.js. Con `/.` se copia el contenido aunque la carpeta ya exista.
mkdir -p "$compilado/apps/sitio/.next/static" "$compilado/apps/sitio/public"
cp -a apps/sitio/.next/static/. "$compilado/apps/sitio/.next/static/"
cp -a apps/sitio/public/. "$compilado/apps/sitio/public/"
# Next copia al standalone los .env que encuentra. Acá no hay ninguno (la
# imagen `fuente` no los trae), pero si alguno apareciera, no viaja.
find "$compilado" -name ".env*" -not -name ".env.example" -delete
cp Dockerfile "$salida/Dockerfile"

echo "construir: $(du -sh "$compilado" | cut -f1) para la imagen app" >&2
tar -c -C "$salida" .
