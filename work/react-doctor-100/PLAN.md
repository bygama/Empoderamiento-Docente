# PLAN — react-doctor-100

Tier L · rama `refactor/react-doctor-100` · checkout actual · SPEC aprobado el 2026-09-08.
Cada paso es un commit (Conventional, español, imperativo, `docs/COMMITS.md`); un paso
`[batch]` que cruza features se commitea por scope (ver DECISIONS). El cierre (DoD §6 del
SPEC + review de 4 seats) lo corre work-verify una sola vez después del último paso; no es
un paso de este plan. Marca de riesgo por costo de rehacer, no por tamaño.

Comandos que se repiten (abreviados en las aceptaciones):

- `GATES` = `pnpm typecheck && pnpm lint` → exit 0.
- `RD <ruta…>` = `pnpm dlx react-doctor --no-supply-chain --json <ruta…>` y contar
  diagnósticos por regla con node sobre el JSON (`rd-count.mjs` en el scratchpad).
- `SSR <ruta…>` = `node ssr.mjs <ruta…>` (scratchpad) contra el dev server, luego `cmp`
  con el baseline de fase 0 → exit 0.
- `LINEAS <carpeta>` = `wc -l` de cada `.ts`/`.tsx` de la carpeta y su subcarpeta → todos
  ≤ 200.
- `PROBE <nombre>` = `orca eval` con el probe del scratchpad, devuelve el mismo valor que
  el baseline ±0.02 (o `true` para los probes de interacción).

## Restricciones (aplican a todos los pasos)

- Ningún archivo tocado o creado en `src/` supera las 200 líneas. Solo `.tsx` / `.ts`.
- Cero `react-doctor-disable`, cero `doctor.config.*`, cero `reactDoctor` en package.json.
  Los `eslint-disable … no-img-element` desaparecen con el paso 28-29.
- Sin `any`; imports por `@/`; comentarios en español con el porqué; los comentarios que
  documentan regresiones viajan con el código.
- Colores por token: la cuenta de `#[0-9a-fA-F]{6}` en `src/` no sube respecto de `main`.
- Copy intacto; ningún cambio de fase de efecto (layout effect sigue siendo layout effect,
  en la misma posición).
- Fase 1 (pasos 1-25): SSR de las rutas afectadas idéntico al baseline. Fase 2 (26-34): el
  diff SSR se limita a los atributos que toca el paso; el texto visible no cambia.
- Dev server en una terminal propia de Orca; navegador embebido de Orca con las mañas de
  `orca-browser-verification-quirks`. Nunca un proceso largo como shell de fondo.
- Contratos DOM que no se mueven: SPEC §3.3, último punto de la receta.

## Fase 0

0. **Baseline y arnés** (sin commit; evidencia en PROGRESS). Levantar `pnpm dev` en una
   terminal de Orca. Escribir en el scratchpad `ssr.mjs` (fetch de ruta → `<body>` sin
   `<script>`, sin `<link rel="preload">` ni stylesheet con hash → archivo), `rd-count.mjs`
   (cuenta por regla del JSON de react-doctor) y los probes de SPEC §7.2. Validar el arnés:
   cada una de las 8 rutas pedida dos veces → `cmp` exit 0 (si no, ajustar la normalización
   y anotarlo en DECISIONS). Guardar los 8 baselines, las capturas y los valores de probe a
   1536×850 y 390×844.
   Aceptación: `ls baseline/` muestra 8 `.html`, un `probes.json` con todos los estados de
   §7.2 y sus PNG; `cmp` de la doble toma → exit 0 en las 8 rutas; `node -v` anotado.
   *(judgment · high)*

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
   Aceptación: `GATES`; `RD src` → `only-export-components` = 0; `SSR /investigacion
   /que-hacemos /quienes-somos`. *(mechanical · low)*

