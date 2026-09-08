# SPEC — React Doctor a 100/100

Lane: `work/react-doctor-100/` · Tier: L · Rama: `refactor/react-doctor-100` · Checkout actual
Origen: shaping del 2026-09-08 con el owner, diseño aprobado en conversación (cuatro
secciones, una por una). Corre acá, en este checkout, por decisión del owner: lo hace
el agente de a poco y los reviewers salen al final.

Relevamientos de partida (lectura completa del código, un agente por familia), copiados
en esta carpeta: `relevamiento-bugs.md`, `relevamiento-performance.md`,
`relevamiento-gigantes.md`. Diagnóstico inicial en `react-doctor-baseline.json`
(`pnpm dlx react-doctor --no-supply-chain --json src`).

## 0. Enmienda del 2026-09-08 (aprobada por el owner en conversación)

Motivo: al abrir la fase 0 apareció la lane `bygama/gar` (worktree de Orca, en vuelo)
con 64 archivos de `src/` solapados con esta. Decisión del owner: esta lane se rebasea
sobre gar y gar mergea primero (ver DECISIONS). Lo que cambia respecto de §1-§7:

1. **Base y baseline.** Rama sobre `bygama/gar`. Baseline: **57/100, 126 hallazgos, 44
   archivos** (`react-doctor-baseline.json`; el de `main` en
   `react-doctor-baseline-main.json`). Delta detallado en `relevamiento-delta.md`.
   DoD nueva (6.14): `grep -rn "transition-all" src` → 0 líneas, porque react-doctor no
   lee `className` con template literal (CarpetaCaso 376 y 408, NavegacionCasos 46 son
   sitios reales que el reporte no muestra).
2. **Gigantes.** LineasAccion sale de la lista (gar la bajó del umbral). Entran
   `components/layout/IndicePagina.tsx` (372 líneas: el imán del índice a
   `src/lib/hooks/useImanIndice.ts`, el botón de subir a pieza propia) y
   `investigacion/casos/CarpetaCaso.tsx` (436: la tapa a `TapaCarpeta.tsx`, que se
   lleva también la alta complejidad). Siguen siendo 17.
3. **IndicePagina:335** (`<span onClick>` dentro de una capa `aria-hidden`; dos
   hallazgos): pasa a `<button type="button" tabIndex={-1}>` con las mismas clases;
   `ir` se hoistea a módulo.
4. **TeamProfileOverlay** (598 líneas). Antes del split, un commit propio borra el camino
   muerto de `figura: "recorte"` (~60 líneas) y **borra `cutoutCrop` del tipo
   `Profile`** (declarado sin datos ni consumidor). La foto viajera pasa de `<img>`
   clonado a `<div>` con `background-image: url(currentSrc)` y `background-size:
   cover` (mismo efecto y misma caché, sin `<img>`, sin supresión). Sus dos
   `will-change`: el de la viajera se borra (propiedades de layout), el del hero shell lo
   pone y saca GSAP. En el split no se extrae `useFocusTrap`: el teclado queda en el
   compositor y el `<dialog>` lo reemplaza entero.
5. **Restricciones del `<dialog>` del overlay:** el `<dialog>` no recibe `transform`,
   `filter` ni `will-change` (crearían bloque contenedor para los `fixed` de adentro);
   es él mismo quien lleva `data-profile-scroller`, `data-lenis-prevent`,
   `overflow-y-auto` y `overscroll-contain`; `useLockScroll` se conserva aunque el
   `<dialog>` haga la página inerte (IndicePagina detecta overlays leyendo
   `body.style.overflow`); sacar la rama Escape del listener de `window` y agregar
   `onCancel` van en el mismo commit; el foco a «volver» se pone después de
   `showModal()`.
6. **Contratos que trajo gar y el split respeta:** `abrirRef` y el efecto de deep link
   (`location.hash`) en CasosInvestigacion; `data-scroll-principal`, `data-exp-pestana`
   y `useCopiar` en ExpedienteCaso; el efecto de `?tema=` de ContactoExperiencia corre
   un frame después del montaje y llama `finIntro()`; NavegacionCasos no cambia de forma.
7. **Aliados:** `src/config/aliados.ts` ya existe (lo creó gar; Footer y DatosDuros lo
   consumen con `alto.pie` / `alto.home`). El paso pasa a sumar `width`/`height` ahí
   y a convertir los dos `<img>` a `next/image`.
