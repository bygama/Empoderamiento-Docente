# PROGRESS — Páginas: Qué hacemos, Quiénes somos y lo compartido

Lane 4b del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md). SPEC en
[`SPEC.md`](SPEC.md), plan en [`PLAN.md`](PLAN.md), rulings en
[`DECISIONS.md`](DECISIONS.md).

## In progress

- Paso 12 del PLAN (Nuestra mirada).

## Abierto

- **La copia de `origen-03-pregunta.webp`** (paso 11): está en
  `public/fotos/` (la usa el origen) y en `public/quienes-somos/` (la usa
  Novedades). Se deduplica cuando Fotos (lane 9) consolide dónde vive cada
  archivo; el padre lo anota en su lane.

## Hecho

- **Paso 11 — Origen, sentido y evolución** (`457ddf9`).
  `features/quienes-somos/contenido/origen.ts` (origen: título y texto;
  sentido: la cita en tres renglones y quién la dijo; evolución: pregunta y
  respuesta; qué es ED: volanta, título con un resaltado y cinco hitos; el
  remate: frase con resaltado y texto; tres fotos). `origen/data.ts` se queda
  con `NODOS`, `PATH_D` y `PILARES` (de ahí salen el 5 de los hitos y el 3 de
  las fotos); `OrigenEd`, `PilaresOrigen`, `BeatRemate` (parte la frase en
  palabras, verde la que cae en un resaltado), las dos trayectorias y
  `PanelFotos` por props. El `aria-label` de la región queda fijo (no tiene
  título propio, DECISIONS). **Las fotos:** el campo de foto solo acepta
  `/fotos/`; `origen-02-inflexion.webp` se movió y `origen-03-pregunta.webp` se
  copió a `public/fotos/` (ruling del padre, DECISIONS). typecheck 0 · lint 0
  · test 0 (179; en el primer intento el test del registro frenó la foto de
  `/quienes-somos/`, que es lo que llevó al ruling) · build 0 · react-doctor
  100/100 · comparar-render contra el paso anterior **1, solo `imagenes` de
  `/quienes-somos`** (la cuarta diferencia, aprobada):

  ```
  antes: src="/_next/image?url=%2Fquienes-somos%2Forigen-02-inflexion.webp&amp;w=3840&amp;q=75"
  ahora: src="/_next/image?url=%2Ffotos%2Forigen-02-inflexion.webp&amp;w=3840&amp;q=75"
  antes: src="/_next/image?url=%2Fquienes-somos%2Forigen-03-pregunta.webp&amp;w=3840&amp;q=75"
  ahora: src="/_next/image?url=%2Ffotos%2Forigen-03-pregunta.webp&amp;w=3840&amp;q=75"
  ```

  (el `srcset` igual; el `alt`, sin cambios). En el navegador, bajando el
  origen en 21 muestras: la cita entra al 25 %, la pregunta se escribe de a
  una letra hasta las 23 entre el 35 % y el 45 %, el remate llega en cuatro
  palabras («Vivir» y «vivir.» en verde) desde el 85 %, y las tres fotos
  cargan (`naturalWidth` 559).

- **Paso 10 — Hero de Quiénes somos** (`94523ac`).
  `features/quienes-somos/contenido/hero.ts` (dos renglones, bajada, botón);
  la página pasa a `async` con `contenidoDe("quienes-somos")`;
  `QuienesSomosHero` por props, su `h1` sr-only armado con los dos renglones.
  **Nombre accesible**: antes `aria-label` «Quiénes somos — Empoderamiento
  Docente»; ahora `aria-labelledby="quienes-somos-titulo"` → «No
  capacitamos. Transformamos.». typecheck 0 · lint 0 · test 0 (179) · build
  0 · react-doctor 100/100 · comparar-render contra el paso anterior **0**.

