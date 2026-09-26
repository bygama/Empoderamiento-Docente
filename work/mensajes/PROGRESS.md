# PROGRESS — Mensajes

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_mensajes` con las 12 migraciones de `main` aplicadas
  (`pnpm migrate:deploy`), `.env.local` apuntado a ella. SPEC.md escrito
  desde el brief del padre (lane 7 de `work/mapa-del-admin/`).
- 2026-09-26 — Investigado para el SPEC §3: Vercel Blob privado está en GA
  desde el 2026-06-30 y pide `@vercel/blob` ≥ 2.3; el repo tiene la 2.8.0 y
  sus tipos traen `get(…, { access: "private" })` con `stream` (verificado en
  `node_modules/.pnpm/@vercel+blob@2.8.0/…/dist/index.d.ts`). Neon gratis:
  0,5 GB por proyecto. Cuerpo de una función de Vercel: 4,5 MB.
- 2026-09-26 — SPEC aprobado por el padre con las seis propuestas y tres
  condiciones para `/sumate-al-equipo` (DECISIONS). PLAN.md escrito: 14
  pasos.
