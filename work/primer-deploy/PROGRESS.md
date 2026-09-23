# PROGRESS — Poner al día el deploy

- **Rama:** `chore/primer-deploy`
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: cerrada el 2026-09-23.** Las Tasks 1, 2 y 4 entraron en `main` con el PR #167 y se verificaron sobre `e4cf0c9` (ver «Verification»). Las Tasks 3, 5 y 6 no se hicieron: pasan como paso previo al plan del mapa del admin (lane `work/mapa-del-admin/`), porque las métricas en producción, las fotos en Blob y Search Console dependen de ese deploy. Ver «Abierto».

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

Todo pasa al paso previo del plan del mapa del admin (`work/mapa-del-admin/`):
la Task 3 (README y AGENTS.md del deploy real), la Task 5 (el checklist para
Mateo o Gastón, que sigue en el `PLAN.md` de esta lane, en el historial) y la
Task 6 (verificar en producción).

- Las cuatro preguntas del SPEC §3 (cuenta y proyecto, cómo se deployaba lo de antes, nombres de las variables, base existente). Con las respuestas se escribe la Task 3.
- Si la integración de Neon en el plan gratis da una rama por preview.

## Verification

### 2026-09-23 — M DoD de las Tasks 1, 2 y 4, sobre `main` `e4cf0c9` — PASS
- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 · `node scripts/verificar-react-doctor.mjs` → exit 0 («100/100, sin diagnósticos»)
- L2 behavioral: `pnpm test` → exit 0 (79 tests, 0 fallan; incluye los cinco de `esUnPreviewDeVercel`: ningún valor de `VERCEL_ENV` cierra producción) · el `buildCommand` de `apps/sitio/vercel.json` paso por paso: `pnpm -w run generate` → exit 0, `pnpm migrate:status` → al día (6 migraciones; `migrate:deploy` no tenía nada que aplicar), `pnpm build` → exit 0 (21 páginas estáticas)
- L3 end-to-end: `GET /robots.txt` en local (no es un preview) → `Allow: /` con `Disallow: /admin`, `/api/` y `/vista-previa`. El cierre de los previews y el deploy real no corren en local: son la Task 6.
- Close review: 0 seats, decisión del owner (DECISIONS, 2026-09-23). La Task 2 tuvo su revisión antes del merge (ver «Hecho»).
