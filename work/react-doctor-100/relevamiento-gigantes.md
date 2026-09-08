# Survey: react-doctor giant components + non-component exports

Repo: `C:\Briar\repos\work\Empoderamiento-Docente` (source under `src/`).
Linter: react-doctor v0.9.13. Rules: `no-giant-component` (>300 source lines in a
component body), `only-export-components`, `no-high-complexity-react-function`.
All 16 files read in full; every export site's importers grepped across `src/`.
Line numbers are 1-indexed, relative to `src/`.

---

## PART A — react-doctor/no-giant-component

### 1. `features/home/components/ComoTrabajamos.tsx`

- **Size:** 381 lines total; component body 80 → 381 (302 lines).
- **What it does:** Sticky scroll-telling block where 5 method steps cross-fade
  over a 500vh runway, with a synced dot indicator and an ambient parallax glow.
- **Hooks/refs/state:** 1 ref (`rootRef`), 1 hook (`useReducedMotion`), 0 state.
  One `useEffect` (84–206, 123 lines) holding a single `gsap.context`. Every
  target is resolved from the DOM via `[data-paso]`, `[data-nav-dot]`,
  `[data-glow-bg]` — no ref reaches the JSX.
- **Seams (≤150 each):**
  - `PASOS` data (19–70) → `features/home/data.ts` (~52)
  - choreography (89–203) → `coreografia-metodo.ts` (~120)
  - mapped step JSX (266–355) → `PasoMetodo.tsx` (~95)
  - dot indicator (236–259) → `IndicadorPasos.tsx` (~25)
  - shell + CTA keeps ~40
- **Coupling:** none beyond `rootRef`. No refs object, no forwardRef, no shared
  GSAP context needed. `features/home/` has no `data.ts` sibling yet (new file).
- **Difficulty:** **easy**. Main animation risk: the timeline derives `N` from
  `pasos.length` read off the DOM, so the child must render exactly one
  `[data-paso]` node per step and nothing else with that attribute.

### 2. `features/home/components/Hero.tsx`

- **Size:** 532 lines total; component body 98 → 532 (435 lines).
- **What it does:** Card-field hero where 11 desktop (and 8 curated mobile)
  photos deploy from a centre stack once the intro gate is crossed, then take
  scroll parallax per layer and a lerped mouse parallax.
- **Hooks/refs/state:** 1 ref (`ref`), 1 hook (`useReducedMotion`), 0 state.
  One `useIsomorphicLayoutEffect` (104–345, 242 lines) containing a
  `gsap.context` (entrance timeline 147–272, gate wiring 274–284, scroll
  parallax 289–305) plus a mouse-parallax RAF declared *outside* the context
  (311–335) with its own listener cleanup.
- **Seams:**
  - `Card` type + `CARDS` + `MOBILE_CARDS` (23–79) → `hero-cards.ts` (~57)
  - entrance timeline → `coreografia-hero.ts` (~130)
  - mouse RAF → `@/lib/hooks/useMouseParallax.ts` (~40)
  - desktop field JSX (369–434) → `CampoCards.tsx` (~65)
  - mobile field JSX (445–470) → `CampoCardsMobile.tsx` (~25)
  - copy block (472–529) → `HeroCopy.tsx` (~55)
- **Coupling:** low. Everything is addressed by `[data-*]`; only `scope`
  (the root) crosses, plus `scope.offsetHeight` for the parallax factor.
  The RAF block is byte-for-byte the same code as `QueHacemosHero.tsx:113-147`
  — one shared hook serves both components.
- **Difficulty:** **easy**. Risk: the entrance measures
  `getBoundingClientRect()` pre-paint to stack the cards at viewport centre, so
  the extracted module must still be invoked from a layout effect in the
  parent, never from a child's own effect.

### 3. `features/que-hacemos/components/QueHacemosHero.tsx`

- **Size:** 586 lines total; component body 77 → 586 (510 lines).
- **What it does:** Full-screen night hero with deterministic star dust, an
  occasional shooting star, and a magnetic "hold to charge" capsule that fires
  a ~3s Lenis journey into the lighthouse scroll-story.
- **Hooks/refs/state:** 4 refs (`rootRef`, `holdRef`, `campoRef`, `innerRef`),
  1 hook, 0 state. **Five independent** layout effects: entrance (84–107, 24),
  mouse parallax (113–147, 35), shooting star (153–183, 31), capsule magnetism
  (190–226, 37), portal charge/travel machine (229–397, 169).
- **Seams:**
  - `POLVO` LCG generator (15–24) → `polvo.ts` (~12)
  - entrance → `coreografia-hero-qh.ts` (~25)
  - mouse parallax → shared `useMouseParallax` (~35, dedupe with `Hero.tsx`)
  - shooting star → `estrella-fugaz.ts` (~30)
  - magnetism + letter wave → `capsula-magnetismo.ts` (~40)
  - hold/charge/fire/travel → `portal-viaje.ts` (~170)
  - capsule JSX (524–582) → `CapsulaPortal.tsx` (~60)
  - sky/dust JSX (427–466) → `CieloPolvo.tsx` (~35)
- **Coupling:** lowest per-effect of the whole set. Each effect takes 1–3 refs,
  owns its own listeners and returns its own cleanup. No shared GSAP context.
