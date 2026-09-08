# react-doctor perf survey — Empoderamiento-Docente

Repo: `C:\Briar\repos\work\Empoderamiento-Docente`
Linter: react-doctor v0.9.13 · Next.js 16 / React 19.2 · GSAP + Lenis · Tailwind v4
Scope: READ-ONLY survey. Nothing was edited. All line numbers are 1-indexed, relative to `src/`.

**Global fact that applies to the whole first section:** no GSAP call in this repo sets
`will-change` implicitly. GSAP's `force3D` default adds a `translateZ(0)` during a tween and
removes it after; it never writes `will-change`. Only two places in the codebase set it
explicitly:

- `features/que-hacemos/components/QueHacemosHeroFaro.tsx:244` — `gsap.set(capas.map(c => c.el), { willChange: "transform" })` on the `[data-capa]` elements.
- `features/investigacion/components/coreografia-cierre.ts:157` — `willChange: "transform"` on the clouds.

So for every site below, the answer to "(c) does GSAP already set will-change / force3D on it?"
is **no**, unless the entry says otherwise.

---

## 1. react-doctor/no-permanent-will-change (32 sites)

### 1a. Remove outright (19 sites)

These elements animate once and then never again, so the promoted layer is pure cost for the
lifetime of the page.

- **`components/ui/RevealImage.tsx:125`**
  (a) Inner wrapper `div` of the shared reveal primitive (`h-full w-full`), hints **transform**.
  (b) Animates **once on enter**: `gsap.set(inner, { scale: scaleFrom })` then a single
  `scale → 1` tween on a `scrollTrigger: { once: true }`. No scrub, no ticker.
  (c) No GSAP-set will-change.
  (d) **REMOVE**, or TOGGLE via the timeline's `onStart` / `onComplete`.
  Verdict: TRUE POSITIVE (high). Risk: **low**.
  Note: this is a shared component, so the permanent hint multiplies across every page that
  uses `RevealImage`.

- **`features/contacto/components/ContactoExperiencia.tsx:670`**
  (a) Per-character `span` (`[data-hero-char]`) of the hero word. `TITULO = "Hablemos."`, so 9 spans.
  Hints **transform** (the tween also drives `autoAlpha`, `yPercent`, `rotateX`).
  (b) **Once on enter**: one `back.out(1.5)` intro of 0.7s with 0.04 stagger, then
  `.call(() => desarmar(), undefined, 1.2)` tears the panel down. Never re-runs.
  (c) No GSAP-set will-change.
  (d) **REMOVE**.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/home/components/Hero.tsx:460`**
  (a) `[data-mcard]`, the mobile hero card wrapper (`block lg:hidden` parent). Hints **transform**.
  (b) **Once on enter**: the stack-to-deploy timeline at lines 245-271 (`autoAlpha`, `scale`,
  then `x/y/scale` home). Never touched again; scroll parallax targets `[data-card-outer]`, a
  different element.
  (c) No GSAP-set will-change.
  (d) **REMOVE**, or clear in the timeline's `onComplete`.
  Verdict: TRUE POSITIVE (high). Risk: **low**. Extra weight: this path is mobile-only, where GPU
  memory is tightest.

- **`features/investigacion/casos/LaminaCaso.tsx:37`**
  (a) The `<figure>` wrapping the case illustration. Hints **transform**. It carries both
  `data-pieza-parallax` and `data-exp-asienta`.
  (b) Mixed: `data-exp-asienta` is a one-shot `fromTo` on scroll; `data-pieza-parallax` gets
  `gsap.quickTo` x/y from a `mousemove` handler that is gated on `QUERY_PUNTERO_FINO`. So the
  parallax is intermittent, not continuous.
  (c) No GSAP-set will-change.
  (d) **TOGGLE by relocation**: set the hint inside the parallax effect (which already gates on
  fine pointer) and clear it in that effect's cleanup, next to the existing
  `gsap.set(piezas, { x: 0, y: 0 })`.
  Verdict: TRUE POSITIVE (medium-high). Risk: **low-medium**.
  Note: this figure wraps a `priority` 1600x1200 `next/image`, so promotion means a full-size
  texture held permanently.

- **`features/investigacion/components/CartaAbierta.tsx:274`**
  (a) `[data-ficha]`, four fundamento cards. Hints **transform**.
  (b) Fully **scrub-driven** (corner-to-grid travel in `coreografia-carta.ts`, `scrub: true`),
  **but only when `live` is true**, which requires `(hover: hover) and (min-width: 64rem)`.
  On touch and reduced-motion the same class ships with no animation whatsoever.
  (c) No GSAP-set will-change.
  (d) **REMOVE from the class**; apply it from `crearCarta` with
  `gsap.set(fichas, { willChange: "transform" })` so it follows the `live` gate.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/novedades/components/NovedadDestacada.tsx:73`**
  (a) Inner `div` of the `RevealFoco` helper (`h-full w-full`). Hints **transform**.
  (b) **Once on enter**: a blur/saturate/brightness plus `scale` settle. The tween ends with
  `clearProps: "filter,transform"` — GSAP explicitly cleans up the transform, and the
  `will-change` hint outlives the thing it was hinting.
  (c) No GSAP-set will-change.
  (d) **REMOVE**.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/novedades/components/SplitFlap.tsx:168`**
  (a) `[data-reel]`, the split-flap reel span, one per non-space character. Inline
  `style={{ willChange: "transform" }}`. Hints **transform**.
  (b) **Strictly one-shot per mount**: an `IntersectionObserver` (or `trigger: "mount"`) calls
  `run()` once, and `reel.dataset.built` guards against a second build.
  (c) No GSAP-set will-change.
  (d) **REMOVE**, or set it in the effect immediately before the `fromTo` and clear it in the
  tween's `onComplete`.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/novedades/components/TransicionFaro.tsx:193`**
  (a) The route-transition curtain: `bg-azul-principal fixed inset-0 z-[120]`. A full-viewport
  layer. Hints **transform**.
  (b) Neither scrub nor ticker. It sits at `visibility: hidden` with `transform: translateY(100%)`
  and moves by a **CSS transition** on `transform`, fired only on a route change.
  (c) No GSAP at all in this file.
  (d) **TOGGLE**: set `willChange` in `abrir()` just before the transform, clear it when
  `destapar()` finishes.
  Verdict: TRUE POSITIVE (high). Risk: **low**.
  Note: this is a full-viewport promoted layer that is hidden for essentially the entire session.

