# PROGRESS — Páginas: Inicio completo y la base de la edición

- **Rama:** `mateo/paginas-inicio` (sobre `main` `8b53269`)
- **Worktree:** propio (lane 4a del XL `mapa-del-admin`), dev server en el
  puerto 3014, base `ed_paginasinicio` en `ed-postgres`
- **Spec:** [`SPEC.md`](SPEC.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `8b53269`:

- Desde el admin se edita solo Inicio → Hero (`contenido/paginas.ts`); las
  otras seis secciones de Inicio leen de `como-trabajamos/data.ts`,
  `lineas-accion/data.ts` y de arreglos sueltos en `Manifiesto.tsx`,
  `MisionPanel.tsx`, `DatosDuros.tsx`, `LineasAccion.tsx` y
  `BibliotecaNovedades.tsx`.
- `paginas` tiene borrador y publicado, sin historial. El choque existe solo
  al guardar; la primera fila se crea con `create` y dos altas a la vez tiran
  por la clave primaria.
- `/` no tiene `generateMetadata`: usa el título por defecto del layout (72
  caracteres) y `siteConfig.description` (241), con la imagen de
  `app/(sitio)/opengraph-image.png`.
- Por arriba del tope: `HeroQuienes.tsx` (314 líneas, 237 de código),
  `config/nav.ts` (104), `scripts/comparar-render.mjs` (117),
  `datos/acciones/editar-paginas.ts` en 100 justas.
- Los 19 `<img>` del hero (11 + 8) viven dentro de `aria-hidden="true"`.

## In progress

- 2026-09-26 — SPEC aprobado por el padre con cuatro cambios (DECISIONS);
  PLAN escrito, 19 pasos. Arranca work-run.

## Hecho

- **Preparación** — build de referencia sobre `aac03c0` (el código de
  `93b1caa`) copiado a `%TEMP%\ed-paginas-inicio\antes\.next`; contra sí mismo,
  comparar-render da «14 páginas, render idéntico». Dev server en la pestaña
  de Orca «dev paginas-inicio» (`term_4f37847c…`), puerto 3014.
- **Paso 1** (`729b76a`) — `HeroQuienes.tsx` de 314 a 90 líneas; la
  coreografía a `hero-quienes/`: `coreografia-quienes.ts` (100: contexto,
  nodos, capas, relleno), `barrido-quienes.ts` (63), `progreso-quienes.ts`
  (60) e `IndicadorQuienes.tsx` (46). Son cuatro piezas y no tres como decía
  el PLAN: con el barrido adentro, la coreografía pasaba de 100. `pnpm
  typecheck` 0 · `pnpm lint` 0 · `node scripts/verificar-react-doctor.mjs` 0
  (100/100, 415 archivos) · `pnpm build` 0 · comparar-render 0 («14 páginas,
  render idéntico»). En el navegador de Orca (1568×921), clip de las dos
  capas, transform de la línea, palabras encendidas y ancho de las cápsulas en
  0,5 / 1,25 / 2,0 pantallas dentro de la zona: idénticos con el código viejo
  servido por HMR («Compiled in 159ms») y con el nuevo (p. ej. a 1,25:
  `inset(0px 774.254px 0px 0px)`, 57 palabras, cápsulas 22px/8px). El camino
  de `prefers-reduced-motion` es el mismo `if (reduced) return` del efecto,
  sin tocar.
- **Paso 2** (`8eeb887`) — `lib/contenido/resaltado.ts` (+ 5 tests):
  `fragmentos`, `parrafos`, `resaltadoValido({ exactamente })`,
  `RESALTADO_SIN_CERRAR`, `resaltadoExacto`; `features/home/contenido/comunes.ts`
  (`enlace()`, `cuerpoConResaltado()`); `quienes-somos.ts` (título, cuerpo,
  enlace, foto); `Manifiesto` lee por props y `QS_PARAGRAPHS` se fue;
  `segmentos-de-relleno.ts` pasa el cuerpo a `FillSeg[][]` (afuera de
  `ScrollFillText.tsx`: react-doctor marcó `only-export-components` al tenerlo
  adentro); `contenido/paginas.test.ts` (cada sección pasa su esquema y
  `describir` la dibuja). `pnpm --filter sitio test` 0 (87: 86 pasan, 1 skip
  de antes) · typecheck 0 · lint 0 · react-doctor 100/100 · build 0 ·
  comparar-render 0 («14 páginas, render idéntico»; `index.html` −58 bytes de
  activos).
- **Paso 3** (`18b0886`) — `features/home/contenido/mision.ts`
  (título, cuerpo con resaltado de `comunes.ts`, foto); `MisionPanel` lee por
  props y `MISION_PARAGRAPHS` se fue; `HeroQuienes` recibe `mision`. test 0 ·
  typecheck 0 · lint 0 · react-doctor 100/100 (422 archivos) · build 0 ·
  comparar-render 0 («14 páginas, render idéntico»).
- **Paso 4** (`d8957a2`) — `features/home/contenido/en-numeros.ts` (cuatro datos:
  cifra con su `.refine()`, qué cuenta, nota; el porqué de cada cifra se mudó
  acá) y `cifra.ts` (`partirCifra`, + 2 tests); `DatosDuros` lee por props y
  `DATOS` se fue. Dos arreglos antes del commit: react-doctor marcó
  `no-array-index-as-key` (la key vuelve a ser la etiqueta, como antes), y
  comparar-render mostró **+749.870 bytes** de JS en `/`: `DatosDuros`
  (cliente) importaba `partirCifra` desde el módulo del esquema, que trae Zod.
  `partirCifra` pasó a `cifra.ts`, sin Zod (DECISIONS). test 0 · typecheck 0 ·
  lint 0 · react-doctor 100/100 (425) · build 0 · comparar-render 0 (render
  idéntico, −1.338 bytes).
- **Paso 5** (`d8b7397`) — `features/home/contenido/como-trabajamos.ts` (cinco
  pasos: título, frase, detalle, foto); `ComoTrabajamos` numera («01»…) y pasa
  a `PasoMetodo` (ahora con `estiloDeFoco`) e `IndicadorPasos`;
  `como-trabajamos/data.ts` borrado. test 0 · typecheck 0 · lint 0 ·
  react-doctor 100/100 · build 0 · comparar-render 0 (render idéntico, −5.366
  bytes).
- **Paso 6** (`e282f7c`) — `features/home/contenido/areas.ts` (título, bajada,
  enlace, siete áreas con un resaltado exacto en el detalle); `LineasAccion` lee
  por props (el efecto suma `cantidad` a sus dependencias: la usa adentro);
  `CartaArea` parte el detalle en antes / clave / después y toma el ícono y el
  número del índice; `lineas-accion/data.ts` borrado. test 0 · typecheck 0 ·
  lint 0 · react-doctor 100/100 · build 0 · comparar-render 0 (render idéntico,
  −9.074 bytes). En el navegador: `#areas` con `is-live`, 7 cartas, las
  claves en `strong` y el enlace a `/investigacion`.
- **Paso 7** (`9c622bc`) — `features/home/contenido/biblioteca-y-novedades.ts`
  (dos columnas: título y bajada); `BibliotecaNovedades` los lee por props y
  su `aria-label` («Ir a …») sigue al título. Inicio queda con sus siete
  secciones en el registro. test 0 · typecheck 0 · lint 0 · react-doctor
  100/100 · build 0 · comparar-render 0 (render idéntico).
- **Paso 8** (`ccc978e`) — `hero.ts`: `fotoDelCollage()`, el campo de foto de las
  dos listas con la ayuda «Acá la foto es decorativa: el lector de pantalla
  saltea el collage del hero. El texto alternativo igual queda con la foto,
  para donde se use.» (`CampoFoto` ya dibuja `ayuda`). El `aria-hidden` se
  queda (DECISIONS, cambio 3 del padre). test 0 · typecheck 0 · build 0 ·
  comparar-render 0.
- **Paso 9** (`4e98c69`) — [batch] `config/nav.ts` 104 → 99 (el tipo `NavItem` en
  una línea, el comentario de `RUTAS_INTERNAS` más corto) y
  `scripts/comparar-render.mjs` 117 → 97 (comentarios apretados, `todos()`,
  `activos` con `reduce`, el bucle final con destructuring; el encabezado
  suma que la ceguera al bundle ya escondió Zod en la home). La salida del
  script nuevo es **idéntica byte a byte** a la del viejo, con el mismo código
  de salida, en tres pares: la referencia contra el build actual (0), contra
  un build alterado a mano (una página menos, un alt y un link cambiados: 1)
  y contra sí misma (0). typecheck 0 · lint 0 · build 0 · comparar-render 0.
