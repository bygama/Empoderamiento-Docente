# SPEC — deploy-en-vps

Lane 0 del XL `work/mapa-del-admin/`, rehecha: el sitio y su admin se deployan
en un **VPS de Hostinger con Docker Compose**, no en Vercel (Mateo,
2026-09-27; DECISIONS del padre, «El deploy va a un VPS»). Rama
`mateo/deploy-en-vps`, dev server en el puerto 3035, base propia `ed_vps` si
hace falta migrar (esta lane no toca el esquema).

## 1. Qué se quiere

**Código para los dos hosts** (Mateo, 2026-09-27, al aprobar este SPEC):
todavía no está decidido dónde se publica primero, así que el mismo código
corre en **Vercel** y en un **VPS con `docker compose`**, y se elige por
variables de entorno. Mudarse después es mover datos, sin tocar código.

Para el VPS, todo lo que Vercel daba hecho se reemplaza por piezas del propio
compose, probado **entero en local con Docker Desktop**: la imagen, la base, las
migraciones, TLS, el cron, la analítica (Umami), la IP real detrás del proxy y
los backups con su restauración. Vercel sigue como está (`vercel.json`,
`@vercel/analytics`, Blob). Más la documentación de los dos caminos y el
runbook para levantar el VPS de verdad, que hace Mateo cuando tenga el SSH y el
DNS.

## 2. Lo que ya es independiente del host (relevado el 2026-09-27)

| Pieza | Hoy | En el VPS |
| --- | --- | --- |
| Base | `@prisma/adapter-pg` (`packages/db`) | cualquier Postgres: el del compose |
| Fotos | Blob con `BLOB_READ_WRITE_TOKEN`; sin él, `<cwd>/.fotos` servido por `/api/fotos/[id]` | disco, en un volumen montado en `.fotos` (Blob sigue si hay token) |
| CV | Blob privado con `CV_BLOB_READ_WRITE_TOKEN`; sin él, `<cwd>/.cv`; solo en Vercel (`VERCEL`) se niega al disco | disco, en un volumen privado montado en `.cv` (Blob sigue si hay token) |
| Cron | `crons` de `apps/sitio/vercel.json` → `GET /api/cron/diario` con `Bearer ${CRON_SECRET}` | se queda para Vercel; en el VPS, un servicio del compose llama a la misma ruta (§3.4) |
| Build | `buildCommand` de `vercel.json`: generate → migrate:deploy → next build, con la base a mano | se queda para Vercel; en el VPS, §3.1 |
| Analítica | `@vercel/analytics` en el layout del sitio + copia diaria por `ClienteDeAnaliticas` (`lib/metricas/vercel.ts`) | Vercel se queda; en el VPS, Umami; se elige por variables (§3.5) |
| IP | `x-forwarded-for` (el primero) o `x-real-ip`: `lib/formularios/limite.ts` y better-auth (`ipAddressHeaders`) | Caddy la pone (§3.6) |

Las carpetas de fotos y CV no tienen variable: salen del `cwd` del servidor
(`CARPETA_LOCAL = ".fotos"`, `path.resolve(process.cwd(), ".cv")`). En la imagen
el `cwd` es `/app/apps/sitio`, así que los volúmenes se montan en
`/app/apps/sitio/.fotos` y `/app/apps/sitio/.cv`. No se agrega ninguna variable.

## 3. Diseño

### 3.1 El build necesita la base, y por eso se construye adentro del compose

**El problema.** El sitio público se prerenderiza en `next build` leyendo el
contenido publicado (`leerSinRomper`): sin `DATABASE_URL` hornea el contenido
inicial —y las novedades, materiales, equipo, casos y aliados, que entraron por
migración, salen vacíos—; con la URL pero sin conexión, el build falla a
propósito. Un `docker build` no llega a la base del compose: BuildKit rechaza
una red propia (`network mode "…" not supported by buildkit`) y un builder de
buildx con `--driver-opt network=` no resuelve el nombre `db` en el `RUN`
(probado el 2026-09-27).