2. `[batch]` **Hoists a módulo** (7): `irAlListado` y `flechaClase` (CategoriasRail),
   `irASeccion` (FichaNovedad), `hoverFine` (LanzamientosRecientes), `irALineas` con su
   comentario del `+4px` (QueHacemosHeroFaro), `verdeSobreAzul` con su comentario de
   contraste (NovedadDestacada), `offsets` (profileParts, como `OFFSETS_MAPA`). Commits por
   scope: biblioteca, novedades, que-hacemos, quienes-somos.
   Aceptación: `GATES`; `RD src` → `prefer-module-scope-pure-function` = 0 y
   `prefer-module-scope-static-value` = 0; `SSR /biblioteca /novedades
   /novedades/libro-socioepistemologia /que-hacemos /quienes-somos`. *(mechanical · low)*

3. `[batch]` **Keys de texto e iteraciones combinadas** (12 + 2): `parrafo` (FichaNovedad),
   palabras de OrigenEd hoisteadas a `PALABRAS_REMATE` con `key={w}`, `part`
   (ImmersiveProfile), `m.title` ×6, `${b.place}-${b.period}` (branches), `t` (tags),
   `p.title` (publicaciones) en profileParts; `for…of` en `generateStaticParams` y un
   `flatMap`/`for…of` para `passedIds` (ImmersiveProfile). Commits por scope: novedades,
   quienes-somos.
   Aceptación: `GATES`; `RD src` → `no-array-index-as-key` = 0 y `js-combine-iterations`
   = 0; `SSR /novedades/libro-socioepistemologia /quienes-somos`. *(mechanical · low)*

4. **Helpers de viewport y guard SSR**: nuevo `src/lib/viewport.ts` exportando
   `altoViewport(): number` (`window.innerHeight`) y `anchoDocumento(): number`
   (`document.documentElement.clientWidth`), usados por los lectores diferidos de
   DestacadosBiblioteca (`S`) y MiradaEd (`W`, `H`) sin cambiar cuándo se leen; en
   FichaNovedad el initializer de `useState` pasa a `typeof window === "undefined" ?
   false : …`. Commits: lib+biblioteca+quienes-somos (un cambio lógico: el helper y sus
   consumidores), novedades.
   Aceptación: `GATES`; `RD src` → `no-unguarded-browser-global-in-render-or-hook-init`
   = 0; `SSR /biblioteca /quienes-somos /novedades/libro-socioepistemologia`; `PROBE
   mirada-1` y `PROBE destacados-1`. *(mechanical · low)*

5. **Reseteo de refs en render (TorreLineas)**: borrar las cinco líneas 693-697; sembrar
   `spanRefs` y `chipRefs` en el `useRef` con `TAMBORES.map(() => [])`.
   Aceptación: `GATES`; `RD src/features/que-hacemos` → `no-ref-current-in-render` = 0;
   `SSR /que-hacemos`; `PROBE torre-1` y `PROBE torre-2`. *(mechanical · medium)*

6. **`useEffectEvent` en CasosInvestigacion**: los handlers de Escape y `popstate` pasan a
   `useEffectEvent`; caen `solicitarCierre`/`cerrar` como `useCallback` encadenados y las
   lecturas por ref del estado que solo existían para eso; las deps de los efectos quedan
   en `[activo]` y `[activo, estado]`.
   Aceptación: `GATES`; `RD src/features/investigacion` → `prefer-use-effect-event` = 0;
   `SSR /investigacion`; `PROBE casos-interaccion` (abrir, cambiar, Escape, Back → `true`).
   *(judgment · high)*

7. **`useMouseParallax`** en `src/lib/hooks/useMouseParallax.ts`: `useMouseParallax(ref,
   { x: "--pnx", y: "--pny", ease: 0.09, activo: boolean })` con el mismo RAF + lerp que
   hoy en Hero (311-335) y QueHacemosHero (113-147); Hero usa `--pnx/--pny`, QueHacemosHero
   `--qhx/--qhy`. El hook, además, es quien pone `willChange: "transform"` en
   `[data-card-mouse]` solo con puntero fino (lo consume el paso 27).
   Aceptación: `GATES`; `SSR / /que-hacemos`; `PROBE hero-mouse` y `PROBE qh-mouse`
   (mousemove sintético → las custom props cambian de 0). *(integration · medium)*