8. **Instrumento de probes (§7.2):** los estados congelados se miden con Playwright
   (viewport fijo antes de hidratar; emulación táctil real para 390×844; contexto nuevo
   por pasada); el navegador embebido de Orca queda para interacciones y capturas.
   Baseline tomado: 8 rutas × 6 fracciones a 1536×850 y 8 × 4 a 390×844, más una
   captura del tope de cada ruta en cada viewport. Los atributos que derivan solos
   (animación perpetua) se excluyen de la comparación por lista explícita, obtenida de
   una doble pasada del baseline contra sí mismo.

## 1. Propósito

`pnpm react-doctor` (react-doctor 0.9.13 sobre `src/`) da hoy **58/100 (Critical)**: 120
hallazgos en 43 archivos (9 errores, 111 warnings). El puntaje lo calcula la API de
react.doctor a partir de la lista de diagnósticos, así que 100 significa **cero
hallazgos**. La lane deja el sitio en 100/100 **solo con cambios de código**: ninguna
regla apagada, ninguna supresión en línea, sin `doctor.config.*`, sin `reactDoctor` en
`package.json`. Los falsos positivos se resuelven con código equivalente que la regla
acepta.

De paso se saldan deudas que el propio repo ya nombra: componentes de 400 a 1100 líneas
(AGENTS.md §6 pide < 150 y §8 marca > 200 como anti-patrón), `will-change` permanentes
que contradicen comentarios del propio código, `ALIADOS` duplicado, y el parallax de
mouse repetido byte a byte en dos heros.

## 2. Alcance

Dentro:

- Las 17 reglas con hallazgos, todas a cero (tabla en §3.4).
- Partir los 16 componentes gigantes según la receta de §3.3.
- Tres deduplicaciones: `useMouseParallax`, `acople-lamina`, `src/config/aliados.ts`.
- Migrar los dos modales (`MobileNav`, `TeamProfileOverlay`) a `<dialog>` nativo.
- Nota corta en `docs/AI_GUIDELINES.md` con las dos convenciones nuevas.
- Lane completa de tier L: SPEC, PLAN, PROGRESS, DECISIONS y `feature_list.json`.

Fuera:

- Cualquier cambio visible de diseño o de copy. Ningún texto, color, espaciado ni
  tipografía cambia.
- Cablear de verdad el buscador de biblioteca (hoy descarta lo tipeado; se avisa al
  owner, no se arregla acá).
- Rediseñar las dos transiciones que animan `width` (QueHacemosHero, TorreLineas):
  se nombran las propiedades, no se cambia el mecanismo.
