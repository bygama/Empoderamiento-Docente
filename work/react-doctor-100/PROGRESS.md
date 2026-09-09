# PROGRESS — react-doctor-100

Primera lectura de cada sesión. Si no está acá, no pasó.

## Done

- 2026-09-08 — Shaping con el owner (cuatro secciones aprobadas). Tres relevamientos
  de lectura completa copiados a esta carpeta. Baseline JSON de react-doctor sobre `main`
  guardado (`react-doctor-baseline-main.json`: 58/100, 120 hallazgos, 43 archivos).
- 2026-09-08 — Rama `refactor/react-doctor-100` abierta desde `main` en `b8a4f93`; SPEC
  aprobado por el owner; PLAN, `feature_list.json` y DECISIONS escritos; apertura
  commiteada (`bc0e8bf`, después `1a0dabd` tras el rebase).
- 2026-09-08 — **Rebase sobre `bygama/gar`** (`112de56`) por decisión del owner (ver
  DECISIONS) y push de la rama a `origin/refactor/react-doctor-100`. Baseline re-medido
  sobre la nueva base: **57/100, 126 hallazgos, 44 archivos** (`react-doctor-baseline.json`).
  Delta: +6 netos; reglas nuevas `click-events-have-key-events`,
  `no-static-element-interactions`, `no-broken-image-source` (en `IndicePagina.tsx` y
  `TeamProfileOverlay.tsx`), 17.º gigante (`IndicePagina`), `CarpetaCaso` ahora gigante y de
  alta complejidad; `src/config/aliados.ts` ya existe (lo creó gar).
- 2026-09-08 — **Enmienda del SPEC (§0) aprobada por el owner** tras el relevamiento del
  delta (`relevamiento-delta.md`). PLAN reescrito (36 pasos), `feature_list.json` (37
  filas), DECISIONS con las rulings. Commit `983e744`.
- 2026-09-08 — **Fase 0 completa (PLAN paso 0).** `node -v` = v24.18.1. Arnés SSR
  (`ssr.mjs`) validado contra el dev server del puerto 3000: las 8 rutas idénticas a sí
  mismas en dos tomas (85161 / 42993 / 107552 / 154656 / 85025 / 23339 / 87610 / 124088
  bytes). Baselines en el scratchpad de esta sesión (ruta abajo): `baseline-ssr/` (8 rutas),
  `baseline-probes/desktop-pw/` (8 rutas × 6 fracciones a 1536×850, Playwright, más
  `<ruta>-top.png`), `baseline-probes/desktop-pw-b/` (segunda pasada),
  `baseline-probes/mobile/` (8 × 4 a 390×844 con `isMobile` + `hasTouch`; `hover: none`
  real; más capturas). Doble pasada desktop comparada con `probe-compare.mjs` (tol 0.02):
  idéntica salvo `data-caret` (parpadeo). **Rehecho más tarde por `localhost` (ver «Tried and
  failed»)**: `baseline-probes/desktop/` y `desktop-b/` (48 archivos cada uno, 8 rutas × 6
  fracciones), `baseline-probes/mobile/` (32). Doble pasada desktop: 0 diferencias con
  **`PROBE_IGNORE=data-qh-fugaz,data-caret,data-nimg,data-constelacion-svg,data-punto,data-progreso,data-row-titulo`**
  (estrella fugaz aleatoria, caret, la caja de las imágenes lazy que deriva ±4 px entre pasadas,
  y con el mouse centrado: la constelación de Investigación que sigue al cursor, el contador
  `data-progreso` y una fila del formulario de contacto en hover). Scripts: `ssr.mjs` (invocar con `MSYS_NO_PATHCONV=1` y
  `BASE=http://127.0.0.1:3000`: Git Bash convierte `/` en una ruta de Windows),
  `rd-count.mjs`, `probe-extract.mjs`, `probe-compare.mjs`, `mv-lines.mjs` (mover bloques
  respetando CRLF), `probe-scene.js` + `probe-run.sh` (Orca, ya no se usan).

## Pasos del PLAN

- **Paso 1 — exports a módulos `.ts`** (2026-09-08). Nuevos
  `investigacion/components/linterna-geometria.ts` (51 líneas),
  `que-hacemos/components/faro-geometria.ts` (33), `tiempos-faro.ts` (37), `preguntas-faro.ts`
  (47; en vez de `data.ts`, que habría pasado de 185 a 233: ver DECISIONS) y
  `quienes-somos/components/profile/acentos.ts` (36). Importadores actualizados
  (LinternaFaro, coreografia-cierre, FaroEscena, QueHacemosHeroFaro, QueHacemosHero,
  profileParts, ImmersiveProfile). Aceptación: `pnpm typecheck` → 0; `pnpm lint` → 6
  problemas, los mismos de la base (5 errores de refs en render en TorreLineas, que arregla
  el paso 5, y el warning `CENTRO` de MiradaEd): sin problemas nuevos; `RD src
  only-export-components` → 0; SSR idéntico en /investigacion, /que-hacemos,
  /quienes-somos. Commits `acb3936`, `9f6b022`, `431bf93`.
- **Paso 2 — hoists a módulo** (2026-09-08). CategoriasRail (`irAlListado`, `flechaClase`),
  FichaNovedad (`irASeccion`), LanzamientosRecientes (`hoverFine`), QueHacemosHeroFaro
  (`irALineas` con su comentario), IndicePagina (`ir`), NovedadDestacada
  (`VERDE_SOBRE_AZUL`), profileParts (`OFFSETS_MAPA`). Aceptación: typecheck → 0; lint → los
  6 de la base; `RD src prefer-module-scope-pure-function prefer-module-scope-static-value`
  → 0 y 0; SSR idéntico en las 8 rutas. Commits `1b6191a`, `ffc9ce9`, `6f261b4`, `e0897dd`,
  `f0b90ab` (uno por scope).

- **Paso 3 — keys de texto e iteraciones combinadas** (2026-09-08). FichaNovedad
  (`key={parrafo}`), OrigenEd (`PALABRAS_REMATE` + `key={w}`), ImmersiveProfile
  (`key={part}`, `passedIds` con `for…of`), profileParts (nueve keys por `m.title`, `t`,
  `p.title` y `place-period`), `generateStaticParams` en una pasada. Aceptación: typecheck →
  0; lint → los 6 de la base; `RD src no-array-index-as-key js-combine-iterations` → 0 y 0; SSR
  idéntico en /novedades/libro-socioepistemologia y /quienes-somos. Commits: los dos
  `refactor(novedades)` y `refactor(quienes-somos)` que siguen a `f0b90ab`.

- **Paso 4 — helpers de viewport y guard SSR** (2026-09-08). Nuevo `src/lib/viewport.ts`
  (`altoViewport`, `anchoDocumento`); DestacadosBiblioteca y MiradaEd los usan en sus
  closures; FichaNovedad con `typeof window === "undefined"` en el initializer. Aceptación:
  typecheck → 0; lint → los 6 de la base; `RD src no-unguarded-browser-global-in-render-or-hook-init`
  → 0; SSR idéntico en /biblioteca, /quienes-somos, /novedades/libro-socioepistemologia;
  PROBES /biblioteca /quienes-somos (Playwright 1536×850, 6 fracciones cada una) → 12
  archivos, 0 diferencias (re-verificado contra el baseline hidratado; ver «Tried and failed»). Commits `refactor(lib)` y `fix(novedades)` después de `1cf0b54`.

- **Paso 5 — reseteo de refs en render (TorreLineas)** (2026-09-08). Cinco líneas menos en el
  cuerpo del componente; `spanRefs` y `chipRefs` sembrados en el `useRef` con
  `TAMBORES.map(() => [])`, con comentario del porqué. Aceptación: typecheck → 0; **lint →
  exit 0** (queda solo el warning `CENTRO` de MiradaEd); `RD src no-ref-current-in-render`
  → 0; SSR /que-hacemos idéntico; PROBES /que-hacemos (6 fracciones) → 0 diferencias
  (re-verificado contra el baseline hidratado). Commit
  `fix(que-hacemos)` después de `7225846`.

- **Paso 6 — `useEffectEvent` en CasosInvestigacion** (2026-09-08). `onEscape` y `onPopstate`
  como Effect Events; los efectos dependen de `[activo]` y `[activo, estado]`; `cerrar` y
  `solicitarCierre` conservan su `useCallback` (otro efecto y dos props dependen de su
  identidad). Aceptación: typecheck → 0; lint → exit 0 (1 warning heredado); `RD
  src/features/investigacion prefer-use-effect-event` → 0; SSR /investigacion idéntico; PROBE
  casos-interaccion (`.next/pw/casos.js`: abrir → hash y lugar visible; siguiente → hash del
  caso 2; Escape → cerrado y hash vacío; abrir + Back → cerrado; deep link en página nueva →
  abierto) → `ok: true` antes y después del cambio. Commit `refactor(investigacion)` después de
  `ee941d3`.

- **Paso 7 — `useMouseParallax`** (2026-09-08). Nuevo `src/lib/hooks/useMouseParallax.ts` (66
  líneas; `{ x, y, ease, activo, soloHover }`, layout effect como antes); Hero y QueHacemosHero lo
  llaman con sus valores originales. Aceptación: typecheck → 0; lint → exit 0; SSR / y
  /que-hacemos idéntico; PROBE hero-mouse y qh-mouse (`.next/pw/mouse.js`) → `ok: true` con los
  mismos valores antes y después (0.8229 / 0.6471 tras el mismo recorrido de mouse); PROBES /
  /que-hacemos → 0 diferencias contra el baseline hidratado con el protocolo de mouse centrado
  (la primera comparación dio 12 falsos diffs por el mousemove sintético: ver «Tried and failed»). Commit `refactor(anim)` después de
  `c109fe2`.

