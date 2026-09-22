# PROGRESS — El editor sin pared

- **Rama:** `mateo/rework-visual-admin`
- **Base:** `ac3f325` (= `mateo/armazon-del-admin`, PR #173, al 2026-09-22)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** `DECISIONS.md` (se crea con la primera)

## Baseline (2026-09-22, antes de tocar código)

Medido con Playwright contra `next dev -p 3003` (con
`NEXT_PUBLIC_SITE_URL=http://localhost:3003` en esa terminal: sin eso,
better-auth rechaza el login por origen). Capturas en
`%TEMP%\rework-admin\antes\` (17 archivos, fuera del repo).

- Editor de Inicio › Hero: `scrollHeight` 12.688 px a 1440 × 900 y 13.181 a
  390 × 844. Las 19 tarjetas suman 11.418 px (526–730 cada una). 67
  controles.
- Barra fija del editor: 65 px a 1440, 159 a 390.
- Tamaños de texto en el editor: 12 px × 57, 14 px × 115, 16 px × 53,
  18 px × 1. 2 niveles de caja con borde alrededor de un input.
- Sidebar: 288 px; ítems de 36 px con texto de 14 px.
- Contraste: borde de input `azul-claro`/blanco 1,77; `gris-texto`/`gris-fondo`
  4,39; «Publicar» deshabilitado 1,76; `azul-medio`/blanco 5,11.
- El `h1` es sr-only en la portada y en el editor.

## Done

- 2026-09-22 — Diseño aprobado por Mateo en conversación (shaping, secciones
  1 a 5) y SPEC aprobado (design-first).

- 2026-09-22 — PLAN y lista de 16 commits aprobados por Mateo. Traspaso
  decidido por él: la lane la implementa, verifica y cierra una sesión
  `pegasuz` en este worktree (la que escribió SPEC y PLAN corría en la cuenta
  personal, casi sin tokens).

- 2026-09-22 — Paso 0: la lane abierta con `SPEC.md`, `PLAN.md` y este
  archivo, sin las marcas de espera.
