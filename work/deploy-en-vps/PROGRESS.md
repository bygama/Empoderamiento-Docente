# PROGRESS — deploy-en-vps

## In progress

- work-verify.

## Done

- 2026-09-27 — Worktree listo (`pnpm install`, `pnpm generate`, `.env.local`
  copiado). Relevado el código que toca la lane y la API de Umami v3.4.0.
  Decidida con el padre la forma del build (A, DECISIONS). SPEC escrito y
  aprobado por el padre con el cambio «Código para los dos»; PLAN escrito.
- 2026-09-27 — **Paso 1** (`8765bb9d`): `lib/metricas/cliente.ts` con
  `ClienteDeAnaliticas`, `ErrorDeAnaliticas` y `paisesDelFiltro`;
  `FiltroDePais` en `tipos.ts`; `vercel.ts` lo traduce con `filtroOData` (mismo
  OData que antes, mismos tests). `pnpm typecheck` → 0; `pnpm --filter sitio
  test` → 570 pass, 0 fail. Los tests ahora corren contra la base propia
  `ed_vps` (creada y migrada con `pnpm migrate:deploy`), no contra `ed`.
- 2026-09-27 — **Paso 2** (`d5dc85f4`): la tarea pasa a `copia-de-visitas`
  («Copia de las visitas»); `copia-de-visitas.ts`, `consultas-de-la-copia.ts` y
  sus referencias. Typecheck → 0; tests → 570 pass. `git grep
  "metricas-de-vercel" -- apps` solo encuentra la migración
  `20260926213050_busquedas_y_tareas`, que no se edita (una migración aplicada
  no se toca).
- 2026-09-27 — **Paso 3** (`96ef41cf`, y `8d9d59cb` para la salida del build):
  `Dockerfile` (targets `fuente` y `app`), `.dockerignore`,
  `deploy/construir.sh` y `next.config.ts` con `output: "standalone"` fuera de
  Vercel y `outputFileTracingRoot`. `docker build --target fuente` → 0 (1,51 GB);
  `pnpm build` local → 0.
- 2026-09-27 — **Paso 4** (`b77036eb`, `8d9d59cb`): `compose.yaml` (`db`,
  `migrar`, `construir`, `app`, `proxy`), `deploy/db/crear-bases.sh`,
  `deploy/Caddyfile`, `.env.example`, `scripts/desplegar.sh` y
  `scripts/volver.sh`. **Hallazgo:** la primera corrida falló al armar la
  imagen `app` desde `.compilado/`: los node_modules del standalone son symlinks
  de pnpm y en una carpeta compartida con Windows no sobreviven («The file cannot
  be accessed by the system»). Arreglo: `construir` saca el contexto como un
  tar por stdout y `desplegar.sh` lo pasa directo a `docker build -`; no queda
  nada del build en el host (DECISIONS). Segunda corrida (el volumen de la
  base y la imagen `fuente` venían de la primera; la imagen `app` no existía;
  la corrida desde cero de verdad va en la verificación): `bash scripts/desplegar.sh` → exit 0, «Listo:
  https://localhost corre 8d9d59cb471a». Por Caddy: `/` 200, `/novedades` 200
  (con la novedad de UNESCO que vino de la base: el prerender leyó la base),
  `/quienes-somos` 200, `/admin` 307 → `/admin/entrar`, `/_next/image` 200
  (sharp anda). `docker compose ps`: solo `proxy` publica
  (`0.0.0.0:80->80`, `443->443`, `443/udp`); `app` (3000/tcp) y `db` (5432/tcp)
  solo exponen, sin `->`.
- 2026-09-27 — **Paso 4b** (`037a2270`): `RESEND_API_URL` opcional
  (`urlDesviada`, `crearClienteDeResend({ url })`), el aviso en la fila de
  Resend de Conexiones (`Conexion.avisar`, cuenta como error) y en el log del
  arranque (`src/instrumentation.ts`), y `compose.prueba.yaml` con el servicio
  `correo`. Tests nuevos en `resend.test.ts` y `conexiones.test.ts`; `pnpm
  --filter sitio test` → 572 pass, 0 fail; typecheck y lint → 0.