- `scrub: true` en las páginas que lo usan (deuda de página, no de esta lane).
- Meta-docs (`AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, etc.): no se tocan.

## 3. Diseño aprobado

### 3.1 Fases y orden

- **Fase 0, baseline.** Sin commit. Dev server en una terminal propia de Orca. Se
  guarda en el scratchpad de la sesión (ruta anotada en PROGRESS):
  (a) el HTML server-side normalizado de cada ruta (§7.1), (b) capturas y probes de
  estados congelados clave (§7.2) a 1536×850 y 390×844.
- **Fase 1, refactors puros: SSR idéntico byte a byte.** En este orden, cada uno su
  commit: exports a módulos `.ts` (13) · hoists a módulo (7) · keys de texto (12) ·
  iteraciones combinadas (2) · helpers de viewport a módulo (3) y guard SSR en
  FichaNovedad (1) · reseteo de refs en TorreLineas (5) · `useEffectEvent` en
  CasosInvestigacion (2) · las tres deduplicaciones · los 16 splits, del más fácil al
  más difícil, un commit por split, paridad SSR de la página después de cada uno.
- **Fase 2, cambios de comportamiento: capturas y probes antes/después.**
  `transition-all` (13, más el adyacente de NavegacionCasos:42) y `scale-x` (1) ·
  `will-change` (32) · `<img>` a `next/image` (8) · PaisDropdown (1) · MobileNav a
  `<dialog>` · TeamProfileOverlay a `<dialog>` · buscador de biblioteca.
- **Fase 3, cierre.** Definition of done (§6), `feature_list.json` completa, ola de
  reviewers, loop de fixes acotado a dos rondas, y recién ahí PR con OK explícito del
  owner para push y PR.

Por qué este orden: los splits van antes que los cambios de comportamiento para que los
`will-change` y demás se editen en módulos ya chicos, y para que la paridad SSR se
compare contra el baseline original sin ruido.

### 3.2 Reglas de la lane

- Ningún archivo tocado o creado en `src/` supera las **200 líneas**.
- Extensiones: componentes `.tsx`, módulos de datos y coreografía `.ts`. Ningún `.jsx`
  ni `.js` nuevo.
- Sin `any`. Imports por `@/`. Comentarios en español con el porqué. Los comentarios
  que documentan regresiones ya arregladas (QueHacemosHeroFaro, FaroEscena,
  TorreLineas, TeamProfileOverlay) viajan con el código que protegen.
- Cero reglas apagadas y cero `react-doctor-disable`. También desaparecen los
  `eslint-disable-next-line @next/next/no-img-element` (las imágenes pasan a
  `next/image`).
- Colores y espaciados por token; no aparece ningún hex nuevo en `src/`.
- Copy intacto: el texto visible de cada ruta es idéntico antes y después.
- Ningún cambio de fase de efectos: lo que hoy corre en layout effect sigue en layout
  effect, en la misma posición del componente.

### 3.3 Receta de split (igual para los 16)

- **Datos y constantes** van a `data.ts` de la feature si existe, o a
  `<nombre>-datos.ts`.
- **Coreografía** va a `coreografia-<nombre>.ts`: una función `crear<Nombre>(elementos,
  opciones)` que arma el `gsap.context` (o el `matchMedia`) y devuelve la limpieza. El
  componente resuelve los elementos y la llama desde el mismo layout effect de hoy.
- **Markup** se parte en piezas `<Nombre>Xxx.tsx`. Cuando un split produce **tres o más
  archivos**, van a una **subcarpeta kebab-case** junto al componente (precedente:
  `quienes-somos/components/profile/`), y el componente original queda en su ruta como
  compositor, para no tocar a quien lo importa.
- **Refs entre piezas**: callback-ref por props (como `CarpetaCaso`). En los cuatro
  difíciles (CasosInvestigacion, QueHacemosHeroFaro, ImmersiveProfile, TorreLineas),
  un objeto de refs creado por el compositor y pasado a las piezas.
- **Contratos DOM que no se mueven** (los nombra el relevamiento de gigantes): un solo
  `[data-paso]` por paso (ComoTrabajamos); medición pre-paint desde el layout effect
  del padre (Hero); `[data-collapse]` byte-idéntico (NivelesEscala); `<li
  data-deck-card>` sin wrapper nuevo (LineasAccion); los cinco beats siguen siendo
  hermanos directos de `[data-story-tilt]` (OrigenEd); `article[data-exp-lugar] > … >
  cuerpo` (ExpedienteCaso); `[data-exp-hoja]` sin cambiar de posición ni clases (lo
  mide CasosInvestigacion); el clon del nombre queda en flujo dentro del hero con sus
  `clamp()` inline (ImmersiveProfile); `girarHaces` único dueño de `rotation`, sin
  `const` después de la timeline, `transformOrigin` hardcodeado por geometría
  (QueHacemosHeroFaro); el build timeline nace fuera del `gsap.context` y se mata a
  mano (TorreLineas).
- **Un commit por split**, Conventional en español, con cuerpo cuando el corte no es
  obvio.

Los 16, con la dificultad que estimó el relevamiento y las piezas previstas (los
nombres exactos los fija el PLAN; los cambios de nombre se anotan en DECISIONS):

| # | Componente | Líneas | Dificultad | Piezas previstas |
| --- | --- | --- | --- | --- |
| 1 | `home/ComoTrabajamos` | 381 | fácil | data, coreografía, PasoMetodo, IndicadorPasos |
| 2 | `home/Hero` | 532 | fácil | hero-cards, coreografía, useMouseParallax (compartido), CampoCards, CampoCardsMobile, HeroCopy |
| 3 | `que-hacemos/QueHacemosHero` | 586 | fácil | polvo, coreografía, estrella-fugaz, capsula-magnetismo, portal-viaje, CapsulaPortal, CieloPolvo |
| 4 | `que-hacemos/NivelesEscala` | 443 | fácil-media | coreografia-niveles (con POS/LAZO), LazoViajero, NivelCard |
| 5 | `home/LineasAccion` | 433 | fácil-media | data (compartida con #1), coreografia-abanico, tilt-cartas, CartaArea |
| 6 | `biblioteca/DestacadosBiblioteca` | 363 | fácil-media | coreografia-destacados, IntroDestacados, IndiceDestacados, ArticuloDestacado |
| 7 | `quienes-somos/RedEd` | 483 | fácil-media | red-datos, coreografia-red, vuelo-fotos, GrafoRed, DockEspecialidad, acople-lamina (compartido) |
| 8 | `quienes-somos/MiradaEd` | 867 | media | constelacion-mirada, coreografía en dos módulos, MapaConstelacion, DetallePerspectiva, FichasPerspectiva, SintesisMirada, IndicadorFases |
| 9 | `quienes-somos/OrigenEd` | 925 | media | data, estilos, Pilar, coreografia-origen, panel-fotos, PanelFotos, TrayectoriaHorizontal, TrayectoriaVertical, BeatRemate |
| 10 | `investigacion/casos/ExpedienteCaso` | 615 | media | RotuloExpediente, coreografia-expediente, CabeceraExpediente, HojaInforme, CartonExpediente, BandaSiguiente, PestanasLaterales |
| 11 | `quienes-somos/TeamProfileOverlay` | 348 | media | usePortalModal, coreografia-overlay, useFocusTrap (cae con `<dialog>`), PerfilShell |
| 12 | `contacto/ContactoExperiencia` | 1101 | media | data, estilos, coreografia-intro, coreografia-paneles, PanelHero, ColumnaIdentidad, IndiceTemas, RailTema, CamposContacto, PanelCierre |
| 13 | `investigacion/casos/CasosInvestigacion` | 514 | difícil | por hook: useLugarExpediente, useEntradaIndice, useTransicionesExpediente |
| 14 | `que-hacemos/QueHacemosHeroFaro` | 836 | difícil | tiempos-faro, camara-faro, haz-faro, coreografia-faro, PreguntasFaro, CierreFaro |
| 15 | `quienes-somos/profile/ImmersiveProfile` | 856 | difícil | camino, viaje-nombre, camino-maestro, etapas, apertura-perfil, PerfilLineal, FiguraPerfil, IdentidadFija, IndiceVivo, HeroPerfil, RecorridoEtapas, CierrePerfil |
| 16 | `que-hacemos/TorreLineas` | 1112 | difícil | geometria-torre, armado-torre, pintar-torre (factory), RielEstaciones, RielProgreso, TamborTorre, FotoTambor, ApoyoTorre, FallbackTorre |

### 3.4 Familias de hallazgos y arreglo

| Regla | Sitios | Arreglo (detalle en los relevamientos) |
| --- | --- | --- |
| `no-giant-component` | 16 | §3.3 |
| `no-permanent-will-change` | 32 | Ningún `will-change` estático en clase ni en `style`. 19 se quitan (animan una vez). 13 pasan al patrón **«la coreografía es dueña de la pista»**: `gsap.set(el, { willChange })` cuando arranca la animación (trigger de entrada, `onStart`, `onToggle` del pin, o el efecto de parallax que ya gatea por puntero fino) y limpieza al salir (`clearProps`, `onComplete`, cleanup del efecto). Efecto extra: mobile y reduced-motion dejan de pagar capas que nunca animan. Los cuatro `[data-faro-shift]` de FaroEscena se suman al `gsap.set` que ya existe en QueHacemosHeroFaro. Hero `[data-card-mouse]`: la pista la pone el hook de parallax solo con puntero fino. OrigenEd `[data-story-tilt]`: se quita (`preserve-3d` ya promueve). |
| `no-transition-all` | 13 (+1 adyacente) | Propiedades explícitas según la tabla del relevamiento (`transition-colors` donde aplica, `transition-[…]` en el resto). Se incluye `NavegacionCasos:42`, no marcado pero del mismo archivo. |
| `no-scale-from-zero` | 1 | `scale-x-0` → `scale-x-[0.01]` en CtaButton (el gesto es un barrido direccional; opacidad no lo reemplaza). |
| `nextjs-no-img-element` | 8 | `next/image`. Aliados: un solo `src/config/aliados.ts` con `width`/`height` medidos de los archivos, consumido por Footer y DatosDuros (el SVG queda tal cual: Next lo sirve sin optimizar cuando `dangerouslyAllowSVG` es falso; si no fuera así, `unoptimized` en esa entrada). Perfil: `Profile` gana las dimensiones del recorte; `marco` ×3 con `fill` + `sizes`, `recorte` ×3 con `width`/`height` intrínsecos y `style` de alto; el ref y el listener de `load` del retrato pasan al `onLoad` de `next/image`. |
| `prefer-html-dialog` | 2 | `<dialog>` nativo en ambos. MobileNav: `showModal()`, `cancel` interceptado para reproducir la timeline en reversa, `close()` en `onReverseComplete`, `aria-modal` fuera (implícito). TeamProfileOverlay: `showModal()`, se borran el loop de `inert` y la trampa de Tab, se resetean los estilos de agente del `<dialog>` para el layout full-bleed, `cancel` interceptado para la salida animada, `close()` en el `onComplete` existente; conserva FLIP, clip-path y la restauración de scroll en tres tiempos. |
| `no-prevent-default` | 1 | BibliotecaHero: `<div role="search">` con el mismo scroll a `#materiales` en Enter (input) y en click (botón `type="button"`); sin `<form>` ni `preventDefault`. |
| `prefer-module-scope-pure-function` | 5 | Hoist literal a módulo (ninguna cierra sobre props ni estado). |
| `prefer-module-scope-static-value` | 2 | Hoist a `const` de módulo, con sus comentarios. |
| `no-unguarded-browser-global-in-render-or-hook-init` | 4 | Tres son lectores diferidos de `window`/`document` dentro de callbacks de GSAP: pasan a helpers de módulo en `src/lib/viewport.ts` (`altoViewport()`, `anchoDocumento()`), sin cambiar cuándo se leen. FichaNovedad: `typeof window === "undefined" ? false : …` en el initializer (el consumo sigue en el efecto). |
| `html-no-nested-interactive` | 1 | PaisDropdown: `onClick`, `onMouseEnter` y clases pasan al `<li role="option">`; el `<button>` interno se va; `ref`, `role`, `aria-selected` se conservan. |
| `prefer-use-effect-event` | 2 | CasosInvestigacion: handlers de Escape y `popstate` con `useEffectEvent` (React 19.2, estable); cae la cadena de `useCallback` y las lecturas por ref del estado que solo existían para eso. Commit propio, verificación propia (§6.9). |
| `only-export-components` | 13 | `linterna-geometria.ts` (FOCO, VIEWBOX, PARANTES, MONTANTES, LENTE, proyectar, aspectoBarra, proyectarLente, más RADIO_CRISTAL y RADIO_GALERIA que también importa `coreografia-cierre`), `faro-geometria.ts` (CAPAS_Z, FOCO_X, FOCO_Y, PUNTOS_VERBO, más FUGA_X, FUGA_Y, ORIGEN_CSS), `tiempos-faro.ts` (todo el bloque de tiempos incluido DURACION_RECORRIDO; PREGUNTAS/VERBO_POS/HAZ_VERBO pasan a `que-hacemos/data.ts`), `profile/acentos.ts` (ACCENT). Se actualizan los importadores. |
| `no-array-index-as-key` | 12 | Keys de texto: `parrafo`, `m.title`, `p.title`, `t`, `part`, `w`; `Branch` con clave compuesta `place` + `period`. Las palabras de OrigenEd se hoistean a constante. Los usos de `i` para layout (`offsets[i % n]`, `i % 2`) no cambian. |
| `no-ref-current-in-render` | 5 | TorreLineas: se borran los cinco reseteos del cuerpo del componente; `spanRefs` y `chipRefs` se siembran en el `useRef` con `TAMBORES.map(() => [])`. |
| `no-high-complexity-react-function` | 1 | Cae con el split de ImmersiveProfile (`PerfilLineal` saca el árbol reduced-motion; `FiguraPerfil` saca la triplicación de la figura). |
| `js-combine-iterations` | 2 | Una sola pasada (`for…of` o `flatMap`). |

### 3.5 Decisiones puntuales aprobadas por el owner

1. TeamProfileOverlay **sí** migra a `<dialog>` pese al riesgo (el relevamiento lo
   desaconsejaba). Riesgo alto, verificación propia (§6.9).
2. Buscador de biblioteca: `<div role="search">`, comportamiento idéntico; el cableado
   real queda fuera y se le avisa al owner.
3. Imágenes: aliados a `src/config/aliados.ts`; dimensiones en `Profile`.
4. `will-change` con animación continua no se borra: lo pone y lo saca la coreografía.
5. `useEffectEvent` en CasosInvestigacion, con verificación de interacción.
6. MobileNav a `<dialog>` (gana la trampa de foco que hoy falta).
7. Commits de la lane autorizados en bloque por el owner (rama propia, `docs/COMMITS.md`).
   Push, PR y merge siguen pidiendo OK explícito.

## 4. Restricciones

Las de §3.2, más:

- Solo `transform`, `opacity` y lo que ya se anima hoy. Nada de layout nuevo.
- `gsap.context()` + cleanup como hoy; `gsap.matchMedia()` donde ya está.
- El SSR de cada ruta, después de la fase 1, es idéntico byte a byte al baseline
  (normalizado según §7.1). Después de la fase 2 solo cambian los atributos que la
  fase toca (clases de transición, `will-change`, `<img>`→`<img>` de `next/image`,
  `<dialog>`, `<div role="search">`); el texto visible no cambia.
- Lenguaje inclusivo en cualquier texto nuevo (no debería haber: el copy es el
  existente).
- Dev server siempre en una terminal propia de Orca, nunca como shell de fondo de la
  sesión. Navegador: el embebido de Orca, con las mañas de la memoria
  `orca-browser-verification-quirks` (probes numéricos como evidencia principal,
  capturas como respaldo).

## 5. Archivos

Unos 100 archivos nuevos y 43 tocados en `src/`; el detalle lo lleva el PLAN. Resumen
por área:

| Área | Tocados | Nuevos (previstos) |
| --- | --- | --- |
| `components/ui`, `components/layout` | ButtonPrimary, CtaButton, RevealImage, Footer, MobileNav | — |
| `config` | — | `aliados.ts` |
| `lib` | — | `viewport.ts`, `hooks/useMouseParallax.ts` |
| `features/home` | ComoTrabajamos, Hero, LineasAccion, DatosDuros, BibliotecaNovedades, HeroQuienes | `data.ts` + subcarpetas de #1, #2, #5 |
| `features/que-hacemos` | QueHacemosHero, QueHacemosHeroFaro, NivelesEscala, TorreLineas, FaroEscena, CaminoDeTrabajo, EnfoqueTransformacion, `data.ts` | `faro-geometria.ts`, `tiempos-faro.ts` + subcarpetas de #3, #4, #14, #16 |
| `features/quienes-somos` | RedEd, MiradaEd, OrigenEd, TeamProfileOverlay, profile/ImmersiveProfile, profile/profileParts, `data/equipo.ts` | `acople-lamina.ts`, `profile/acentos.ts` + subcarpetas de #7, #8, #9, #11, #15 |
| `features/investigacion` | casos/CasosInvestigacion, casos/ExpedienteCaso, casos/LaminaCaso, casos/CarpetaCaso, casos/NavegacionCasos, components/LinternaFaro, components/CartaAbierta, components/coreografia-cierre | `components/linterna-geometria.ts` + subcarpetas de #10, #13 |
| `features/biblioteca` | DestacadosBiblioteca, BibliotecaHero, CategoriasRail | subcarpeta de #6 |
| `features/novedades` | FichaNovedad, NovedadDestacada, LanzamientosRecientes, RotadorPalabras, SplitFlap, TransicionFaro | — |
| `features/contacto` | ContactoExperiencia, PaisDropdown | subcarpeta de #12 |
| `app` | `novedades/[slug]/page.tsx` | — |
| `docs` | `AI_GUIDELINES.md` | — |

## 6. Definition of done

Todo por comando; evidencia (comando, salida resumida, commit) en `PROGRESS.md` y en
`feature_list.json`.

1. `pnpm dlx react-doctor --no-supply-chain --json src`: `summary.totalDiagnosticCount`
   = 0 y `summary.score` = 100. Y `pnpm react-doctor` imprime `Score: 100 / 100`.
2. `pnpm typecheck` → exit 0. `pnpm lint` → exit 0. `pnpm build` → exit 0.
3. Tamaño: `wc -l` ≤ 200 en cada archivo que la lane **crea** y en cada componente que
   **parte** (con su subcarpeta), medido contra la base real de la lane
   (`git diff --name-only --diff-filter=A 112de56...HEAD -- src` y las carpetas de los
   splits) → 0 archivos por encima. Enmendado el 2026-09-08 por decisión del owner en el
   cierre: la redacción anterior decía «cada archivo tocado **o** creado» contra `main`, y
   eso (a) arrastra los archivos que también toca `gar`, y (b) obligaría a partir 22
   archivos que ya superaban las 200 antes de esta lane, que react-doctor no marca y que el
   PLAN nunca listó. Esos 22 quedan como deuda aparte —datos, coreografías y SVG—, y 11 de
   ellos crecieron acá entre 2 y 11 líneas por comentarios del porqué que AGENTS §8 exige.
4. Extensiones: `git diff --name-only --diff-filter=A main...HEAD -- src | grep -E
   '\.jsx?$'` → 0 líneas.
5. Cero supresiones: `grep -rn "react-doctor-disable\|no-img-element" src` → 0 líneas;
   no existe `doctor.config.*`; `package.json` sin `reactDoctor`.
6. Sin hex nuevos: la cantidad de coincidencias de `#[0-9a-fA-F]{6}` en `src/` en HEAD
   es ≤ que en `main`.
7. Paridad SSR de fase 1: para cada paso de fase 1, `cmp` del SSR normalizado (§7.1) de
   las rutas afectadas contra el baseline → exit 0, registrado en PROGRESS por paso.
8. Texto visible intacto al cierre: el `textContent` del `<body>` SSR (sin scripts) de
   cada una de las 8 rutas es idéntico al del baseline.
9. Interacciones, por probe en el navegador de Orca, cada una devolviendo `true`:
   - MobileNav (390×844): al abrir, el foco está en el botón de cerrar; Tab desde el
     último link vuelve al primero; Escape reproduce la reversa y el `<dialog>` queda
     cerrado; el foco vuelve al burger.
   - TeamProfileOverlay (1536×850), variantes inmersiva y shell: al abrir, el foco está
     en «volver» y el hero mide ancho > 0; Tab cicla adentro; Escape dispara la salida
     animada y el `<dialog>` cierra al terminar; `window.scrollY` final = el previo ±1;
     `document.querySelectorAll("[inert]").length === 0`.
   - CasosInvestigacion (1536×850): abrir un caso, cambiar a otro, Escape cierra,
     abrir y Back cierra; `estado` vuelve a `index` en ambos y la página queda con el
     scroll alineado a la sección.
10. Capturas y probes de fase 2: por cada página, los estados de §7.2 capturados antes
    (fase 0) y después (fin de fase 2), guardados con nombre `<ruta>-<estado>-<antes|despues>.png`
    y sus probes numéricos con los mismos valores ±0.02 (opacidades, progreso de
    ScrollTrigger, transforms).
11. `feature_list.json` valida contra el schema de AE y todas las filas están en
    `passing` con evidencia.
12. `docs/AI_GUIDELINES.md` tiene la entrada nueva: `grep -c "will-change"
    docs/AI_GUIDELINES.md` ≥ 1 y `grep -c "subcarpeta" docs/AI_GUIDELINES.md` ≥ 1.
13. Review de cierre: 4 seats en Opus (animación home + que-hacemos; animación
    quienes-somos + investigación + resto; React y accesibilidad; reglas del repo),
    hallazgos resueltos o registrados en DECISIONS, seats detenidos.

## 7. Evidencia

### 7.1 Arnés de paridad SSR

Script en el scratchpad (`ssr.mjs`): pide la ruta al dev server, se queda con el
`<body>`, quita `<script>…</script>`, `<link rel="preload" …>` y `<link rel="stylesheet"
…>` con hash, y guarda el resultado. Se valida **antes** de usarlo como baseline pidiendo
la misma ruta dos veces: si no es idéntico a sí mismo, no sirve de evidencia y se ajusta
la normalización (y se anota en DECISIONS qué hubo que quitar). Rutas:

`/`, `/que-hacemos`, `/quienes-somos`, `/investigacion`, `/biblioteca`, `/novedades`,
`/novedades/libro-socioepistemologia`, `/contacto`.

### 7.2 Estados congelados (capturas + probes)

A 1536×850 y 390×844, el tope de cada ruta. Además, a 1536×850, estados congelados por
`scrollTo` + `resize` + poll hasta estabilizar: faro (dos progresos), torre (dos), niveles
(uno), mirada (dos), origen (dos), red (uno), constelación y espiral de investigación
(uno cada una), destacados de biblioteca (uno), contacto (intro desarmada), caso abierto,
perfil abierto (inmersivo y shell), menú mobile abierto (390×844). Cada estado tiene un
probe numérico (opacidad, transform o progreso del trigger) que se guarda junto a la
captura.