- **Paso 8 — `acople-lamina.ts`** (2026-09-08). Nuevo
  `quienes-somos/components/acople-lamina.ts` (48 líneas; `acoplarLamina(root, { escala, y, fin,
  origen })`); RedEd (sin origen, como antes), MiradaEd (`origen: "50% 0%"`) y OrigenEd (0.955 /
  44 / "top 12%" / origen) lo llaman dentro de sus contextos. Aceptación: typecheck → 0; lint →
  exit 0; SSR /quienes-somos idéntico; PROBES /quienes-somos → 0 diferencias contra el baseline
  (con el mouse centrado, una card de persona queda en hover en la fracción 0.8: el baseline lo
  comparte). Commit `refactor(quienes-somos)` después de `da8bd6f`.

- **Paso 9 — TeamProfileOverlay: código muerto y foto viajera** (2026-09-08). Dos commits:
  `f0dff74` borra el camino `figura === "recorte"` (`DISOLUCION_FONDO`, `mascara`, `coverEn`, la rama
  de `medirDestino`, `crop`/`alineable`, el reencuadre y el velo del viaje) y `cutoutCrop` del
  tipo `Profile`: 598 → 528 líneas; el siguiente convierte la foto viajera en un `<div>` con
  `backgroundImage` = `currentSrc` de la card, `bg-cover bg-no-repeat`, sin `<img>` ni
  `eslint-disable`. Aceptación: typecheck → 0; lint → exit 0; `RD src no-broken-image-source` →
  0; `nextjs-no-img-element` 9 → 8; `grep cutoutCrop src` → 0; SSR /quienes-somos idéntico;
  PROBE perfil-inmersivo y perfil-shell (`.next/pw/perfil-3000.js`, referencia `perfil-3002.js`
  sobre la base) → `ok: true` con los mismos números en base y después (retrato [976,221,480,629]
  con opacidad 1, hero shell [235,165,416,520], foco en «Volver al equipo», 29 `inert` abierto y 0
  cerrado, `scrollY` restaurado exacto, foco de vuelta en la card); probe de la viajera: arranca
  sobre la card [163,126,328,410] con la URL de la card como fondo, aterriza en [1152,281,304,493]
  (la `<img>` del retrato, alineada a la derecha del mover) y se funde a 0 mientras el retrato
  sube a 1.

- **Paso 10 — split ComoTrabajamos** (2026-09-08). `home/data.ts` (60, `PASOS` + `Paso`),
  `home/components/como-trabajamos/coreografia-metodo.ts` (132, `crearMetodo(el)` → cleanup),
  `PasoMetodo.tsx` (101), `IndicadorPasos.tsx` (33); compositor 381 → 94 líneas, mismo
  `useEffect`. Aceptación: typecheck → 0; lint → exit 0; `RD src/features/home
  no-giant-component` → solo Hero; LINEAS ≤ 200 en las cinco piezas; SSR / idéntico; PROBES /
  → 0 diferencias. Commit `refactor(home)` después de `cbf8d8c`.

- **Paso 11 — split Hero** (2026-09-08). `home/components/hero/hero-cards.ts` (63),
  `coreografia-hero.ts` (96, `crearHero(scope)` → cleanup, desde el mismo layout effect),
  `entrada-hero.ts` (135, el despliegue: se separó de la coreografía para respetar el tope),
  `CampoCards.tsx` (77), `CampoCardsMobile.tsx` (44), `HeroCopy.tsx` (69); compositor 512 → 78.
  Aceptación: typecheck → 0; lint → exit 0; `RD src/features/home no-giant-component` → 0;
  LINEAS ≤ 200; SSR / idéntico; PROBES / → 0 diferencias a 1536×850 (6) y 390×844 (4).
  Commit `refactor(home)` después de `dd7bff8`.

- **Paso 12 — split QueHacemosHero** (2026-09-08). `que-hacemos/components/que-hacemos-hero/`:
  `polvo.ts` (15), `coreografia-hero-qh.ts` (29), `estrella-fugaz.ts` (33),
  `capsula-magnetismo.ts` (42, con el gate de hover adentro), `portal-viaje.ts` (178,
  `viajar` + `crearPortal`), `CieloPolvo.tsx` (51), `TitularQH.tsx` (51; pieza extra para que el
  compositor no pase de 200 con su comentario de 60 líneas), `CapsulaPortal.tsx` (81, refs por
  props); compositor 553 → 162, cinco layout effects en el mismo orden. Aceptación: typecheck →
  0; lint → exit 0; `RD src/features/que-hacemos no-giant-component` → quedan NivelesEscala,
  QueHacemosHeroFaro y TorreLineas; LINEAS ≤ 200; SSR /que-hacemos idéntico; PROBES /que-hacemos
  → 0 diferencias; PROBE qh-portal (`.next/pw/portal.js`: hover carga 0.15, hold 0.71 con
  squash, fuego y viaje a scrollY 1103, cápsula descargada) → `ok: true`. Commit
  `refactor(que-hacemos)` después de `4fa6f60`.

- **Paso 13 — split NivelesEscala** (2026-09-08). `que-hacemos/components/niveles-escala/`:
  `niveles-escena.ts` (29: POS, ALTO_SVH, LAZO y segmentos), `coreografia-niveles.ts` (170: ritmo y
  `crearNiveles(zone, stage)` → cleanup), `toggle-nivel.ts` (43; separado para respetar el tope),
  `LazoViajero.tsx` (40), `NivelCard.tsx` (66); compositor 443 → 152 con el mismo gate de
  `document.fonts.ready`. Aceptación: typecheck → 0; lint → exit 0; `RD src/features/que-hacemos
  no-giant-component` → quedan QueHacemosHeroFaro y TorreLineas; LINEAS ≤ 200; SSR /que-hacemos
  idéntico; PROBES /que-hacemos → 0 diferencias. Commit `refactor(que-hacemos)` después de
  `be621d1`.

- **Paso 14 — split IndicePagina** (2026-09-08). `src/lib/hooks/useImanIndice.ts` (183;
  `useImanIndice(secciones, activa, reduced)` → `{ items, hover, cerca, navRef, marcas, pildoras,
  esActiva, entrar, salir, tic }`, exporta `ANCHO_BASE` e `ItemIndice`),
  `components/layout/indice-pagina/BotonSubir.tsx` (24); compositor 372 → 200 (justo en el tope),
  con la visibilidad por scroll y la detección de overlays. Aceptación: typecheck → 0; lint →
  exit 0; `RD src/components no-giant-component` → 0; LINEAS ≤ 200; SSR idéntico en las 8 rutas;
  PROBES /investigacion → 0 diferencias; PROBE indice (`.next/pw/indice.js`: con el cursor en la
  tercera fila las marcas pasan de 12 a [12,29,32,17,12,12] px, la píldora 2 sube a opacidad 1 y
  se pinta navy, el click salta a «Líneas» y cambia `aria-current`) → `ok: true`. Commit
  `refactor(layout)` después de `0b25623`.

- **Paso 15 — split DestacadosBiblioteca** (2026-09-08). `ITEMS_DESTACADOS` + `ItemDestacado` en
  `biblioteca/data/materiales.ts` (234 → 243: el PLAN lo pide ahí; es un archivo de datos fuera
  del tope, ver DECISIONS), `components/destacados/coreografia-destacados.ts` (141,
  `crearDestacados({ root, row, slot, artsWrap, items, setActivo })`), `IntroDestacados.tsx` (68),
  `IndiceDestacados.tsx` (40), `ArticuloDestacado.tsx` (98, `refItem`/`refSlot`); compositor
  363 → 116. Aceptación: typecheck → 0; lint → exit 0; `RD src/features/biblioteca
  no-giant-component` → 0; LINEAS ≤ 200 en las piezas; SSR /biblioteca idéntico; PROBES
  /biblioteca → 0 diferencias. Commit `refactor(biblioteca)` después de `d950ced`.

- **Paso 16 — split RedEd** (2026-09-08). `components/red/red-datos.ts` (64: CX/CY/R,
  SPECS, PAISES, AREA_PERSONAS, curve, pct), `coreografia-red.ts` (95, `crearRed(root)` →
  cleanup), `vuelo-fotos.ts` (66, `resaltarArea(root, area)`), `GrafoRed.tsx` (130, prop
  `setArea`), `DockEspecialidad.tsx` (65, prop `area`); compositor 476 → 108, mismos dos
  efectos y deps. Aceptación: typecheck → 0; lint → exit 0 (solo el warning base de CENTRO);
  `RD src/features/quienes-somos no-giant-component` → 4 (RedEd fuera); LINEAS ≤ 200; SSR
  /quienes-somos idéntico y PROBES /quienes-somos → 0 diferencias (RedEd NO está montado
  ahí, ver DECISIONS); con la ruta temporal /probe-red en ambos servers: `PROBE red-hover`
  → `ok: true` en 3000 y 3002 con los mismos números (r 12 → 16 → 12, texto verde, 2
  avatares visibles, dock «Evaluación», reposo limpio al salir); PROBES /probe-red 4
  fracciones 3002 vs 3000 → solo `data-drift`/`data-svg-origin` con corrimientos ≤ 0.04
  px (deriva perpetua, depende del instante de muestreo; misma clase de ruido que el
  baseline). Commit `c60963f`.