- **`features/que-hacemos/components/FaroEscena.tsx:524`**
- **`features/que-hacemos/components/FaroEscena.tsx:530`**
- **`features/que-hacemos/components/FaroEscena.tsx:543`**
- **`features/que-hacemos/components/FaroEscena.tsx:548`**
  (a) Four `[data-faro-shift]` wrappers (cielo, horizonte, faro, marMedio), each
  `absolute inset-0` over a full-viewport SVG layer. Hint **transform**.
  (b) Scrub-driven, but only during an entry: `QueHacemosHeroFaro.tsx:470-484` runs a
  `fromTo` on `[data-faro-shift]` (`y: innerHeight * 0.86 → 0`, `scrub: 0.85`) across
  `LLEGADA_VH = PI/2` viewports at the start of the page. After that they sit at `y: 0` forever.
  (c) **Yes, on their parents.** `QueHacemosHeroFaro.tsx:244` already does
  `gsap.set(capas.map(c => c.el), { willChange: "transform" })` on the `[data-capa]` elements,
  which are the direct parents of these four divs.
  (d) **REMOVE the class**; add `[data-faro-shift]` to that existing `gsap.set` at line 244.
  Verdict: TRUE POSITIVE (very high). Risk: **low**.

  **This is the highest-value finding in the survey.** The doc comment immediately above, at
  `FaroEscena.tsx:509-516`, states the opposite of what the code does:

  > "SIN will-change acá: la promoción a GPU (~30MB por capa full-viewport) la activa la
  > coreografía solo cuando corre — el fallback estático (mobile, reduced-motion) no la paga."

  The choreography does exactly that for the parents. These four classes therefore
  (1) contradict a written decision, (2) double-promote parent and child, and (3) apply on
  mobile and reduced-motion where the choreography never runs and the fallback was explicitly
  designed not to pay for them. This is a documented regression, not a judgment call.

- **`features/que-hacemos/components/QueHacemosHero.tsx:469`**
  (a) The hero content column (`h1` + subtitle + CTA). Hints **transform**.
  (b) Continuously driven: its inline `transform` reads `--qhx` / `--qhy`, which a RAF lerp
  rewrites (see lines 135-136).
  (c) No GSAP-set will-change — **but** the inline transform already contains
  `perspective(1000px)` with `rotateY` and `rotateX`, which forces a compositing layer on its own.
  The hint is redundant.
  (d) **REMOVE** as redundant.
  Verdict: TRUE POSITIVE (medium). Risk: **low**.

- **`features/quienes-somos/components/MiradaEd.tsx:660`**
  (a) `[data-nodo-core]`, a small pill (14px dot + label), one per entry in `PERSPECTIVAS`.
  Hints **transform**.
  (b) Animated inside the `scrub: 1` master timeline, but only as `autoAlpha` + `scale`, once
  per phase (born at `scale 0.6`, settles, fades at `S + 1.92`). Not continuous travel.
  (c) No GSAP-set will-change.
  (d) **REMOVE**.
  Verdict: TRUE POSITIVE (medium). Risk: **low**.