- **Paso 9 — SEO de Qué hacemos** (`301c502`). `features/que-hacemos/contenido/seo.ts`
  (`seoQueHacemosInicial`: «Qué hacemos | Empoderamiento Docente», la
  descripción de hoy, sin imagen propia), su línea `seo` en el registro, y
  `generateMetadata(_, padre)` con `metadataDeSeo(seo, await
  openGraphDeLaPagina(padre))`. `openGraphDeLaPagina` va en
  `config/metadata.ts` con la misma firma y el mismo cuerpo que en la 4c
  (DECISIONS; la 4c todavía no está en `main`). typecheck 0 · lint 0 · test 0
  (179) · build 0 (`/que-hacemos` sigue ○) · react-doctor 100/100 ·
  comparar-render contra el paso anterior **1, solo `head` de
  `/que-hacemos`** (la excepción 2 del SPEC §7). Las etiquetas (`diff-head.mjs`):

  ```
  - og:title            «Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas»
  - og:description      «Consultora especializada … en Chile, México, Argentina, Colombia y Brasil.»
  - twitter:title       (= og:title de Inicio)
  - twitter:description (= og:description de Inicio)
  + og:title            «Qué hacemos | Empoderamiento Docente»
  + og:description      «Consultora especializada en la transformación del aprendizaje matemático: investigación, diseño de materiales didácticos, desarrollo profesional docente, acompañamiento, currículo y evaluación.»
  + twitter:title       (= og:title nuevo)
  + twitter:description (= og:description nueva)
  ```

  `<title>`, `description`, `og:image` (con medidas y alt) y `twitter:image`
  quedan iguales.

- **Paso 8 — Cierre de Qué hacemos** (`4170167`). `contenido/cierre.ts`
  (título, texto, texto del botón, texto del link; los destinos quedan en
  código); `CierreQueHacemos` por props; `RevealLines` acepta un `id`
  opcional (va al tag; SplitText conserva el elemento). **Nombre
  accesible**: antes `aria-label` «Cierre»; ahora
  `aria-labelledby="cierre-titulo"` → «Cada contexto merece su propia
  solución.» (mientras anima, SplitText le pone ese mismo texto como
  `aria-label` al `h2` y oculta las líneas: el nombre sigue siendo ese).
  typecheck 0 · lint 0 · test 0 (179) · build 0 · react-doctor 100/100 ·
  comparar-render contra el paso anterior **0**.

  **Nombres accesibles de `/que-hacemos`, antes → ahora** (regiones con
  nombre dentro de `main`, `nombres.js`):

  | Región | Antes (`aria-label`) | Ahora (`aria-labelledby`) |
  | --- | --- | --- |
  | hero | Qué hacemos | Generamos y transformamos. |
  | `#faro` | Qué hace Empoderamiento Docente | Consultora especializada en la transformación del aprendizaje matemático. |
  | `nav` de las áreas | Áreas de especialización | Áreas de especialización |
  | `#niveles` | Niveles en los que intervenimos | Niveles en los que intervenimos |
  | `#proyectos` | Proyectos y aplicaciones | Proyectos y aplicaciones |
  | `#hablemos` | Cierre | Cada contexto merece su propia solución. |

- **Paso 7 — Proyectos y aplicaciones** (`11204d8`). `contenido/proyectos.ts`
  (volanta y título con resaltado; tres capítulos con nombre —`primero`,
  `segundo`, `tercero`— con título, bajada con un resaltado y sus fichas:
  sello, cifra, unidad, nombre, texto); `proyectos-aplicaciones/fichas.ts`
  con la estructura (`ESTRUCTURA`: ids, países y pictograma por posición;
  `PAISES`, `nombrarPaises`, los tipos `Ficha` y `Capitulo`) y
  `armarCapitulos(contenido)`, que junta estructura y textos;
  `ProyectosAplicaciones` lo memoriza (`useMemo`: el escenario rearma su
  coreografía si cambian sus lados). `Bajada`, `TituloPractica`,
  `TituloGrande` y `LadoArchivo` leen el resaltado con `partirResaltado`;
  `data/proyectos.ts` borrado y con él `data/`. **Nombre accesible**: antes
  `aria-label` «Proyectos y aplicaciones»; ahora
  `aria-labelledby="proyectos-titulo"` → la volanta (el `p` del modo quieto o
  el `h2` del lado A en vivo), el mismo texto. typecheck 0 · lint 0 · test 0
  (179) · build 0 · react-doctor 100/100 · comparar-render contra el paso
  anterior **0**. En el navegador, en vivo: 8 fichas, y bajando el archivo en
  21 muestras caen de a una, las anteriores se hunden y el giro las pasa al
  lado B.

- **Paso 6 — Niveles** (`a373c28`). `contenido/niveles.ts` (título con un
  resaltado, frase grande en dos renglones, bajada con un resaltado, cinco
  niveles: nombre y texto; la cantidad sale de `POS`); `NivelesEscala` y
  `NivelCard` por props, `coreografia-niveles.ts` compara contra
  `POS.length`; `data/niveles.ts` borrado. **Nombre accesible**: antes
  `aria-label` «Niveles en los que intervenimos»; ahora
  `aria-labelledby="niveles-titulo"` → el mismo texto (el `h2` está en las dos
  versiones, animada y quieta). `NivelesEscala.tsx` 121 → 139 líneas de
  código. typecheck 0 · lint 0 · test 0 (179) · build 0 · react-doctor
  100/100 · comparar-render contra el paso anterior **0**.

