# PROGRESS — El editor sin pared

- **Rama:** `mateo/rework-visual-admin`
- **Base:** `ac3f325` (= `mateo/armazon-del-admin`, PR #173, al 2026-09-22)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Cierre (2026-09-22)

- Los 16 pasos commiteados, las capas 1 a 3 en verde y la revisión de cierre
  en **PASS** (1 revisor, Opus; el veredicto, textual, en `## Verification`).
- **Los hallazgos del revisor no se arreglaron en esta lane:** Mateo, con el
  triage en la mesa, dijo «perfecto pr merge» y eligió «Todo a main». Quedan
  diferidos y anotados en DECISIONS (el Important de «Salir» incluido) y en
  el cuerpo del PR, para la lane 2 o un cambio chico aparte.
- Cómo sale: el #173 se mergea a `main` (rebase and merge), esta rama se
  rebasea sobre `main`, y su PR va contra `main` y se mergea igual. La
  carpeta de la lane se va en el último commit del PR.
- Entorno al cerrar: dev server en la terminal «next-server» de este
  worktree (`localhost:3003`); base local en 0 páginas y 0 fotos,
  `apps/sitio/.fotos/` vacío; el caché viejo de Turbopack quedó apartado en
  `%TEMP%\rework-admin\turbopack-cache-paso5` (se puede borrar).

## Verification

### 2026-09-22 — L DoD (SPEC §6) — PASS (capas 1 a 3 y revisión de cierre)

Árbol: `1ac5c0f` (los 16 commits de la lane sobre `ac3f325`), sin cambios de
código sin commitear. Playwright contra `next dev -p 3003`. Capturas del
después en `%TEMP%\rework-admin\despues-*.png` (entrar, portada, lista,
editor arriba, con tarjeta abierta y en navy, panel del celular; 1440 y 390).

- **L1 estática:** `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0, «react-doctor: 100/100,
  sin diagnósticos (apps/sitio/src: 391 archivos · packages/db/src: 3 ·
  packages/auth/src: 5)».
- **L2 comportamiento:** `pnpm test` → exit 0, «tests 79 · pass 78 · fail 0 ·
  skipped 1» · `pnpm build` → exit 0, «Compiled successfully», 21/21
  páginas (`/admin/paginas/[slug]` dinámica) · arranca: `curl
  localhost:3003/admin/entrar` → 200.
- **L3 de punta a punta** (`.playwright-mcp/verificacion-final.js` y
  `barrido-contraste.js`, fuera del repo por `.gitignore`):
  1. Alto del editor con todo cerrado: **1.230 px a 1440** y **2.076 a 390**
     (pide < 2.500; antes 12.688 y 13.181).
  2. A 1440, las tarjetas 7 y 11 terminan en y=817 con la pantalla de 900:
     la grilla de computadora entra entera, cualquier tarjeta a 1 clic.
  3. Un `h1` visible «Inicio» (24 px), 1 insignia («Sin editar»), 1 solo
     primario («Publicar»), 0 botones `disabled`; barra del celular `fixed`,
     **65 px**, pegada a 844 (pide ≤ 72).
  4. Contraste, barrido automático (texto contra el píxel real del fondo, con
     el texto escondido; salta lo que no se dibuja o está tapado): entrar
     (1440, 390, con error), portada, lista, editor (limpio, con aviso, con la
     tarjeta 1 abierta, navy) a 1440 y 390, y el panel del celular: 16
     pantallas o estados, **0 pares reales por debajo de AA**; el más bajo,
     «Publicar» 4,54. El único que el barrido marcó («Lleva cartel», 1:1) es
     un artefacto: el punto caía en la casilla tildada (x 879, casilla
     867–883, texto desde 891); detrás del texto, `rgb(255,255,255)` → 13,63.
     La primera corrida dio cientos de «fallas» del mismo tipo (texto adentro
     de `details` cerrados, tapado por la barra fija o por el modal): se
     corrigió el barrido, no el código. Los pares nuevos, anotados en los
     pasos 1 a 8.
  5. Teclado y lector: Enter sobre el `summary` de la tarjeta 5 la abre y la
     cierra; Tab desde la 1 recorre 1…12 (orden del DOM); en la foto, ↓ y
     Shift+← → foco «25% 55%» y la región viva dice «Foco en 25% 55%»;
     dentro de la tarjeta, Tab: foco → alt → **«Cambiar foto…»** → casilla →
     Título → Descripción; los avisos llevan `role="status"` («No hay
     cambios para guardar.») y `role="alert"` (error del login); el navy y el
     `confirm` al salir, en el paso 8.
  6. Nada se rompe: «Guardar borrador» sin cambios → aviso; con «(prueba)» en
     el título → navy → guardar → blanco, «Borrador sin publicar»; «Vista
     previa» abre otra pestaña en `/` que muestra «(prueba)» y avisa;
     «Publicar» → «Publicada», «Publicado: el sitio ya muestra esta versión.»,
     y `GET /` trae «(prueba)»; republicado el título original → `GET /` sin
     «(prueba)»; otro borrador → «Descartar borrador» (confirm aceptado) →
     recarga, «Publicada», título original, sin diálogos colgados; subir foto
     en la tarjeta 2 → miniatura `/api/fotos/1d66d4ff-…`, foco 50 % 50 %,
     input nativo de 1 px. **Limpieza:** `delete from paginas where slug =
     'inicio'` (publicada con el título original; antes de la prueba había 0
     filas) → DELETE 1; la foto (fila y archivo) → DELETE 1 y 0 archivos; la
     cookie de vista previa, borrada; `GET /` sin «(prueba)».
- **Close review — correctness against the SPEC (Opus, medium): PASS** con
  1 Important y 5 Minor. Veredicto textual del asiento, pegado sin editar
  (los `&lt;`/`&gt;` del transporte, como `<`/`>`):

````text
### DoD run

**L1, static checks (from the repo root, HEAD `1ac5c0f`)**
- `pnpm typecheck`: exit 0. Output: `apps/sitio typecheck: Done`
- `pnpm lint`: exit 0. Output: `apps/sitio lint: Done`
- `node scripts/verificar-react-doctor.mjs`: exit 0. Output: `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 391 archivos · packages/db/src: 3 archivos · packages/auth/src: 5 archivos)`

**L2, behavior**
- `pnpm test`: exit 0. Output: `tests 79` · `pass 78` · `fail 0` · `skipped 1`. The skipped test reports `# sin respuestas grabadas: falta correr A1`.
- `pnpm build`: exit 0. Output: `✓ Compiled successfully in 944ms`, `✓ Generating static pages using 25 workers (21/21)`, `ƒ /admin/paginas/[slug]`

