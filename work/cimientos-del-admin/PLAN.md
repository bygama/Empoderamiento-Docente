# PLAN — Fase 1: los cimientos del admin

Ejecuta la fase 1 de
`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` §9, en la
rebanada que fija [`SPEC.md`](SPEC.md). Termina cuando su PR mergea; la fase 2
abre su propia lane.

## Restricciones (valen en todos los pasos)

- **Commitear cada paso apenas pase su aceptación**, nunca acumular. El primer
  intento de esta lane se perdió entero por tener nueve pasos de trabajo sin
  commitear cuando el checkout desapareció (`DECISIONS.md`).
- **El repo es CRLF.** Un reemplazo multilínea con `perl`/`node` falla en
  silencio si no se normaliza; reescribir un `package.json` con `node` ya
  rompió uno en el primer intento. Para JSON, editar a mano.
- **Commits** Conventional, español, imperativos, header ≤ 72, uno por paso.
  Nunca `git add -A` sin mirar el staging.
- **El gate no se negocia** (§5.8). Se arregla por código: nada de
  `react-doctor-disable` ni `eslint-disable` de reglas del gate.
- **Prisma va en `7.10.0` exacta, sin `^`**, y todo `@prisma/*` junto.
- **Las cuatro fronteras** son criterio de review: si aparece la palabra
  «novedad» en `packages/`, está mal puesto.
- **`ed_panel` no se toca.** Es la base que dejó Payload; borrarla es
  destructivo y es decisión del owner.
- **El sitio público no cambia.** `comparar-render.mjs` contra `6d72bc0` tiene
  que dar idéntico en cada paso que toque `apps/sitio`.

## Pasos

**1. Abrir `packages/` con `db`, y sumarlo a las dos listas del gate** —
`pnpm-workspace.yaml` con `packages/*`; `packages/db` con su `package.json`,
tsconfig, eslint, la lógica de conexión a Neon y los helpers de slug;
`PROYECTOS` en `scripts/verificar-react-doctor.mjs` y el script `react-doctor`
de la raíz sumando `packages/db/src`. **`packages/db` no importa el cliente
generado de Prisma**: la app lo construye y le pasa el adaptador.
*(integration · high)*

- **Aceptación:** `pnpm install` exit 0 · `pnpm typecheck` y `pnpm lint`
  exit 0 y **recorriendo los dos proyectos** · `node
  scripts/verificar-react-doctor.mjs` en 100/100 **con los dos nombrados en el
  informe**

**2. La guarda de Prisma** — `scripts/guarda-prisma.mjs` envuelve el CLI y
**bloquea `db push`** con exit 1 y un mensaje que dice qué, por qué y el fix.
Los scripts de base del `package.json` pasan por ella. *(judgment · high)*

- **Aceptación:** `node scripts/guarda-prisma.mjs db push` → exit 1 con el
  motivo en stdout · `node scripts/guarda-prisma.mjs migrate status` → delega
  y propaga el exit del CLI

**3. El esquema base y su primera migración** — `apps/sitio/prisma/schema/`
(`base.prisma` con datasource y generator, `sitio.prisma` con la tabla de
redirecciones de slug); crear la base `ed` en el contenedor; `prisma migrate
dev` y **commitear** lo generado. *(integration · high)*

- **Aceptación:** `prisma migrate status` → «No pending migrations» · la
  migración está en `apps/sitio/prisma/migrations/` y versionada · `\dt` en la
  base `ed` lista las tablas nuevas y **`ed_panel` sigue con sus 9 intactas**

**4. `packages/auth` con better-auth** — `betterAuth` con `prismaAdapter`,
`telemetry.enabled: false` explícito, Argon2id, los dos roles (administra /
edita) en `permisos.ts`, y los modelos que su CLI escribe en el esquema, con
su migración commiteada. *(integration · high)*

- **Aceptación:** `prisma migrate status` sin pendientes · las tablas de
  better-auth existen en `ed` · `pnpm typecheck` exit 0 · `grep -r "telemetry"
  packages/auth/src` muestra el `false` explícito

**5. El middleware: cabeceras y `noindex`** — `apps/sitio/src/middleware.ts`
con CSP, HSTS, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` en
`none` para `/admin`, y `X-Robots-Tag: noindex` real en la respuesta de
`/admin`. *(judgment · high)*

- **Aceptación:** con `next start`, `curl -I http://localhost:<puerto>/` lista
  las cinco cabeceras · `curl -I .../admin` incluye `X-Robots-Tag: noindex` ·
  `node scripts/comparar-render.mjs` contra `6d72bc0` da **render idéntico**

**6. La guarda de sesión, antes de renderizar** — el middleware corta `/admin`
sin sesión y redirige a entrar; ningún server component consulta la sesión
para decidir si renderiza. *(judgment · high)*

- **Aceptación:** `curl -so /dev/null -w '%{http_code} %{redirect_url}'
  .../admin` sin cookie → 307 a la pantalla de entrar · con cookie de sesión
  válida → 200

**7. Rate limit por IP y por cuenta** — en el middleware, sobre el endpoint de
login: el límite por cuenta que da better-auth **más** uno por IP, que hoy no
existe y deja enumerar usuarios sin freno. *(judgment · high)*

- **Aceptación:** un script de sesión que dispara N+1 intentos desde la misma
  IP contra usuarios distintos recibe 429 en el último · el mensaje de error
  es genérico y no distingue «usuario no existe» de «contraseña incorrecta»

**8. Entrar, salir y «olvidé mi contraseña»** — las tres pantallas de `/admin`,
en español rioplatense, con el correo de reset por Resend (sin clave, sale por
consola). Sin primitivos reusables todavía: el kit nace en la fase 2.
*(integration · high)*

- **Aceptación:** recorrido manual grabado en PROGRESS: entrar con un usuario
  sembrado, ver el admin vacío, salir, pedir reset y ver el mail en la consola ·
  `pnpm build` exit 0

**9. El README y el contrato al día** — `README.md` (el `docker run` con la
base `ed`, que `ed_panel` queda huérfana, los comandos de Prisma),
`AGENTS.md` §13, y `.env.example` con el secreto de better-auth. `[batch]`
*(judgment · medium)*

- **Aceptación:** los comandos que el README nombra existen en un
  `package.json` · `grep -c "ed_panel" README.md` ≥ 1 (queda dicho que está
  huérfana) · cero links markdown rotos en el repo

## Al cerrar

`work-verify` con la review de cierre dimensionada por las marcas: **ocho
pasos en `high`**, y siete de ellos tocan auth o seguridad. La review de esta
lane pesa más que la de la fase 0 y hay que presupuestarla así. Después
`work-handoff`.