- **`features/quienes-somos/components/MiradaEd.tsx:798`**
  (a) `[data-ficha]` chips, several per perspective, so a dozen or more on the page.
  Hints **transform**.
  (b) Animated only as `autoAlpha` plus a **12px** `y` slide, once per phase inside the scrubbed
  timeline (`tl.to(f, { autoAlpha: 1, y: 0, duration: 0.12 })`).
  (c) No GSAP-set will-change.
  (d) **REMOVE**. A permanent layer per chip to cover a 12px fade-slide is not a trade worth making.
  Verdict: TRUE POSITIVE (high). Risk: **low**.
  Aside, out of scope but noticed: these chips carry an inline
  `transitionDelay: ${k * 40}ms` with no `transition-property` declared anywhere, so that
  delay is dead code.

- **`features/quienes-somos/components/OrigenEd.tsx:572`**
  (a) `[data-story-tilt]`, the full-screen sticky stage. Hints **transform**.
  (b) Continuously driven: a RAF loop at lines 531-536 calls
  `gsap.set(tilt, { rotateY, rotateX, transformPerspective: 1100 })` every frame, gated on
  `(pointer: fine)`.
  (c) No GSAP-set will-change — **but** the element already carries
  `[transform-style:preserve-3d]`, which forces a layer.
  (d) **REMOVE** as redundant with `preserve-3d`.
  Verdict: TRUE POSITIVE (medium). Risk: **medium**.

- **`features/quienes-somos/components/OrigenEd.tsx:588`**
  (a) `[data-photo-lamina]`, the rounded photo lamina. Hints **transform**.
  (b) Animated at exactly **one** point: `tl.to(lamina, { autoAlpha: 0, x: 80, y: 46, scale: 0.965,
  duration: 0.55 }, 6.05)` — a 0.55-unit exit at position 6.05 of the master timeline. Idle for
  the whole rest of a `h-[560svh]` zone.
  (c) No GSAP-set will-change.
  (d) **REMOVE**, or set it from the exit tween's `onStart`.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/quienes-somos/components/RedEd.tsx:434`**
  (a) `[data-dock-av]`, a 56px circular avatar (`h-14 w-14`). Hints **transform**.
  (b) **Once per area change**: a 0.55s `fromTo` flight from the network node to the dock
  (lines 240-259), with `overwrite: "auto"`.
  (c) No GSAP-set will-change.
  (d) **REMOVE from the class**; add `willChange: "transform"` to the `fromTo` "from" vars and
  clear it in the tween's completion (or via `clearProps`).
  Verdict: TRUE POSITIVE (high). Risk: **low**.

- **`features/quienes-somos/components/TeamProfileOverlay.tsx:300`**
  (a) The shell hero portrait frame (`aspect-[4/5] w-full max-w-[26rem]`). Hints **transform**.
  (b) **Once on open**: `gsap.fromTo(hero, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1,
  duration: 0.5 })` at line 142.
  (c) No GSAP-set will-change.
  (d) **REMOVE**.
  Verdict: TRUE POSITIVE (high). Risk: **low**.

### 1b. Toggle rather than remove (8 sites)

Genuinely animated, but idle for most of the session, so the fix is to scope the hint to the
animation window rather than delete it.

- **`features/biblioteca/components/DestacadosBiblioteca.tsx:230`**
  (a) `[data-viajera]`, four `aspect-[3/4]` portrait tiles. Hints **transform**.
  (b) **Scrub-driven** (`scrub: true` at lines 114, 152, 167): they converge on a slot inside a
  pinned section and get swept by each divider.
  (c) No GSAP-set will-change.
  (d) **TOGGLE** on the pin's `onToggle`.
  Verdict: TRUE POSITIVE as written, since "permanent" is the rule's point (medium).
  Risk: **medium** — a promotion that lands mid-scrub can cost a frame.

- **`features/home/components/ComoTrabajamos.tsx:271`**
  (a) `[data-paso]`, four stacked step panels. Inline
  `style={{ willChange: "opacity, transform, filter" }}`. Hints **opacity + transform + filter**.
  (b) **Scrub-driven** (`scrub: 1`): a cross-fade that really does animate
  `filter: blur(8px) → blur(0px)` per frame (lines 97-140).
  (c) No GSAP-set will-change.
  (d) **TOGGLE** on the pin. The `filter` entry is both the expensive part and the load-bearing
  part, so it should not simply be dropped.
  Verdict: NEEDS-HUMAN-REVIEW (medium). Risk: **medium**.

- **`features/investigacion/casos/ExpedienteCaso.tsx:439`**
  (a) The "APRENDIZAJE" post-it (`bg-azul-claro`, rotated 1.6deg). Carries both
  `data-pieza-parallax` and `data-exp-asienta`. Hints **transform**.
  (b) Mixed, same as `LaminaCaso`: a one-shot settle plus `gsap.quickTo` mouse parallax gated on
  `QUERY_PUNTERO_FINO`. Intermittent, not continuous.
  (c) No GSAP-set will-change.
  (d) **TOGGLE by relocation** into the parallax effect (lines 191-219), which already has the
  right gate and a cleanup that resets `x`/`y`.
  Verdict: NEEDS-HUMAN-REVIEW (medium). Risk: **low-medium**.

