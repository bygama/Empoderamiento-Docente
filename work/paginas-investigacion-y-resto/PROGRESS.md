# PROGRESS — Páginas: Investigación, Biblioteca y Contacto

Lane 4c del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md). SPEC en
[`SPEC.md`](SPEC.md).

## In progress

- Próximo: paso 17 del PLAN (rebase sobre `main` y Contacto: la lane 7 ya
  está en `main`, DECISIONS).

## Done

- 2026-09-26 — SPEC escrito desde el brief del padre, el inventario §4, §5 y
  §7 y el camino de la 4a (#183). Sin tablas ni dependencias. Aprobado tal
  cual por el padre (DECISIONS); PLAN escrito.
- 2026-09-26 — Preparación: base `ed_paginasinv` creada y con las
  migraciones de `main` aplicadas (`pnpm migrate:deploy`); build de
  referencia de `48ed711` en `%TEMP%\ed-4c\antes`, que comparado contra sí
  mismo da «11 páginas, render idéntico».
- 2026-09-26 — **Paso 1, Investigación › Hero** (`07b1fd7`):
  `features/investigacion/contenido/{comunes,hero}.ts` (`unaResaltada`,
  título con una parte resaltada, dos botones, cuatro pasos),
  `components/ConResaltado.tsx`, la línea `investigacion.hero` en el
  registro, `page.tsx` async con `contenidoDe`, `InvestigacionHero` y
  `HojaHistoria` por props; `constelacion.ts` sin `etiqueta` ni `frase`.
  react-doctor marcó `no-array-index-as-key` en `ConResaltado`: la clave pasó
  a ser la posición del fragmento en el texto (se corrigió antes de cerrar el
  commit). `pnpm typecheck` 0 · `pnpm lint` 0 · `pnpm --filter sitio test` 0
  (178, 177 pass, 1 skip) · `node scripts/verificar-react-doctor.mjs` 0
  (100/100) · `pnpm build` 0 · comparar-render 0: «11 páginas, render
  idéntico» (`investigacion.html` +252 bytes de activos).
- 2026-09-26 — **Paso 2, partir `LineasInvestigacion`** (`1afc5bd`): a
  `components/lineas-investigacion/` van `Papel.tsx`, `BocaCarpeta.tsx` y
  `coreografia-lineas.ts` (`crearLineas({ zona, carpeta, lista })`, que
  devuelve su limpieza y la llama el mismo efecto). Conteo: compositor 152
  líneas de código (era 287), piezas 86 · 31 · 37. typecheck 0 · lint 0 ·
  build 0 · comparar-render 0 («11 páginas, render idéntico»). En el
  navegador (Orca, 1568×921, con puntero), el giro de la carpeta a lo largo
  de su tramo: `0.05:-3.42 0.3:-0.12 0.5:0 0.7:-0.12 0.95:-3.42` (inclinada,
  plana al centro, inclinada igual al salir) y las seis filas en opacidad 1:
  la coreografía de antes.
- 2026-09-26 — **Paso 3, Líneas desde el admin** (`f9bc424`):
  `contenido/lineas.ts` (antetítulo, título y seis preguntas con una parte
  resaltada), la línea `investigacion.lineas`; `ConResaltado` gana
  `resaltar` (el garabato de las preguntas lo dibuja `Papel`); `LINEAS` se
  va y `CASO_DE_CADA_LINEA` queda en la carpeta, por posición.
  `/tmp/ed4c/chequear.sh`: typecheck 0 · lint 0 · test 0 (178: 177 pass, 1
  skip) · build 0 · comparar-render 0 (`investigacion.html` −2654 bytes: el
  arreglo salió del JS) · react-doctor 100/100.
- 2026-09-26 — **Paso 4, Ciclo desde el admin** (`4e99737`):
  `contenido/ciclo.ts` (título, dos vueltas de cuatro estaciones con nombre,
  texto, breve con una parte resaltada y destacado opcional; bisagra, título
  de la evidencia y remate); `EspiralInvestigacion`, `EspiralEstatica` y
  `EspiralLamina` por props; `estaciones.ts` borrado y `numero` en
  `espiral.ts`. chequear.sh: typecheck 0 · lint 0 · test 0 · build 0 ·
  comparar-render 0 (`investigacion.html` −9684 bytes) · react-doctor
  100/100. La lámina animada no está en el SSR: en el navegador (Orca, con
  puntero) tiene 9 anotaciones, 8 `[data-anot-subrayado]` con las mismas
  claves de antes («viven situaciones» … «abrimos otro ciclo») y el título
  con el mismo `<mark>`.
- 2026-09-26 — **Paso 5, Investigación en acción** (`64b5e0a`):
  `contenido/en-accion.ts` (el título); `InvestigacionEnAccion` y
  `CasosInvestigacion` lo reciben. chequear.sh: todo 0, «11 páginas, render
  idéntico».
- 2026-09-26 — **Paso 6, partir `CierreInvestigacion`** (`2627521`): a
  `components/cierre-investigacion/` van `CieloCierre.tsx` (estrellas y
  cielo), `nubes.ts` (siluetas, tipo y `fondoNube`) y `NubesCierre.tsx` (las
  15 nubes y su capa). Conteo: compositor 99 (era 257), piezas 72 · 55 ·
  44; `nubes.ts` 88 líneas totales (utilidad ≤ 100). chequear.sh: todo 0,
  render idéntico; react-doctor 100/100. En el navegador (Orca, con
  puntero), a lo largo del pin (3710 px): nubes `1 → 1 → 0 → 0` de opacidad,
  una nube de −523 a −2579 px, el marco de 0.71 a 0, la linterna de 742 a 0
  px; 13 estrellas y 15 nubes: el descenso de antes.
- 2026-09-26 — **Paso 7, Cierre de Investigación** (`fba94bb`):
  `contenido/cierre.ts` (Biblioteca: título y botón; Conversemos:
  antetítulo, título y botón). chequear.sh: todo 0, render idéntico.
- 2026-09-26 — **Paso 8, SEO de Investigación** (`bf26cbf`):
  `contenido/seo.ts`, la línea `seo`, `generateMetadata` con
  `metadataDeSeo(seo, await openGraphDeLaPagina(padre))`,
  `config/metadata.ts` (el helper) y `config/metadata.test.ts` (3 tests;
  rojo si la página deja de usar el helper, comprobado cambiándolo a mano).
  chequear.sh: typecheck 0 · lint 0 · test 0 · build 0 · react-doctor
  100/100 · comparar-render **1**, solo `investigacion.html: DISTINTA en
  head`. Sin el helper, el diff se llevaba `og:image` (y sus medidas y
  alt) y bajaba la tarjeta de X a `summary`: de ahí el helper (DECISIONS).
  El diff final de `<meta>` (`/tmp/ed4c/diff-head.cjs`), completo:

  ```
  - og:title            «Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas»
  - og:description      «Consultora especializada en la transformación del aprendizaje matemático. …»
  - twitter:title       (igual que og:title de antes)
  - twitter:description (igual que og:description de antes)
  + og:title            «Investigación | Empoderamiento Docente»
  + og:description      «Investigamos para transformar la matemática escolar: …»
  + twitter:title       «Investigación | Empoderamiento Docente»
  + twitter:description «Investigamos para transformar la matemática escolar: …»
  ```

  `<title>`, `description`, `og:image*` y `twitter:image*`/`card` iguales.

  **El editor de Investigación de punta a punta** (Orca, `localhost:3023`,
  cuenta `lane4c@ed.test`, administra, en la base `ed_paginasinv`):
  - Resaltado sin cerrar en Hero › Título: `aria-invalid="true"`, el error
    en el campo («Tiene que haber una sola parte resaltada…»), el aviso del
    encabezado en etiquetas («Hay un campo para revisar: Hero › Título — …»)
    y el foco en el campo.
  - Un campo de cada sección editado y guardado («Borrador guardado»);
    «Qué cambió» lista los cinco con sus etiquetas (Hero › Título, Líneas ›
    Antetítulo, Ciclo › Bisagra, Investigación en acción › Título, Cierre ›
    Conversemos › Título); publicado desde ahí, y los cinco textos nuevos
    están en `/investigacion` (curl, 1 aparición cada uno).
  - SEO: título de 62 caracteres → contador «62/60» con el aviso de Google,
    la vista previa con el título nuevo; publicado, `/investigacion` sirve
    ese `<title>` y `og:title`, con `og:image` y `twitter:card
    summary_large_image` intactos.
  - Versiones: restaurar una versión que no tenía la parte `seo` deja el
    borrador igual a lo publicado (diseño de la 4a: una parte que la
    versión no trae queda como está); con un tercer publicar, restaurar la
    segunda trae el título viejo del hero y «Qué cambió» lo muestra.
    Descartado ese borrador.
  - Tres temas (cookie `tema-del-admin`), contraste medido sobre el fondo
    efectivo: rótulo, campo, encabezado de sección, ítem de lista y «Lleva
    destacado» 13.63:1 (claro y mixto) y 13.59:1 (oscuro); ayuda y
    contador 4.83:1 (claro y mixto) y 7.08:1 (oscuro).
  - 390 px: sin scroll horizontal (375 ≤ 390); los ítems de lista son un
    acordeón exclusivo (`name`) y, abiertos de a uno, los 18 quedan dentro
    de 334 px.
  - Teclado: desde Hero › Título, Tab recorre los botones (anillo de
    foco), los cuatro pasos (contorno de 2 px) y pasa a Líneas.
  - Las capturas de Orca tiraron el runtime dos veces (memoria del repo):
    la evidencia visual es numérica.
  - Al terminar, la fila de `investigacion` se borró de `ed_paginasinv`
    (con sus versiones, en cascada) para que los builds sigan mostrando el
    contenido inicial.
- Desde el paso 8, comparar-render sale 1 **solo** por el `head` aprobado de
  las páginas con SEO (DECISIONS); cada paso siguiente se lee así: esas
  líneas y nada más.
- 2026-09-26 — **Paso 9, Biblioteca › Hero** (`87d5f3f`):
  `features/biblioteca/contenido/hero.ts` (título en dos líneas, bajada),
  la línea `biblioteca.hero`, `page.tsx` async con `contenidoDe`,
  `BibliotecaHero` por props (el `sr-only` une las dos líneas). chequear.sh:
  todo 0 salvo comparar-render (solo `investigacion.html` en `head`);
  `biblioteca.html` igual.
- 2026-09-26 — **Paso 10, Material destacado** (`020a5a1`):
  `contenido/destacados.ts` (antetítulo, título con su parte verde,
  presentación); `IntroDestacados` arma el título con `TituloDosTonos`
  (antes, clave y después, sin claves de lista). El `<h2>` sale byte a byte
  igual (md5 del fragmento, antes y después: `351babe1…`). JS de
  `/biblioteca` +1368 bytes (la función de fragmentos, sin Zod).
- 2026-09-26 — **Paso 11, partir `MaterialesListado`** (`6b21c20`): a
  `components/materiales-listado/` van `filtros.ts` (tipo, `SIN_FILTROS`,
  `normalizar`, la URL), `FilaMaterial.tsx` y `FiltrosCatalogo.tsx` (la
  columna, `FiltroGrupo` y `Pildora`). Conteo: compositor 168 (era 348),
  piezas 27 · 53 · 134. chequear.sh: todo 0, `biblioteca.html` igual;
  react-doctor 100/100. En el navegador, igual que antes: `?tipo=Artículos`
  → 42 con esa búsqueda; «evaluacion» → 2 y aparece «Limpiar todo»;
  limpiar → 57, sin query, 8 filas; «Ver 8 más» → 16 («16 de 57»); «Ver
  menos» → 8; Público «Docentes» → 22; «zzzqqq» → el aviso vacío; «Limpiar
  filtros» → 57; el evento del menú (`ed:url`) con `?tipo=Libros` → 3.
- 2026-09-26 — **Paso 12, Catálogo** (`ec5d616`): `contenido/catalogo.ts`
  (el aviso sin resultados). chequear.sh: todo 0, `biblioteca.html` igual;
  el aviso no está en el SSR y en el navegador sale con el mismo `<p>`.
- 2026-09-26 — **Paso 13, partir `PuenteInvestigacion`** (`a6333c2`): a
  `components/puente-investigacion/` van `temas.ts` (`PASO`, `TEMAS`),
  `PanelRecurso.tsx` y `coreografia-puente.ts` (`crearPuente`). Conteo:
  compositor 114 (era 285), piezas 33 · 117 · 34. chequear.sh: todo 0,
  `biblioteca.html` igual; react-doctor 100/100. En el navegador, la pila:
  `0: 880 880 880 880` → `0.3: 0 700 880 880` → `0.6: 0 0 226 880` → `1: 0 0
  0 0` (x de cada panel) y los tapados en opacidad 0.30: la de antes.
- 2026-09-26 — **Paso 14, Puente** (`7bcb7ed`): `contenido/puente.ts`
  (título, dos botones, cuatro recursos con nombre, descripción, línea y
  foto; alts de `que-hacemos/data/areas.ts` y `home/contenido/hero.ts`, y
  uno escrito mirando `formadora-recorre-aula.webp`); `CARDS` se va, el
  tema sale de `temaDe(i)`; la foto va con `alt=""` y `estiloDeFoco`.
  chequear.sh: todo 0, `biblioteca.html` igual (imágenes con el mismo `alt`
  y `style`); react-doctor 100/100. La pila viva igual que en el paso 13,
  con los lomos «Publicaciones · Materiales · Proyectos · Guías» y los
  fondos navy, gris, navy, gris.
- 2026-09-26 — **Paso 15, Cierre de Biblioteca** (`8316248`):
  `contenido/cierre.ts` (título, texto, botón, enlace). chequear.sh: todo
  0, `biblioteca.html` igual.
- 2026-09-26 — **Paso 16, SEO de Biblioteca** (`e3e6db2`):
  `contenido/seo.ts`, la línea `seo`, `generateMetadata` con
  `openGraphDeLaPagina(padre)`. chequear.sh: todo 0 salvo comparar-render,
  que da `biblioteca.html: DISTINTA en head` además de la del paso 8; el
  test de `config/metadata.test.ts` ya la cubre (181 tests). El diff de
  `<meta>`, completo: `og:title`, `og:description`, `twitter:title` y
  `twitter:description` pasan de los del sitio a «Biblioteca |
  Empoderamiento Docente» y «Publicaciones y recursos de Empoderamiento
  Docente: producción académica, materiales pedagógicos y proyectos,
  abiertos para llevar al aula.»; nada más.

  **El editor de Biblioteca de punta a punta** (Orca, `localhost:3023`):
  - Título de Destacados sin resaltar: `aria-invalid`, el error en el campo
    y «Hay un campo para revisar: Material destacado › Título — …», con el
    foco en el campo. Un título de cierre de 32 caracteres (se saltea el
    `maxLength` desde el script) da «Cierre › Título — Como mucho 30
    caracteres» y no se guarda; las otras secciones sí.
  - Un campo por sección editado y guardado; «Qué cambió» lo lista con sus
    etiquetas (Hero › Bajada, Catálogo › Aviso sin resultados, Puente a
    Investigación › Recursos › Recurso 4 › Nombre, Cierre › Título);
    publicado, y en `/biblioteca` están la bajada, «Guías de aula», el
    título del cierre y, buscando «zzzqqq», el aviso nuevo.
  - SEO: la descripción nueva publicada sale en `description` y
    `og:description`, con `og:image` y `summary_large_image` intactos.
  - Versiones: restaurar la anterior (sin `seo`) deja el borrador igual a
    lo publicado, como en Investigación; descartado.
  - Tres temas: encabezado de sección, rótulo, campo y el alt de la foto
    13.63:1 (claro y mixto) y 13.59:1 (oscuro); la ayuda del ítem 4.83:1 y
    7.08:1.
  - 390 px: sin scroll horizontal; los cuatro recursos, abiertos de a uno,
    dentro de 334 px.
  - Teclado: desde el aviso del catálogo, Tab pasa a la sección del puente
    (contorno 2 px), sus tres campos (anillo) y los recursos (contorno).
  - La fila de `biblioteca` se borró de `ed_paginasinv` al terminar.

## Open
