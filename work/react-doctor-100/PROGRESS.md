# PROGRESS — react-doctor-100

Primera lectura de cada sesión. Si no está acá, no pasó.

## Done

- 2026-09-08 — Shaping con el owner (cuatro secciones aprobadas). Tres relevamientos
  de lectura completa copiados a esta carpeta. Baseline JSON de react-doctor guardado
  (`react-doctor-baseline.json`: 58/100, 120 hallazgos, 43 archivos).
- 2026-09-08 — Rama `refactor/react-doctor-100` abierta desde `main` en `b8a4f93`.

- 2026-09-08 — **Enmienda del SPEC (§0) aprobada por el owner** tras el relevamiento del
  delta (`relevamiento-delta.md`). PLAN reescrito (36 pasos), `feature_list.json` (37
  filas), DECISIONS con las rulings.
- 2026-09-08 — **Fase 0 completa (PLAN paso 0).** `node -v` = v24.18.1. Baselines en el
  scratchpad de esta sesión (ruta abajo): `baseline-ssr/` (8 rutas, validadas contra sí
  mismas), `baseline-probes/desktop-pw/` (8 rutas × 6 fracciones a 1536×850, Playwright,
  más `<ruta>-top.png`), `baseline-probes/desktop-pw-b/` (segunda pasada),
  `baseline-probes/mobile/` (8 × 4 a 390×844 con `isMobile` + `hasTouch`; `hover: none`
  real; más capturas). Doble pasada desktop comparada con `probe-compare.mjs` (tol 0.02):
  idéntica salvo `data-caret` (parpadeo). **`PROBE_IGNORE=data-caret`.** La pasada
  inicial por Orca (`baseline-probes/desktop/`, 4 rutas) queda como referencia pero no es
  el instrumento (DECISIONS). Scripts: `ssr.mjs`, `rd-count.mjs`, `probe-extract.mjs`,
  `probe-compare.mjs`, `probe-scene.js` + `probe-run.sh` (Orca, ya no se usan).

## In progress

- PLAN paso 1: exports no-componente a módulos `.ts`.

## Dónde corre

- Checkout principal `C:/Briar/repos/work/Empoderamiento-Docente`, rama
  `refactor/react-doctor-100` sobre `bygama/gar` (decisión del owner: lo hace el agente
  acá, de a poco, reviewers al final). Orden de merge: gar primero, esta lane después.
- Dev server: terminal de Orca `next-server (v16.2.6)` de este checkout
  (`term_77e017a6-…`), puerto **3000**. El 3001 es el del worktree `gar`.
- Navegador embebido de Orca: pestaña `browserPageId 16c8d898-…` ligada a este
  worktree; panel real 1372×921, `hover` y `pointer: fine` verdaderos (los gates `live`
  montan). Viewport 1536×850 con `orca exec --command "set viewport 1536 850"` después
  del `goto`. Para 390×844 antes de hidratar (mobile de verdad): Playwright.
- Regenerar el baseline si el scratchpad se pierde: worktree temporal en `112de56`, dev
  server propio, `ssr.mjs` y `probe-run.sh` contra ese puerto.
- Scratchpad de la sesión que abrió la lane (baseline JSON, relevamientos originales):
  `C:/Users/mateo/AppData/Local/Temp/claude/C--Briar-repos-work-Empoderamiento-Docente/b836654c-ba8b-431d-b151-94bc594e8072/scratchpad`.

## Tried and failed

- 2026-09-08 — SPEC aprobado por el owner. PLAN.md, `feature_list.json` (35 filas) y
  DECISIONS.md escritos; apertura de la lane commiteada (`bc0e8bf`, después `1a0dabd`).
- 2026-09-08 — **Rebase sobre `bygama/gar`** (`112de56`) por decisión del owner (ver
  DECISIONS) y push de la rama a `origin/refactor/react-doctor-100`. Baseline re-medido
  sobre la nueva base: **57/100, 126 hallazgos, 44 archivos** (`react-doctor-baseline.json`;
  el de `main` queda en `react-doctor-baseline-main.json`). Delta: +6 netos; reglas nuevas
  `click-events-have-key-events`, `no-static-element-interactions`, `no-broken-image-source`
  (todas en `components/layout/IndicePagina.tsx` y `TeamProfileOverlay.tsx`), 17.º gigante
  (`IndicePagina`), `CarpetaCaso` ahora gigante y de alta complejidad; `src/config/aliados.ts`
  ya existe (lo creó gar): el paso 9 del PLAN cambia de alcance (ver enmienda del SPEC).
- 2026-09-08 — Fase 0, arnés SSR validado: `ssr.mjs` (scratchpad) contra el dev server
  del puerto 3000 (el de este checkout; el 3001 es el del worktree `gar`), las 8 rutas
  idénticas a sí mismas en dos tomas (85161 / 42993 / 107552 / 154656 / 85025 / 23339 /
  87610 / 124088 bytes). Baseline guardado en `<scratchpad>/baseline-ssr/*.html`. Hay que
  invocarlo con `MSYS_NO_PATHCONV=1` (Git Bash convierte `/` en una ruta de Windows) y
  `BASE=http://127.0.0.1:3000`.

## Next

- PLAN pasos 1-9 (exports, hoists, keys, viewport, refs, useEffectEvent, dedupes), después
  los 16 splits (10-25), después la fase 2 (26-34).

## Verification

<!-- Solo evidencia PASS, la escribe work-verify (lo más nuevo arriba). El cierre no
     cierra la lane sin un bloque PASS vigente acá. -->
