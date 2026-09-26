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

- Paso 1 del PLAN (Argon2id con rehash al entrar).

## Hecho

- 2026-09-26 — Worktree listo: `pnpm install`, `.env.local` copiado y apuntado
  a `ed_seguridad`, `pnpm migrate:deploy` (6 migraciones) y `pnpm generate`.
- 2026-09-26 — SPEC.md escrito desde el diseño aprobado el 2026-09-22;
  aprobado por el padre el mismo día (DECISIONS). PLAN.md en 13 pasos.
