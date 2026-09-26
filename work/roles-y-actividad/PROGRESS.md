# PROGRESS — Roles y actividad

## In progress

STATE: design-first approval window, waiting for owner approval of SPEC.md before PLAN.md

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_roles` con las 8 migraciones de `main` aplicadas, `.env.local`
  apuntado a ella. SPEC.md escrito desde el brief del padre (lane 3a de
  `work/mapa-del-admin/`).
- 2026-09-26 — Verificado para el SPEC §2: el índice parcial escrito a mano
  no genera drift (`prisma migrate diff --from-migrations … --to-schema …`
  da «This is an empty migration»); con el preview feature `partialIndexes`
  Prisma 7.10 escribe el mismo SQL, pero el brief pide el camino a mano y no
  hace falta un preview feature.

## Hecho

## Abierto