- 2026-09-27 — **Paso 5** (`44bc4fda`): servicio `analitica` (Umami
  `ghcr.io/umami-software/umami:3.4.0`, base `umami`) y en el `Caddyfile` solo
  `/umami/script.js` y `/umami/api/send`. Por Caddy: `/umami/script.js` 200,
  `/umami/api/send` 405 a un GET (existe, pide POST), `/umami/api/websites`,
  `/umami/login` y `/umami/api/heartbeat` 404. **Hallazgo:** Caddy no relee su
  archivo solo, así que `desplegar.sh` suma `caddy reload` al final.
- 2026-09-27 — **Paso 6** (`e0a73857`): `lib/metricas/umami.ts` y
  `mapear-umami.ts`, con respuestas grabadas en `__fixtures__/umami/` (sin la
  API key ni el id del sitio: `grep` vacío). Para grabarlas: sitio y API key
  creados por la API de Umami desde adentro de la red (`/api/auth/login`,
  `/api/websites`, `/api/me/api-keys`) y cinco vistas mandadas por Caddy a
  `/umami/api/send` con un User-Agent de navegador. Lo que mostraron: en
  `/metrics/expanded` las vistas vienen como texto («"3"») y los visitantes como
  número; `x` de `/pageviews` viene en ISO («2026-09-27T21:00:00Z»); y
  `country=neq.CL,MX,AR` deja afuera las visitas sin país (en local no hay país:
  `[]`), igual que el `not in` de Vercel. `pnpm --filter sitio test` → 581
  pass, 0 fail.
- 2026-09-27 — **Paso 7** (`8e84e524`): `fuenteDeVisitas()` /
  `fuenteEsperada()` / `clienteDesdeEntorno()` en `lib/metricas/entorno.ts`;
  `PLANES_DE_LA_FUENTE` en `config/metricas.ts` (solo datos: lo importan
  componentes del navegador) y `planDeLaFuente()` en
  `datos/fuente-de-visitas.ts`; la copia, las cifras, Links para compartir,
  Origen, Conexiones (`mostrar`: una sola fuente) y los textos «de Vercel» del
  admin. Los tests de la copia con base fijan el plan de Vercel (prueban la
  ventana de 30 días) y uno nuevo prueba el de Umami. Una corrida con el plan
  equivocado había dejado 6 ventanas de prueba en `ed_vps`; se borraron.
  Typecheck → 0, `pnpm --filter sitio test` → 584 pass, lint → 0, `git grep
  PLAN_DE_VERCEL` vacío.
- 2026-09-27 — **Paso 8** (`bf145ebe`): `scriptDeAnalitica` con su test (4
  combinaciones) y `components/layout/Analitica.tsx` en el layout; comentario
  de la CSP. Tests → 587 pass; `verificar-react-doctor.mjs` → 100/100. En el
  compose (deploy `2daf9e898a3e`): el HTML de `/` trae `<script defer
  src="/umami/script.js" data-website-id="…">` y 0 apariciones de `_vercel`.
- 2026-09-27 — **Paso 9** (`0f73e322`): `header_up X-Real-IP {remote_host}` en
  las dos rutas del `Caddyfile` y `CLIENT_IP_HEADER: x-real-ip` en Umami (sin
  eso toma la primera de una lista que incluye `CF-Connecting-IP`). Prueba por
  Caddy: cuatro intentos de login, cada uno con `X-Forwarded-For`, `X-Real-IP`
  y `CF-Connecting-IP` falsificados distintos (1.2.3.4, 5.6.7.8, 9.9.9.9,
  8.8.4.4) → 401, 401, 401, **429**; la tabla `rateLimit` tiene una sola clave,
  `172.18.0.1|/sign-in/email|3` (la IP de la conexión). Control, directo a
  `app:3000` desde otro contenedor con `X-Forwarded-For: 1.2.3.4` → aparece la
  clave `1.2.3.4`: la app confía en la cabecera, y por eso solo Caddy le habla.
