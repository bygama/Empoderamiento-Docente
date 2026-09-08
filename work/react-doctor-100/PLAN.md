# PLAN — react-doctor-100

Tier L · rama `refactor/react-doctor-100` sobre `bygama/gar` · checkout actual · SPEC
aprobado el 2026-09-08 y enmendado (§0) el mismo día. Cada paso es un commit
(Conventional, español, imperativo, `docs/COMMITS.md`); un paso `[batch]` que cruza
features se commitea por scope (ver DECISIONS). El cierre (DoD §6 del SPEC + review de 4
seats) lo corre work-verify una sola vez después del último paso; no es un paso de este
plan. Marca de riesgo por costo de rehacer, no por tamaño.

Comandos que se repiten (abreviados en las aceptaciones):

- `GATES` = `pnpm typecheck && pnpm lint` → exit 0.
- `RD <ruta…>` = `pnpm dlx react-doctor --no-supply-chain --json <ruta…> | node rd-count.mjs
  <regla…>` (scratchpad) → exit 0 solo si cada regla pedida tiene 0 sitios.
- `SSR <ruta…>` = `MSYS_NO_PATHCONV=1 BASE=http://127.0.0.1:3000 node ssr.mjs <dir>
  <ruta…>` (scratchpad) y `cmp` con `baseline-ssr/` → exit 0.
- `LINEAS <carpeta>` = `wc -l` de cada `.ts`/`.tsx` de la carpeta y su subcarpeta → todos
  ≤ 200.
- `PROBES <ruta…>` = pasada de Playwright a 1536×850 (y 390×844 cuando se indica) sobre
  las rutas, `probe-extract.mjs` y `probe-compare.mjs` contra `baseline-probes/desktop-pw`
  (o `mobile`) con tolerancia 0.02 y `PROBE_IGNORE` = la lista de atributos que derivan
  solos (PROGRESS, fase 0) → exit 0. Los cambios de `will-change` se listan aparte y no
  fallan la comparación.
- `PROBE <nombre>` = probe de interacción del scratchpad (`probes/<nombre>.mjs`, Playwright
  o `orca eval`) que devuelve `true`.

## Restricciones (aplican a todos los pasos)

- Ningún archivo tocado o creado en `src/` supera las 200 líneas. Solo `.tsx` / `.ts`.
- Cero `react-doctor-disable`, cero `doctor.config.*`, cero `reactDoctor` en package.json.
  Los `eslint-disable … no-img-element` desaparecen con los pasos 29-30 y con la foto
  viajera del paso 9.
- Sin `any`; imports por `@/`; comentarios en español con el porqué; los comentarios que
  documentan regresiones viajan con el código.
- Colores por token: la cuenta de `#[0-9a-fA-F]{6}` en `src/` no sube respecto de la base
  (`bygama/gar`, `112de56`).
- Copy intacto; ningún cambio de fase de efecto (layout effect sigue siendo layout effect,
  en la misma posición).
- Fase 1 (pasos 1-26): SSR de las rutas afectadas idéntico al baseline. Fase 2 (27-36): el
  diff SSR se limita a los atributos que toca el paso; el texto visible no cambia.
- `no-transition-all` se cuenta con `grep -rn "transition-all" src` además de con
  react-doctor (la regla no ve `className` con template literal).
- Contratos DOM que no se mueven: SPEC §3.3 (último punto de la receta) y §0.6 (los que
  trajo gar: `abrirRef` y el deep link de CasosInvestigacion; `data-scroll-principal`,
  `data-exp-pestana` y `useCopiar` en ExpedienteCaso; el efecto de `?tema=` de
  ContactoExperiencia corre un frame después del montaje; NavegacionCasos no cambia de
  forma).
- `<dialog>` del overlay (SPEC §0.5): sin `transform`, `filter` ni `will-change` sobre el
  `<dialog>`; él mismo lleva `data-profile-scroller`, `data-lenis-prevent`,
  `overflow-y-auto` y `overscroll-contain`; `useLockScroll` se conserva; Escape del
  `window` y `onCancel` cambian en el mismo commit; foco a «volver» después de
  `showModal()`.