- **`features/novedades/components/RotadorPalabras.tsx:276`**
  (a) `[data-reel]`, per-character reel. Inline `style={{ willChange: "transform" }}`.
  Hints **transform**.
  (b) **Repeatedly animated** — this is a word rotator, so each cycle re-runs the reel. Element
  count is (word length x rotation). The code already calls
  `gsap.set(reel, { clearProps: "transform" })` after each cycle (lines 53, 175).
  (c) No GSAP-set will-change.
  (d) **TOGGLE** on the same lifecycle as the existing `clearProps`: set it in the tween's
  `onStart`, clear it beside the `clearProps` call.
  Verdict: NEEDS-HUMAN-REVIEW (medium). Risk: **low**.

- **`features/quienes-somos/components/OrigenEd.tsx:582`**
  (a) `[data-photo-panel]`, a full-height desktop photo panel (`hidden md:block`).
  Hints **transform**.
  (b) **Scrub-driven at two windows**: an entry `fromTo` (lines 285-294, `scrub: true`) and an
  exit around line 513. Idle in between.
  (c) No GSAP-set will-change.
  (d) **TOGGLE** on the entry trigger.
  Verdict: NEEDS-HUMAN-REVIEW (medium). Risk: **medium**.

- **`features/que-hacemos/components/TorreLineas.tsx:914`**
- **`features/que-hacemos/components/TorreLineas.tsx:928`**
- **`features/que-hacemos/components/TorreLineas.tsx:965`**
  (a) 914 is `towerRef`, the whole 7-drum 3D tower. 928 is the floating photo inside each drum
  (7 of them, each a 30vmin circle). 965 is the drum wrapper (7 of them). All hint **transform**.
  (b) **Continuously driven, and the strongest case in the codebase.** `pintar()` writes
  `tower.style.transform` and each drum's transform **directly on every scrub tick**
  (`scrub: 0.5`, `onUpdate: pintar`), with no GSAP tween in the path. The file's own comment at
  lines 618-621 notes the per-frame ticker was deliberately removed, so nothing moves when the
  scroll is still.
  (c) No GSAP-set will-change. Note 914 and 965 also carry `transformStyle: preserve-3d`.
  (d) **TOGGLE** on the section trigger. The file already has a `mostrar(self)` callback wired
  into all four edge callbacks plus `onRefresh`, so the hook is free.
  Verdict: NEEDS-HUMAN-REVIEW, leaning KEEP-WITH-JUSTIFICATION (medium-high). Risk: **medium**.
  Cost note: 15 promoted layers carrying 30vmin photos, desktop-only (`live`).

### 1c. Keep with justification (5 sites)

Continuously driven and cheap. Removing these is the risky direction.

- **`features/home/components/Hero.tsx:389`**
  (a) `[data-card-mouse]`, the mouse-parallax layer of each hero card. Hints **transform**.
  (b) **Continuous.** Its transform reads `--pnx` / `--pny`, which a permanent RAF lerp
  (`tick()`, lines 327-332) rewrites every frame for as long as the hero is mounted, with
  `EASE = 0.09` trailing. Desktop-only (`hidden lg:block`).
  (c) No GSAP-set will-change.
  (d) **KEEP-WITH-JUSTIFICATION.**
  Verdict: FALSE POSITIVE in practice (medium-high). Risk to remove: **high** — this is the
  signature effect of the home hero.

- **`features/home/components/HeroQuienes.tsx:257`**
  (a) `[data-wipe-line]`, the green seam line. **3px wide**. Hints **transform**.
  (b) **Continuous.** `gsap.set(line, { x, scaleY: openScale(p) })` runs on every scrub tick
  (lines 148-160).
  (c) No GSAP-set will-change.
  (d) **KEEP-WITH-JUSTIFICATION.** Memory cost is negligible: 3px by viewport height.
  Verdict: FALSE POSITIVE in practice (medium-high). Risk to remove: **high** — the seam would judder.

- **`features/que-hacemos/components/CaminoDeTrabajo.tsx:201`**
  (a) `trackRef`, the horizontal train (`flex h-full w-max`), N full screens wide.
  Hints **transform**.
  (b) **Continuous** x-translation through a pinned section (`scrub: 0.6`), and the comment at
  lines 73-75 notes the scrub keeps moving after the scroll stops.
  (c) No GSAP-set will-change.
  (d) **KEEP-WITH-JUSTIFICATION.**
  Verdict: NEEDS-HUMAN-REVIEW, leaning keep (medium). Risk to remove: **high**.
  Cost note: this is the single largest layer in the app, roughly 7 viewport-widths of texture,
  but it is only mounted when `live`.