8. **`acople-lamina.ts`** en `quienes-somos/components/`: `acoplarLamina(root: HTMLElement)`
   crea el `fromTo` `scale 0.97 → 1`, `y 36 → 0`, `scrub: true`, `start "top 96%"`, `end
   "top 14%"`, con el `gsap.set` previo del `transformOrigin` y su comentario; lo usan
   RedEd, MiradaEd y OrigenEd dentro de sus contextos actuales.
   Aceptación: `GATES`; `SSR /quienes-somos`; `PROBE red-1`, `PROBE mirada-1`, `PROBE
   origen-1`. *(integration · medium)*

9. **`src/config/aliados.ts`**: `ALIADOS: ReadonlyArray<{ id, src, alt, width, height }>`
   con las dimensiones medidas de `public/aliados/*` (el SVG con su viewBox); Footer y
   DatosDuros lo consumen y conservan cada uno su mapa local de clases de alto (`h-7`…).
   Sin `next/image` todavía (paso 28).
   Aceptación: `GATES`; `SSR` de las 8 rutas. *(mechanical · low)*

10. **Split #1 ComoTrabajamos** (`home/components/como-trabajamos/`): `data.ts` de home
    con `PASOS`, `coreografia-metodo.ts` (`crearMetodo(root, { reduced })` → cleanup),
    `PasoMetodo.tsx`, `IndicadorPasos.tsx`; el compositor queda en su ruta.
    Aceptación: `GATES`; `RD src/features/home` → `no-giant-component` no lista
    ComoTrabajamos; `LINEAS src/features/home/components`; `SSR /`; `PROBE metodo-1`.
    *(judgment · medium)*

11. **Split #2 Hero** (`home/components/hero/`): `hero-cards.ts`, `coreografia-hero.ts`
    (`crearEntradaHero(scope, opciones)` llamado desde el layout effect del compositor,
    porque mide `getBoundingClientRect` pre-paint), `CampoCards.tsx`, `CampoCardsMobile.tsx`,
    `HeroCopy.tsx`; el parallax de mouse ya es el hook del paso 7.
    Aceptación: `GATES`; `RD src/features/home` → sin Hero en `no-giant-component`;
    `LINEAS`; `SSR /`; `PROBE hero-1` (1536×850) y `PROBE hero-mobile` (390×844).
    *(judgment · medium)*

12. **Split #3 QueHacemosHero** (`que-hacemos/components/que-hacemos-hero/`): `polvo.ts`,
    `coreografia-hero-qh.ts`, `estrella-fugaz.ts`, `capsula-magnetismo.ts`,
    `portal-viaje.ts` (importa `DURACION_RECORRIDO` de `tiempos-faro.ts`),
    `CapsulaPortal.tsx`, `CieloPolvo.tsx`; cinco efectos independientes, cada uno con su
    cleanup.
    Aceptación: `GATES`; `RD src/features/que-hacemos` → sin QueHacemosHero; `LINEAS`;
    `SSR /que-hacemos`; `PROBE qh-hero-1`; `PROBE qh-portal` (hold sintético → viaje
    arranca: `scrollY` crece). *(judgment · medium)*

13. **Split #4 NivelesEscala** (`que-hacemos/components/niveles-escala/`):
    `coreografia-niveles.ts` (constantes de tiempo, `POS`, `LAZO` y el `run()` gateado por
    `document.fonts.ready`, devolviendo cleanup), `LazoViajero.tsx`, `NivelCard.tsx` con
    `[data-collapse]`/`[data-collapse-icon]` byte-idénticos.
    Aceptación: `GATES`; `RD src/features/que-hacemos` → sin NivelesEscala; `LINEAS`;
    `SSR /que-hacemos`; `PROBE niveles-1`. *(judgment · medium)*