- Dev server en la terminal de Orca de este checkout (puerto 3000). Probes de escena con
  Playwright (SPEC §0.8); interacciones y capturas con Playwright o el navegador de Orca.
  Nunca un proceso largo como shell de fondo.
- Antes de cada split que toque un archivo que gar también toca (SPEC §0), `git fetch` y
  rebase sobre la punta de `bygama/gar` si se movió; anotar el commit base en PROGRESS.

## Fase 0

0. **Baseline y arnés** (sin commit; evidencia en PROGRESS). Arnés SSR validado (dos tomas
   idénticas por ruta); 8 baselines SSR; probes de escena por Playwright: 8 rutas × 6
   fracciones a 1536×850 (doble pasada para obtener la lista de atributos que derivan
   solos) y 8 × 4 a 390×844 con emulación táctil; captura del tope de cada ruta en ambos
   viewports; `rd-count.mjs`, `ssr.mjs`, `probe-extract.mjs`, `probe-compare.mjs` en el
   scratchpad.
   Aceptación: `ls baseline-ssr` → 8 `.html`; `probe-compare desktop-pw desktop-pw-b` con
   `PROBE_IGNORE` → 0 archivos con diferencias; `node -v` anotado. *(judgment · high)*

## Fase 1 — refactors puros (SSR idéntico)

1. `[batch]` **Exports no-componente a módulos `.ts`**: `investigacion/components/
   linterna-geometria.ts` (FOCO, VIEWBOX, PARANTES, MONTANTES, LENTE, RADIO_CRISTAL,
   RADIO_GALERIA, proyectar, aspectoBarra, proyectarLente; importadores: LinternaFaro,
   coreografia-cierre), `que-hacemos/components/faro-geometria.ts` (CAPAS_Z, FOCO_X,
   FOCO_Y, PUNTOS_VERBO, FUGA_X, FUGA_Y, ORIGEN_CSS; importadores: FaroEscena,
   QueHacemosHeroFaro), `que-hacemos/components/tiempos-faro.ts` (INICIO_PREGUNTAS,
   PASO_PREGUNTA, BEATS, FIN_PREGUNTAS, CORRIMIENTO, despues, DURACION_RECORRIDO;
   PREGUNTAS/VERBO_POS/HAZ_VERBO a `que-hacemos/data.ts`; importadores: QueHacemosHeroFaro,
   QueHacemosHero), `quienes-somos/components/profile/acentos.ts` (ACCENT; importadores:
   profileParts, ImmersiveProfile). Tres commits: investigacion, que-hacemos, quienes-somos.
   Aceptación: `GATES`; `RD src only-export-components`; `SSR /investigacion /que-hacemos
   /quienes-somos`. *(mechanical · low)*

2. `[batch]` **Hoists a módulo** (8): `irAlListado` y `flechaClase` (CategoriasRail),
   `irASeccion` (FichaNovedad), `hoverFine` (LanzamientosRecientes), `irALineas` con su
   comentario del `+4px` (QueHacemosHeroFaro), `ir` (IndicePagina), `verdeSobreAzul` con su
   comentario de contraste (NovedadDestacada), `offsets` (profileParts, como
   `OFFSETS_MAPA`). Commits por scope: biblioteca, novedades, que-hacemos, layout,
   quienes-somos.
   Aceptación: `GATES`; `RD src prefer-module-scope-pure-function
   prefer-module-scope-static-value`; `SSR` de las 8 rutas (IndicePagina está en todas).
   *(mechanical · low)*

3. `[batch]` **Keys de texto e iteraciones combinadas** (12 + 2): `parrafo` (FichaNovedad),
   palabras de OrigenEd hoisteadas a `PALABRAS_REMATE` con `key={w}`, `part`
   (ImmersiveProfile), `m.title` ×6, `${b.place}-${b.period}` (branches), `t` (tags),
   `p.title` (publicaciones) en profileParts; `for…of` en `generateStaticParams` y un
   `for…of` para `passedIds` (ImmersiveProfile). Commits por scope: novedades,
   quienes-somos.
   Aceptación: `GATES`; `RD src no-array-index-as-key js-combine-iterations`; `SSR
   /novedades/libro-socioepistemologia /quienes-somos`. *(mechanical · low)*

