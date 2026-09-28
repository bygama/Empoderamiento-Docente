# Novedades en celular y tablet · plan de implementación (fase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Novedades (listado y detalle) con composición propia bajo 1024 px: destacadas apiladas con foto arriba, chips en riel y paginación táctil, «ED en movimiento» como profundidad en etapas que recupera las frases, riel de lanzamientos con snap y progreso, guía compacta en el detalle; computadora idéntica.

**Architecture:** clases `max-md:`/`max-lg:` agregadas al markup existente; un modo nuevo `movil` en `EdEnMovimiento` (gate completo `vivo | movil | quieto`, la rama `live` intacta) con su coreografía en archivo propio; un riel de guía nuevo (`GuiaNotaRiel`) para el detalle bajo `lg`.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, GSAP + ScrollTrigger, Lenis.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (NO1–NO7), §5–7.

## Global Constraints

- Todo efecto que decide un `modo` por media query se suscribe al `change` de cada `matchMedia` que usa (con una función `decidir()` y su limpieza), así el modo se recalcula al rotar o redimensionar sin recarga; la coreografía anterior se revierte con su `ctx.revert()`.
- Computadora congelada: **no editar ni quitar ninguna clase `md:`/`lg:`/`sm:` existente**; solo agregar `max-md:`/`max-lg:`/`lg:hidden`/`md:hidden`. Archivos solo bajo `apps/sitio/src/features/novedades/`.
- Solo `transform`/`opacity`; `will-change` desde la coreografía; `scrub` numérico.
- Targets ≥ 44 px; naranja solo en CTAs existentes; verde y naranja no conviven en reposo (los chips de flecha de las destacadas siguen blancos en reposo).
- Componentes nuevos ≤ 200 líneas; los que ya superan 200 (`EdEnMovimiento`, `LanzamientosRecientes`, `NovedadDestacada`, `FiltrosNovedades`) reciben solo clases y el mínimo de líneas.
- Gate: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` (100/100). Nuevos: CRLF + `git add -N`. Nadie commitea.

## Review Focus

1. `/novedades?categoria=eventos&pagina=1` en 390: el chip «Eventos» activo entra en el riel y se ve (scroll del riel al chip activo). Test en Task 1.
2. Paginación en 390: tocar «2» vuelve al tope del panel y las cards visibles cambian; targets 44 px. Test en Task 1.
3. «ED en movimiento» en 375×667: modo `movil`, las 6 fotos llegan y las 6 frases aparecen; en 320×568 modo `quieto` con las frases listadas visibles. Test en Task 2.
4. Riel en 390: swipe cambia el progreso (`scaleX` > 0) y las cards quedan alineadas por snap. Test en Task 3.
5. Detalle en 390: la guía-riel marca la sección activa al scrollear y tocar un chip lleva a la sección; en 1440 no existe (solo la columna sticky). Test en Task 4.

---

### Task 1: clases táctiles (hero, destacadas, chips, paginación, cards, cierre)

**Files:** `NovedadesHero.tsx:68`, `NovedadDestacada.tsx:260-282,229,297`, `FiltrosNovedades.tsx:494-503`, `PaginacionNovedades.tsx:20-21`, `NovedadCard.tsx:42`, `CierreNovedades.tsx:121` (todos en `apps/sitio/src/features/novedades/components/`).
**Test:** `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-novedades.mjs`.

- [ ] **Step 1: test (falla hoy)**

```js
// qa-novedades.mjs — listado móvil: chips en riel, paginación, destacada, riel con progreso, movimiento; detalle: guía-riel.
import { chromium } from "playwright";
const [, , base = "http://localhost:3000", vpArg = "390x844"] = process.argv;
const [w, h] = vpArg.split("x").map(Number);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errores = [];
page.on("pageerror", (e) => errores.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
const ok = (c, m) => { console.log(`${c ? "OK " : "FALLA"} ${m}`); if (!c) process.exitCode = 1; };

await page.goto(base + "/novedades?categoria=eventos#ultimas", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const chipsWrap = page.locator('#ultimas [role="group"][aria-label="Filtrar por categoría"]');
ok((await chipsWrap.evaluate((el) => getComputedStyle(el).flexWrap)) === "nowrap", "chips en una sola fila (riel)");
ok((await chipsWrap.evaluate((el) => el.scrollWidth > el.clientWidth)) === true, "el riel de chips desborda y scrollea");
const activo = chipsWrap.locator('button[aria-pressed="true"]');
ok((await activo.innerText()).trim().toLowerCase().includes("eventos"), "chip «Eventos» activo desde ?categoria=");
ok(await activo.evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), "el chip activo está a la vista");
const alturas = await chipsWrap.locator("button").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
ok(alturas.every((x) => x >= 44), `chips ≥ 44 px (${Math.min(...alturas)})`);
// paginación
await page.goto(base + "/novedades#ultimas", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const pag = page.locator('nav[aria-label="Paginación de novedades"] button');
const alt = await pag.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
ok(alt.every((x) => x >= 44), `paginación ≥ 44 px (${Math.min(...alt)})`);
const antes = await page.locator("#ultimas [data-card]").evaluateAll((els) => els.filter((e) => e.style.display !== "none").map((e) => e.dataset.id));
await page.locator('nav[aria-label="Paginación de novedades"] button[aria-label="Página 2"]').tap();
await page.waitForTimeout(1400);
const despues = await page.locator("#ultimas [data-card]").evaluateAll((els) => els.filter((e) => e.style.display !== "none").map((e) => e.dataset.id));
ok(antes.join() !== despues.join(), "la página 2 muestra otras cards");
// destacada 2 con foto arriba
const seg = page.locator("#destacado [data-nd-card]").nth(1);
ok((await seg.evaluate((el) => getComputedStyle(el).flexDirection)) === "column", "segunda destacada en columna (foto arriba)");
ok(await seg.locator("img").first().evaluate((img) => img.getBoundingClientRect().width > innerWidth * 0.6), "foto de la segunda destacada a todo el ancho");
ok(errores.length === 0, `sin errores de consola (${errores.join(" | ")})`);
await browser.close();
```

- [ ] **Step 2: cambios**
- `NovedadesHero.tsx:68`: agregar `max-md:min-h-[78lvh]`.
- `NovedadDestacada.tsx:260` (article de la card 2): agregar `max-md:flex-col`. `:269` (RevealFoco de la card 2): agregar `max-md:w-full max-md:aspect-[16/9]`. `:271` (div interno): agregar `max-md:min-h-0`. `:229` y `:297` (los dos `LinkNota`): agregar `max-lg:min-h-11`.
- `FiltrosNovedades.tsx:494` (div `flex flex-wrap gap-2.5`): agregar `max-md:-mx-5 max-md:flex-nowrap max-md:snap-x max-md:overflow-x-auto max-md:px-5 max-md:scrollbar-none max-md:[scrollbar-width:none]`. `:503` (chip): agregar `max-md:min-h-11 max-md:shrink-0 max-md:snap-start`. Además, para que el chip activo quede a la vista al llegar con `?categoria=`, en el `useIsomorphicLayoutEffect` inicial (después de `aplicar(...)`) agregar:
  ```ts
    document.querySelector<HTMLElement>('#ultimas [role="group"] button[aria-pressed="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  ```
  (el scroll es del riel, no de la página: `block: "nearest"` no mueve el documento si el chip ya es visible verticalmente; si `scrollIntoView` moviera la página en dev, usar `el.parentElement.scrollLeft = el.offsetLeft - 20`).
- `PaginacionNovedades.tsx:20` (`base`): agregar `max-lg:h-11 max-lg:w-11`.
- `NovedadCard.tsx:42` (article): agregar `max-lg:group-active:translate-y-0.5` (feedback de presión; la transición `translate` ya existe).
- `CierreNovedades.tsx:121`: agregar `max-md:min-h-[48lvh] max-md:py-16`.

- [ ] **Step 3: test + gate; commit propuesto:** `design(novedades): chips en riel, paginación táctil y destacadas apiladas en celular`

---

### Task 2: «ED en movimiento» como profundidad en etapas

**Files:**
- Create: `apps/sitio/src/features/novedades/components/ed-en-movimiento/coreografia-movil.ts`
- Modify: `apps/sitio/src/features/novedades/components/EdEnMovimiento.tsx` (modo, atributos, rama `movil` en los ternarios, lista de frases en `quieto` bajo lg)
- Test: agregar a `qa-novedades.mjs`

**Interfaces:** `crearMovimientoMovil(zone: HTMLElement, stage: HTMLElement, contador: HTMLElement | null): () => void`; `export const ALTO_MOVIL_LVH`.

- [ ] **Step 1: test** (antes de `browser.close()`):

```js
for (const [vw, vh, esperado] of [[375, 667, "movil"], [320, 568, "quieto"]]) {
  const c2 = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: true, hasTouch: true });
  const p2 = await c2.newPage();
  await p2.goto(base + "/novedades#ed-en-movimiento", { waitUntil: "networkidle" });
  await p2.waitForTimeout(1500);
  const modo = await p2.locator("#ed-en-movimiento").getAttribute("data-modo");
  ok(modo === esperado, `${vw}x${vh}: modo ${modo}`);
  if (esperado === "movil") {
    const top = await p2.locator("#ed-en-movimiento").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const alto = await p2.locator("#ed-en-movimiento").evaluate((el) => el.getBoundingClientRect().height);
    await p2.evaluate((y) => window.scrollTo(0, y + 0.5 * innerHeight), top);
    await p2.waitForTimeout(1400);
    const op = await p2.locator("[data-mov-phrase]").evaluateAll((els) => els.map((e) => +getComputedStyle(e).opacity));
    ok(op.some((o) => o > 0.5), `${vw}: alguna frase visible a media escena (${op.map((o) => o.toFixed(1)).join(",")})`);
    await p2.evaluate((y) => window.scrollTo(0, y), top + alto - vh - 10);
    await p2.waitForTimeout(1400);
    const esc = await p2.locator("[data-mov-card]").evaluateAll((els) => els.map((e) => +getComputedStyle(e).opacity));
    ok(esc.every((o) => o > 0.9), `${vw}: al final las 6 fotos están plenas (${esc.map((o) => o.toFixed(1)).join(",")})`);
  } else {
    ok(await p2.locator("#ed-en-movimiento [data-mov-lista]").isVisible(), `${vw}: las frases se listan en modo quieto`);
  }
  await c2.close();
}
```

- [ ] **Step 2: `ed-en-movimiento/coreografia-movil.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PASO = 1;
const LVH_POR_PASO = 45;
const LVH_RESPIRO = 30;
/** Alto de la pista: una pantalla + un paso por momento + respiro. */
export const ALTO_MOVIL_LVH = 100 + 6 * LVH_POR_PASO + LVH_RESPIRO;

/**
 * «ED en movimiento» bajo `lg`: PROFUNDIDAD EN ETAPAS. En escritorio cada
 * momento emerge del punto de fuga y pasa de largo; en táctil no hay scroll
 * fino para eso, así que cada foto llega desde la luz del horizonte a su lugar
 * en el mosaico (scale + x/y + opacity) y se queda, mientras arriba aparece su
 * frase. Al final el mosaico completo queda a la vista. Las frases, que en el
 * mosaico quieto no se veían, acá son parte del recorrido.
 */
export function crearMovimientoMovil(zone: HTMLElement, stage: HTMLElement, contador: HTMLElement | null) {
  const ctx = gsap.context(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-mov-card]", stage);
    const phrases = gsap.utils.toArray<HTMLElement>("[data-mov-phrase]", stage);
    const luz = stage.querySelector<HTMLElement>("[data-mov-luz]");
    gsap.set(cards, { willChange: "transform, opacity" });

    // Desde dónde llega cada foto: la luz del horizonte (50 %, 44 % de la escena).
    const desdeX = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return s.left + s.width * 0.5 - (r.left + r.width / 2);
    };
    const desdeY = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return s.top + s.height * 0.44 - (r.top + r.height / 2);
    };

    if (luz) {
      gsap.fromTo(luz, { autoAlpha: 0, scale: 0.45 }, { autoAlpha: 1, scale: 1, ease: "none", scrollTrigger: { trigger: zone, start: "top bottom", end: "top top", scrub: 0.6 } });
    }

    const creada: { tl?: gsap.core.Timeline } = {};
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: () => {
          if (!creada.tl || !contador) return;
          const i = Math.min(cards.length - 1, Math.max(0, Math.floor(creada.tl.time() / PASO)));
          const label = String(i + 1).padStart(2, "0");
          if (contador.textContent !== label) contador.textContent = label;
        },
      },
    });
    creada.tl = tl;

    cards.forEach((card, i) => {
      const t = i * PASO;
      tl.fromTo(
        card,
        { x: () => desdeX(card), y: () => desdeY(card), scale: 0.25, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, ease: "power2.out", duration: 0.6, immediateRender: true },
        t,
      );
      const ph = phrases[i];
      if (ph) {
        tl.fromTo(ph, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, t + 0.15).to(
          ph,
          { autoAlpha: 0, y: -10, ease: "power2.in", duration: 0.25 },
          t + PASO - 0.05,
        );
      }
    });
    // La última frase se queda con el mosaico completo.
    if (phrases[cards.length - 1]) tl.to(phrases[cards.length - 1], { autoAlpha: 1, y: 0, duration: 0.2 }, cards.length * PASO);
    tl.set({}, {}, cards.length * PASO + 0.6);
  }, stage);

  return () => ctx.revert();
}
```
Ojo: el `.to(ph, …)` de salida de la ÚLTIMA frase (t + PASO − 0.05 = 5.95) y el `.to` que la vuelve a 1 (en 6) se solapan por 0.05: para evitar el parpadeo, no agregar el tween de salida cuando `i === cards.length - 1` (condicionar con `if (i < cards.length - 1)`).

- [ ] **Step 3: `EdEnMovimiento.tsx`**

Reemplazar `const [live, setLive] = useState(false);` por un modo completo y un efecto de gate separado del efecto de escritorio, SIN tocar el cuerpo del efecto de escritorio:
```tsx
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");
  useIsomorphicLayoutEffect(() => {
    if (reduced) setModo("quieto");
    else if (window.matchMedia("(hover: hover) and (min-width: 768px)").matches) setModo("vivo");
    else if (window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) setModo("movil");
    else setModo("quieto");
  }, [reduced]);
  const live = modo === "vivo";
  const movil = modo === "movil";
```
El efecto de escritorio existente: quitar de su interior las líneas `if (reduced) return;`, el `matchMedia(...)` y `setLive(true)` y reemplazarlas por `if (!live) return;`, y cambiar su dependencia a `[live]` (el resto del cuerpo queda byte a byte igual; el gate `(hover: hover) and (min-width: 768px)` se conserva en el efecto de modo). Nuevo efecto:
```tsx
  useIsomorphicLayoutEffect(() => {
    if (!movil) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    return crearMovimientoMovil(zone, stage, counterRef.current);
  }, [movil]);
```
Markup (solo agregados):
- zona (línea 199): `data-modo={modo}`; className: `"relative bg-azul-principal " + (live ? "h-[560svh]" : "")` se conserva y se agrega `style={movil ? { height: \`${ALTO_MOVIL_LVH}lvh\` } : undefined}`.
- stage (línea 206): el ternario pasa a `live ? "sticky top-0 flex h-[100svh] flex-col" : movil ? "sticky top-0 flex h-lvh flex-col" : "flex min-h-[70svh] flex-col py-24"`.
- contador (línea 227): `{live && (` → `{(live || movil) && (`.
- overlay de frases (línea 240): agregar `max-lg:top-[14%]` (en escritorio no cambia; en `quieto` bajo lg las frases siguen con `opacity: 0` inline).
- contenedor de momentos (línea 255): ternario `live ? "relative flex-1" : movil ? "mx-auto mt-auto grid w-full max-w-screen-xl grid-cols-2 gap-3 px-5 pb-8 md:grid-cols-3 md:px-10" : "mx-auto mt-10 grid …"` (la rama estática se conserva tal cual).
- figure (línea 266): `live ? "absolute …" : "relative"` se conserva (en movil también `relative`).
- Frases en modo quieto bajo lg (después del contenedor de momentos, dentro del stage):
```tsx
        {!live && !movil && (
          <ul data-mov-lista className="mx-auto mt-8 w-full max-w-screen-xl px-5 lg:hidden">
            {MOVIMIENTO.map((m) => (
              <li key={m.id} className="font-display border-t border-white/10 py-3 text-[1.15rem] font-bold tracking-[-0.01em] text-white">
                {conAcento(m.frase, m.acento)}
              </li>
            ))}
          </ul>
        )}
```
Importar `ALTO_MOVIL_LVH, crearMovimientoMovil` de `./ed-en-movimiento/coreografia-movil`. Actualizar el comentario de cabecera (un párrafo: «Bajo lg con alto suficiente, PROFUNDIDAD EN ETAPAS (coreografia-movil.ts); en pantallas bajas, mosaico quieto con las frases listadas»).

- [ ] **Step 4: test + gate.** Si `EdEnMovimiento.tsx` pasa de 330 líneas, extraer el bloque `figure` a `ed-en-movimiento/Momento.tsx` (mismo JSX). Commit propuesto: `design(novedades): en celular «ED en movimiento» llega en etapas y muestra sus frases`

---

### Task 3: riel de lanzamientos con snap y progreso

**Files:** `LanzamientosRecientes.tsx` (`syncEdges`, track `:503`, article `:508`, link `:533`, cabecera `:443-451`, después del velo `:552`).
**Test:** agregar a `qa-novedades.mjs`:

```js
await page.goto(base + "/novedades#recien-salido", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const track = page.locator('[aria-label="Riel de lanzamientos recientes"]');
ok((await track.evaluate((el) => getComputedStyle(el).scrollSnapType)).includes("x"), "riel con scroll-snap en x");
await track.evaluate((el) => el.scrollBy({ left: el.clientWidth, behavior: "instant" }));
await page.waitForTimeout(700);
const prog = await page.locator("[data-riel-progreso]").evaluate((el) => getComputedStyle(el).transform);
ok(prog !== "none" && !/matrix\(0,/.test(prog), `barra de progreso avanzó (${prog})`);
ok(await page.locator("[data-riel-pista]").isVisible(), "pista «Deslizá» visible en celular");
```

- [ ] Cambios: agregar `const progRef = useRef<HTMLDivElement | null>(null);` y en `syncEdges`, tras calcular `end`: `if (progRef.current) { const max = el.scrollWidth - el.clientWidth; progRef.current.style.transform = \`scaleX(${max > 0 ? el.scrollLeft / max : 1})\`; }`. Track (`:503`): agregar `max-md:snap-x max-md:snap-mandatory max-md:scroll-px-5`. Article (`:508`) y Link CTA (`:533`): agregar `max-md:snap-start`. Cabecera: debajo del `RevealLines` (dentro del mismo `<div>`) agregar `<p data-riel-pista className="text-gris-texto mt-3 font-mono text-[0.68rem] tracking-[0.16em] uppercase md:hidden">Deslizá →</p>`. Después del velo derecho (`:552`) agregar la barra: `<div aria-hidden="true" className="mx-5 -mt-14 mb-6 h-0.5 overflow-hidden rounded-full bg-azul-principal/10 md:hidden"><div ref={progRef} data-riel-progreso className="bg-verde-concepto h-full w-full origin-left transition-transform duration-150" style={{ transform: "scaleX(0)" }} /></div>` (el `-mt-14` la sube dentro del `pb-20` del track; ajustar a ojo para que quede a ~1.5rem bajo las cards). Test + gate. Commit propuesto: `design(novedades): riel de lanzamientos con snap y progreso en celular`

---

### Task 4: guía compacta en el detalle

**Files:**
- Create: `apps/sitio/src/features/novedades/components/GuiaNotaRiel.tsx`
- Modify: `FichaNovedad.tsx` (montar el riel bajo la foto móvil; `Todas las novedades` con `max-lg:min-h-11`)
**Test:** agregar a `qa-novedades.mjs`:

```js
await page.goto(base + "/novedades/relime-2025", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const riel = page.locator('nav[data-guia-riel]');
ok(await riel.isVisible(), "guía-riel visible en celular");
const ids = await riel.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
ok(ids.length >= 2 && ids.every((x) => x.startsWith("#s-")), `la guía lista las secciones (${ids.length})`);
await riel.locator("a").nth(1).tap();
await page.waitForTimeout(1500);
ok(await riel.locator("a").nth(1).evaluate((a) => a.getAttribute("aria-current") === "true"), "tocar un chip activa esa sección");
ok(await riel.evaluate((el) => getComputedStyle(el).position === "sticky"), "la guía-riel es sticky");
```

- [ ] `GuiaNotaRiel.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import type { NovedadSeccion } from "@/features/novedades/data/novedades";

/**
 * «En esta nota» bajo `lg`: la columna sticky de escritorio no cabe, así que
 * la guía es un riel de chips pegajoso bajo el header, con la sección activa
 * marcada y siempre a la vista (el riel se desplaza solo). Misma lógica de
 * sección activa y de salto que la guía de escritorio (FichaNovedad).
 */
export function GuiaNotaRiel({ secciones, activa, onIr }: { secciones: NovedadSeccion[]; activa: string; onIr: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!el || !ref.current) return;
    ref.current.scrollTo({ left: el.offsetLeft - 20, behavior: "smooth" });
  }, [activa]);
  return (
    <nav data-guia-riel aria-label="En esta nota" className="sticky top-[4.75rem] z-20 -mx-5 mt-6 border-b border-azul-principal/10 bg-white/95 backdrop-blur lg:hidden">
      <div ref={ref} className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-2">
        {secciones.map((s, i) => {
          const on = activa === s.id;
          return (
            <a key={s.id} href={`#s-${s.id}`} onClick={(e) => onIr(e, s.id)} aria-current={on ? "true" : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 font-sans text-[0.85rem] font-medium whitespace-nowrap ${on ? "border-azul-principal bg-azul-principal text-white" : "border-azul-principal/15 text-gris-texto"}`}>
              <span className={`font-mono text-[0.62rem] ${on ? "text-verde-concepto" : "text-gris-texto/70"}`}>{String(i + 1).padStart(2, "0")}</span>
              {s.titulo}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
```
- [ ] `FichaNovedad.tsx`: después del `RevealFoco` móvil (`:701-706`) insertar `{secciones.length > 1 && <GuiaNotaRiel secciones={secciones} activa={activa} onIr={irASeccion} />}`; el `irASeccion` usa `offset: -120` (con el riel sticky de ~3.5rem bajo el header queda bien). Link «Todas las novedades» (`:672`): agregar `max-lg:min-h-11`. Test + gate. Commit propuesto: `design(novedades): la guía de la nota es un riel pegajoso en celular`

---

### Task 5: QA final de la fase y no regresión

- [ ] `qa-novedades.mjs` en 390, 320 y 768 contra prod (build + `pnpm start`); `qa-base` de `/novedades` y `/novedades/*` en 320/390/768/1024 táctil + `REDUCIDO=1` en 390 (modo `quieto`, frases listadas, chips y riel sin animación); comparación de escritorio de `/novedades` y `/novedades/relime-2025` en 1280/1440/1920 contra `base/` (`geoIgual = true`).
