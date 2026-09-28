# PROGRESS — deploy-en-vps

## In progress

- **Cerrando: PR #198** (https://github.com/bygama/Empoderamiento-Docente/pull/198),
  sin mergear. La revisión r2 dio PASS sobre `97c1e7f7`; la **ronda de
  cierre** (abajo, «Verification») hizo los tres arreglos que pidió el padre,
  el rebase sobre `origin/main` (`e8b269f1`) y el gate. El commit siguiente a
  este borra `work/deploy-en-vps/`; lo que sobrevive a la carpeta (los
  seguimientos, la memoria del build y lo que el runbook deja para Mateo) va
  en el `worker_done` al padre.
- **Estado local:** el compose de prueba está abajo, sin sus volúmenes
  (`ed_datos-db`, `ed_fotos`, `ed_cv`, `ed_caddy-datos`, `ed_caddy-config`),
  sin sus imágenes (`ed-sitio:*`, `ed-fuente:actual`, Umami, Caddy,
  `node:24-alpine`, `postgres:17-alpine`, y las de prueba `alpine:3.22` y
  `ubuntu:24.04`), sin el `.env` de la raíz y sin `respaldos/`. Quedan la
  base `ed_vps` de `ed-postgres` (la de los tests de esta lane) y la caché de
  build de Docker.

## Verification

### 2026-09-27 — Ronda de cierre — PASS

r2 dio PASS sobre `97c1e7f7`. Lo que pidió el padre para antes del merge:

- **El script de Vercel sin el token** (`d221a497` después del rebase): en
  Vercel carga aunque falten el token y el proyecto, que son solo de la copia;
  la copia y Conexiones siguen pidiéndolos, y Conexiones, en Vercel sin
  token, dice «Falta la copia y Métricas no se actualiza, pero las visitas se
  están contando». Tests: `script.test.ts` (Vercel con token, sin token y con
  Umami a medias → el de Vercel), `entorno.test.ts` (`{ VERCEL }` y `{ VERCEL,
  VERCEL_TOKEN }` → sin copia) y `conexiones.test.ts` (la fila, sin error);
  20/20 en los cuatro archivos. SPEC, DECISIONS, `vercel.md`, README,
  `.env.example` y ADR-0018 alineados.
- **La IP fuera del runbook** (`47826ab9`): `git grep "2\.24\.68\.136\|<ip>"`
  vacío; `<IP del VPS>` en los 12 lugares. La IP sigue en la historia de la
  rama (el commit del SSH de la ronda 1).
- **AGENTS.md §5.8** (`19f9d905`): el chequeo del bit en la lista del
  `pre-push`. Es meta-doc: lo revisa Mateo en el PR.
- **Rebase** sobre `origin/main` (`e8b269f1`, solo `work/mapa-del-admin/`): sin
  conflictos, 44 commits; los siete `.sh` siguen en `100755`.
- **El gate, después del rebase:** `tsconfig.tsbuildinfo` borrado y `pnpm
  typecheck` → exit 0; `pnpm lint` → exit 0; `node
  scripts/verificar-react-doctor.mjs` → exit 0, «100/100, sin diagnósticos»
  (apps/sitio/src 1207 archivos, packages/db 3, auth 27, kit-admin 52); `pnpm
  build` → exit 0, «Generating static pages … (68/68)»; `pnpm test` cinco
  veces → exit 0 las cinco, kit-admin 11/11, auth 46/46, sitio 595 pass + 1
  skipped (el fixture de Vercel de siempre), 0 fail. Arranque: `next start`
  sobre ese build → `/`, `/novedades` y `/admin/entrar` 200.
- **El compose de prueba, abajo** («Estado local», arriba).

### 2026-09-27 — Ronda de arreglos 1 — PASS

Los hallazgos de r1 (FAIL: dos Important y uno plausible, más los Minor 4, 6,
7, 8, 9 y 11), un commit por arreglo, cada uno pusheado al tenerlo (`b8fd502f`
a `99cb62f7`). El 5 y el 10 quedan como estaban (el padre). Decisiones, en
DECISIONS («Ronda de arreglos 1»).