4. **Helpers de viewport y guard SSR**: nuevo `src/lib/viewport.ts` exportando
   `altoViewport(): number` (`window.innerHeight`) y `anchoDocumento(): number`
   (`document.documentElement.clientWidth`), usados por los lectores diferidos de
   DestacadosBiblioteca (`S`) y MiradaEd (`W`, `H`) sin cambiar cuándo se leen; en
   FichaNovedad el initializer de `useState` pasa a `typeof window === "undefined" ?
   false : …`. Commits: lib+biblioteca+quienes-somos (un cambio lógico), novedades.
   Aceptación: `GATES`; `RD src no-unguarded-browser-global-in-render-or-hook-init`; `SSR
   /biblioteca /quienes-somos /novedades/libro-socioepistemologia`; `PROBES /biblioteca
   /quienes-somos`. *(mechanical · low)*

5. **Reseteo de refs en render (TorreLineas)**: borrar las cinco líneas del cuerpo del
   componente que vacían `drumRefs`, `spanRefs`, `railRefs`, `fotoRefs` y `chipRefs`;
   sembrar `spanRefs` y `chipRefs` en el `useRef` con `TAMBORES.map(() => [])`.
   Aceptación: `GATES`; `RD src/features/que-hacemos no-ref-current-in-render`; `SSR
   /que-hacemos`; `PROBES /que-hacemos`. *(mechanical · medium)*

6. **`useEffectEvent` en CasosInvestigacion**: los handlers de Escape y `popstate` pasan a
   `useEffectEvent`; caen `solicitarCierre`/`cerrar` como `useCallback` encadenados y las
   lecturas por ref del estado que solo existían para eso; `abrirRef` y el efecto de deep
   link quedan como están.
   Aceptación: `GATES`; `RD src/features/investigacion prefer-use-effect-event`; `SSR
   /investigacion`; `PROBE casos-interaccion` (abrir, cambiar, Escape, abrir, Back →
   `true`). *(judgment · high)*

7. **`useMouseParallax`** en `src/lib/hooks/useMouseParallax.ts`: `useMouseParallax(ref,
   { x: "--pnx", y: "--pny", ease: 0.09, activo: boolean })` con el mismo RAF + lerp que
   hoy en Hero y QueHacemosHero; Hero usa `--pnx/--pny`, QueHacemosHero `--qhx/--qhy`. El
   hook, además, es quien pone `willChange: "transform"` en `[data-card-mouse]` solo con
   puntero fino (lo consume el paso 28).
   Aceptación: `GATES`; `SSR / /que-hacemos`; `PROBE hero-mouse` y `PROBE qh-mouse`
   (mousemove sintético → las custom props cambian de 0). *(integration · medium)*

8. **`acople-lamina.ts`** en `quienes-somos/components/`: `acoplarLamina(root: HTMLElement)`
   crea el `fromTo` `scale 0.97 → 1`, `y 36 → 0`, `scrub: true`, `start "top 96%"`, `end
   "top 14%"`, con el `gsap.set` previo del `transformOrigin` y su comentario; lo usan
   RedEd, MiradaEd y OrigenEd dentro de sus contextos actuales.
   Aceptación: `GATES`; `SSR /quienes-somos`; `PROBES /quienes-somos`.
   *(integration · medium)*

9. **TeamProfileOverlay: código muerto y foto viajera** (SPEC §0.4). Borrar el camino
   `figura === "recorte"` (rama de reencuadre alineado al píxel, `mascara`, `coverEn`,
   `DISOLUCION_FONDO`, la rama `recorte` de `medirDestino`) y `cutoutCrop` del tipo
   `Profile`; la foto viajera pasa de `<img>` a `<div>` con `backgroundImage:
   url(currentSrc)` y `background-size: cover` (cae su `eslint-disable`). Dos commits:
   quienes-somos (muerto) y quienes-somos (viajera).
   Aceptación: `GATES`; `RD src no-broken-image-source`; `grep -c cutoutCrop src` → 0;
   `SSR /quienes-somos`; `PROBE perfil-inmersivo` y `PROBE perfil-shell` (abrir: foco en
   «volver», la foto viajera aterriza sobre `[data-portrait-mover]` con la misma caja
   que el baseline ±1; cerrar: `scrollY` previo ±1). *(judgment · high)*