**La decisión (A, aprobada por el padre el 2026-09-27).**

- Un `Dockerfile` multi-etapa en la raíz, con dos imágenes finales:
  - **`fuente`** (`ed-fuente:actual`): Node 24 alpine, pnpm por corepack,
    `pnpm install --frozen-lockfile` del workspace, el código y `pnpm generate`.
    La usan `migrar` y `construir`, y sirve para los comandos de `scripts/`
    (`crear-cuenta`, `nombrar-direccion`).
  - **`app`** (`ed-sitio:<commit>` y `ed-sitio:actual`): Node 24 alpine con el
    standalone y nada más, usuario `node`, `node apps/sitio/server.js`. Se arma
    desde `.compilado/` (su propio contexto de build).
- `next.config.ts` pasa a `output: "standalone"` con `outputFileTracingRoot` en
  la raíz del workspace (la misma que `turbopack.root`).
- El servicio one-shot **`construir`** (imagen `fuente`, en la red interna,
  después de `migrar`) corre `pnpm build` con la base y deja en `.compilado/`
  (bind mount, git-ignorado y fuera del contexto de `fuente`) el standalone,
  `.next/static` y `public/`.
- **`scripts/desplegar.sh` es la única entrada del deploy** (`set -euo
  pipefail`, idempotente, frena en el primer paso que falla sin tocar el `app`
  que corre): build de `fuente` → `up -d db analitica` → `run --rm migrar` →
  `run --rm construir` → build de `ed-sitio:<commit>` → tag `actual` → `up -d`
  → borra las imágenes de `app` más viejas que las **últimas 5**. `docker
  compose up` a secas no arranca desde cero (falta `.compilado/`), y el runbook
  y el README lo dicen.
- **`scripts/volver.sh <commit>`** retaguea `ed-sitio:<commit>` como `actual` y
  hace `up -d app`. **Una migración aplicada no se revierte**: volver a una
  imagen anterior a una migración deja código viejo sobre un esquema nuevo; el
  runbook dice cuándo eso es seguro (migraciones que solo agregan) y cuándo no.
- **Ningún secreto en la imagen ni en `.compilado/`:** `construir` lee las
  variables del entorno del compose; `.dockerignore` deja afuera `.env*`,
  `.compilado`, `.fotos`, `.cv`, `node_modules` y `.next`. Se verifica con
  `grep` sobre `.compilado/` y dentro de la imagen (la contraseña de la base,
  `BETTER_AUTH_SECRET`, `CRON_SECRET`, `UMAMI_API_KEY`).
- **El corte de un deploy se mide**: segundos sin respuesta durante un
  `desplegar.sh` en local, en PROGRESS.

### 3.2 El compose

`compose.yaml` en la raíz, proyecto `ed`. Dos redes: `borde` (solo `proxy`) e
`interna` (todo lo demás, más `proxy`). **Solo `proxy` publica puertos: 80 y
443** (más 443/udp para HTTP/3).

| Servicio | Imagen | Qué hace | Volúmenes | Depende de |
| --- | --- | --- | --- | --- |
| `db` | `postgres:17-alpine` | Postgres con las bases `ed` (el sitio) y `umami`, cada una con su usuario; un script de `deploy/db/` las crea en el primer arranque | `datos-db` | — |
| `migrar` | `ed-fuente:actual` | `pnpm migrate:deploy` y termina | — | `db` sano |
| `construir` | `ed-fuente:actual` | `pnpm build` con la base; copia el standalone a `.compilado/` y termina (perfil `construir`: solo lo corre `desplegar.sh`) | `./.compilado` | `migrar` completado |
| `app` | `ed-sitio:actual` | el sitio y el admin, `node server.js` en el 3000 interno | `fotos`, `cv` | `migrar` completado |
| `analitica` | `ghcr.io/umami-software/umami` fijado en v3.4.0 | Umami, en el 3000 interno | — | `db` sano |
| `proxy` | `caddy:2-alpine` | TLS automático, `/umami/script.js` y `/umami/api/send` a `analitica`, el resto a `app` | `caddy-datos`, `caddy-config` | `app`, `analitica` |
| `cron` | `alpine` | busybox `crond`: a las 04:00 UTC llama al cron diario (§3.4) | — | `app` |
| `respaldo` | `postgres:17-alpine` | busybox `crond`: a las 03:30 UTC respalda (§3.7) | `fotos:ro`, `cv:ro`, `./respaldos` | `db` sano |