- **`features/que-hacemos/components/EnfoqueTransformacion.tsx:159`**
  (a) `[data-enf-nueva]`, per-character spans of `PALABRA_NUEVA = "TRANSFORMACIÓN"`, so 14 spans.
  Hints **transform**.
  (b) **Continuous within its pin** (`scrub: 0.5`, lines 84-89).
  (c) No GSAP-set will-change.
  (d) **KEEP-WITH-JUSTIFICATION.** Tiny elements.
  Verdict: FALSE POSITIVE in practice (medium). Risk to remove: **medium**.

- **`features/quienes-somos/components/OrigenEd.tsx:630`**
  (a) `[data-notch-rail]`, a **22px-wide** sliver on the panel's left edge. Hints **transform**.
  (b) **The longest continuous travel in the file**: `yPercent 8 → 74` across 5.3 units of the
  scrubbed master timeline (line 511). The inline comment explicitly says GSAP slides it with
  `yPercent` precisely so the move stays composited with no reflow.
  (c) No GSAP-set will-change.
  (d) **KEEP-WITH-JUSTIFICATION.** Cheapest element with the longest animation.
  Verdict: FALSE POSITIVE in practice (high). Risk to remove: **medium**.

---

## 2. react-doctor/no-transition-all (13 sites)

All thirteen are **TRUE POSITIVE (high confidence)** with **low** animation risk. The value of
the fix is that the property list becomes explicit and stops transitioning things nobody
intended. Below, the properties that actually change on hover / focus / state, and the
replacement class.

| # | Site | Properties that actually change | Proposed replacement |
|---|---|---|---|
| 1 | `components/ui/ButtonPrimary.tsx:18` (className on line 20) | `background-color` (`hover:bg-naranja-accion/90`), `box-shadow` (`hover:shadow-md`, `hover:shadow-naranja-accion/30`) | `transition-[background-color,box-shadow]` |
| 2 | `features/contacto/components/ContactoExperiencia.tsx:817` (className on 820) | `border-color` (`hover:border-verde-concepto/50`), `background-color` (`hover:bg-white`), `box-shadow` | `transition-[border-color,background-color,box-shadow] duration-300` |
| 3 | `features/contacto/components/ContactoExperiencia.tsx:850` (className on 853) | `color` (`group-hover:text-verde-concepto`), `transform` (`group-hover:translate-x-1`) | `transition-[color,transform] duration-300` |
| 4 | `features/contacto/components/ContactoExperiencia.tsx:1013` (className on 1016) | `background-color`, `box-shadow` | `transition-[background-color,box-shadow]` |
| 5 | `features/home/components/BibliotecaNovedades.tsx:100` | `color` (`group-hover:text-naranja-accion`), `transform` (translate x and y) | `transition-[color,transform] duration-300` |
| 6 | `features/home/components/BibliotecaNovedades.tsx:165` | identical to #5 | `transition-[color,transform] duration-300` |
| 7 | `features/home/components/ComoTrabajamos.tsx:366` | `color` (`group-hover:text-white`), `background-color`, `border-color` | `transition-colors duration-500` |
| 8 | `features/home/components/LineasAccion.tsx:421` | `color`, `background-color`, `border-color` | `transition-colors duration-500` |
| 9 | `features/investigacion/casos/CarpetaCaso.tsx:253` | `opacity` (0 → 100), `transform` (`motion-safe:translate-y-1` → `translate-y-0`) | `transition-[opacity,transform] duration-300` |
| 10 | `features/investigacion/casos/CarpetaCaso.tsx:280` | `opacity`, `transform` (`motion-safe:translate-y-2` → 0) | `transition-[opacity,transform] delay-[250ms] duration-[400ms]` |
| 11 | `features/investigacion/casos/NavegacionCasos.tsx:58` (className on 62) | `background-color` (`hover:bg-naranja-accion-texto/90`), `box-shadow` (`hover:shadow-md`) | `transition-[background-color,box-shadow]` |
| 12 | `features/que-hacemos/components/QueHacemosHero.tsx:576` | `width` (`w-0` → `w-[1.1em]`), `transform` (`-translate-x-1` → `translate-x-1`), `opacity` | `transition-[width,transform,opacity] duration-300` |
| 13 | `features/que-hacemos/components/TorreLineas.tsx:869` | `width` (`w-1` → `w-3`), `opacity`, `background-color` (`bg-current` → `bg-verde-concepto`) | `transition-[width,opacity,background-color] duration-300` |

Two caveats:

- **#12 and #13 animate `width`**, a layout property. Naming it explicitly makes the cost
  visible but does not remove it. If someone wants these to be cheap, that is a separate
  redesign (for example, a `scale-x` on a fixed-width element), not a lint fix.
- **#7 and #8** are the two cases where Tailwind's built-in `transition-colors` is exactly right:
  it covers `color`, `background-color`, `border-color`, `text-decoration-color`, `fill` and
  `stroke`, which is precisely the set that changes.

