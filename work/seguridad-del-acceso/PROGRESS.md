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

- Paso 3 del PLAN (el bloqueo por cuenta).

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