- **Paso 17 — split MiradaEd** (2026-09-08). `components/mirada/constelacion-mirada.ts`
  (155: Perspectiva, PERSPECTIVAS, NODOS, LINEAS, ARCOS, RAMAS, CAMARA y los tiempos
  AIRE_TITULO/FASE_COLOR/BOUNDS; cae `CENTRO`, sin lectores), `setup-estados.ts` (176:
  `leerEscena(root)` → `Escena | null`, `prepararEstados(escena)` dueño de la posición de
  las fichas, `crearIndicador(dots)`), `timeline-fases.ts` (185, `crearTimelineFases(escena,
  zone)` → tl, con `setDot(0)` al final como antes), `MapaConstelacion.tsx` (129, fragment
  con las dos capas), `DetallePerspectiva.tsx` (80), `FichasPerspectiva.tsx` (40),
  `SintesisMirada.tsx` (45), `IndicadorFases.tsx` (19); compositor 858 → 165 con el mismo
  gate `live`, el mismo layout effect (leer → acoplar → preparar → timeline, mismo orden) y
  el mismo cleanup (`killTweensOf(dots)` + `ctx.revert()`). Los tiempos van en
  constelacion-mirada.ts y el indicador en setup-estados.ts para que timeline-fases quede
  bajo 200. Aceptación: typecheck → 0; lint → exit 0 y 0 warnings (cayó el de CENTRO); `RD
  src/features/quienes-somos no-giant-component` → 3 (MiradaEd fuera); LINEAS ≤ 200; SSR
  /quienes-somos idéntico; PROBES /quienes-somos → 0 diferencias. Commit `bf427d0`.

- **Paso 18 — split OrigenEd** (2026-09-08). `components/origen/data.ts` (58), `estilos.ts`
  (29: GRILLA, PILAR_TITULO, PILAR_CUERPO), `Pilar.tsx` (43), `PilaresOrigen.tsx` (107, los
  tres beats como fragment: sin él el compositor quedaba en ~240), `PanelFotos.tsx` (96),
  `TrayectoriaHorizontal.tsx` (75), `TrayectoriaVertical.tsx` (42), `BeatRemate.tsx` (43);
  coreografía en `coreografia-origen.ts` (118, `crearOrigen(root, zone)` → cleanup; acople,
  capas, beat 0, tilt) más `estados-origen.ts` (98, `leerPiezas`/`Piezas`, `prepararEstados`,
  `crearIndicador`), `timeline-origen.ts` (124, `crearTimelineOrigen(zone, beats, piezas,
  setDot)` → tl) y `panel-fotos.ts` (85, `prepararPanel`, `animarPanel(tl, piezas)`): los dos
  módulos del PLAN no alcanzaban el tope de 200 (la coreografía sola medía ~350). Orden de
  llamadas idéntico al original. Compositor 917 → 135; los cinco beats siguen siendo hijos
  directos de `[data-story-tilt]`. Aceptación: typecheck → 0; lint → exit 0; `RD
  src/features/quienes-somos no-giant-component` → 2 (OrigenEd fuera); LINEAS ≤ 200; SSR
  /quienes-somos idéntico; PROBES /quienes-somos → 0 diferencias. Commit `3097feb`.

- **Paso 19 — split CarpetaCaso** (2026-09-08). `casos/carpeta/anatomia.ts` (53: PAPELES,
  PESO_TAPA, tipos `Tinte`/`Peso`), `LomoCarpeta.tsx` (52: tinte, esUltima, baseRedondeada),
  `DocumentosCarpeta.tsx` (81: caso, tinte, indice; slivers + papeles + hoja emergente),
  `TapaCarpeta.tsx` (190: caso, tinte, peso, esUltima, interactiva, desplegada, onToggle,
  idPanel, baseRedondeada); compositor 436 → 160 con `desplegada`/`idPanel` y el botón de
  abrir (con la pestaña) donde estaban. `baseRedondeada` viaja como prop (una sola fuente,
  no estaba en la lista del PLAN); lomo y documentos salieron además de la tapa porque solo
  con TapaCarpeta el compositor quedaba en ~300. Aceptación: typecheck → 0; lint → exit 0;
  `RD src/features/investigacion no-giant-component no-high-complexity-react-function` →
  2 + 0 (CarpetaCaso fuera de las dos); LINEAS ≤ 200; SSR /investigacion idéntico; PROBES
  /investigacion → 0 diferencias. Commit `72e45e9`.

- **Paso 20 — split ExpedienteCaso** (2026-09-08). `casos/expediente/RotuloExpediente.tsx`
  (32), `coreografia-expediente.ts` (108: `crearReveals(cuerpo, lugar)` → revert,
  `crearParallax(cuerpo)` → cleanup | undefined), `CabeceraExpediente.tsx` (71, con
  `useCopiar`; props caso, refTitulo), `PestanasLaterales.tsx` (77, fragment con
  `data-exp-pestana` + nav de otros casos), `HojaInforme.tsx` (84, `[data-exp-hoja]` en su
  lugar), `CartonExpediente.tsx` (160, colores del cartón desde `oscuro`),
  `BandaSiguiente.tsx` (82); compositor 635 → 157 con el indicio de scroll y los dos layout
  effects en su orden. Aceptación: typecheck → 0; lint → exit 0; `RD src/features/investigacion
  no-giant-component` → 1 (solo CasosInvestigacion); LINEAS ≤ 200; SSR /investigacion
  idéntico; `PROBE caso-abierto` (`.next/pw/exp.js`, 3000 vs 3002): firma estructural del
  expediente abierto idéntica (hash 2944313356, 23252 chars), reveals 2/8 → 4/8 → 8/8 bloques,
  asentado −2.6° → 0, sello 0 → 0.75, indicio 1 → 0, parallax con los mismos corrimientos
  (4.6/13.12, 3.28/9.37, 1.97/5.62) y Escape cierra: JSON idéntico en ambos servers. Commit
  `87b1bfe`.

- **Paso 21 — split TeamProfileOverlay** (2026-09-08). `components/overlay/usePortalModal.ts`
  (88: `usePortalModal({ container, rootRef, backRef, originEl, reduced, immersive, entrar })`,
  `useLockScroll` adentro y un solo layout effect; `entrar(root)` devuelve la limpieza que corre
  primera: revert → pares → inert → container → foco → scroll, como antes),
  `apertura-overlay.ts` (150, `abrirOverlay({ root, originEl, reduced, immersive, fotoViaja,
  refs })` → cleanup), `coreografia-overlay.ts` (108: tiempos, `clipDe`, `paresDe`,
  `RefsOverlay`, `cerrarOverlay(...)`), `viaje-foto.ts` (56: `medirDestino`, `apoyarViajera`,
  `viajarFoto`), `PerfilShell.tsx` (68, refs `refHero`/`refContenido`), `useTecladoOverlay.ts`
  (37); compositor 528 → 189 con `refs` en un `useMemo` estable. Dos desvíos del PLAN por el
  tope de 200 (ver DECISIONS): la apertura va en su propio módulo y el teclado en un hook.
  Aceptación: typecheck → 0; lint → exit 0; `RD src/features/quienes-somos no-giant-component`
  → 1 (solo ImmersiveProfile); LINEAS ≤ 200; SSR /quienes-somos idéntico; `PROBE
  perfil-inmersivo` + `perfil-shell` (`.next/pw/perfil-3000.js` vs `perfil-3002.js`): JSON
  idéntico (foco en «Volver al equipo», 29 inert, retrato 976/221/480/629 y 235/165/416/520,
  scroll restaurado al píxel, foco de vuelta en la card). Commit `fd86a1e`.

- **Paso 22 — split ContactoExperiencia** (2026-09-08). `components/experiencia/data.ts` (63),
  `estilos.ts` (27: DOTS_NAVY, `TITULO_TIPO` en dos mitades para que el class del h2 quede
  byte-idéntico, INPUT_BASE, LABEL_BASE), `contexto.ts` (39: `Estado` mutable en un solo
  useRef, `Contexto`, `panelDe`), `coreografia-intro.ts` (173: limpiarGhosts, finIntro,
  desarmar, saltarIntro, montarIntro), `ghost-titulo.ts` (31), `useSaltoIntro.ts` (55),
  `coreografia-paneles.ts` (169: elegirTema, cambiarTema), `coreografia-envio.ts` (82:
  enviar, otraConsulta), `PanelHero.tsx` (35), `ColumnaIdentidad.tsx` (123), `IndiceTemas.tsx`
  (73, `onElegir(key, cardEl)`), `PanelFormulario.tsx` (84), `RailTema.tsx` (76),
  `CamposContacto.tsx` (71), `PanelCierre.tsx` (58); compositor 1125 → 193 con el efecto de
  `?tema=` en su lugar. Primer intento con fábricas (`crearIntro({ rootRef, … })`) cayó por
  lint: «Cannot access refs during render» (el compilador prohíbe pasar refs a funciones
  llamadas en render) → coreografías puras sobre un `Contexto` armado dentro de handlers y
  efectos (ver DECISIONS). `useRef(estadoInicial())` disparaba `rerender-lazy-ref-init` →
  literal. Aceptación: typecheck → 0; lint → exit 0; `RD src/features/contacto` sin
  no-giant-component y sin hallazgos nuevos; LINEAS ≤ 200; SSR /contacto idéntico; `PROBE
  contacto-intro` + `contacto-tema` (`.next/pw/contacto.js`, 3000 vs 3002): intro armada y
  desarmada sola, tema → formulario con foco en #ct-nombre y rail «Investigación», vuelta,
  `?tema=alianzas` aterriza en el formulario, rueda saltea: idéntico salvo las opacidades a
  mitad de animación (ruido de muestreo). Commit `2e5513e`.

- **Paso 23 — split CasosInvestigacion** (2026-09-08). `casos/maquina/useLugarExpediente.ts`
  (152: estado, refs, `registrar`, `alinearConSeccion`, scroll-lock, limpieza global y
  overflow del html; exporta `Maquina`), `useAccionesLugar.ts` (122: abrir, cerrar,
  solicitarCierre, irA), `useHistorialLugar.ts` (68: abrirRef + hash, Escape, popstate),
  `useEntradaIndice.ts` (47), `useTransicionesExpediente.ts` (138: opening/switching, closing,
  foco al volver); compositor 555 → 138. Orden de hooks = orden original de efectos por fase
  (pasivos: limpieza, overflow, abrirRef, hash, Escape, popstate; layout: entrada índice,
  entrada expediente, cierre, foco). `cerrar`/`solicitarCierre` dejan el `useCallback`
  (funciones planas, nadie usa su identidad; evita disables de exhaustive-deps). Lint del
  compilador («This value cannot be modified» / «Cannot access refs during render» sobre
  `m.x()` y `m.xRef`) → cada hook y el compositor desestructuran la máquina al inicio.
  Aceptación: typecheck → 0; lint → exit 0; `RD src/features/investigacion` sin
  no-giant-component (quedan will-change y transition-all para la fase 2); LINEAS ≤ 200; SSR
  /investigacion idéntico; `PROBE casos-interaccion` (`.next/pw/casos.js` vs `casos-3002.js`):
  abrir, siguiente, Escape, abrir + atrás y deep link → JSON idéntico (scrollY 18890 / 18954 /
  18883). Commit `6a24ff0`.

