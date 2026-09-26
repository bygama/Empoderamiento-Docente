# PROGRESS — Cuentas y segundo factor

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_cuentas` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con todas las migraciones de `main`. SPEC.md escrito
  desde el brief del padre (lane 3b), con la API del plugin `twoFactor`
  verificada contra better-auth 1.7.5 instalado.
- 2026-09-26 — SPEC aprobado por el padre con tres condiciones (DECISIONS),
  ya escritas en el SPEC. PLAN.md escrito: 16 pasos. Arranca work-run.

## Hecho

- **Paso 1 — la base** (`9e8749e`). `auth.prisma`: `twoFactorEnabled`,
  `suspendida`, `invitacionVence` y el modelo `TwoFactor`. Migración
  `20260926232051_segundo_factor_y_cuentas` con `--create-only` y el SQL
  sumado antes de aplicarla (prende el segundo factor de D y A, borra sus
  sesiones, `CHECK user_segundo_factor_obligatorio`). `segundoFactorObligatorio`
  en `permisos.ts` (adelantado del paso 2: el `CHECK` y su espejo en código
  van juntos) y `datos/roles.ts › ponerRol(id, rol, tx?)` →
  `{ cerroSesiones }`, que usan `nombrarDireccion` y `crear-cuenta` (esta crea
  con el rol de fábrica y después `ponerRol`, porque better-auth no escribe
  columnas que no conoce). Aceptación:
  - Sembré en `ed_cuentas` una administra y una edita con sesión; tras
    `pnpm migrate`: administra `twoFactorEnabled = t` y sin sesión, edita
    intacta.
  - `INSERT` de administra sin segundo factor → `violates check constraint
    "user_segundo_factor_obligatorio"`.
  - `pnpm prisma migrate diff --from-config-datasource --to-schema
    prisma/schema --exit-code` → exit 0, «No difference detected».
  - `pnpm migrate:status` → «Database schema is up to date!».
  - `pnpm typecheck` exit 0; `pnpm test` exit 0 (auth 29/29; sitio 152 pass,
    1 saltado de antes), con `roles.test.ts` nuevo (el `CHECK` y `ponerRol`).
- **Paso 2 — la política** (este commit). `permisos.ts › QUE_PERMITE`: la frase
  de cada capacidad, en el orden de `PUEDE` (`satisfies Record<Capacidad,
  string>`). `packages/auth/src/cuentas.ts`: `EstadoDeCuenta`,
  `CuentaObjetivo`, `LoQueSePuede` y `queSePuede(quien, objetivo)`, la tabla
  del SPEC §3 con `puede`/`esUnaSola`, sin strings de rol; exportados en
  `index.ts`. `cuentas.test.ts`, cinco casos contra la tabla. Aceptación:
  `pnpm --filter @ed/auth test` exit 0 (34/34), `typecheck` exit 0, `lint`
  exit 0.

## Abierto