14. **Split #5 LineasAccion** (`home/components/lineas-accion/`): `AREAS` a `home/data.ts`,
    `coreografia-abanico.ts`, `tilt-cartas.ts` (devuelve su propio cleanup),
    `CartaArea.tsx` con `<li data-deck-card>` como raíz medible.
    Aceptación: `GATES`; `RD src/features/home` → sin LineasAccion; `LINEAS`; `SSR /`;
    `PROBE lineas-1` (1536×850) y `PROBE lineas-stack` (390×844). *(judgment · medium)*

15. **Split #6 DestacadosBiblioteca** (`biblioteca/components/destacados/`): `ITEMS` a
    `data/materiales.ts`, `coreografia-destacados.ts` (recibe `{ root, row, slot, artsWrap,
    items, setActivo }`), `IntroDestacados.tsx`, `IndiceDestacados.tsx`,
    `ArticuloDestacado.tsx` con callback-refs `refItem`/`refSlot`.
    Aceptación: `GATES`; `RD src/features/biblioteca` → sin DestacadosBiblioteca; `LINEAS`;
    `SSR /biblioteca`; `PROBE destacados-1`. *(judgment · medium)*

16. **Split #7 RedEd** (`quienes-somos/components/red/`): `red-datos.ts`,
    `coreografia-red.ts` (dibujo + deriva), `vuelo-fotos.ts`, `GrafoRed.tsx`,
    `DockEspecialidad.tsx`; usa `acoplarLamina` del paso 8.
    Aceptación: `GATES`; `RD src/features/quienes-somos` → sin RedEd; `LINEAS`; `SSR
    /quienes-somos`; `PROBE red-1`; `PROBE red-hover` (hover sintético en una
    especialidad → `[data-dock-av]` visibles > 0). *(judgment · high)*

17. **Split #8 MiradaEd** (`quienes-somos/components/mirada/`): `constelacion-mirada.ts`
    (geometría y `PERSPECTIVAS`), `setup-estados.ts` (posicionamiento imperativo inicial,
    documentado como dueño de la posición de las fichas), `timeline-fases.ts`,
    `MapaConstelacion.tsx`, `DetallePerspectiva.tsx`, `FichasPerspectiva.tsx`,
    `SintesisMirada.tsx`, `IndicadorFases.tsx`.
    Aceptación: `GATES`; `RD src/features/quienes-somos` → sin MiradaEd; `LINEAS`; `SSR
    /quienes-somos`; `PROBE mirada-1` y `PROBE mirada-2`. *(judgment · high)*

18. **Split #9 OrigenEd** (`quienes-somos/components/origen/`): `data.ts`, `estilos.ts`,
    `Pilar.tsx`, `coreografia-origen.ts`, `panel-fotos.ts`, `PanelFotos.tsx`,
    `TrayectoriaHorizontal.tsx`, `TrayectoriaVertical.tsx`, `BeatRemate.tsx`; los cinco
    beats siguen siendo hijos directos de `[data-story-tilt]`.
    Aceptación: `GATES`; `RD src/features/quienes-somos` → sin OrigenEd; `LINEAS`; `SSR
    /quienes-somos`; `PROBE origen-1` y `PROBE origen-2`. *(judgment · high)*

19. **Split #10 ExpedienteCaso** (`investigacion/casos/expediente/`):
    `RotuloExpediente.tsx`, `coreografia-expediente.ts` (reveals + asentado + sello +
    parallax), `CabeceraExpediente.tsx`, `HojaInforme.tsx` (con `[data-exp-hoja]` sin
    cambiar de lugar ni clases), `CartonExpediente.tsx`, `BandaSiguiente.tsx`,
    `PestanasLaterales.tsx`; `article[data-exp-lugar] > … > cuerpo` intacto.
    Aceptación: `GATES`; `RD src/features/investigacion` → sin ExpedienteCaso; `LINEAS`;
    `SSR /investigacion`; `PROBE caso-abierto`. *(judgment · high)*