- **1, scripts ejecutables** (`b8fd502f`, `efb92d08`, `8baf86c7`): los siete
  `.sh` de `scripts/` y `deploy/` en `100755`, y el `pre-push` frena si uno
  queda sin el bit. En Linux, desde `git archive` (los modos del índice, como
  los deja un clon en Ubuntu), `./scripts/restaurar.sh`:
  - en `d2546399`: `-rw-rw-r--` y `sh: ./scripts/restaurar.sh: Permission
    denied`, exit 126;
  - en HEAD: `-rwxrwxr-x` los siete, y corre (`Uso: … Los que hay: (ninguno)`,
    exit 2; antes del `8baf86c7` salía con 1 por `pipefail` sin llegar a su
    `exit 2`).
  - El chequeo del hook, en rojo (`update-index --chmod=-x` sobre dos) → «sin
    el bit de ejecucion: deploy/db/crear-bases.sh», «…: scripts/volver.sh»,
    `fallo=1`; en verde → «todos con el bit», `fallo=0`.
- **2, `restaurar.sh`** (`7d5cac01`, `0ff59c43`): levanta `db`, restaura y
  termina con `desplegar.sh`. Escenario del SPEC: respaldo a mano, `docker
  compose down`, `docker volume rm ed_datos-db ed_fotos ed_cv`, `echo restaurar
  | bash scripts/restaurar.sh 2026-09-27` → **exit 0 en 87 s**: crea
  `ed_datos-db` (el log de `db`: «running
  /docker-entrypoint-initdb.d/crear-bases.sh»), `[restaurar] la base ed … la
  base umami … los archivos de fotos … de cv … listo`, el sitio vuelve con la
  imagen de antes y el deploy termina en «Listo: https://localhost corre
  8baf86c7ed8f». Antes y después: novedades 9/9, fotos 63/63, mensajes 1/1,
  cuentas 1/1, sesiones 1/1, eventos de Umami 3/3; la foto subida por Caddy,
  200 y `cmp` idéntico (sha256 `e3778e4b…`); el CV en `.cv/cv/`; `.fotos` y
  `.cv` de `node` y `node` escribe en `.fotos`.
  - **VPS nuevo** (lo mismo, más `docker rmi` de las tres `ed-sitio:*`, sin
    ninguna imagen del sitio) → **exit 0 en 71 s**, sin el `up` intermedio, el
    deploy desde la base restaurada; `/`, `/novedades` (con la de UNESCO) y
    `/admin/entrar` 200, la foto con el mismo sha256, el CV, 9 novedades.
  - El runbook (§8) dice cómo restaurar en un VPS nuevo desde la copia de
    afuera, y que se guarde el `.env` fuera del VPS.
- **3, SSH** (`57ae883e`): en `ubuntu:24.04` con `openssh-server`, un
  `50-cloud-init.conf` con `PasswordAuthentication yes` y `sshd_config` editado
  → `sshd -T`: `permitrootlogin no`, **`passwordauthentication yes`**; con los
  comandos del runbook (`00-ed.conf` y el `sed` sobre `sshd_config.d/`) →
  `sshd -t` ok, `permitrootlogin no`, `passwordauthentication no`. El runbook
  suma cargar la clave (`ssh-copy-id` o el pipe de PowerShell, o el panel), la
  verificación y probar en otra terminal antes de cerrar la sesión de root.
- **4, nombres de imagen** (`fa5a7031`): `<proyecto>-fuente` y
  `<proyecto>-sitio`. `docker compose config --no-interpolate` → `ed`; con
  `COMPOSE_PROJECT_NAME=ed-prueba` → `ed-prueba`, y las imágenes
  `ed-prueba-fuente:actual` y `ed-prueba-sitio:actual`. `desplegar.sh` en HEAD
  → exit 0 en 75 s, «Listo: https://localhost corre 99cb62f770e8», la poda
  lista `ed-sitio` y nada más; `volver.sh 8baf86c7ed8f` y de vuelta
  `99cb62f770e8` → el contenedor corre exactamente la imagen pedida
  (`b385ec67…`, `5f9b14ef…`), `/` 200; una que no existe → exit 1 y la lista.
- **6, standalone solo fuera de Vercel** (`99cb62f7`): en DECISIONS y en el
  ADR-0018.
