# PLAN — Seguridad del acceso

SPEC aprobado por el padre el 2026-09-26 ([`SPEC.md`](SPEC.md), rulings en
[`DECISIONS.md`](DECISIONS.md)). Lo ejecuta esta misma sesión con work-run, un
paso por commit, y cierra con work-verify y work-handoff. Estado en
[`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Commits** Conventional, en español, imperativo, header ≤ 72, atómicos
  (`docs/COMMITS.md`); nunca `git add -A` ni `git add .`; trailer
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Commits, push y
  PR sin pedir OK (padre, 2026-09-26); **nunca merge, nunca `--no-verify`**.
- **No se tocan** (lane 1 en vuelo): `apps/sitio/src/admin/armazon/`, los
  `page.tsx` de `entrar`, `olvide-mi-contrasena` y `nueva-contrasena`,
  `admin/paginas/`, `admin/por-hacer/`, `admin/metricas/`, `next.config.ts` y
  DESIGN.md.
- **Fronteras:** `packages/auth` no sabe de ED ni importa Prisma; `datos/` es
  la única puerta a la base; `lib/correo/` no importa nada con `@/`; toda
  Server Action empieza por `auth.api.getSession`.
- **En producción nunca se loguea un enlace ni un token**, ni el correo de
  quien pidió el reset.
- **Migraciones** con `pnpm migrate` contra `ed_seguridad` (nunca `db push`,
  nunca a mano); se commitean.
- **Topes:** componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md §6).
  Comentarios en español que dicen el porqué. Sin `any`.
- **El dev server** en su pestaña de Orca, puerto 3012, con
  `NEXT_PUBLIC_SITE_URL=http://localhost:3012`; se abre por `localhost`, nunca
  `127.0.0.1`. El repo es CRLF.

## Interfaces entre pasos

- **Paso 1 →** `packages/auth/src/contrasenas.ts`: `hashear(contrasena):
  Promise<string>`, `verificar({ hash, password }): Promise<boolean>`,
  `necesitaRehash(hash): boolean`; y `packages/auth/src/ganchos.ts`:
  `crearGanchos(opciones)` → `{ before, after }` para `hooks` de better-auth.
- **Paso 3 →** `packages/auth/src/bloqueo.ts`: `EstadoDeBloqueo = { fallos,
  desde: Date, bloqueos, hasta: Date | null }`, `AlmacenDeBloqueos = {
  leer(clave), actualizar(clave, cambio: (actual | null) => EstadoDeBloqueo),
  borrar(clave), podar(antesDe: Date) }`, `claveDeBloqueo(correo, secreto)`;
  `crearAuth` recibe `bloqueos: AlmacenDeBloqueos`. La app lo implementa en
  `apps/sitio/src/datos/bloqueos-de-acceso.ts` (`almacenDeBloqueos`).
- **Paso 4 →** `apps/sitio/src/lib/correo/resend.ts`:
  `crearClienteDeResend({ clave, fetch? })` → `{ mandar({ de, para, asunto,
  html, texto, idempotencia }): Promise<{ id: string }> }`.
- **Paso 5 →** `crearAuth` recibe `segundoPlano(promesa)` y
  `avisarCambioDeContrasena({ para, nombre })` además de
  `mandarResetDeContrasena`; `apps/sitio/src/correos/` exporta las dos
  plantillas y `mandarCorreo(...)`, que elige el transporte.

## Pasos

1. **Argon2id con rehash al entrar.** `@node-rs/argon2` y `tsx` (dev, script
   `test`) en `packages/auth`; `contrasenas.ts` (Argon2id 19 MiB/t=2/p=1,
   `verify` que reconoce el scrypt de better-auth) con sus tests;
   `emailAndPassword.password` y el gancho `after` de `/sign-in/email` que
   rehashea con `internalAdapter.updatePassword`.
   Acepta: `pnpm --filter @ed/auth test` sale 0 (scrypt verifica y pide
   rehash, Argon2id no, el hash nuevo empieza por
   `$argon2id$v=19$m=19456,t=2,p=1$`) y `pnpm typecheck` sale 0.
   *(judgment · high)*
2. **El rate limit, en la base.** Modelo `RateLimit` (`@@map("rateLimit")`,
   `id`, `key` único, `count`, `lastRequest` BigInt) y su migración;
   `rateLimit.storage: "database"`, los mismos topes, sin la regla de
   `/forget-password`.
   Acepta: `pnpm migrate:status` dice «up to date», `pnpm typecheck` sale 0, y
   con el dev server arriba el 4.º `POST /api/auth/sign-in/email` en un minuto
   desde una misma IP devuelve 429 y deja una fila en `"rateLimit"`
   (`docker exec ed-postgres psql -U postgres -d ed_seguridad -c 'select key,
   count from "rateLimit"'`).
   *(integration · high)*
3. **El bloqueo por cuenta.** `bloqueo.ts` (reglas, escalera, HMAC) con sus
   tests; los ganchos `before` (429 con el mismo cuerpo que el rate limit y
   `X-Retry-After`) y `after` (401 cuenta, 200 borra) de `/sign-in/email`;
   `onPasswordReset` destraba. Modelo `BloqueoDeAcceso` (`clave`, `fallos`,
   `desde`, `bloqueos`, `hasta`) y su migración; `datos/bloqueos-de-acceso.ts`
   con la fila bloqueada en una transacción y la poda de 24 h, más un test de
   integración (diez fallos simultáneos cuentan diez).
   Acepta: `pnpm --filter @ed/auth test` y `pnpm --filter sitio test` salen 0;
   `pnpm migrate:status` «up to date»; en el dev server el 6.º intento contra un
   correo (existente o no), con IP distinta en cada uno, devuelve 429.
   *(judgment · high)*
4. **El cliente de Resend.** `lib/correo/resend.ts` por `fetch`:
   `Authorization`, `Idempotency-Key`, 10 s, un reintento con la misma clave
   solo ante timeout, red o 5xx; un error no lleva el cuerpo enviado. Tests con
   el `fetch` inyectado.
   Acepta: `pnpm --filter sitio test` sale 0 con los casos de cabeceras,
   timeout, reintento (5xx y red sí, 4xx no) y error sin el enlace.
   *(integration · medium)*
5. **Los correos de la contraseña.** `correos/` con «Elegí tu contraseña» y
   «Tu contraseña cambió» (HTML escapado + texto) y el transporte (Resend con
   clave, consola sin clave fuera de producción, error sin enlace en
   producción); `datos/auth.ts` los conecta, con
   `advanced.backgroundTasks.handler` sobre `after()` y el aviso de
   `onPasswordReset` también en segundo plano; `CORREO_REMITENTE` y
   `RESEND_API_KEY` en `.env.example`.
   Acepta: `pnpm --filter sitio test` sale 0 (plantillas escapan, el transporte
   de producción sin clave no imprime el enlace); en el dev server sin clave,
   «Olvidé mi contraseña» imprime el enlace en la consola y elegir la
   contraseña imprime «Tu contraseña cambió».
   *(integration · high)*
6. **Tokens hasheados.** `verification.storeIdentifier: "hashed"`.
   Acepta: `pnpm typecheck` sale 0; después de pedir un reset en el dev
   server, `select identifier from verification` no contiene el token del
   enlace impreso, y el enlace sigue sirviendo.
   *(integration · medium)*
7. **Sesión y cookies** (va después del 9, DECISIONS). `expiresIn` 12 h,
   `updateAge` 1 h, `freshAge` 10 min, `revokeSessionsOnPasswordReset`,
   `SameSite=Strict` por `defaultCookieAttributes`; el rebote del proxy para
   las navegaciones de otro sitio sin cookie (las cuatro condiciones de
   DECISIONS) con su test; `FormularioEntrar` confirma la sesión después de
   entrar, en el handler, antes de seguir a `volver`; el aviso del 429 pasa a
   «Esperá unos minutos».
   Acepta: `pnpm --filter sitio test` (las cuatro ramas del proxy),
   `pnpm typecheck`, `pnpm lint` y `node scripts/verificar-react-doctor.mjs`
   salen 0; en el dev server el `Set-Cookie` del login dice `SameSite=Strict` y
   `Max-Age=43200`; `curl -I` a `/admin/paginas` con `Sec-Fetch-Site:
   cross-site` da 200 con el refresh y sin él da 307 a `/admin/entrar`; elegir
   contraseña cierra la otra sesión (`select count(*) from session` baja a 0).
   *(judgment · high)*
8. **La cookie de vista previa vence.** `abrirVistaPrevia` la reescribe
   después de `enable()` con `maxAge` 1 h y `SameSite=Lax`; se prueba primero y,
   si Next no deja, se anota en DECISIONS y el paso cierra sin cambio de código.
   Acepta: `pnpm --filter sitio test` sale 0 (la acción sigue empezando por la
   sesión) y la respuesta de «Vista previa» en el dev server trae
   `__prerender_bypass` con `Max-Age=3600` y `SameSite=Lax`.
   *(integration · medium)*
9. **`middleware.ts` pasa a `proxy.ts`.** `git mv` y `export function proxy`,
   sin cambiar nada más (comentarios de «Edge» al día: en Next 16 el proxy
   corre en Node).
   Acepta: `pnpm typecheck` sale 0 y `curl -I http://localhost:3012/admin`
   devuelve el 307 a `/admin/entrar` con las cabeceras de hoy.
   *(mechanical · low)*
10. **La CSP del admin con nonce.** Nonce por respuesta en el proxy,
    `script-src 'self' 'nonce-…' 'strict-dynamic'` (`'unsafe-eval'` solo en
    desarrollo), la CSP en el request para que Next la lea; COOP, CORP y
    `X-Frame-Options: DENY` en `/admin`; `app/(admin)/layout.tsx` con
    `await connection()`. Si el proxy arrastra `@node-rs/argon2` al importar
    `@ed/auth`, la guarda sale por un subpath `@ed/auth/guarda`.
    Acepta: dos `curl -sI http://localhost:3012/admin/entrar` traen nonces
    distintos, `'strict-dynamic'`, COOP, CORP y `X-Frame-Options: DENY`; el
    sitio (`curl -sI http://localhost:3012/`) conserva su CSP; el admin carga
    e hidrata sin errores de consola de CSP; `pnpm build` sale 0.
    *(judgment · high)*
11. **ADR-0010 y el spec del admin §7.** El ADR (contexto, decisión,
    alternativas, consecuencias: el scrypt que migra solo, los enlaces
    pendientes que dejan de servir, rotar el secreto borra los bloqueos, lo que
    hace ED en Resend), su fila en el índice de ADRs y el §7 del spec al día.
    Acepta: `node -e` que chequea que el índice lista `0010` y que el §7 ya no
    dice «middleware» ni «scrypt para el hasheo» sale 0.
    *(judgment · medium)*
12. **README y la guía.** README: las variables `RESEND_API_KEY` y
    `CORREO_REMITENTE`, lo que ED hace en Resend (SPF, DKIM, DMARC, sin click
    tracking), `proxy.ts` en el árbol y el enlace por consola solo sin clave;
    `docs/AI_GUIDELINES.md` §12 (la sesión se corta en el proxy).
    Acepta: `git grep -n "middleware" -- README.md docs/AI_GUIDELINES.md` no
    devuelve nada y `git grep -n "CORREO_REMITENTE" -- README.md
    apps/sitio/.env.example` devuelve los dos.
    *(mechanical · low)*
13. **AGENTS.md**, en su propio commit (§5.6: lo revisa Mateo en el PR): §3
    (el árbol: `proxy.ts`, `correos/`, `lib/correo/`) y §12 (la línea de la
    sesión y la nota «Qué de esto ya existe»).
    Acepta: `git grep -n "middleware" -- AGENTS.md` solo devuelve la línea
    histórica de §13 (fase 1).
    *(judgment · medium)*