**L3, end to end** (Playwright against `localhost:3003`, transitions turned off, using my own scripts)
1. **Editor height, all cards closed:** `scrollHeight` is **1230** at 1440×900 and **2076** at 390×844. The target is under 2,500.
2. **Cards on the first screen at 1440:** 19 `details[name]`, none open. The desktop grid ends at y=817 (cards 7–11 at 679–817) with `innerHeight` 900.
3. **Header and mobile bar:**
   - At 1440: one visible `h1` «Inicio» (24px), header `sticky` at 81px, a single orange button «Publicar», and 0 disabled buttons or inputs in `main`.
   - At 390: the bar is `fixed`, runs from 779 to 844, and is **65px** tall. The last visible control ends at 740 with the page scrolled to the bottom.
4. **Contrast:** I wrote my own sweep (WCAG formula, backgrounds composited through ancestors, color-mix colors converted through canvas). It returned **0 failures** in each state I ran:
   - `/admin`, `/admin/paginas` and the editor, at 1440 and at 390
   - the editor in navy mode, at 1440 and at 390
   - with card 2 open
   - with the CampoFoto error aviso showing
   - the mobile nav panel

   The lowest pair was «Publicar» at 4.54. The error aviso measured 5.79, and the navy detail line measured 7.68.
5. **Keyboard and screen reader:**
   - Only one card opens at a time (opening card 3 gives `[3]`; opening card 7 then gives `[7]`). An open card takes the full width (976 = the list width).
   - Enter on a card title closes it, opens it and closes it again.
   - Tab goes through `tarjetas#1…#11` and then `tarjetasCelular#1`.
   - Inside card 2, Tab goes: focus point → alt text → `file | Cambiar foto… | outline:solid rgb(74, 111, 165)` → checkbox.
   - ArrowDown then Shift+ArrowLeft moves the focus point: «Foco en 50% 50%» becomes «Foco en 25% 55%».
   - No «Choose File» text anywhere, and the native file input is 1×1px.
   - Avisos carry `role="status"` («No hay cambios para guardar.», «La página ya está publicada así.») and `role="alert"` («Escribí primero el texto alternativo…»).
   - Navy mode: the header background is `rgb(31, 45, 77)`, the `span[role=status]` reads «Cambios sin guardar.» in white, the focus outline is `rgb(169, 197, 232) solid 2px`, and the header goes back to `rgb(255, 255, 255)` after saving.
   - Leave guard: clicking the «Páginas» breadcrumb or «Todas las páginas» shows 1 confirm each and the URL stays put. The «Hero» link shows 0 confirms and goes to `#seccion-hero`. A synthetic `beforeunload` is `defaultPrevented: true` with unsaved changes and `false` after saving. A real `close({runBeforeUnload:true})` left the page open because the dialog was dismissed.