- **7 y 8, una sola regla para la fuente** (`cd511f72`, `99cb62f7`):
  `fuenteDeVisitas` la usan el script, la copia y Conexiones; Conexiones avisa
  Umami en Vercel. Tests nuevos: `entorno.test.ts` (5: solo las de Vercel en
  Vercel → Vercel y el cliente le pide a `https://api.vercel.com`; los dos
  juegos → Umami y le pide a `http://analitica:3000`; las de Vercel fuera de
  Vercel → ninguna), `script.test.ts` (4) y el aviso en `conexiones.test.ts`.
  En el compose (deploy `99cb62f770e8`, con las tres de Umami): el HTML de `/`
  trae `<script defer="" src="/umami/script.js" data-website-id="…">` y 0
  `_vercel`. SPEC §3.5 y §6 alineados.
- **9, las fuentes de Google**: el runbook (§4 y §7) dice que se vuelve a correr
  `desplegar.sh`.
- **11, la base `postgres`** (`230cf0e1`): en la base recreada desde cero,
  `ed → postgres` y `umami → postgres`: «FATAL: permission denied for database
  "postgres"»; `ed → ed` y `umami → umami`: 1; `ed → umami`: denied.
- **El gate:** typecheck en limpio (los `.tsbuildinfo` borrados antes) → exit
  0; `pnpm test` cinco veces seguidas → exit 0 las cinco, cada una kit-admin
  11/11, auth 46/46, sitio 594 pass + 1 skipped (el fixture de Vercel de
  siempre), 0 fail; lint, react-doctor 100/100 y typecheck, en el `pre-push` de
  cada uno de los seis push, «Todo en verde».

### 2026-09-27 — L DoD — PASS

- **L1 estática:** `pnpm typecheck` → exit 0; `pnpm lint` → exit 0;
  `node scripts/verificar-react-doctor.mjs` → exit 0, «react-doctor: 100/100,
  sin diagnósticos» (apps/sitio/src 1206 archivos, packages/db, auth y
  kit-admin).
- **L2 comportamiento:** `pnpm test` cinco veces seguidas → exit 0 las cinco,
  cada una kit-admin 11/11, auth 46/46, sitio 587 pass + 1 skipped (el fixture
  de Vercel que nunca se grabó, de antes de esta lane), 0 fail; `pnpm build` →
  exit 0 («Generating static pages … (68/68)»).
- **L3 punta a punta, `docker compose` desde cero** (sin volúmenes ni imágenes
  del proyecto `ed`, sin respaldos; `docker compose down -v`, `docker rmi` de
  `ed-sitio:*` y `ed-fuente:*`): `bash scripts/desplegar.sh` → exit 0 en 99 s,
  «Listo: https://localhost corre abf4351b761f». Umami configurado por su API
  (sitio y API key) y un segundo `desplegar.sh` → exit 0. Después, `/tmp/e2e.sh`:
  - por Caddy, `/`, `/novedades`, `/quienes-somos` y `/admin/entrar` → 200; el
    HTML de `/` trae `src="/umami/script.js"` (1) y `_vercel` (0);
  - cuenta `administra` por `herramientas`, contraseña por el enlace del Resend
    falso, `sign-in` → `twoFactorRedirect`, el código del correo, `verify-otp`
    → 200 y `GET /admin` 200 con «Prueba Local»;
  - foto por la Server Action `subirFoto` → `"ok":true`; `/api/fotos/<id>` 200
    antes y **después de `docker compose restart app`**, con los mismos bytes;
  - CV con `CV_ABIERTO=si` (solo para la prueba, después se volvió a vaciar)
    → `{"ok":true}` y el PDF en `/app/apps/sitio/.cv/cv/…pdf`;
  - tres vistas a `/umami/api/send` por Caddy → 200; corridas a ayer en la base
    de Umami; **el cron a mano** → `copia-de-visitas` ok, «9 filas, 6
    ventanas», con la página, el total y la campaña `prueba-local`;
  - cuatro logins con `X-Forwarded-For` y `X-Real-IP` falsificados distintos →
    401, 401, 401, **429**, y la única clave del tope es
    `172.18.0.1|/sign-in/email|3`;
  - respaldo a mano → «listo: /respaldos/2026-09-27, 192.0K»; `docker compose
    down`, `docker volume rm ed_datos-db ed_fotos`, la base con 0 tablas,
    `scripts/restaurar.sh 2026-09-27` → la foto 200 con los mismos bytes, la
    fila de la foto, el CV, las 9 novedades, las 9 filas de métricas y la
    sesión de antes (`GET /admin` 200);
  - `docker compose ps`: solo `proxy` tiene `->` (80, 443, 443/udp); `app`,
    `db`, `analitica` y `respaldo` solo exponen.