- **Paso 24 — split QueHacemosHeroFaro** (2026-09-08). `components/hero-faro/camara-faro.ts`
  (73: P, MEZCLA_PARALAJE, NEAR_Y, `crearCamara(root)` → `{ cam, entrada, capas, aplicar }`),
  `haz-faro.ts` (155: `GIRO` exportado, ENCENDIDO/REPOSO_S1/CIERRE, easings, `crearHaces(root)` →
  `{ girar, setTimeline }`; los comentarios «UN SOLO DUEÑO», «va creado ANTES de la línea» y el
  del apuntado medido viajan con él), `escenas-faro.ts` (172: `armarEscenas(tl, camara)` S0–S5 +
  `tl.set({}, {}, DURACION_RECORRIDO)`; agregado al PLAN por el tope de 200), `coreografia-faro.ts`
  (158: `crearCoreografiaFaro(root, alto)` → `mm.revert`; pivotes de la luz, timeline con
  onRefresh, llegada `[data-faro-shift]`, hook `#qa=`), `PreguntasFaro.tsx` (47), `CierreFaro.tsx`
  (60, con `irALineas`); compositor 757 → 165. Orden de armado idéntico al original.
  Aceptación: typecheck → 0; lint → exit 0; `RD src/features/que-hacemos no-giant-component` →
  1 (TorreLineas; QueHacemosHeroFaro fuera); LINEAS ≤ 200; SSR /que-hacemos idéntico; PROBES
  /que-hacemos → 0 diferencias (6 fracciones estables). Commit `feda538`. Pendiente visto acá:
  `rerender-lazy-ref-init` ×2 en que-hacemos (los `useRef(TAMBORES.map(...))` del paso 5): se
  resuelven en el paso 26.

- **Paso 25 — split ImmersiveProfile** (2026-09-08). `profile/inmersivo/refs-perfil.ts` (37:
  `useRefsPerfil()` → los 19 refs + tipo `St`), `estilos.ts` (23: cx, CONTENT_W, ID_FINAL),
  `camino.ts` (59: smoothPath, `construirCamino(track, svg, path)`), `viaje-nombre.ts` (131:
  `medirNombre(r, scroller)` y `crearTransformacionHero(r, st, medidas)`), `camino-maestro.ts`
  (64: `crearCaminoMaestro` → `{ setupPath }`, `programarRecalculos(self, setupPath, img)` →
  cleanup), `etapas.ts` (66: crearEtapas, crearCierre), `apertura-perfil.ts` (85, con la rama
  `figuraDesdeCard`), `PerfilLineal.tsx` (77, marcada con `data-perfil-lineal`),
  `IdentidadFija.tsx` (44), `IndiceVivo.tsx` (44), `FiguraPerfil.tsx` (135, modo
  fija/cierre/lineal), `HeroPerfil.tsx` (104, con el clon y sus clamp), `RecorridoEtapas.tsx`
  (81), `CierrePerfil.tsx` (73); compositor 871 → 179. Aceptación: typecheck → 0; lint →
  exit 0; `RD src/features/quienes-somos` → sin no-giant-component ni
  no-high-complexity-react-function (quedan will-change ×9, img ×6 y dialog ×1 para la fase
  2); LINEAS ≤ 200; SSR /quienes-somos idéntico; `PROBE perfil-inmersivo`/`perfil-shell` →
  JSON idéntico al de la base (retrato 976/221/480/629, foco, inert 29, scroll restaurado);
  `PROBE perfil-lineal` nuevo (`.next/pw/perfil-reduced.js`, contexto `reducedMotion: reduce`)
  → `ok: true`: rama lineal presente con 5 etapas, sin `[data-identity]`, Escape cierra.
  Commit `31509f6`.

- **Paso 26 — split TorreLineas** (2026-09-08). `components/torre/geometria-torre.ts` (118:
  constantes del recorrido, `medirChar` + cache + `limpiarCacheAnchos`, `calcularGeo`, tipos),
  `refs-torre.ts` (40), `enrollado-torre.ts` (83: ESCALA_LINEA, DEG, wrap180, `pintarLetras` →
  copiaFade), `pintar-torre.ts` (186: `crearPintor(refs, geo)` → `{ pintar, estado, resetBuild }`,
  dueño de ocultos/activo/fijado), `capas-torre.ts` (63: `pintarCapas`, `cruzarApoyo`),
  `armado-torre.ts` (167: `crearArmado(zone, estado, pintar, resetBuild)` → armar/rebobinar/
  completar/matar, con el bloqueo de scroll en captura), `useTorreViva.ts` (164: gate por
  viewport, geometría medida con fonts.ready, los dos ScrollTriggers y `saltarA`);
  markup en `CapasEscenario.tsx` (60), `EscenarioTorre.tsx` (48), `EscenaTorre.tsx` (69),
  `TamborTorre.tsx` (90), `FotoTambor.tsx` (51), `RielEstaciones.tsx` (49), `RielProgreso.tsx`
  (35), `ApoyoTorre.tsx` (62), `FallbackTorre.tsx` (32); compositor 1110 → 129. Tres módulos
  fuera de la lista del PLAN por el tope de 200 (`capas-torre`, `useTorreViva`,
  `EscenarioTorre`; ver DECISIONS). Además caen los 2 `rerender-lazy-ref-init` que el paso 5
  había introducido: las matrices de refs por tambor se crean en el callback-ref
  (`(spans.current[i] ??= [])[j] = el`) en vez de sembrarse con `useRef(TAMBORES.map(...))`.
  Aceptación: typecheck → 0; lint → exit 0; `RD src` → no-giant-component 0,
  no-high-complexity-react-function 0, rerender-lazy-ref-init 0; LINEAS ≤ 200; SSR
  /que-hacemos idéntico; PROBES /que-hacemos 1536×850 (6 fracciones) y 390×844 (4 fracciones,
  fallback plano) → 0 diferencias. Commit `b520867`.

## Fase 1 cerrada

Los 17 splits del PLAN (pasos 10-26) están hechos y verificados. `RD src` no reporta
ningún `no-giant-component` ni `no-high-complexity-react-function`, y todos los archivos
creados quedan bajo 200 líneas. Quedan 59 hallazgos, todos de la fase 2.

- **Paso 27 — transition-all y scale-x** (2026-09-08, `[batch]`). 21 sitios (los 11 que
  reporta react-doctor + 10 que solo aparecen por grep: Footer, MobileNav, ButtonSecondary,
  TapaCarpeta ×2, NavegacionCasos wrapper, ConstelacionInvestigacion, RecorridoEtapas,
  profileParts, y `scale-x-0` de CtaButton) pasan a listas explícitas según la tabla de
  `relevamiento-performance.md` §2, y `scale-x-0` → `scale-x-[0.01]`. Siete commits por
  scope: ui `35c0a0f`, layout `affe3ed`, contacto `821b8c7`, home `d1ea0ee`, investigacion
  `22513b6`, que-hacemos `fdec539`, quienes-somos `1f007bc`. Aceptación: typecheck → 0; lint
  → exit 0; `RD src no-transition-all no-scale-from-zero` → 0 y 0; `grep -rn "transition-all"
  src` → 0 (DoD §6.14); SSR de las 8 rutas idéntico salvo los tokens `transition-*` /
  `scale-x-*` (`ssr-tokens.mjs` del scratchpad, exit 0).

- **Paso 28 — will-change** (2026-09-08, `[batch]`). 46 tokens fuera del markup (los 33 que
  reporta react-doctor + los prefijados y repetidos que solo ve el grep) y 25 dueños nuevos en
  la coreografía. Se BORRAN sin reemplazo los de animación única o ya compuesta: RevealImage,
  las letras del hero de contacto, la card mobile del home, el reveal de la destacada, el
  split-flap, `[data-story-tilt]` (preserve-3d ya promueve), la foto viajera del overlay
  (anima left/top/width/height, que no se compositan), el hero de QueHacemosHero (translate3d
  ya crea la capa) y el hint en hover de PersonCard (ver DECISIONS). Los demás pasan a
  `gsap.set(..., { willChange })` dentro de la coreografía —contexto o matchMedia lo
  revierten— o a un `style.willChange` con su limpieza: `useMouseParallax` gana la opción
  `promover`, y MagneticButton, coreografia-destacados, PuenteInvestigacion, coreografia-metodo,
  HeroQuienes, coreografia-expediente (`crearParallax`), useTransicionesExpediente,
  coreografia-carta, LineasInvestigacion, EdEnMovimiento, RotadorPalabras, TransicionFaro,
  CaminoDeTrabajo, EnfoqueTransformacion, coreografia-faro (`[data-faro-shift]` al set que ya
  existía), useTorreViva, mirada/setup-estados, origen/estados-origen, origen/panel-fotos,
  overlay/apertura-overlay y red/vuelo-fotos son dueños de su hint. Ocho commits por scope:
  ui `cab1ce9`, biblioteca `68e1fa2`, contacto `a16cc47`, home `a84f300`, investigacion
  `4e1537c`, novedades `bc0ee1d`, que-hacemos `4c43a7b`, quienes-somos `a52fce8`.
  Aceptación: typecheck → 0; lint → exit 0; `RD src no-permanent-will-change` → 0; `grep -rnE
  "will-change-|willChange" src` → solo módulos de coreografía y hooks (ninguno en un
  className ni en un style de JSX); SSR de las 8 rutas contra el paso 27 idéntico salvo los
  tokens de will-change (`ssr-tokens.mjs`, exit 0); PROBES de las 8 rutas a 1536×850 (48
  archivos) y 390×844 (32) → 0 diferencias, con los cambios de will-change listados aparte;
  `PROBE will-change-apagado` (`.next/pw/wc-reduced.js`, 390×844 + reduced-motion) → `ok:
  true`: `[data-faro-shift]`, `[data-capa]`, `[data-card-mouse]` y `[data-paso]` en `auto`, y
  CERO elementos promovidos en /que-hacemos y en la home.

