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

- Paso 6 del PLAN (tokens hasheados).

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
