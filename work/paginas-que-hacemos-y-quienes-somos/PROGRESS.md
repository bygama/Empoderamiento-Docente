# PROGRESS — Páginas: Qué hacemos, Quiénes somos y lo compartido

Lane 4b del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md). SPEC en
[`SPEC.md`](SPEC.md), plan en [`PLAN.md`](PLAN.md), rulings en
[`DECISIONS.md`](DECISIONS.md).

## In progress

- Rebasada sobre `main` `15def2c` y verificada de nuevo (el bloque de
  arriba en Verification). Falta la revisión de cierre, que abre el padre al
  recibir `worker_done` (1 asiento, Opus 5.5, medium, «el cambio entero
  contra su SPEC»).

**En pausa con el PR #187 abierto**
(https://github.com/bygama/Empoderamiento-Docente/pull/187), esperando la
revisión de cierre del padre. Para retomar en frío:

- **Entorno:** base `ed_paginasqh` (`.env.local` apunta ahí; está en
  `.gitignore`), cuenta de prueba `prueba-4b@empoderamientodocente.local`
  (administra), dev server en la pestaña de Orca «dev
  paginas-que-hacemos-y-quienes-somos» (puerto 3022, con
  `NEXT_PUBLIC_SITE_URL=http://localhost:3022`), navegador de Orca con el
  perfil `paginas-qh`. Los scripts de verificación están en
  `%TEMP%/ed-paginasqh/` (`paso.sh`, `guardar-previo.sh`, `diff-head.mjs`,
  `nombres.js`, `aviso.js`, `lineas.cjs`): son de sesión, no del repo.
- **Si llegan hallazgos de la revisión:** se arreglan acá, se re-verifica
  desde el gate y se anota cada ruling en DECISIONS.
- **Si hay que rebasear otra vez** (por ejemplo, si entra la 4c antes):
  conciliar `contenido/paginas.ts`, `config/metadata.ts` (la misma
  `openGraphDeLaPagina`) y el README; rehacer la referencia de comparar-render
  con el build del `main` nuevo (hoy `%TEMP%/ed-paginasqh/antes-15def2c`) y
  comprobar que siguen siendo solo las cuatro diferencias; el gate entero y
  el pre-push.
- **Al cerrar** (después del PASS del revisor): el commit que finaliza la
  lane y el que borra `work/paginas-que-hacemos-y-quienes-somos/`, los dos en
  este mismo PR.

## Verification

### 2026-09-26 — Rebase sobre `main` `15def2c` — gate entero — PASS

Pedido del padre antes de la revisión de cierre. `git rebase origin/main`
(30 commits) con un solo conflicto, DESIGN.md §11, la frase de apertura: se
conservan las dos intenciones (lo que sumaron mensajes e inicio, y «la
sección compartida») en una sola frase; las entradas de §11 quedan una por
patrón, sin duplicados (`### Sección compartida` es la única que habla de
compartir). README y AGENTS.md se mezclaron solos y quedaron coherentes.
`main` y esta lane no tocan ningún archivo de código en común (solo esos tres
docs). **Migraciones:** la lane no tiene; la de `main`
(`20260926231819_mensajes`) se aplicó a `ed_paginasqh` (`pnpm
migrate:deploy` → «All migrations have been successfully applied»,
`migrate:status` → «Database schema is up to date!»). `pnpm install` →
«Already up to date»; `pnpm generate` → Prisma 7.10.0. **SEO:**
`openGraphDeLaPagina` todavía no está en `main` (la 4c no entró): queda la de
esta lane, misma firma, mismo lugar.

- **Referencia nueva:** `git checkout --detach origin/main` (`15def2c`),
  `.next` borrado, `pnpm build` → exit 0, copia de `server/` y `static/` a
  `%TEMP%/ed-paginasqh/antes-15def2c`; vuelta a la rama.
- **Typecheck en limpio:** con `apps/sitio/next-env.d.ts` y `apps/sitio/.next`
  borrados (`ls` → «No such file or directory» los dos), `pnpm typecheck` →
  exit 0, 0 `error TS`.
- `pnpm lint` → exit 0 · `pnpm test` → exit 0 (packages/auth 28/28;
  apps/sitio 245: 244 ok, 0 fallas, 1 omitido que ya venía) · `pnpm build` →
  exit 0 (`/`, `/que-hacemos` y `/quienes-somos` ○) ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor: 100/100,
  sin diagnósticos», apps/sitio/src 640 archivos · packages/db/src 3 ·
  packages/auth/src 17).
