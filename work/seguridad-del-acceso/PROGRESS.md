# PROGRESS — Seguridad del acceso

- **Rama:** `mateo/seguridad-del-acceso` (sobre `main` `275518e`)
- **Worktree:** propio (lane 2 del XL `mapa-del-admin`), dev server en el
  puerto 3012, base `ed_seguridad` en `ed-postgres`
- **Spec:** [`SPEC.md`](SPEC.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `275518e`:

- `packages/auth/src/config.ts`: scrypt (default de better-auth), sesión de 7
  días, rate limit en memoria con la regla inerte de `/forget-password`, sin
  bloqueo por cuenta, tokens de verificación en claro, cookies `SameSite=Lax`.
- `apps/sitio/src/datos/auth.ts`: el enlace del reset sale por la consola con
  clave de Resend o sin ella.
- `apps/sitio/src/middleware.ts`: una CSP para todo, con `'unsafe-inline'` en
  `script-src`; sin COOP, CORP ni `X-Frame-Options`.
- `abrirVistaPrevia`: `draftMode().enable()` sin tocar la cookie.

## In progress

- Paso 11 del PLAN (ADR-0010 y el spec del admin §7).

## Hecho

- 2026-09-26 — Worktree listo: `pnpm install`, `.env.local` copiado y apuntado
  a `ed_seguridad`, `pnpm migrate:deploy` (6 migraciones) y `pnpm generate`.
- 2026-09-26 — SPEC.md escrito desde el diseño aprobado el 2026-09-22;
  aprobado por el padre el mismo día (DECISIONS). PLAN.md en 13 pasos.
- 2026-09-26 — **Paso 1, Argon2id con rehash al entrar.** `@node-rs/argon2`
  `^2.2.1` y `tsx` (dev, script `test`) en `packages/auth`;
  `contrasenas.ts` (hashear, verificar Argon2id o scrypt, necesitaRehash) con
  5 tests; `ganchos.ts` (el `after` de `/sign-in/email` rehashea en segundo
  plano); `config.ts` usa los dos; `crearAuth` sale por `@ed/auth/servidor`
  (DECISIONS). `pnpm --filter @ed/auth test` → 5/5, exit 0; `pnpm typecheck`
  y `pnpm lint` → exit 0. De punta a punta en el dev server: una cuenta con
  hash scrypt entra (200) y su `account.password` pasa a
  `$argon2id$v=19$m=19456,t=2,p=1$…`; vuelve a entrar con Argon2id (200) y una
  contraseña mala da 401.
- 2026-09-26 — **Paso 2, el rate limit en la base.** Modelo `RateLimit`
  (`@@map("rateLimit")`) y la migración `20260926202715_rate_limit_en_la_base`;
  `rateLimit.storage: "database"`, sin la regla de `/forget-password`.
  `pnpm migrate:status` → «Database schema is up to date!» (7 migraciones);
  `pnpm typecheck` → exit 0. En el dev server, cuatro `POST
  /api/auth/sign-in/email` desde `X-Forwarded-For: 10.0.0.1` → `401 401 401
  429`, y `"rateLimit"` tiene `10.0.0.1|/sign-in/email | 3`. Ojo: Prisma 7 no
  regenera el cliente en `migrate dev`, y better-auth valida el esquema contra
  el cliente cargado: después de migrar hace falta `pnpm generate` y
  reiniciar el dev server (el cliente vive en `globalThis` entre recargas).
- 2026-09-26 — **Paso 3, el bloqueo por cuenta.** `packages/auth/src/bloqueo.ts`
  (reglas, escalera, HMAC, el 429) con 7 tests; `ganchos.ts` suma el `before`
  (cuenta frenada → 429 antes de mirar la contraseña) y el `after` (401 cuenta
  y poda en segundo plano; entrar bien borra la fila) y exporta `destrabar`,
  que `onPasswordReset` llama; `crearAuth` recibe `bloqueos`. Modelo
  `BloqueoDeAcceso` y la migración `20260926203107_bloqueos_de_acceso`;
  `apps/sitio/src/datos/bloqueos-de-acceso.ts` (fila bloqueada con
  `FOR UPDATE` en una transacción) con 2 tests de integración.
  `pnpm --filter @ed/auth test` → 12/12; `pnpm --filter sitio test` → 76 pass,
  1 skip (el de A1 de métricas, de antes), incluidos «diez fallos al mismo
  tiempo cuentan diez» y «podar borra lo quieto y deja lo frenado»;
  `pnpm typecheck` y `pnpm lint` → exit 0. De punta a punta, una IP distinta
  por intento: `prueba@ed.test` → `401 ×5, 429`; `fantasma@ed.test` (no
  existe) → `401 ×5, 429`; la contraseña buena, frenada → 429. El cuerpo del
  429 del bloqueo y el del rate limit son el mismo
  (`{"message":"Too many requests. Please try again later."}`), con
  `x-retry-after: 900` y `60`. Un reset completo borró la fila de
  `prueba@ed.test` y entró con la contraseña nueva (200); la de `fantasma`
  sigue.
- 2026-09-26 — **Paso 4, el cliente de Resend.**
  `apps/sitio/src/lib/correo/resend.ts` (`crearClienteDeResend({ clave,
  fetchImpl, espera })` → `mandar(correo)`; `ErrorDeCorreo` con el estado y el
  mensaje de Resend, nunca el cuerpo enviado) y 6 tests con el `fetch`
  inyectado: cabeceras y cuerpo, 5xx y red se reintentan una vez con la misma
  `Idempotency-Key`, el corte por `espera`, 4xx sin reintento, el error sin el
  enlace. `pnpm --filter sitio test` → 82 pass, 1 skip (A1), exit 0;
  `pnpm typecheck` y `pnpm --filter sitio lint` → exit 0.
- 2026-09-26 — **Paso 5, los correos de la contraseña.**
  `apps/sitio/src/correos/`: `plantilla.ts` (HTML escapado + texto, colores de
  los tokens en hex), `elegi-tu-contrasena.ts`, `tu-contrasena-cambio.ts` y
  `mandar.ts` (Resend con clave; consola sin clave fuera de producción; en
  producción sin clave, un error sin enlace ni destinatario), con 5 tests.
  `crearAuth` recibe `segundoPlano` (→ `advanced.backgroundTasks.handler`),
  `avisarCambioDeContrasena` (lo manda `onPasswordReset` en segundo plano) y
  le pasa `minutosDeVigencia` al reset; `datos/auth.ts` los arma con `after()`.
  `CORREO_REMITENTE` y `RESEND_API_KEY` en `.env.example`. `pnpm --filter sitio
  test` (correos) → 5/5; `pnpm typecheck` y `pnpm lint` → exit 0. En el dev
  server sin clave: «Olvidé mi contraseña» para `otra@ed.test` imprimió
  «Elegí tu contraseña» entero (enlace, «vence en 1 hora»), el correo
  inexistente no imprimió nada y contestó lo mismo; elegir la contraseña
  imprimió «Tu contraseña cambió» con el enlace a
  `/admin/olvide-mi-contrasena`.
- 2026-09-26 — **Paso 6, tokens hasheados.** `verification: {
  storeIdentifier: "hashed" }`. `pnpm typecheck` → exit 0. En el dev server,
  con `verification` vacía: un reset nuevo deja una fila cuyo `identifier` no
  contiene el token del enlace impreso (es un hash entero, sin el prefijo
  `reset-password:`); el enlace sigue sirviendo (302 a
  `/admin/nueva-contrasena?token=…`, `POST /reset-password` → 200) y una
  segunda vez da 400 `INVALID_TOKEN`.
- 2026-09-26 — **Ruling del padre: el rebote en el proxy** reemplaza la
  consulta al cargar de `FormularioEntrar` (react-doctor frenó
  `router.replace` en el efecto con `nextjs-no-client-side-redirect`, y el
  `redirect()` en el render con `rerender-state-only-in-handlers`; 92/100 y
  97/100). Condiciones en DECISIONS; el paso 9 se adelanta al 7.
- 2026-09-26 — **Paso 9 (adelantado), `middleware.ts` → `proxy.ts`.** `git mv`,
  `export function proxy`, y los comentarios que decían «middleware» o «Edge»
  en `guarda.ts` y `datos/acciones/` al día. `pnpm typecheck` → exit 0; `curl
  -I http://localhost:3012/admin` → `307` a `/admin/entrar` con las mismas
  cabeceras de antes; el dev server ya no avisa «The "middleware" file
  convention is deprecated».
- 2026-09-26 — **Paso 7, sesión y cookies.** `config.ts`: `expiresIn` 12 h,
  `updateAge` 1 h, `freshAge` 10 min, `revokeSessionsOnPasswordReset`,
  `defaultCookieAttributes: { sameSite: "strict" }`.
  `apps/sitio/src/lib/seguridad/rebote.ts` (`esLlegadaDeOtroSitio`,
  `paginaDeRebote`) y el proxy lo usa antes del 307; `proxy.test.ts` con 6
  tests (las cuatro ramas del padre, más «las pantallas de acceso no rebotan»
  y el destino escapado que no sale del sitio). `FormularioEntrar`: sin
  consulta al cargar; después de entrar confirma la sesión con
  `authCliente.getSession()` en el handler; `destinoSeguro` descarta
  `/admin/entrar` como `volver`; el 429 dice «Esperá unos minutos».
  «Tu contraseña cambió» suma que se cerraron las sesiones. `pnpm test` →
  auth 12/12, sitio 93 pass + 1 skip (A1), exit 0; `pnpm typecheck`,
  `pnpm lint` → exit 0; `node scripts/verificar-react-doctor.mjs` → «100/100,
  sin diagnósticos». De punta a punta:
  - el login contesta `set-cookie: better-auth.session_token=…;
    Max-Age=43200; Path=/; HttpOnly; SameSite=Strict`;
  - `curl` a `/admin/paginas?seccion=hero` con `Sec-Fetch-Site: cross-site`,
    `Sec-Fetch-Mode: navigate`, `Sec-Fetch-Dest: document` y sin cookie →
    `200`, `cache-control: no-store, max-age=0`, `x-robots-tag: noindex,
    nofollow`, la CSP, `<meta http-equiv="refresh"
    content="0;url=/admin/paginas?seccion=hero">` y `<a
    href="/admin/paginas?seccion=hero">Seguir</a>`; sin esas cabeceras →
    `307` a `/admin/entrar?volver=%2Fadmin%2Fpaginas`; con la cookie → `200`;
  - en el navegador de Orca, con sesión, un clic desde `http://127.0.0.1:3012/`
    (otro sitio) a `http://localhost:3012/admin/paginas?desde=otro-sitio`
    terminó en esa URL, no en «entrar». Un log temporal del proxy (sacado
    después) mostró las dos vueltas: `cross-site cookie: false` y después
    `same-origin cookie: true`;
  - con una sesión abierta de `otra@ed.test`, elegir contraseña dejó
    `select count(*) from session …` en 0, la cookie vieja volvió a «entrar»
    (307) y la consola imprimió «Tu contraseña cambió» con «Cerramos todas las
    sesiones…».
- 2026-09-26 — **Paso 8, la cookie de vista previa vence.** `abrirVistaPrevia`
  reescribe `__prerender_bypass` después de `enable()` con el mismo valor,
  `maxAge` 1 h, `SameSite=Lax`, `httpOnly`, `secure` en producción, `path=/`.
  **Next deja pisarla**: `cookies().get` ve la que acaba de poner `enable()`
  en la misma acción, y el `set` la reemplaza. `pnpm typecheck` → exit 0;
  `acciones-con-sesion.test.ts` → 8/8 (la acción sigue empezando por la
  sesión). En el navegador de Orca, «Vista previa» desde el editor de Inicio
  dejó la cookie `path=/ httpOnly=True sameSite=Lax session=False` con 3589 s
  por delante, y `/` mostró «Estás viendo un borrador» con «Volver al sitio
  publicado».
- 2026-09-26 — **Paso 10, la CSP del admin con nonce.**
  `apps/sitio/src/lib/seguridad/cabeceras.ts` (`nuevoNonce`,
  `politicaDeContenido`, `ponerCabeceras`: COOP y CORP `same-origin` y
  `X-Frame-Options: DENY` en `/admin`); `proxy.ts` arma la CSP por request y,
  en el admin, la pasa también en el pedido (`NextResponse.next({ request })`)
  para que Next ponga el nonce en sus scripts; `app/(admin)/layout.tsx` hace
  `await connection()`. `proxy.test.ts` suma 3 tests (nonce distinto con
  `'strict-dynamic'` y la CSP también hacia adentro; COOP, CORP y XFO en las
  tres respuestas del admin, el rebote incluido; el sitio sin cambios): 9/9.
  `pnpm test` → auth 12/12, sitio 96 pass + 1 skip (A1); `pnpm typecheck`,
  `pnpm lint` → exit 0; react-doctor → «100/100, sin diagnósticos»;
  `pnpm build` → exit 0, con `/admin/entrar`, `/admin/olvide-mi-contrasena` y
  `/admin/nueva-contrasena` ahora `ƒ` y el sitio `○` como antes. De punta a
  punta:
  - dos `curl -sI http://localhost:3012/admin/entrar` → nonces distintos
    (`wL7iThvry9zgh1JP9xUI7Q==`, `abKMfA39HXHapBOtSzdvbw==`),
    `'strict-dynamic'`, `'unsafe-eval'` (dev), `cross-origin-opener-policy:
    same-origin`, `cross-origin-resource-policy: same-origin`,
    `x-frame-options: DENY`; el HTML lleva ese nonce en cada `<script>`;
  - `curl -sI http://localhost:3012/` → la CSP del sitio igual que antes
    (`'unsafe-inline' 'unsafe-eval'`, `upgrade-insecure-requests`), sin COOP;
  - navegador de Orca, dev: `/admin`, `/admin/paginas`,
    `/admin/paginas/inicio` y `/admin/metricas` en claro, mixto y oscuro →
    consola 0 errores, 0 advertencias, 0 violaciones de CSP; salir desde el
    menú de la cuenta y volver a entrar con `volver=/admin/paginas` → llega a
    `/admin/paginas`; «Vista previa» → «La vista previa se abrió en otra
    pestaña.», sin errores;
  - `next start` en el 3013 (build con `NEXT_PUBLIC_SITE_URL` de ese puerto,
    porque se inlinea): la CSP sin `'unsafe-eval'`; entrar con
    `volver=/admin/paginas/inicio` llegó ahí, el editor hidrató y `/admin`,
    `/admin/paginas` y `/admin/metricas` no dejaron nada en la consola.
  - Anotado: en las páginas del admin, `Cache-Control` lo termina escribiendo
    Next (`no-cache, must-revalidate` en dev), no el proxy; era así antes de
    esta lane. El `no-store` del proxy queda en sus propias respuestas (el 307
    y el rebote).