- 2026-09-27 — **Paso 10** (`2daf9e89`): servicio `cron` (`node:24-alpine`,
  busybox `crond`, `0 4 * * *` en UTC) con `deploy/cron/correr.mjs`. A mano
  (`docker compose exec cron node /etc/ed-cron/correr.mjs`): la respuesta
  entera en el log, 500 porque Search Console no está configurado (esperado) y
  `copia-de-visitas` ok. **Copia de punta a punta:** las vistas de hoy no las
  trae (la copia nunca toma el día en curso), así que se corrió su fecha a
  ayer en la base de Umami (`UPDATE website_event … - interval '1 day'`) y se
  corrió el cron: «Del 2026-08-28 al 2026-09-26: 30 días, 15 filas, 6
  ventanas», con páginas, referidos (google.com, linkedin.com), dispositivo,
  sistema, navegador, hora, la campaña `prueba-local` y las ventanas de 7, 30
  y 90 días.
- 2026-09-27 — **Entrar con segundo factor, foto y CV en el compose** (con
  `compose.prueba.yaml`: `COMPOSE_FILE` en el `.env` local). **Hallazgos:**
  compose interpola `${…}` también adentro del comando del Resend falso
  (`0c7dd20c`); los comandos de `scripts/` necesitan el entorno entero de la
  app, así que se sumó el servicio `herramientas` (perfil propio);
  `prueba@localhost` no pasa la validación de correo de better-auth; y el
  navegador embebido de Orca se queda en el aviso del certificado interno de
  Caddy (`ERR_CERT_AUTHORITY_INVALID`, el CLI no tiene cómo aceptarlo, y
  `snapshot`/`eval` cortan la conexión con el runtime), así que el flujo se hizo
  por HTTP contra las mismas rutas que usa el navegador. Al arrancar, el log de
  `app` dice «[correo] Los correos van a http://correo:3000/emails, no a
  Resend…». Recorrido: `crear-cuenta prueba@ed.test … administra` por
  `herramientas` → `POST /api/auth/request-password-reset` 200 → el enlace en
  el log de `correo` → `reset-password` 200 → `sign-in/email` 200
  `{"twoFactorRedirect":true,"twoFactorMethods":["otp"]}` → `two-factor/send-otp`
  200 → el código de 6 dígitos en el log de `correo` → `verify-otp` 200 → `GET
  /admin` 200 con «Prueba Local». **Foto:** la Server Action `subirFoto` (id
  del `server-reference-manifest.json` de la imagen) con la sesión, por Caddy →
  `{"ok":true,…"src":"/api/fotos/87917126-…"}`, el archivo en el volumen `fotos`
  (dueño `node`) y la fila con `subidaPor = Prueba Local`. (Un detalle del
  protocolo de React 19.2: la raíz `0` va después de los campos `_1_…`, como la
  arma el navegador.) `/api/fotos/<id>` → 200, 11 906 bytes; **después de
  `docker compose restart app`**, 200 y `cmp` idéntico al archivo subido. **CV:**
  con `CV_ABIERTO=si` solo para la prueba, `POST /api/cv` por Caddy → `{"ok":true}`;
  el PDF en `/app/apps/sitio/.cv/cv/094ba75c-….pdf` (volumen `cv`) y la fila en
  `mensajes` (bandeja `cv`); por la web no se llega a `.cv`.
- 2026-09-27 — **Paso 11** (`623788df`): servicio `respaldo`
  (`postgres:17-alpine`, `30 3 * * *`), `deploy/respaldo/respaldar.sh` y
  `restaurar.sh`, y `scripts/restaurar.sh` (pide escribir «restaurar»). Prueba:
  `docker compose exec respaldo sh /respaldo/respaldar.sh` → `respaldos/2026-09-27/`
  con `ed.dump` (114 KB), `umami.dump` (66 KB), `fotos.tar.gz` y `cv.tar.gz` (con
  el PDF). Después `docker compose down` y `docker volume rm ed_datos-db
  ed_fotos`; `up -d db` → la base `ed` con 0 tablas. `echo restaurar | bash
  scripts/restaurar.sh 2026-09-27` → exit 0. Volvieron: la foto por Caddy (200,
  `cmp` idéntico), la fila de la foto, el CV (fila y archivo), las 9 novedades,
  las 2 cuentas, Umami (1 sitio, 5 eventos) y hasta la sesión de antes (`GET
  /admin` 200 con la misma cookie).