- **comparar-render contra `15def2c`** → exit 1 con **exactamente las cuatro
  diferencias aprobadas** y las otras 10 páginas iguales:
  `que-hacemos` en `head` (og:title, og:description, twitter:title,
  twitter:description) e `imagenes` (#3, la foto de Investigar, de clase a
  `style`); `quienes-somos` en `head` (las mismas cuatro etiquetas) e
  `imagenes` (#2 y #3, `%2Fquienes-somos%2F` → `%2Ffotos%2F`). **`og:image` y
  `twitter:image` no cambian** en ninguna de las dos (el md5 de esas etiquetas
  da igual antes y después: `f4927b5c` en los cuatro casos).
- **Humo:** dev server de nuevo en su pestaña; `/`, `/que-hacemos` y
  `/quienes-somos` → 200; en `/admin/contenido/paginas/inicio`, los dos avisos
  de sección compartida con su texto.
- La vista previa y la revalidación de punta a punta (bloque de abajo) no se
  repitieron: ningún archivo de código de esta lane cambió en el rebase.

### 2026-09-26 — L DoD (aceptaciones del PLAN + gate del repo + SPEC §11) — PASS

Sobre `f0bb38c`, base `ed_paginasqh`, en esta sesión:

- **L1 static:** `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos», apps/sitio/src 554 archivos · packages/db/src 3
  · packages/auth/src 17).
- **L2 behavioral:** `pnpm test` → exit 0 (packages/auth 28/28; apps/sitio
  188: 187 ok, 0 fallas, 1 omitido que ya venía —las respuestas grabadas de
  Search Console—; los de integración corren contra `ed_paginasqh`) ·
  `pnpm build` → exit 0 (`/`, `/que-hacemos` y `/quienes-somos` siguen ○
  estáticas) · arranca: `next dev -p 3022` → «Ready», y `next start -p 3022`
  sobre el build de producción → «Ready in 138ms».
- **Render:** `node scripts/comparar-render.mjs "$TEMP/ed-paginasqh/antes"
  apps/sitio` → exit 1 con exactamente las cuatro diferencias aprobadas y
  ninguna otra: `que-hacemos` en `head` (og:title, og:description,
  twitter:title, twitter:description) e `imagenes` (la #3, la posición de la
  foto de clase a `style`); `quienes-somos` en `head` (las mismas cuatro) e
  `imagenes` (las #2 y #3, `%2Fquienes-somos%2F` → `%2Ffotos%2F`). Las otras
  nueve páginas, iguales; `index.html` igual. Contra el build del paso
  anterior, cada paso dio 0 salvo su propia excepción (entradas de abajo).
- **L3 end-to-end** (navegador de Orca, perfil `paginas-qh`, cuenta de
  prueba):
  - **La vista previa** (pedido del padre). En el editor de Qué hacemos, el
    título del área 1 pasó a «Desarrollo profesional docente (prueba)» →
    «Guardar borrador» («Borrador guardado. El sitio sigue mostrando lo
    publicado.») → «Vista previa». **En vista previa, `/` muestra la primera
    carta del abanico como «Desarrollo profesional docente (prueba)»** (7
    cartas) y `/que-hacemos` el artículo igual: Inicio lee el borrador de Qué
    hacemos, como el suyo. Con «Volver al sitio publicado», **`/` vuelve a
    «Desarrollo profesional docente»**: el sitio publicado no ve el borrador.
  - **La revalidación de las dos rutas.** Build de producción
    (`NEXT_PUBLIC_SITE_URL=http://localhost:3022 pnpm build`, exit 0) y
    `next start -p 3022` en la pestaña de Orca. Antes de publicar, `curl /` →
    «Desarrollo profesional docente», `x-nextjs-cache: HIT`, `s-maxage=31536000`
    (el prerender). «Publicar» en Qué hacemos → «Publicado: el sitio ya
    muestra esta versión.». Después, sin rebuild: `curl /` → **«Desarrollo
    profesional docente (prueba)»** (dos veces, `HIT` ya regenerado) y
    `/que-hacemos` también. Publicar la dueña regeneró `/`.
  - Limpieza: la fila de `que-hacemos` de `ed_paginasqh` se borró
    (`DELETE 1`; las versiones se fueron en cascada: 0), y el dev server
    volvió a su pestaña.
- **Close review:** no se abre acá. La abre el padre al recibir
  `worker_done` (DECISIONS del padre, 2026-09-26: 1 revisor Opus 5.5,
  medium, «el cambio entero contra su SPEC»).

## Abierto

- **La copia de `origen-03-pregunta.webp`** (paso 11): está en
  `public/fotos/` (la usa el origen) y en `public/quienes-somos/` (la usa
  Novedades). Se deduplica cuando Fotos (lane 9) consolide dónde vive cada
  archivo; el padre lo anota en su lane.

## Hecho

- **Paso 18 — Docs** (`c54a7dc`, `f771e88`, `fed49b2`). README «Editar las
  páginas» (las dos páginas y lo compartido), AGENTS.md §13 (la fase C) y los
  punteros de `docs/content/arquitectura-que-hacemos.md` y
  `que-hace-ed-fuentes.md` al contenido nuevo. `git grep -n
  "que-hacemos/data" -- docs README.md AGENTS.md` → exit 1 (sin resultados).

- **Paso 17 — El aviso de sección compartida** (`a78da12`, DESIGN.md en
  `a924fc5`). `comparticionDe(registro, slug, clave)` en
  `lib/contenido/compartido.ts` (+1 test: las dos puntas y nada donde no se
  comparte); `paginaParaEditar` suma `compartida` a cada sección;
  `admin/paginas/AvisoDeCompartida.tsx` la dibuja debajo del título de la
  sección, en `Seccion`. DESIGN.md §11 suma «Sección compartida». typecheck 0
  · lint 0 · test 0 (187 ok) · build 0 · react-doctor 100/100 ·
  comparar-render contra el paso anterior **0** (el sitio no cambia). En el
  navegador (`localhost:3022`, cuenta de prueba):
  - **Textos:** Inicio › Cómo trabajamos «Las frases en verde de los pasos se
    editan en Qué hacemos › Cómo trabajamos: las comparten las dos páginas.»
    y Inicio › Áreas «Las siete áreas se editan en Qué hacemos › Áreas de
    especialización: …»; Qué hacemos › Cómo trabajamos «Inicio también
    muestra las frases en verde de los pasos: al publicar Qué hacemos,
    cambian las dos páginas.» y Qué hacemos › Áreas «Inicio también muestra
    las siete áreas: …».
  - **Link:** `href` a `/admin/contenido/paginas/que-hacemos#seccion-areas` (y
    `#seccion-comoTrabajamos`); el clic lleva al editor de Qué hacemos con la
    sección a la vista (tope a 112 px, debajo del encabezado fijo).
  - **Tres temas** (cookie `tema-del-admin`), medido con WCAG 2.x sobre el
    fondo real: claro y mixto, línea 13,63:1 y link 5,11:1; oscuro, 13,59:1 y
    7,14:1; link subrayado en los tres.
  - **Celular:** la emulación de dispositivo de Orca (`orca set device`) y
    las capturas (`orca screenshot`) fallan con la ventana de Orca sin foco
    («Screenshot timed out — the browser tab may not be visible», el mismo
    límite que tuvo la 4a), y el admin no se deja enmarcar (su CSP), así que
    un iframe de 390 no sirve. Medido por DOM: la línea clonada en una caja
    de 320 px envuelve en tres renglones sin desbordar (`scrollWidth` =
    `clientWidth` = 320). No hay capturas de este paso.
  - **Teclado:** el link es un `<a>` con el foco de siempre
    (`focus-visible:outline-2 … outline-azul-medio`, en la hoja construida);
    el foco real no se pudo ejercitar con la ventana sin foco.

- **Paso 16 — Las frases del método, una sola fuente** (`3112758`). Los
  pasos de Inicio pierden `frase` (esquema e inicial) y su sección anota
  `usa: { pagina: "que-hacemos", seccion: "comoTrabajamos", que: "Las frases
  en verde de los pasos" }`; `ideasDelMetodo(comoTrabajamos, cuantas)` (+1
  test: las cinco ideas de hoy, en orden) y `ComoTrabajamos` las recibe como
  `frases` y se las pone a cada paso. La ayuda de la idea en Qué hacemos
  nombra a Inicio; la de los pasos de Inicio dice que Qué hacemos tiene su
  propia versión, con otros textos. typecheck 0 · lint 0 · test 0 (186 ok) ·
  build 0 · react-doctor 100/100 · comparar-render contra el paso anterior
  **0**.

- **Paso 15 — Las siete áreas, una sola fuente** (`ce0a9e6`).
  `lib/contenido/compartido.ts` (sin ED): `Compartido = { pagina, seccion,
  que }`, `rutasQueMuestran`, `quienesUsan`, `problemasDeCompartidos` (+3
  tests); `SeccionRegistrada.usa?`. La sección `areas` de Inicio pierde la
  lista (se queda con título, bajada y enlace) y anota `usa: { pagina:
  "que-hacemos", seccion: "areas", que: "Las siete áreas" }`; el test del
  registro exige `problemasDeCompartidos(PAGINAS)` vacío.
  `features/home/contenido/compartido.ts`: `areasDeInicio` (+1 test: solo
  título, frase y detalle, en orden; solo tipos de Qué hacemos). `/` pide
  Inicio y Qué hacemos con `Promise.all` (react-doctor frenó el `await`
  secuencial: `server-sequential-independent-await`, arreglado por código) y
  `LineasAccion` recibe las áreas. `publicarEnBase` devuelve `rutas` (de
  `rutasQueMuestran`) y la acción `publicar` revalida cada una; el test de
  integración nuevo publica la dueña de un registro de prueba y recibe las
  dos rutas, y el viejo de `editar-paginas.test.ts` pasa a `rutas`. Las
  ayudas de las áreas de Qué hacemos ahora nombran a Inicio. typecheck 0 ·
  lint 0 · test 0 (sitio: 186, 185 ok, 1 omitido) · build 0 (`/` sigue ○) ·
  react-doctor 100/100 · comparar-render contra el paso anterior **0**
  (`index.html` igual, −8 bytes de activos: Zod no viaja al navegador).

- **Paso 14 — SEO de Quiénes somos** (`49ef7aa`).
  `features/quienes-somos/contenido/seo.ts` («Quiénes somos | Empoderamiento
  Docente», la descripción de hoy, sin imagen), su línea `seo` y
  `generateMetadata` con `openGraphDeLaPagina(padre)`. typecheck 0 · lint 0 ·
  test 0 (179) · build 0 (`/quienes-somos` sigue ○) · react-doctor 100/100 ·
  comparar-render contra el paso anterior **1, solo `head` de
  `/quienes-somos`** (la excepción 3 del SPEC §7):

  ```
  - og:title / twitter:title             «Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas»
  - og:description / twitter:description «Consultora especializada … en Chile, México, Argentina, Colombia y Brasil.»
  + og:title / twitter:title             «Quiénes somos | Empoderamiento Docente»
  + og:description / twitter:description «Empoderamiento Docente no es una capacitación más: investigación, diseño y acompañamiento para transformar la relación con el saber matemático escolar.»
  ```

  `<title>`, `description`, `og:image` y `twitter:image`, iguales.

- **Paso 13 — Quiénes sostienen ED** (`ec3ef0b`).
  `features/quienes-somos/contenido/equipo.ts` (volanta, título con un
  resaltado, bajada, rótulos de los cuatro niveles: dirección general,
  dirección, y volanta y título de líderes y de facilitación); `ImpulsanEd`
  por props (164 → 169 líneas de código). Las personas siguen en
  `data/equipo.ts` (lane 8). **Nombre accesible**: antes `aria-label`
  «Quiénes sostienen ED — el equipo»; ahora `aria-labelledby="equipo-titulo"`
  → «Quiénes sostienen ED» (pierde « — el equipo», como anotó DECISIONS).
  typecheck 0 · lint 0 · test 0 (179) · build 0 · react-doctor 100/100 ·
  comparar-render contra el paso anterior **0**.

  **Nombres accesibles de `/quienes-somos`, antes → ahora:**

  | Región | Antes (`aria-label`) | Ahora |
  | --- | --- | --- |
  | hero | Quiénes somos — Empoderamiento Docente | No capacitamos. Transformamos. (`aria-labelledby`) |
  | `#origen` | Origen, sentido y evolución | igual, `aria-label` fijo (sin título propio) |
  | `#mirada` | Nuestra mirada | Nuestra mirada (`aria-labelledby`, la volanta) |
  | `#equipo` | Quiénes sostienen ED — el equipo | Quiénes sostienen ED (`aria-labelledby`, la volanta) |

- **Paso 12 — Nuestra mirada** (`81bb8e7`).
  `features/quienes-somos/contenido/mirada.ts` (volanta, título con un
  resaltado, tres principios: nombre, frase sin punto final con lo tachado
  como su resaltado —cero o uno—, afirmación con un resaltado, cinco fichas;
  síntesis con un resaltado y puente). `constelacion-mirada.ts` cambia
  `PERSPECTIVAS` por `ACENTOS` (número y color: la estructura) y
  `armarPerspectivas(principios)`; `timeline-fases.ts` recorre `ACENTOS`;
  `MiradaEd`, `MapaConstelacion`, `DetallePerspectiva` y `SintesisMirada` por
  props. **Nombre accesible**: antes `aria-label` «Nuestra mirada»; ahora
  `aria-labelledby="mirada-titulo"` → la volanta, el mismo texto.
  typecheck 0 · lint 0 · test 0 (179) · build 0 · react-doctor 100/100 ·
  comparar-render contra el paso anterior **0** (el «La educación es un
  derecho<!-- -->.» del principio sin tachado sale igual porque el punto sigue
  siendo un nodo aparte). En el navegador: los tres nombres en el mapa, las
  tres frases con su punto, las tres afirmaciones y las 15 fichas.

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
