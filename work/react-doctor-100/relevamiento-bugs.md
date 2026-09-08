# react-doctor v0.9.13 findings survey

Repo: `C:\Briar\repos\work\Empoderamiento-Docente` (Next.js 16 / React 19.2, TypeScript strict, Tailwind v4, GSAP + Lenis).
Scope: read-only survey of 25 findings. Paths below are relative to `src/`. Every line number was verified against the file.

---

## no-unguarded-browser-global-in-render-or-hook-init (ERROR)

- **`features/biblioteca/components/DestacadosBiblioteca.tsx:89`** — FALSE POSITIVE (high) — `const S = () => (window.innerHeight - H()) / 2` is a lazy arrow defined inside `gsap.matchMedia().add()` inside `gsap.context()` inside `useIsomorphicLayoutEffect`, so `window` is never touched at definition time and the effect never runs on the server — no fix needed, optionally silence with a rule disable — risk: none.
- **`features/quienes-somos/components/MiradaEd.tsx:232`** — FALSE POSITIVE (high) — same shape: `const W = () => document.documentElement.clientWidth` is a deferred reader inside the `gsap.context` of a layout effect guarded by `if (!live) return`, and `live` only turns true after a client-side `matchMedia` check — no fix needed — risk: none.
- **`features/quienes-somos/components/MiradaEd.tsx:233`** — FALSE POSITIVE (high) — identical to the line above, `const H = () => window.innerHeight` — no fix needed — risk: none.
- **`features/novedades/components/FichaNovedad.tsx:32`** — TRUE POSITIVE (medium) — `sessionStorage.getItem` runs inside a `useState` lazy initializer, which does execute during server render, so the server throws into the `catch` and returns `false` while the client can return `true`, making the initial state genuinely differ between the two renders — fix: guard the initializer with `typeof window === "undefined" ? false : ...` so the server branch is explicit rather than exception-driven — risk: low.

### Note on FichaNovedad:32

The mismatch is invisible today. `espera` only feeds the `delay` prop of `RevealLines` and `RevealImage`, and both consume `delay` exclusively inside a `useEffect` GSAP tween, so no rendered attribute differs and React logs no hydration error.

Moving the read into an effect would break the feature: the reveal timeline is built on the first client effect and needs the delay already known at that point. The author already documented the constraint in a comment at lines 28-29 ("Solo LEER en el initializer... el flag se consume despues, en un efecto"), and the consumption side is correctly deferred to a `useEffect` at line 37. The proposed fix keeps all of that and only makes the SSR branch explicit.

The three MiradaEd / DestacadosBiblioteca hits look like the linter matching the identifier `window` or `document` lexically inside a hook body without tracking that the reference sits behind an arrow-function boundary that is only ever called from a ScrollTrigger callback.

---

## no-ref-current-in-render (ERROR)

- **`features/que-hacemos/components/TorreLineas.tsx:693-697`** — TRUE POSITIVE (high) — five ref arrays are reset in the component body on every render, then repopulated during commit because the inline callback refs get a fresh identity each render and React detaches and reattaches them; a render that React discards without committing would clear the arrays and never refill them — fix: delete the five reset lines and seed the two nested arrays at their `useRef` instead, `useRef<(HTMLSpanElement | null)[][]>(TAMBORES.map(() => []))` and the same for `chipRefs` — risk: low.

### Mechanism in detail

The flagged block is:

```tsx
  drumRefs.current = [];
  spanRefs.current = TAMBORES.map(() => []);
  railRefs.current = [];
  fotoRefs.current = [];
  chipRefs.current = TAMBORES.map(() => []);
```

It sits at top level in the component body, immediately after the `useIsomorphicLayoutEffect` that consumes those refs (deps `[live, geo]`). The refs are declared at lines 166-175 and read inside the effect at lines 457, 458, 502, 569 and 597. They are written from inline callback refs in the JSX at lines 854, 925, 963, 997 and 1015.