Volúmenes nombrados: `datos-db`, `fotos`, `cv`, `caddy-datos`, `caddy-config`.
Los respaldos van a una carpeta del host (`./respaldos`, git-ignorada) para que
se puedan copiar afuera del VPS sin entrar a Docker.

**Variables**: un `.env.example` en la raíz, del compose, con todas las
variables y ningún valor real (`DOMINIO`, `CORREO_ACME`, las contraseñas de
`db` y de Umami, `BETTER_AUTH_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`,
`CORREO_REMITENTE`, `SEARCH_CONSOLE_*`, `UMAMI_*`, `CV_ABIERTO`,
`DIAS_DE_RESPALDO`…). El compose arma `DATABASE_URL`,
`DATABASE_URL_UNPOOLED` y `NEXT_PUBLIC_SITE_URL` desde ellas. En local, el
mismo compose con `DOMINIO=localhost` y el certificado interno de Caddy. **Nunca
se commitea un `.env` con valores** (`.gitignore` ya tiene `.env*` con
`!.env.example`).

### 3.3 Next en la imagen

- `output: "standalone"`; el `remotePatterns` de Blob y el `bodySizeLimit` de
  5 MB quedan (Blob sigue elegible por variable). Su comentario deja de hablar
  de «el corte de Vercel».
- **`vercel.json` se queda**: su `buildCommand` y su `crons` siguen sirviendo en
  Vercel y en el VPS no molestan. En el VPS, lo mismo lo hacen la imagen
  (`generate`), `migrar` / `construir` y el servicio `cron`.
- **Fotos y CV: Blob si hay token, disco si no** —ya es así—, en los dos
  hosts. Queda escrito en el README, el runbook y el ADR.

### 3.4 El cron diario

- `cron` (alpine) guarda `CRON_SECRET` en un archivo `0600` al arrancar,
  instala el crontab `0 4 * * *` (el contenedor está en UTC) y corre
  `crond -f`. El trabajo es `deploy/cron/correr.sh`: `wget` a
  `http://app:3000/api/cron/diario` por la red interna, con
  `Authorization: Bearer <secreto>`, y la salida —el JSON de las corridas, o el
  error— va al log del contenedor (`/proc/1/fd/1`).
- **A mano:** `docker compose exec cron /etc/ed-cron/correr.sh`; el log, con
  `docker compose logs cron`.
- La ruta habla de los dos que la llaman (el cron de `vercel.json` y el
  servicio `cron`); `maxDuration` se queda (en `next start` no hace nada y en
  Vercel sigue valiendo).

### 3.5 Métricas con Umami

**El cliente.** `lib/metricas/umami.ts`, `crearClienteDeUmami({ url, apiKey,
sitio, fetchImpl })`, cumple `ClienteDeAnaliticas` (`porDia` y `ventana`) contra
la API de Umami v3.4.0, verificada en su código fuente y en
docs.umami.is el 2026-09-27: `Authorization: Bearer <api key>` (las API keys
existen en self-hosted: Settings › API keys), `startAt`/`endAt` en ms,
`timezone=UTC`.

- `ClienteDeAnaliticas`, `ErrorDeAnaliticas` y los filtros pasan a un archivo
  compartido (`lib/metricas/cliente.ts`); `vercel.ts` y `umami.ts` los cumplen.
