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
- **Paso 2 — la política** (`c4dc354`). `permisos.ts › QUE_PERMITE`: la frase
  de cada capacidad, en el orden de `PUEDE` (`satisfies Record<Capacidad,
  string>`). `packages/auth/src/cuentas.ts`: `EstadoDeCuenta`,
  `CuentaObjetivo`, `LoQueSePuede` y `queSePuede(quien, objetivo)`, la tabla
  del SPEC §3 con `puede`/`esUnaSola`, sin strings de rol; exportados en
  `index.ts`. `cuentas.test.ts`, cinco casos contra la tabla. Aceptación:
  `pnpm --filter @ed/auth test` exit 0 (34/34), `typecheck` exit 0, `lint`
  exit 0.
- **Paso 3 — el segundo factor en `@ed/auth`** (`b623856`).
  `segundo-factor.ts`: el plugin `twoFactor` solo con código por correo (6
  dígitos, 10 min, `storeOTP: "hashed"`, 5 intentos, paso pendiente 30 min,
  dispositivo 30 días, TOTP apagado) y el plugin propio
  `alrededor-del-codigo`, que corre después: anota `entro` solo cuando hay
  sesión (`/sign-in/email`, `/two-factor/verify-otp`), espera el envío en
  `/two-factor/send-otp` y contesta 503 `CODIGO_NO_SALIO` si falló, anota
  `activo-`/`desactivo-el-segundo-factor`, y frena `/two-factor/disable`
  para D y A (403 `SEGUNDO_FACTOR_OBLIGATORIO`). `config.ts` se parte en
  `configDeAuth` (sin base) + `crearAuth`, para que los tests corran la config
  de verdad; suma el plugin y los 4 rate limits. `ganchos.ts` ya no anota
  `entro` (el test se mudó a `segundo-factor.test.ts`). `errores.ts` con los
  códigos que lee el navegador; `twoFactorClient` en el cliente.
  **Corte distinto del PLAN:** `OpcionesDeAuth.mandarCodigo` es obligatoria,
  así que la app la cablea en este mismo commit para no romper el typecheck:
  `mandarCorreo` devuelve `"resend" | "consola" | "no-salio"`, la plantilla
  `correos/tu-codigo.ts` (con `destacado` en `plantilla.ts` y `duracion`
  mudada ahí), `mandarCodigo` en `datos/auth.ts` (rechaza con «no salió») y
  los dos tipos de actividad. Al paso 6 le quedan la invitación y el cambio de
  correo.
  Verificado antes con un script descartable: el `ctx.context` que recibe
  `sendOTP` es el mismo objeto que ve el gancho `after`, y el plugin verifica
  un código con la tabla `twoFactor` vacía. Aceptación: `pnpm --filter
  @ed/auth test` 40/40 (7 nuevos en `segundo-factor.test.ts`, con
  `db.twoFactor.length === 0` al final de cada ida y vuelta); `pnpm test`
  exit 0 (sitio 153 pass, 1 saltado de antes); `pnpm typecheck` exit 0;
  `pnpm lint` exit 0; `node scripts/verificar-react-doctor.mjs` → 100/100,
  sin diagnósticos.
- **Paso 4 — una cuenta suspendida no abre sesión** (`0e22928`).
  `suspendidas.ts`: `CAMPO_SUSPENDIDA` (campo adicional de `user`, `input:
  false`, en `config.ts`) y `frenarSiEstaSuspendida(idDeCuenta, ctx)`, que
  corre primero en el gancho de la base que crea toda sesión
  (`GANCHOS_DE_LA_BASE` de `ubicacion.ts`) y contesta 403
  `CUENTA_SUSPENDIDA`. Test en `segundo-factor.test.ts`: con la contraseña
  buena, 403 y sin cookie; suspendida entre la contraseña y el código, el
  código también da 403; no se anota nada. Aceptación: `pnpm --filter
  @ed/auth test` 41/41; `pnpm typecheck` exit 0; `lint` exit 0.
- **Paso 5 — el enlace de invitación** (este commit).
  `packages/auth/src/invitacion.ts › crearEnlaceDeInvitacion(auth, {
  idDeCuenta, horas, volverA })` → `{ enlace, vence }`, exportada por
  `@ed/auth/servidor`: el formato del reset de better-auth
  (`reset-password:<token>` en `verification`, hasheado por la config) con
  otra vigencia; el enlace pasa por la ruta de better-auth que valida y lleva
  a `volverA` con el token. `invitacion.test.ts`, contra la config de verdad:
  el enlace lleva a `/admin/nueva-contrasena?token=…`, `resetPassword` crea la
  credencial y sirve una sola vez; vencido, redirige con
  `error=INVALID_TOKEN` y el reset da 400. Aceptación: `pnpm --filter
  @ed/auth test` 43/43; `typecheck` y `lint` exit 0.

## Abierto
