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
- 2026-09-26 — Los 19 pasos hechos y verificados (abajo), más un arreglo de
  la verificación (el contraste del oscuro en DESIGN.md).
- 2026-09-26 — **En pausa, a la espera de la revisión de cierre, con el PR #183 abierto.** Rebaseada
  sobre `main` `5a07368` con lo que pidió el padre (capacidades, actividad,
  pestañas de `main`, migración regenerada) y verificada otra vez. La revisión
  la lanza el padre al recibir `worker_done` (1 revisor Opus 5.5, effort
  medium, lente «el cambio entero contra su SPEC»); el merge es suyo. Para
  retomar: leer este archivo y DECISIONS; la base `ed_paginasinicio` tiene
  las 13 migraciones y ninguna fila en `paginas`.

## Verification

### 2026-09-26 — L DoD después del rebase sobre `origin/main` `5a07368`, sobre `55531db` — PASS (falta la revisión de cierre, del padre)

- Rebase: 24 commits sobre `main` con roles y actividad (#182), seguridad
  (#180) y Métricas (#181); conflictos en `ruta.ts`/`ruta.test.ts`/
  `Pestanas.tsx` (queda la `pestanaActiva` de `main`), DESIGN.md §11, README y
  AGENTS.md §3, resueltos juntando las dos lanes. La migración se regeneró
  como `20260926231213_versiones_de_paginas` (DECISIONS). Commit nuevo
  `877f1ef`: capacidades y actividad.
- L1 static: `pnpm typecheck` → exit 0 (después de borrar `.next/types`,
  tipos generados por un build viejo que apuntaban a `api/cron/metricas`) ·
  `pnpm lint` → exit 0 · `node scripts/verificar-react-doctor.mjs` → exit 0
  («100/100, sin diagnósticos (apps/sitio/src: 533 archivos · packages/db/src:
  3 archivos · packages/auth/src: 17 archivos)»).
- L2 behavioral: `pnpm test` → exit 0 (`@ed/auth` 28 pasan; la app «tests
  178 · pass 177 · fail 0 · skipped 1», con `acciones-con-sesion` exigiendo
  sesión y capacidad en todas las acciones de esta lane, ya fuera de
  `SIN_CAPACIDAD`) · `pnpm migrate:status` → exit 0 («13 migrations found…
  up to date», sobre `ed_paginasinicio` recreada) · `pnpm build` → exit 0.
- L2 render: referencia nueva construida desde `origin/main` `5a07368` en este
  checkout (`<%TEMP%>/ed-paginas-inicio/antes-main`); `node
  scripts/comparar-render.mjs … apps/sitio` → exit 0, «11 páginas, render
  idéntico» (`index.html` 26→28 activos, −8.320 bytes: el bundler parte
  distinto, los bytes bajan).
- L3 end-to-end (dev server reiniciado por el cliente de Prisma nuevo, cuenta
  recreada, perfil aislado): publicar dos veces desde el editor, restaurar la
  primera desde Versiones y descartar desde «Qué cambió» → avisos «Publicado…»
  ×2, «Se restauró como borrador…», borrador descartado; la tabla `actividad`
  tiene `publico-una-pagina` ×2, `restauro-una-version` y
  `descarto-un-borrador`, los cuatro sobre «Inicio» / `inicio`. El resto del
  recorrido y la pasada de temas, 390 y teclado son los del bloque de abajo:
  esta lane no tocó UI en el rebase (solo `Pestanas.tsx` para volver a la
  función de `main`).

### 2026-09-26 — L DoD sobre `ccad5bf` — PASS (falta la revisión de cierre, del padre)

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos (apps/sitio/src: 461 archivos · packages/db/src:
  3 archivos · packages/auth/src: 5 archivos)»). Topes: ningún componente
  tocado pasa 200 líneas de código (los más grandes: `LineasAccion` 177,
  `CampoFoto` 170, `BibliotecaNovedades` 154) ni ninguna utilidad 100
  totales (`useAccionesDePagina.ts` 100, `coreografia-quienes.ts` 100,
  `nav.ts` 99, `comparar-render.mjs` 97).
- L2 behavioral: `pnpm test` → exit 0 («tests 107 · pass 106 · fail 0 ·
  skipped 1»; el skip es el de antes, las respuestas grabadas de Vercel que
  esperan la A1 de métricas; incluye los tests de integración contra
  `ed_paginasinicio`: choque, alta, versiones y restaurar) ·
  `pnpm migrate:status` → exit 0 («7 migrations found… Database schema is up
  to date!») · `pnpm build` → exit 0 (`/` sigue ○ estática; las cuatro rutas
  del editor ƒ) · build **sin `DATABASE_URL`** (las dos líneas fuera de
  `.env.local` un momento, restauradas) → exit 0 · arranca: el dev server
  del puerto 3014 sirve el admin y el sitio.
- L2 render: `node scripts/comparar-render.mjs <%TEMP%>/ed-paginas-inicio/antes
  apps/sitio` → exit 0, «14 páginas, render idéntico», con base y sin base.
  Activos: `index.html` −8.548 bytes; las demás páginas del sitio +598 y las
  de acceso +1.160, que son CSS: Tailwind arma una hoja para los dos route
  groups y las clases nuevas del admin viajan al sitio (~0,3 %; la lane de
  cimientos dejó escrito partir la hoja recién si pasa el 5 %).
- L3 end-to-end (navegador de Orca, `localhost:3014`, perfil aislado
  «paginas-inicio», cuenta local `editora@prueba.local`): el recorrido de cada
  paso está en «Hecho» (choque entre dos pestañas con «Recargar», error en el
  campo con foco y «Con error», pestañas y SEO con su vista previa y el
  `<title>`/`og:image` del borrador en el sitio, «Qué cambió» y publicar desde
  ahí, dos publicaciones y restaurar la primera). La pasada final:
  - **Tres temas** (`data-tema`, con las transiciones apagadas: con la
    ventana de Orca tapada no avanzan y `getComputedStyle` devolvía el color
    de partida). Claro y mixto → pestaña activa 13,63 · inactiva 4,83 · aviso
    de largo 13,63 · contador pasado 13,63 · título de Google 5,11 · meta
    4,83 · «Antes» 4,83 · «Ahora» 13,63; oscuro → 13,59 · 7,08 · 13,59 ·
    13,59 · 7,14 · 7,08 · 7,08 · 13,59. Encabezado en azul (cambios sin
    guardar): activa 13,63 / 13,59, inactiva 7,68 / 7,95 en el oscuro, error
    del campo 6,57 / 6,71. Todo AA y todo como en DESIGN.md §11 (el 7,95 se
    sumó en `ccad5bf`).
  - **390 de ancho** (`set viewport 390 844` después de cada `goto`): las
    cuatro pestañas sin scroll horizontal del documento, la barra de acciones
    fija abajo (844/844) con Guardar · Vista previa · Publicar (Secciones,
    SEO), Vista previa · Publicar (Qué cambió) y sin barra (Versiones); la
    fila de pestañas se corre 2 px (353/351), como prevé el patrón. Lo que
    salía del ancho en «Secciones» estaba adentro de ítems cerrados de la
    lista de pasos (`checkVisibility()` falso).
  - **Teclado**: el orden de tabulación es el de lectura (migas, Descartar,
    Guardar, Vista previa, Publicar, las cuatro pestañas, el formulario). Con
    la ventana de Orca sin foco, `orca keypress Tab` no mueve el foco ni se
    activa `:focus-visible`: el anillo se comprobó en la hoja
    (`focus-visible:outline-azul-medio` / `-azul-claro`, `-outline-offset-2`).
  - **Capturas**: `choque-a.png`, `error-en-campo.png` y `seo-claro.png` en
    `<%TEMP%>/ed-paginas-inicio/`. Las de «Qué cambió», «Versiones», los otros
    temas y el celular no se pudieron sacar: `orca screenshot` da «Screenshot
    timed out — the browser tab may not be visible or the window may not have
    focus» mientras la ventana de Orca muestra otra cosa.
- Close review: la abre el padre al recibir `worker_done` (1 seat, Opus 5.5,
  medium, «el cambio entero contra su SPEC»). No se abre una acá.

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
- **Paso 10** (`9823564`) — `datos/acciones/choque.ts` (`Fallo`, `vioLaFila`,
  `choqueCon`); `editar-paginas.ts` (guardar con `createMany` +
  `skipDuplicates` en el alta y `updateMany` condicionado; descartar con
  `borradorEnVisto`) y `publicar-paginas.ts` (publicar mudado, con choque y
  `updateMany` condicionado); las Server Actions reciben `{ slug,
  borradorEnVisto }`; `Aviso` suma `accion` (botón de texto en el color del
  aviso, fuera del `role`); el editor encadena el `borradorEn` que devuelve
  `guardarTodo` hasta publicar y ofrece «Recargar». Tests de integración: el
  choque en publicar y descartar, y la carrera del alta con un cliente cuya
  primera lectura no ve la fila (contesta choque, no tira). `pnpm --filter
  sitio test` 0 (90: 89 pasan, 1 skip) · typecheck 0 · lint 0 · react-doctor
  100/100 (428). En el navegador (cuenta local `editora@prueba.local`): la
  pestaña B guarda «¿Quiénes somos? B»; la A, abierta antes, guarda «Misión A»
  y ve «Editora de prueba guardó este borrador hace un momento. Recargá para
  ver sus cambios antes de seguir.» con «Recargar» (captura en
  `%TEMP%\ed-paginas-inicio\choque-a.png`); «Recargar» pregunta «Recargar tira
  lo que escribiste sin guardar. ¿Recargar igual?», recarga y muestra el
  título de B con el borrador guardado.
- **Paso 11** (`46e4586`) — `VersionDePagina` en `paginas.prisma` (id uuid,
  `slug` → `paginas` en cascada, `documento`, `publicadoEn`, `publicadoPor`,
  índice `(slug, publicadoEn desc)`) y la migración
  `20260926220540_versiones_de_paginas` generada con `pnpm migrate` contra
  `ed_paginasinicio`; `publicarEnBase` en `$transaction`: `updateMany`
  condicionado, la versión y la poda a `MAXIMO_DE_VERSIONES` (10).
  `publicar-paginas.test.ts` (slug propio): once publicaciones dejan diez, la
  más nueva igual a `publicado` con quién y cuándo, la primera podada; una
  publicación que choca no deja versión. `pnpm --filter sitio test` 0 (92: 91
  pasan, 1 skip) · typecheck 0 · lint 0 · react-doctor 100/100 · `pnpm
  migrate:status` «7 migrations found… Database schema is up to date!».
- **Paso 12** (`0df6267`) — `lib/contenido/seo.ts` (`CLAVE_SEO`,
  `LARGO_DE_BUSCADOR`, `esquemaSeo`: título 100/60, descripción 300/160,
  `imagenParaRedes` nullable; `metadataDeSeo`; + 3 tests); `recomendado` en
  `textoCorto` y en la `Descripcion` (el tipo vive en `descripcion.ts`, sin
  Zod; + 1 test de `describir`); `parteDe`/`partesDe` en `documento.ts`
  (usados por `completarPagina`, guardar y publicar); `config/metadata.ts`
  (`TITULO_DEL_SITIO`, `OPEN_GRAPH_COMUN`, que usa también el layout);
  `features/home/contenido/seo.ts` (lo de hoy); `/` con `generateMetadata`;
  `contenidoDe` con `cache()`; el test del registro recorre las partes y
  mira que ninguna sección se llame `seo`. test 0 · typecheck 0 · lint 0 ·
  react-doctor 100/100 (433) · build 0 · comparar-render 0 (`head` incluido:
  render idéntico). El `<head>` de `/` sigue con el título de 72, la
  descripción de 241 y `og:image` = `opengraph-image` del sitio. «Editable»
  con SEO queda para el paso 14, con la pestaña.
- **Paso 13** (`290d569`) — `lib/contenido/descripcion.ts` (`caminoLegible`),
  `lib/contenido/errores.ts` (`ErrorDeCampo` con `camino` y `donde`,
  `resumenDeErrores`; sin Zod, lo usa el editor), `lib/contenido/problemas.ts`
  (`primerProblema` mudado de `documento.ts`, ahora con etiquetas, y
  `problemasAlGuardar`; + 3 tests); guardar devuelve `errores` y publicar dice
  «No se puede publicar: Parte › Campo — …»; `admin/campos/errores.ts` (el
  contexto, `errorDe`, `estaEn`), `largo.ts` + `PieDelCampo.tsx` (contador,
  aviso de largo recomendado, error y anuncio del tope, compartidos por
  `TextoCorto` y `Parrafo`: react-doctor marcó la complejidad 18 de
  `TextoCorto`), `error` en `RutaInterna` y `CampoFoto` (el alt con id
  `-campo`), «Con error» en el ítem cerrado de `ListaFija`;
  `useErroresDelEditor` (estado, `limpiar`, enfocar abriendo los `details`);
  `guardarTodo` sigue con las secciones que pasan y junta los errores de todas.
  test 0 (100: 99 pasan, 1 skip) · typecheck 0 · lint 0 · react-doctor
  100/100 (440). En el navegador: un resaltado sin cerrar en «¿Quiénes somos?»
  y el alt vacío de la tarjeta 3 → «Hay 2 campos para revisar. El primero: Hero
  › Tarjetas (computadora) › Tarjeta 3 › Foto › Texto alternativo — El texto
  alternativo es obligatorio.», foco en ese alt con la tarjeta abierta, el
  cuerpo con `aria-invalid` y su mensaje en `aria-describedby`, «Con error» en
  el ítem; editar el alt borra su error y la marca (captura
  `%TEMP%\ed-paginas-inicio\error-en-campo.png`). La sesión del navegador se
  perdía: las cookies de `localhost` las comparten las lanes; se pasó la
  pestaña a un perfil aislado «paginas-inicio».
- **Paso 14** (`9105c53`) — `admin/armazon/ruta.ts` `pestanaActiva` (+ 1 test con
  los casos del editor y los de un módulo) y `Pestanas` la usa, con su variante
  `sobreAzul` (activa blanca, las demás `azul-claro` 7,68:1, foco `azul-claro`)
  para el encabezado en modo navy; `lib/contenido/buscador.ts` (`CLAVE_SEO`,
  `LARGO_DE_BUSCADOR`, `recortarComoBuscador`, sin Zod; + 1 test);
  `partesEditables` y `paginaParaEditar(slug, parte)` en la consulta; la lista
  de Páginas pregunta `editable`; `admin/paginas/pestanas.ts`,
  `EncabezadoDelEditor` con las pestañas, `EditorDePagina` con `pestanas` y
  `aparte`; `EditorDeSeo` + `VistaPreviaSeo` (Google y redes, con la imagen del
  sitio importada de `opengraph-image.png`); la ruta `[slug]/seo`
  (`maxDuration` 60 por la subida). test 0 (101: 100 pasan, 1 skip) ·
  typecheck 0 · lint 0 · react-doctor 100/100 (446). En el navegador (perfil
  «paginas-inicio»): `/…/inicio` con «Secciones*» y las siete secciones, título
  «Inicio · Páginas · Admin ED»; la pestaña SEO en `/…/inicio/seo` con «SEO*»,
  título «SEO · Inicio · Páginas · Admin ED», contadores «72/60» y «241/160» con
  su aviso, sin `aria-invalid`, «Lleva imagen para redes», Google cortado en
  «…aprendizaje de…» (captura `seo-claro.png`); guardar con el título de 72
  anda; en la vista previa del sitio, `/` lleva la descripción del borrador
  (y `noindex`); con una imagen propia subida, `og:image` y `twitter:image`
  pasan a `/api/fotos/<uuid>` con su alt (la del sitio queda reemplazada).
- **Paso 15** (`d0b4459`) — `lib/contenido/comparar.ts` (`Legible`, `Diferencia`,
  `compararSeccion`, igualdad profunda sin orden de claves; + 5 tests);
  `datos/consultas/historial-de-paginas.ts` (`cambiosDe`: documentos
  completados, por parte); las acciones de la página salen de `EditorDePagina`
  a `useAccionesDePagina` (100 líneas) con `AvisoDeLaPagina` y
  `VistaPreviaFrenada`; `EncabezadoDelEditor` muestra solo las acciones que
  recibe (`Botones`); `PantallaDeRevision` (encabezado + contenido, publicar
  pide la pantalla de nuevo) y `ListaDeCambios` (antes en `gris-texto`, ahora
  en `azul-principal`, fotos 4/3 con foco y alt, dos estados vacíos); la ruta
  `[slug]/cambios` y su pestaña. test 0 (105: 104 pasan, 1 skip) · typecheck
  0 · lint 0 · react-doctor 100/100 (455). En el navegador: cambiar el título
  del hero y guardar (anda con el hook nuevo); «Qué cambió» con «Qué cambió*»,
  título «Qué cambió · Inicio · Páginas · Admin ED», Descartar · Vista previa ·
  Publicar, y dos partes: «Hero: Título» y «SEO: Descripción | Imagen para
  redes»; Publicar → «Publicado: el sitio ya muestra esta versión.», insignia
  «Publicada», «No hay cambios sin publicar», y una fila en
  `versiones_de_paginas`. El primer intento dio «No se pudo publicar»:
  `tx.versionDePagina` indefinido porque el dev server guardaba en
  `globalThis` un `PrismaClient` anterior a `pnpm generate`; se reinició y
  anduvo (no es del código: `datos/cliente.ts` lo cachea a propósito en
  desarrollo). Las capturas de Orca fallan cuando su ventana no está a la
  vista: la pasada visual queda para el final.
- **Paso 16** (`59bdc57`) — `datos/acciones/versiones-de-paginas.ts`
  (`restaurarVersionEnBase`: el borrador actual con cada parte de la versión
  que pasa el esquema de hoy encima; `noEntraron` con el motivo; choque; + 2
  tests de integración con slug propio: restaura sin publicar y choca después;
  lo que no pasa o ya no existe no entra y se dice) y la Server Action
  `restaurarVersion` en `versiones.ts` (con sesión, `z.uuid()`);
  `versionesDe` en `historial-de-paginas.ts`; `PantallaDeRevision` acepta
  una función como `children`; `ListaDeVersiones` (la `Lista` del armazón, «En
  el sitio» en la más nueva, «Restaurar como borrador» en las demás, estado
  vacío) y `PantallaDeVersiones`; la ruta `[slug]/versiones` y su pestaña.
  test 0 (107: 106 pasan, 1 skip) · typecheck 0 · lint 0 · react-doctor
  100/100 (461). En el navegador: publicar desde el editor (el hook nuevo)
  → «Publicado…»; Versiones con «Versiones*», título «Versiones · Inicio ·
  Páginas · Admin ED», sin botones en el encabezado, dos filas («Publicada el
  26/9 a las 19:47 · Por Editora de prueba · En el sitio» y la de las 19:43
  con «Restaurar como borrador»); restaurar → «Se restauró como borrador; el
  sitio sigue igual. Ver qué cambió», insignia «Borrador sin publicar», y el
  link lleva a «Qué cambió» con «Hero: Bajada». El motivo de lo que no entra
  quedaba «caracteres.; queda…»: pasó a «caracteres. Queda como está ahora».
- **Paso 17** (`80aa7c8`) — DESIGN.md §11: la línea de fechas; «Título de
  pestaña» con «SEO · Inicio · Páginas · Admin ED»; «Pestañas» con la más
  específica, la versión sobre azul (13,63:1 · 7,68:1, foco `azul-claro`) y el
  segundo consumidor (las pantallas de una página); «Lista» con las versiones;
  «Campos: el error y el largo» nueva (error en meta `rojo-error` 6,57:1, «Con
  error» en la lista fija, largo recomendado en meta medium `azul-principal`
  13,63:1, sin `aria-invalid`); «Avisos» con la acción adentro (5,75:1 ·
  11,63:1); «Qué cambió» y «Vista previa de buscador y redes» nuevas (antes
  `gris-texto` 4,83:1 · 7,08:1, título de Google `azul-medio` 5,11:1). `pnpm
  lint` 0.
- **Paso 18** (`15737d8`) — README «Editar las páginas» (Inicio entero, las
  cuatro pestañas, el resaltado, las 10 versiones, el choque; apunta al spec
  del admin §6 y no a una lane que se cierra) y «Admin» («la edición de
  Inicio»); spec del admin: `versiones_de_paginas` en la tabla de §6 y un
  párrafo de versiones, «qué cambió», SEO en el documento y choque; §11 saca
  el historial de «fuera de alcance» (autoguardado y bloqueo siguen afuera).
  Los links nuevos resuelven (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`).
- **Paso 19** (`dd55b85`) — AGENTS.md: §3 (`consultas/` con
  `historial-de-paginas`, `acciones/` con `versiones` y lo que hacen en la
  base; `admin/paginas/` con sus pestañas), §12 (la frase «qué existe» suma
  `versiones_de_paginas` y apunta al spec en vez de la lane cerrada: una
  frase fuera de los dos apartados que nombraba el SPEC, porque quedaba
  falsa) y §13 (fase B de las páginas, hecha). `pnpm lint` 0 · react-doctor
  100/100.

## Abierto

- **Para 4b y 4c** (consumen esta base tal cual): cada página suma sus
  secciones y su `seo` inicial al registro, y su `page.tsx` un
  `generateMetadata` con `metadataDeSeo(seo, OPEN_GRAPH_COMUN)`. Ojo: hoy las
  otras seis páginas heredan `og:title` y `og:description` del layout (los de
  Inicio); al darles su SEO pasan a ser los suyos, y comparar-render lo va a
  marcar en `head` como cambio buscado.
- `publicar` revalida solo la ruta de su página: la sección repetida en dos
  páginas llega con la fuente única de 4b (SPEC §12).
- Visto al pasar, sin tocar: `HeroQuienes` sigue con `scrub: true` en tres
  ScrollTriggers (AGENTS.md §8 pide 0.5 como mínimo); el split fue mecánico y
  no cambió el comportamiento a propósito.
- En desarrollo, después de `pnpm generate` hay que reiniciar el dev server:
  `datos/cliente.ts` guarda el `PrismaClient` en `globalThis` entre recargas
  (así se vio «No se pudo publicar» con `tx.versionDePagina` indefinido).
