# PROGRESS — Fase 1: los cimientos del admin

- **Rama:** `mateo/cimientos-del-admin`, sobre el **checkout principal**
- **Base:** `6d72bc0` (= `origin/main`, fase 0 mergeada)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) ·
  **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `6d72bc0`, antes de tocar nada:

- `pnpm typecheck` · `pnpm lint` · `pnpm build` → exit 0
- `node scripts/verificar-react-doctor.mjs` → **100/100, 294 archivos**, un
  solo proyecto (`apps/sitio/src`). Al sumar `packages/` tienen que aparecer
  dos, y los dos en 100.
- `node scripts/comparar-render.mjs` → es la referencia del sitio público:
  esta fase no puede moverlo.
- Entorno local: contenedor `ed-postgres` en el puerto 5435, con la base
  `ed_panel` y sus 9 tablas de Payload. La base `ed` que nombran el README y
  el `.env.example` **todavía no existe**.
- Registry, revalidado hoy: `prisma@latest` → `8.0.0-rc.15`, estable `7.10.0`
  en el tag `prev`. La decisión del ADR-0007 se mantiene. better-auth 1.7.5, MIT.

## Hecho

- Nada todavía.

## In progress

- Paso 1 del PLAN: abrir `packages/` con `db` y sumarlo a las dos listas del gate.

## Próximo

- Pasos 2 a 9, en orden, **commiteando cada uno apenas pase su aceptación**.
- Al cerrar: `work-verify` con la review dimensionada por **ocho pasos en
  `high`**, siete de los cuales tocan auth o seguridad. Después `work-handoff`.

## Notas

- **`ed_panel` no se toca.** Queda huérfana; borrarla es decisión del owner.
- **Dependencias a instalar** (AGENTS.md §5.6, confirmadas por el owner):
  `prisma@7.10.0` exacta, `@prisma/client`, `@prisma/adapter-neon`,
  `better-auth`. `@vercel/blob` y `resend` llegan cuando haga falta subir una
  foto o mandar un correo de verdad.
