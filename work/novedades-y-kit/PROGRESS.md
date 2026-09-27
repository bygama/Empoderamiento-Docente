# PROGRESS — Novedades y el kit del admin

## In progress

STATE: design-first approval window, waiting for owner approval of SPEC.md before PLAN.md

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_novedades` con las 13 migraciones de `main` aplicadas
  (`pnpm migrate:deploy` → «All migrations have been successfully applied»;
  `pnpm migrate:status` → «Database schema is up to date!»), `.env.local`
  copiado y apuntado a ella. SPEC.md escrito desde el brief del padre (lane 6
  de `work/mapa-del-admin/`), con seis propuestas (§14) para su aprobación.
- Lo que dejan las lanes vecinas, sin mergear todavía (leído en sus ramas):
  la 3b (`cuentas`) trae `Volver.tsx`, `Buscador.tsx` y el paginado; la 3c
  (`inicio`) trae `admin/actividad/frase.ts` y los registros de pendientes y
  de accesos rápidos. El PLAN deja la UI del módulo para después de rebasear,
  así los consume en vez de duplicarlos.