10. **Split #1 ComoTrabajamos** (`home/components/como-trabajamos/`): `data.ts` de home
    con `PASOS`, `coreografia-metodo.ts` (`crearMetodo(root, { reduced })` → cleanup),
    `PasoMetodo.tsx`, `IndicadorPasos.tsx`; el compositor queda en su ruta.
    Aceptación: `GATES`; `RD src/features/home no-giant-component` no lista
    ComoTrabajamos; `LINEAS src/features/home/components`; `SSR /`; `PROBES /`.
    *(judgment · medium)*

11. **Split #2 Hero** (`home/components/hero/`): `hero-cards.ts`, `coreografia-hero.ts`
    (`crearEntradaHero(scope, opciones)` llamado desde el layout effect del compositor,
    porque mide `getBoundingClientRect` pre-paint), `CampoCards.tsx`, `CampoCardsMobile.tsx`,
    `HeroCopy.tsx`; el parallax de mouse ya es el hook del paso 7.
    Aceptación: `GATES`; `RD src/features/home no-giant-component` sin Hero; `LINEAS`;
    `SSR /`; `PROBES /` a 1536×850 y 390×844. *(judgment · medium)*

12. **Split #3 QueHacemosHero** (`que-hacemos/components/que-hacemos-hero/`): `polvo.ts`,
    `coreografia-hero-qh.ts`, `estrella-fugaz.ts`, `capsula-magnetismo.ts`,
    `portal-viaje.ts` (importa `DURACION_RECORRIDO` de `tiempos-faro.ts`),
    `CapsulaPortal.tsx`, `CieloPolvo.tsx`; cinco efectos independientes, cada uno con su
    cleanup.
    Aceptación: `GATES`; `RD src/features/que-hacemos no-giant-component` sin
    QueHacemosHero; `LINEAS`; `SSR /que-hacemos`; `PROBES /que-hacemos`; `PROBE qh-portal`
    (hold sintético → `scrollY` crece). *(judgment · medium)*

13. **Split #4 NivelesEscala** (`que-hacemos/components/niveles-escala/`):
    `coreografia-niveles.ts` (constantes de tiempo, `POS`, `LAZO` y el `run()` gateado por
    `document.fonts.ready`, devolviendo cleanup), `LazoViajero.tsx`, `NivelCard.tsx` con
    `[data-collapse]`/`[data-collapse-icon]` byte-idénticos.
    Aceptación: `GATES`; `RD src/features/que-hacemos no-giant-component` sin
    NivelesEscala; `LINEAS`; `SSR /que-hacemos`; `PROBES /que-hacemos`.
    *(judgment · medium)*

14. **Split #5 IndicePagina** (`components/layout/indice-pagina/`): el imán del índice
    (los `quickTo`, `cercania`, `aplicar`, `entrar`, `salir`, `filaDesde`, temporizadores)
    a `src/lib/hooks/useImanIndice.ts` (`useImanIndice(items, reduced)` → `{ cerca,
    refMarca, refPildora, onEnter, onLeave }`), el botón de subir a `BotonSubir.tsx`; el
    compositor conserva los tres bloques de markup y la detección de overlays por
    `body.style.overflow` (SPEC §0.5).
    Aceptación: `GATES`; `RD src/components no-giant-component`; `LINEAS
    src/components/layout`; `SSR` de las 8 rutas; `PROBES /investigacion` (el índice vive
    en todas; una alcanza). *(judgment · medium)*

15. **Split #6 DestacadosBiblioteca** (`biblioteca/components/destacados/`): `ITEMS` a
    `data/materiales.ts`, `coreografia-destacados.ts` (recibe `{ root, row, slot, artsWrap,
    items, setActivo }`), `IntroDestacados.tsx`, `IndiceDestacados.tsx`,
    `ArticuloDestacado.tsx` con callback-refs `refItem`/`refSlot`.
    Aceptación: `GATES`; `RD src/features/biblioteca no-giant-component`; `LINEAS`; `SSR
    /biblioteca`; `PROBES /biblioteca`. *(judgment · medium)*

