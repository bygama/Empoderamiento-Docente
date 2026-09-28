# Investigación en celular y tablet · plan de implementación (fase 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Investigación con composición propia bajo 1024 px: hero con faro chico e historia de las cuatro constelaciones en escena corta, Líneas como pila de papeles (celular) y carpeta con entrada suave (tablet), Ciclo con la espiral que acompaña la lectura, expediente pulido para táctil, y cierre con el faro que sube y gira hacia cada mensaje; computadora idéntica.

**Architecture:** todas las coreografías de escritorio quedan detrás de su gate actual (`(hover: hover) and (min-width: 64rem)`) sin cambios. Lo móvil vive en componentes y coreografías nuevas (`hero/HistoriaMovil.tsx` + `hero/coreografia-historia-movil.ts`, `lineas/pila-movil.ts`, `coreografia-espiral-movil.ts`, `cierre/coreografia-cierre-movil.ts`) montados con `lg:hidden` o bajo un modo `movil` decidido por media query + alto mínimo, con fallback quieto (lo que hay hoy) en pantallas bajas y con movimiento reducido.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, GSAP + ScrollTrigger, Lenis.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (IN1–IN5), §5–7. Datos reutilizados: `components/constelacion.ts` (FIGURAS, PUNTOS, DISPERSION, MAX_ARISTAS, VIEWBOX), `components/espiral.ts` (NODOS, PATH_ESPIRAL, PATH_LAZO, LONGITUD_NODO, LARGO_ESPIRAL, BISAGRA), `components/estaciones.ts`.

## Global Constraints

- Todo efecto que decide un `modo` por media query se suscribe al `change` de cada `matchMedia` que usa (con una función `decidir()` y su limpieza), así el modo se recalcula al rotar o redimensionar sin recarga; la coreografía anterior se revierte con su `ctx.revert()`.
- Computadora congelada: **no editar ni quitar ninguna clase `md:`/`lg:`/`sm:` existente**; solo agregar `max-lg:`/`max-md:`/`md:max-lg:`/`lg:hidden` y ramas `movil` en ternarios cuya rama `vivo`/estática quede byte a byte igual. Archivos solo bajo `apps/sitio/src/features/investigacion/`.
- Solo `transform`/`opacity` (+ atributos SVG `cx/cy/x1…` y `strokeDashoffset`, como ya hace el hero); `will-change` desde la coreografía; `scrub` numérico.
- Targets ≥ 44 px; naranja solo en CTAs y en el personaje (uso ya aprobado).
- Componentes nuevos ≤ 200 líneas. `LineasInvestigacion` (397), `CierreInvestigacion` (365), `EvidenciasCaso` (207) reciben solo clases y ramas `movil` mínimas; si un archivo crece más de 30 líneas, extraer el bloque nuevo a un archivo propio.
- Gate: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` (100/100). Nuevos: CRLF + `git add -N`. Nadie commitea.

## Review Focus

1. Hero en 390×844: el faro chico se ve y no pisa los CTAs; la historia móvil existe debajo con 4 etapas y la constelación cambia de figura (pregunta → lupa → red → espiral) al scrollear. Test en Task 1.
2. Líneas en 390: pila de 6 papeles con lomos, ningún papel recortado; en 768 dos columnas y carpeta que entra inclinada suave; en 320×568 la columna quieta de hoy. Test en Task 2.
3. Ciclo en 390: la espiral queda fija arriba mientras se leen los 8 pasos; el personaje se mueve al nodo del paso visible y el trazo avanza. Test en Task 3.
4. Expediente en 390: abre, «seguir leyendo» visible, evidencias sin giro, «Volver» ≥ 44 px, cierra. Test en Task 4.
5. Cierre en 390: modo `movil`, el faro sube y el haz gira hacia cada mensaje; en 1440 nada cambia (comparación pixel/geometría). Test en Task 5/6.

---

### Task 1: hero con faro chico e historia móvil

**Files:**
- Create: `apps/sitio/src/features/investigacion/components/hero/HistoriaMovil.tsx`, `hero/coreografia-historia-movil.ts`
- Modify: `components/InvestigacionHero.tsx` (faro `lg:hidden`, padding `max-lg:`, montar `HistoriaMovil` después del `<section>` en un Fragment)
- Test: `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-investigacion.mjs`

**Interfaces:** `crearHistoriaMovil(zona: HTMLElement): () => void`; `export const ALTO_HISTORIA_LVH`. `HistoriaMovil` no recibe props.

- [ ] **Step 1: test (falla hoy)**

```js
// qa-investigacion.mjs — hero+historia, líneas, ciclo, expediente, cierre en celular.
import { chromium } from "playwright";
const [, , base = "http://localhost:3000"] = process.argv;
const browser = await chromium.launch({ headless: true });
const ok = (c, m) => { console.log(`${c ? "OK " : "FALLA"} ${m}`); if (!c) process.exitCode = 1; };
const abrir = async (w, h, ruta) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  return { ctx, page, errores };
};
const centro = (page, sel) => page.locator(sel).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
const alto = (page, sel) => page.locator(sel).evaluate((el) => el.getBoundingClientRect().height);

