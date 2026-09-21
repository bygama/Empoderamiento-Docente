# PROGRESS — Las métricas del admin

- **Rama:** `feat/metricas` (todavía no creada)
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

Esta lane depende de [`primer-deploy`](../primer-deploy/PROGRESS.md): las
fases A y B se pueden construir y probar en local antes, pero la fase C
(verificación en producción) recién cuando el sitio esté publicado.

**Estado: spec revisado y mergeado (PR #165); PLAN escrito, pendiente de arrancar. Sin código.**

## Baseline

Medido sobre `f3f3f9c`:

- Ninguna analítica instalada en `apps/sitio` (ni `@vercel/analytics`, ni
  `gtag`, ni terceros).
- La portada del admin (`app/(admin)/admin/(protegido)/page.tsx`) dice
  «Todavía no hay nada que editar».
- `prisma/schema/` tiene `base`, `auth` y `sitio`; no hay tablas de métricas.
- No existe `vercel.json`; no hay crons.

## Hecho

(nada todavía)

## Abierto

- El plan de Vercel (Hobby por decisión del owner; ver `DECISIONS.md`).
- A nombre de quién va la cuenta de Vercel donde vive el proyecto (se decide
  en `primer-deploy`).