Today this works. Each callback ref is a fresh arrow on every render, so React detaches the old one (calling it with `null`) and attaches the new one (calling it with the element) on every commit, which refills the arrays the render just cleared. Under StrictMode's double render the array is cleared twice and refilled once at commit, which is still correct.

The hazard is a render that React never commits, which React 19 can produce for a discarded transition or a suspended tree. The arrays are cleared during that render and nothing repopulates them, so a subsequent effect run would read empty arrays and the whole tower choreography would silently no-op.

### Why the proposed fix is safe here

- `TAMBORES` is a module-level constant, so the list has a fixed length and never reorders.
- The drum JSX at lines 957-963 is unconditionally mounted and already keyed `key={t.id}`; there is no `live &&` or ternary wrapping it in the 830-1020 range.
- Every index slot is rewritten on every commit, so no stale non-null entry can survive.

Consequently the reset is dead weight, not load-bearing, and deleting it preserves behavior exactly. `spanRefs` and `chipRefs` need their seed moved to the `useRef` initializer because the JSX writes `spanRefs.current[i][j] = el`, which would throw on an undefined inner array.

### Alternative fix

If a future change makes the drums conditionally mounted, use React 19 ref cleanup instead of the seed:

```tsx
ref={(el) => { drumRefs.current[i] = el; return () => { drumRefs.current[i] = null; }; }}
```

This also removes the render-phase write and additionally clears slots on unmount.

---

## prefer-use-effect-event

- **`features/investigacion/casos/CasosInvestigacion.tsx:280`** — FALSE POSITIVE (medium) — the dep is `solicitarCierre`, a `useCallback` whose only dep chain is `cerrar`, which depends on `[reduced, detenerScroll, reanudarScroll]`, all stable, so the keydown listener re-subscribes on `activo` alone and never on a changing callback — optional cleanup: wrap the Escape handler in `useEffectEvent` and drop the `useCallback` chain — risk: low.
- **`features/investigacion/casos/CasosInvestigacion.tsx:295`** — FALSE POSITIVE (medium) — same stable-`cerrar` story, though this one does churn on `estado`, re-subscribing the `popstate` listener four times per open as the state walks index, opening, open, closing — optional cleanup: `useEffectEvent` for the handler, keeping `activo` and `estado` only for the early-return guard — risk: low.

### Supporting detail

`cerrar` is defined at line 213 with deps `[reduced, detenerScroll, reanudarScroll]`. Both `detenerScroll` (line 101) and `reanudarScroll` (line 108) are `useCallback` with empty dep arrays, and `reduced` comes from `useReducedMotion`, which only changes when the OS preference changes. So `cerrar` is effectively frozen for the life of the component, and `solicitarCierre` (line 230, deps `[cerrar]`) with it.

Both handlers already read live state through refs (`estadoRef.current`, `historialRef.current`, `cierrePendienteRef.current`) rather than through closure, which is the pattern `useEffectEvent` exists to replace. Adopting `useEffectEvent` would let the component delete the two `useCallback` wrappers and read `estado` directly instead of through `estadoRef`, which is a genuine simplification, but it fixes no bug and touches the most timing-sensitive code in the file. Low priority.

The re-subscription churn on the second effect is real but harmless: adding and removing a `popstate` listener four times per expediente open costs nothing measurable.

---

## html-no-nested-interactive

- **`features/contacto/components/PaisDropdown.tsx:168`** — TRUE POSITIVE (medium) — a `<button tabIndex={-1}>` sits inside `<li role="option">`, and ARIA gives `option` presentational children, so assistive tech strips the button's semantics; keyboard users are unaffected since navigation runs through the trigger's `onKeyDown` and an `active` index — fix: hoist `onClick`, `onMouseEnter` and the className onto the `<li>` itself and delete the inner button, keeping `role`, `aria-selected` and the ref — risk: low.

### Supporting detail

