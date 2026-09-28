# Quiénes somos en celular y tablet · plan de implementación (fase 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quiénes somos con composición propia bajo 1024 px: Origen como pasador de capítulos (en vez de la coreografía de escritorio rota), Nuestra mirada con mapa fijo que se enciende al leer y fichas que florecen, equipo con cards táctiles; computadora (≥ 1024) idéntica.

**Architecture:** `OrigenEd` decide un modo completo (`vivo | movil | quieto`): `vivo` = `(min-width: 1024px)` sin movimiento reducido (exactamente lo que hoy corre en cualquier ancho ≥ 1024, con o sin hover, así el iPad apaisado no cambia), `movil` = `(max-width: 63.999rem) and (min-height: 38.75rem)`, `quieto` = el resto (flujo). La coreografía móvil vive en `origen/capitulos-movil.ts` y reutiliza las piezas leídas por `leerPiezas`. Mirada suma un componente `MapaMovil` (`lg:hidden`) con su coreografía `mirada/mapa-movil.ts`. Equipo: clases `max-md:`/`[@media(hover:none)]` en `PersonCard`.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, GSAP + ScrollTrigger, Lenis.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (QS1–QS4), §5–7.

## Global Constraints

- Todo efecto que decide un `modo` por media query se suscribe al `change` de cada `matchMedia` que usa (con una función `decidir()` y su limpieza), así el modo se recalcula al rotar o redimensionar sin recarga; la coreografía anterior se revierte con su `ctx.revert()`.
- Computadora congelada: **no editar ni quitar ninguna clase `md:`/`lg:`/`sm:` existente**; agregar solo `max-lg:`/`max-md:`/`lg:hidden` o variantes ancladas al modo (`[[data-modo=quieto]_&]:…`, `[[data-modo=movil]_&]:…`), que nunca matchean en `vivo`. Archivos solo bajo `apps/sitio/src/features/quienes-somos/`.
- Cuando `modo === "vivo"`, cada `className` calculado debe producir EXACTAMENTE el mismo conjunto de clases que hoy (el orden no importa) y `crearOrigen` corre sin cambios.
- Solo `transform`/`opacity` (+ `strokeDashoffset`); `will-change` desde la coreografía; `scrub` numérico en código nuevo.
- Targets ≥ 44 px; naranja solo en CTAs y en el nodo «Hoy»/cápsula del indicador (usos ya aprobados).
- Componentes nuevos ≤ 200 líneas; `ImpulsanEd.tsx` (431) y `PersonCard.tsx` (244) reciben solo clases.
- Gate: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` (100/100). Nuevos: CRLF + `git add -N`. Nadie commitea.

## Review Focus

1. Origen en 390×844: modo `movil`, cinco capítulos legibles uno por vez, el hito «Hoy» completo en pantalla, sin textos superpuestos entre capítulos. Test en Task 1.
2. Origen en 320×568: modo `quieto`, los cinco beats en flujo, cada uno con su padding, sin `position:absolute`. Test en Task 1.
3. Origen en 1024×1366 táctil: modo `vivo` (igual que hoy). Test en Task 1.
4. Mirada en 390: el mapa fijo cambia de nodo activo al leer el segundo principio y las fichas quedan visibles; en 1440 no existe el mapa móvil. Test en Task 2.
5. Equipo en 390: «Ver trayectoria» visible en reposo, tocar abre el perfil lineal y el botón de cerrar mide ≥ 44 px; el scroll vuelve al cerrar. Test en Task 3.

---

### Task 1: Origen como pasador de capítulos

**Files:**
- Create: `apps/sitio/src/features/quienes-somos/components/origen/capitulos-movil.ts`
- Modify: `apps/sitio/src/features/quienes-somos/components/OrigenEd.tsx` (modo, `data-modo`, clases por modo, `data-origen-zona`/`data-origen-escena`)
- Modify: `origen/Pilar.tsx:23`, `origen/BeatRemate.tsx:8`, `OrigenEd.tsx:101` (beat 3) — variante `[[data-modo=quieto]_&]`
- Test: `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-quienes.mjs`

**Interfaces:** `crearCapitulosMovil(root: HTMLElement, zone: HTMLElement): () => void`; `export const ALTO_CAPITULOS_LVH`.

- [ ] **Step 1: test (falla hoy)**

```js
// qa-quienes.mjs — Origen (capítulos), Mirada (mapa fijo), Equipo (cards y perfil).
import { chromium } from "playwright";
const [, , base = "http://localhost:3000"] = process.argv;
const browser = await chromium.launch({ headless: true });
const ok = (c, m) => { console.log(`${c ? "OK " : "FALLA"} ${m}`); if (!c) process.exitCode = 1; };
const abrir = async (w, h, ruta, extra = {}) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, ...extra });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  return { ctx, page, errores };
};

