# PROGRESS — El Inicio del admin

## In progress

- 2026-09-26 — Worktree `inicio` desde `5a07368`, rama `mateo/inicio`,
  `pnpm install` y `pnpm generate` en verde, `.env.local` copiado. SPEC.md
  escrito desde el brief del padre (lane 3c); pedida la aprobación por
  `orca orchestration ask`.
- 2026-09-26 — SPEC aprobado por el padre con un cambio (DECISIONS). PLAN.md
  escrito: 10 pasos.

## Hecho

## Abierto

- Al cerrar la lane: borrar la base de demo `ed_inicio`
  (`docker exec ed-postgres psql -U postgres -c "DROP DATABASE ed_inicio;"`)
  y volver el `.env.local` a `ed` (DECISIONS).
