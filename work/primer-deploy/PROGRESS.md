# PROGRESS — Poner al día el deploy

- **Rama:** `chore/primer-deploy` (todavía no creada)
- **Base:** `f3f3f9c` (= `origin/main` al 2026-09-21)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: en ejecución. Task 1 hecha (bc40e65); Task 2 en curso con el criterio nuevo (`VERCEL_ENV`); Tasks 3 y 4 después; Task 5 es un checklist para Mateo o Gastón, que tienen la cuenta de Vercel.**

## Baseline

Medido sobre `f3f3f9c`:

- El sitio YA está en producción en Vercel con el dominio (`https://empoderamientodocente.org`, `Server: Vercel`), pero es un build viejo: `/admin` 404, sin `robots.txt`, sin analítica. La cuenta es de Mateo y Gastón; GitHub no muestra deployments ni checks de Vercel.
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