{
  const { ctx, page, errores } = await abrir(390, 844, "/investigacion");
  const faro = page.locator("[data-hero-linterna-movil]");
  ok(await faro.isVisible(), "faro chico visible en celular");
  const fr = await faro.boundingBox();
  const cta = await page.locator("#sentido a[href='#lineas']").boundingBox();
  ok(fr && cta && (fr.x >= cta.x + cta.width || fr.y >= cta.y + cta.height || fr.y + fr.height <= cta.y), "el faro no pisa el CTA");
  const hist = page.locator("[data-historia-movil]");
  ok(await hist.isVisible(), "historia móvil presente");
  const top = await centro(page, "[data-historia-movil]");
  const h = await alto(page, "[data-historia-movil]");
  const pos = async (k) => { await page.evaluate((y) => window.scrollTo(0, y), top + (h - 844) * ((k + 0.5) / 4)); await page.waitForTimeout(1300); return page.locator("[data-historia-movil] [data-hm-punto]").nth(0).evaluate((c) => [+c.getAttribute("cx"), +c.getAttribute("cy")]); };
  const p0 = await pos(0), p1 = await pos(1);
  ok(Math.hypot(p0[0] - p1[0], p0[1] - p1[1]) > 20, `la constelación cambia de figura entre etapas (${p0} → ${p1})`);
  const verbo = await page.locator("[data-historia-movil] [data-hm-verbo]").nth(1).evaluate((el) => +getComputedStyle(el).opacity);
  ok(verbo > 0.5, "el verbo de la segunda etapa está visible");
  ok(errores.length === 0, `hero: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
await browser.close();
```

- [ ] **Step 2: `hero/HistoriaMovil.tsx`**

```tsx
"use client";

import { Fragment, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { DISPERSION, FIGURAS, MAX_ARISTAS, PUNTOS, VIEWBOX } from "../constelacion";
import { ALTO_HISTORIA_LVH, crearHistoriaMovil } from "./coreografia-historia-movil";

/**
 * «Por qué investigamos» bajo `lg`: la historia del hero, que en escritorio
 * baja las estrellas sobre la hoja 01 y las morfea en cuatro figuras,
 * acá es una ESCENA CORTA: la constelación (los mismos 13 puntos y sus
 * aristas) se arma en la pregunta y cambia a lupa, red y espiral al
 * scrollear, con el riel 01–04, el verbo y la frase de cada etapa debajo.
 * Con movimiento reducido o pantallas bajas, las cuatro etapas en flujo con
 * su figura formada.
 */
export function HistoriaMovil() {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    if (!zona || reduced) return;
    if (!window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) return;
    zona.dataset.modo = "movil";
    const limpiar = crearHistoriaMovil(zona);
    return () => {
      limpiar();
      delete zona.dataset.modo;
    };
  }, [reduced]);

  return (
    <div
      ref={zonaRef}
      data-historia-movil
      aria-label="Por qué investigamos, en cuatro pasos"
      className="bg-azul-principal bg-grain-dark relative text-white lg:hidden data-[modo=movil]:h-[var(--alto)]"
      style={{ "--alto": `${ALTO_HISTORIA_LVH}lvh` } as React.CSSProperties}
    >
      <div data-hm-escena className="flex flex-col px-6 pt-20 pb-10 data-[modo=movil]:sticky data-[modo=movil]:top-0 data-[modo=movil]:h-lvh md:px-12">
        <p className="text-azul-claro/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">Archivo ED · Hoja 01 · Por qué investigamos</p>
        {/* La figura: 13 puntos + aristas, viewBox de las láminas. */}
        <svg data-hm-svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} aria-hidden="true" className="mx-auto mt-4 h-[38lvh] w-auto max-w-full md:h-[44lvh]">
          <g stroke="var(--color-azul-medio)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
            {Array.from({ length: MAX_ARISTAS }, (_, j) => (
              <line key={j} data-hm-arista x1="0" y1="0" x2="0" y2="0" opacity="0" />
            ))}
          </g>
          {PUNTOS.map((p, i) => (
            <circle key={i} data-hm-punto cx={DISPERSION[i][0]} cy={DISPERSION[i][1]} r={p.r} fill={p.color} />
          ))}
        </svg>
        {/* Riel 01–04, verbo y frase (mismo idioma que la hoja 01). */}
        <div className="mt-auto">
          <div data-hm-riel className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            {FIGURAS.map((f, i) => (
              <Fragment key={f.id}>
                <span data-hm-numero className="text-azul-claro/60 tabular-nums">0{i + 1}</span>
                {i < FIGURAS.length - 1 && (
                  <span className="relative h-px w-10 overflow-hidden bg-white/15">
                    <span data-hm-relleno className="bg-verde-concepto absolute inset-0 origin-left" />
                  </span>
                )}
              </Fragment>
            ))}
          </div>
          <div className="font-display relative mt-4 h-[1.4em] overflow-hidden text-[1.7rem] leading-[1.3] font-extrabold tracking-[-0.02em] md:text-[2.1rem]">
            {FIGURAS.map((f) => (
              <span key={f.id} data-hm-verbo className="absolute inset-0">{f.etiqueta}</span>
            ))}
          </div>
          <div className="text-azul-claro/85 mt-3 grid max-w-[38ch] text-[1rem] leading-relaxed md:text-[1.1rem]">
            {FIGURAS.map((f) => (
              <p key={f.id} data-hm-frase className="col-start-1 row-start-1">{f.frase}</p>
            ))}
          </div>
        </div>
      </div>
      {/* Fallback quieto (sin modo movil): las cuatro etapas en flujo. */}
      <ol data-hm-lista className="grid gap-10 px-6 pb-16 md:grid-cols-2 md:px-12 data-[modo=movil]:hidden">
        {FIGURAS.map((f, i) => (
          <li key={f.id}>
            <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} aria-hidden="true" className="h-40 w-auto">
              <g stroke="var(--color-azul-medio)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
                {f.aristas.map(([a, b], j) => (
                  <line key={j} x1={f.puntos[a][0]} y1={f.puntos[a][1]} x2={f.puntos[b][0]} y2={f.puntos[b][1]} />
                ))}
              </g>
              {f.puntos.map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={PUNTOS[k].r} fill={PUNTOS[k].color} />
              ))}
            </svg>
            <p className="text-azul-claro/60 mt-3 font-mono text-[0.68rem] tracking-[0.2em] uppercase">0{i + 1}</p>
            <h3 className="font-display mt-1 text-[1.4rem] font-extrabold">{f.etiqueta}</h3>
            <p className="text-azul-claro/85 mt-2 text-[1rem] leading-relaxed">{f.frase}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
```
Notas: el `data-[modo=movil]:` de Tailwind aplica sobre el mismo elemento que lleva el atributo; para los hijos usar la variante `[[data-modo=movil]_&]:` (escena y lista). Cuando el modo NO es movil, la escena queda en flujo pero su contenido (svg + riel) también se ve: en ese caso ocultarla con `[[data-modo=movil]_&]:flex hidden`… simplificar: escena con `hidden [[data-modo=movil]_&]:flex`, lista con `[[data-modo=movil]_&]:hidden`. En SSR (sin `data-modo`) se ve la lista quieta: correcto para touch sin JS y reduced.

- [ ] **Step 3: `hero/coreografia-historia-movil.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FIGURAS } from "../constelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ETAPA = 1;
const LVH_POR_ETAPA = 55;
const LVH_RESPIRO = 30;
export const ALTO_HISTORIA_LVH = 100 + FIGURAS.length * LVH_POR_ETAPA + LVH_RESPIRO;

/**
 * Cuatro etapas, una por figura: los 13 puntos viajan a sus posiciones
 * (atributos cx/cy, como en el hero de escritorio), las aristas se acomodan
 * y aparecen, el riel avanza, el verbo se releva y la frase se cruza. Todo
 * atado al scroll de la zona, reversible.
 */
export function crearHistoriaMovil(zona: HTMLElement) {
  const ctx = gsap.context(() => {
    const puntos = gsap.utils.toArray<SVGCircleElement>("[data-hm-punto]", zona);
    const aristas = gsap.utils.toArray<SVGLineElement>("[data-hm-arista]", zona);
    const verbos = gsap.utils.toArray<HTMLElement>("[data-hm-verbo]", zona);
    const frases = gsap.utils.toArray<HTMLElement>("[data-hm-frase]", zona);
    const rellenos = gsap.utils.toArray<HTMLElement>("[data-hm-relleno]", zona);
    const numeros = gsap.utils.toArray<HTMLElement>("[data-hm-numero]", zona);
    if (puntos.length !== 13) return;

    gsap.set(verbos, { yPercent: 110 });
    gsap.set(verbos[0], { yPercent: 0 });
    gsap.set(frases, { autoAlpha: 0 });
    gsap.set(frases[0], { autoAlpha: 1 });
    gsap.set(rellenos, { scaleX: 0 });
    gsap.set(numeros, { opacity: 0.6 });
    gsap.set(numeros[0], { opacity: 1 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: zona, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
    });

    FIGURAS.forEach((figura, k) => {
      const t = k * ETAPA;
      // La figura 0 se arma desde la dispersión en la primera etapa; las demás
      // morfean desde la anterior.
      puntos.forEach((c, i) => {
        tl.to(c, { attr: { cx: figura.puntos[i][0], cy: figura.puntos[i][1] }, duration: 0.55, ease: "power2.inOut" }, t + (k === 0 ? 0.02 : 0.1));
      });
      aristas.forEach((l, j) => {
        const ar = figura.aristas[j];
        if (!ar) {
          tl.to(l, { attr: { opacity: 0 }, duration: 0.15 }, t + 0.1);
          return;
        }
        const [a, b] = ar;
        tl.to(l, { attr: { x1: figura.puntos[a][0], y1: figura.puntos[a][1], x2: figura.puntos[b][0], y2: figura.puntos[b][1] }, duration: 0.55, ease: "power2.inOut" }, t + (k === 0 ? 0.02 : 0.1))
          .to(l, { attr: { opacity: 1 }, duration: 0.2 }, t + 0.45);
      });
      if (k > 0) {
        tl.to(verbos[k - 1], { yPercent: -110, duration: 0.3 }, t + 0.05)
          .to(verbos[k], { yPercent: 0, duration: 0.3 }, t + 0.12)
          .to(frases[k - 1], { autoAlpha: 0, duration: 0.2 }, t + 0.05)
          .to(frases[k], { autoAlpha: 1, duration: 0.3 }, t + 0.25)
          .to(rellenos[k - 1], { scaleX: 1, duration: 0.3, ease: "none" }, t)
          .to(numeros[k], { opacity: 1, duration: 0.2 }, t + 0.25);
      }
    });
    tl.set({}, {}, FIGURAS.length * ETAPA + 0.5);
  }, zona);
  return () => ctx.revert();
}
```

- [ ] **Step 4: `InvestigacionHero.tsx`**: envolver el return en `<>…</>` y agregar `<HistoriaMovil />` después del `</section>`. Dentro de la sección, después del `div[data-hero-linterna]`, agregar el faro chico:
```tsx
      <div data-hero-linterna-movil className="pointer-events-none absolute right-3 bottom-0 z-20 w-[clamp(96px,22svh,150px)] lg:hidden">
        <LinternaFaro prefijo="hero-movil" largoHaz={900} hazPose={-150} className="block h-auto w-full" />
      </div>
```
(verificar en `LinternaFaro.tsx` que `hazPose`/`largoHaz` existan con esos nombres; si el haz estático pisa el titular, subir `hazPose` hacia −135). Al grid del titular agregar `max-lg:pb-44 max-lg:pt-24` (aire para el faro). A la sección agregar `max-lg:min-h-[92lvh]`.

- [ ] **Step 5: test + gate.** Commit propuesto: `design(investigacion): en celular el hero lleva el faro y la historia en cuatro etapas`

---

### Task 2: Líneas como pila (celular) y carpeta con entrada suave (tablet)

**Files:** `lineas/pila-movil.ts` (nuevo), `LineasInvestigacion.tsx` (modo, atributos, ternarios), test.

- [ ] **Step 1: test** (agregar a `qa-investigacion.mjs` antes de `browser.close()`):
```js
for (const [w, h, esperado] of [[390, 844, "pila"], [375, 667, "pila"], [768, 1024, "tablet"], [320, 568, "quieto"]]) {
  const { ctx, page, errores } = await abrir(w, h, "/investigacion#lineas");
  const modo = await page.locator("#lineas").getAttribute("data-modo");
  ok(modo === esperado, `${w}x${h}: Líneas en modo ${modo}`);
  if (esperado === "pila") {
    const top = await centro(page, "[data-lineas-pista]");
    const hh = await alto(page, "[data-lineas-pista]");
    await page.evaluate((y) => window.scrollTo(0, y), top + (hh - h) * 0.6);
    await page.waitForTimeout(1300);
    const ys = await page.locator("[data-linea]").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    ok(ys.slice(1).some((y, i) => y > ys[i]), `${w}: los papeles se apilan con lomos (${ys.join(",")})`);
    await page.evaluate((y) => window.scrollTo(0, y), top + hh - h);
    await page.waitForTimeout(1300);
    ok(await page.locator("[data-linea]").last().evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight + 1), `${w}: el último papel no se corta`);
  }
  if (esperado === "tablet") {
    ok((await page.locator("#lineas ol").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)) === 2, "768: dos columnas de papeles");
  }
  ok(errores.length === 0, `${w}: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
```

- [ ] **Step 2: `lineas/pila-movil.ts`** — copiar la lógica de `apps/sitio/src/features/biblioteca/components/puente/pila-movil.ts` (fase 2) cambiando los selectores a `[data-lineas-pista]`, `[data-lineas-escena]`, `[data-lineas-pila]`, `[data-linea]`, `[data-linea-lomo]`, `[data-linea-cuerpo]`, `LVH_POR_PASO = 58`, 6 tarjetas (`ALTO_PILA_LINEAS_LVH = 100 + 5 * 58 + 40`), y exportar `crearPilaLineas(root)`. Mismo `encajar`, misma línea, misma salida.

- [ ] **Step 3: `LineasInvestigacion.tsx`**: estado `modo: "vivo" | "tablet" | "pila" | "quieto"` decidido en un efecto (`reduced` → quieto; `(hover: hover) and (min-width: 64rem)` → vivo; `(min-width: 48rem) and (max-width: 63.999rem)` → tablet; `(max-width: 47.999rem) and (min-height: 38.75rem)` → pila; si no, quieto); el efecto de escritorio pasa a depender de `modo === "vivo"` (su cuerpo no cambia). Efecto `pila`: `crearPilaLineas(zona)`. Efecto `tablet`: `gsap.fromTo(carpeta, { rotation: 3, transformOrigin: "50% 50%" }, { rotation: 0, ease: "power2.out", scrollTrigger: { trigger: carpeta, start: "top bottom", end: "top 35%", scrub: 0.6 } })` dentro de un `gsap.context`. Markup: `<section data-modo={modo}>`; el div de contenido (`relative px-6 pt-28 pb-24 …`) recibe `data-lineas-pista` y `style={modo === "pila" ? { height: \`${ALTO_PILA_LINEAS_LVH}lvh\` } : undefined}`; envolver su interior (número fantasma, folio, encabezado, `<ol>`, CTA) en un `<div data-lineas-escena className={modo === "pila" ? "sticky top-0 flex h-lvh flex-col" : "contents"}>` (con `contents` en escritorio el layout no cambia); el `<ol>` recibe `data-lineas-pila` y `className={modo === "pila" ? "relative mt-6 min-h-0 flex-1" : "mt-14 grid items-start gap-x-8 gap-y-10 lg:mt-16 lg:grid-cols-2 lg:gap-y-12 md:max-lg:grid-cols-2"}`; cada `Papel` (`<li data-linea>`): en pila `absolute inset-x-0 top-0` (agregar `[[data-modo=pila]_&]:absolute [[data-modo=pila]_&]:inset-x-0 [[data-modo=pila]_&]:top-0`); la fila número + nombre recibe `data-linea-lomo` y el `<h3>` + `<Link>` se envuelven en `<div data-linea-cuerpo>`; el encabezado en pila: `[[data-modo=pila]_&]:hidden` para el número fantasma y el folio. El CTA final: `[[data-modo=pila]_&]:mt-4`.

- [ ] **Step 4: test + gate.** Commit propuesto: `design(investigacion): en celular las líneas se apilan y en tablet la carpeta entra suave`

---

### Task 3: la espiral que acompaña la lectura

**Files:** `coreografia-espiral-movil.ts` (nuevo), `EspiralEstatica.tsx` (clases `max-lg:`, `data-estacion`), `EspiralInvestigacion.tsx` (montar bajo lg), test.

- [ ] **Step 1: test**:
```js
{
  const { ctx, page, errores } = await abrir(390, 844, "/investigacion#ciclo");
  const svg = page.locator("#ciclo [data-espiral-svg]");
  ok((await svg.evaluate((el) => getComputedStyle(el.parentElement).position)) === "sticky", "la espiral es sticky en celular");
  const est = page.locator("#ciclo [data-estacion='3']");
  await est.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1400);
  const pers = await page.locator("#ciclo [data-espiral-personaje]").evaluate((g) => g.getAttribute("transform"));
  ok(pers && !/translate\(\s*0/.test(pers), `el personaje se movió (${pers})`);
  const off = await page.locator("#ciclo [data-espiral-path]").evaluate((p) => +getComputedStyle(p).strokeDashoffset.replace("px", ""));
  ok(off < 1e9 && !Number.isNaN(off), "el trazo tiene dash-offset animable");
  ok(errores.length === 0, `ciclo: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
```

- [ ] **Step 2: `coreografia-espiral-movil.ts`**:
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LARGO_ESPIRAL, LONGITUD_NODO, NODOS } from "./espiral";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * El ciclo bajo `lg`: la espiral queda fija arriba y acompaña los ocho
 * pasos que se leen debajo. El trazo avanza hasta la estación visible, el
 * nodo activo crece y el personaje (naranja) salta al nodo del paso que se
 * está leyendo. Solo atributos SVG y transform.
 */
export function crearEspiralMovil(zona: HTMLElement) {
  const path = zona.querySelector<SVGPathElement>("[data-espiral-path]");
  const lazo = zona.querySelector<SVGPathElement>("[data-espiral-lazo]");
  const personaje = zona.querySelector<SVGGElement>("[data-espiral-personaje]");
  const nodos = gsap.utils.toArray<SVGCircleElement>("[data-espiral-nodo]", zona);
  const estaciones = gsap.utils.toArray<HTMLElement>("[data-estacion]", zona);
  if (!path || !personaje || nodos.length !== estaciones.length) return () => {};
  const ctx = gsap.context(() => {
    gsap.set(path, { strokeDasharray: LARGO_ESPIRAL, strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[0] });
    if (lazo) {
      const l = lazo.getTotalLength();
      gsap.set(lazo, { strokeDasharray: l, strokeDashoffset: l });
    }
    gsap.set(personaje, { x: NODOS[0][0], y: NODOS[0][1], attr: { transform: "" } });
    gsap.set(nodos, { scale: 1, transformOrigin: "50% 50%" });
    let activo = 0;
    const ir = (k: number) => {
      activo = k;
      gsap.to(path, { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[k], duration: 0.6, ease: "power2.out", overwrite: true });
      gsap.to(personaje, { x: NODOS[k][0], y: NODOS[k][1], duration: 0.6, ease: "power2.inOut", overwrite: true });
      nodos.forEach((n, i) => gsap.to(n, { scale: i === k ? 1.6 : 1, duration: 0.3, overwrite: true }));
      if (lazo) gsap.to(lazo, { strokeDashoffset: k === nodos.length - 1 ? 0 : lazo.getTotalLength(), duration: 0.8, ease: "power2.out", overwrite: true });
    };
    estaciones.forEach((e, k) => {
      ScrollTrigger.create({ trigger: e, start: "top 62%", end: "bottom 38%", onToggle: (self) => { if (self.isActive && activo !== k) ir(k); } });
    });
  }, zona);
  return () => ctx.revert();
}
```

- [ ] **Step 3: markup**: en `EspiralEstatica.tsx` el `div` de la espiral (`mx-auto w-full max-w-[420px] lg:sticky …`) recibe `max-lg:sticky max-lg:top-[4.75rem] max-lg:z-10 max-lg:h-[36lvh] max-lg:w-auto max-lg:max-w-none max-lg:bg-white/95 max-lg:backdrop-blur max-lg:py-2 max-lg:-mx-6 max-lg:px-6` y el `EspiralSvg` recibe `className="max-lg:mx-auto max-lg:h-full max-lg:w-auto"`; cada `<li>` de las dos listas recibe `data-estacion={i}` (vuelta 2: `i + VUELTA_1.length`). En `EspiralInvestigacion.tsx`, efecto nuevo: `if (live || reduced) return; if (!matchMedia("(max-width: 63.999rem)").matches) return; return crearEspiralMovil(zona)` (dependencias `[live, reduced]`). Comprobar que `data-espiral-personaje` tenga el `transform` inicial (`translate(nodo0)`): el `gsap.set` de arriba lo reemplaza por x/y; con reduced no corre nada y el SSR queda como hoy.

- [ ] **Step 4: test + gate.** Commit propuesto: `design(investigacion): en celular la espiral acompaña la lectura de los ocho pasos`

---

### Task 4: expediente y carpetas para táctil

**Files:** `casos/ExpedienteCaso.tsx:148`, `casos/EvidenciasCaso.tsx:127`, `casos/expediente/CabeceraExpediente.tsx` (botón volver), `casos/TapaCarpeta.tsx` (rótulo en reposo bajo hover:none), test.

- [ ] **Step 1: test**:
```js
{
  const { ctx, page, errores } = await abrir(390, 844, "/investigacion#en-accion");
  await page.locator("[data-carpeta-item] button[aria-label^='Abrir expediente']").first().tap();
  await page.waitForTimeout(1800);
  const exp = page.locator("#expediente-caso");
  ok(await exp.isVisible(), "el expediente abre");
  ok(await page.locator("#expediente-caso ~ p, p:has-text('SEGUIR LEYENDO')").first().isVisible(), "pista «seguir leyendo» visible en celular");
  const rot = await page.locator("#expediente-caso [data-evidencia-movible], #expediente-caso ul li").evaluateAll((els) => els.map((e) => getComputedStyle(e).rotate));
  ok(rot.every((r) => r === "none" || r === "0deg"), `evidencias sin giro (${[...new Set(rot)].join(",")})`);
  const volver = page.locator("#expediente-caso button:has-text('Volver'), #expediente-caso a:has-text('Volver')").first();
  const vb = await volver.boundingBox();
  ok(vb && vb.height >= 44, `«Volver» ≥ 44 px (${vb && Math.round(vb.height)})`);
  await volver.tap();
  await page.waitForTimeout(1500);
  ok(!(await exp.isVisible()), "el expediente cierra");
  ok(errores.length === 0, `expediente: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
```
(ajustar selectores al markup real de `CabaceraExpediente`/`BandaSiguiente`).

- [ ] **Step 2: cambios**: `ExpedienteCaso.tsx:148` pista: quitar la dependencia de `lg` agregando `max-lg:flex max-lg:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] max-lg:left-5` (el `hidden … lg:flex` queda; `max-lg:flex` lo muestra bajo lg). `EvidenciasCaso.tsx:127` `<li>`: agregar `max-lg:[rotate:0deg]!` (importante para pisar el `style` inline solo bajo lg). Botón «Volver» de la cabecera: `max-lg:min-h-11`. Tapa: el rótulo que se despliega por hover queda visible en reposo bajo `(hover: none)`: agregar al contenedor del rótulo `[@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0` (verificar qué clases usa el estado desplegado en `TapaCarpeta.tsx` y replicarlas bajo esa media query).

- [ ] **Step 3: test + gate.** Commit propuesto: `design(investigacion): expediente y carpetas afinados para táctil`

---

### Task 5: cierre con el faro que sube y gira

**Files:** `cierre/coreografia-cierre-movil.ts` (nuevo), `CierreInvestigacion.tsx` (modo `movil`, faro `lg:hidden`, nubes móviles, atributos), test.

- [ ] **Step 1: test**:
```js
{
  const { ctx, page, errores } = await abrir(390, 844, "/investigacion#conversemos");
  ok((await page.locator("#conversemos").getAttribute("data-modo")) === "movil", "cierre en modo movil");
  const top = await centro(page, "[data-cierre-pista]");
  const hh = await alto(page, "[data-cierre-pista]");
  await page.evaluate((y) => window.scrollTo(0, y), top + (hh - 844) * 0.45);
  await page.waitForTimeout(1400);
  const b1 = await page.locator("#biblioteca").evaluate((el) => +getComputedStyle(el).opacity);
  const b2 = await page.locator("[data-cierre-bloque]").nth(1).evaluate((el) => +getComputedStyle(el).opacity);
  ok(b1 > 0.8 && b2 < 0.3, `a mitad de escena se lee el primer mensaje y no el segundo (${b1.toFixed(2)}, ${b2.toFixed(2)})`);
  await page.evaluate((y) => window.scrollTo(0, y), top + hh - 844);
  await page.waitForTimeout(1400);
  ok((await page.locator("[data-cierre-bloque]").nth(1).evaluate((el) => +getComputedStyle(el).opacity)) > 0.8, "al final se lee el segundo mensaje");
  ok(await page.locator("[data-cierre-linterna-movil]").isVisible(), "faro móvil visible");
  ok(errores.length === 0, `cierre: sin errores (${errores.join(" | ")})`);
  await ctx.close();
}
```

- [ ] **Step 2: `cierre/coreografia-cierre-movil.ts`**: leer primero `coreografia-cierre.ts` y `LinternaFaro.tsx` para identificar el grupo del haz (buscar el `data-*` con prefijo que gira: en escritorio la coreografía rota el haz para «leer» cada mensaje; usar el MISMO selector con el prefijo `cierre-movil`) y el origen de la rotación. Coreografía (zona = `[data-cierre-pista]`, escena sticky `h-lvh`): pista `ALTO_CIERRE_LVH = 100 + 120 + 30`; timeline scrub 0.8: 0–0.3 las dos nubes móviles se abren (`x: ∓40%`, `autoAlpha 0`); 0.1–0.5 el faro sube (`y: 40% → 0`) y `autoAlpha 0 → 1`; 0.5 el haz gira al primer mensaje (rotación al ángulo que apunte arriba-izquierda; el bloque 1 pasa `autoAlpha 0 → 1` en 0.55–0.7); 1.0–1.2 el haz gira al segundo (arriba-derecha) y el bloque 2 `autoAlpha 0 → 1` mientras el 1 baja a 0.35; `tl.set({}, {}, 1.5)`. Los ángulos concretos se calibran midiendo los bloques con `getBoundingClientRect` y `Math.atan2` desde la lámpara (la función `girarHacia(el)` calcula el ángulo; usar `invalidateOnRefresh` con valores por función).

- [ ] **Step 3: markup**: `CierreInvestigacion.tsx`: estado `modo` (`vivo` = hover+64rem; `movil` = `(max-width: 63.999rem) and (min-height: 38.75rem)`; `quieto` = resto o reduced); el efecto de escritorio pasa a `if (modo !== "vivo") return;` con el mismo cuerpo. Efecto `movil`: `crearCierreMovil(zona)`. Markup: `<div ref={zonaRef} data-footer-dock-tint="propio" data-cierre-pista style={modo === "movil" ? { height: \`${ALTO_CIERRE_LVH}lvh\` } : undefined}>`; la `<section>` recibe `data-modo={modo}` y, en movil, `sticky top-0 h-lvh` vía `[[data-modo=movil]_&]:sticky [[data-modo=movil]_&]:top-0 [[data-modo=movil]_&]:h-lvh` (el `min-h-[100svh]` y el `pb-[var(--footer-radio)]` quedan). Faro móvil: `<div data-cierre-linterna-movil className="pointer-events-none absolute inset-x-0 bottom-[var(--footer-radio)] z-30 flex justify-center lg:hidden"><div className="w-[clamp(120px,22svh,180px)]"><LinternaFaro prefijo="cierre-movil" className="block h-auto w-full" /></div></div>`. Nubes móviles: dos `<span data-cierre-nube-movil>` con `lg:hidden`, `absolute` (una a la izquierda a 30 % de alto, otra a la derecha a 45 %), `w-[70vw] h-[18lvh] rounded-full` y `background: radial-gradient(closest-side, rgb(255 255 255 / 0.18), transparent)`, `blur` NO (costoso). Los bloques de texto: la grilla `relative z-30 … grid min-h-[100svh] … gap-y-14 px-6 py-24` recibe `[[data-modo=movil]_&]:min-h-0 [[data-modo=movil]_&]:h-full [[data-modo=movil]_&]:content-between [[data-modo=movil]_&]:pb-[calc(var(--footer-radio)+9rem)]` (mensaje 1 arriba, mensaje 2 abajo del faro: probar en 390×844 y 375×667 que no se solapen con la linterna; si no entra, `encajar` los bloques con scale como en las pilas).

- [ ] **Step 4: test + gate.** Commit propuesto: `design(investigacion): en celular el cierre sube el faro y gira la luz hacia cada mensaje`

---

### Task 6: QA final de la fase y no regresión

- [ ] `qa-investigacion.mjs` contra prod; `qa-base` de `/investigacion` en 320/390/768/1024 táctil + `REDUCIDO=1` (hero con lista quieta, líneas en columna, espiral quieta, cierre quieto); comparación de escritorio de `/investigacion` en 1280/1440/1920 contra `base/` (`geoIgual = true`) y de las protegidas contra `base-limpia/`.