- **Paso 29 — aliados a next/image** (2026-09-08). `config/aliados.ts` gana `w`/`h` reales
  (unesco 1250×265, techint 147×195 del viewBox, bloom 896×264, ucsh 923×400, science-up
  1668×428) y `vectorial: true` en el SVG; Footer y DatosDuros pasan a `<Image>` con
  `unoptimized` en el vectorial. Sin `style={{ height: "auto" }}`: la clase ya trae `w-auto`
  junto al alto, que es lo que Next pide para no romper la proporción (el inline habría
  pisado el `h-7`/`h-12`). Caen los dos `eslint-disable`. Aceptación: typecheck → 0; lint →
  exit 0; `RD src nextjs-no-img-element` → 6 (solo los del perfil, paso 30);
  `/_next/image?url=%2Faliados%2Funesco.png&w=1920&q=75` → 200 y `science-up&w=640` → 200;
  `/aliados/techint.svg` → 200; SSR de las 8 rutas contra el paso 28 idéntico fuera de los
  `<li>` de las tiras; `PROBE aliados` (`.next/pw/aliados.js`, 3000 vs 3002) → `ok: true`:
  los 10 logos con la misma caja, x, opacidad y filtro, y todos cargados. Commit `4857346`.

- **Paso 30 — perfil a next/image** (2026-09-08). `Profile` gana `cutoutSize` y los 11 perfiles
  con foto sus medidas reales (medidas del archivo: karla 581×1032, daniela 1200×1600, pedro
  2395×3600, …). `FiguraPerfil`: `marco` ×3 con `fill` + `sizes` (20rem lineal, 256px cierre,
  19rem fija), `recorte` ×3 con `width`/`height` y su `style`; caen los seis `eslint-disable`.
  El listener de `load` sobre la `<img>` pasa al `onLoad` del componente:
  `programarRecalculos(self, setupPath)` devuelve `{ recalcular, limpiar }` y el compositor
  guarda `recalcular` en un ref que la figura llama; se va `portraitImg` del bundle.
  `medirDestino` del overlay sigue midiendo la `<img>` interna (next/image renderiza un
  `<img>`). Aceptación: typecheck → 0; lint → exit 0; `RD src nextjs-no-img-element` → 0 (RD
  total: 6, todos de los pasos 31-35); `/_next/image?url=%2Fequipo%2Fkarla-gomez.jpg&w=640` →
  200; SSR /quienes-somos sin cambios; `PROBE perfil-inmersivo` + `perfil-shell` → `ok: true`
  con los mismos números; `PROBE flip-figura` (`.next/pw/flip-figura.js`, 3000 vs 3002) →
  `ok: true`: mover en transform `none`, imagen cargada, y caja del mover, del outer y de la
  `<img>` idénticas a la base (976/221/480/629 y 1152/281/304/493), con el mismo
  `object-fit: cover` y `object-position: 50% 16%`. Commit `9536144`.

- **Paso 31 — PaisDropdown** (2026-09-08). El `<button>` interno de cada `<li role="option">`
  se va; el clic y el hover pasan al `<li>`, que ya tenía ref, rol y `aria-selected`.
  Aceptación: typecheck → 0; lint → exit 0; `RD src/features/contacto` → 100/100 y 0
  hallazgos; SSR /contacto sin cambios (el desplegable cerrado no aparece); `PROBE
  pais-dropdown` (`.next/pw/pais.js`, 3000 vs 3002) → `ok: true`: mismas 6 opciones y mismos
  textos, 0 interactivos anidados (la base tenía 6), Enter + ArrowDown ×2 elige «Argentina» en
  los dos, y el clic sobre la cuarta opción elige «Colombia» en los dos (en la base se toca su
  `<button>` interno, en la lane el `<li>`). Commit `d31105d`.

- **Paso 32 — píldoras del índice como botón** (2026-09-08). El `<span onClick>` pasa a
  `<button type="button" tabIndex={-1}>` con `appearance-none border-0 bg-transparent
  text-left` para neutralizar el estilo del agente; `pildoras` en `useImanIndice` pasa a
  `HTMLButtonElement`. El compositor quedaba en 210 líneas: los rótulos salen a
  `indice-pagina/RotulosIndice.tsx` (72) y el compositor vuelve a 183. Aceptación: typecheck
  → 0; lint → exit 0; `RD src/components` → solo `prefer-html-dialog` (paso 33); LINEAS ≤
  200; SSR de las 8 rutas contra el paso 29 idéntico fuera de ese elemento; `PROBE
  indice-pildora` (`.next/pw/indice-pildora.js`, 3000 vs 3002) → `ok: true`: mismas cuatro
  filas en la misma posición, el imán las acerca los mismos píxeles (1330→1322, 1393→1391,
  1370→1368), el clic navega, y `[aria-hidden] button[tabindex="-1"]` pasa de 0 a 4 = una por
  sección. Commit `328c8a6`.

- **Paso 33 — MobileNav a `<dialog>`** (2026-09-08). `showModal()` al abrir; `onCancel` con
  `preventDefault` que reproduce la timeline en reversa; `close()` en `onReverseComplete`;
  fuera el `aria-modal`, el `aria-hidden` y el listener de Escape; `useLockScroll` se
  conserva. Dos cosas que obliga el elemento nativo: `open:flex` en vez de `flex` (un
  `display` fijo le gana a la regla del agente que esconde el dialog cerrado y el panel
  quedaba siempre a la vista) y el foco a la X DIFERIDO dos frames (el panel arranca en
  `autoAlpha: 0` = visibility hidden, y un elemento invisible no recibe foco — el mismo
  detalle que ya documentaba el overlay del equipo; antes de este paso el foco al abrir
  nunca llegaba a la X). El compositor pasaba de 341 a 355 líneas: se parte en
  `mobile-nav/NavegacionMenu.tsx` (82), `PieMenu.tsx` (70) y `useMenuAnimado.ts` (104), y
  queda en 154. Aceptación: typecheck → 0; lint → exit 0; `RD src/components` → 100/100 y 0
  hallazgos; LINEAS ≤ 200; SSR de las 8 rutas byte a byte idéntico (el panel se portalea y
  solo existe en cliente); `PROBE menu-mobile` (`.next/pw/menu-mobile.js`, 390×844) → `ok:
  true`: cerrado `display: none`, abierto `display: flex` con opacidad 1 y foco en «Cerrar
  menú», 12 enfocables con el Tab siempre dentro del diálogo, Tab desde el último vuelve al
  primero, Escape deja el panel abierto durante la reversa y cerrado al final, y el foco
  vuelve a «Abrir menú». Commit `108652c`.

- **Paso 34 — TeamProfileOverlay a `<dialog>`** (2026-09-08). El root del overlay pasa de
  `<div role="dialog">` a `<dialog>` abierto con `showModal()` en `usePortalModal`: el
  navegador aporta top layer, inerte sobre el resto de la página y trampa de Tab, así que se
  borra `useTecladoOverlay.ts` (37 líneas: el loop de `inert` sobre los hijos de `<body>` ya
  no estaba, y el listener de Escape lo reemplaza `onCancel` + `preventDefault`). El
  `close()` va al final de la salida animada (`onComplete` de `cerrarOverlay`): un dialog
  cerrado no se pinta y cerrarlo antes cortaba la animación en el primer frame. Dos cosas que
  obliga el elemento nativo: (a) guard `if (!root.open) root.showModal()` más
  `rootRef.current?.close()` en la limpieza del portal — `open` sobrevive a que el elemento
  salga del DOM y el doble montaje del modo estricto en dev entraba a la segunda pasada con
  el diálogo abierto (`InvalidStateError` y la escena entera caída); (b) `h-full w-full`
  además de `inset-0`, porque el agente le da al dialog `width: fit-content`, que le gana al
  ancho implícito del inset y dejaba el retrato del shell en 254px en vez de 416 (detectado
  por el probe, no a ojo). El compositor quedó en 199 líneas (los dos comentarios sobre el
  `className` se funden en uno para no pasar el tope). Aceptación: typecheck → 0; lint → exit
  0; `RD src` → 86/100 y un solo hallazgo, el `no-prevent-default` del paso 35; LINEAS ≤ 200
  (199 / 152 / 114 / 97); SSR `/quienes-somos` byte a byte idéntico contra el paso 33 (el
  overlay solo existe en cliente); `PROBE perfil-inmersivo` y `PROBE perfil-shell`
  (`.next/pw/perfil-dialog.js`, SPEC §6.9b) → `ok: true` en las dos variantes: tag `DIALOG`
  con `open`, `transform`/`filter` `none` y `will-change: auto` (no crea bloque contenedor
  para los `fixed` de adentro), foco en «Volver al equipo», `[inert]` = 0 mientras está
  abierto y `body.overflow: hidden`, mover 480px (inmersivo, con `data-profile-scroller`) /
  hero 416px (shell), ocho Tab seguidos sin salir del diálogo, el dialog SIGUE abierto 250ms
  después de Escape (la salida se anima) y cerrado al final, scroll restaurado exacto
  (13515 y 14017) y foco de vuelta en la card. Commit `87a46fa`.