16. **Split #7 RedEd** (`quienes-somos/components/red/`): `red-datos.ts`,
    `coreografia-red.ts` (dibujo + deriva), `vuelo-fotos.ts`, `GrafoRed.tsx`,
    `DockEspecialidad.tsx`; usa `acoplarLamina` del paso 8.
    Aceptación: `GATES`; `RD src/features/quienes-somos no-giant-component` sin RedEd;
    `LINEAS`; `SSR /quienes-somos`; `PROBES /quienes-somos`; `PROBE red-hover` (hover
    sintético en una especialidad → `[data-dock-av]` visibles > 0). *(judgment · high)*

17. **Split #8 MiradaEd** (`quienes-somos/components/mirada/`): `constelacion-mirada.ts`
    (geometría y `PERSPECTIVAS`), `setup-estados.ts` (posicionamiento imperativo inicial,
    documentado como dueño de la posición de las fichas), `timeline-fases.ts`,
    `MapaConstelacion.tsx`, `DetallePerspectiva.tsx`, `FichasPerspectiva.tsx`,
    `SintesisMirada.tsx`, `IndicadorFases.tsx`.
    Aceptación: `GATES`; `RD src/features/quienes-somos no-giant-component` sin MiradaEd;
    `LINEAS`; `SSR /quienes-somos`; `PROBES /quienes-somos`. *(judgment · high)*

18. **Split #9 OrigenEd** (`quienes-somos/components/origen/`): `data.ts`, `estilos.ts`,
    `Pilar.tsx`, `coreografia-origen.ts`, `panel-fotos.ts`, `PanelFotos.tsx`,
    `TrayectoriaHorizontal.tsx`, `TrayectoriaVertical.tsx`, `BeatRemate.tsx`; los cinco
    beats siguen siendo hijos directos de `[data-story-tilt]`.
    Aceptación: `GATES`; `RD src/features/quienes-somos no-giant-component` sin OrigenEd;
    `LINEAS`; `SSR /quienes-somos`; `PROBES /quienes-somos`. *(judgment · high)*

19. **Split #10 CarpetaCaso** (`investigacion/casos/carpeta/`): la anatomía de la tapa
    (`data-carpeta-front` y todo lo que cuelga) a `TapaCarpeta.tsx` con props `caso`,
    `tinte`, `peso`, `esUltima`, `interactiva`, `desplegada`, `onToggle`, `idPanel`; el
    `group` de Tailwind sigue en `[data-carpeta-cuerpo]`, en el padre; el DOM resultante
    es idéntico (la coreografía lo lee por selectores desde el `<li>`).
    Aceptación: `GATES`; `RD src/features/investigacion no-giant-component
    no-high-complexity-react-function` sin CarpetaCaso; `LINEAS`; `SSR /investigacion`;
    `PROBES /investigacion`. *(judgment · medium)*

20. **Split #11 ExpedienteCaso** (`investigacion/casos/expediente/`):
    `RotuloExpediente.tsx`, `coreografia-expediente.ts` (reveals + asentado + sello +
    parallax), `CabeceraExpediente.tsx` (con `useCopiar` y su rótulo), `HojaInforme.tsx`
    (con `[data-exp-hoja]` sin cambiar de lugar ni clases), `CartonExpediente.tsx`,
    `BandaSiguiente.tsx`, `PestanasLaterales.tsx` (con `data-exp-pestana`);
    `article[data-exp-lugar][data-scroll-principal] > … > cuerpo` intacto.
    Aceptación: `GATES`; `RD src/features/investigacion no-giant-component` sin
    ExpedienteCaso; `LINEAS`; `SSR /investigacion`; `PROBE caso-abierto`.
    *(judgment · high)*

21. **Split #12 TeamProfileOverlay** (`quienes-somos/components/overlay/`):
    `usePortalModal.ts` (portal + `useLockScroll` + `inert` + foco + guardado y
    restauración de scroll, en un solo hook declarado primero, con el orden de limpieza
    actual: revert → pares → inert → container → foco → scroll), `viaje-foto.ts`
    (`medirDestino` y el viaje de la foto viajera), `coreografia-overlay.ts`
    (`abrir()`/`cerrar()` para inmersivo y shell, los pares, el clip-path),
    `PerfilShell.tsx` con callback-ref del hero; el teclado (Escape + Tab) queda en el
    compositor hasta el paso 34.
    Aceptación: `GATES`; `RD src/features/quienes-somos no-giant-component` sin
    TeamProfileOverlay; `LINEAS`; `SSR /quienes-somos`; `PROBE perfil-inmersivo` y `PROBE
    perfil-shell`. *(judgment · high)*

