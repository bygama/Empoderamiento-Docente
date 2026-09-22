# PROGRESS — El armazón del admin

- **Rama:** `mateo/armazon-del-admin`
- **Base:** `7ee66e5` (= `origin/main` al 2026-09-22)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `7ee66e5` el 2026-09-22 (verificación del PR #172, mismo árbol):
`pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 · `pnpm test` 69
tests, 68 pasan, 0 fallan, 1 salteado · `pnpm build` 0 (21/21).

**El script de contraste** (fórmula WCAG 2.x; se le pasan pares
`"#texto:#fondo"` en hex y devuelve la razón):

```
node -e "const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};for(const p of process.argv.slice(1)){const[a,b]=p.split(':');const x=L(a),y=L(b);console.log(p,((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2))}" "#1f2d4d:#e07a2f" "#ffffff:#1f2d4d"
```

Medido el 2026-09-22: blanco sobre `naranja-accion` 3,00 · `azul-principal`
sobre `naranja-accion` 4,54 · blanco sobre `azul-principal` 13,63 ·
`azul-claro` sobre `azul-principal` 7,68.

## Done

- 2026-09-22 — SPEC aprobado por el owner (design-first).

- 2026-09-22 — PLAN y lista de commits aprobados por el owner.

- 2026-09-22 — Paso 1: `DESIGN.md` §7, «Botón primario»: texto
  `azul-principal` sobre `naranja-accion` (4,54:1), con el porqué y la nota
  de los tres CTAs del sitio. `git grep -n "4,54" -- DESIGN.md` → línea
  175, exit 0 · `git diff --stat` → solo `DESIGN.md` (+6 −1). Solo docs:
  el gate de código no cambia.

- 2026-09-22 — Paso 2: `Eye` y `EyeOff` en
  `components/ui/icons/index.tsx`, con el `baseProps` del set (trazo 1,5,
  `currentColor`, `aria-hidden`). `git grep -c` → 2 · gate: typecheck 0 ·
  lint 0 · react-doctor 100/100.

- 2026-09-22 — Paso 3: `admin/armazon/Campos.tsx`:
  - `ENTRADA_DE_ACCESO`, con borde `gris-texto`, foco `azul-medio` y
    `aria-invalid` en naranja;
  - `Boton` en `naranja-accion` con texto `azul-principal` y hover que
    aclara;
  - `Aviso` con `role="alert"` para el error y texto azul con borde
    naranja.

  Nuevo `admin/armazon/CampoContrasena.tsx` (`"use client"`): ojo con
  `aria-pressed` y `aria-controls`, y ayuda atada con `aria-describedby`.
  - Contraste (script de arriba): 4,54 · 5,07 (hover) · 4,83 (borde) · 5,11
    (borde con foco) · 12,35 (error) · 4,72 (confirmación) · 13,63 · 4,78.
    Todos ≥ 4,5, y los bordes ≥ 3.
  - Gate: typecheck 0 · lint 0 · react-doctor 100/100.
  - El hover pedía cambiar `DESIGN.md` §7: hecho sin commitear
    (DECISIONS).

- 2026-09-22 — Paso 4: `admin/armazon/Pantalla.tsx` partida:
  - panel `azul-principal` con `pattern-dots-inverse` (la utilidad del
    manual §6 que ya estaba en `globals.css`) y una forma `azul-medio`, los
    dos con `aria-hidden`;
  - logo completo en negativo (`logo-ed-negativo.png`, `loading="eager"`
    porque Next 16 deprecó `priority`), 144 px en el celular y 240 px desde
    `lg`;
  - «Admin del sitio» en `azul-claro`.

  `metadata.title` en las 3 `page.tsx`.
  - Gate: typecheck 0 · lint 0 · react-doctor 100/100 · `pnpm build` 0
    (21/21; las 3 de acceso siguen estáticas).
  - Navegador de Orca, 1589 px: `aside` 0–662 y `main` desde 662, lado a
    lado; `document.title` «Entrar · Admin ED»; el botón
    `rgb(224,122,47)` con texto `rgb(31,45,77)`.
  - Playwright a 390 px: la franja arriba (110 px de alto) y el `main`
    desde 110. Capturas en 1440 y 390, vistas: se ven como el diseño.
  - `orca screenshot` hizo caer el runtime dos veces (falla ya conocida):
    las capturas salieron por Playwright.

- 2026-09-22 — Paso 5 `[batch]`:
  - **`FormularioEntrar`**: la contraseña pasa a `CampoContrasena`; con
    un rechazo de datos marca los dos campos (`datosRechazados`) y con un
    429 no marca ninguno.
  - **`FormularioNueva`**: dos `CampoContrasena` con `minLength` y ayuda
    en el primero; `rechazado` marca el campo que falló.
  - **La bajada de la página** pasa a «Es la que vas a usar para entrar
    al admin.», para no repetir la ayuda.
  - **`FormularioOlvide`**: sin cambios. Su único error es un 429, que no
    es de ningún campo, y ya sale por `Aviso` con `role="alert"` desde el
    paso 3.

  Evidencia:
  - Gate: typecheck 0 · lint 0 · react-doctor 100/100.
  - Navegador de Orca, el ojo: `type` pasa de `password` a `text` y
    vuelve, con `aria-pressed` de `false` a `true` y de vuelta a `false`;
    `aria-controls` apunta al input.
  - Contraseña mala: `role="alert"` con «El correo o la contraseña no
    coinciden.» y `aria-invalid` en `email` y `contrasena`.
  - Contraseña buena de `prueba@example.com`: llega a `/admin`.
  - `/admin/nueva-contrasena?token=falso`: título «Nueva contraseña ·
    Admin ED», los dos campos con `minLength` 12 y `new-password`, la
    ayuda «Doce caracteres o más.» atada al primero y 2 ojos.

- 2026-09-22 — Paso 6: la sidebar en escritorio.
  - **`admin/armazon/BarraLateral.tsx`** (29 líneas): Server Component.
    `paginasConCambios()` envuelve `listaDePaginas()` en un `try`; si
    falla, devuelve `null` y deja el error en el log.
  - **`admin/armazon/barra-lateral/`**:
    - `arbol.ts`, con `arbolDelSitio()` puro y 4 tests;
    - `ItemDeNavegacion.tsx` (18 líneas);
    - `ArbolDelSitio.tsx` (86, `"use client"` solo por `usePathname`);
    - `ContenidoDeLaBarra.tsx` (32).
  - **Layout protegido**: `lg:pl-72`, `<BarraLateral>` y el contenido en
    `<main>`.
  - **`SalirDelAdmin`**, restilado para el fondo azul.
  - **`Seccion.tsx`**: `id="seccion-<clave>"` y `scroll-mt-28`.
  - **`datos/acciones/paginas.ts`**: guardar, publicar y descartar
    revalidan el layout protegido (`/(admin)/admin/(protegido)`,
    `"layout"`). Sin eso, el punto quedaba viejo (DECISIONS).
  - Contraste: atenuada 5,04 · blanco sobre el activo 10,02 · `azul-claro`
    en hover 6,58 · borde de «Salir» 3,78.
  - Gate: typecheck 0 · lint 0 · react-doctor 100/100 · `pnpm test` → 73
    tests, 72 pasan, 0 fallan, 1 salteado.
  - Navegador de Orca, a 1589 px, en `/admin`:
    - la sidebar mide 288 px y `aria-current` está en «Inicio»;
    - los ítems siguen el orden del registro: «Todas las páginas»,
      «Inicio › Hero», «Qué hacemos», «Quiénes somos», «Investigación»,
      «Biblioteca», «Novedades» y «Contacto»;
    - 6 páginas atenuadas con «Todavía no se edita» y un solo link a
      sección (`/admin/paginas/inicio#seccion-hero`);
    - el pie dice «Cuenta de prueba · administra · Salir».
  - Clic en «Hero»: la URL es `/admin/paginas/inicio#seccion-hero`, el
    bloque queda a 112 px del borde (debajo de la barra `sticky`, de
    65 px), y la página «Inicio» del árbol queda abierta con
    `aria-current="page"`.
  - Guardar borrador (el título con « x»): aviso «Borrador guardado…», y
    la sidebar pasa a «Inicio (cambios sin publicar)» con el punto, sin
    recargar. El editor conservó lo escrito.
  - Descartar: el punto se va. Ese botón abre un `window.confirm`, que el
    navegador de Orca aceptó solo. La fila vacía que dejó la prueba se
    borró (`paginas`: 0 filas).
  - El «Inicio» del admin pasa a «Inicio · métricas», para no confundirse
    con la página Inicio del sitio (como en el boceto aprobado).

- 2026-09-22 — Paso 7: `admin/armazon/barra-lateral/PanelMovil.tsx` (113
  líneas, `"use client"`).
  - **Qué hace:** por debajo de `lg` muestra una barra con el logo y
    «Menú» (`aria-expanded`, `aria-controls`). El panel es un **`<dialog>`
    nativo** abierto con `showModal()`, que vuelve inerte el resto de la
    página, cierra con Escape y devuelve el foco.
  - **Lo que se le suma:**
    - Tab y Shift+Tab dan la vuelta en los bordes;
    - se cierra al tocar el fondo o un link;
    - bloquea el scroll.
  - **`BarraLateral`** pasa el mismo `ContenidoDeLaBarra` a la sidebar de
    escritorio y al panel.
  - **El primer intento** usó `role="dialog"` y react-doctor lo frenó
    (97/100, `prefer-html-dialog`). Pasó a `<dialog>` y volvió a 100.
  - **Gate:** typecheck 0 · lint 0 · react-doctor 100/100.

  Evidencia en el navegador:
  - **Orca a 390×844:** el botón «Menú» se ve y la sidebar de escritorio
    no. Al abrir: `open`, `aria-expanded="true"`, el foco en «Cerrar el
    menú» y `overflow: hidden`.
  - **`orca keypress --key Tab` no mueve el foco** (14 pulsaciones, 0
    `focusin`): la prueba de teclado de Orca no demuestra nada, así que el
    teclado se probó con Playwright.
  - **Playwright a 390×844, con login real** de `prueba@example.com`:
    - sin la vuelta propia, el foco salía al navegador en 4 de 30 Tab
      (`activeElement` = `body`, después de «Salir»); por eso se sumó la
      vuelta;
    - con ella, **0 de 30 Tab y 0 de 10 Shift+Tab** salen del panel. El
      ciclo es «Cerrar el menú» → logo → «Inicio · métricas» → «Todas las
      páginas» → «Inicio» → «Salir» → «Cerrar el menú»;
    - Escape cierra y el foco vuelve a «Menú» (`aria-expanded="false"`,
      `overflow` vacío);
    - tocar «Todas las páginas» cierra y navega a `/admin/paginas`;
      tocar el fondo cierra;
    - a 1280 px, «Menú» no se ve y la sidebar sí.
  - **Capturas** con el panel cerrado y abierto a 390, y del editor a
    1280, vistas: se ven como el diseño.

- 2026-09-22 — Paso 8: `AGENTS.md` §3, la línea de `admin/armazon/` suma
  «la sidebar (barra-lateral/)». `git grep -n "barra-lateral" -- AGENTS.md`
  → línea 170, exit 0 · `git diff --numstat -- AGENTS.md` → `1 1`.

- 2026-09-22 — Commits extra con el OK del owner:
  - `63892a4`: el hover de §7;
  - `a53e3ac`: «Publicar»;
  - `e7642b2`: errores y foco;
  - `2b12448`: «Admin del sitio»;
  - `abc2449`: `scroll-margin`.

  El árbol fuera de la lane es el mismo que pasó la verificación
  (`git diff HEAD -- apps AGENTS.md DESIGN.md` vacío). Sin restos: el
  único resultado del grep de `TODO`, `console.log`, `debugger` y `{{` es
  la `{{` de un objeto en JSX. El scratch de la sesión (capturas, el diff
  de la ronda y los probes) se borró.
- Cierre: work-verify. Quedaban sin commitear, para pedir el OK al cierre:
  el hover de `DESIGN.md` §7 y el texto azul de «Publicar» en
  `BarraDeAcciones.tsx` (DECISIONS).
  - Capas sobre `d060370` más esos dos cambios (2026-09-22), todas en
    verde. Falta la revisión de cierre.
  - L1: `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 sin
    diagnósticos.
  - L2: `pnpm test` → 73 tests, 72 pasan, 0 fallan, 1 salteado · `pnpm
    build` 0 (21/21) · el dev server responde: `/` 200 y `/admin/entrar`
    200.
  - L3, recorrido entero con Playwright y login real:
    - `/admin/entrar`: «Entrar · Admin ED», CTA `rgb(224,122,47)` con
      texto `rgb(31,45,77)` y el ojo presente;
    - `/admin` a 1280 px: sidebar visible y `aria-current` en «Inicio ·
      métricas»;
    - Inicio › Hero lleva a `/admin/paginas/inicio#seccion-hero`, con el
      bloque a 112 px del borde y «Publicar» ya en texto azul;
    - a 390 px, «Menú» abre el panel y Escape lo cierra, con el foco de
      vuelta en «Menú».

    Lo de cada paso (teclado, punto de «sin publicar», formularios) está
    en su entrada de Done.
- Revisión de cierre, seat 1 (Opus 5.5, todo el cambio contra el SPEC):
  **FAIL**. Los gates pasan, pero no se cumplen dos puntos del SPEC y un
  desvío no estaba registrado. El veredicto textual va en
  `## Verification` al cerrar. Ronda de fixes 1:
  - **Important 1, arreglado** (SPEC §3, `aria-describedby`): `Aviso`
    recibe `id`; `CampoContrasena` suma `idDelError` a su
    `aria-describedby` mientras está rechazado; entrar y nueva lo usan.
    - Playwright, contraseña mala (después de esperar el rate limit):
      `email` y `contrasena` con `aria-invalid="true"` y
      `aria-describedby` → «El correo o la contraseña no coinciden.».
    - Contraseñas distintas en «nueva»: solo `repetida` queda marcada y
      apunta a «Las dos contraseñas no coinciden.»; la primera sigue
      apuntando a su ayuda.
  - **Important 2, arreglado** (SPEC §4, AA): «Admin del sitio» sube
    debajo del logo (`lg:justify-start`), lejos del círculo. Medido a 1024,
    1060, 1090, 1280 y 1440 px: el texto (48–171 × 180–208) pisa **0**
    puntos del círculo; antes pisaba 208 a 1024 px (2,88:1).
  - **Important 3, registrado** en DECISIONS con la evidencia: el
    `"use client"` de `ArbolDelSitio` hace falta porque el layout no se
    vuelve a renderizar al navegar.
  - **Minor, arreglados de paso:**
    - `Seccion` usa `scroll-mt-44 lg:scroll-mt-28`: a 390 px, entrando
      por el panel, la barra termina en 159 y el título de Hero arranca
      en 177;
    - el foco del botón y de los links de acceso va en `azul-medio`
      (`ENLACE_DE_ACCESO`). Medido 400 ms después del foco, porque
      `transition-colors` también anima `outline-color`: leído al
      instante daba el color de partida;
    - los desvíos chicos (la etiqueta «Inicio · métricas», la bajada, el
      13 % de los puntos, la barra que no es `sticky` y el naranja de los
      errores) pasaron a DECISIONS;
    - «Next» de PROGRESS ya no está viejo.
  - **Fuera de lente, sin tocar:** después de un login fallido, React 19
    vacía el correo al resetear el `<form action>`. Ya pasaba antes de
    esta lane.
  - **Re-verificado:** `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor
    100/100 · `pnpm test` → 73 tests, 72 pasan, 0 fallan, 1 salteado ·
    `pnpm build` 0 (21/21).
  - **Tropiezo de la prueba:** `waitForSelector('[role=alert]')` de
    Playwright encontraba primero el `role="alert"` del overlay de
    desarrollo, adentro del shadow DOM. Se espera `main p[role=alert]`.
  - Re-review de la ronda 1 (una seat, Sonnet): en curso.

## Tried and failed

- Nada que no esté anotado en su paso:
  - `orca screenshot` hizo caer el runtime (paso 4);
  - `role="dialog"` lo frenó react-doctor, y el `<dialog>` solo dejaba
    salir el foco (paso 7);
  - `orca keypress --key Tab` no mueve el foco (paso 7);
  - la revisión de cierre dio FAIL y la ronda de fixes 1 lo resolvió.

## In progress

- Nada: la lane se cierra.

## Next

- El push de `mateo/armazon-del-admin` y el PR a `main`, con el OK del
  owner (AGENTS.md §5.6).
- La lane 2, `seguridad-del-acceso`: diseño aprobado el 2026-09-22 (en la
  memoria del proyecto, «diseno-seguridad-del-acceso»).
- Quedan afuera, anotados:
  - el contraste de los 3 CTAs del sitio (blanco sobre naranja, 3,00:1);
  - un color de error propio en `DESIGN.md`;
  - que la barra del celular sea `sticky`;
  - que el login no vacíe el correo después de un intento fallido (el
    reset del `<form action>` de React 19; ya pasaba antes).

## Verification

### 2026-09-22 — M DoD — PASS

Sobre el árbol de la ronda de fixes 1: `d060370`, más el hover de §7,
«Publicar» y la ronda de fixes, todavía sin commitear.

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («100/100, sin
  diagnósticos»).
- L2 behavioral: `pnpm test` → exit 0 (73 tests, 72 pasan, 0 fallan, 1
  salteado) · `pnpm build` → exit 0 (21/21); arranca: el dev server
  responde `/` 200 y `/admin/entrar` 200.
- L3 end-to-end, con Playwright y login real:
  - el login en escritorio y a 390 px;
  - la sidebar a 1280 px (orden, atenuadas, `aria-current`);
  - Hero → `#seccion-hero` a la vista, a 1280 y a 390 px;
  - el punto de «sin publicar» después de guardar, y fuera después de
    descartar;
  - el panel del celular: 0 de 30 Tab y 0 de 30 Shift+Tab salen; Escape,
    link y fondo lo cierran;
  - los errores atados con `aria-describedby`;
  - «Admin del sitio» fuera del círculo de 1024 a 1440 px.

  El detalle está en Done y en la ronda de fixes.
- Close review — correctness against the SPEC (Opus 5.5, elección del
  owner): FAIL, con 3 Important → ronda de fixes 1.
- Re-review ronda 1 — correctness against the SPEC (Sonnet): «All findings
  addressed, no new Critical/Important breakage».

#### Veredicto textual — close review (Opus 5.5)

> ### DoD run
>
> **L1 static** (run on HEAD `d060370` plus the two uncommitted changes)
> - `pnpm typecheck` → exit 0 → `apps/sitio typecheck: Done`
> - `pnpm lint` → exit 0 → `apps/sitio lint: Done`
> - `node scripts/verificar-react-doctor.mjs` → exit 0 → `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 383 archivos · packages/db/src: 3 archivos · packages/auth/src: 5 archivos)`
>
> **L2 behavioral**
> - `pnpm test` → exit 0 → `ℹ tests 73` · `ℹ pass 72` · `ℹ fail 0` · `ℹ skipped 1`. This includes `✔ las siete páginas, en el orden del registro`.
> - `pnpm build` → exit 0 → `✓ Generating static pages using 25 workers (21/21)`. `○ /admin/entrar`, `○ /admin/nueva-contrasena` and `○ /admin/olvide-mi-contrasena` are still static.
>
> **PLAN acceptance greps**
> - Step 1: `DESIGN.md:175:- Texto: \`azul-principal\`, Inter Medium. Da **4,54:1**…` → exit 0.
> - Step 2: `apps/sitio/src/components/ui/icons/index.tsx:2` → exit 0.
> - Step 8: `AGENTS.md:170: … salir, la sidebar (barra-lateral/)` → exit 0. `git diff --numstat` → `1	1	AGENTS.md`.
> - Scope: `git diff --name-only 7ee66e5..HEAD` shows no files outside the lane's areas. The largest file is `PanelMovil.tsx` at 113 lines.
>
> **Contrast** (the PROGRESS formula, re-run by me)
> - Every PROGRESS figure reproduces: 4.54, 3.00, 5.07 (hover), 3.75 (darken), 4.83, 5.11, 12.35, 4.72, 7.68, 13.63, 5.04, 10.02, 6.58, 3.78.
> - Two pairs PROGRESS did not measure:
>   - «· métricas» at 80 % opacity: 5.52. It passes.
>   - `azul-claro` text over `azul-medio`: **2.88**. It fails (Issue 2).
>
> **L3 browser (Playwright, `localhost:3000`)**
> - **`/admin/entrar` at 1280 px:** passes.
>   - `title "Entrar · Admin ED"`.
>   - `aside` is at 0–533 in `rgb(31, 45, 77)`, and `main` starts at 533 on white.
>   - Dots are `rgba(255,255,255,0.13)` and there is one `azul-medio` circle, both `aria-hidden`.
>   - `h1` is Manrope 700, the form wrapper is `max-width 384px` and the lead text is `rgb(107,114,128)`.
>   - The button is `rgb(224,122,47)` with text `rgb(31,45,77)` and `12px 24px` padding. It is the only orange element on the page.
> - **`/admin/entrar` at 390 px:** a 110 px strip on top, the patterns are `display:none`, the logo is 144 px wide, and there is no horizontal overflow.
> - **Other titles:** «Olvidé mi contraseña · Admin ED» and «Nueva contraseña · Admin ED» are correct, and both CTAs are orange with blue text.
> - **Nueva contraseña:** both fields have `minLength 12` and `new-password`, and the first is `aria-describedby` → «Doce caracteres o más.».
>   - The eye toggle cycles `password/false → text/true → password/false`.
>   - Anything under 12 characters is blocked by `tooShort: true`.
> - **Wrong password:** the `p[role=alert]` shows «El correo o la contraseña no coinciden.», and both inputs get `aria-invalid="true"` with the `rgb(179,90,21)` border. **Both inputs have `aria-describedby: null`** (Issue 1).
>   - A 429 marks no field. I triggered one with my own retries.
> - **Good login:** reaches `http://localhost:3000/admin`.
> - **Sidebar at 1280 px:** passes.
>   - It is `fixed`, 288 px wide, on `rgb(31,45,77)`, and the body is on `rgb(242,244,247)`.
>   - Order: «Inicio · métricas», «Todas las páginas», Inicio, Qué hacemos, Quiénes somos, Investigación, Biblioteca, Novedades, Contacto.
>   - The 6 pages without sections have no link and read «Todavía no se edita».
>   - `aria-current="page"` is on «Inicio · métricas». There is no orange or green in the sidebar, the footer reads «Cuenta de prueba · administra · Salir», and «Menú» is hidden.
> - **Hero link at 1280 px:** lands on `/admin/paginas/inicio#seccion-hero` with the section at top 112 and the bar bottom at 88. The Inicio `<details>` is open with `aria-current="page"`, and «Publicar» has blue text.
> - **«Sin publicar» dot:** passes.
>   - After «Guardar borrador» the summary reads «Inicio(cambios sin publicar)» with an 8 px `azul-claro` dot.
>   - My `window` marker survived, so the page did not reload, and the editor kept « x».
>   - «Descartar» (confirm accepted) removed the dot. That action reloads the page by design.
>   - The discard left an empty `paginas` row. I deleted it (`DELETE 1`), so the table is back to the 0 rows it had before the test.
> - **Mobile panel at 390 px:** passes.
>   - Closed state: the `aside` is `display:none`, and «Menú» has `aria-expanded="false"` and `aria-controls="panel-del-admin"` pointing to the `DIALOG`.
>   - Opening it: `open`, `:modal`, `expanded "true"`, focus on «Cerrar el menú», `overflow "hidden"`, and `0s/none` animation.
>   - 30 Tab and 30 Shift+Tab: 0 focus escapes in each direction.
>   - Escape closes the panel, returns focus to «Menú», sets `expanded "false"` and clears `overflow`.
>   - Tapping a link closes the panel and navigates to `/admin/paginas`. A backdrop click closes it, and a click inside on a non-link keeps it open.
>   - At 1280 px, «Menú» is not visible and the sidebar is.
>
> ### Issues
>
> What was done well: every contrast figure in PROGRESS reproduced exactly. The `<dialog>` focus wrap, Escape handling and focus return hold under a real keyboard. The dot updates in place through `revalidatePath`, and the query-failure fallback has a unit test. The diff stays inside the lane, and most extra changes (hover rule, Publicar text, input border, Aviso colours, revalidate, «Todas las páginas») are recorded in DECISIONS with a reason.
>
> #### Critical (Must Fix)
> None.
>
> #### Important (Should Fix)
> 1. **The affected field is not linked to the error with `aria-describedby`, which SPEC §3 requires** (SPEC.md:106-107).
>    - Where: `apps/sitio/src/app/(admin)/admin/entrar/FormularioEntrar.tsx:58,61`, `apps/sitio/src/admin/armazon/CampoContrasena.tsx:44` (points only to `ayuda`) and `apps/sitio/src/admin/armazon/Campos.tsx:51` (the `Aviso` has no `id`).
>    - Browser result: after a wrong password, both inputs are `aria-invalid="true"` with `aria-describedby: null`. After a mismatch in nueva-contraseña, `repetida` shows the same.
>    - PLAN step 3 lists `aria-describedby` for `Campo` (PLAN.md:48), but step 5 dropped it (PLAN.md:79-80). PROGRESS does not claim it, but the SPEC item is not met.
> 2. **«Admin del sitio» sits on the `azul-medio` circle between 1024 and about 1090 px, at 2.88:1** (`apps/sitio/src/admin/armazon/Pantalla.tsx:26,37`).
>    - At 1024×768 the text box is x 48–171 and the circle starts at x 139. 208 sampled text points fall inside the circle, and a screenshot shows «sitio» on the circle.
>    - `text-lg` at weight 500 is not large text, so it needs 4.5:1. SPEC §4 requires every new pair to pass AA. PROGRESS only checked 1589 and 1440 px, where there is no overlap.
> 3. **`ArbolDelSitio.tsx` is a client component, which contradicts SPEC.md:74** («Solo el panel móvil lleva `"use client"`») (`apps/sitio/src/admin/armazon/barra-lateral/ArbolDelSitio.tsx:1`).
>    - The reason (`usePathname`) is sound and appears in PROGRESS and in a code comment, but DECISIONS has no ruling. The owner approved a SPEC that says the opposite.
>
> #### Minor (Nice to Have)
> 4. **At 390 px the Hero heading lands under the sticky bar** (`apps/sitio/src/admin/paginas/Seccion.tsx:21`). `scroll-mt-28` (112 px) is sized for the desktop bar. On a phone `BarraDeAcciones` wraps to 0–159 px, so the section summary (113–165) is covered. SPEC §4 asks for section links to be checked at phone width too.
> 5. **Some deviations are recorded only in PROGRESS, not DECISIONS:**
>    - the «Inicio · métricas» label (`ArbolDelSitio.tsx:65`);
>    - the new lead text on nueva-contraseña (`nueva-contrasena/page.tsx:10`);
>    - the orange `aria-invalid` input border in `Campos.tsx` (`ENTRADA_DE_ACCESO`). With it, the error state shows orange beyond the CTA, while SPEC §3 says the CTA is «el único naranja».
> 6. **Two small SPEC mismatches:**
>    - `pattern-dots-inverse` renders at 13 %, not the SPEC's 12 %. That is still inside DESIGN §6's 10–15 %.
>    - SPEC §3 says «Foco visible en azul-medio», but `Boton`'s focus outline is `azul-principal` and the «Olvidé mi contraseña» link uses the browser's default ring.
> 7. **`work/armazon-del-admin/PROGRESS.md:214`:** «Next: Paso 1.» is out of date.
>
> ### Out-of-lens
> - After a failed login, React 19's `<form action>` reset clears the email field, so the user must retype it. This existed before the lane and is non-blocking.
> - The mobile «Menú» bar does not stick. In the 12,688 px editor, you have to scroll back to the top to reach navigation.
>
> ### Verdict
> **FAIL.** Every command gate passed:
> - typecheck: exit 0;
> - lint: exit 0;
> - react-doctor: `100/100, sin diagnósticos`;
> - tests: `ℹ fail 0`;
> - build: `(21/21)`, exit 0.
>
> The browser run confirmed nearly all of §2 and §3. However, two SPEC items do not hold:
> - **§3 `aria-describedby`:** the browser measured `aria-describedby: null` on both rejected fields.
> - **§4, AA on every new pair:** the `azul-claro`/`azul-medio` overlap at 1024 px measures 2.88:1.
>
> Both fixes are small. The unrecorded `"use client"` deviation also needs a DECISIONS entry.

#### Veredicto textual — re-review ronda 1 (Sonnet)

> **Finding 1 — Missing `aria-describedby` link (SPEC §3, entrar/nueva-contraseña)** — ADDRESSED. `Aviso` now accepts an `id` (`apps/sitio/src/admin/armazon/Campos.tsx:52-61`), `CampoContrasena` unions the help text id with a new `idDelError` prop only while `invalido` is true (`apps/sitio/src/admin/armazon/CampoContrasena.tsx:27-32,48`), and both forms wire a shared `useId()` value through the rejected field(s) and the `Aviso` (`FormularioEntrar.tsx:24,60-61,67-68,71`; `FormularioNueva.tsx:20,67-69,75-76,79`). Verified live in the browser:
> - `/admin/entrar` with wrong credentials for `prueba@example.com`: `email` and `contrasena` both `aria-invalid="true"` with `aria-describedby` = the alert's actual id, and `alertText: "El correo o la contraseña no coinciden."` — matching id.
> - `/admin/nueva-contrasena?token=test123` with mismatched passwords: only `repetida` got `aria-invalid="true"` + `aria-describedby` pointing to the alert (`"Las dos contraseñas no coinciden."`); `contrasena` correctly still points only to its own help text id.
> No dangling references possible: in both components `rechazado`/`datosRechazados` and `error` are always set together, so `aria-describedby` never points to an unrendered `Aviso`.
>
> **Finding 2 — "Admin del sitio" over the `azul-medio` circle at 1024–1090px (SPEC §4, AA)** — ADDRESSED. `Pantalla.tsx:25` adds `lg:justify-start` (previously the column fell back to the base `justify-between`, which pushed the logo+title pair toward the circle at the container's bottom). Verified geometrically in-browser:
> - At 1024×768: paragraph rect `x 48–171, y 180–208`; circle rect `top 512, bottom 896` — 0/441 sampled points inside the circle (was 208 before the fix, per the finding and matching PROGRESS's own count).
> - At 1090×768: paragraph unchanged (`y 180–208`); circle shifted right but still `top 512` — 0/441 points inside.
> - Mobile (390×844) unaffected: `aside` still 109.75px tall, matching the pre-existing PROGRESS measurement, since `lg:justify-start` only applies at `lg`.
> Text now sits on plain `azul-principal`, so the documented 7.68:1 for `azul-claro`/`azul-principal` applies without circle interference.
>
> **Finding 3 — `ArbolDelSitio.tsx` is a client component (SPEC:74)** — ADDRESSED (per the stated remedy: a recorded, sound ruling, not necessarily a code change). `work/armazon-del-admin/DECISIONS.md:49-57` now has the entry explicitly tied to "hallazgo Important 3 de la revisión," explaining that the protected layout is a Server Component that is not re-rendered on client-side navigation in the App Router, so any route-dependent highlighting (active item, open `<details>`) can only be tracked via `usePathname` in a client leaf; `BarraLateral` remains the Server Component and only the assembled tree (no data-fetching) crosses to the client. This matches the existing code comment at `ArbolDelSitio.tsx:8-10` and is a standard, correct characterization of Next App Router behavior — the reasoning holds.
>
> ### New breakage in the fix diff
> None. Ran `pnpm typecheck` (0 errors, all 3 workspace projects), `pnpm lint` (0 errors), `node scripts/verificar-react-doctor.mjs` (`100/100, sin diagnósticos`, 391 files across `apps/sitio/src`, `packages/db/src`, `packages/auth/src`), and `pnpm test` (73 tests, 72 pass, 0 fail, 1 skipped) — all match PROGRESS's claimed numbers exactly. The bundled minor fixes (`ENLACE_DE_ACCESO`, button focus color `azul-medio`, `Seccion`'s responsive `scroll-mt-44 lg:scroll-mt-28`) are additive/cosmetic and don't touch logic paths exercised by the above; no regressions observed in the mobile franja or in the login flows tested above.
>
> ### Out-of-scope observations
> `DESIGN.md` and `apps/sitio/src/admin/paginas/BarraDeAcciones.tsx` show as modified in git status but are not part of `lane1-fix-ronda1.diff` (they're the still-uncommitted §7 hover/"Publicar" text-color changes from an earlier step, per DECISIONS/PROGRESS, awaiting the owner's OK at close). Not blocking this round. The known pre-existing issue (React 19 clearing the email field after a failed `<form action>` reset) remains and is correctly flagged in PROGRESS as out of this lens.
>
> ### Verdict
> **Fix round:** All findings addressed, no new Critical/Important breakage.