Adjacent finding, not flagged but in the same file: **`NavegacionCasos.tsx:42`**, the wrapper of
the flagged button, also uses `transition-all duration-300` while only `opacity` and `transform`
change. Worth fixing in the same pass as `transition-[opacity,transform]`.

---

## 3. react-doctor/no-scale-from-zero (1 site)

- **`components/ui/CtaButton.tsx:31`**

  **The animation.** The element is an `aria-hidden` overlay inside the orange CTA pill:
  `absolute inset-0 origin-left scale-x-0 bg-black/15 transition-transform duration-500 ease-out
  group-hover:scale-x-100`. On hover it is a **left-anchored dark veil that wipes across the
  button** over 500ms. The parent `Link` is `overflow-hidden rounded-full`, and the component's
  own doc comment describes it as a "sweep de relleno en hover (clip por scaleX)". The sibling
  effect is a micro text-swap on the label, so the whole button is transform-only by design.

  **Verdict:** TRUE POSITIVE (medium). The rule's concern is real: at `scale: 0` the element
  collapses to zero area, and some engines skip rasterizing or compositing it, which produces a
  first-frame pop when it un-collapses.

  **Would starting from 0.01 preserve the look?** Yes. `scale-x-[0.01]` on a pill of roughly
  150px is about 1.5px of dark veil pinned at the left edge, sitting under a `rounded-full`
  `overflow-hidden` clip, against a `bg-naranja-accion` ground, at only 15% black. Not
  perceptible at rest.

  **Would starting from opacity preserve the look?** No. The gesture is a **directional wipe**.
  Fading the whole veil in would turn it into a flat, uniform darkening and lose the
  left-to-right reading that the component was built around. Opacity is not an equivalent
  substitute here.

  **Proposed fix:** change `scale-x-0` to `scale-x-[0.01]`. Risk: **low**.

---

## 4. react-doctor/nextjs-no-img-element (8 sites)

### `next.config.ts` — images configuration

**There is no `images` key at all.** The entire file is:

- `turbopack: { root: __dirname }`, with a comment explaining that in a git worktree two
  `pnpm-workspace.yaml` files coexist and Turbopack can pick the wrong root, which makes the dev
  server 404 on everything.
- one redirect, `/que-es-ed` → `/quienes-somos`, `permanent: false`.

So every `next/image` default applies, and **no `remotePatterns` are configured**, meaning remote
sources would be rejected. That is not a blocker here: all eight `<img>` sources are local
`/public` paths, so no remote permission is needed for any of these conversions.

### The sites

- **`components/layout/Footer.tsx:175`**
  **Source:** `aliado.src`, from the module-level `ALIADOS` const at `Footer.tsx:50`. All four are
  local `/public` paths: `/aliados/techint.png`, `/aliados/roberto-rocca.svg`,
  `/aliados/buenos-aires.png`, `/aliados/science-up.png`. Not remote, not data URIs. Dynamic only
  in the sense of a `.map` over a frozen const.
  **Dimensions:** not declared in the data, but statically knowable from the files:
  techint.png is 930x240, buenos-aires.png is 727x240, science-up.png is 1668x428, plus one SVG.
  Rendered height is fixed per entry by the `cls` field (`h-7`, `h-7`, `h-9`, `h-10`) with `w-auto`.
  **Container:** not animated and not clipped. The only motion is `transition-opacity duration-300`
  on hover. `fill` would not be needed; explicit `width`/`height` with `style={{ height: "auto" }}`
  is the right shape.
  **Reason `<img>` was chosen:** none given. There is a bare
  `{/* eslint-disable-next-line @next/next/no-img-element */}` and no prose comment.
  **Verdict:** NEEDS-HUMAN-REVIEW (medium). The conversion is mechanical for the three PNGs (add
  `width`/`height` to each `ALIADOS` entry), but `next/image` will not optimize the SVG without
  `dangerouslyAllowSVG`, and the payoff is small: four tiny monochrome logos
  (`[filter:brightness(0)_invert(1)]`) below the fold. Risk: **low**.

- **`features/home/components/DatosDuros.tsx:135`**
  Identical in every respect to the Footer case: the same four logos, through a **duplicated**
  `ALIADOS` const at `DatosDuros.tsx:33` that differs from the Footer's only in the `science-up`
  height class (`h-11` vs `h-10`). Same eslint-disable with no prose reason, same
  `transition-opacity` hover, same non-animated container.
  **Verdict:** NEEDS-HUMAN-REVIEW (medium). Risk: **low**.
  Worth flagging to the team independently of this rule: `ALIADOS` is duplicated verbatim across
  two files.

