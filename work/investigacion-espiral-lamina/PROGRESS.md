# PROGRESS — investigacion-espiral-lamina

## In progress

- Cierre: PR a main y merge por rebase (work-handoff).

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
  [−35, 135] %; general = identidad). Commit: el del paso 1 (feat: calcular la cámara y las anotaciones).

- **Paso 2 — extracción sin cambiar el render** (2026-09-07). Nuevos
  `EspiralSvg.tsx` (76), `EspiralEstatica.tsx` (76, con su `Bloque` estático
  privado) y `estaciones.ts` (63, el copy de las ocho estaciones, la nota y el
  remate); `EspiralInvestigacion.tsx` queda en 167 líneas como compositor con
  el layout live viejo y sus `Bloque`/`Nota` de escena. Aceptación:
  `pnpm typecheck` → 0; `eslint src/features/investigacion/components/` → 0;
  `wc -l` ≤ 200 en los cuatro; SSR de `<section id="ciclo">` desde
  `http://localhost:3001/investigacion` → `cmp` con `baseline-ciclo-ssr.html`
  exit 0 (11467 bytes idénticos). Commit: refactor(investigacion): extraer el
  svg y la versión estática de la espiral.

- **Paso 3 — grupo de cámara y guías** (2026-09-07). `EspiralSvg` gana la
  prop `lamina`: con ella el dibujo va dentro de `<g data-espiral-camara>` y
  suma nueve `<line data-espiral-guia data-indice>` con `opacity="0"` (la
  coreografía las dibuja); sin ella renderiza exactamente como antes.
  `lamina-espiral.ts` exporta `LARGO_GUIA`. El layout live pasa
  `<EspiralSvg lamina />`. Aceptación: typecheck → 0; eslint → 0; navegador
  de Orca sobre el 3001 a 1592×969 (live): guías 9, cámara true; Playwright a
  390×844: live false, guías 0, cámara false; SSR de `#ciclo` → `cmp` exit 0
  con el baseline. Commit: feat(investigacion): agrupar la espiral bajo una
  cámara y trazar las guías.
  Maña: en el navegador de Orca `set viewport` se pierde al navegar y la
  hidratación gana la carrera, así que los chequeos a viewport fijo con
  `matchMedia` de montaje van por Playwright (`browser_resize` +
  `browser_navigate`); Orca sigue para todo lo demás.

- **Pasos 4 y 5 — la lámina y su encaje** (2026-09-07, un solo commit: el
  encaje no se pudo validar separado del anclaje, ver DECISIONS). Nuevos
  `EspiralLamina.tsx` (escena live: rincón narrador con tres voces, figura
  bajo la cámara, nueve anotaciones colgadas de los nodos por
  left/right/top/bottom) y `recorrido-espiral.ts` (personaje y cámara como
  funciones del tiempo); `coreografia-espiral.ts` reescrita en tres
  movimientos (`RECORRIDO_ESPIRAL` 3000, todo fromTo explícito);
  `EspiralInvestigacion.tsx` queda como compositor (90 líneas);
  `lamina-espiral.ts` con encuadre interior 1.6×, `alcance` por anotación
  (remate 118) y `LARGO_GUIA`; `estaciones.ts` con `breve` (textos cortos
  para la lámina, pedido del owner; la estática conserva los canónicos).
  Aceptación (navegador de Orca sobre el 3001): `[data-espiral-anotacion]`
  9, `[data-espiral-voz]` 3, `[data-espiral-guia]` 9; `end − start` del pin
  = 3000; probe de escena en 0 / 0.29 / 0.49 / 0.80 / 1.0, ida, resize y
  vuelta → anotaciones {0} · {0,1,2,3} · {4} · {4,5,6,7} · {8} y voces {0} ·
  {0} · {1} · {2} · {2} en las nueve lecturas, OK true; guía del remate en
  p=1: opacity 1, dashoffset 0; probe de encaje (dentro de la hoja, sin
  pisar voz ni chrome, opacidad > 0.5) OK true a 1536×850, 1920×1080 y
  1280×720; `pnpm typecheck` → 0; `eslint` → 0; `wc -l` ≤ 200 en todos;
  `grep -E "#[0-9a-fA-F]{6}"` → 0. Capturas `s7-*.png` en el scratchpad.
  `#evidencia` queda para work-verify (DoD 10). Commits: content(…) textos
  breves + feat(…) lámina anotada con cámara.

- **Paso 5b — jerarquía y entrada escalonada** (2026-09-07). `estaciones.ts`
  gana `clave` por estación; `EspiralLamina.tsx` marca la clave con un
  `<mark>` en peso medio y un span de subrayado verde (`data-anot-subrayado`),
  nombre en `clamp(1.1rem, 2.1svh, 1.3rem)` y cuerpo en azul al 75 %;
  nuevo `anotacion-espiral.ts` (57 líneas) con `gestosAnotacion`: reposo,
  entrada (guía → bloque → nombre → texto → subrayado con scaleX) y salida;
  `coreografia-espiral.ts` los usa y queda en 182 líneas; `pausa` 0.6 → 0.8
  porque la última anotación de cada vuelta tarda ~0.56 en entrar.
  Aceptación (navegador de Orca sobre el 3001): probe de escena ida, resize
  y vuelta en 0 / 0.30 / 0.49 / 0.82 / 1.0 → OK; probe de subrayado (solo el
  de la 01 a p=0; los cuatro a scaleX 1 con nombre y texto a opacidad 1 a
  p=0.30; los cuatro de la vuelta 2 a p=0.82; el remate a p=1) → OK; encaje
  OK a 1536×850, 1920×1080 y 1280×720; typecheck → 0; eslint → 0; ≤ 200
  líneas; cero hex. Capturas `s8-*.png`. Commit: style(investigacion):
  jerarquizar y escalonar las anotaciones de la lámina.