- **Difficulty:** **easy**. Risk: `portal-viaje` depends on
  `DURACION_RECORRIDO` (see Part B) and on `#faro` geometry read at click time;
  moving it is a straight lift with no measurement change.

### 4. `features/que-hacemos/components/NivelesEscala.tsx`

- **Size:** 443 lines total; component body 106 → 443 (338 lines).
- **What it does:** Pinned scroll-story where 5 level cards rise from below,
  sit open to be read, then collapse to their titles as the next one lands,
  while a travelling SVG ribbon and a chasing capsule thread between them.
- **Hooks/refs/state:** 2 refs (`zoneRef`, `stageRef`), 1 hook, 1 state
  (`live`). One layout effect (112–281, 170 lines) wrapping an inner `run()`
  gated on `document.fonts.ready`; it also attaches click and keyboard toggles
  to each card and collects its own cleanups array.
- **Seams:**
  - timing constants + `POS` + `LAZO` (46–104) → `coreografia-niveles.ts` header (~59)
  - the `run()` body (121–274) → same module (~150)
  - ribbon SVG (309–339) → `LazoViajero.tsx` (~32)
  - card JSX (372–425) → `NivelCard.tsx` (~55)
  - header (342–362) and fallback title (429–439) stay (~34)
- **Coupling:** low. All targets are `[data-*]` inside `stage`. `NIVELES`
  already lives in `../data.ts`. The toggle listeners can stay owned by the
  choreography module as long as it returns a cleanup.
- **Difficulty:** **easy-medium**. Risk: `colapsables` are measured with
  `scrollHeight` after fonts resolve, so the card's `[data-collapse]` and
  `[data-collapse-icon]` box structure (overflow-hidden wrappers) must survive
  the extraction byte-identical.

### 5. `features/home/components/LineasAccion.tsx`

- **Size:** 433 lines total; component body 110 → 433 (324 lines).
- **What it does:** Seven area cards deal in from below into a horizontal fan
  (desktop) or a vertical overlapping stack (mobile/tablet), with per-card
  pointer tilt and a CTA that lands with the last card.
- **Hooks/refs/state:** 1 ref (`rootRef`), 1 hook, 0 state. One layout effect
  (114–322, 209 lines): rest-position math per device, scrubbed timeline,
  pointer-tilt listeners pushed into a shared `tiltCleanups` array, and a
  rAF-debounced resize that recomputes `restX`.
