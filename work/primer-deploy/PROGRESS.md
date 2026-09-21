# PROGRESS — El primer deploy

- **Rama:** `chore/primer-deploy` (todavía no creada)
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** `PLAN.md` (se escribe cuando el
  spec quede aprobado) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: spec escrito, pendiente de revisión del owner. Sin cambios en el
repo ni en Vercel.**

## Baseline

Medido sobre `f3f3f9c`:

- No hay proyecto en Vercel, ni `vercel.json`, ni `.vercel/`.
- El README dice «Deploy: pendiente de definir».
- El build local (`pnpm build`) pasa; `pnpm migrate:deploy` aplica las tres
  migraciones sobre una base vacía (probado el 2026-09-21 en Docker).
- El admin en local entra, sale y elige contraseña (probado el 2026-09-21).

## Hecho

(nada todavía)

## Abierto

- En qué cuenta de Vercel vive el proyecto (recomendación: la de Facundo, y
  transferir a ED después).
- Si la integración de Neon en el plan gratis da una rama por preview.