- **Paso 6 — registrar la decisión** (2026-09-07). Nota fechada 07-09-2026
  (formato del doc) debajo de la del 04-09 en
  `docs/content/arquitectura-investigacion.md` §6; los doc-comments de
  `EspiralInvestigacion.tsx` y `coreografia-espiral.ts` ya describen la
  escena nueva desde el paso 4. Aceptación: `grep -c "07-09-2026"` → 1 (el
  PLAN decía "2026-09-07"; el doc fecha DD-MM-YYYY); en la coreografía la
  única mención a «releva» es la del rincón narrador, que sí releva. Commit:
  docs(investigacion): registrar la lámina anotada en el doc de contenido.

## Tried and failed

- `pnpm lint` del proyecto falla por `react-hooks/refs` en
  `que-hacemos/TorreLineas.tsx` (refs asignadas durante el render) y un
  warning en `quienes-somos/MiradaEd.tsx`. Preexistente en `main`, fuera de
  esta lane: queda para un fix propio.

- Anclar las anotaciones con `-translate-*` de Tailwind: GSAP reescribe el
  `transform` y se pierde. Cajas por left/right/top/bottom.
- `gsap.set(camara, { x, y, scale, svgOrigin: "0 0" })`: matriz distinta a
  la calculada. Cámara escrita a mano desde el tiempo.
- `autoAlpha` solo en el `from` de la guía: al final queda apagada.
  Explícito en ambos extremos.
- `.to()` con scrub e invalidateOnRefresh: estados fantasma al volver.

- Probe con `node --import C:/...`: Node toma `C:` como esquema de URL; va
  `file:///C:/...`. Y el hook de resolución con regex `\.` en un heredoc perdió
  la barra: se reescribió sin backslashes (`lastIndexOf`).
- Cortar el bloque de `espiral.ts` con `indexOf("...\n...")`: el archivo es
  CRLF; normalizar antes (memoria `repo-usa-crlf`).

## Next

- Nada pendiente en la lane. Deuda fuera de alcance: lint preexistente en
  que-hacemos/TorreLineas.tsx y quienes-somos/MiradaEd.tsx; validación de
  contenido de los textos breves (`breve`, `clave`) por el owner.

## Verification

Corrida el 2026-09-07 en el worktree, rama `feat/investigacion-espiral-lamina`
en `2a8af1f`, contra `http://localhost:3001` (navegador embebido de Orca
para los probes de escena y encaje; Playwright para viewport fijo antes de
hidratar, reduced-motion y el ancla).

| DoD | Evidencia | Resultado |
| --- | --- | --- |
| 1 `pnpm typecheck` | `tsc --noEmit` | exit 0 · PASS |
| 2 `pnpm lint` | proyecto entero: 5 errores + 1 warning, todos en `que-hacemos/TorreLineas.tsx` y `quienes-somos/MiradaEd.tsx`, archivos idénticos a la base `ed54f91` (`git diff --stat ed54f91 -- src/features/que-hacemos/` vacío); `eslint` sobre los 9 archivos de la lane | lane exit 0 · PASS con deuda preexistente fuera de alcance (ver Tried and failed) |
| 3 `pnpm build` | `next build`, `/investigacion` prerenderizada | exit 0 · PASS |
| 4 copy íntegro | grep -F de los 8 nombres, la nota de bisagra y el remate en `estaciones.ts` | 10 / 10 · PASS |
| 5 sin hex | `grep -E "#[0-9a-fA-F]{6}"` sobre los 9 archivos tocados/creados en `src/` | 0 · PASS |
| 6 tamaño | `wc -l` máximo: `coreografia-espiral.ts` 183 | ≤ 200 · PASS |
| 7 encaje | probe `probe-encaje.js` (toda anotación con opacidad > 0.5 dentro de la hoja, sin cruzar la voz visible ni el chrome) en 0 / 0.30 / 0.49 / 0.82 / 1.0 | OK a 1536×850, 1920×1080 y 1280×720 · PASS |
| 8 pin | `pin-spacer.offsetHeight − zona.offsetHeight` | 3000 · PASS |
| 9 estática intacta | SSR de `<section id="ciclo">` byte a byte igual al baseline (`cmp` exit 0, 11467 bytes); Playwright 390×844: live false, 0 guías, 0 anotaciones, 2 `ol`, 8 `li`, destacado presente (captura de la hoja 03 `lamina-touch-390x844-ciclo.png` en el scratchpad; el «antes» no se guardó por un error de ruta, la identidad del SSR lo cubre); Playwright 1536×850 con `reducedMotion: reduce`: 0 guías, sin cámara, sin pin, 2 `ol` / 8 `li` | PASS |
| 10 `#evidencia` | Playwright 1536×850 → `/investigacion#evidencia`: `zona.dataset.progreso` 0.435 estable en 4 lecturas; esperado 3.7 / 8.51 = 0.4348 | PASS |

Review de cierre: 0 seats, por override explícito del owner («sin reviewers
y fue confio pr merge», en DECISIONS). Rung de review declarado NO corrido.

Además: probe de escena ida + resize + vuelta → conjuntos exactos en las
nueve lecturas; probe de subrayado OK; consola sin errores ni warnings en
la carga de la escena.

