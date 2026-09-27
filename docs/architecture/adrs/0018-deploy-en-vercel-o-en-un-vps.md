# ADR-0018: Deploy en Vercel o en un VPS: el código no depende del host

- **Status:** Accepted
- **Date:** 2026-09-27
- **Decision-makers:** Mateo («esto se va a deployar en un vps al final», «vps
  de hostinger», Docker Compose; y, al aprobarse el diseño, «código para los
  dos»), con el padre del XL `work/mapa-del-admin/`; diseñado en
  `work/deploy-en-vps/`
- **Related:** [ADR-0005](0005-admin-a-medida.md) (Neon y Vercel Blob),
  [ADR-0009](0009-analitica-de-vercel-con-copia-diaria.md) (la analítica de
  Vercel con copia diaria), [ADR-0011](0011-search-console-y-un-solo-cron.md)
  (el cron único), [ADR-0010](0010-seguridad-del-acceso.md) (el tope y el
  bloqueo por IP)

---

## Contexto

El sitio y su admin se armaron pensando en Vercel: la base en Neon, las fotos
en Vercel Blob, las visitas en Vercel Web Analytics y el cron en `vercel.json`.
Mateo decidió que el sitio se publica en un VPS de Hostinger con Docker
Compose, y todavía no está decidido si primero va a Vercel o al VPS: mudarse
después tiene que ser mover datos, sin tocar código.

Buena parte ya no dependía del host. La base habla por `@prisma/adapter-pg`
con cualquier Postgres; las fotos y los CV van a disco cuando no hay token de
Blob (`lib/contenido/almacen.ts`, `lib/formularios/almacen-privado.ts`), y solo
en Vercel se niegan a usarlo, porque ahí el disco no dura.

Lo que no: las visitas solo se copiaban de Vercel, el script de analítica era
el de Vercel, el cron vivía en `vercel.json`, y el build daba por hecho que la
base estaba a mano. Esto último es lo que más pesa: **el sitio público se
prerenderiza leyendo el contenido publicado** (`leerSinRomper`). Sin
`DATABASE_URL`, `next build` hornea el contenido inicial —y las novedades, los
materiales, el equipo, los casos y los aliados, que entraron por migración,
salen vacíos— hasta el próximo publicar; con la URL pero sin conexión, el build
falla a propósito. En Vercel el `buildCommand` tenía la base; un `docker build`
no llega a la base de un compose (BuildKit rechaza una red propia, y un builder
de buildx conectado a ella no resuelve el nombre del servicio: probado el
2026-09-27).

## Decisión

**El mismo código corre en Vercel y en un VPS, y cada pieza que depende del
host se elige por variables de entorno.** Para el VPS, el compose de la raíz
(`compose.yaml`) arma lo que Vercel daba hecho.

1. **La base es cualquier Postgres.** En Vercel, Neon; en el VPS, un
   `postgres:17-alpine` del compose con dos bases, `ed` y `umami`, cada una con
   su usuario. Esto cambia el ADR-0005: Neon deja de ser la base de producción
   y pasa a ser la de Vercel.
2. **Fotos y CV: Blob si hay token, disco si no**, en los dos hosts. En el VPS,
   el disco son volúmenes del compose montados donde la app ya los buscaba
   (`<cwd>/.fotos`, `<cwd>/.cv`). Vercel Blob deja de ser el destino de las
   fotos de producción (ADR-0005) y queda como una opción.
3. **El build del VPS se hace adentro del compose.** Un servicio `construir`
   corre `next build` en la red, después de migrar, y saca el standalone como un
   tar por stdout; `scripts/desplegar.sh` lo pasa directo a `docker build` para
   la imagen `app`, etiquetada con el commit (las últimas 5 quedan, y
   `scripts/volver.sh` pone otra a correr). `desplegar.sh` es la única entrada
   del deploy: `docker compose up` a secas no arranca desde cero, porque la
   imagen `app` no existe hasta que `construir` corre con la base.
4. **Las visitas, de Umami en el VPS.** La copia diaria (ADR-0009) sigue igual,
   pero su cliente se elige por variables: Umami si están `UMAMI_API_URL`,
   `UMAMI_API_KEY` y `UMAMI_WEBSITE_ID`, Vercel Web Analytics si están las de
   Vercel. El filtro por país dejó de ser OData y cada cliente lo traduce. El
   plan de cada fuente vive en `PLANES_DE_LA_FUENTE`: con Umami, que guarda todo
   y da la campaña de cada visita, se piden las ventanas de 90 días y se cuentan
   las visitas de los links cortos. El sitio carga un solo script: el de Vercel
   en Vercel, el de Umami fuera de Vercel con su variable, ninguno si no.
   Esto cambia el ADR-0009: Vercel Web Analytics deja de ser la única fuente.