- **Paso 5 — La escena del faro** (`d676171`). `contenido/faro.ts` (apertura,
  mensaje con un resaltado, cuatro frases con su palabra clave, cierre:
  título y botón); `QueHacemosHeroFaro`, `PreguntasFaro` y `CierreFaro` por
  props (las frases con `partirResaltado`); `preguntas-faro.ts` se queda con
  `VERBO_POS` y `HAZ_VERBO`, y `tiempos-faro.ts` cuenta los beats con
  `VERBO_POS` (4, igual que antes). **Nombre accesible**: antes `aria-label`
  «Qué hace Empoderamiento Docente»; ahora `aria-labelledby="faro-titulo"` →
  «Consultora especializada en la transformación del aprendizaje
  matemático.». typecheck 0 · lint 0 · test 0 (179) · build 0 · react-doctor
  100/100 · comparar-render contra el paso anterior **0** («11 páginas,
  render idéntico»). En el navegador (1568 de ancho, con movimiento):
  bajando el faro en 25 muestras, las cuatro frases llegan a opacidad 1 una
  por vez, en orden (del 36 % al 84 % del recorrido), y después el cierre.

- **Paso 4 — Hero de Qué hacemos** (`0428910`). `contenido/hero.ts` (título
  en dos renglones, bajada, texto de la cápsula); `TitularQH` y
  `CapsulaPortal` por props; el `h1` sr-only se arma con los dos renglones.
  **Nombre accesible** de la sección: antes `aria-label` «Qué hacemos»; ahora
  `aria-labelledby="que-hacemos-titulo"` → «Generamos y transformamos.»
  (calculado en la página con `%TEMP%\ed-paginasqh\nombres.js`: el texto del
  referido sin los subárboles `aria-hidden`). typecheck 0 · lint 0 · test 0
  (179) · build 0 · react-doctor 100/100 · comparar-render contra `48ed711`:
  1, y la única línea distinta sigue siendo la imagen #3 del paso 3 (verificado
  con una copia de comparar-render que imprime la línea). Desde acá la
  verificación compara también contra el build del paso anterior
  (`%TEMP%\ed-paginasqh\previo`), que tiene que dar 0. El DECISIONS del aviso
  de la 4c (`openGraphDeLaPagina`) entró en este mismo commit.

- **Paso 3 — Cómo trabajamos de Qué hacemos** (`ccd1cc1`).
  `features/que-hacemos/contenido/como-trabajamos.ts` (título, seis verbos:
  verbo, idea, texto, foto; rótulo de los aliados); `PASOS_DEL_METODO = 6` en
  `mirada-pasos/grupos.ts`, que usan el esquema y `lugarEnGrupo` (ya no lee
  el largo de la lista). `MiradaPasos`, `PanelMirada`, `IndicadorPasos` y
  `BandaAliados` por props; `data/areas.ts` borrado. `pnpm test` 0 (179 ok) ·
  typecheck 0 · lint 0 · build 0 · react-doctor 100/100 (539) ·
  comparar-render **1, solo `imagenes` de `/que-hacemos`** (la excepción 1
  del SPEC §7; el resto, igual; `que-hacemos` −11.784 bytes de activos). La
  única imagen distinta es la #3, la foto de Investigar:

  ```
  antes: class="object-cover object-[50%_82%]"
         style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
  ahora: class="object-cover"
         style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;object-position:50% 82%;color:transparent"
  ```

  Misma posición: el foco `{ x: 0.5, y: 0.82 }` que da `estiloDeFoco`.