- **Seams:**
  - `Area` type + `AREAS` (25–94) → `features/home/data.ts` (~70, shared with #1)
  - layout math + timeline (137–233) → `coreografia-abanico.ts` (~110)
  - tilt block (241–295) → `tilt-cartas.ts` (~60)
  - card JSX (356–408) → `CartaArea.tsx` (~55)
  - header + CTA stay (~50)
- **Coupling:** low-ish. Everything is queried from `root` with `[data-deck-*]`.
  The tilt module must return its own cleanup instead of pushing into the
  effect's array. The `is-live` / `is-stack` classes drive layout rules that
  live in `globals.css` — class names are load-bearing, not cosmetic.
- **Difficulty:** **easy-medium**. Risk: `stepNow()` reads
  `cards[0].offsetWidth` and `stage.clientWidth`; the measured node must remain
  the `<li data-deck-card>` itself, not a new wrapper a child introduces.

### 6. `features/biblioteca/components/DestacadosBiblioteca.tsx`

- **Size:** 363 lines total; component body 47 → 363 (317 lines).
- **What it does:** Four cover images pin at viewport centre, converge into a
  single stack over the article media column, then each article divider wipes
  the top image away with a clip-path whose edge tracks the line exactly.
- **Hooks/refs/state:** 5 refs (`rootRef`, `rowRef`, `slotRef`, `artsWrapRef`,
  `itemRefs` array), 1 state (`activo`), 1 hook. One layout effect (56–175,
  120 lines) with per-row ScrollTriggers plus a desktop-only `matchMedia`
  block; a small `irAlItem` Lenis helper (177–186).
- **Seams:**
  - `ITEMS` derivation (19–22) → `../data/materiales.ts` (~6)
  - choreography (61–171) → `coreografia-destacados.ts` (~115)
  - intro phase JSX (194–243) → `IntroDestacados.tsx` (~50)
  - sticky index (254–278) → `IndiceDestacados.tsx` (~30)
  - article row (283–356) → `ArticuloDestacado.tsx` (~75)
- **Coupling:** the choreography needs 4 element refs plus `setActivo`.
  `itemRefs` is filled by a callback ref inside the article map, and `slotRef`
  is conditional on `i === 0`, so both become callback-ref props — exactly the
  `refItem` / `refBoton` pattern `features/investigacion/casos/CarpetaCaso.tsx`
  already uses in this repo.
- **Difficulty:** **easy-medium**. Risk: the convergence deltas are all
  measured from live rects with `invalidateOnRefresh`, so a JSX move is safe as
  long as the `slot` and `row` boxes keep their aspect ratios and grid columns.

### 7. `features/quienes-somos/components/RedEd.tsx`

- **Size:** 483 lines total; component body 102 → 483 (382 lines).
- **What it does:** Organic SVG graph of six specialities and five countries
  around a central ED node; it draws itself on scrub, every node drifts
  perpetually, and hovering a speciality flies specialist photos from the node
  into a fixed dock below.
- **Hooks/refs/state:** 1 ref (`rootRef`), 1 state (`area`), 1 hook. Two
  effects: section coupling + heading + scrubbed draw + perpetual drift
  (108–199, 92 lines) and highlight + photo flight (202–261, 60 lines).
- **Seams:**
  - geometry and data (`CX`/`CY`/`R`/`SPECS`/`PAISES`/`AREA_PERSONAS`/`curve`/`pct`, 37–100) → `red-datos.ts` (~65)
  - draw timeline + drift (112–196) → `coreografia-red.ts` (~95)
  - highlight + avatar flight (206–261) → `vuelo-fotos.ts` (~60)
  - SVG graph + hotspots (298–409) → `GrafoRed.tsx` (~115)
  - dock (413–465) → `DockEspecialidad.tsx` (~55)
  - heading + footer stay (~50)
- **Coupling:** low-medium. Everything is `[data-*]`. The flight measures
  `[data-spec-dot]` inside the SVG against `[data-dock-av]` inside the dock, so
  both must stay within `rootRef` and be mounted when the effect runs (they
  are: state-driven render, then effect).
- **Difficulty:** **easy-medium**. Risk: the section-coupling tween at 113–122
  is identical to the ones in `MiradaEd` (240–250) and `OrigenEd` (204–214) —
  extract once as `acople-lamina.ts` and reuse across all three.

### 8. `features/quienes-somos/components/MiradaEd.tsx`

- **Size:** 867 lines total; component body 180 → 867 (688 lines).
- **What it does:** Constellation map with a scrubbed camera that zooms to each
  of three principles, reveals its reading block on the right, stacks concept
  chips under the active node, then pulls back for the synthesis and branches
  into the network bridge.
- **Hooks/refs/state:** 2 refs (`rootRef`, `zoneRef`), 1 hook, 1 state
  (`live`). Two layout effects: the `live` gate (188–192) and the choreography
  (194–552, 359 lines) — a 14-unit master timeline preceded by ~90 lines of
  imperative initial layout (`gsap.set` positioning chip stacks, reading zones
  and z-index layers).
- **Seams:**
  - `Perspectiva` type + `PERSPECTIVAS` + `CENTRO`/`NODOS`/`LINEAS`/`ARCOS`/`RAMAS`/`CAMARA` (49–178) → `constelacion-mirada.ts` (~130)
  - choreography (204–546) → `coreografia-mirada.ts` (~350; splittable into `setup-estados.ts` ~120 and `timeline-fases.ts` ~230)
  - SVG + node stage (576–690) → `MapaConstelacion.tsx` (~115)
  - reading blocks + chips (717–810) → `DetallePerspectiva.tsx` + `FichasPerspectiva.tsx` (~95)
  - synthesis + bridge (813–849) → `SintesisMirada.tsx` (~40)
  - dot indicator (852–862) → `IndicadorFases.tsx` (~15)
- **Coupling:** medium. Only `rootRef` / `zoneRef` cross; everything else is a
  scoped `querySelector`. But the choreography *builds* part of the layout —
  chip stacks are positioned from `CAMARA[i]` and viewport size at runtime — so
  JSX and choreography are two halves of one layout and both must import the
  geometry module.
- **Difficulty:** **medium**. Risk: splitting makes that layout coupling
  invisible; the extracted module has to be documented as the owner of chip
  positioning, or a later JSX edit will silently desync it.

### 9. `features/quienes-somos/components/OrigenEd.tsx`

- **Size:** 925 lines total; component body 178 → 925 (748 lines). Also a local
  `Pilar` sub-component (144–176).
- **What it does:** Navy pinned lamina with five scrubbed beats — letter
  explosion, 3D quote card, scroll-driven typewriter question, a self-drawing
  trajectory with five milestones (horizontal desktop / vertical mobile), and a
  converging final line — plus a photo panel that swaps in sync and a mouse
  tilt on the whole panel.
- **Hooks/refs/state:** 2 refs (`rootRef`, `zoneRef`), 1 hook, 0 state. One
  layout effect (183–548, 366 lines) holding the section coupling, the beat-0
  intro, the 11.5-unit master timeline, the photo panel sub-timeline and the
  tilt RAF.
- **Seams:**
  - `HITOS`/`NODOS`/`PATH_D`/`PREGUNTA`/`PILARES`/`FOTOS` (58–136) → `data.ts` (~60)
  - `GRILLA`/`PILAR_TITULO`/`PILAR_CUERPO` (98–118) → `estilos.ts` (~20)
  - `Pilar` (144–176) → `Pilar.tsx` (~35)
  - section coupling (204–214) → shared `acople-lamina.ts` (~40)
  - master timeline (361–464) → `coreografia-origen.ts` (~200)
  - photo panel timeline (471–519) → `panel-fotos.ts` (~55)
  - photo panel JSX (580–660) → `PanelFotos.tsx` (~85)
  - beat 3 (756–872) → `TrayectoriaHorizontal.tsx` (~60) + `TrayectoriaVertical.tsx` (~35)
  - beat 4 (875–909) → `BeatRemate.tsx` (~35)
- **Coupling:** medium. Only `rootRef` / `zoneRef` cross; `Pilar` already
  isolates the shared shell so beats 0–2 cannot desync.
- **Difficulty:** **medium**. Risk: `gsap.set(beats, {position:"absolute",
  inset:0})` requires all five beats to remain direct siblings inside
  `[data-story-tilt]`; a child component that wraps them breaks the stacking
  and the whole 5-beat crossfade.

### 10. `features/investigacion/casos/ExpedienteCaso.tsx`

- **Size:** 615 lines total; component body 85 → 615 (531 lines). Also a local
  `Rotulo` sub-component (45–68).
- **What it does:** The opened case file — a fixed full-viewport layer with its
  own scroller, a short white report sheet, then loose pieces (evidence
  collage, typewriter analysis, post-it, stamped seal) on tinted card stock,
  plus side tabs for the other cases and a next-case band.
- **Hooks/refs/state:** 1 own ref (`cuerpoRef`), 1 state (`recorrido`), 1 hook,
  3 forwarded prop refs (`refLugar`, `refShell`, `refTitulo`). Three effects:
  scroll hint (110–118), block reveal + settle + seal stamp (124–189, 66), and
  pointer micro-parallax on loose pieces (192–220, 29).
- **Seams:**
  - `Rotulo` → `RotuloExpediente.tsx` (~25; used 5× across both surfaces)
  - reveals + parallax → `coreografia-expediente.ts` (~100)
  - header (236–273) → `CabeceraExpediente.tsx` (~45)
  - white sheet (336–402) → `HojaInforme.tsx` (~75)
  - card stock (406–535) → `CartonExpediente.tsx` (~135)
  - next-case band (542–599) → `BandaSiguiente.tsx` (~60)
  - side tabs (297–332) → `PestanasLaterales.tsx` (~35)
- **Coupling:** medium. Only `cuerpoRef` is shared; the reveal ScrollTriggers
  resolve their scroller with `closest("[data-exp-lugar]")`, so the DOM nesting
  `article[data-exp-lugar] > … > cuerpoRef` is load-bearing. A `tintes.ts`
  sibling already exists for the colour tokens.
- **Difficulty:** **medium**. Risk: `[data-exp-hoja]` is the morph target
  measured by `CasosInvestigacion`'s opening timeline — its position, size and
  classes must not shift, or the folder-to-sheet morph misses.

### 11. `features/quienes-somos/components/TeamProfileOverlay.tsx`

- **Size:** 348 lines total; component body 33 → 348 (316 lines).
- **What it does:** Portal-to-body profile shell providing scroll lock, sibling
  `inert`, focus trap and restore, deterministic scroll restoration, and two
  entrance modes — clip-path expand from the card for the immersive profile,
  FLIP-lite of the portrait for the plain shell.
- **Hooks/refs/state:** 6 refs (`rootRef`, `backdropRef`, `heroRef`,
  `contentRef`, `backRef`, `closingRef`) + 1 lazily-created `container` state;
  hooks `useLockScroll`, `useMediaQuery`, `useReducedMotion`. Three effects:
  portal + inert + entrance, all in the layout phase (66–185, 120 lines);
  `requestClose` callback (188–220, 33); keyboard trap (223–251, 29).
- **Seams:**
  - portal + inert + scroll save/restore → `usePortalModal.ts` (~70)
  - entrance/exit → `coreografia-overlay.ts` with `abrir()` / `cerrar()` (~110)
  - Escape + Tab trap → `useFocusTrap.ts` (~35)
  - shell branch JSX (296–344) → `PerfilShell.tsx` (~65)
- **Coupling:** medium. Scroll restoration (`savedY` + the triple `reassert`)
  is entangled with the portal cleanup and must move as one unit. The shell
  FLIP measures `originEl.querySelector("img")` against `heroRef`, so if
  `PerfilShell` owns the hero node the parent needs it back via `forwardRef` or
  a callback ref.
- **Difficulty:** **medium**. Risk: the file's own comment is explicit — portal
  attach, measurement and `focus()` must all stay in the layout phase. A hook
  split that degrades to a passive effect yields a zero-width hero (FLIP falls
  back to fade) and loses focus to `<body>`.

### 12. `features/contacto/components/ContactoExperiencia.tsx`

- **Size:** 1101 lines total; component body 125 → 1101 (977 lines).
- **What it does:** Single-screen contact experience — four stacked panels
  (hero, theme index, form, confirmation) that morph into one another, with a
  body-level ghost that flies the headline from hero size into its final
  position, and capture-phase wheel/touch/key listeners that let any scroll
  skip the intro instead of being swallowed.
- **Hooks/refs/state:** 6 refs (`rootRef`, `animando`, `introVivo`, `introTl`,
  `desarmeTl`, `ghosts`), 3 states (`vista`, `tema`, `introListo`), 1 hook.
  Two effects (entrance 301–340; scroll-skip listeners 354–383) plus **six**
  imperative transitions: `desarmar` (172–276, 105), `saltarIntro` (283–295,
  13), `elegirTema` (389–455, 67), `cambiarTema` (476–549, 74), `enviar`
  (552–596, 45), `otraConsulta` (599–626, 28).
- **Seams:**
  - `TEMAS`/`EQUIPO_FOTOS`/`EQUIPO_RESTO`/`DOTS_NAVY`/`TITULO` + types (68–123) → `data.ts` (~55)
  - `inputBase`/`labelBase` (633–636) → `estilos.ts` (~10)
  - hero entrance + `desarmar` + `saltarIntro` → `coreografia-intro.ts` (~130)
  - `elegirTema`/`cambiarTema`/`enviar`/`otraConsulta` → `coreografia-paneles.ts` (~210)
  - hero panel (652–677) → `PanelHero.tsx` (~30)
  - identity column (699–807) → `ColumnaIdentidad.tsx` (~90)
  - theme index (814–870) → `IndiceTemas.tsx` (~65)
  - navy rail (911–965) → `RailTema.tsx` (~60)
  - form fields (968–1024) → `CamposContacto.tsx` (~90)
  - closing panel (1052–1096) → `PanelCierre.tsx` (~50)
- **Coupling:** medium, and mostly benign. Only `rootRef` and the body-level
  ghost array cross component lines; every GSAP target is a `[data-*]` string
  selector, so relocating JSX cannot break a target. `elegirTema` needs the
  clicked element, so the index passes it up through a callback prop. There is
  no `data.ts` sibling in `features/contacto/` yet (new file).
- **Difficulty:** **medium** — large but mechanical. Risk: the headline ghost
  measures `[data-hero-titulo]` against `[data-ap-titulo]` and animates by
  `scale` derived from the font-size ratio; it only lands if both panels stay
  mounted simultaneously with matching font family, weight, tracking and
  line-height. Splitting them into two components puts those class strings in
  two files that must be kept in sync.

### 13. `features/investigacion/casos/CasosInvestigacion.tsx`

- **Size:** 514 lines total; component body 40 → 514 (475 lines).
- **What it does:** State machine for the case archive —
  `index → opening → open → (switching | closing)` — where the open file is a
  fixed layer with its own scroll, the page is frozen underneath (Lenis stopped
  plus `documentElement.overflow`), browser Back closes it via `pushState` /
  `popstate`, and case switching flies a body-level ghost of the band.
- **Hooks/refs/state:** **16 refs** (`estadoRef`, `sectionRef`, `lugarRef`,
  `shellRef`, `tituloRef`, `introRef`, `itemsRef`, `botonesRef`,
  `ultimaAbiertaRef`, `entradaHechaRef`, `regresoPendienteRef`,
  `lenisDetenidoRef`, `historialRef`, `cierrePendienteRef`, `ghostRef`,
  `animsRef`), 4 states, 6 `useCallback`s, **8 effects**. The JSX (428–513, 86
  lines) is already thin, and `coreografia.ts` (610 lines) already owns the
  timelines — the bulk here is orchestration, not markup.
- **Seams (split by hook, not by JSX):**
  - history + scroll lock + Escape + popstate → `useLugarExpediente.ts` (~110)
  - index entrance effect (135–168) → `useEntradaIndice.ts` (~35)
  - opening / switching / closing effects (298–401) → `useTransicionesExpediente.ts` (~120)
  - component keeps ~120 (JSX + wiring)
- **Coupling:** high. The refs *are* the machine, and effects read
  `estadoRef.current` synchronously to decide branches. A split has to return
  one machine object from a hook rather than threading 16 refs through
  parameters. `coreografia.ts` already exists to absorb anything animation-side.
- **Difficulty:** **hard**. Risk: layout-effect ordering. The closing effect
  performs pre-paint `gsap.set(items, {autoAlpha:0})` plus
  `alinearConSeccion(72)` *before* the remounted index paints, with the curtain
  still opaque. A custom hook preserves that only if it is called from the same
  position in the component; reordering makes a reflow jump visible.

### 14. `features/que-hacemos/components/QueHacemosHeroFaro.tsx`

- **Size:** 836 lines total; component body 148 → 836 (689 lines).
- **What it does:** The lighthouse scroll-story. A pinhole-camera proxy
  `{z,x,y}` projects six depth layers (scale + displacement from the vanishing
  point, with a skew/scaleY hack so the pier's tip stays welded to the tower);
  the lamp lights in stages; five questions are lit in turn by a beam aimed
  per-frame at each measured text block; then a white-out hands off to the
  tower section.
- **Hooks/refs/state:** 2 refs (`rootRef`, `altoRef`), 1 hook, 0 state. **One**
  `useIsomorphicLayoutEffect` (170–666, **497 lines**) wrapping a
  `gsap.matchMedia` block: camera setup and `aplicarCamara` (183–233), angle
  maths and `girarHaces` (276–414), the master timeline S0–S5 (416–644), and a
  dev-only `#qa=` hash hook (648–657).
- **Seams:**
  - timing block (112–146) → `tiempos-faro.ts` (~35; keeps exporting `DURACION_RECORRIDO`)
  - `PREGUNTAS`/`VERBO_POS`/`HAZ_VERBO` (79–110) → existing `../data.ts` (~35)
  - camera → `camara-faro.ts` returning `{cam, entrada, capas, aplicar}` (~60)
  - beam aiming → `haz-faro.ts` returning `{girar, setTimeline}` (~110)
  - master timeline → `coreografia-faro.ts` (~230)
  - question overlays (752–788) → `PreguntasFaro.tsx` (~45)
  - closing overlay (804–831) → `CierreFaro.tsx` (~35)
- **Coupling:** high. `girarHaces` closes over `tlActual`, which is assigned
  *after* the timeline it is called from, and the camera's `entrada` proxy is
  itself tweened by that timeline. The split needs a shared context object plus
  a `() => tl` getter (or a `setTimeline` setter) so the modules stay bound.
- **Difficulty:** **hard**. Risk: the highest of the whole set. The comments
  document three separate regressions already fixed here — beam-rotation
  ownership (no timeline tween may touch `rotation`; `girarHaces` is the single
  owner), declaration order (a `const` declared after the timeline hits the
  temporal dead zone in `onUpdate` and takes the whole scene down), and
  `svgOrigin` parsing corruption (hence hard-coded `transformOrigin` values
  tied to the cone geometry in `FaroEscena`). All three constraints must
  survive the split.

### 15. `features/quienes-somos/components/profile/ImmersiveProfile.tsx`

- **Size:** 856 lines total; component body 83 → 856 (774 lines). **Also
  flagged by `no-high-complexity-react-function`.**
- **What it does:** The immersive profile engine — the name travels from hero
  headline to sidebar heading by animating real `font-size` (never `scale`, so
  it stays sharp), a cut-out figure FLIPs in from the card and withdraws when
  the journey starts, a Catmull-Rom path is rebuilt from live node rects, the
  stages reveal in sequence with a living index, and the closing converges the
  categories to centre.
- **Hooks/refs/state:** **20 refs** (`wrapRef`, `identityRef`, `idLine1Ref`,
  `idLine2Ref`, `idRoleRef`, `cloneRef`, `cloneL1Ref`, `cloneL2Ref`,
  `cloneRoleRef`, `heroRef`, `heroBodyRef`, `sidebarRef`, `portraitOuterRef`,
  `portraitMoverRef`, `portraitImgRef`, `trackRef`, `pathRef`, `svgRef`,
  `closingRef`, `closingFigRef`), 1 state (`activeStage`), one layout effect
  (134–452, 319 lines), and **two complete JSX trees**: reduced-motion linear
  (455–534, 80 lines) and immersive (537–855, 319 lines).
- **What branches it (the complexity finding):**
  1. the early `if (reduced) return` producing two full render trees;
  2. a three-way `figura` (`recorte` | `marco` | `sin`) rendered in **three**
     separate places (fixed layer 592–633, closing figure 776–808, reduced
     header 474–493), each with an `img` vs framed `div` sub-branch;
  3. eight `if (ref.current)` guards inside the effect;
  4. the `cardImg && mover && portraitOuterRef.current` FLIP guard with a
     nested `from.width > 0 && to.width > 0` check, and the
     `identity && cardName` branch with an `else` fallback;
  5. optional `profile.closing.body2`;
  6. per-stage `contentRight` / `nodeSide` ternaries feeding a four-condition
     `cx()` composition on the node.
- **Seams:**
  - `cx`/`smoothPath`/`CONTENT_W`/`ID_FINAL` (43–81) → `camino.ts` (~45)
  - name travel (166–204) → `viaje-nombre.ts` (~60)
  - `buildPath`/`setupPath` (256–311) → `camino-maestro.ts` (~70)
  - stage reveals + closing ceremony (315–368) → `etapas.ts` (~50)
  - FLIP intro (374–428) → `apertura-perfil.ts` (~60)
  - reduced branch (455–534) → `PerfilLineal.tsx` (~80) — removes the biggest branch
  - the three-way figura → `FiguraPerfil.tsx` (~50) — removes the triplication
  - `IdentidadFija.tsx` (~30), `IndiceVivo.tsx` (~30), `HeroPerfil.tsx` (~70),
    `RecorridoEtapas.tsx` (~50), `CierrePerfil.tsx` (~60)
- **Coupling:** the highest ref count of the set. The name travel alone needs 8
  refs that live in two different sub-trees (the fixed identity layer and the
  in-flow hero clone), so it needs a refs bundle object created by the parent
  and handed to both. `profileParts.tsx` already exists as the sibling for
  presentational pieces.
- **Difficulty:** **hard**. Risk: the travel reads the clone's computed
  `font-size` through functions re-evaluated on `invalidateOnRefresh`, so the
  clone must keep its exact `clamp()` inline styles and stay in flow inside the
  hero, invisible but occupying space.

### 16. `features/que-hacemos/components/TorreLineas.tsx`

- **Size:** 1112 lines total; component body 162 → 1112 (**951 lines**) — the
  largest in the survey.
- **What it does:** The drum tower — seven CSS-3D cylinders of wrapped
  lettering that translate and rotate with scroll, where the first one unrolls
  from a straight readable line out of the lighthouse white-out, with photos
  floating inside each drum, phrase chips on the band, two rails, and support
  text that cross-fades by direct `textContent` writes (no React re-render).
- **Hooks/refs/state:** **21 refs** (`zoneRef`, `stageRef`, `towerRef`,
  `drumRefs`, `spanRefs`, `fotoRefs`, `chipRefs`, `aroRefs`, `tituloRef`,
  `fraseRef`, `detalleRef`, `apoyoRef`, `railRefs`, `fillRef`, `pctRef`,
  `veloRef`, `rotuloRef`, `navRef`, `rielDerRef`, `superficieRef`,
  `nieblaRefs`), 2 states (`live`, `geo`), 1 hook. Three layout effects: the
  `live` gate (188–195), geometry measurement with a `fonts.ready` recompute
  (197–215), and the engine (217–691, **475 lines**) containing a build state
  machine (288–398), a capture-phase scroll block (318–353), a 197-line
  per-frame `pintar()` (420–616), and the ScrollTrigger wiring (622–680).
- **Seams:**
  - `SEP`…`calcularGeo` + `medirChar` (47–160) → `geometria-torre.ts` (~115, pure and unit-testable)
  - build proxy + `armar`/`rebobinar`/`completar` + scroll block → `armado-torre.ts` (~130)
  - `pintar` → `pintar-torre.ts` as a factory owning `ocultos`/`activo`/`fijado` (~200)
  - left rail (840–873) → `RielEstaciones.tsx` (~40)
  - right rail (876–897) → `RielProgreso.tsx` (~25)
  - drum (957–1032) → `TamborTorre.tsx` (~80)
  - photo (921–956) → `FotoTambor.tsx` (~40)
  - support card (1039–1082) → `ApoyoTorre.tsx` (~50)
  - flat fallback (1086–1106) → `FallbackTorre.tsx` (~25)
  - `TAMBORES` already lives in `../data.ts`
- **Coupling:** very high. `pintar` writes `.style` on 15 ref collections every
  frame and is invoked from three places (the build timeline's `onUpdate`, the
  scrub's `onUpdate`, and once at setup). A split needs one stable refs bundle
  plus callback-ref props on every child. Note lines 693–697 reset the ref
  arrays **during render** — a render-phase mutation any split must either
  preserve deliberately or fix with care.
- **Difficulty:** **hard**. Risk: `pintar` depends on closure state
  (`ocultos`, `activo`, `fijado`, `avance`, `build`), so the module must be a
  factory rather than a free function. The build timeline is also created
  *outside* the `gsap.context` (born inside a hot ScrollTrigger callback) and
  killed by hand in the cleanup — that asymmetry is easy to lose in a move.

---

## PART B — react-doctor/only-export-components

### `features/investigacion/components/LinternaFaro.tsx` (274 lines, no `"use client"`)

Presentational SVG of the brand lighthouse plus its pseudo-3D projection maths.

- **:27 `FOCO`** — `const` object, the lamp focal point in viewBox coords. Used
  only inside the file (lines 52, 122, 145, 232). `coreografia-cierre.ts:75`
  mentions it in a comment but does **not** import it.
  → new `features/investigacion/components/linterna-geometria.ts`.
- **:29 `VIEWBOX`** — `const` object. Used only inside (line 86). Note a
  *different* `VIEWBOX` is already exported from `constelacion.ts` in the same
  folder and consumed by `ConstelacionInvestigacion.tsx` and
  `FiguraConstelacion.tsx`; the new module must not create an ambiguous import
  site. → same module.
- **:44 `PARANTES`** — `const` array of 6 angles. Used only inside (line 237).
  → same module.
- **:46 `MONTANTES`** — `const` array of 16 angles. Used only inside (line 185).
  → same module.
- **:48 `LENTE`** — `const` object (lens angle, radius, width, y, height). Used
  only inside (lines 68, 217–220). → same module.
- **:50 `proyectar`** — `function`. Imported by
  `features/investigacion/components/coreografia-cierre.ts:5`, used at lines
  118 and 127. → same module.
- **:56 `aspectoBarra`** — `function`. Imported by `coreografia-cierre.ts:4`,
  used at lines 119 and 128. → same module.
- **:67 `proyectarLente`** — `function`. Imported by
  `coreografia-cierre.ts:6`, used at line 134. → same module.
- **Not flagged but in the same class, and required for the fix to work:**
  `RADIO_CRISTAL` (:41) and `RADIO_GALERIA` (:42) are also imported by
  `coreografia-cierre.ts:7-8`. If they stay, the file still exports
  non-components and the rule still fires.
- **Net:** one new `.ts` (~65 lines). One importer to update
  (`coreografia-cierre.ts`, a single import statement), plus `LinternaFaro.tsx`
  importing its own geometry back. `CierreInvestigacion.tsx:8` continues to
  import only the component.

### `features/que-hacemos/components/FaroEscena.tsx` (562 lines)

Six stacked depth layers of the lighthouse scene plus the shared geometry the
camera in `QueHacemosHeroFaro` needs.

- **:52 `CAPAS_Z`** — `const` object mapping each layer name to a conceptual Z
  depth. Imported by `QueHacemosHeroFaro.tsx:11`; used there at lines 195, 196
  and 216. → new `features/que-hacemos/components/faro-geometria.ts`.
- **:62 `FOCO_X`** — `const`. Imported by `QueHacemosHeroFaro.tsx:11` (used at
  line 300 for the beam angle); also used internally at 296, 301, 462, 463.
  → same module. **`FOCO_Y` (:63)** is identical in origin, importer and usage
  and must move with it.
- **:117 `PUNTOS_VERBO`** — `const` array of sea points the beam touches. Used
  only inside (line 493). → same module.
- **Not flagged but in the same class:** `FUGA_X` (:47), `FUGA_Y` (:48) and
  `ORIGEN_CSS` (:49) are internal-only consts that keep the file exporting
  non-components. → same module.
- **Net:** one new `.ts` (~40 lines). One importer to update
  (`QueHacemosHeroFaro.tsx:11` splits into two import statements).

### `features/que-hacemos/components/QueHacemosHeroFaro.tsx`

- **:146 `DURACION_RECORRIDO`** — `const`, computed as `despues(1)`. Imported by
  `QueHacemosHero.tsx:8` and used there at line 257 to convert a timeline
  position into runway progress for the portal journey. It depends on the whole
  timing block at 124–146 (`INICIO_PREGUNTAS`, `PASO_PREGUNTA`, `BEATS`,
  `FIN_PREGUNTAS`, `CORRIMIENTO`, `despues`), and `BEATS` in turn derives from
  `PREGUNTAS` (:79).
  → new `features/que-hacemos/components/tiempos-faro.ts` (~35 lines) holding
  the entire timing block, with `PREGUNTAS` / `VERBO_POS` / `HAZ_VERBO` moved to
  the existing `features/que-hacemos/data.ts` (185 lines) so the timing module
  imports only `PREGUNTAS.length`.
  Two importers to update. This also removes the current oddity of a hero
  component importing a constant from another component module.

### `features/quienes-somos/components/profile/profileParts.tsx` (486 lines)

- **:29 `ACCENT`** — `const` `Record<ProfileStage["color"], {...}>` of literal
  Tailwind class strings (text, bg, border, soft, ring, glow, hex). Imported by
  `ImmersiveProfile.tsx:9` and used there at lines 505 and 727; used 11 times
  inside `profileParts.tsx` itself (lines 77, 110, 128, 142, 158, 210, 281,
  310, 372, 437, 457).
  → new `features/quienes-somos/components/profile/acentos.ts` (~55 lines).
  The file comment warns the classes must stay literal for Tailwind's scanner;
  Tailwind v4 scans the whole source tree, so a `.ts` under `src/` is still
  picked up and no `safelist` change is needed.
  Two importers to update.

---

## Ranked list — easiest to hardest

| # | Component | Difficulty | Why it sits here |
|---|---|---|---|
| 1 | `ComoTrabajamos` | easy | 1 ref, everything by data-attribute, one effect |
| 2 | `Hero` | easy | 1 ref; extracting the mouse-parallax hook is a free dedupe |
| 3 | `QueHacemosHero` | easy | five already-independent effects, 1–3 refs each |
| 4 | `NivelesEscala` | easy-medium | 2 refs, data already external, fonts-gated measure |
| 5 | `LineasAccion` | easy-medium | 1 ref, but layout maths and `globals.css` classes are coupled |
| 6 | `DestacadosBiblioteca` | easy-medium | 5 refs, small; callback-ref pattern already in repo |
| 7 | `RedEd` | easy-medium | 2 effects, state-driven dock; shares the acople tween |
| 8 | `MiradaEd` | medium | choreography builds part of the layout from JS |
| 9 | `OrigenEd` | medium | same shape, bigger; the 5 beats must stay siblings |
| 10 | `ExpedienteCaso` | medium | many JSX seams, one shared ref, `closest()` scoper |
| 11 | `TeamProfileOverlay` | medium | layout-phase ordering, FLIP across a component boundary |
| 12 | `ContactoExperiencia` | medium | huge but mechanical: 6 transitions, 4 panels, all data-attrs |
| 13 | `CasosInvestigacion` | hard | 16 refs of machine state, 8 order-sensitive effects |
| 14 | `QueHacemosHeroFaro` | hard | single-owner rule, declaration order, shared mutable proxies |
| 15 | `ImmersiveProfile` | hard | 20 refs (8 for one animation), two full JSX trees |
| 16 | `TorreLineas` | hard | 21 refs, a 200-line per-frame painter, render-phase ref resets |

The first six share one property that makes them safe: the choreography
addresses the DOM through `[data-*]` selectors and holds at most one element
ref, so relocating JSX into child components cannot break a GSAP target. The
last four are where refs, not selectors, carry the animation — and that is
exactly where a split can silently break it.

---

## New-file estimate

| Component | New files |
|---|---|
| DestacadosBiblioteca | 4 |
| ContactoExperiencia | 10 |
| ComoTrabajamos | 4 |
| Hero | 6 (one shared with QueHacemosHero) |
| LineasAccion | 3 (reuses home `data.ts`) |
| CasosInvestigacion | 3 |
| ExpedienteCaso | 7 |
| NivelesEscala | 3 |
| QueHacemosHero | 6 (reuses `useMouseParallax`) |
| QueHacemosHeroFaro | 6 (incl. `tiempos-faro.ts`) |
| TorreLineas | 9 |
| MiradaEd | 6 |
| OrigenEd | 9 (incl. shared `acople-lamina.ts`) |
| RedEd | 5 |
| TeamProfileOverlay | 4 |
| ImmersiveProfile | 11 |
| **Part A subtotal** | **≈96** |
| Part B: `linterna-geometria.ts`, `faro-geometria.ts`, `acentos.ts` | 3 |
| **Total** | **≈99 (plan for 95–100)** |

### Do these three first

They are cross-component dedupes that shrink several targets at once and carry
almost no animation risk:

1. **`@/lib/hooks/useMouseParallax.ts`** — the lerped RAF that sets two CSS
   custom properties is duplicated verbatim in `Hero.tsx:311-335` and
   `QueHacemosHero.tsx:113-147`.
2. **`acople-lamina.ts`** — the `transformOrigin: "50% 0%"` + `scale 0.97 → 1`
   + `y 36 → 0` section-coupling tween appears three times: `MiradaEd:240-250`,
   `OrigenEd:204-214`, `RedEd:113-122`. All three carry the same comment about
   why the origin needs a preceding `gsap.set`.
3. **`tiempos-faro.ts`** — resolves a Part B finding and removes a
   component-to-component import (`QueHacemosHero` importing a constant out of
   `QueHacemosHeroFaro`) in the same change.