- **Paso 35 — el buscador del hero de biblioteca sin `<form>`** (2026-09-08). El
  `<form onSubmit={preventDefault}>` que solo bajaba a `#materiales` pasa a `<search>` y el
  botón a `type="button"`; Enter en el campo (`onKeyDown`) y clic en la lupa llaman a la
  misma `irAMateriales`. Dos correcciones sobre lo que pedía el PLAN, las dos por hallazgos
  nuevos que abrió el propio cambio (DECISIONS): el envoltorio es `<search>` y no
  `<div role="search">` (`prefer-tag-over-role`), e `irAMateriales` vive en el módulo y no en
  el cuerpo del componente (`prefer-module-scope-pure-function`). Aceptación: typecheck → 0;
  lint → exit 0; **`RD src` → 100 / 100, «No issues found!», `skippedChecks: []`,
  `complete: true`, 278 archivos**; LINEAS: BibliotecaHero 169; SSR `/biblioteca` contra el
  paso 33 idéntico salvo los dos tokens del paso (`<form … role="search">` → `<search>` y
  `type="submit"` → `type="button"`) y texto visible idéntico; `PROBE buscador`
  (`.next/pw/buscador.js`, 3000 vs 3002) → `ok: true`: envoltorio `SEARCH` + botón `button`
  en la lane contra `FORM` + `submit` en la base, y las dos vías (Enter y clic) dejan
  `scrollY` en 3502 con `#materiales` a 96px del viewport en LOS DOS servidores, sin
  navegar (`location.search` vacío). Commit `935efe1`.

- **Paso 36 — documentación viva** (2026-09-08). `docs/AI_GUIDELINES.md` §11 suma la regla
  que sostuvo los pasos 27-28: el `will-change` lo pone y lo saca la coreografía (dentro del
  `gsap.context()`/`matchMedia`, que lo limpia en el revert; o `style.willChange` con su
  limpieza explícita), nunca un `className` ni un `style` de JSX, porque ahí queda para
  siempre y el navegador sostiene una capa por elemento. §2 suma la receta de los 17 splits:
  tres o más piezas van a una subcarpeta en kebab-case con el compositor quieto en su ruta
  (nadie actualiza imports), datos a `data.ts`, coreografía a `coreografia-<nombre>.ts`
  llamada por el MISMO efecto y en la misma posición, y cada pedazo de markup a su archivo;
  con dos piezas no se abre carpeta. El cheat sheet §18 suma la línea del `will-change`.
  Aceptación: `grep -c "will-change" docs/AI_GUIDELINES.md` → 2 (≥ 1) y `grep -c
  "subcarpeta" docs/AI_GUIDELINES.md` → 1 (≥ 1). Commit `255c4f5`.

## In progress

- Nada. La lane cerró el 2026-09-09: PR #91 mergeado el 2026-09-08 en `eb65729`, rama remota
  `refactor/react-doctor-100` borrada, y el bloque PASS del cierre verificado sobre el `main`
  de hoy (`99a78d8`).

## Dónde corre

- Checkout principal `C:/Briar/repos/work/Empoderamiento-Docente`, rama
  `refactor/react-doctor-100` sobre `bygama/gar` (decisión del owner: lo hace el agente
  acá, de a poco, reviewers al final). Orden de merge: gar primero, esta lane después.
- Dev server: terminal de Orca `next-server (v16.2.6)` de este checkout
  (`term_77e017a6-…`), puerto **3000**. El 3001 es el del worktree `gar`.
- Probes de escena e interacción: Playwright (MCP del plugin), contexto nuevo por pasada,
  1536×850 desktop y 390×844 con `isMobile` + `hasTouch`. **Siempre `http://localhost:<puerto>`,
  nunca `127.0.0.1`** (no hidrata), y esperar la hidratación antes de medir (`pw-gen.mjs` ya lo
  hace). Los archivos de run van en `.next/pw/` (ignorado por git y por ESLint; la raíz permitida
  del MCP es el repo). Sin acceso a archivos desde el
  sandbox: los probes se guardan en `localStorage` y se vuelcan con `storageState`
  (`probe-extract.mjs` los saca). Cada llamada tiene que durar menos de 120 s (después pasa
  a segundo plano y el contexto se cierra): cuatro páginas por llamada.
- Navegador embebido de Orca (pestaña `browserPageId 16c8d898-…`, panel 1372×921, `hover`
  y `pointer: fine` verdaderos): capturas e interacciones cuando convenga.
- Baseline de comportamiento: worktree `rd-baseline` en `112de56` con dev server en el 3002
  (terminal de Orca `next-server 3002 (rd-baseline)`); si el scratchpad se pierde, `pw-gen.mjs`
  con `BASE=http://localhost:3002` lo regenera. Al cerrar la lane: `git worktree remove`.
- Scratchpad de la sesión que abrió la lane (baselines, scripts, relevamientos originales):
  `C:/Users/mateo/AppData/Local/Temp/claude/C--Briar-repos-work-Empoderamiento-Docente/b836654c-ba8b-431d-b151-94bc594e8072/scratchpad`.
- Lint: la base trae 5 errores (`react-hooks/refs` en TorreLineas 693-697) y 1 warning
  (`CENTRO` sin usar en MiradaEd). Hasta el paso 5, «lint pasa» significa «sin problemas
  nuevos respecto de esos 6»; desde el paso 5, exit 0 salvo el warning de MiradaEd, que cae
  con el split del paso 17.

## Tried and failed

- 2026-09-08 — Barrido de probes de escena con `orca eval` (`probe-run.sh`): 7 minutos para
  4 páginas × 6 estados y viewport post-hidratación. Reemplazado por Playwright (DECISIONS).
- 2026-09-08 — Una sola llamada de Playwright con 8 páginas × 6 fracciones × 2 pasadas:
  superó los 120 s, pasó a segundo plano y el contexto se cerró («Target page, context or
  browser has been closed»). Partido en llamadas de 3-4 páginas.
- 2026-09-08 — Los probes de escena se contaminan con **mousemove sintéticos**: Chrome dispara
  `mousemove` al scrollear con el cursor dentro del viewport y los parallax de mouse (y el imán
  de la cápsula) reaccionan; entre dos pasadas idénticas una tenía el cursor «en (0,0)» y la otra
  no. Falso rojo en el paso 7 (`/que-hacemos`, palabras del hero corridas 5 px). Protocolo desde
  entonces: `page.mouse.move(vw/2, vh/2)` después de hidratar (en el centro exacto los parallax
  valen 0) y baseline regenerado con ese mismo protocolo. Falta por resolver que el cursor
  centrado pueda quedar sobre una carta con hover (home, fracción 0.8): es determinista y el
  baseline lo comparte.
- 2026-09-08 — **Todos los probes de Playwright contra `http://127.0.0.1:3000` midieron páginas
  sin hidratar** (Next 16 dev bloquea orígenes que no sean `localhost`; sin errores de consola,
  sin fibers de React, sin GSAP ni Lenis): el baseline de la fase 0 y las «0 diferencias» de los
  pasos 4 y 5 no eran evidencia de comportamiento. Descubierto al fallar el probe de interacción
  de los casos (el click no abría nada). Baseline **regenerado** desde un worktree temporal en la
  base (`112de56`, `C:/Users/mateo/orca/workspaces/Empoderamiento-Docente/rd-baseline`, dev
  server en el puerto 3002 en una terminal de Orca) por `http://localhost:3002`, con espera de
  hidratación y doble salto de scroll (Lenis clampea el primero). Pasos 4 y 5 re-verificados
  contra ese baseline: 0 diferencias. Memoria: `next-dev-127-no-hidrata`.

- 2026-09-08 — **`react-doctor` enumera por el índice de git, no por el disco**: con
  `useTecladoOverlay.ts` borrado del worktree pero todavía en el índice (paso 34 sin
  commitear), el chequeo de mantenibilidad murió con `ENOENT` al leerlo, y con él se fue el
  SCORE: «Score not shown because lint or maintainability analysis could not complete» +
  «Results are incomplete». Se ve en `--json` → `projects[0].skippedChecks: ["dead-code"]` y
  `skippedCheckReasons` (el texto del error), campos que la salida de consola no muestra. El
  mismo commit lo arregló: 279 archivos analizados → 278, score de vuelta (86/100). Protocolo
  desde acá: **cualquier borrado se commitea ANTES de medir con RD**, y un `RD` sin línea
  `Score:` se investiga con `--json`, nunca se lee como «0 hallazgos».

## Next

- Nada pendiente de esta lane. Lo que dejó anotado como deuda ajena —los 5 `eslint-disable` de
  `react-hooks/exhaustive-deps` que sobreviven en `src/` y los 22 archivos de más de 200 líneas
  preexistentes— es material para una lane nueva, no para esta.

## Verification

<!-- Solo evidencia PASS, la escribe work-verify (lo más nuevo arriba). El cierre no
     cierra la lane sin un bloque PASS vigente acá. -->

### 2026-09-09 — Cierre: el 100/100 sigue en pie sobre el `main` mergeado

PR #91 mergeado el 2026-09-08 en `eb65729`, **aplastado en un solo commit** (un solo padre),
no rebasado. Por eso `git branch --merged` y `git log --cherry-pick` daban los 82 commits
como no mergeados: el patch-id no coincide con nada. La prueba que sí sirve es el árbol —
`git diff origin/refactor/react-doctor-100 eb65729` vacío, o sea que el squash capturó el
árbol entero de la lane— más `git merge-base --is-ancestor eb65729 origin/main` verdadero y
cero commits en la rama posteriores al merge. Con eso la rama remota se borró el 2026-09-09.

`main` avanzó **13 commits** desde el merge (biblioteca, equipo y `99a78d8`, que actualizó
dependencias: Next 16.2.6 → 16.3.4, React 19.2.4 → 19.2.8, @types/node ^20 → ^26). El gate se
volvió a correr sobre ese estado final, no sobre el que dejó la lane:

| Comando | Resultado |
|---|---|
| `pnpm typecheck` | limpio |
| `node scripts/verificar-react-doctor.mjs` | **100/100, sin diagnósticos** (289 archivos) |
| `pnpm lint` | exit 0 |
| `pnpm build` | compila, 12 páginas prerenderizadas |
| `pnpm dev` + las 7 rutas | todas 200 |

El `pre-push` de `.githooks/` —lo que esta lane dejó para sostener el score— corrió de verdad
en el push del PR #98 y salió en verde por su cuenta.

Deuda que queda anotada y **no es de la lane**: 5 `eslint-disable` de
`react-hooks/exhaustive-deps` en `src/` (eran 15 antes del merge de la lane: bajó 10), y los
22 archivos de más de 200 líneas preexistentes del bloque del criterio enmendado.

**Veredicto: PASS.** La lane se cierra y su carpeta sale del árbol; el historial la conserva.

### 2026-09-08 — main entra a la lane (20 commits) y vuelve a 100/100

`origin/main` avanzó **20 commits** mientras corría la lane (submenús del navbar con activo
en dos niveles, las seis áreas de Qué hacemos, `?tipo=` en Biblioteca, SEO, redes,
«Portada» en el índice). Decisión del owner: **merge**, no rebase — el rebase replayaba 77
commits y el mismo conflicto reaparecía hasta 14 veces, cada resolución intermedia teniendo
que quedar coherente; el merge lo resuelve una vez con los dos estados finales a la vista.

**Chocaron 5 archivos, todos de los que la lane había partido.** Lo nuevo se portó ADENTRO de
la estructura partida, nunca al revés:

| Archivo | Qué traía main | Dónde quedó |
|---|---|---|
| `MobileNav.tsx` | acordeón de submenús (105 líneas) | `mobile-nav/NavegacionMenu.tsx`, con el estado del desplegado y `irADestino` en el compositor. La flecha conserva `transition-[color,opacity,translate]`, no el `transition-all` de main |
| `IndicePagina.tsx` | «Arriba» → «Portada» | `useImanIndice.ts`, que es donde la lane arma los items |
| `QueHacemosHeroFaro.tsx` | copy del cartel y CTA «Ver las seis áreas» con ancla `#areas` | `hero-faro/CierreFaro.tsx` |
| `QueHacemosHero.tsx` | chips de las seis áreas | el compositor, entre `TitularQH` y `CapsulaPortal`, mismo lugar del DOM |
| `ButtonPrimary.tsx` | prop `onClick` | conservado, con la transición explícita de la lane |

**No se perdió nada de main**: `git merge-base --is-ancestor origin/main HEAD` → verdadero,
los 20 commits son ancestros. Los 9 archivos que main creó están todos, y `config/nav.ts`,
`lib/navegar.ts` y `que-hacemos/areas.ts` quedaron idénticos a los suyos. Contra
`origin/main`, los únicos archivos que difieren son `Header.tsx` y `MobileNav.tsx`, y es
porque la lane les sacó código a módulos. Respaldo previo al merge: rama
`backup/react-doctor-100-pre-rebase` en `ca7f0e7`.

**El árbol mergeado daba 88/100 con 4 hallazgos, los cuatro en código de main** (`5f85e3f`):

- `Header` pasaba las 300 líneas → partido con la receta de la lane:
  `header/coreografia-intro.ts` (135) y `header/auto-hide.ts` (79), las dos llamadas por el
  MISMO efecto y en la misma posición; el compositor queda en 169.
- `destinosAca` hacía `map().filter(Boolean)` → `flatMap`, una sola pasada.
- `AterrizajePorLink` decodificaba el hash sin guarda: un «%» suelto tira `URIError` y
  cortaba el efecto → `try/catch` con caída al hash crudo.
- `ConQuienTrabajamos` servía los logos con `<img>` **y un `eslint-disable` de
  `no-img-element`**, que el DoD §6.5 prohíbe → `next/image` con las medidas de
  `config/aliados`, igual que Footer y DatosDuros.

**Verificación del resultado**: `RD src` → **100/100, 0 diagnósticos, 289 archivos**;
typecheck, lint y build en exit 0. `PROBE navbar-merge` (nuevo) → `ok: true`: el intro del
navbar morfea después del split (wordmark 203→0, links 0→750, 6 ítems), el auto-hide esconde
y trae la píldora (top 16 → −120 → 16) y el acordeón abre uno solo por vez (5 chevrons, el de
la página actual abierto). Los probes de la lane siguen en verde: `menu-mobile`,
`perfil-dialog` (inmersivo y shell), `casos` y `buscador`.

Dos notas para el que siga:

- `menu-mobile` necesitó dos ajustes de INSTRUMENTO, no de código: ahora el panel tiene
  enlaces dentro de `<ul hidden>` (no enfocables), así que cuenta solo los visibles; y entre
  el último y el primero el foco para en el chrome del navegador Y en el propio `<dialog>`,
  que es enfocable como contenedor modal, así que tabula hasta llegar con tope.
- El worktree `rd-baseline` (112de56, puerto 3002) **ya no sirve como comparación** para las
  páginas que main tocó: quedó dos docenas de commits atrás. Sigue valiendo para las que main
  no tocó (fue el que resolvió el buscador y el perfil hoy mismo).

### 2026-09-08 — Review de cierre: 4 seats en Opus (SPEC §6.13)

Seats independientes, sin contexto de esta sesión, con la consigna de REFUTAR el PASS. Los
veredictos, como los devolvieron (los cuatro mensajes llegaron cortados por tamaño; se pidió
y se recibió la cola de cada uno):

**Seat 1 — animación home + que-hacemos: «PASS CON OBSERVACIONES».** «No encontré nada que
rompa la coreografía ni la limpieza. Los seis splits de fase 1 de mi lente son puros: mismas
posiciones de timeline, mismos easings y duraciones, mismos gsap.set, mismo
gsap.context/matchMedia, mismos cleanups y mismas fases de efecto.» Cuatro hallazgos bajos y
uno informativo.

**Seat 2 — animación quiénes-somos + investigación + resto: «FAIL (arreglable en un commit
chico, pero son regresiones visibles y la lane se comprometió a cero cambios visibles —
SPEC §2)».** Dos familias de regresión visual REALES que «los probes de la lane no podían
detectar por construcción», más una afirmación de PROGRESS que no coincidía con el código y
un hueco de verificación.

**Seat 3 — React y accesibilidad: «PASS CON OBSERVACIONES».** «Un hallazgo que sí rompe
accesibilidad y lo introdujo esta lane (paso 32), dos bugs de corrección en el foco del
<dialog> nuevo, y tres observaciones menores.»

**Seat 4 — reglas del repo: «PASS CON OBSERVACIONES».** «El 100/100 es real y está limpio: lo
verifiqué de punta a punta» (corrió los comandos por su cuenta). Lo que no cerraba era el
criterio de tamaño del DoD y detalles de registro y de commits.

#### Qué se arregló, con su medición

| Hallazgo | Arreglo y evidencia | Commit |
|---|---|---|
| ROJO — la píldora resaltada del índice quedaba SIN fondo: `bg-transparent` en la clase base le gana al `bg-azul-principal` condicional (misma especificidad; en el CSS construido sale después, 53035 contra 48961). Texto blanco sobre el fondo de la página. | Sale `bg-transparent`; las dos ramas del condicional ya traen su fondo. Medido: `rgb(31,45,77)` con texto blanco, igual que la base. | `b41bab0` |
| ROJO — 15 `transition-[…transform…]` no animaban nada: en Tailwind v4 `translate-*` escribe la propiedad `translate` y `scale-*` escribe `scale`. El paso 27 cambió `transition-all` por listas que decían `transform` y el desplazamiento saltaba. | `transform` pasa a `translate` (14 sitios) y a `scale` (1). Medido contra la base: la flecha de «Biblioteca» pasa por 73 valores intermedios de `none` a `2px -2px`, misma trayectoria. | `b41bab0` |
| ROJO — las píldoras del índice (`<button tabIndex={-1}>` dentro de `aria-hidden`) se quedaban el foco al clickearlas y Chrome ignora el `aria-hidden`, exponiendo la capa decorativa entera. | `onMouseDown` con `preventDefault`. Medido: el clic sigue navegando y el imán mueve las píldoras los mismos píxeles que la base. | `5b838fa` |
| El foco al burger se pedía con el `<dialog>` todavía modal (inerte): era no-op y andaba de rebote por la restauración del propio `<dialog>`; además robaba el foco en cada re-corrida con el menú cerrado. | Restauración pegada al `close()` real. Medido abriendo SIN foco en el burger: vuelve igual. | `5b838fa` |
| Con el menú abierto, agrandar la ventana más allá de `lg` dejaba el panel pintado, modal y con el scroll trabado. | Se cierra al cruzar a escritorio. Medido: `display: none`, `open: false` y scroll liberado (la base queda con el body en `overflow: hidden`). | `d144580` |
| PROGRESS declaraba a `RotadorPalabras` dueño de su hint y el código no lo ponía: dos `clearProps` limpiaban algo inexistente. | La coreografía lo pide al armar y al sacar la bobina. Medido en /novedades: alterna `transform` girando y `auto` en reposo. | `d8a83ff` |
| El PLAN paso 7 prometía promover `[data-card-mouse]` solo con puntero fino y el hero del home no lo pedía. | Gate propio por `(hover: hover)`, aparte de `soloHover` (que apaga el RAF). Medido: desktop 11/11, mobile 0/11. | `5c46c54` |
| Hueco de verificación: ningún probe había scrolleado ADENTRO del `<dialog>` del perfil, que es el scroller de todos sus ScrollTrigger. | Probe nuevo `perfil-scroll.js`: scroller `DIALOG` contra `DIV` en la base, mismo alto (4029), mismos `scrollTop` en 5 fracciones y cero diferencias en los elementos del perfil inmersivo. | — |
| El Enter del buscador perdió el cierre del teclado virtual que traía el submit implícito del `<form>`. | `blur()` antes del salto; `PROBE buscador` sigue en `ok: true`. | `d144580` |
| El comentario de `PaisDropdown` prometía un `aria-activedescendant` que el archivo nunca tuvo. | Comentario corregido. | `d144580` |
| Seis `export` sin ningún consumidor fuera de su archivo. | Pasan a locales. | `306927c` |
| Registro: `F35` decía «div role=search»; la entrada de DECISIONS sobre módulos extra nombraba 2 casos de unos 12; el sub-límite de 80 líneas para hooks nunca se había registrado. | Los tres corregidos en DECISIONS y en `feature_list.json`. | `306927c` |