20. **Split #11 TeamProfileOverlay** (`quienes-somos/components/overlay/`):
    `usePortalModal.ts` (portal + guardado/restauración de scroll en un solo bloque, en fase
    layout), `coreografia-overlay.ts` (`abrir()`/`cerrar()` para las dos variantes),
    `useFocusTrap.ts` (queda hasta el paso 32, que lo elimina con `<dialog>`),
    `PerfilShell.tsx` con callback-ref del hero.
    Aceptación: `GATES`; `RD src/features/quienes-somos` → sin TeamProfileOverlay;
    `LINEAS`; `SSR /quienes-somos`; `PROBE perfil-inmersivo` y `PROBE perfil-shell`
    (abrir: foco en «volver», hero con ancho > 0; cerrar: `scrollY` previo ±1).
    *(judgment · high)*

21. **Split #12 ContactoExperiencia** (`contacto/components/experiencia/`): `data.ts`,
    `estilos.ts`, `coreografia-intro.ts` (entrada + `desarmar` + `saltarIntro`),
    `coreografia-paneles.ts` (`elegirTema`, `cambiarTema`, `enviar`, `otraConsulta`),
    `PanelHero.tsx`, `ColumnaIdentidad.tsx`, `IndiceTemas.tsx` (devuelve el elemento
    clickeado por callback), `RailTema.tsx`, `CamposContacto.tsx`, `PanelCierre.tsx`; las
    clases tipográficas de `[data-hero-titulo]` y `[data-ap-titulo]` viven en una sola
    constante de `estilos.ts` para que el ghost siga aterrizando.
    Aceptación: `GATES`; `RD src/features/contacto` → sin ContactoExperiencia; `LINEAS`;
    `SSR /contacto`; `PROBE contacto-intro` y `PROBE contacto-tema` (elegir un tema → el
    formulario queda visible). *(judgment · high)*

22. **Split #13 CasosInvestigacion** (`investigacion/casos/maquina/`), por hook:
    `useLugarExpediente.ts` (historial + scroll lock + Escape + popstate, devuelve un objeto
    máquina con sus refs), `useEntradaIndice.ts`, `useTransicionesExpediente.ts` (opening /
    switching / closing, en el mismo orden y fase que hoy); el compositor conserva el JSX y
    el cableado.
    Aceptación: `GATES`; `RD src/features/investigacion` → sin CasosInvestigacion;
    `LINEAS`; `SSR /investigacion`; `PROBE casos-interaccion`. *(judgment · high)*

23. **Split #14 QueHacemosHeroFaro** (`que-hacemos/components/hero-faro/`):
    `camara-faro.ts` (`crearCamara` → `{ cam, entrada, capas, aplicar }`), `haz-faro.ts`
    (`crearHaces` → `{ girar, setTimeline }`, único dueño de `rotation`),
    `coreografia-faro.ts` (S0-S5 y el hook `#qa=`), `PreguntasFaro.tsx`, `CierreFaro.tsx`;
    los tres comentarios de regresión viajan con su código.
    Aceptación: `GATES`; `RD src/features/que-hacemos` → sin QueHacemosHeroFaro; `LINEAS`;
    `SSR /que-hacemos`; `PROBE faro-1` y `PROBE faro-2` (progreso, opacidad del haz,
    rotación del haz). *(judgment · high)*