- 2026-09-27 — **Mediciones para el runbook** (padre, «se usa todo lo del
  VPS»). Memoria, con `docker stats` cada ~2 s: `construir` con las 32 CPUs de
  esta máquina, pico 5,25 GiB; con `cpuset: "0,1"` (2 CPUs, como un KVM 2),
  pico 5,05 GiB en 59 s (lo pesado es Turbopack, no los workers); con 2 CPUs y
  `mem_limit: 3g`, **exit 137** (OOM). El compose en marcha: app 115 MiB, Umami
  145, Postgres 53, Caddy 12, el resto <1 (≈350 MiB). → KVM 2 (8 GB) alcanza;
  KVM 1 (4 GB) con 4 GB de swap. Un reintento falló por red: `next/font/google`
  baja las fuentes en el build (Turbopack lo dice como «Can't resolve
  '@vercel/turbopack-next/internal/font/google/font'»): el build necesita
  internet. Disco: `ed` 9,7 MB, `umami` 9,4 MB, un respaldo 197 KB; imágenes
  `ed-fuente` 1,51 GB, `ed-sitio` 384 MB, Umami 1,47 GB, `postgres:17-alpine`
  424 MB; caché de build 2,4 GB. Hostinger (verificado en su ayuda, actualizada
  el 2026-09-15, y en la página de planes): backup semanal gratis en todos los
  KVM, dos semanales guardados fuera del servidor, diario pago; un snapshot
  manual que vence al día; restaurar pisa el VPS entero. KVM 1: 1 vCPU, 4 GB,
  50 GB; KVM 2: 2 vCPU, 8 GB, 100 GB.
- 2026-09-27 — **Corte de un deploy** (condición 4 del padre): `desplegar.sh`
  completo con `curl` a `https://localhost/` cada ~0,6 s: 87 sondeos, 2 sin 200
  (un `000` por el tope de 2 s y un `502`); entre la última respuesta buena y la
  siguiente, **5,3 s**. `volver.sh 2daf9e898a3e` y de vuelta `62868041a6a0`: el
  contenedor corre exactamente la imagen pedida (`sha256:5829759b3540…` y
  `sha256:f3a8caa77cbf…`), el sitio 200; con una versión que no existe, exit 1 y
  la lista (`2e380801` saca `actual` de la lista). El panel de Umami del
  runbook (`docker compose run --rm -d --name ed-panel-umami -p
  127.0.0.1:3001:3000 analitica`): `/api/heartbeat` 200 y `/login` 200 en
  `127.0.0.1:3001`; `docker stop` lo borra.
- 2026-09-27 — **Paso 12** (`7c41bb6c`, `62868041`): ADR-0018 («Deploy en
  Vercel o en un VPS: el código no depende del host»), en el índice, y el 0005,
  el 0009 y el 0011 marcados como ampliados por él.
- 2026-09-27 — **Paso 13** (`d7924a59`): `docs/deploy/vps.md` y
  `docs/deploy/vercel.md`, y el índice de `docs/README.md`. Cada script y
  servicio que nombran existe (chequeo con `[ -f ]` y `grep "^  <servicio>:"`
  sobre `compose.yaml`: los diez archivos y los nueve servicios).
- 2026-09-27 — **Paso 14** (`7e76530f`, `6a5ce63a`): README (lo de arriba,
  variables, Deploy con los dos caminos, Métricas, el cron, los CV y
  Conexiones), `apps/sitio/.env.example` (Umami al lado de Vercel) y AGENTS.md
  §1, §2, §3, §12 y §13. `git grep "cuando llegue la fase 1"` vacío; `pnpm lint`
  → 0.
