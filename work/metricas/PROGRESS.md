# PROGRESS — Las métricas del admin

- **Rama:** `feat/metricas` (sobre `main` d16ee85)
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

Esta lane depende de [`primer-deploy`](../primer-deploy/PROGRESS.md): las
fases A y B se construyen y prueban en local; la fase C (verificación en
producción) recién con el proyecto de Vercel al día y el token cargado.

**Estado: cerrada el 2026-09-23.** La fase A (A2–A8) entró en `main` con el PR #168 y se verificó sobre `e4cf0c9` (ver «Verification»). A1, B1 y C1 no se hicieron: pasan al módulo Métricas del mapa del admin (diseño aprobado el 2026-09-23, lane `work/mapa-del-admin/`), ver «Abierto».

## Baseline

Medido sobre `f3f3f9c`:

- Ninguna analítica instalada en `apps/sitio` (ni `@vercel/analytics`, ni
  `gtag`, ni terceros).
- La portada del admin (`app/(admin)/admin/(protegido)/page.tsx`) dice
  «Todavía no hay nada que editar».
- `prisma/schema/` tiene `base`, `auth` y `sitio`; no hay tablas de métricas.
- No existe `vercel.json`; no hay crons.

## Hecho

- 2026-09-21 — A2: `<Analytics />` solo en producción en el layout del sitio; `_vercel` fuera del matcher del middleware.
- 2026-09-21 — A3: `prisma/schema/metricas.prisma` y su migración; A6 le sumó `agrupado` a la clave de `metricas_diarias` con una segunda migración (el referido vacío y «el resto» compartían `valor = ""`).
- 2026-09-21 — A4: `lib/metricas/tipos.ts` y `periodos.ts` (fechas UTC, rango faltante con tope de 31 días, las cuatro ventanas, la variación en llano), ocho tests.
- 2026-09-21 — A5: `lib/metricas/vercel.ts`, el cliente de la API y sus mapeos, con tests; el test que lee las respuestas grabadas queda en skip hasta A1.
- 2026-09-21 — A6: `datos/acciones/sincronizar-metricas.ts` (idempotente, registra cada corrida, `total` al final como marca de agua, upserts en paralelo acotados por el pool), `lib/metricas/entorno.ts`, `datos/consultas/metricas.ts`; dos tests de integración contra el Postgres local.
- 2026-09-21 — A7: `/api/cron/metricas` (solo autoriza y llama a `sincronizarDesdeEntorno`), `crons` en `vercel.json`, las cuatro variables en `.env.example`.
- 2026-09-21 — A8: `PanelMetricas` en la portada (tarjetas, estados en llano, aviso de la última corrida fallida siempre a la vista), la Server Action «Actualizar ahora» con sesión propia y freno de diez minutos; el middleware deja pasar las Server Actions para que la acción conteste en llano.
- 2026-09-21 — Revisión final de la rama: sin críticos; `ventana()` pasa a `visits/count` directo, las tarjetas toman la ventana más nueva, y menores (ver DECISIONS).

## Abierto

Todo pasa al módulo Métricas del mapa del admin (`work/mapa-del-admin/`): B1
(la curva y las listas) es la pantalla «Resumen» de ese módulo; A1 y C1 siguen
esperando el token y el deploy, y se hacen ahí.

- A1: el token de la cuenta de Vercel y el `prj_…` (Mateo o Gastón); con eso se graban las respuestas reales y se ajustan mapeos y tests.
- C1: activar Web Analytics en el proyecto antes de la primera corrida, las cuatro variables solo en Production, verificar el cron y la primera copia. El token vence en un año.
- Diferidos de la revisión final a A1/B1/C1: `vercel.ts` sobre el tope de 100 líneas (partir cliente y mapeos), Zod en el borde de la API con la forma real, tests de `tarjetas()` y del freno, el cuerpo del error de la API en el detalle, el freno ante dos clics simultáneos, `leyendaDe` atada al string de `variacion()`.
- El plan de Vercel (Hobby por decisión del owner; ver `DECISIONS.md`).

## Verification

### 2026-09-23 — L DoD de la fase A, sobre `main` `e4cf0c9` — PASS
- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 · `node scripts/verificar-react-doctor.mjs` → exit 0 («100/100, sin diagnósticos»)
- L2 behavioral: `pnpm test` → exit 0 (79 tests: 78 pasan, 0 fallan; el único skip es el de las respuestas grabadas, que espera A1; incluye los de `periodos`, `vercel` y los dos de integración de `sincronizar-metricas`) · `pnpm build` → exit 0 · `pnpm migrate:status` → al día; arranca: `pnpm dev` → `GET /admin/entrar` 200
- L3 end-to-end, en el navegador de Orca contra `localhost:3000`: la portada del admin muestra el panel «Cuánta gente entra al sitio» con «Todavía sin datos» y el aviso «Faltan las variables de Vercel» → «Actualizar ahora» contesta en llano «Faltan las variables de Vercel: ver el README.» (`actualizarMetricasAhora` en el log) · `GET /api/cron/metricas` sin `CRON_SECRET` → 401. La sincronización contra la API real no corrió: es A1/C1.
- Close review: 0 seats, decisión del owner (DECISIONS, 2026-09-23). La revisión de la rama se hizo antes del merge (ver «Hecho», 2026-09-21).