5. **El cron, un servicio en el VPS.** El de `vercel.json` sigue en Vercel; en
   el VPS, el servicio `cron` llama a la misma ruta por la red interna a las
   04:00 UTC con el mismo secreto. Un solo cron que corre todas las tareas
   (ADR-0011) no cambia.
6. **Solo el proxy sale a internet, y por eso la app confía en su IP.** Caddy
   publica 80 y 443 con TLS automático; `app`, `db` y `analitica` no publican
   puertos. Caddy descarta el `X-Forwarded-For` que manda un cliente (no hay
   `trusted_proxies`) y pisa `X-Real-IP` con la IP de la conexión; la app lee
   esas dos (el tope de los formularios, el bloqueo por cuenta de better-auth) y
   Umami lee `X-Real-IP` (`CLIENT_IP_HEADER`). De Umami, Caddy publica solo el
   script y el envío de vistas; su panel se usa por un túnel SSH.
7. **Respaldos diarios en el VPS**, con restauración probada: las dos bases y
   los volúmenes de fotos y CV, 14 días, en una carpeta del host que se copia
   afuera.

## Consecuencias

### Positivas

- Mudarse de host es mover datos: la base con `pg_dump`, los archivos y las
  variables. El código no se toca.
- En el VPS no hay más servicios de afuera que Resend (y Search Console, que es
  de Google): la base, las fotos, los CV, las visitas y los respaldos están en
  la misma máquina.
- Con Umami, Métricas gana lo que el plan gratuito de Vercel no daba: los 90
  días de visitantes y las visitas de cada link.

### Negativas

- El build del VPS corre en el VPS y pide unos 5 GB de memoria en el pico
  (Turbopack, medido con 2 CPUs): un VPS de 4 GB necesita swap
  (`docs/deploy/vps.md`).
- El VPS se opera: actualizaciones del sistema, disco, respaldos fuera del
  VPS. Lo que Vercel hacía solo ahora está en un runbook.
- Umami rota la sal de sus sesiones cada mes: en 90 días, una persona que
  vuelve en otro mes cuenta más de una vez.
- Una migración aplicada no se revierte: volver a una imagen anterior es seguro
  solo si las migraciones del medio solo agregaron.

### Mitigaciones

- El runbook (`docs/deploy/vps.md`) cubre del VPS vacío al sitio andando, con
  el plan mínimo, la swap, el disco y las tres capas de respaldo.
- `desplegar.sh` frena en el primer paso que falla sin tocar la app que corre,
  y guarda las últimas 5 imágenes para volver.
- Para probar la imagen de producción en local sin Resend, `compose.prueba.yaml`
  suma un Resend falso por `RESEND_API_URL`, que Ajustes › Conexiones y el log
  del arranque marcan si queda puesta en producción.

## Alternativas consideradas

### B: publicar la base en 127.0.0.1 y construir con `network: host`

- Qué hubiera implicado: la URL de la base como secreto de BuildKit y un
  `docker build` común.
- Por qué se descarta: la base queda con un puerto publicado, y el networking
  de host no es confiable en Docker Desktop, donde se prueba.

### C: construir sin base y revalidar todo al arrancar

- Qué hubiera implicado: la imagen hornea el contenido inicial y un endpoint
  revalida las rutas cuando la app arranca.
- Por qué se descarta: depende de cómo sirve Next una página revalidada, y
  deja el contenido inicial a la vista después de cada deploy.

### D: `next build` al arrancar `app`

- Qué hubiera implicado: la imagen con todo el código y sus dependencias de
  desarrollo, y el build en el arranque.
- Por qué se descarta: minutos de corte en cada deploy o reinicio, y una imagen
  mucho más pesada.

### Otra analítica en lugar de Umami

- Plausible, GoatCounter o Matomo también se instalan. Umami es gratis, no usa
  cookies, su API da lo que Métricas muestra y el cliente entra por la misma
  interfaz que el de Vercel. Mateo lo puede cambiar: es otro cliente de
  `ClienteDeAnaliticas`.

## Referencias

- `work/deploy-en-vps/` (SPEC, DECISIONS, PROGRESS con las pruebas en local).
- Caddy, `reverse_proxy` y los encabezados `X-Forwarded-*`:
  https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- Umami 3.4.0, su API y su tracker: https://docs.umami.is/docs/api y el código
  de `v3.4.0` en https://github.com/umami-software/umami
- Hostinger, backups y snapshots de un VPS (actualizada el 2026-09-15):
  https://www.hostinger.com/support/1583232-how-to-back-up-or-restore-a-vps-at-hostinger/