- **El filtro deja de ser OData**: hoy `porDia(rango, dimension, filtro?:
  string)` recibe `country eq 'CL'`, que es sintaxis de Vercel. Pasa a un tipo
  propio, `FiltroDePais = { pais } | { fueraDe: [...] }`, y cada cliente lo
  traduce (Vercel: el OData de hoy, con los mismos tests; Umami:
  `country=eq.CL` / `country=neq.CL,MX,AR`). Los métodos no cambian.
- **Se elige por las variables**: con `UMAMI_API_URL`, `UMAMI_API_KEY` y
  `UMAMI_WEBSITE_ID`, Umami; si no, con las de Vercel, Vercel; si no, ninguna
  (como hoy). `lib/metricas/entorno.ts` dice cuál (`fuenteDeVisitas()`).

**Qué da Umami para cada dimensión que usan Resumen y Origen:**

| Dimensión | Endpoint de Umami | Granularidad | ¿Da? |
| --- | --- | --- | --- |
| Vistas y visitantes por día (`total`) | `GET /api/websites/:id/pageviews?unit=day` → `pageviews[]` y `sessions[]` | día UTC | sí |
| Por hora (`hora`, la mejor hora) | el mismo con `unit=hour` | hora UTC (Umami acepta `hour` hasta 30 días de rango; la corrida pide 31 como mucho, `differenceInDays` = 30) | sí |
| Páginas (`pagina`) | `GET …/metrics/expanded?type=path`, un pedido por día | día; vistas y visitantes por ruta | sí |
| Países (`pais`) | `type=country` | día; ISO alfa-2 | sí |
| Referidos (`referido`) | `type=referrer` (el dominio) | día | sí |
| Dispositivo | `type=device` | día; `desktop`, `laptop`, `mobile`, `tablet`: `laptop` se guarda como `desktop` | sí |
| Sistema | `type=os` | día; los nombres de Umami («Mac OS», «Android OS»…) se guardan con el nombre de siempre | sí |
| Navegador | `type=browser` | día; los códigos de Umami (`chrome`, `ios`, `edge-chromium`…) se guardan con su nombre | sí |
| Campaña (UTM, `campana`) | `type=utmCampaign` | día | **sí**: se prende |
| Página × país (el cruce) | `type=path` con `country=eq.CL` … y `country=neq.CL,MX,AR` | día | sí |
| Visitantes únicos de una ventana | `GET …/stats` → `visitors` | el rango entero, sin tope | sí, con una salvedad: Umami rota la sal de la sesión cada mes, así que en 90 días una persona que vuelve en otro mes cuenta más de una vez |
| Provincias, ciudades | `type=region` / `type=city` | — | las da, pero **no se muestran**: fuera de alcance y pueden señalar a alguien. La pantalla lo dice |

Umami no agrupa «el resto» en una fila `Others`: las filas pasan del tope por
dimensión (`limit`) y lo que no entra no se guarda, como hoy con el tope.

**El plan de la fuente.** `PLAN_DE_VERCEL` (`config/metricas.ts`) pasa a
`PLANES_DE_LA_FUENTE = { vercel: { nombre, ventanaDeReporteDias: 30, utm: false },
umami: { nombre, ventanaDeReporteDias: null, utm: true } }` y
`planDeLaFuente()` da el de la fuente configurada. Con Umami: **las ventanas de
90 días y la de 30 anterior se piden** (sin tope de ventana), **las visitas por
link (UTM) se prenden** en Links para compartir, y las cifras de 90 días del
Resumen dejan de decir «no se puede medir». Los textos que hoy nombran a Vercel
nombran a la fuente (`plan.nombre`), o dejan de nombrarla cuando no depende de
ella.