Efecto secundario del arreglo de accesibilidad: sumar `role="search"` al `<search>` (lo pedía
el seat 3 para navegadores anteriores a 2023) disparó `no-redundant-roles` y el score cayó a
96. Como el pedido del owner es 100/100 sin apagar ni una regla, el rol salió y la decisión
quedó escrita en DECISIONS (`a80259e`).

#### Qué NO se arregló, y por qué

- **Forma de los commits** (15 headers de más de 72 caracteres, el scope `ui` de `4857346`, y
  `feat` donde correspondía `refactor`): son reales, pero los sha están citados en PROGRESS,
  en `feature_list.json` y en DECISIONS, y reescribirlos los invalidaría todos. Queda como
  regla para la próxima lane.
- **`[data-mcard]` sin hint en mobile** (seat 1): es lo que mandaban el relevamiento §1a y el
  SPEC §3.4. Anotado como primer sospechoso si aparece jank en el despliegue mobile.
- **Alocación por frame en `pintar-torre.ts`** y **el par encendido/cierre del haz duplicado
  entre `haz-faro.ts` y `escenas-faro.ts`**: preferencias del seat 1; el segundo ya estaba
  duplicado en la base y lleva comentario en los dos lados.
- **Los siete hooks de más de 80 líneas** de AGENTS §6: consecuencia registrada de la ruling
  del owner sobre el tope.

### 2026-09-08 — Verificación FINAL, después de los arreglos de la review

- `RD --json src` → score 100, 0 diagnósticos, `skippedChecks: []`, `complete: true`, 278
  archivos. `pnpm typecheck`, `pnpm lint` y `pnpm build` → exit 0.
- PROBES sobre el estado final: **desktop 48/48 sin diferencias** (exit 0, con `data-haz` y
  `data-svg-origin` en el ignore por no deterministas, probado base contra base); **mobile
  32/32 con la única familia conocida**, las 192 entradas de `data-mnav-item` y
  `data-mnav-cta` que pasan a caja `0,0,0,0` porque un `<dialog>` cerrado no se maqueta,
  cubierta por `PROBE menu-abierto`, que mide el panel ABIERTO igual a la base al centésimo.
- Probes de interacción, todos en `ok: true`: `menu-mobile`, `perfil-dialog` (inmersivo y
  shell), `casos`, `buscador`, `indice-pildora`, `menu-abierto`, `perfil-scroll`,
  `a11y-fix`, `wc-puntero`, `bobina-hint` y `flecha-anima`.
- Las 168 capturas pareadas se tomaron antes de los arreglos de la review y no se rehicieron:
  ninguno de esos arreglos cambia un estado congelado (tocan color en hover,
  `transition-property`, `will-change` y el foco). Lo que sí se volvió a correr sobre el
  estado final son los probes numéricos, que son el criterio de paso.

### 2026-09-08 — DoD del SPEC §6: 13 de 13 criterios en verde incluida la review (§6.13)

- **§6.1 react-doctor**: `pnpm dlx react-doctor --no-supply-chain src` → **`Score: 100 / 100`**
  y «No issues found!». En `--json`: `summary.score` 100, `totalDiagnosticCount` 0,
  `errorCount` 0, `warningCount` 0, `projects[0].skippedChecks` `[]`, `complete: true`,
  278 archivos analizados.
- **§6.2 gates**: `pnpm typecheck` exit 0; `pnpm lint` exit 0; `pnpm build` exit 0 (12 rutas
  prerenderizadas). El build limpia `.next`: los run files de Playwright se respaldan antes.
- **§6.3 tamaño**: los 138 archivos que la lane CREA en `src/` están todos ≤ 200 líneas.
  El comando literal del SPEC (`main...HEAD`) mide contra `main` y arrastra los 223 archivos
  que también tocó gar; contra la base real de la lane (`112de56`) son 194. **Abierto**: 17
  archivos modificados que la lane NO parte crecieron entre 2 y 11 líneas (comentarios del
  porqué y traslados de will-change), y 22 modificados superan las 200 líneas desde antes de
  la lane. Ver la pregunta al owner abajo.
- **§6.4 extensiones**: `git diff --name-only --diff-filter=A main...HEAD -- src | grep -E
  '.jsx?
` → 0 líneas.
- **§6.5 supresiones**: `grep -rn "react-doctor-disable|no-img-element" src` → 0; no hay
  `doctor.config.*`; `package.json` sin clave `reactDoctor`.
- **§6.6 hex**: `#[0-9a-fA-F]{6}` → 69 en HEAD y 69 en `main` (no sube).
- **§6.7 paridad SSR de fase 1**: registrada paso por paso arriba (cada split con su `cmp`
  contra el baseline).
- **§6.8 texto visible**: `textContent` del `<body>` SSR (sin scripts ni estilos) de las 8
  rutas **idéntico** al baseline: biblioteca 6659, contacto 1649, home 5847, investigación
  8497, novedades 3738, libro 2399, que-hacemos 4937, quiénes-somos 5195 caracteres.
- **§6.9 interacciones** (Playwright, lane 3000 contra base 3002 donde aplica):
  `PROBE menu-mobile` → `ok: true`; `PROBE perfil-dialog` inmersivo y shell → `ok: true`;
  `PROBE casos` → `ok: true` (abrir, cambiar, Escape, Back y deep link); `PROBE buscador`
  → `ok: true`; `PROBE menu-abierto` → `ok: true` (las 6 cajas del panel abierto iguales a
  la base al centésimo).
- **§6.10 capturas y probes de fase 2**: 168 capturas pareadas `<ruta>-<estado>-<antes|
  despues>.png` (`capturas/` 96 a 1536×850, `capturas-m/` 64 a 390×844, `capturas-int/` 8
  de los estados por interacción); «antes» = servidor de la base (3002), «después» = lane
  (3000), los dos medidos hoy con el mismo protocolo. Probes numéricos: **desktop 48/48 sin
  diferencias** (exit 0); **mobile 32/32 con una sola clase de diferencia**, las 192 entradas
  de `data-mnav-item`/`data-mnav-cta` que pasan a caja `0,0,0,0` porque un `<dialog>`
  CERRADO no se maqueta y el `<div>` anterior sí (invisible pero ocupando); `PROBE
  menu-abierto` cubre el estado que importa.
- **§6.11 feature_list.json**: 37/37 filas en `passing`, cada una con su evidencia y su
  commit.
- **§6.12 documentación**: `grep -c "will-change" docs/AI_GUIDELINES.md` → 2;
  `grep -c "subcarpeta"` → 1.
- **§6.13 review de 4 seats**: PENDIENTE.

### Dos cosas que el cierre encontró y arregló

1. **El panel mobile abierto medía mal desde el paso 33** (`fix(layout)` `575382f`): el
   `<dialog>` quedó con `inset-0` pero sin tamaño propio y el user agent le da
   `width`/`height: fit-content`; los ítems medían 321px en vez de 342 y estaban 59px más
   arriba. Lo encontró `PROBE menu-abierto`, no el ojo: el probe de §6.9a solo miraba
   display, opacidad, foco y Tab. Mismo bug que el del overlay del equipo (paso 34).
2. **`data-haz` no es determinista**: `que-hacemos-0.8` marcaba el segundo `[data-haz]`
   (el haz `der`, con `opacity: 0` y `visibility: hidden` en las dos puntas) con la
   rotación corrida. Contrastado contra el servidor de la base HOY: la base da
   `0.94,0.34` y la lane `0.94,0.35`, y **la base contra SÍ MISMA en dos pasadas también
   difiere** (`191.4` vs `191.88` de traslación) por encima de la tolerancia. Es ruido del
   elemento, no de la lane: entra a `PROBE_IGNORE` junto con `data-svg-origin` (el mismo
   nodo), documentado con esa evidencia.

### Resuelto por el owner el 2026-09-08 — el tope se lee sobre lo creado y lo partido

El owner eligió la opción (a). Enmendados en el mismo acto **SPEC §6.3** y la cláusula «los
otros no crecen ni una línea» de la ruling de DECISIONS: el tope de 200 aplica a los
archivos que la lane CREA y a los componentes que PARTE (con su subcarpeta), medido contra
la base real de la lane; a los tocados y no partidos se les pide que no se los parta acá, no
que no crezcan. Los 22 archivos de más de 200 líneas que ya existían quedan como deuda
aparte (datos, coreografías, SVG); partirlos sería una lane nueva, con conflictos con `gar`
y cero ganancia de score.

Verificación del criterio enmendado: **138 de 138 archivos creados ≤ 200**, y los **18
compositores partidos** también, el más largo `TeamProfileOverlay.tsx` con 199 (ComoTrabajamos
94, Hero 78, QueHacemosHero 162, NivelesEscala 152, IndicePagina 183, DestacadosBiblioteca
116, RedEd 108, MiradaEd 165, OrigenEd 135, CarpetaCaso 160, ExpedienteCaso 157,
ContactoExperiencia 193, CasosInvestigacion 138, QueHacemosHeroFaro 165, ImmersiveProfile
184, TorreLineas 129, MobileNav 158). **§6.3: PASS.**