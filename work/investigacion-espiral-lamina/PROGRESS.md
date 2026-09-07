# PROGRESS — investigacion-espiral-lamina

## In progress

- Paso 1 hecho y pendiente de commit; sigue el paso 2 (extracción sin cambiar
  el render).

## Dónde corre

- Worktree propio desde el 2026-09-07:
  `C:/Users/mateo/orca/workspaces/Empoderamiento-Docente/investigacion-espiral-lamina`
  (id Orca `f7cc7a9e-dc21-4000-8887-428b0d116fdb::<esa ruta>`), rama
  `feat/investigacion-espiral-lamina` desde `main` en `ed54f91`. Motivo en
  DECISIONS (criterio de aislamiento: checkout ocupado por otra sesión).
- Dev server de la lane: terminal de Orca `next-server 3001 (lamina)`
  (`term_8b20bd75-…`), `pnpm dev -p 3001` → `http://localhost:3001`.
- Navegador embebido de Orca: pestaña propia `browserPageId 6dd7ad70-…`,
  viewport con `orca exec --command "set viewport <w> <h>"`.
- Scratchpad de la sesión (probes, baseline, helper `oe.mjs` para parsear
  `orca eval --json`, hook `hooks-ts.mjs` para correr `.ts` con Node 24):
  `C:/Users/mateo/AppData/Local/Temp/claude/C--Briar-repos-work-Empoderamiento-Docente/e1bcbdeb-8937-4cb9-adef-bc07d8d5681d/scratchpad`.

## Pasos del PLAN

- **Paso 0 — baseline y entorno** (2026-09-07, sin commit). El `#ciclo`
  pinneado queda envuelto en `.pin-spacer`: la zona es
  `#ciclo .pin-spacer > div`. Baseline en el scratchpad:
  `baseline-ciclo-ssr.html` (SSR de `<section id="ciclo">`, 11467 bytes: es la
  versión estática, porque `live` arranca en `false`),
  `antes-hoja03-fin-vuelta1.png` (escena vieja congelada en progreso 0.400),
  `probe-jump-old.js`. `node -v` = v24.18.1 (strip-types nativo).
  `orca status --json` → runtime `ready`.
- **Paso 1 — geometría de cámara y anotaciones** (2026-09-07). Nuevo módulo
  `src/features/investigacion/components/lamina-espiral.ts` (126 líneas):
  `Encuadre`, `ENCUADRE_GENERAL`, `ENCUADRE_INTERIOR` (cx 181, cy 271,
  alto 240 → scale 2), `transformDeEncuadre`, `Lado`, `ANOTACIONES` (9),
  `INDICE_REMATE`, `guiaAnotacion`, `posicionAnotacion`. Primero se agregó al
  final de `espiral.ts` y quedó en 223 líneas, así que se movió a módulo
  propio; `espiral.ts` vuelve a sus 97 líneas sin cambios. Aceptación:
  `pnpm typecheck` → 0; `eslint` sobre los dos archivos → 0;
  `node --import file:///<scratch>/hooks-ts.mjs <scratch>/probe-espiral.mjs`
  → `PROBE OK`, exit 0 (nueve anclas con lado esperado, todas dentro de
  [−35, 135] %; general = identidad). Commit: pendiente de OK del owner.

## Tried and failed

- Probe con `node --import C:/...`: Node toma `C:` como esquema de URL; va
  `file:///C:/...`. Y el hook de resolución con regex `\.` en un heredoc perdió
  la barra: se reescribió sin backslashes (`lastIndexOf`).
- Cortar el bloque de `espiral.ts` con `indexOf("...\n...")`: el archivo es
  CRLF; normalizar antes (memoria `repo-usa-crlf`).

## Next

- Paso 2 del PLAN en el worktree.

## Verification

- (sin evidencia de cierre todavía)