La tarea del cron pasa de `metricas-de-vercel` («Copia de Vercel Analytics») a
**`copia-de-visitas`** («Copia de las visitas»): no hay producción con
historial que perder, y el nombre ya no depende de la fuente. Sus archivos
(`datos/tareas/metricas-de-vercel.ts`, `consultas-de-vercel.ts`) se renombran
igual.

**El script.** El layout del sitio carga **uno solo**, en producción, según
dónde corre, con una función pura (`scriptDeAnalitica(entorno)`) y un test de
las combinaciones:

| Entorno | Script |
| --- | --- |
| `VERCEL` (lo pone Vercel en el build y en el runtime) | `<Analytics />` de `@vercel/analytics`, que pega a `/_vercel/insights`, que solo existe en Vercel |
| fuera de Vercel, con `UMAMI_WEBSITE_ID` | `<script defer src="/umami/script.js" data-website-id=…>`, que solo sirve Caddy |
| fuera de Vercel, sin `UMAMI_WEBSITE_ID` | ninguno |

Nunca los dos, y nunca uno que dé 404: el de Vercel fuera de Vercel no
existe, y `/umami/…` en Vercel tampoco (en Vercel, `VERCEL` manda aunque haya
variables de Umami). Caddy sirve `/umami/script.js` y
`/umami/api/send` desde el mismo dominio (el tracker arma el endpoint desde la
URL del script: `…/umami` + `/api/send`, verificado en `src/tracker/index.ts` de
v3.4.0). Todo lo demás de Umami —el panel, su login, su API— **no se publica**:
se entra por un túnel SSH (`docker compose run -p 127.0.0.1:3001:3000
analitica`, en el runbook). **La CSP no cambia**: el script y su `fetch` son del
mismo origen (`script-src 'self'`, `connect-src 'self'`); se prueba en el
navegador que no haya violaciones, y el comentario de `cabeceras.ts` lo dice.
**`@vercel/analytics` se queda**; no entra ninguna dependencia: Umami va por
`fetch`.

**Ajustes › Conexiones** muestra la fuente que corresponde: «Umami»
(`UMAMI_API_URL`, `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID`) si están sus variables o
si el sitio no corre en Vercel, y «Vercel Analytics» si corre en Vercel sin
Umami. El cron deja de ser «de Vercel». Los textos del admin que dicen «se
configuran en Vercel» pasan a «en el servidor» (Vercel o el `.env` del VPS).

**Tests.** El cliente de Umami con respuestas **grabadas de una instancia local
de Umami v3.4.0** (las del compose), como hizo la lane de métricas con Vercel:
las formas de `pageviews`, `metrics/expanded` y `stats`, la traducción de los
filtros y los errores. Y la copia de punta a punta en local: el sitio manda una
vista por Caddy, Umami la cuenta y «Actualizar ahora» / el cron la trae.

### 3.6 La IP real detrás de Caddy

- **Caddy, por defecto, ignora el `X-Forwarded-For` de un cliente que no está en
  `trusted_proxies` y pone la IP de la conexión** (docs de `reverse_proxy`,
  verificadas el 2026-09-27: «the proxy will ignore their values from incoming
  requests, to prevent spoofing»). No hay CDN delante, así que no se configura
  `trusted_proxies`. Pero `X-Real-IP` **sí pasa tal cual** y la leen
  `ipDelPedido` y better-auth como segunda opción: el `Caddyfile` la pisa con
  `header_up X-Real-IP {remote_host}`.
- La app confía en esas cabeceras porque **solo Caddy le habla**: `app` no
  publica puertos y está solo en la red interna. Queda escrito en
  `limite.ts`, en el `Caddyfile` y en el ADR; si alguna vez va un CDN delante,
  el runbook dice que se sume a `trusted_proxies`.
- **Prueba en local**: un pedido por Caddy con `X-Forwarded-For: 1.2.3.4` y
  `X-Real-IP: 1.2.3.4` falsificados no cambia la IP que ve la app (se mira en
  lo que cuentan el tope de un formulario y el bloqueo por cuenta, o en un log
  de la cabecera que llega).