22. **Split #13 ContactoExperiencia** (`contacto/components/experiencia/`): `data.ts`,
    `estilos.ts`, `coreografia-intro.ts` (entrada + `desarmar` + `saltarIntro` +
    `finIntro`), `coreografia-paneles.ts` (`elegirTema`, `cambiarTema`, `enviar`,
    `otraConsulta`), `PanelHero.tsx`, `ColumnaIdentidad.tsx`, `IndiceTemas.tsx` (devuelve
    el elemento clickeado por callback), `RailTema.tsx`, `CamposContacto.tsx`,
    `PanelCierre.tsx`; las clases tipográficas de `[data-hero-titulo]` y
    `[data-ap-titulo]` viven en una sola constante de `estilos.ts`; el efecto de `?tema=`
    sigue corriendo un frame después del montaje en el compositor.
    Aceptación: `GATES`; `RD src/features/contacto no-giant-component`; `LINEAS`; `SSR
    /contacto`; `PROBE contacto-intro` y `PROBE contacto-tema` (elegir un tema → el
    formulario queda visible; `/contacto?tema=<id>` aterriza en el formulario).
    *(judgment · high)*

23. **Split #14 CasosInvestigacion** (`investigacion/casos/maquina/`), por hook:
    `useLugarExpediente.ts` (historial + scroll lock + Escape + popstate + deep link por
    hash con `abrirRef`, devuelve un objeto máquina con sus refs), `useEntradaIndice.ts`,
    `useTransicionesExpediente.ts` (opening / switching / closing, en el mismo orden y fase
    que hoy); el compositor conserva el JSX y el cableado.
    Aceptación: `GATES`; `RD src/features/investigacion no-giant-component` sin
    CasosInvestigacion; `LINEAS`; `SSR /investigacion`; `PROBE casos-interaccion`
    (incluye `/investigacion#<slug>` → abre solo). *(judgment · high)*

24. **Split #15 QueHacemosHeroFaro** (`que-hacemos/components/hero-faro/`):
    `camara-faro.ts` (`crearCamara` → `{ cam, entrada, capas, aplicar }`), `haz-faro.ts`
    (`crearHaces` → `{ girar, setTimeline }`, único dueño de `rotation`),
    `coreografia-faro.ts` (S0-S5 y el hook `#qa=`), `PreguntasFaro.tsx`, `CierreFaro.tsx`;
    los tres comentarios de regresión viajan con su código.
    Aceptación: `GATES`; `RD src/features/que-hacemos no-giant-component` sin
    QueHacemosHeroFaro; `LINEAS`; `SSR /que-hacemos`; `PROBES /que-hacemos`.
    *(judgment · high)*

25. **Split #16 ImmersiveProfile** (`quienes-somos/components/profile/inmersivo/`):
    `camino.ts`, `viaje-nombre.ts` (recibe un bundle de refs), `camino-maestro.ts`,
    `etapas.ts`, `apertura-perfil.ts` (con la rama `figuraDesdeCard`), `PerfilLineal.tsx`
    (rama reduced-motion), `FiguraPerfil.tsx` (las tres apariciones de la figura),
    `IdentidadFija.tsx`, `IndiceVivo.tsx`, `HeroPerfil.tsx` (el clon del nombre en flujo
    con sus `clamp()`), `RecorridoEtapas.tsx`, `CierrePerfil.tsx`; `data-portrait-outer` y
    `data-portrait-mover` siguen en el retrato fijo.
    Aceptación: `GATES`; `RD src/features/quienes-somos no-giant-component
    no-high-complexity-react-function` sin ImmersiveProfile; `LINEAS`; `SSR
    /quienes-somos`; `PROBE perfil-inmersivo`; con `prefers-reduced-motion: reduce` el
    perfil renderiza la rama lineal (`[data-perfil-lineal]` presente). *(judgment · high)*