- **`features/quienes-somos/components/profile/ImmersiveProfile.tsx:476, 486, 609, 619, 788, 797`**
  All six render `profile.cutout`, a local path from `features/quienes-somos/data/equipo.ts`:
  `/equipo/daniela-reyes-cutout.webp`, `/equipo/karla-gomez.jpg`, `/equipo/raquel-ayala.jpg`,
  `/equipo/judith-hernandez.jpg`, `/equipo/luis-lopez.jpg`, `/equipo/wendolyne-rios.jpg`,
  `/equipo/paola-balda.jpg`, `/equipo/darly-ku-euan.jpg`, `/equipo/luis-cabrera.jpg`,
  `/equipo/eduardo-briceno.jpg`. Dynamic per profile, but all local, none remote, none data URIs.
  **Dimensions:** not declared anywhere in the data model (`Profile.cutout` is just `string?`),
  but statically knowable since the files are local. Measured samples:
  `daniela-reyes-cutout.webp` is 1093x1240, `karla-gomez.jpg` is 581x1032.
  **Reason `<img>` was chosen:** none stated at any of the six. Each carries only an
  `eslint-disable-next-line @next/next/no-img-element`.

  They split into two shapes:

  **Fixed-aspect, clipped: `fill` candidates.**
  - **`:486`** — `figura === "marco"` header variant. Parent is
    `aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-[1.5rem]`; the img is
    `h-full w-full object-cover`. Clean `fill` conversion.
    TRUE POSITIVE (high). Risk: **low**.
  - **`:609`** — the fixed portrait, `marco` variant. Parent is
    `h-[min(58vh,520px)] w-[clamp(14rem,21vw,19rem)] overflow-hidden rounded-[1.75rem]`.
    `fill` works geometrically. TRUE POSITIVE (high). Risk: **medium**, see the FLIP note below.
  - **`:788`** — the closing figure, `marco` variant, inside
    `h-full w-[calc(min(36vh,320px)*0.8)] overflow-hidden rounded-[1.4rem]`.
    Clean `fill` conversion. TRUE POSITIVE (high). Risk: **low**.

  **Intrinsic-ratio sizing: `fill` will NOT work.**
  - **`:476`** — `figura === "recorte"` header. `mx-auto max-h-[52vh] w-auto object-contain`.
    Width derives from the intrinsic ratio, so this needs real `width`/`height`.
    TRUE POSITIVE (high), NEEDS-HUMAN-REVIEW on the fix. Risk: **low**.
  - **`:619`** — the fixed portrait, `recorte` variant. `h-full w-auto object-contain
    object-bottom` plus a `maskImage` / `WebkitMaskImage` linear-gradient fade and a
    `drop-shadow`. Needs real `width`/`height`. TRUE POSITIVE (high). Risk: **medium**, see below.
  - **`:797`** — the closing figure, `recorte` variant. `h-full w-auto object-contain
    object-bottom` plus a mask gradient. Needs real `width`/`height`.
    TRUE POSITIVE (high). Risk: **low**.

  **Why `:609` and `:619` are the risky pair.** Both carry `portraitImgRef` and sit inside
  `portraitMoverRef`. Three things depend on the raw `<img>` there:
  1. The opening FLIP measures `getBoundingClientRect()` on the origin card's `img` and on
     `portraitOuterRef`, then tweens the mover with `x`/`y`/`scale` (lines 380-400).
  2. `setupPath()` and `ScrollTrigger.refresh()` are re-run on a `requestAnimationFrame`, on
     resize, **and on the image's `load` event** (lines 430-436): `if (img && !img.complete)
     img.addEventListener("load", onImgLoad, { once: true })`.
  3. The mover is scrub-animated afterwards.

  With `fill`, `next/image` renders its own `<img>` inside a wrapper `span`, so both the ref and
  the `load` listener have to move to the component's `onLoad` prop, and the FLIP's measurement
  target may shift by one DOM level. That rewiring, not the image tag itself, is the real cost.

  **Bottom line for the six:** the rule is correct that they bypass Next's optimizer, but the fix
  is a small data-model change (dimensions on `Profile`) plus a ref rewiring for two of them. Four
  are low-risk mechanical conversions; two need care.

---

## 5. prefer-module-scope-pure-function (5) and prefer-module-scope-static-value (2)

All seven are **TRUE POSITIVE (high confidence)**, with **no animation risk**. None of them closes
over props or state, so hoisting is possible in every case.

### prefer-module-scope-pure-function

- **`features/biblioteca/components/CategoriasRail.tsx:65`** — `irAlListado`.
  `() => document.getElementById("materiales")?.scrollIntoView({ behavior: "smooth" })`.
  Closes over nothing: a hard-coded element id and DOM globals. Genuinely pure with respect to the
  component. **Hoist verbatim.** Risk: none.

- **`features/biblioteca/components/CategoriasRail.tsx:68`** — `flechaClase(activa: boolean)`.
  Returns a template-literal class string built from its own argument only. No props, no state, no
  refs. **Hoist verbatim.** Risk: none.

- **`features/novedades/components/FichaNovedad.tsx:57`** — `irASeccion(e, id)`.
  Uses `document.getElementById`, `getLenis()` and `window.scrollTo`, all module-level or global.
  The `-120` offset is a literal. No closure over props or state. **Hoist verbatim.** Risk: none.
  (Contrast with `volver` just above it at line 49, which closes over `abrir` and correctly stays
  inside the component. The linter did not flag that one, which is right.)

- **`features/novedades/components/LanzamientosRecientes.tsx:36`** — `hoverFine`.
  `() => window.matchMedia("(hover: hover)").matches`. **Hoist verbatim.** Risk: none.
  Note: it reads at call time, so hoisting does not freeze the value across a device change.

- **`features/que-hacemos/components/QueHacemosHeroFaro.tsx:160`** — `irALineas(e)`.
  Reads `document.getElementById("lineas")`, `window.scrollY`, `getLenis()`. No props, no state,
  no refs. **Hoist verbatim.** Risk: none.
  The file already keeps module-scope helpers (for example `despues` at line 140 and
  `DURACION_RECORRIDO` at 147), so this fits the file's own conventions. Its long explanatory
  comment about the `+4px` offset should travel with it.

### prefer-module-scope-static-value

- **`features/novedades/components/NovedadDestacada.tsx:151`** — `verdeSobreAzul`.
  `{ color: "color-mix(in srgb, var(--color-verde-concepto) 62%, white)" }`. A frozen string in an
  object literal, rebuilt on every render and passed as a `style` prop, so the new identity also
  defeats any downstream memoisation. **Hoist as a module const.** Risk: none.
  Keep the two-line contrast comment above it (verde-concepto on azul-principal is about 3.9:1 and
  fails AA at small sizes; lightened 62% with white it passes).

- **`features/quienes-somos/components/profile/profileParts.tsx:282`** — `offsets`.
  `[0, 14, -8, 18, 4]` inside `MapaBlock`. A pure literal array, indexed by `i % offsets.length`
  to scatter the tags. **Hoist as a module const.** Risk: none.

---

## Summary

| Rule | Sites | Fix directly | Toggle / review | Keep |
|---|---|---|---|---|
| `no-permanent-will-change` | 32 | 19 | 8 | 5 |
| `no-transition-all` | 13 | 13 | 0 | 0 |
| `no-scale-from-zero` | 1 | 1 | 0 | 0 |
| `nextjs-no-img-element` | 8 | 4 | 4 | 0 |
| `prefer-module-scope-*` | 7 | 7 | 0 | 0 |
| **Total** | **61** | **44** | **12** | **5** |

### Highest-value single finding

`FaroEscena.tsx:524, 530, 543, 548`. Four full-viewport layers carry a permanent `will-change`
hint that the doc comment three lines above them explicitly says should not be there, quoting a
cost of roughly 30MB per layer. The choreography already applies the hint correctly to their
parents at `QueHacemosHeroFaro.tsx:244`. On mobile and reduced-motion, where the choreography
never runs, the fallback pays a cost it was explicitly designed to avoid. This is a documented
regression, not a judgment call, and the fix is a class deletion plus one selector added to an
existing `gsap.set`.

### Cheapest wins

The 13 `transition-all` sites, the 7 module-scope hoists, and the 19 remove-outright
`will-change` sites are all mechanical, low-risk, and independently reviewable. That is 39 of the
61 findings with no design decision attached.

### Sites needing a product or engineering decision

1. **`ComoTrabajamos.tsx:271`** — whether to keep `filter` in the hint. The `blur(8px)` cross-fade
   is real and scrubbed, so dropping it may trade memory for re-raster jank.
2. **`TorreLineas.tsx:914, 928, 965`** — whether 15 simultaneous promoted layers of 30vmin photos
   should persist for the whole page or toggle on the section trigger. The toggle hook already
   exists (`mostrar`), so the only question is whether a promotion at the section boundary is
   visible.
3. **`Hero.tsx:389`, `CaminoDeTrabajo.tsx:201`, `OrigenEd.tsx:572`** — all continuously driven and
   all expensive. These want a real measurement before anyone touches them. `Hero.tsx:389` and
   `OrigenEd.tsx:572` may be removable purely because `perspective` and `preserve-3d` already
   force the layer, which is a cheap thing to verify in DevTools' layer panel.
4. **`ImmersiveProfile.tsx:609, 619`** — whether to add `width`/`height` to the `Profile` data
   model and rewire the FLIP's `load` listener onto `next/image`'s `onLoad`, or to leave the plain
   `<img>` in place and keep the eslint-disable.
5. **`Footer.tsx:175` and `DatosDuros.tsx:135`** — whether four small below-the-fold logos, one of
   them an SVG that `next/image` will not optimize anyway, are worth converting at all.
