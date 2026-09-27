# PROGRESS — Métricas completas

## In progress

- 2026-09-27 — Lane abierta desde `main` en `782aeb2`, rama
  `mateo/metricas-completas`, dispatch `ctx_2f56b40105f3` (task
  `task_f6fdab703551`). Worktree listo: `pnpm install`, `pnpm generate`,
  `.env.local` copiado y apuntado a la base propia `ed_metricas` (creada en
  `ed-postgres`, con `pnpm migrate:deploy` hasta
  `20260927024335_indexacion_de_urls`).
- 2026-09-27 — Barrido de `work/`: solo `mapa-del-admin/`, la lane padre en
  curso. Nada mergeado con carpeta pendiente.
- 2026-09-27 — La API de Web Analytics de Vercel, verificada contra su
  documentación de hoy (SPEC §2): no da regiones ni ciudades; sí `hour`,
  `osName`, `browserName`, `utmCampaign` y filtros por país.
- 2026-09-27 — SPEC.md escrito (`37d2272`) y aprobado por el padre con las
  siete recomendaciones de §12 (DECISIONS). PLAN.md escrito: 19 pasos, los dos
  de la 8a al final.

## Hecho

## Abierto

- La lane 8a (`mateo/biblioteca`, en revisión) no está en `main`: lo que
  depende de ella va al final del PLAN (SPEC §11).
