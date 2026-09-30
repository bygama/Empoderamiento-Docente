# syntax=docker/dockerfile:1

# Las dos imágenes del sitio en un VPS (docs/deploy/vps.md, ADR-0018).
#
# - `fuente`: el workspace entero con sus dependencias y el cliente de Prisma
#   generado. La usan los servicios `migrar` y `construir` del compose, y los
#   comandos de `apps/sitio/scripts/` (crear-cuenta, nombrar-direccion).
# - `app`: solo el standalone de Next, lo que corre el servicio `app`.
#
# **`next build` no corre acá, y es a propósito**: el sitio se prerenderiza
# leyendo el contenido publicado de la base, y un `docker build` no llega a la
# base del compose. Lo corre el servicio `construir` adentro de la red y saca
# el standalone como un tar por stdout, que es el contexto de la imagen `app`
# (`scripts/desplegar.sh` encadena los dos; ver `deploy/construir.sh`).

ARG NODE=node:24-alpine

FROM ${NODE} AS fuente
WORKDIR /app
ENV CI=true NEXT_TELEMETRY_DISABLED=1
# pnpm sale de `packageManager` del package.json de la raíz.
RUN corepack enable
# Primero los manifiestos: si no cambian, el install sale de la caché.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/instalar-hooks.mjs scripts/
COPY apps/sitio/package.json apps/sitio/
COPY packages/db/package.json packages/db/
COPY packages/auth/package.json packages/auth/
COPY packages/kit-admin/package.json packages/kit-admin/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm generate

FROM ${NODE} AS app
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# El contexto es el tar de `deploy/construir.sh`: el standalone, con
# `.next/static` y `public/`, en `compilado/`.
COPY --chown=node:node compilado/ ./
# Las fotos y los CV van a disco (sin token de Blob) en `<cwd>/.fotos` y
# `<cwd>/.cv`, y la caché de next/image en `.next/cache/images`: ahí monta el
# compose sus volúmenes. Se crean del usuario que corre: un volumen nuevo
# hereda el dueño de la carpeta que tapa.
RUN mkdir -p apps/sitio/.fotos apps/sitio/.cv apps/sitio/.next/cache/images \
  && chown node:node apps/sitio/.fotos apps/sitio/.cv apps/sitio/.next/cache apps/sitio/.next/cache/images
USER node
WORKDIR /app/apps/sitio
EXPOSE 3000
CMD ["node", "server.js"]