24. **Split #15 ImmersiveProfile** (`quienes-somos/components/profile/inmersivo/`):
    `camino.ts`, `viaje-nombre.ts` (recibe un bundle de refs), `camino-maestro.ts`,
    `etapas.ts`, `apertura-perfil.ts`, `PerfilLineal.tsx` (rama reduced-motion),
    `FiguraPerfil.tsx` (las tres apariciones de la figura), `IdentidadFija.tsx`,
    `IndiceVivo.tsx`, `HeroPerfil.tsx` (el clon del nombre en flujo con sus `clamp()`),
    `RecorridoEtapas.tsx`, `CierrePerfil.tsx`.
    Aceptación: `GATES`; `RD src/features/quienes-somos` → sin ImmersiveProfile en
    `no-giant-component` ni en `no-high-complexity-react-function`; `LINEAS`; `SSR
    /quienes-somos`; `PROBE perfil-inmersivo`; con `prefers-reduced-motion: reduce` el
    perfil renderiza la rama lineal (`[data-perfil-lineal]` presente). *(judgment · high)*

25. **Split #16 TorreLineas** (`que-hacemos/components/torre/`): `geometria-torre.ts` (puro),
    `armado-torre.ts` (proxy de build, `armar`/`rebobinar`/`completar`, bloqueo de scroll; el
    build timeline sigue naciendo fuera del contexto y matándose a mano), `pintar-torre.ts`
    (factory `crearPintor(refs)` dueña de `ocultos`/`activo`/`fijado`), `RielEstaciones.tsx`,
    `RielProgreso.tsx`, `TamborTorre.tsx`, `FotoTambor.tsx`, `ApoyoTorre.tsx`,
    `FallbackTorre.tsx`; un bundle de refs creado por el compositor.
    Aceptación: `GATES`; `RD src/features/que-hacemos` → sin TorreLineas; `LINEAS`; `SSR
    /que-hacemos`; `PROBE torre-1` y `PROBE torre-2`; `PROBE torre-mobile` (390×844: el
    fallback plano renderiza). *(judgment · high)*

## Fase 2 — cambios de comportamiento (capturas y probes)

26. `[batch]` **`transition-all` y `scale-x`** (13 + NavegacionCasos:42 + CtaButton):
    propiedades explícitas según la tabla de `relevamiento-performance.md` §2;
    `scale-x-0` → `scale-x-[0.01]`. Commits por scope: ui, contacto, home, investigacion,
    que-hacemos.
    Aceptación: `GATES`; `RD src` → `no-transition-all` = 0 y `no-scale-from-zero` = 0;
    diff SSR de las 8 rutas limitado a tokens `transition-*` / `scale-x-*` (script del
    scratchpad que los borra de ambos lados y compara → exit 0). *(mechanical · low)*

27. `[batch]` **`will-change`** (32): los 19 de «quitar» se borran de clase/`style`; los 13
    de «la coreografía es dueña» se ponen con `gsap.set(..., { willChange })` al arrancar y
    se limpian al salir (`clearProps` / `onComplete` / cleanup); FaroEscena `[data-faro-shift]`
    entra al `gsap.set` existente de `camara-faro.ts`; Hero `[data-card-mouse]` lo maneja el
    hook del paso 7; OrigenEd `[data-story-tilt]` se borra (`preserve-3d` ya promueve).
    Commits por scope.
    Aceptación: `GATES`; `RD src` → `no-permanent-will-change` = 0; diff SSR limitado a
    tokens `will-change-*` y `will-change:`; todos los `PROBE` de §7.2 iguales al baseline
    ±0.02; en 390×844 con reduced-motion, `getComputedStyle` de `[data-faro-shift]` y
    `[data-capa]` da `will-change: auto`. *(judgment · medium)*

28. **Aliados a `next/image`**: Footer y DatosDuros usan `<Image>` con `width`/`height` de
    `src/config/aliados.ts` y `style={{ height: "auto" }}`; el SVG queda como está (si Next
    no lo sirviera sin optimizar, `unoptimized` en esa entrada); caen los dos
    `eslint-disable`.
    Aceptación: `GATES`; `RD src` → `nextjs-no-img-element` = 6; `curl -s -o /dev/null -w
    "%{http_code}" "http://localhost:<puerto>/_next/image?url=%2Faliados%2Ftechint.png&w=1920&q=75"`
    → 200; diff SSR limitado al `<img>` de los aliados; captura del footer y de DatosDuros
    antes/después. *(mechanical · medium)*

