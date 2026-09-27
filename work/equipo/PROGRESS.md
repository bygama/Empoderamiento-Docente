# PROGRESS — Equipo

## In progress

- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_equipo` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las 22 migraciones de `main` (`d051c6a0`).
- 2026-09-27 — SPEC.md escrito desde el brief del padre (lane 8b), con 16
  propuestas (§13); la cuenta de las publicaciones, en DECISIONS.
- 2026-09-27 — **SPEC aprobado por el padre** con el cambio J (sin arrastre:
  «Subir» y «Bajar» como Aliados) y las precisiones H y N (DECISIONS).
  PLAN.md escrito: 13 pasos; el 11 y el 12 esperan a la lane 9.

## Hecho

## Abierto

- La lane 9 (`casos-aliados-fotos`) no está en `main`: el registro de usos de
  fotos, los cambios de la tabla `fotos` y el orden de Aliados son suyos
  (SPEC §6.2 y §9; PLAN pasos 11 y 12).
- Fase 4: los ~110 KB del recorrido viajan en el payload del HTML de
  `/quienes-somos` (lo mismo que hoy pesa el `data.ts` en el bundle); cargar
  el perfil al abrirlo es de la fase 4 (nota del padre al aprobar).