### 3.7 Backups

- **Qué:** `pg_dump -Fc` de `ed` y de `umami`, más un `tar.gz` de `fotos` y
  otro de `cv`, en `./respaldos/<AAAA-MM-DD>/`, todos los días a las 03:30 UTC
  (antes del cron de las 04:00). **Retención: 14 días** (`DIAS_DE_RESPALDO`),
  lo que da dos semanas para notar un borrado sin llenar el disco de un VPS
  chico. Los CV respaldados heredan la retención de los CV: un CV borrado por
  la tarea de retención desaparece de los respaldos a los 14 días, y el runbook
  lo dice.
- **Dónde:** en el host, así se copian afuera (el runbook propone `rsync` o
  `rclone` a otro lado y los respaldos semanales de Hostinger). Un respaldo que
  vive solo en el mismo VPS no cubre perder el VPS, y se dice.
- **A mano y restaurar:** `docker compose exec respaldo /respaldo/respaldar.sh`
  y `docker compose run --rm respaldo /respaldo/restaurar.sh <fecha>` (para
  `app` y `analitica`, recrea las dos bases desde el dump, vacía y rellena los
  volúmenes de fotos y CV, y los vuelve a levantar).
- **Probado en local**: respaldar, borrar el volumen de la base y el de fotos,
  restaurar, y que las fotos y la base vuelvan.

### 3.8 Los dos caminos y la mudanza

El README y `docs/deploy/` cuentan los dos hosts:

- **Vercel** (`docs/deploy/vercel.md`): el proyecto con Root Directory
  `apps/sitio`, Neon, los dos stores de Blob (el de CV, privado), las variables
  y el cron de `vercel.json`.
- **VPS de Hostinger** (`docs/deploy/vps.md`): el runbook de abajo.
- **Mudanza de uno a otro** (una sección corta en los dos): la base con
  `pg_dump` y la restauración; los CV, que guardan la misma clave en Blob y en
  disco, se copian archivo por archivo; las fotos cambian de URL (Blob ↔
  `/api/fotos/<id>`) y hay que reescribir cada uso con el registro de
  `datos/fotos/`; y las variables. **El script que copia fotos y CV entre Blob
  y disco no entra en esta lane**: sin un token de Blob no se puede probar, y
  código de mudanza sin probar es peor que un procedimiento escrito. Queda
  anotado como seguimiento, con lo que tiene que hacer.

### 3.9 El runbook, `docs/deploy/vps.md`

De un VPS de Hostinger vacío (Ubuntu) al sitio andando: usuario sin root, SSH
con clave (y sin contraseña ni root), firewall con `ufw` (22, 80, 443) y la
advertencia de que Docker se saltea `ufw` en los puertos publicados (por eso
solo `proxy` publica), Docker Engine con su repo oficial, clonar, `.env` desde
el ejemplo, `scripts/desplegar.sh`. Umami: el túnel, cambiar la contraseña por
defecto, crear el sitio y la API key, y un segundo `desplegar.sh` para que el
script lleve el `UMAMI_WEBSITE_ID`. Nombrar a la primera cuenta que dirige
(`crear-cuenta` y `nombrar-direccion` por la imagen `fuente`). El DNS: el
dominio (A/AAAA al VPS), Resend (SPF, DKIM y DMARC, y el click tracking
apagado) y Search Console. Cómo se deploya una versión nueva, cómo se mira el
log, los backups, cómo se restaura y cómo se vuelve atrás. Si ya hay una base
con contenido en otro lado (Neon), cómo traerla con `pg_dump` y la
restauración. Al final, el recorrido del SPEC §11 del padre: entrar con segundo
factor, publicar una novedad, recibir un contacto y verla en el Inicio.

### 3.10 Los documentos