29. **Perfil a `next/image`** (6): `Profile.cutout` pasa a `{ src, width, height }` (o campo
    hermano `cutoutSize`) en `data/equipo.ts` con medidas reales; `marco` ×3 con `fill` +
    `sizes`; `recorte` ×3 con `width`/`height` y `style` de alto; `portraitImgRef` y el
    listener de `load` pasan al `onLoad` de `<Image>`; caen los seis `eslint-disable`.
    Aceptación: `GATES`; `RD src` → `nextjs-no-img-element` = 0; `PROBE perfil-inmersivo` y
    `PROBE perfil-shell`; probe FLIP: tras abrir, el mover del retrato termina en transform
    identidad y el retrato mide ancho > 0. *(judgment · high)*

30. **PaisDropdown**: `onClick`, `onMouseEnter` y clases al `<li role="option">`; el
    `<button>` interno se va; `ref`, `role`, `aria-selected` se conservan.
    Aceptación: `GATES`; `RD src/features/contacto` → `html-no-nested-interactive` = 0;
    `PROBE pais-dropdown` (abrir, ArrowDown ×2 + Enter elige la segunda opción; click en una
    opción la elige; `[role=option]` cuenta igual que antes → `true`). *(mechanical · medium)*

31. **MobileNav a `<dialog>`**: `showModal()` al abrir; `onCancel` con `preventDefault` que
    reproduce la timeline en reversa; `close()` en `onReverseComplete`; fuera `aria-modal` y
    el listener de Escape; `useLockScroll` se conserva.
    Aceptación: `GATES`; `RD src/components` → `prefer-html-dialog` = 0 para MobileNav;
    `PROBE menu-mobile` (SPEC §6.9a → `true`); captura del menú abierto a 390×844.
    *(judgment · high)*

32. **TeamProfileOverlay a `<dialog>`**: `showModal()` en la misma fase layout; caen el loop
    de `inert`/`aria-hidden` y `useFocusTrap`; reset de estilos de agente del `<dialog>`
    (margin, padding, border, max-width, max-height, background) para el full-bleed;
    `onCancel` intercepta Escape hacia `requestClose`; `close()` dentro del `onComplete`
    existente; `data-profile-scroller` y `data-lenis-prevent` siguen en el scroller.
    Aceptación: `GATES`; `RD src` → `prefer-html-dialog` = 0; `PROBE perfil-inmersivo` y
    `PROBE perfil-shell` (SPEC §6.9b → `true`, incluye `[inert]` = 0 y `scrollY` ±1);
    capturas de las dos variantes abiertas. *(judgment · high)*

33. **Buscador de biblioteca**: `<div role="search">`; Enter en el input y click en el botón
    (`type="button"`) hacen el mismo `scrollIntoView` a `#materiales`; sin `<form>` ni
    `preventDefault`.
    Aceptación: `GATES`; `RD src/features/biblioteca` → `no-prevent-default` = 0; `PROBE
    buscador` (foco en el input + Enter → `scrollY` ≈ top de `#materiales` ±2; click → igual
    → `true`). *(mechanical · low)*

34. **Documentación viva**: entrada en `docs/AI_GUIDELINES.md` §11 (la coreografía es dueña
    del `will-change`) y §2 (subcarpeta cuando un componente se parte en tres o más piezas).
    Aceptación: `grep -c "will-change" docs/AI_GUIDELINES.md` ≥ 1 y `grep -c "subcarpeta"
    docs/AI_GUIDELINES.md` ≥ 1. *(mechanical · low)*

Después del paso 34: work-verify corre el DoD completo (SPEC §6), incluido `pnpm build`,
react-doctor 100/100, texto visible intacto, `feature_list.json` y la review de 4 seats;
work-handoff cierra la lane y pide el OK para push y PR.