- **Ningún secreto en las imágenes** (condición 3): para cada valor de
  `CLAVE_DB_ADMIN`, `CLAVE_DB_ED`, `CLAVE_DB_UMAMI`, `BETTER_AUTH_SECRET`,
  `CRON_SECRET`, `UMAMI_API_KEY` y `UMAMI_APP_SECRET`, en `ed-sitio:actual` y
  `ed-fuente:actual`: `grep -rlF` en `/app` → 0 archivos, `docker history
  --no-trunc` → 0, `Config.Env` → 0; ningún `.env*` en la imagen. Control
  positivo: el `UMAMI_WEBSITE_ID` (público, va en el HTML) aparece en 40
  archivos de `ed-sitio`.
- **Corte de un deploy** (condición 4): 5,3 s (arriba, «Corte de un deploy»).
- **`node scripts/comparar-render.mjs <main> apps/sitio`** → exit 0, «12
  páginas, render idéntico», +0 bytes de JS (main armado con `git archive main`
  en una carpeta temporal, con la misma base). La diferencia del script de
  analítica no se ve en el render porque ninguno de los dos builds corre en
  Vercel ni tiene `UMAMI_WEBSITE_ID`: en `main` el payload del layout lleva el
  `<Analytics />` de Vercel (el `index.html` pesa 344 bytes más), que fuera de
  Vercel pide `/_vercel/insights/script.js` y da 404; en la rama no se
  renderiza nada. Con `UMAMI_WEBSITE_ID` (el compose), el HTML trae el script de
  Umami (arriba). El chunk de `@vercel/analytics` sigue referenciado en los dos
  builds porque el módulo lo importa.
- **No probado:** el tracker de Umami corriendo en un navegador de verdad. El
  navegador embebido de Orca se queda en el aviso del certificado interno de
  Caddy (`ERR_CERT_AUTHORITY_INVALID`), el CLI no tiene cómo aceptarlo y no se
  instaló la CA de Caddy en la máquina. La vista se mandó con el mismo pedido
  que arma el tracker (`POST /umami/api/send`), por Caddy; que el script se
  sirve (`/umami/script.js` 200) y que arma su endpoint desde su propia URL
  está verificado en su código (`src/tracker/index.ts` de v3.4.0).
- **Revisión de cierre:** la lanza el padre al recibir `worker_done`
  (orchestrate, paso 6); no se abrió ningún asiento acá.

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
- 2026-09-27 — **work-verify** (arriba, «Verification»): SPEC al día con lo
  que cambió en la lane (el tar en lugar de `.compilado/`, una sola red,
  `herramientas`, `compose.prueba.yaml`, el cron en `node:24-alpine`,
  `scripts/restaurar.sh`), cada cambio con su entrada en DECISIONS.

## Seguimientos (fuera de esta lane)

- **El script de mudanza de archivos** entre Blob y disco: las fotos cambian de
  URL (reescribir cada uso con `datos/fotos/`), los CV se copian con la misma
  clave. Sin token de Blob no se podía probar (DECISIONS). Mientras tanto, el
  procedimiento está en `docs/deploy/vps.md` §10.
- **El tracker de Umami en un navegador real**, cuando haya un dominio con
  certificado de verdad (el recorrido final del runbook lo cubre).
- **La memoria del build** (~5 GB, Turbopack): un VPS de 4 GB necesita swap.
  Si molesta, probar `next build --webpack` o limitar el prerender.
- **`www.`**: el `Caddyfile` atiende solo `DOMINIO`; si ED quiere `www.`, se
  suma como redirección.
- **Un fixture de Vercel** (`__fixtures__/pagina-por-dia.json`) sigue sin
  grabarse: su test se saltea desde la lane de métricas.