6. **Nothing broke:**
   - Save draft led to «Borrador sin publicar» (fuerte badge).
   - Preview opened `http://localhost:3003/` with «(prueba)» in it.
   - Publish led to «Publicada», and `curl /` found «(prueba)» (count 1).
   - Re-publishing the original title brought that count back to 0.
   - Discard with the confirm accepted reloaded the page with «Publicada», the original title, and no leftover `beforeunload` dialog.
   - A real photo upload in card 2 changed the thumbnail to `/api/fotos/b1af06ff…` and reset the focus to 50% 50%. Cancel clears the input.
   - Bajada: Enter gives `"Primera partex"` (no new line), pasting «a\nb» gives `"a b"`, `maxLength` is 140, and it renders as a TEXTAREA with `field-sizing: content`.
   - The counter at 9/18 is sr-only (1px) and at 16/18 it is visible. `aria-describedby` points to it in both cases.

   **Cleanup:** `DELETE 1` in `paginas`, `DELETE 1` in `fotos`, and the `.webp` file removed. Final state is `0` / `0` / 0 files. The `__prerender_bypass` cookie is cleared. `git status` is unchanged from the start.

Every PROGRESS number I re-measured matched: 1230, 2076, 65, 817, 24px, 4.54, 5.79, «25% 55%», and 79/78/1. PROGRESS says the step 10 test failed first; git history can't confirm that, because the test and the code land in the same commit (`18c53fd`).

The work is done well. Each SPEC §3–§5 requirement is in the code:
- The shared pieces don't import anything from ED.
- The leave guard lets same-page and new-tab links through.
- `soltar` stops the discard reload from asking twice.
- The list uses real `<details name>` with no reordering.
- The row summary is a pure, tested function.
- The only deviations are recorded in DECISIONS: the §5 amendment, `claseDeBoton` living in `clases.ts`, and the step 15 grep leaving out `Formulario*.tsx`.
- Out-of-scope paths (`features/`, `contenido/`, `datos/`, `Formulario*.tsx`) show no diff.

### Issues
#### Critical (Must Fix)
None.

#### Important (Should Fix)
- **`apps/sitio/src/admin/armazon/SalirDelAdmin.tsx:12-21` and `apps/sitio/src/admin/paginas/useFrenarSalida.ts:8`: «Salir» in the sidebar throws away unsaved changes without asking.** The guard only catches clicks on `a[href]`. «Salir» is a `<button>` that signs out and then calls `router.push("/admin/entrar")`, which is a client-side navigation, so neither the confirm nor `beforeunload` fires. SPEC §4 («Frenar la pérdida … la sidebar») names the sidebar as what has to be guarded. I found this by reading the code and did not click it, because that would have ended the shared session.

#### Minor (Nice to Have)
- **`apps/sitio/src/admin/paginas/Seccion.tsx:26`: when an aviso is showing, the sticky header covers half of the section title.** `lg:scroll-mt-28` is 112px, but the file's own comment says the header is 129px with an aviso. Measured after the «Hero» link: header bottom 129, section title from 112 to 149. SPEC §5 asks for the `scroll-margin` to be recalculated.
- **`apps/sitio/src/admin/paginas/EditorDePagina.tsx:150-151`: on a page that was never published, «Publicar» answers «La página ya está publicada así.»** Measured with 0 `paginas` rows: the badge says «Sin editar» and the detail says «El sitio muestra el contenido inicial del código.», so the aviso contradicts the header. It matches the SPEC text, but the wording is wrong for this state.
- **`apps/sitio/src/admin/campos/clases.ts:9`: the text box doesn't follow DESIGN.md §11 on focus.** DESIGN.md §11 says «Foco: outline de 2 px azul-medio separado 2 px». `ENTRADA` uses `outline-none` with a 1px border change from gris-texto to azul-medio plus an `azul-medio/30` ring. Measured on the focused alt input: `outline:none`. The two border colors are very close, and the ring is about 1.5:1 on white, so the focused state is weak.
- **`apps/sitio/src/admin/paginas/useFrenarSalida.ts:26-48`: the browser Back button also drops unsaved changes.** Measured: `/admin/paginas` → Editar → type → `goBack()` ends at `/admin/paginas` with no confirm and no `beforeunload`. The SPEC doesn't list Back, but it goes against the «Frenar la pérdida» goal.
- **SPEC §6.2 says «cualquier tarjeta»,** but at 1440×900 the 8 mobile cards start at y=901. The criterion only holds under the SPEC's own parenthesis («la grilla de computadora»). PROGRESS should say that scope out loud.

### Out-of-lens
- `apps/sitio/src/admin/campos/CampoFoto.tsx:141`: the focus dot is `bg-verde-concepto`, on the same screen as the orange «Publicar» (DESIGN §1 rule 4). This existed before the lane.
- `apps/sitio/src/admin/armazon/Campos.tsx:68`: the `role="status"` element is created together with its text, so some screen readers may not announce the first confirmation. This pattern existed before the lane.
- `ListaDePaginas.tsx:29` and `(protegido)/page.tsx:16`: the «Editar» and «Ir a Páginas» links still use the `azul-claro` border. SPEC §3 moves these to lane 2.