The structure is `<ul role="listbox">` containing `<li role="option" ref={...} aria-selected={elegido}>` wrapping `<button type="button" tabIndex={-1} onClick={...} onMouseEnter={...}>`.

The `<li>` itself carries no `tabindex`, so there is no nested *focusable* pair and no tab-order bug. The real defect is the ARIA content model: `option` is one of the roles whose children are presentational, so a screen reader flattens the inner button to its text content and the button role is discarded. The button exists only to carry click and hover handlers plus the row styling, all of which move to the `<li>` without loss.

Keyboard interaction is unaffected because it never used the button: the trigger button at line 129 owns `onKeyDown`, and highlight state is tracked by the `active` index with `optionRefs` for scroll-into-view.

One thing to check while making the change: the listbox uses `aria-controls` on the trigger but does not appear to use `aria-activedescendant`. If the intent is full listbox semantics, each `<li>` needs an `id` and the trigger needs `aria-activedescendant` pointing at the highlighted one. That is a separate improvement, not part of this fix.

---

## no-prevent-default

- **`features/biblioteca/components/BibliotecaHero.tsx:123`** — FALSE POSITIVE (high) — `e.preventDefault()` on a `role="search"` form with no `action` that scrolls to `#materiales`, the standard client-side pattern — no fix — risk: none.

### Separate product flag

The handler discards the typed query entirely:

```tsx
onSubmit={(e) => {
  e.preventDefault();
  document.getElementById("materiales")?.scrollIntoView({ behavior: "smooth" });
}}
```

The `<input id="biblioteca-buscar" type="search">` value is never read. A user who types a search term and gets a scroll to an unfiltered list will read the feature as broken. The code comment above the form already admits this ("por ahora ancla al futuro listado (#materiales); cuando exista el catalogo, pasa a filtrarlo de verdad"), so it is known and deliberate, but it is worth surfacing to product rather than leaving it buried in a lint report. Not a lint issue.

---

## prefer-html-dialog

- **`components/layout/MobileNav.tsx:174`** — TRUE POSITIVE (medium) — the panel is a permanently mounted `div role="dialog" aria-modal="true"` portaled to body, opened by GSAP `autoAlpha` with `visibility:hidden` as the closed state — fix: keep the markup and add a focus trap, or migrate to `<dialog>` with `showModal()` and `close()` — risk: medium.
- **`features/quienes-somos/components/TeamProfileOverlay.tsx:258`** — NEEDS-HUMAN-REVIEW (medium) — a hand-built modal that already does everything a native dialog would, and does some of it better — fix: no change, or a scoped migration that only replaces the manual `inert` loop and Tab trap — risk: high.

### What both already do

Both use `createPortal` to `document.body`, and both already carry `role="dialog"` and `aria-modal="true"`. The mobile panel adds `aria-hidden={!open}` and `aria-label="Menu de navegacion"`; the overlay adds an `aria-label` naming the person.

Scroll lock is the shared `useLockScroll` hook at `src/lib/hooks/useLockScroll.ts`. It refcounts consumers at module scope (`activeLocks`, `originalOverflow`) and only restores `document.body.style.overflow` when the last consumer releases, so a mobile menu and a profile overlay open at the same time do not clobber each other.

The overlay additionally stops Lenis, saves `window.scrollY` before opening, and on close reasserts that scroll position across two `requestAnimationFrame` callbacks plus a 180 ms `setTimeout`, because the LenisProvider's ResizeObserver refresh was making the page drift to the previous section.

### Where they diverge

| | MobileNav | TeamProfileOverlay |
|---|---|---|
| Mount | always mounted, hidden | mounted per open |
| Rest of page | nothing | `aria-hidden` + `inert` on all body siblings |
| Tab trap | none | manual, filtered to visible focusables |
| Escape | keydown listener | keydown listener with `preventDefault` |
| Focus restore | back to the burger button | back to the origin card, after `inert` is removed |
| Exit animation | timeline `.reverse()` | GSAP FLIP or fade, unmount in `onComplete` |
| Scroll restore | none needed | saved Y, reasserted three times |

