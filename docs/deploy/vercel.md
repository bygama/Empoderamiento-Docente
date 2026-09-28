# Deploy en Vercel

El otro camino del mismo código: el que no necesita operar un servidor. El
porqué de que los dos convivan está en el
[ADR-0018](../architecture/adrs/0018-deploy-en-vercel-o-en-un-vps.md); el VPS,
en [`vps.md`](vps.md).

## El proyecto

- Un proyecto de Vercel conectado al repo, con **Root Directory =
  `apps/sitio`**: es un monorepo, Vercel instala desde la raíz del workspace y
  buildea la app. Preview por PR, producción desde `main`.
- `apps/sitio/vercel.json` hace el resto: su `buildCommand` genera el cliente
  de Prisma, **migra** y buildea (el build lee la base: el sitio se
  prerenderiza con el contenido publicado), y su `crons` llama a
  `/api/cron/diario` todos los días a las 04:00 UTC con `CRON_SECRET`.
- Fuera de Vercel el build sale en `standalone`; en Vercel, no
  (`next.config.ts` mira `VERCEL`).

## Lo que se instala desde el Marketplace

- **Neon** (Postgres): escribe `DATABASE_URL` (con pooler) y
  `DATABASE_URL_UNPOOLED` (directa, la de las migraciones). Una rama por
  preview.
- **Dos stores de Blob**: uno **público** para las fotos
  (`BLOB_READ_WRITE_TOKEN`) y otro **privado** para los CV
  (`CV_BLOB_READ_WRITE_TOKEN`). Sin el de CV, en Vercel no se reciben CV: el
  disco de una función no dura.
- **Resend**: `RESEND_API_KEY`, y `CORREO_REMITENTE` a mano. El DNS (SPF, DKIM,
  DMARC y el click tracking apagado) es el mismo que en `vps.md` §2.

## Las variables propias

En Settings › Environment Variables (qué es cada una: `apps/sitio/.env.example`):
`NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, `CV_ABIERTO`, las
tres de Search Console y, para la copia de las visitas, `VERCEL_TOKEN` y
`VERCEL_ANALYTICS_PROJECT_ID` (y `VERCEL_TEAM_ID` si el proyecto es de un
equipo) **solo en Production**: el token abre la cuenta entera (ADR-0009).
Web Analytics se prende en el proyecto, y el sitio carga su script cuando
están esas variables: una sola regla elige la fuente del script y de la copia
(ADR-0018). **Las de Umami no se cargan acá**: con ellas la fuente sería Umami
también en Vercel, y su script (`/umami/script.js`) lo sirve el proxy del VPS,
así que acá daría 404. Ajustes › Conexiones lo avisa.

## La primera cuenta

Con las variables de producción en un `.env.local` de tu máquina (sin
commitearlo), `pnpm --filter sitio crear-cuenta <correo> "<nombre>" administra`
contra la base de producción, y el mismo orden que en `vps.md` §6: primero un
correo de prueba por «Olvidé mi contraseña», después quien dirige.

## Mudanza al VPS

Está en `vps.md` §10: la base con `pg_dump` desde la URL directa de Neon, los
CV con la misma clave, las fotos (que cambian de URL: el script que las copia
todavía no existe, y mientras tanto pueden quedarse en Blob con su token en el
`.env` del VPS) y las variables.