- **ADR-0018, «Deploy en Vercel o en un VPS: el código no depende del host»**:
  qué cambia del ADR-0005 (Neon y Vercel Blob dejan de ser los únicos: la base
  es cualquier Postgres y el disco es un destino de producción), del ADR-0009
  (Vercel Web Analytics deja de ser la única fuente: la copia elige su cliente)
  y del ADR-0011 (el cron de `vercel.json` sigue en Vercel; en el VPS lo llama
  un servicio; un solo cron que corre todas las tareas queda). Por qué el build necesita la base y por qué A
  frente a B, C y D; por qué Umami; por qué la app confía en la IP de Caddy.
- **AGENTS.md** §2 y §12, y los lugares que nombran Vercel Blob, Neon o Vercel
  como el host (§1 Quickstart, §3 el árbol —los archivos nuevos de la raíz,
  `deploy/` y los `scripts/` nuevos—, §5.8 si nombra el build, §13 las dos
  casillas de Vercel/CI). Mateo los revisa en el PR.
- **README**: getting started y deploy, con las dos secciones y la mudanza; la
  línea «cuando llegue la fase 1…» se va.
- **`apps/sitio/.env.example`**: las de Umami al lado de las de Vercel, cada una
  con el host en que se usa.

## 4. Tablas, dependencias, imágenes

- **Tablas:** ninguna. La lane no toca el esquema ni genera migraciones.
- **Dependencias:** ninguna entra ni sale.
- **Imágenes Docker** (no son dependencias del lockfile, pero se fijan por
  versión): `node:24-alpine`, `postgres:17-alpine` (la misma mayor que el
  `ed-postgres` de desarrollo), `caddy:2-alpine`, Umami v3.4.0, `alpine`.

## 5. Fuera de esta lane

- Provisionar el servidor real, el DNS, Resend y Search Console: son de Mateo,
  con el runbook.
- Los campos del CV y el texto de privacidad (ED); el CV sigue cerrado con
  `CV_ABIERTO` salvo en la prueba local.
- Sacar nada de Vercel: `vercel.json`, `@vercel/analytics`, Blob y el cliente
  de Vercel Analytics quedan, elegidos por variable.
- El script que copia fotos y CV entre Blob y disco (§3.8): seguimiento.
- Mostrar provincias o ciudades, o cualquier dimensión nueva de Umami.
- CI/CD (sigue en §13 de AGENTS.md) y los `scrub: true` del sitio.

## 6. Cómo se sabe que está

- **El gate**: `pnpm typecheck` en limpio, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` 100/100, `pnpm test` cinco veces
  seguidas y `pnpm build`.
- **`scripts/desplegar.sh` en local desde cero** (sin volúmenes ni imágenes),
  con `DOMINIO=localhost`:
  - el sitio y el admin por Caddy, con el certificado interno;
  - entrar con segundo factor (el correo va a la consola del `app`);
  - subir una foto y que siga después de `docker compose restart app`;
  - un CV guardado en su volumen privado, con `CV_ABIERTO=si` solo para la
    prueba;
  - el cron corrido a mano, con su salida en el log;
  - una vista contada por Umami y traída por la copia;
  - `X-Forwarded-For` y `X-Real-IP` falsificados no cambian la IP;
  - respaldo, borrar volúmenes, restaurar, y que vuelvan la base y las fotos;
  - `docker compose ps`: solo `proxy` con puertos;
  - ningún secreto en `.compilado/` ni en la imagen;
  - los segundos de corte de un segundo `desplegar.sh`, y `volver.sh` a la
    imagen anterior.
- **El test de `scriptDeAnalitica`**: Umami, Vercel, ninguno, y los dos
  configurados (gana Vercel en Vercel).
- **`scripts/comparar-render.mjs` contra `main`**: la única diferencia es el
  script de analítica (fuera de Vercel y sin `UMAMI_WEBSITE_ID`, ninguno, donde
  `main` ponía el de Vercel), explicada en PROGRESS.