### MobileNav specifics

Open and close is a `useState` boolean. The timeline is built once in a `useEffect` gated on `hydrated` and `reduced` (lines 90-128) and stored in `tlRef`. A second effect (lines 131-150) plays or reverses it and moves focus: to the close button on open, back to the burger on close, skipping the very first run via `firstFocusRun` so it does not steal focus at page load. Escape is a `window` keydown listener gated on `open`. Route changes close it through a render-phase state adjustment comparing `pathname` against `prevPath`. Hydration is handled with `useSyncExternalStore` returning `true` on the client and `false` on the server, so the portal only mounts post-hydration.

The real gap: no focus trap and no `inert` on the rest of the page. The panel is portaled last in `<body>`, so Tab from its final link leaves the document, but nothing stops Shift+Tab or a subsequent Tab cycle from landing on the page behind. `visibility: hidden` does correctly remove the closed panel's links from the tab order, so the closed state is fine.

A `<dialog>` migration is the better trade here. It would supply the focus trap, top-layer stacking and page inertness for free. The timeline only animates `autoAlpha` and `y` and performs no measurement, so `display: none` while closed costs nothing. Two adjustments would be required: call `close()` from the timeline's `onReverseComplete` so the exit animation is not cut off, and intercept `onCancel` with `preventDefault()` so Escape plays the reverse instead of closing instantly. Drop `aria-modal` once native, since it is implicit.

### TeamProfileOverlay specifics

Open and close is owned by the parent, which mounts and unmounts the component; `onClose` is a prop. The container `div` is created in a `useState` initializer and appended to `document.body` inside `useIsomorphicLayoutEffect`, deliberately in the layout phase, because a passive effect would measure the hero at 0 (breaking FLIP into a fade) and `focus()` on a disconnected button would be a no-op.

That same effect sets `aria-hidden` and `inert` on every body sibling, focuses the back button, and runs the enter animation. Two enter variants: the immersive one expands a `clip-path` inset from the origin card's `getBoundingClientRect()` to full bleed over 0.8s, and the shell one does a FLIP-lite on the hero image plus a content fade. The cleanup reverts the GSAP context, removes `inert` and `aria-hidden`, removes the container, restores focus to the origin card (explicitly after removing `inert`, since an inert element cannot take focus), and then does the three-stage scroll reassertion.

Exit is `requestClose`, guarded by `closingRef` against double-fire. Immersive exits by fade because a scroller cannot FLIP back to a card; the shell reverses the FLIP into the origin image. Either way `onComplete: finish` calls `onClose`, so the component unmounts only after the animation finishes.

The Tab trap (lines 219-244) is notably careful: it filters `querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')` down to elements that are actually visible (`offsetParent !== null || getClientRects().length > 0`), because in the immersive variant the close button can still be hidden by the reveal and would otherwise be treated as `last`, letting focus escape.

A `<dialog>` migration would let you delete the sibling `inert` loop and the Tab handler. Against that, you would have to reset the full UA style block for an `inset-0` full-bleed layout (`margin: 0; padding: 0; border: 0; max-width: 100vw; max-height: 100vh; width: 100%; height: 100%; background: transparent`), keep `close()` inside the existing `onComplete` so the FLIP exit survives, intercept `onCancel` for the same reason on Escape, and re-verify that the immersive variant still scrolls correctly as a top-layer element carrying `data-profile-scroller` and `data-lenis-prevent`. The FLIP measurements themselves are safe, since `getBoundingClientRect` stays viewport-relative in the top layer.

Net: a working, carefully tuned system traded for a moderate rewrite with real animation risk. This is a product call, not a lint fix.

---

## no-array-index-as-key

Every one of these maps a static array that comes from a checked-in TypeScript literal. Nothing is filtered at runtime, reordered, inserted into, or keyed off user input, so no element identity can ever shift and none of these can produce the bug the rule exists to catch.