// Origen: modos
for (const [w, h, esperado] of [[390, 844, "movil"], [375, 667, "movil"], [320, 568, "quieto"], [1024, 1366, "vivo"]]) {
  const { ctx, page, errores } = await abrir(w, h, "/quienes-somos#origen");
  const modo = await page.locator("#origen").getAttribute("data-modo");
  ok(modo === esperado, `${w}x${h}: Origen en modo ${modo}`);
  if (esperado === "movil") {
    const top = await page.locator("[data-origen-zona]").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const alto = await page.locator("[data-origen-zona]").evaluate((el) => el.getBoundingClientRect().height);
    // a la mitad del capítulo 3 (índice 3 de 5): el hito «Hoy» tiene que verse entero
    await page.evaluate((y) => window.scrollTo(0, y), top + (alto - h) * (3.5 / 5));
    await page.waitForTimeout(1400);
    const vis = await page.locator("[data-beat]").evaluateAll((els) => els.map((e) => +getComputedStyle(e).opacity));
    ok(vis.filter((o) => o > 0.5).length === 1, `${w}: un solo capítulo visible (${vis.map((o) => o.toFixed(1)).join(",")})`);
    const hoy = page.locator("[data-constv-copy]").last();
    ok(await hoy.evaluate((el) => { const r = el.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0 && +getComputedStyle(el).opacity > 0.5; }), `${w}: el hito «Hoy» entra entero`);
  }
  if (esperado === "quieto") {
    const pos = await page.locator("[data-beat]").evaluateAll((els) => els.map((e) => getComputedStyle(e).position));
    ok(pos.every((p) => p !== "absolute"), `${w}: beats en flujo (${pos.join(",")})`);
  }
  ok(errores.length === 0, `${w}: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
await browser.close();
```

- [ ] **Step 2: `origen/capitulos-movil.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearIndicador, leerPiezas } from "./estados-origen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CAPITULOS = 5;
const LVH_POR_CAPITULO = 55;
const LVH_RESPIRO = 30;
/** Alto de la zona: una pantalla + un tramo por capítulo + respiro. */
export const ALTO_CAPITULOS_LVH = 100 + CAPITULOS * LVH_POR_CAPITULO + LVH_RESPIRO;

/**
 * «Origen» bajo `lg`: el PASADOR DE CAPÍTULOS. La historia de escritorio
 * superpone cinco beats en una lámina fija y los conduce con estallidos,
 * cita en 3D, tipeo y blur; en una pantalla vertical esos gestos no entran
 * y los textos se pisaban. Acá cada beat es un capítulo: entra desde abajo,
 * ocupa la pantalla mientras se lee y se va hacia arriba; el siguiente lo
 * reemplaza. Gestos propios, cortos, solo transform y opacity: las letras del
 * primer título suben, las líneas de la cita se descubren, la pregunta se
 * tipea con el scroll del capítulo, la trayectoria vertical se dibuja y el
 * remate aparece palabra por palabra. En tablet las fotos del panel se cruzan
 * con los tres primeros capítulos.
 */
export function crearCapitulosMovil(root: HTMLElement, zone: HTMLElement) {
  const ctx = gsap.context(() => {
    const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
    const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]", root);
    if (beats.length !== CAPITULOS) return;
    const p = leerPiezas(root);

    gsap.set(beats, { position: "absolute", inset: 0, willChange: "transform, opacity" });
    gsap.set(beats.slice(1), { autoAlpha: 0 });
    gsap.set(p.chars0, { yPercent: 100, opacity: 0 });
    gsap.set(p.quoteLines, { yPercent: 115 });
    if (p.quoteMark) gsap.set(p.quoteMark, { autoAlpha: 0 });
    if (p.quoteSub) gsap.set(p.quoteSub, { autoAlpha: 0, y: 12 });
    gsap.set(p.typeChars, { opacity: 0.13 });
    if (p.sub2) gsap.set(p.sub2, { autoAlpha: 0, y: 12 });
    if (p.constTitle) gsap.set(p.constTitle, { autoAlpha: 0, y: 16 });
    if (p.constvLine) gsap.set(p.constvLine, { scaleY: 0 });
    gsap.set(p.constvNodes, { scale: 0.35, autoAlpha: 0.35, transformOrigin: "50% 50%" });
    gsap.set(p.constvCopies, { autoAlpha: 0.16, x: -10 });
    gsap.set(p.finWords, { autoAlpha: 0, y: 18 });
    if (p.finRule) gsap.set(p.finRule, { scaleX: 0 });
    if (p.finSub) gsap.set(p.finSub, { autoAlpha: 0, y: 12 });
    // El panel de fotos (solo md+): una foto por capítulo 0–2, después se apaga.
    if (p.panel) gsap.set(p.panel, { autoAlpha: 1 });
    p.photoFrames.forEach((f, i) => gsap.set(f, { autoAlpha: i === 0 ? 1 : 0 }));

    const setDot = crearIndicador(dots);
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => setDot(self.progress),
      },
    });

    // Capítulo k ocupa [k, k+1): entra en los primeros 0.3, se va en los últimos 0.25.
    const entra = (k: number) => k + (k === 0 ? 0 : 0.05);
    const sale = (k: number) => k + 0.75;
    beats.forEach((beat, k) => {
      if (k > 0) tl.fromTo(beat, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.3 }, entra(k));
      if (k < CAPITULOS - 1) tl.to(beat, { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" }, sale(k));
    });

    // 0 · las letras del título suben (el capítulo 0 ya está visible al pinnear)
    tl.to(p.chars0, { yPercent: 0, opacity: 1, duration: 0.35, stagger: 0.012 }, 0.02);
    // 1 · la cita se descubre línea por línea
    tl.to(p.quoteLines, { yPercent: 0, duration: 0.3, stagger: 0.08 }, entra(1) + 0.1);
    if (p.quoteMark) tl.to(p.quoteMark, { autoAlpha: 1, duration: 0.2 }, entra(1) + 0.1);
    if (p.quoteSub) tl.to(p.quoteSub, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(1) + 0.35);
    // 2 · la pregunta se tipea con el scroll del capítulo
    tl.to(p.typeChars, { opacity: 1, duration: 0.02, stagger: 0.012, ease: "none" }, entra(2) + 0.1);
    if (p.sub2) tl.to(p.sub2, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(2) + 0.45);
    // 3 · definición + trayectoria vertical que se dibuja
    if (p.constTitle) tl.to(p.constTitle, { autoAlpha: 1, y: 0, duration: 0.25 }, entra(3) + 0.05);
    const DIB = entra(3) + 0.2;
    if (p.constvLine) tl.to(p.constvLine, { scaleY: 1, duration: 0.45, ease: "none" }, DIB);
    p.constvNodes.forEach((n, i) => {
      const at = DIB + (i / Math.max(p.constvNodes.length - 1, 1)) * 0.4;
      tl.to(n, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "back.out(3)" }, at);
      if (p.constvCopies[i]) tl.to(p.constvCopies[i], { autoAlpha: 1, x: 0, duration: 0.12 }, at + 0.02);
    });
    // 4 · el remate, palabra por palabra
    tl.to(p.finWords, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.07 }, entra(4) + 0.08);
    if (p.finRule) tl.to(p.finRule, { scaleX: 1, duration: 0.2 }, entra(4) + 0.4);
    if (p.finSub) tl.to(p.finSub, { autoAlpha: 1, y: 0, duration: 0.2 }, entra(4) + 0.5);
    // Fotos (tablet): cruce con cada capítulo 0–2 y salida antes del 3.
    p.photoFrames.forEach((f, i) => {
      if (i > 0) tl.to(f, { autoAlpha: 1, duration: 0.2 }, entra(i));
      if (i > 0 && p.photoFrames[i - 1]) tl.to(p.photoFrames[i - 1], { autoAlpha: 0, duration: 0.2 }, entra(i));
    });
    if (p.panel) tl.to(p.panel, { autoAlpha: 0, duration: 0.25 }, sale(2));
    tl.set({}, {}, CAPITULOS);
    setDot(0);
  }, root);

  return () => ctx.revert();
}
```
Verificar en `estados-origen.ts` que `crearIndicador` y `leerPiezas` sean exports (lo son) y que `p.photoFrames` sean los `[data-photo]` (lo son).

- [ ] **Step 3: `OrigenEd.tsx`**

Reemplazar el efecto actual por modo + dos efectos (la rama `vivo` llama a `crearOrigen(root, zone)` igual que hoy):
```tsx
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");
  useIsomorphicLayoutEffect(() => {
    if (reduced) setModo("quieto");
    // ≥ 1024 corre la historia de escritorio como siempre (también táctil).
    else if (window.matchMedia("(min-width: 1024px)").matches) setModo("vivo");
    else if (window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) setModo("movil");
    else setModo("quieto");
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone) return;
    if (modo === "vivo") return crearOrigen(root, zone);
    if (modo === "movil") return crearCapitulosMovil(root, zone);
  }, [modo]);
```
(importar `useState`, `crearCapitulosMovil` y `ALTO_CAPITULOS_LVH`). ATENCIÓN: hoy `crearOrigen` corre en SSR-hidratación con `reduced` false desde el primer render; con el modo, corre un tick después (tras el primer efecto). Es el mismo patrón que Proyectos/Niveles en Qué hacemos y no cambia el resultado visual (la coreografía se crea antes del primer frame pintado con scroll).

Markup:
- `<section>`: agregar `data-modo={modo}`.
- zona (`ref={zoneRef}`): `className={"relative motion-reduce:h-auto " + (modo === "movil" ? "" : "h-[560svh]")}` y `style={modo === "movil" ? { height: \`${ALTO_CAPITULOS_LVH}lvh\` } : undefined}`; agregar `data-origen-zona`. En `quieto` sin reduced el `h-[560svh]` sobraría: usar `(modo === "vivo" ? "h-[560svh]" : modo === "quieto" ? "h-auto" : "")`. Con `modo === "vivo"` el string resultante contiene exactamente `relative h-[560svh] motion-reduce:h-auto`.
- sticky: `className={"sticky top-0 w-full overflow-hidden motion-reduce:static motion-reduce:h-auto " + (modo === "movil" ? "h-lvh" : modo === "quieto" ? "static h-auto" : "h-[100svh]")}`; agregar `data-origen-escena`.
- tilt: `className={"relative h-full w-full [transform-style:preserve-3d] motion-reduce:h-auto" + (modo === "quieto" ? " h-auto" : "")}` (en `vivo`: idéntico).
- beats: `Pilar.tsx:23`, `BeatRemate.tsx:8` y el beat 3 en `OrigenEd.tsx`: agregar la variante `[[data-modo=quieto]_&]:h-auto [[data-modo=quieto]_&]:py-16` (nunca matchea en `vivo`).
- El indicador de puntos: agregar `[[data-modo=quieto]_&]:hidden`.
- Comentario de cabecera: un párrafo nuevo sobre los tres modos.

- [ ] **Step 4: test + gate.** Correr `node qa-quienes.mjs http://localhost:3000` (dev en :3000). Esperado: todos OK. Verificar también 768×1024 a ojo con `qa-base` (fotos cruzando a la derecha). Commit propuesto: `design(quienes-somos): en celular y tablet el origen se lee por capítulos`

---

### Task 2: Nuestra mirada con mapa fijo

**Files:**
- Create: `mirada/MapaMovil.tsx`, `mirada/mapa-movil.ts`
- Modify: `MiradaEd.tsx` (montar `MapaMovil` cuando `!live`, `data-mirada-modo`), `mirada/FichasPerspectiva.tsx` (sin cambios de clases; la coreografía usa `[data-ficha]`)
- Test: agregar a `qa-quienes.mjs`

- [ ] **Step 1: test**
```js
{
  const { ctx, page, errores } = await abrir(390, 844, "/quienes-somos#mirada");
  const mapa = page.locator("[data-mapa-movil]");
  ok(await mapa.isVisible(), "mapa móvil visible");
  ok((await mapa.evaluate((el) => getComputedStyle(el).position)) === "sticky", "el mapa es sticky");
  const d1 = page.locator("[data-detalle='1']");
  await d1.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1200);
  ok((await mapa.locator("[data-mapa-nodo][data-activo]").getAttribute("data-mapa-nodo")) === "1", "el segundo nodo se enciende al leer el segundo principio");
  const fichas = await page.locator("[data-detalle='1'] ~ [data-fichas='1'] [data-ficha], [data-fichas='1'] [data-ficha]").evaluateAll((els) => els.map((e) => +getComputedStyle(e).opacity));
  ok(fichas.length > 0 && fichas.every((o) => o > 0.9), `fichas del principio 2 visibles (${fichas.length})`);
  ok(errores.length === 0, `mirada: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(base + "/quienes-somos#mirada", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  ok((await p.locator("[data-mapa-movil]").count()) === 0 || !(await p.locator("[data-mapa-movil]").isVisible()), "en computadora no hay mapa móvil");
  await c.close();
}
```

- [ ] **Step 2: `mirada/MapaMovil.tsx`**
```tsx
import { PERSPECTIVAS } from "./constelacion-mirada";

/**
 * «Nuestra mirada» bajo `lg`: la cámara de escritorio no entra en una
 * pantalla vertical, así que el mapa se vuelve una constelación mínima y
 * fija bajo el header —tres nodos unidos por un trazo— que acompaña la
 * lectura: el trazo se dibuja al avanzar y el nodo del principio que se está
 * leyendo se enciende. Tocar un nodo lleva a su principio. Decorativa para
 * lectores de pantalla salvo los botones.
 */
const X = [16, 50, 84];
export function MapaMovil({ onIr }: { onIr: (i: number) => void }) {
  return (
    <div data-mapa-movil className="sticky top-[4.75rem] z-20 -mx-6 bg-white/85 px-6 py-2 backdrop-blur lg:hidden">
      <div className="relative mx-auto h-16 max-w-md">
        <svg aria-hidden="true" viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-full w-full overflow-visible">
          <path d={`M${X[0]},12 L${X[1]},12 L${X[2]},12`} fill="none" stroke="rgba(31,45,77,0.18)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          <path data-mapa-trazo d={`M${X[0]},12 L${X[1]},12 L${X[2]},12`} fill="none" stroke="#1f2d4d" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {PERSPECTIVAS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            data-mapa-nodo={i}
            onClick={() => onIr(i)}
            aria-label={`Ir a ${p.label}`}
            className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${X[i]}%` }}
          >
            <span data-mapa-halo className="absolute h-7 w-7 rounded-full opacity-0 transition-opacity duration-300" style={{ backgroundColor: `${p.accent}33` }} />
            <span data-mapa-punto className="relative block h-3 w-3 rounded-full transition-transform duration-300" style={{ backgroundColor: p.accent }} />
            <span className="text-azul-principal/70 absolute top-full mt-0.5 font-mono text-[0.62rem] tracking-[0.14em]">{p.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```
Tailwind: `data-[activo]` en los hijos: agregar a `data-mapa-halo` la clase `[[data-activo]_&]:opacity-100` y a `data-mapa-punto` `[[data-activo]_&]:scale-125` (ambas anidadas bajo el botón activo).

- [ ] **Step 3: `mirada/mapa-movil.ts`**
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Enciende el nodo del principio que se lee, dibuja el trazo y hace florecer las fichas. */
export function crearMapaMovil(root: HTMLElement) {
  const trazo = root.querySelector<SVGPathElement>("[data-mapa-trazo]");
  const nodos = gsap.utils.toArray<HTMLElement>("[data-mapa-nodo]", root);
  const detalles = gsap.utils.toArray<HTMLElement>("[data-detalle]", root);
  if (!trazo || nodos.length !== detalles.length) return () => {};
  const ctx = gsap.context(() => {
    const largo = trazo.getTotalLength();
    gsap.set(trazo, { strokeDasharray: largo, strokeDashoffset: largo });
    const marcar = (i: number) => nodos.forEach((n, k) => n.toggleAttribute("data-activo", k === i));
    detalles.forEach((d, i) => {
      ScrollTrigger.create({ trigger: d, start: "top 70%", end: "bottom 30%", onToggle: (self) => { if (self.isActive) marcar(i); } });
      const fichas = root.querySelectorAll<HTMLElement>(`[data-fichas="${i}"] [data-ficha]`);
      gsap.fromTo(fichas, { autoAlpha: 0, scale: 0.9, y: 8 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: d, start: "top 75%", once: true } });
    });
    gsap.to(trazo, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: detalles[0], endTrigger: detalles[detalles.length - 1], start: "top 60%", end: "top 60%", scrub: 0.6 } });
    marcar(0);
  }, root);
  return () => {
    ctx.revert();
    nodos.forEach((n) => n.removeAttribute("data-activo"));
  };
}
```

- [ ] **Step 4: `MiradaEd.tsx`**: sumar `const [modoMovil, setModoMovil] = useState(false)` decidido en el mismo efecto del gate: `if (reduced) return; if (matchMedia("(hover: hover) and (min-width: 1024px)").matches) setLive(true); else if (matchMedia("(max-width: 63.999rem)").matches) setModoMovil(true);` (el `setLive(true)` sigue en su rama: el resto del efecto no cambia). Efecto nuevo: `useIsomorphicLayoutEffect(() => { if (!modoMovil) return; const root = rootRef.current; if (!root) return; return crearMapaMovil(root); }, [modoMovil]);`. Montar `{modoMovil && <MapaMovil onIr={(i) => { const el = rootRef.current?.querySelector<HTMLElement>(\`[data-detalle="${i}"]\`); if (el) irAElemento(el); }} />}` justo después del bloque `data-centro` (verificar el nombre real del helper en `apps/sitio/src/lib/indice.ts`: usar el que desplaza con Lenis a un elemento; si recibe offset, pasar `-96`). En `vivo` (`live`) y en reduced no se monta nada nuevo.

- [ ] **Step 5: test + gate.** Commit propuesto: `design(quienes-somos): en celular la mirada lleva un mapa fijo que se enciende al leer`

---

### Task 3: equipo táctil y overlay

**Files:** `PersonCard.tsx` (Caption y botón), `TeamProfileOverlay.tsx` / `overlay/PerfilShell.tsx` / `profile/inmersivo/PerfilLineal.tsx` (cerrar ≥ 44 px, safe-area), test.

- [ ] **Step 1: test**
```js
{
  const { ctx, page, errores } = await abrir(390, 844, "/quienes-somos#equipo");
  const card = page.locator("[data-persona-card]").nth(3);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  ok(await card.locator('[data-caption="rest"]').evaluate((el) => /Ver trayectoria/.test(el.textContent || "")), "«Ver trayectoria» visible en reposo en táctil");
  const antes = await page.evaluate(() => window.scrollY);
  await card.tap();
  await page.waitForTimeout(1500);
  const cerrar = page.locator('[role="dialog"] button[aria-label*="errar"], [role="dialog"] button:has-text("Cerrar")').first();
  ok(await cerrar.isVisible(), "el perfil abre con botón de cerrar visible");
  const r = await cerrar.boundingBox();
  ok(r && r.width >= 44 && r.height >= 44, `cerrar ≥ 44 px (${r && Math.round(r.width)}x${r && Math.round(r.height)})`);
  await cerrar.tap();
  await page.waitForTimeout(1200);
  ok(Math.abs((await page.evaluate(() => window.scrollY)) - antes) < 4, "el scroll vuelve al cerrar el perfil");
  ok(errores.length === 0, `equipo: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
```
(Ajustar el selector del botón de cerrar al markup real de `PerfilShell`/`TeamProfileOverlay`; el test debe usar el que exista.)

- [ ] **Step 2: `PersonCard.tsx`**: en `Caption`, cuando `variant === "rest"` y `!cfg.labelAtRest`, renderizar igualmente el `<span>` «Ver trayectoria» con las clases `hidden [@media(hover:none)]:inline` (en escritorio con mouse sigue oculto: `showLabel` para reposo pasa a `hover ? cfg.labelOnHover : true` y el `hidden …` solo cuando `!cfg.labelAtRest`). Tipografía táctil: `nombre` de los tiers 3 y 4 con `max-md:text-[1.06rem]`/`max-md:text-[1rem]`, `pais` de 3 y 4 `max-md:text-[0.64rem]` (agregar los tokens a las cadenas de `CFG` sin quitar los existentes). Botón: agregar `max-lg:active:scale-[0.985] max-lg:transition-[box-shadow,transform]`.
- [ ] **Step 3: overlay**: en el botón de cerrar del shell agregar `max-lg:min-h-11 max-lg:min-w-11`; al contenedor scrolleable del perfil lineal `max-lg:pb-[calc(1.5rem+env(safe-area-inset-bottom))]`; verificar que `usePortalModal`/`useLockScroll` liberan el scroll y que Lenis vuelve a la posición (lo hace hoy vía `getLenis().scrollTo(immediate)`).
- [ ] **Step 4: test + gate.** Commit propuesto: `design(quienes-somos): cards del equipo y perfil táctiles en celular`

---

### Task 4: QA final de la fase y no regresión

- [ ] `qa-quienes.mjs` contra prod; `qa-base` de `/quienes-somos` en 320/390/768/1024 táctil + `REDUCIDO=1` (Origen quieto en flujo, sin mapa animado); comparación de escritorio de `/quienes-somos` en 1280/1440/1920 contra `base/` (`geoIgual = true`, sin diffs fuera del ruido) y de `/` y `/que-hacemos` contra `base-limpia/`.
