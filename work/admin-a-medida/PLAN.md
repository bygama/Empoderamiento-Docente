# PLAN — Fase 0: la escisión

Ejecuta la **fase 0** de [`SPEC.md`](SPEC.md): Payload afuera, repo en verde,
sitio idéntico, documentación al día. Las fases 1 a 4 abren su propia lane y
referencian este mismo SPEC — esta termina cuando el PR de la fase 0 mergea.

## Restricciones (valen en todos los pasos)

- **El repo es CRLF.** Un reemplazo multilínea con `perl`/`node` falla en
  silencio si no se normaliza: leer, pasar a `\n`, editar, devolver a `\r\n`.
- **Commits** Conventional, en español, imperativos, header ≤ 72, uno por paso
  (AGENTS.md §9 y `docs/COMMITS.md`). Nunca `git add -A`.
- **El gate no se negocia** (§5.8): prohibidos `react-doctor-disable`,
  `doctor.config.*` y los `eslint-disable` de reglas del gate. Se arregla por
  código.
- **`PROYECTOS` no cambia en esta fase.** Sigue en `["apps/sitio/src"]`: los
  `packages/` recién nacen en la fase 1.
- **El ADR-0003 no se borra.** Los ADRs de este repo son inmutables: se marca
  `Superseded by ADR-0005`.
- Confirmación del owner ya dada para las tres acciones que la exige §5.6:
  sacar dependencias, modificar `AGENTS.md`, borrar la spec vieja.

## Pasos

**1. Borrar el código de Payload de `src/`** — `app/(payload)/`, `cms/`,
`payload.config.ts`, `payload-types.ts` y `app/(sitio)/vista-previa/`
(su lógica anti-open-redirect se rescata en la fase 2 desde `d452e61`, ver
`DECISIONS.md`). Las dependencias quedan para el paso 2, así el árbol compila
en el medio. *(mechanical · medium)*

- **Aceptación:** `grep -rli payload apps/sitio/src` sin coincidencias (exit 1)
  · `pnpm typecheck` exit 0

**2. Sacar las 7 dependencias y limpiar la config que las nombraba** —
`payload`, los 5 `@payloadcms/*` y `graphql` del `package.json` del sitio; el
`withPayload` de `next.config.ts`; el path `@payload-config` de
`tsconfig.json`; los 3 `globalIgnores` de `eslint.config.mjs`; los 6 scripts
`payload*`/`migrate*`/`generate:*`; y las variables `PAYLOAD_SECRET`,
`DATABASE_URL_UNPOOLED` y `VISTA_PREVIA_SECRET` de `.env.example`. `sharp` y
`zod` **se quedan**. *(mechanical · medium)*

- **Aceptación:** `pnpm install` exit 0 · `pnpm typecheck`, `pnpm lint`,
  `pnpm build` exit 0 · `node scripts/verificar-react-doctor.mjs` en 100/100
  sin diagnósticos · `grep -ril payload apps/sitio/next.config.ts
  apps/sitio/tsconfig.json apps/sitio/eslint.config.mjs
  apps/sitio/package.json apps/sitio/.env.example` exit 1

**3. Probar que el sitio quedó idéntico** — diff del HTML renderizado de las 9
rutas públicas contra `d452e61`, con el método que ya usó la lane de los
componentes parcados. Sin commit de código: la evidencia va a `PROGRESS.md`.
Va por `localhost`, nunca por `127.0.0.1`, que no hidrata. *(integration · high)*

- **Aceptación:** el diff de las 9 rutas (`/`, `/que-hacemos`,
  `/quienes-somos`, `/investigacion`, `/biblioteca`, `/novedades`,
  `/novedades/<slug>`, `/contacto`, una 404) da vacío · el build lista las
  mismas rutas del sitio y **ya no** lista `/admin` ni `/api`

**4. Escribir los ADR-0005, 0006 y 0007 y marcar el 0003 como superseded**
— 0005 (admin a medida reemplaza a Payload), 0006 (`packages/` desde ahora,
enmienda al 0004), 0007 (Prisma como ORM), más la tabla de
`docs/architecture/adrs/README.md` al día. `[batch]` *(judgment · high)*

- **Aceptación:** los 3 archivos nuevos existen con `Status: Accepted` ·
  `grep -c "Superseded by ADR-0005" docs/architecture/adrs/0003-*.md` da 1 ·
  la tabla del README lista 0005, 0006 y 0007

**5. Reemplazar la spec del panel y actualizar el contrato** — borrar
`docs/architecture/specs/2026-09-15-panel-admin-diseno.md`, escribir
`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` desde
[`SPEC.md`](SPEC.md), y rescribir `AGENTS.md` §2 §3 §12 §13, `README.md`,
`docs/README.md` y `docs/AI_GUIDELINES.md` §12. `[batch]` *(judgment · high)*

- **Aceptación:** `grep -ril payload AGENTS.md README.md docs/` devuelve
  **solo** `docs/architecture/adrs/0002-*` y `0003-*` (histórico, correcto) ·
  `docs/architecture/specs/2026-09-15-panel-admin-diseno.md` no existe ·
  AGENTS.md §13 refleja el estado real

## Al cerrar

`work-verify` con la review de cierre dimensionada por las marcas: **tres
pasos en `high`** (3, 4, 5). Después `work-handoff`, que cierra la lane y
borra `work/admin-a-medida/`.