26. **Split #17 TorreLineas** (`que-hacemos/components/torre/`): `geometria-torre.ts` (puro),
    `armado-torre.ts` (proxy de build, `armar`/`rebobinar`/`completar`, bloqueo de scroll; el
    build timeline sigue naciendo fuera del contexto y matándose a mano), `pintar-torre.ts`
    (factory `crearPintor(refs)` dueña de `ocultos`/`activo`/`fijado`), `RielEstaciones.tsx`,
    `RielProgreso.tsx`, `TamborTorre.tsx`, `FotoTambor.tsx`, `ApoyoTorre.tsx`,
    `FallbackTorre.tsx`; un bundle de refs creado por el compositor.
    Aceptación: `GATES`; `RD src no-giant-component`; `LINEAS`; `SSR /que-hacemos`;
    `PROBES /que-hacemos` a 1536×850 y 390×844 (el fallback plano). *(judgment · high)*

## Fase 2 — cambios de comportamiento (capturas y probes)

27. `[batch]` **`transition-all` y `scale-x`** (11 reportados + CarpetaCaso 376 y 408 +
    NavegacionCasos 46 + CtaButton): propiedades explícitas según la tabla de
    `relevamiento-performance.md` §2; `scale-x-0` → `scale-x-[0.01]`. Commits por scope: ui,
    contacto, home, investigacion, que-hacemos.
    Aceptación: `GATES`; `RD src no-transition-all no-scale-from-zero`; `grep -rn
    "transition-all" src` → 0; diff SSR de las 8 rutas limitado a tokens `transition-*` /
    `scale-x-*` (script del scratchpad que los borra de ambos lados y compara → exit 0).
    *(mechanical · low)*

28. `[batch]` **`will-change`** (33): los de «quitar» se borran de clase/`style` (incluida
    la foto viajera); los de «la coreografía es dueña» se ponen con `gsap.set(..., {
    willChange })` al arrancar y se limpian al salir (`clearProps` / `onComplete` /
    cleanup), incluido el hero shell del overlay; FaroEscena `[data-faro-shift]` entra al
    `gsap.set` existente de `camara-faro.ts`; Hero `[data-card-mouse]` lo maneja el hook del
    paso 7; OrigenEd `[data-story-tilt]` se borra (`preserve-3d` ya promueve). Commits por
    scope.
    Aceptación: `GATES`; `RD src no-permanent-will-change`; `grep -rnE
    "will-change-|willChange:" src` solo en módulos de coreografía/hooks (ninguno en un
    `className` ni en un `style` de JSX); diff SSR limitado a tokens `will-change-*` y
    `will-change:`; `PROBES` de las 8 rutas a 1536×850 y 390×844 (los cambios de
    `will-change` se listan, no fallan); a 390×844 con reduced-motion, `getComputedStyle`
    de `[data-faro-shift]` y `[data-capa]` da `will-change: auto`. *(judgment · medium)*

29. **Aliados a `next/image`**: `src/config/aliados.ts` gana `width`/`height` medidos de
    `public/aliados/*` (el SVG con su viewBox); Footer y DatosDuros usan `<Image>` con
    `style={{ height: "auto" }}` y sus clases de alto por contexto; el SVG queda como está
    (si Next no lo sirviera sin optimizar, `unoptimized` en esa entrada); caen los dos
    `eslint-disable`.
    Aceptación: `GATES`; `RD src nextjs-no-img-element` → 6 restantes (los del perfil);
    `curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/_next/image?url=%2Faliados%2Funesco.png&w=1920&q=75"`
    → 200; diff SSR limitado a los `<img>` de aliados; captura del footer y de DatosDuros
    antes/después. *(mechanical · medium)*

30. **Perfil a `next/image`** (6): `Profile` gana `cutoutSize: { width, height }` en
    `data/equipo.ts` con medidas reales; `marco` ×3 con `fill` + `sizes`; `recorte` ×3
    con `width`/`height` y `style` de alto; `portraitImgRef` y el listener de `load` pasan
    al `onLoad` de `<Image>`; `medirDestino` del overlay sigue midiendo la `<img>` interna;
    caen los seis `eslint-disable`.
    Aceptación: `GATES`; `RD src nextjs-no-img-element`; `PROBE perfil-inmersivo` y `PROBE
    perfil-shell`; probe FLIP: tras abrir, el mover del retrato termina en transform
    identidad y el retrato mide ancho > 0. *(judgment · high)*