**All twelve are FALSE POSITIVE (high), risk: none.** Stable keys are available for all but one, so the fixes are pure hygiene and can be batched into a single commit.

| file:line | what is mapped | source | proposed key |
|---|---|---|---|
| `features/novedades/components/FichaNovedad.tsx:141` | `s.parrafos`, a `string[]` | `NovedadSeccion` in `features/novedades/data.ts:76` | `key={parrafo}` |
| `features/quienes-somos/components/OrigenEd.tsx:884` | literal `["Vivir", "para", "hacer", "vivir."]` | inline in the JSX | `key={w}` plus hoist to a module constant |
| `features/quienes-somos/components/profile/ImmersiveProfile.tsx:681` | `headlineParts` | `profile.headline` split on `". "` at line 122 | `key={part}` |
| `profileParts.tsx:114` (`MiniList`) | `Milestone[]` | `stage.milestones`, `data/equipo.ts` | `key={m.title}` |
| `profileParts.tsx:167` (`FichaPanel`) | `stage.milestones` | same | `key={m.title}` |
| `profileParts.tsx:187` (`FichaPanel` branches) | `Branch[]` | `stage.branches` | composite of `b.place` and `b.period` |
| `profileParts.tsx:231` (`ConceptoBlock`) | `stage.milestones` into `CompactRow` | same | `key={m.title}` |
| `profileParts.tsx:262` (`HitosBlock` primaries) | `milestones.filter((m) => m.primary)` | same | `key={m.title}` |
| `profileParts.tsx:270` (`HitosBlock` rest) | `milestones.filter((m) => !m.primary)` | same | `key={m.title}` |
| `profileParts.tsx:287` (`MapaBlock`) | `stage.tags`, a `string[]` | same | `key={t}` |
| `profileParts.tsx:362` (`RamasBlock`) | `ProfilePublication[]` | `stage.publications` | `key={p.title}` |
| `profileParts.tsx:394` (`SintesisBlock`) | `milestones.filter((m) => !m.primary)` | same | `key={m.title}` |

All twelve live in `features/quienes-somos/components/profile/profileParts.tsx` except the first three.

### Data shapes (from `features/quienes-somos/data/equipo.ts`)

```ts
export type Milestone = {
  period?: string;
  title: string;        // required, unique within a stage in all current data
  detail?: string;
  primary?: boolean;
};

export type Branch = {
  period?: string;
  place: string;        // unique in current data, but not guaranteed
  detail: string;
};

export type ProfilePublication = {
  year?: string;
  kind: "Libro" | "Articulo" | "Coleccion" | "Materiales";
  title: string;        // required, unique
  meta?: string;
  concepts?: string[];
  featured?: boolean;
};

export type ProfileStage = {
  id: string;           // stages themselves DO have ids
  n: number;
  categoryId: string;
  // ...
  milestones?: Milestone[];
  branches?: Branch[];
  tags?: string[];
  publications?: ProfilePublication[];
};
```

`ProfileStage` has an `id`, but the nested `Milestone`, `Branch` and `ProfilePublication` types do not. Only `Branch` lacks a single naturally unique field, which is why it gets a composite key: two doctoral stays in the same country in the same year would collide on `place` alone. Everything else has one.

### Notes worth carrying into the fix

- **Lines 262 and 270 are the least defensible.** `HitosBlock` splits `stage.milestones` into `primarios` and `resto` with `.filter()`, and a filter is exactly the operation that decouples index from identity. They are safe only because `primary` is a build-time literal that never toggles. The same applies to line 394 in `SintesisBlock`.
- **Two of these use the index for layout, not just keying.** `MapaBlock:287` reads `offsets[i % offsets.length]` for the scatter transform, and `RamasBlock:362` uses `i % 2 === 1` for the `sm:translate-y-8` stagger. Those index uses stay exactly as they are; only the `key` changes.
- **The codebase already prefers text keys where one exists.** `PubPiece` in the same file keys concepts with `key={c}`, and the drum list in `TorreLineas` uses `key={t.id}`. So the convention is established and these are drift, not house style.
- **Changing keys cannot disturb the GSAP choreography.** The animation machinery finds elements by selector (`data-reveal-el`, `data-hero-el`) at effect time, not by React element identity, and since these lists never reorder no remount occurs.

