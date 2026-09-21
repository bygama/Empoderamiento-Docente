# PROGRESS — Las métricas del admin

- **Rama:** `feat/metricas` (sobre `main` d16ee85)
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

Esta lane depende de [`primer-deploy`](../primer-deploy/PROGRESS.md): las
fases A y B se construyen y prueban en local; la fase C (verificación en
producción) recién con el proyecto de Vercel al día y el token cargado.

**Estado: fase A implementada (A2–A8) y revisada tarea por tarea más una revisión de rama; PR en preparación. A1 (grabar las respuestas reales de la API) espera el token y el ID del proyecto, que tienen Mateo y Gastón. B1 y C1 después.**

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

- A1: el token de la cuenta de Vercel y el `prj_…` (Mateo o Gastón); con eso se graban las respuestas reales y se ajustan mapeos y tests.
- C1: activar Web Analytics en el proyecto antes de la primera corrida, las cuatro variables solo en Production, verificar el cron y la primera copia. El token vence en un año.
- Diferidos de la revisión final a A1/B1/C1: `vercel.ts` sobre el tope de 100 líneas (partir cliente y mapeos), Zod en el borde de la API con la forma real, tests de `tarjetas()` y del freno, el cuerpo del error de la API en el detalle, el freno ante dos clics simultáneos, `leyendaDe` atada al string de `variacion()`.
- El plan de Vercel (Hobby por decisión del owner; ver `DECISIONS.md`).