31. **PaisDropdown**: `onClick`, `onMouseEnter` y clases al `<li role="option">`; el
    `<button>` interno se va; `ref`, `role`, `aria-selected` se conservan.
    Aceptación: `GATES`; `RD src/features/contacto html-no-nested-interactive`; `PROBE
    pais-dropdown` (abrir, ArrowDown ×2 + Enter elige la segunda opción; click en una
    opción la elige; `[role=option]` cuenta igual que antes → `true`).
    *(mechanical · medium)*

32. **IndicePagina, píldoras como botón**: el `<span onClick>` de cada píldora pasa a
    `<button type="button" tabIndex={-1}>` con las mismas clases (más el reset de borde,
    fondo y alineación del agente); el ref pasa a `HTMLButtonElement`.
    Aceptación: `GATES`; `RD src/components click-events-have-key-events
    no-static-element-interactions`; diff SSR de las 8 rutas limitado a ese elemento;
    `PROBE indice-pildora` (hover sintético sobre una marca → la píldora se acerca; click
    → `scrollY` cambia; `document.querySelectorAll('[aria-hidden="true"] button[tabindex="-1"]').length` = cantidad de secciones → `true`). *(mechanical · low)*

33. **MobileNav a `<dialog>`**: `showModal()` al abrir; `onCancel` con `preventDefault` que
    reproduce la timeline en reversa; `close()` en `onReverseComplete`; fuera `aria-modal` y
    el listener de Escape; `useLockScroll` se conserva.
    Aceptación: `GATES`; `RD src/components prefer-html-dialog`; `PROBE menu-mobile` (SPEC
    §6.9a → `true`, a 390×844 con Playwright); captura del menú abierto. *(judgment · high)*

34. **TeamProfileOverlay a `<dialog>`**: el root pasa a `<dialog>` con `showModal()` en la
    misma fase layout, después del portal y antes del foco; caen el loop de
    `inert`/`aria-hidden` y la trampa de Tab; reset de estilos de agente (margin, padding,
    border, max-width, max-height, background) para el full-bleed; `onCancel` intercepta
    Escape hacia `requestClose` y la rama Escape del listener de `window` se va en el
    mismo commit; `close()` dentro de `finish`; el `<dialog>` lleva `data-profile-scroller`,
    `data-lenis-prevent`, `overflow-y-auto`, `overscroll-contain` y no recibe `transform`,
    `filter` ni `will-change`; `useLockScroll` se conserva.
    Aceptación: `GATES`; `RD src prefer-html-dialog`; `PROBE perfil-inmersivo` y `PROBE
    perfil-shell` (SPEC §6.9b → `true`, incluye `[inert]` = 0, `scrollY` ±1 y que el
    índice lateral se esconde con el perfil abierto); capturas de las dos variantes
    abiertas. *(judgment · high)*

35. **Buscador de biblioteca**: `<div role="search">`; Enter en el input y click en el botón
    (`type="button"`) hacen el mismo `scrollIntoView` a `#materiales`; sin `<form>` ni
    `preventDefault`.
    Aceptación: `GATES`; `RD src/features/biblioteca no-prevent-default`; `PROBE buscador`
    (foco en el input + Enter → `scrollY` ≈ top de `#materiales` ±2; click → igual →
    `true`). *(mechanical · low)*

36. **Documentación viva**: entrada en `docs/AI_GUIDELINES.md` §11 (la coreografía es dueña
    del `will-change`) y §2 (subcarpeta cuando un componente se parte en tres o más piezas).
    Aceptación: `grep -c "will-change" docs/AI_GUIDELINES.md` ≥ 1 y `grep -c "subcarpeta"
    docs/AI_GUIDELINES.md` ≥ 1. *(mechanical · low)*

Después del paso 36: work-verify corre el DoD completo (SPEC §6 + §0.1), incluido `pnpm
build`, react-doctor 100/100, texto visible intacto, `feature_list.json` y la review de 4
seats; work-handoff cierra la lane y pide el OK para push y PR.