---

## js-combine-iterations

- **`app/novedades/[slug]/page.tsx:9`** — FALSE POSITIVE (high) — `NOVEDADES.filter((n) => n.cuerpo).map((n) => ({ slug: n.id }))` inside `generateStaticParams`, which runs once at build time over a handful of entries — fix: none, a `flatMap` would read worse for zero gain — risk: none.
- **`features/quienes-somos/components/profile/ImmersiveProfile.tsx:124`** — FALSE POSITIVE (high) — `profile.stages.filter((s) => s.n <= activeStage).map((s) => s.categoryId)` feeding a `new Set`, over seven stages, re-run only when `activeStage` changes — fix: none — risk: none.

### Supporting detail on ImmersiveProfile:124

`activeStage` is set from ScrollTrigger `onEnter`, `onEnterBack` and `onLeaveBack` callbacks at lines 326-329, meaning it fires on stage boundaries, not per scroll frame. With seven stages that is roughly seven re-renders across a full read of a profile, each doing fourteen array steps. Immaterial.

The resulting `passedIds` is a fresh `Set` object on every render, which would matter if its consumer were memoized. It is not: `passedIds` is passed to `CategoryRail` at line 571, and `CategoryRail` (declared at `profileParts.tsx:421`) is a plain function component with no `memo` wrapper. So nothing is being invalidated.

---

## Summary

| Verdict | Count |
|---|---|
| True positive | 4 |
| False positive | 20 |
| Needs human review | 1 |
| **Total** | **25** |

### The four true positives

1. `TorreLineas.tsx:693-697` — render-phase reset of five ref arrays. **The only one worth fixing on its own merits.** Genuine concurrent-rendering hazard, five-line deletion, low risk.
2. `MobileNav.tsx:174` — custom modal. The rule flags the wrong thing; the actual defect it surfaces is the missing focus trap.
3. `PaisDropdown.tsx:168` — button inside `role="option"`. Real ARIA content-model defect, low practical impact, small fix.
4. `FichaNovedad.tsx:32` — session storage read in a `useState` initializer. Real but benign; the differing state never reaches the DOM.

### Recommended priority

1. **TorreLineas ref reset** — real hazard, trivial fix, low risk.
2. **MobileNav focus trap** — an actual accessibility bug the linter found sideways. Fix the trap; the `<dialog>` migration is optional on top.
3. **PaisDropdown nested button** — small, contained, improves screen-reader output.
4. **The twelve index keys** — batch into one hygiene commit, no behavior change.
5. **FichaNovedad SSR guard** — cosmetic; silences an ERROR-level rule without changing behavior.
6. **The two `useEffectEvent` sites** — optional simplification, touches timing-sensitive code, lowest value.

### Needs a product or UX decision

- **`TeamProfileOverlay.tsx:258`** — whether to migrate to native `<dialog>`. My recommendation is no. It already implements page inertness via `inert`, a visibility-filtered focus trap, focus restoration ordered after `inert` removal, and deterministic scroll recovery, all more thoroughly than a naive dialog port would. The migration buys deletion of two mechanisms at the cost of re-verifying the FLIP entrance, the clip-path expansion, the immersive scroller and the Lenis interaction.
- **`MobileNav.tsx:174`** — whether the focus trap arrives via native `<dialog>` or hand-written. Native is cleaner here because the panel has no measurement-dependent animation.
- **`BibliotecaHero.tsx:123`** — not a lint issue at all, but the search form silently discards the user's query. Someone should decide whether to wire it up, disable it, or relabel it, because as shipped it reads as broken.
