# PROGRESS — Poner al día el deploy

- **Rama:** `chore/primer-deploy`
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: en ejecución. Tasks 1 y 2 hechas (`bc40e65`, `917476d`); Task 4 (PR) en curso; Task 3 (README y AGENTS.md) espera las respuestas de Mateo o Gastón a las cuatro preguntas del SPEC §3; Task 5 es el checklist para ellos; Task 6, después de su deploy.**

## Baseline

Medido sobre `f3f3f9c`:

- El sitio YA está en producción en Vercel con el dominio (`https://empoderamientodocente.org`, `Server: Vercel`), pero es un build viejo: `/admin` 404, sin `robots.txt`, sin analítica. La cuenta es de Mateo y Gastón; GitHub no muestra deployments ni checks de Vercel.
- El README dice «Deploy: pendiente de definir».
- El build local (`pnpm build`) pasa; `pnpm migrate:deploy` aplica las tres
  migraciones sobre una base vacía (probado el 2026-09-21 en Docker).
- El admin en local entra, sale y elige contraseña (probado el 2026-09-21).

## Hecho

- 2026-09-21 — Task 1: `apps/sitio/vercel.json` con el Build Command del monorepo (`bc40e65`).
- 2026-09-21 — Task 2: `robots.ts` cierra los previews por `VERCEL_ENV`; helper `esUnPreviewDeVercel` con cinco tests; `pnpm test` en la app y en la raíz (`917476d`). Revisión aprobada: ningún valor de `VERCEL_ENV` cierra producción.

## Abierto

- Las cuatro preguntas del SPEC §3 (cuenta y proyecto, cómo se deployaba lo de antes, nombres de las variables, base existente). Con las respuestas se escribe la Task 3.
- Si la integración de Neon en el plan gratis da una rama por preview.