- **Paso 2 — Áreas de Qué hacemos** (`7480c58`).
  `features/que-hacemos/contenido/areas.ts` (título con resaltado, rótulos
  «Qué te llevás»/«Para quién», siete áreas: título, nombre corto, frase,
  detalle con un resaltado exacto, qué te llevás ×3, para quién, foto; el
  inicial es el de hoy, con la negrita de Inicio en el detalle) y
  `components/areas/anclas.ts` (`ANCLAS_DE_AREAS`, `idDeArea`: las anclas por
  posición, de ahí sale el 7). La página pasa a `async` con
  `contenidoDe("que-hacemos")`; `AreasQueHacemos`, `IndiceAreas`, `PanelArea`
  y los chips de `QueHacemosHero` leen por props; `data/areas.ts` se queda
  solo con `MIRADA` (se fueron `AREAS`, `Area`, `BAJADA`, `AREAS_INTRO` y los
  `hechos`, textuales en `docs/content/copy-que-hacemos.md` §3).
  `lib/contenido/resaltado.ts` suma `sinMarcas` y `partirResaltado` (+2
  tests), y la carta de Inicio usa `partirResaltado` en vez de su copia
  local. **Nombre accesible** del `nav` del índice: antes `aria-label`
  «Áreas de especialización»; ahora `aria-labelledby="areas-titulo"` → el
  mismo texto. `pnpm test` 0 (sitio: 180, 179 ok, 1 omitido que ya venía:
  las respuestas grabadas de Search Console) · `pnpm typecheck` 0 · `pnpm
  lint` 0 · `pnpm build` 0 (`/que-hacemos` sigue ○) · comparar-render 0
  («11 páginas, render idéntico»; `que-hacemos` −7.832 bytes de activos: los
  `hechos` ya no viajan al navegador) · react-doctor 100/100 (539). En el
  admin (`/admin/contenido/paginas/que-hacemos`, cuenta de prueba en
  `ed_paginasqh`): la sección dibuja título, rótulos y las siete áreas con
  sus tres puntos. **El navegador de Orca:** `orca screenshot` y `orca
  snapshot` cierran la pestaña (`browser_tab_closed`) cuando la worktree no
  está a la vista; `orca eval` anda. La verificación de pantalla va por DOM.

- **Paso 1 — partir `ImpulsanEd`** (`fcb72e6`). La coreografía a
  `impulsan-ed/coreografia-equipo.ts` (`crearCoreografiaEquipo(root)` devuelve
  su limpieza; la llama el mismo `useIsomorphicLayoutEffect`, con la misma
  guarda de reduced-motion), `Nivel.tsx` y `KickerRotulo.tsx` a la misma
  carpeta, sin tocar una línea. Líneas de código (AST de TypeScript, script en
  `%TEMP%\ed-paginasqh\lineas.cjs`): `ImpulsanEd.tsx` 300 → **164**;
  `coreografia-equipo.ts` 72, `Nivel.tsx` 59, `KickerRotulo.tsx` 11.
  `pnpm typecheck` 0 · `pnpm lint` 0 · `pnpm build` 0 · comparar-render 0
  («11 páginas, render idéntico», `quienes-somos` −10 bytes de activos) ·
  react-doctor 100/100 (537 archivos, con los nuevos en el índice). En el
  navegador (`localhost:3022/quienes-somos`, perfil `paginas-qh`): al cargar,
  los 23 elementos del equipo (`[data-team-head]`, `[data-reveal]`) en
  opacidad 0; bajando hasta el final de la sección, los 23 en 1 y las dos
  vertebrales en `scaleY(1)`; desde arriba, un `focusin` en una tarjeta
  revela los 23 (el foco real no dispara `focusin` porque la ventana de Orca
  no tiene el foco: `document.hasFocus()` da `false`). Reduced-motion no se
  puede emular en el navegador de Orca; su guarda es la misma línea de antes.
  Sin capturas lado a lado: el código se mudó entero y la prueba es de
  comportamiento.

- **SPEC aprobado por el padre** (2026-09-26) con una condición (nombres
  accesibles por `aria-labelledby` al título editable) y un pedido (probar la
  vista previa de `/` con un borrador de Qué hacemos); PLAN escrito.

- **Arranque del worktree** (2026-09-26) — `pnpm install` (549 paquetes) y
  `pnpm generate` (Prisma 7.10.0); `.env.local` copiado y apuntado a la base
  propia `ed_paginasqh` (creada en `ed-postgres`), `pnpm migrate:deploy` →
  «All migrations have been successfully applied».
- **Build de referencia** sobre `48ed711` → `%TEMP%\ed-paginasqh\antes\.next`
  (base sin filas en `paginas`: el contenido inicial). `pnpm build` exit 0;
  `node scripts/comparar-render.mjs %TEMP%\ed-paginasqh\antes apps/sitio` →
  «11 páginas, render idéntico». El primer build falló con `next/font/google
  queries have exactly one entry` y el reintento repitió el error sobre el
  `.next` que dejó el primero; con `apps/sitio/.next` borrado, compiló. Si
  vuelve a aparecer: borrar `.next` antes de sospechar del código.
- **Relevamiento** de las dos páginas contra el código de hoy (dos agentes de
  lectura, verificado a mano en los puntos que deciden el diseño): las siete
  áreas idénticas a las de Inicio salvo la negrita; el método, solo las cinco
  frases iguales; `ImpulsanEd` 282 líneas de código, el único que pasa el tope;
  el `<head>` de las dos páginas hereda hoy el `og:`/`twitter:` de Inicio.