### Verdict
**PASS**: every DoD command ran green (typecheck, lint and react-doctor exit 0 with `100/100, sin diagnósticos`; `tests 79 · pass 78 · fail 0 · skipped 1`; build exit 0), and every L3 criterion checked out in my own browser run (1230 / 2076 px, desktop grid ends at 817 < 900, bar 65px, 0 contrast failures, the full save/preview/publish/discard/upload cycle, DB back to 0/0). The Important item is a leave-guard gap in the SPEC's intent, not its wording; I'd have the owner decide on it before the PR, but it doesn't block the lane.
````


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
  archivo, sin las marcas de espera. Commit `671790f`; `git show --stat HEAD`
  → los 3 archivos de `work/editor-sin-pared/` y nada más.

- 2026-09-22 — Paso 1: `DESIGN.md` (+129 −1): `rojo-error` en la tabla de §1,
  regla 6 de §1 y el bloque de §8; `--text-admin-*` en §8; sección nueva §11
  «Admin» (fondo, tipo, bordes y foco, insignias, botones, encabezado,
  avisos). `grep -c "rojo-error\|text-admin-" DESIGN.md` → 23 (pide ≥ 8).
  CRLF comprobado (454 de 454 líneas). **OK de Mateo al diff** (herramienta
  de preguntas, «Va así, commiteá»). Commit `77ebb23`. Solo docs: el gate de
  código no cambia.
  - Pares nuevos (script de contraste): `rojo-error`/blanco 6,57 ·
    `rojo-error`/su tinte 8 % (#f9eded) 5,75 · blanco/`azul-principal` 13,63 ·
    `azul-principal`/`azul-claro/30` (#e5eef8) 11,63 · `azul-medio`/blanco
    5,11 · `gris-texto`/blanco 4,83 · `azul-principal`/`naranja-accion` 4,54 ·
    `azul-principal`/`naranja/90` sobre blanco 5,07 · `azul-claro`/navy 7,68 ·
    blanco/`white/10` sobre navy (#35425f) 10,02.
  - Pares que **no** pasan y por eso no se usan: `rojo-error`/navy 2,07 ·
    `azul-medio`/navy 2,67 · `azul-principal`/`naranja/90` sobre navy 3,93 ·
    `azul-medio`/`azul-claro/30` 4,36 · `gris-texto`/`azul-claro/30` 4,12.

- 2026-09-22 — Paso 2: `apps/sitio/src/app/globals.css` (+15):
  `--color-rojo-error` y los 4 `--text-admin-*` con `--line-height` (y
  `--letter-spacing` en los títulos), iguales a `DESIGN.md`. Gate con el
  archivo en el índice: typecheck 0 · lint 0 · react-doctor 100/100 (383 +
  3 + 5 archivos). Compilado con `@tailwindcss/node` 4.3.3 sobre el
  `globals.css` real (script en `%TEMP%\rework-admin\tw-check.mjs`):
  `.text-admin-titulo { font-size: var(--text-admin-titulo); … }` con
  `--text-admin-titulo: 1.5rem`, y `.bg-rojo-error` →
  `--color-rojo-error: #b42318`. CRLF 718/718. Commit `f193947`.

- 2026-09-22 — Paso 3: `ENTRADA` (`admin/campos/clases.ts`) es la única caja
  de texto: borde `gris-texto`, foco `azul-medio` + anillo `azul-medio/30`,
  `aria-invalid:border-rojo-error`, `text-admin-cuerpo`, `py-2`, sin margen.
  `ENTRADA_DE_ACCESO` borrada de `armazon/Campos.tsx`; `Campo` y
  `CampoContrasena` importan `ENTRADA`; `TextoCorto`, `Parrafo`,
  `RutaInterna` y el alt de `CampoFoto` ponen su `mt-1`. Gate con los 7
  archivos en el índice: typecheck 0 · lint 0 · react-doctor 100/100.
  `grep -rn ENTRADA_DE_ACCESO apps/sitio/src` → exit 1. Tailwind 4.3.3
  compila `aria-invalid:` a `[aria-invalid="true"]`. Playwright a 1440 en
  `/admin/paginas/inicio`: borde `rgb(107, 114, 128)` sobre fondo
  `rgb(255, 255, 255)` = 4,83:1; 16/24 px; 42 px de alto (el del login
  tenía 46: `py-2.5` → `py-2`, visto con Mateo). Commit `d419498`.

- 2026-09-22 — Paso 4: `admin/armazon/Boton.tsx` (`Boton`, `BotonEnlace`) y
  `admin/armazon/clases.ts` (`Variante`, `claseDeBoton`): 4 variantes,
  `min-h-10`, meta medium, foco `azul-medio`, `disabled:opacity-60` y
  `aria-busy:opacity-100` (Tailwind ordena `aria-busy` después de
  `disabled`: comprobado compilando). El `Boton` de `Campos.tsx` = primario
  `w-full`, misma firma. `BOTON_SECUNDARIO` borrado; `BarraDeAcciones`
  (los 4, con `aria-busy` en el que corre), `CampoFoto` y
  `paginas/error.tsx` usan `Boton`. Primer gate: react-doctor 98/100
  (`only-export-components` en `Boton.tsx:21`, por `claseDeBoton`) →
  arreglado moviéndola a `clases.ts` (DECISIONS). Gate final: typecheck 0 ·
  lint 0 · react-doctor 100/100 (385 archivos). `grep -rn BOTON_SECUNDARIO`
  → exit 1 · `git diff --cached --stat | grep -i formulario` → exit 1.
  Playwright, contexto limpio a 1440: «Entrar» 40 × 384 px,
  `rgb(224,122,47)` con texto `rgb(31,45,77)` (4,54:1), 14 px/500, y entra
  a `/admin`. Barra del editor: los 3 botones de 40 px. Commit `06a8606`.

- 2026-09-22 — Paso 5: `Aviso` (`admin/armazon/Campos.tsx`) restilado en
  su lugar: caja `flex` con borde izquierdo de 4 px; error `rojo-error`
  sobre `rojo-error/8` + `Alerta`, confirmación `azul-principal` sobre
  `azul-claro/30` + `Check`; `role` e `id` en el `<p>` del texto; × con
  `aria-label="Cerrar el aviso"` si llega `alCerrar`. `Alerta` sumado a
  `components/ui/icons/index.tsx` (trazo 1,5, `baseProps`). La etiqueta de
  `Campo` pasa a `text-admin-meta` (mismos 14/20 px). Gate: typecheck 0 ·
  lint 0 · react-doctor 100/100. `grep verde-concepto Campos.tsx` → exit 1.
  - **Turbopack sirvió CSS vieja**: el JS nuevo llegaba (ícono y
    estructura) pero la hoja no traía `bg-rojo-error/8` y sí la
    `aria-invalid:border-naranja-accion-texto` borrada en el paso 3. Tocar
    `globals.css` no alcanzó. Se paró el server (Ctrl+C por
    `orca terminal send`), se movió `.next/dev/cache/turbopack` a
    `%TEMP%\rework-admin\turbopack-cache-paso5` y se levantó de nuevo en su
    terminal con `NEXT_PUBLIC_SITE_URL`.
  - Playwright, contexto limpio a 1440, un intento con contraseña mala:
    `main p[role=alert]` «El correo o la contraseña no coinciden.», texto
    `rgb(180,35,24)` sobre el píxel del fondo `rgb(249,238,237)` (captura
    del elemento) = **5,79:1**; borde `rgb(180,35,24)`; ícono con
    `aria-hidden`; los dos inputs con borde rojo por `aria-invalid`.
    Commit `2bbbe32`.

- 2026-09-22 — Paso 6 `[batch]`: `(protegido)/layout.tsx` → `bg-white`; barrido
  (script en `%TEMP%\rework-admin\barrido.mjs`) sobre 14 archivos:
  `text-xs|sm` → meta, `text-base` → cuerpo, `text-lg|xl` → sección,
  `text-2xl|3xl` → título, `font-[family-name:var(--font-manrope)]` →
  `font-display`. Cambios por archivo: portada 3 · paginas/page 2 ·
  error.tsx 0 · ListaDePaginas 5 · metricas 1+1+3+4 · barra-lateral
  5+2+1+1 · SalirDelAdmin 1 · Pantalla 4 · CampoContrasena 2 (15 archivos,
  +31 −31). Gate: typecheck 0 · lint 0 · react-doctor 100/100. Playwright
  a 1440 en `/admin/paginas`: el párrafo bajo el `h1`, `rgb(107,114,128)`
  sobre el píxel `rgb(255,255,255)` = **4,83:1** (antes 4,39); `h1` 24 px;
  la ruta 14 px; la sidebar sigue en una fila por ítem con «Todavía no se
  edita» a 14 px. Commit `65eae85`.

- 2026-09-22 — Paso 7: nuevos `admin/armazon/Encabezado.tsx` (migas en la línea
  del `h1`, estado, detalle, acciones, avisos; `fijo` = `sticky top-0`),
  `admin/armazon/Insignia.tsx` (`Tono`: fuerte · normal con punto ·
  apagado), `admin/paginas/estado.ts` (`insigniaDelEstado`: borrador →
  «Borrador sin publicar» fuerte; publicado → «Publicada» normal; nada →
  «Sin editar» apagada) y `admin/paginas/EncabezadoDelEditor.tsx`; borrado
  `BarraDeAcciones.tsx`. `EditorDePagina`: «Guardar borrador» sin cambios →
  aviso «No hay cambios para guardar.»; «Publicar» sin borrador ni cambios →
  «La página ya está publicada así.»; el `Aviso` va en el encabezado con
  `alCerrar`. `[slug]/page.tsx` sin el `h1` sr-only. `EditorDePagina`:
  207 líneas, 158 de código. Gate: typecheck 0 · lint 0 · react-doctor
  100/100 (388 archivos). Playwright a 1440: 1 `h1` «Inicio» visible de
  24 px; 1 insignia «Sin editar»; 1 botón naranja («Publicar»); encabezado
  `sticky` de 81 px (129 con un aviso); 0 botones del encabezado
  `disabled` (los 19 «Subir foto» de `CampoFoto` siguen `disabled` sin
  archivo: los cambia el paso 13); «Guardar borrador» →
  `main header p[role=status]` «No hay cambios para guardar.»; «Publicar»
  → «La página ya está publicada así.»; «Cerrar el aviso» lo saca.
  Commit `9e44899`.

- 2026-09-22 — Paso 8: `Encabezado` + `resaltado` (fondo `azul-principal`,
  texto blanco, detalle/migas/foco `azul-claro`; avisos sobre una base
  `bg-white` propia); `claseDeBoton(variante, sobreAzul)` y `Boton` +
  `sobreAzul` (tabla «sobre azul» de DESIGN.md §11); `Insignia` +
  `sobreAzul`; `EncabezadoDelEditor`: `resaltado={haySinGuardar}` y un
  `<span role="status" class="empty:sr-only">` con «Cambios sin guardar.»;
  nuevo `admin/paginas/useFrenarSalida.ts` (`beforeunload` +
  `confirm` en captura para links a otra ruta del mismo origen; devuelve
  `soltar`, que `descartar` llama antes del `reload`). Gate: typecheck 0 ·
  lint 0 · react-doctor 100/100 (389 archivos). Playwright a 1440 (con las
  transiciones apagadas para medir: el browser del MCP anima a ~4 fps y
  `getComputedStyle` devolvía colores a mitad de la transición):
  - limpio: fondo `rgb(255,255,255)`, insignia «Sin editar» gris.
  - al escribir: fondo `rgb(31,45,77)`, `h1` blanco, «Cambios sin
    guardar.» blanco, detalle y migas `rgb(169,197,232)`, insignia en
    `azul-claro`, «Guardar borrador» y «Vista previa» con texto y borde
    blancos, «Publicar» `rgb(224,122,47)`/`rgb(31,45,77)`, foco de «Vista
    previa» `rgb(169,197,232) solid 2px`.
  - con un borrador guardado: insignia «Borrador sin publicar» fuerte
    (relleno `rgb(31,45,77)`, texto blanco) y «Descartar borrador» en
    `rgb(180,35,24)`.
  - `confirm` real con «Tenés cambios sin guardar. Si salís ahora, se
    pierden. ¿Salir igual?» al tocar «Todas las páginas» (lo reportó el
    MCP); con `window.confirm` que responde no: 1 confirm y la URL no
    cambia; que responde sí: navega a `/admin/paginas`. «Hero»: 0 confirms,
    URL `#seccion-hero`.
  - `beforeunload` sintético: `defaultPrevented` true con cambios, false
    tras guardar; y un `beforeunload` real al hacer `goto` con cambios.
  - «Guardar borrador» → vuelve a blanco. «Descartar borrador» con cambios
    y confirm aceptado → recarga, 0 diálogos reales (`soltar` funciona),
    insignia «Sin editar».
  - Limpieza: `delete from paginas where borrador is null and publicado is
    null` → `DELETE 1`.
  Commit `1d36aae`.

- 2026-09-22 — Pausa entre los pasos 8 y 9: Mateo pasó una captura de un
  dashboard (un CRM: sidebar oscura con columna de íconos y navegación
  plegable, lienzo blanco redondeado, migas arriba, tarjetas de métricas)
  «para que entiendas cómo tendría que ser el dashboard». Se abrió un
  shaping corto y lo cortó él: «está todo bien», el editor sigue como el
  SPEC. **La captura es el norte de la lane 2** (`armazon-pulido`: marco,
  sidebar, portada); copia en `%TEMP%\rework-admin\referencia-dashboard.png`
  (fuera del repo). Al traducirla: el naranja del ítem activo pasa a
  `azul-claro` (DESIGN.md §1, regla 2).

- 2026-09-22 — Paso 9: `Encabezado` con `fijo`: `lg:sticky` en escritorio; por
  debajo de `lg`, acciones + avisos en un `div` `fixed inset-x-0 bottom-0`
  (`flex-col-reverse`: el aviso arriba de las acciones sin cambiar el DOM;
  `pb-[max(0.75rem,env(safe-area-inset-bottom))]`) que en `lg` pasa a
  `contents`; el encabezado es un `flex-wrap` y el aviso `w-full`.
  `EditorDePagina` `max-lg:pb-16`; «Guardar» + `<span class="max-lg:sr-only">
  borrador</span>` en un solo `span` (en el `inline-flex` dos hijos quedaban
  separados por el `gap`); `Seccion` `scroll-mt-4 lg:scroll-mt-28`. Gate:
  typecheck 0 · lint 0 · react-doctor 100/100. Playwright a 390 × 844:
  encabezado `static`; barra `fixed`, **65 px** (1 de borde + 12 + 40 + 12),
  de 779 a 844 arriba y al final del scroll; el último control («Subir
  foto») termina en 674 con el scroll al fondo; «Hero» desde el panel del
  celular → `#seccion-hero`, la sección a 16 px del borde y el `dialog`
  cerrado; «Guardar» visible de 88 px con nombre accesible «Guardar
  borrador». A 1440: `sticky`, 81 px (129 con aviso), `top` 0 con scroll,
  «Guardar borrador» en una línea (150 px). El overlay «1 Issue» de Next
  tapa la esquina de «Publicar» en dev (ruido conocido de la lane de
  seguridad). Commit `bfbfe46`.

- 2026-09-22 — Paso 10 (test primero): `lib/contenido/resumen.test.ts` escrito
  antes que el código; `tsx --test` → **falla** con `ERR_MODULE_NOT_FOUND`
  (`resumen` no existía). Después `lib/contenido/resumen.ts` (51 líneas,
  sin `@/`: `grep "@/"` → exit 1): `resumirItem(descripcion, valor)` →
  `{ foto, texto }`, recorrido en profundidad; `textoCorto` no vacío
  (`trim`), `foto` con `src` no vacío, `opcional` `null` se saltea,
  `parrafo` y `rutaInterna` no cuentan. 6 tests: con cartel · texto vacío
  pasa al siguiente · sin cartel → alt · sin foto · celular → alt · foto sin
  `src` y valor `null` → vacío. `pnpm test` → 79 tests, 78 pasan, 0
  fallan, 1 salteado (el de siempre: «sin respuestas grabadas»). Gate:
  typecheck 0 · lint 0 · react-doctor 100/100 (391 archivos). Commit `18c53fd`.

- 2026-09-22 — Paso 11 (commit 359aa71): `ListaFija` en grilla (`grid-cols-3 lg:grid-cols-6`): cada
  ítem un `<details name={nombre}>` (`group/item`) en un `li` con
  `has-open:col-span-full`; `summary` cerrado = miniatura `aspect-4/3` con
  `next/image` (`alt=""`, foco por `posicionDelFoco`), número en pastilla
  `azul-principal` (con «Tarjeta» sr-only) y una línea `truncate`; abierto =
  cabecera «Tarjeta 7 · …» + «Cerrar». Panel `@container`; el título lleva
  la cantidad («Tarjetas (computadora) · 11») y se fue «Son N ítems.».
  `Campo`: le pasa `nombre` y `resumenDe` (→ `resumirItem`, el paso 10), y
  la raíz del ítem va con `columnas` (`grid @2xl:grid-cols-2`). Riesgos del
  SPEC §8: `@types/react` 19 tipa `name` en `DetailsHTMLAttributes`; el DOM
  lo lleva (`hero.tarjetas`, `hero.tarjetasCelular`); Tailwind 4.3.3 genera
  `has-open:` → `:has(:is([open], …))`. Gate: typecheck 0 · lint 0 ·
  react-doctor 100/100 (391 archivos). Playwright a 1440, todo cerrado:
  **`scrollHeight` 1.647** (antes 12.688); 19 `details`, 0 abiertos, 6
  columnas, celda 146 × 133; abrir la 3 y después la 7 → solo la 7 abierta,
  de 934 px (= el ancho del `ol`); Enter sobre el `summary` de la 7 la
  cierra y la vuelve a abrir; Tab desde la 1 recorre 1…11 y sigue en la 1 de
  celular (12), el orden del DOM. **No cumple**: la tarjeta 7 empieza en
  y=1090 con la pantalla de 900 → enmienda del SPEC §5 y la medición pasa al
  paso 12 (DECISIONS). Bloques medidos: encabezado 81 · resumen «Hero» 52 ·
  Título 86 · Bajada 66 · cada botón 215 · cada lista 343.

- 2026-09-22 — Paso 12 (commit ffddf12): `Seccion` sin tarjeta (`summary` con
  divisor `azul-claro/60`, `ChevronDown` que gira con `group-open/seccion`
  y `motion-safe`, `font-display text-admin-seccion`; contenido `@container`
  y `Campo raiz columnas`). `CampoGrupo`: la raíz con `columnas` →
  `grid @2xl:grid-cols-2`, con `listaFija` y `parrafo` en
  `@2xl:col-span-2` (la enmienda del SPEC §5); el no raíz → `fieldset`
  sin borde (`min-w-0`), `legend` en `text-admin-seccion`, campos en
  `@container` + `@md:grid-cols-2`. Gate: typecheck 0 · lint 0 ·
  react-doctor 100/100. Playwright:
  - 1440, todo cerrado: **`scrollHeight` 1.196**; **tarjeta 7 de 645 a
    783** (la pantalla, 900): la aceptación que venía del paso 11, cumplida.
  - Cajas con borde (3+ lados) entre cada input y `main`: 37 inputs con 0;
    con la 7 abierta, 36 con 0 y 1 (su alt) con 1, el panel.
  - Título | Bajada a 226 px de alto las dos (478 de ancho); Texto
    (369, 368) | Adónde lleva (616, 368) de 231 de ancho.
  - 390 × 844: `scrollHeight` 1.990; Texto (24, 556) sobre Adónde lleva
    (24, 638), apilados.

- 2026-09-22 — Paso 13 (commit f2561f6): `Subir` en `components/ui/icons/index.tsx`
  (trazo 1,5). `CampoFoto`: `input type=file` `peer sr-only` + `label` con
  `claseDeBoton("secundario")` y `peer-focus-visible:outline-*`; «Cambiar
  foto…» / «Elegir foto…»; «jpg, png o webp · hasta 4 MB» al lado; con
  archivo: nombre + «Subir foto» (secundario, `aria-busy`) + «Cancelar»
  (terciario, limpia el input por `ref`); ayuda del campo arriba; foco en
  una línea; miniatura `border-gris-texto` con foco `azul-medio`; tamaños a
  `text-admin-meta`. Gate: typecheck 0 · lint 0 · react-doctor 100/100.
  Playwright a 1440, tarjeta 2: input de archivo de 1 px (oculto); Tab desde
  el alt → `input[type=file]` con su label «Cambiar foto…» en
  `solid 2px rgb(74,111,165)` (con las transiciones apagadas; con ellas,
  a los 450 ms todavía estaba en `currentColor`); `setInputFiles` →
  «foto-de-prueba.webp» + «Subir foto» + «Cancelar»; Cancelar → input vacío
  y sin botones; flechas → foco 60 % 50 %; subida real → miniatura
  `/api/fotos/68784060-…`, foco 50 % 50 %, la miniatura cerrada también
  cambió. Limpieza: la fila de `fotos` y el archivo de `apps/sitio/.fotos/`
  (antes 0 y 0) borrados → 0 y 0; 0 filas en `paginas`.

- 2026-09-22 — Paso 14 `[batch]` (commit a7dfa8f): `TextoCorto` y `Parrafo`
  (etiqueta meta medium; ayuda `mt-1 text-admin-meta text-gris-texto` antes
  del control; `aria-describedby` = ayuda + contador; contador `sr-only`
  bajo el 80 %, `text-rojo-error` si `excedido`, `font-medium
  text-azul-principal` al tope, `gris-texto` si no; se fue
  `naranja-accion-texto`), `RutaInterna` (ayuda antes del `select`) y la
  casilla de `CampoOpcional` (`size-4 accent-azul-principal`, etiqueta
  meta medium). Gate: typecheck 0 · lint 0 · react-doctor 100/100.
  Playwright a 1440: elementos con texto propio en `main` por tamaño →
  14 px × 174 · 18 px × 5 · 24 px × 1 · **12 px × 0** (antes 57); «Texto»
  del botón principal: 8/18 → contador `sr-only` (no se ve), 17/18 y
  18/18 → visible; `aria-describedby="hero.botonPrincipal.texto-contador"`
  en los tres; `accent-color` de la casilla `rgb(31,45,77)`. Nada guardado.

- 2026-09-22 — Paso 15 (commit 1ac5c0f): `TextoCorto` con `maximo > 80`
  (`LARGO_EN_DOS_RENGLONES`) → `textarea rows={2}` con `min-h-17
  resize-none field-sizing-content`, Enter bloqueado (salvo en composición
  IME) y `[\r\n]+` → espacio en `onChange`; los props comunes en un
  objeto. Primer intento: el regex llegó roto al archivo (el escape pasó
  como CR LF reales por el JSON del reemplazo) y typecheck falló con
  TS1161; arreglado a mano y verificado (`JSON.stringify` del fragmento).
  Gate: typecheck 0 · lint 0 · react-doctor 100/100. Playwright: 1440 →
  `TEXTAREA`, 130/140, 90 px, `scrollHeight` 88 = `clientHeight` 88,
  `field-sizing: content`; 390 → 114 px, 112 = 112; Enter tras «Primera
  parte» + «x» → `"Primera partex"`; Ctrl+V de «a\nb» → `"a b"`;
  `maxLength` 140; el Título (72) sigue `INPUT`. Barrido final:
  `grep -rnE "text-(xs|sm|base|lg|xl|2xl|3xl)\b|font-\[family-name" admin
  app/(admin)` → solo `FormularioEntrar.tsx:78` y `FormularioOlvide.tsx:46`
  (`text-sm`); con `--exclude='Formulario*.tsx'` → **exit 1** (DECISIONS).
  Base: 0 páginas, 0 fotos.
