# Biblioteca en celular y tablet · plan de implementación (fase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que Biblioteca tenga composición propia bajo 1024 px: hero sin zoom de iOS, destacados como baraja deslizable, catálogo con barra compacta y hoja de filtros, puente como pila con lomos, cierre ajustado; computadora (≥ 1024) idéntica.

**Architecture:** todo bajo `lg` (< 64rem). El markup de escritorio no se modifica: se oculta con `max-lg:hidden` donde hace falta y se monta al lado un componente móvil nuevo (`lg:hidden`) que reutiliza el estado y los callbacks existentes. Las coreografías móviles van en archivos propios con `gsap.matchMedia` / gate explícito por modo (`vivo | movil | quieto`), como `ProyectosAplicaciones` en Qué hacemos.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, GSAP + ScrollTrigger, Lenis (`getLenis`), `useLockScroll` y `useReducedMotion` de `@/lib/hooks`.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (BI1–BI5), §5–7.

## Global Constraints

- Computadora congelada: **no editar ni quitar ninguna clase `md:`/`lg:` existente**; solo agregar `max-lg:`/`max-md:`/`lg:hidden`. Archivos solo bajo `apps/sitio/src/features/biblioteca/`. Nada en `globals.css`, `components/`, `lib/`.
- Solo `transform`/`opacity` (y `clipPath` ya existente) en animaciones; `will-change` lo pone y saca la coreografía, nunca un className. `scrub` numérico (nunca `true` en código nuevo).
- Targets táctiles ≥ 44 px; inputs ≥ 16 px; `env(safe-area-inset-bottom)` en la hoja.
- Componentes nuevos ≤ 200 líneas; `MaterialesListado.tsx` ya supera el tope: se le extrae `FilaMaterial` a su archivo (mismo JSX) y no se le agregan más de ~12 líneas netas.
- Copy inclusivo; naranja solo en CTAs existentes.
- Gate: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` (100/100). Archivos nuevos: CRLF (`sed -i 's/\r*$/\r/'`) y `git add -N`.
- Nadie commitea: cada tarea deja el mensaje de commit propuesto en su informe.

## Review Focus

1. `/biblioteca?tipo=Libros#materiales` en 390 px: la barra móvil muestra el chip «Libros», el contador dice los libros, la hoja abre con «Libros» marcado. Test en Task 2.
2. Hoja de filtros abierta: el scroll de la página queda bloqueado (Lenis parado), el foco entra a la hoja y vuelve al botón «Filtros» al cerrar; Escape cierra. Test en Task 2.
3. Baraja de destacados: deslizar al tercer cover cambia el texto al tercer artículo y marca el tercer punto; los cuatro artículos completos siguen en el DOM (nada se oculta al lector de pantalla salvo el duplicado de escritorio, que ya tiene `max-lg:hidden`). Test en Task 3.
4. Puente en 375×667 (bajo): el modo móvil entra (≥ 38.75rem de alto) y ninguna tarjeta se corta: `encajar` escala el interior. En 320×568 cae a lista quieta. Test en Task 4.
5. Computadora 1280/1440/1920: comparación pixel + geometría de `/biblioteca` idéntica a `base/`. Test en Task 6.

---

### Task 1: hero y riel (zoom de iOS, targets, snap)

**Files:**
- Modify: `apps/sitio/src/features/biblioteca/components/BibliotecaHero.tsx:78` (section), `:159` (input)
- Modify: `apps/sitio/src/features/biblioteca/components/CategoriasRail.tsx:98-106` (riel y píldoras)

- [ ] **Step 1: cambios**

`BibliotecaHero.tsx` línea 78, agregar a la className de `<section>`: `max-md:min-h-[80lvh]`.
Línea 159, className del `<input>`: agregar `max-lg:text-[1rem]` (16 px: iOS no hace zoom).
`CategoriasRail.tsx` línea 98 (div `ref={railRef}`): agregar `max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-2`.
Línea 106 (botón de píldora): agregar `max-lg:min-h-11 max-lg:snap-start`.

- [ ] **Step 2: verificación**

Con el dev server en :3000: `cd /c/Users/gasto/AppData/Local/Temp/edqa/restantes/pw && MSYS_NO_PATHCONV=1 node qa-base.mjs http://localhost:3000 "C:/Users/gasto/AppData/Local/Temp/edqa/restantes/qa-02/hero" "/biblioteca" "390x844t" 3` y comprobar en `qa-02/hero/390x844t/biblioteca/datos.json` → `audit.inputsChicos` tiene solo el buscador del catálogo (Task 2 lo arregla) y `audit.chicos` no lista píldoras del riel.
Gate en verde.

- [ ] **Step 3: commit propuesto**

`design(biblioteca): hero sin zoom en iOS, riel con snap y targets táctiles`

---

### Task 2: catálogo con barra compacta y hoja de filtros

**Files:**
- Create: `apps/sitio/src/features/biblioteca/components/materiales-listado/FilaMaterial.tsx` (extraída, mismo JSX + variante `max-md:`)
- Create: `apps/sitio/src/features/biblioteca/components/materiales-listado/FiltrosMovil.tsx`
- Create: `apps/sitio/src/features/biblioteca/components/materiales-listado/HojaFiltros.tsx`
- Modify: `apps/sitio/src/features/biblioteca/components/MaterialesListado.tsx` (aside `max-lg:hidden`, montar `FiltrosMovil`, importar `FilaMaterial`, exportar el tipo `Filtros`)
- Modify: `apps/sitio/src/features/biblioteca/components/materiales-listado/FiltroGrupo.tsx:96` (píldora)
- Test: `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-biblioteca.mjs`

**Interfaces:**
- Produces: `export type Filtros = { tipo: string | null; publico: string | null; anio: number | null }` desde `MaterialesListado.tsx`; `<FiltrosMovil busqueda onBuscar filtros onCambiar onLimpiar hayFiltros total />`; `<HojaFiltros abierta onCerrar filtros onCambiar onLimpiar total />`.

- [ ] **Step 1: test (falla hoy)** — crear `qa-biblioteca.mjs`:

```js
// qa-biblioteca.mjs — catálogo móvil: barra, hoja de filtros, ?tipo=, baraja de destacados.
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

await page.goto(base + "/biblioteca?tipo=Libros#materiales", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const barra = page.locator("[data-filtros-movil]");
ok(await barra.isVisible(), "barra móvil de filtros visible");
ok(!(await page.locator('aside[aria-label="Buscador y filtros del catálogo"]').isVisible()), "sidebar de escritorio oculta bajo lg");
ok((await barra.locator("[data-chip-activo]").allInnerTexts()).some((t) => t.includes("Libros")), "chip activo «Libros» desde ?tipo=");
const contador = async () => (await page.locator('#materiales p[aria-live="polite"]').innerText()).trim();
const conLibros = await contador();
ok(/\d+ materiales? con esta búsqueda/.test(conLibros), `contador con filtro: «${conLibros}»`);
// input ≥ 16px
ok((await barra.locator("input").evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) >= 16, "buscador móvil ≥ 16 px");
// abrir la hoja
await barra.locator("button[data-abrir-filtros]").tap();
await page.waitForTimeout(600);
const hoja = page.locator("dialog[data-hoja-filtros]");
ok(await hoja.isVisible(), "hoja de filtros abierta");
ok(await hoja.evaluate((d) => d.open && d.matches(":modal")), "la hoja es modal");
ok((await hoja.locator('button[aria-pressed="true"]').allInnerTexts()).includes("Libros"), "«Libros» marcado en la hoja");
const pil = await hoja.locator("button[aria-pressed]").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
ok(pil.every((x) => x >= 44), `píldoras ≥ 44 px (${Math.min(...pil)})`);
// elegir Tesis (tipo) → contador cambia; cerrar con «Ver n materiales»
await hoja.locator('button[aria-pressed]:has-text("Tesis")').tap();
await page.waitForTimeout(300);
await hoja.locator("button[data-cerrar-hoja]").tap();
await page.waitForTimeout(600);
ok(!(await hoja.isVisible()), "la hoja cierra");
ok((await barra.locator("[data-chip-activo]").allInnerTexts()).some((t) => t.includes("Tesis")), "chip activo «Tesis»");
ok(new URL(page.url()).searchParams.get("tipo") === "Tesis", "?tipo=Tesis en la URL");
ok(await page.evaluate(() => document.activeElement?.hasAttribute("data-abrir-filtros")), "el foco vuelve al botón Filtros");
// quitar el chip con su ×
await barra.locator("[data-chip-activo] button").first().tap();
await page.waitForTimeout(300);
ok((await contador()).startsWith("57"), "sin filtros vuelve a 57 materiales");
// filas compactas: portada al costado (no a todo el ancho)
const fila = page.locator("#materiales article").first();
const [imgW, artW] = await fila.evaluate((a) => [a.querySelector("div").getBoundingClientRect().width, a.getBoundingClientRect().width]);
ok(imgW < artW * 0.5, `portada compacta (${Math.round(imgW)} de ${Math.round(artW)})`);
ok(errores.length === 0, `sin errores de consola (${errores.join(" | ")})`);
await browser.close();
```

- [ ] **Step 2: correr y ver que falla** (`node qa-biblioteca.mjs http://localhost:3000 390x844` → falla «barra móvil», «sidebar oculta», etc.).

- [ ] **Step 3: extraer `FilaMaterial`** a `materiales-listado/FilaMaterial.tsx` con EXACTAMENTE el JSX actual (`MaterialesListado.tsx:357-411`, con sus imports `Image`, `ArrowUpRight`, `accionDe`, `type Material`), `export function FilaMaterial`, y estas clases agregadas (solo agregar): `<article>` → `max-md:grid-cols-[34%_minmax(0,1fr)] max-md:gap-4 max-md:py-5`; div de portada → `max-md:aspect-[3/4] max-md:self-start`; `sizes` → `"(min-width: 768px) 218px, 34vw"` (era `100vw`: la portada ya no ocupa el ancho); `h3` → `max-md:text-[1.08rem]`; párrafo de descripción → `max-md:text-[0.9rem]`; el `<a>` naranja → `max-md:min-h-11`. En `MaterialesListado.tsx` borrar la función local, importar `{ FilaMaterial } from "./materiales-listado/FilaMaterial"`, y exportar `type Filtros`.

- [ ] **Step 4: `FiltrosMovil.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Search, X } from "@/components/ui/icons";
import type { Filtros } from "../MaterialesListado";
import { HojaFiltros } from "./HojaFiltros";

type Props = {
  busqueda: string;
  onBuscar: (v: string) => void;
  filtros: Filtros;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
  hayFiltros: boolean;
  total: number;
};

/**
 * Filtros del catálogo bajo `lg`: la sidebar de escritorio no cabe arriba de
 * los resultados (era una pantalla entera antes del primer material). Acá
 * queda una BARRA pegajosa bajo el header —buscador, botón «Filtros» con la
 * cuenta de filtros puestos y los chips activos, cada uno con su ×— y una
 * HOJA inferior con los tres grupos (HojaFiltros). Mismo estado y mismos
 * callbacks que la sidebar: `?tipo=` sigue viajando en la URL.
 */
export function FiltrosMovil({ busqueda, onBuscar, filtros, onCambiar, onLimpiar, hayFiltros, total }: Props) {
  const [abierta, setAbierta] = useState(false);
  const activos: { etiqueta: string; quitar: () => void }[] = [];
  if (filtros.tipo) activos.push({ etiqueta: filtros.tipo, quitar: () => onCambiar({ tipo: null }) });
  if (filtros.publico) activos.push({ etiqueta: filtros.publico, quitar: () => onCambiar({ publico: null }) });
  if (filtros.anio !== null) activos.push({ etiqueta: String(filtros.anio), quitar: () => onCambiar({ anio: null }) });

  return (
    <div data-filtros-movil className="sticky top-[4.75rem] z-20 -mx-5 border-b border-azul-principal/10 bg-white px-5 pt-3 pb-3 lg:hidden">
      <div className="border-azul-principal/15 focus-within:border-azul-medio focus-within:ring-azul-claro/60 flex items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-colors focus-within:ring-2">
        <span className="text-gris-texto shrink-0">
          <Search size={18} />
        </span>
        <label htmlFor="materiales-buscar-movil" className="sr-only">
          Buscar en el catálogo
        </label>
        <input
          id="materiales-buscar-movil"
          type="search"
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscá por título, tema o autora…"
          className="text-azul-principal placeholder:text-gris-texto h-11 min-w-0 flex-1 bg-transparent font-sans text-[1rem] outline-none"
        />
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          data-abrir-filtros
          aria-expanded={abierta}
          aria-haspopup="dialog"
          onClick={() => setAbierta(true)}
          className="border-azul-principal text-azul-principal inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-4 font-sans text-[0.92rem] font-medium"
        >
          Filtros
          {activos.length > 0 && (
            <span className="bg-azul-principal rounded-full px-2 py-0.5 font-mono text-[0.7rem] text-white">
              {activos.length}
            </span>
          )}
        </button>
        {/* Chips activos en riel horizontal: se ve qué filtro hay puesto sin abrir la hoja. */}
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {activos.map((a) => (
            <span
              key={a.etiqueta}
              data-chip-activo
              className="bg-azul-principal inline-flex shrink-0 items-center gap-1 rounded-md pl-2.5 font-sans text-[0.8rem] font-medium text-white"
            >
              {a.etiqueta}
              <button type="button" aria-label={`Quitar ${a.etiqueta}`} onClick={a.quitar} className="flex h-11 w-9 items-center justify-center">
                <X size={14} />
              </button>
            </span>
          ))}
          {hayFiltros && (
            <button type="button" onClick={onLimpiar} className="text-gris-texto min-h-11 shrink-0 px-2 font-sans text-[0.83rem] underline underline-offset-4">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      <HojaFiltros abierta={abierta} onCerrar={() => setAbierta(false)} filtros={filtros} onCambiar={onCambiar} onLimpiar={onLimpiar} total={total} />
    </div>
  );
}
```
Si `X` no existe en `@/components/ui/icons`, usar el ícono de cerrar que exista ahí (buscar `export function X` o `Close`); NO agregar íconos a `components/`.

- [ ] **Step 5: `HojaFiltros.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLockScroll } from "@/lib/hooks/useLockScroll";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ANIOS, PUBLICOS, TIPOS } from "../../data/materiales";
import type { Filtros } from "../MaterialesListado";
import { FiltroGrupo } from "./FiltroGrupo";

type Props = {
  abierta: boolean;
  onCerrar: () => void;
  filtros: Filtros;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
  total: number;
};

const GRUPOS = ["Tipo de material", "Público", "Año"] as const;

/**
 * Hoja inferior con los tres grupos de filtros (los mismos FiltroGrupo de la
 * sidebar). `<dialog>` modal: el foco queda adentro y Escape cierra; Lenis se
 * para mientras está abierta (useLockScroll) y `data-lenis-prevent` deja que la
 * hoja scrollee sola si no entra. Entra deslizando desde abajo (transform), no
 * anima altura, y con movimiento reducido aparece de una.
 */
export function HojaFiltros({ abierta, onCerrar, filtros, onCambiar, onLimpiar, total }: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const reduced = useReducedMotion();
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(GRUPOS[0]);
  useLockScroll(abierta);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) {
      d.showModal();
      if (!reduced) gsap.fromTo(d, { y: "100%" }, { y: 0, duration: 0.32, ease: "power3.out", clearProps: "transform" });
    } else if (!abierta && d.open) {
      d.close();
    }
  }, [abierta, reduced]);

  const alternar = (g: string) => () => setGrupoAbierto((a) => (a === g ? null : g));

  return (
    <dialog
      ref={ref}
      data-hoja-filtros
      data-lenis-prevent
      aria-label="Filtros del catálogo"
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85lvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 text-azul-principal shadow-[0_-24px_60px_-24px_rgb(31_45_77/0.35)] backdrop:bg-azul-principal/40"
    >
      <div className="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <span aria-hidden="true" className="bg-azul-principal/20 mx-auto block h-1 w-10 rounded-full" />
        <div className="mt-3 flex items-center justify-between">
          <h2 className="font-display text-azul-principal text-[1.2rem] font-bold tracking-[-0.01em]">Filtros</h2>
          <button type="button" onClick={onLimpiar} className="text-gris-texto min-h-11 px-2 font-sans text-[0.85rem] underline underline-offset-4">
            Limpiar todo
          </button>
        </div>
        <div className="border-azul-principal/10 mt-2 border-t [&_button[aria-pressed]]:min-h-11 [&_button[aria-pressed]]:px-4">
          <FiltroGrupo label={GRUPOS[0]} opciones={TIPOS} valor={filtros.tipo} onChange={(tipo) => onCambiar({ tipo })} abierto={grupoAbierto === GRUPOS[0]} onAlternar={alternar(GRUPOS[0])} />
          <FiltroGrupo label={GRUPOS[1]} opciones={PUBLICOS} valor={filtros.publico} onChange={(publico) => onCambiar({ publico })} abierto={grupoAbierto === GRUPOS[1]} onAlternar={alternar(GRUPOS[1])} />
          <FiltroGrupo label={GRUPOS[2]} opciones={ANIOS.map(String)} valor={filtros.anio === null ? null : String(filtros.anio)} onChange={(anio) => onCambiar({ anio: anio === null ? null : Number(anio) })} abierto={grupoAbierto === GRUPOS[2]} onAlternar={alternar(GRUPOS[2])} />
        </div>
        <button
          type="button"
          data-cerrar-hoja
          onClick={onCerrar}
          className="bg-azul-principal mt-5 flex min-h-12 w-full items-center justify-center rounded-lg font-sans text-[0.95rem] font-medium text-white"
        >
          Ver {total === 1 ? "1 material" : `${total} materiales`}
        </button>
      </div>
    </dialog>
  );
}
```
Notas: `useLockScroll(open: boolean)` existe en `@/lib/hooks/useLockScroll` (lo usa MobileNav; verificar su firma antes y adaptar la llamada si difiere). El foco: `showModal()` lo mueve adentro y `close()` lo devuelve al botón que abrió (comportamiento nativo del dialog). `FiltroGrupo.tsx:96` (Píldora): agregar `max-lg:min-h-11 max-lg:px-4` para que también en la sidebar de tablet (si se viera) cumpla 44 px.

- [ ] **Step 6: montar en `MaterialesListado.tsx`**

Al `<aside>` agregar `max-lg:hidden`. Antes del `<div>` de resultados (línea 283) insertar:
```tsx
            <FiltrosMovil
              busqueda={busqueda}
              onBuscar={buscar}
              filtros={filtros}
              onCambiar={cambiarFiltro}
              onLimpiar={limpiar}
              hayFiltros={hayFiltros}
              total={resultados.length}
            />
```
(el grid padre es `grid gap-y-10 lg:grid-cols-…`: bajo lg la barra queda arriba de los resultados; en lg el componente es `lg:hidden` y no ocupa celda porque `display:none`). Importar `FiltrosMovil`. El `volverAlListado` ya usa `-96`; con la barra pegajosa de ~7.5rem bajo el header, cambiar a `- 96` sigue bien (la barra tapa como mucho el contador).

- [ ] **Step 7: test + gate**; esperado todo OK en 390 y 768 (`node qa-biblioteca.mjs http://localhost:3000 768x1024`).

- [ ] **Step 8: commits propuestos**
1. `refactor(biblioteca): la fila del catálogo pasa a su propio archivo` (solo extracción + clases `max-md:`; si se prefiere, un único commit con el siguiente).
2. `design(biblioteca): en celular y tablet los filtros van en una barra y una hoja inferior`

---

### Task 3: destacados como baraja deslizable

**Files:**
- Create: `apps/sitio/src/features/biblioteca/components/destacados/BarajaMovil.tsx`
- Modify: `apps/sitio/src/features/biblioteca/components/destacados/IntroDestacados.tsx:47` (fila de portadas → `max-lg:hidden`)
- Modify: `apps/sitio/src/features/biblioteca/components/DestacadosBiblioteca.tsx:88` (banda azul → `max-lg:hidden`; montar `BarajaMovil`)
- Test: agregar a `qa-biblioteca.mjs`

- [ ] **Step 1: test** — antes de `await browser.close()`:

```js
// destacados: baraja
await page.goto(base + "/biblioteca#destacados", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const baraja = page.locator("[data-baraja]");
ok(await baraja.isVisible(), "baraja móvil visible");
ok((await page.locator("[data-viajera]").evaluateAll((els) => els.filter((e) => e.offsetParent).length)) === 0, "la fila de portadas de escritorio está oculta");
const covers = baraja.locator("[data-baraja-cover]");
ok((await covers.count()) === 4, "4 portadas en la baraja");
await covers.nth(2).evaluate((el) => el.scrollIntoView({ inline: "center", behavior: "instant", block: "nearest" }));
await page.waitForTimeout(900);
ok((await baraja.locator("[data-baraja-punto][aria-current='true']").getAttribute("data-i")) === "2", "el tercer punto queda activo");
const t3 = await baraja.locator("[data-baraja-art][data-activo]").locator("h3").innerText();
ok(t3.length > 0 && (await baraja.locator("[data-baraja-art][data-activo]").getAttribute("data-i")) === "2", `texto del tercer artículo activo («${t3.slice(0, 30)}…»)`);
ok((await baraja.locator("[data-baraja-art]").count()) === 4, "los 4 artículos están en el DOM");
```

- [ ] **Step 2: `BarajaMovil.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { accionDe, type ItemDestacado } from "@/features/biblioteca/data/materiales";

/**
 * «Material destacado» bajo `lg`: en escritorio las cuatro portadas se pinean,
 * convergen en una pila y cada divisoria barre la de arriba. Acá el gesto es
 * la BARAJA: las portadas van en un riel con snap (una por vez, asomando la
 * siguiente) y el texto del artículo activo se cruza en fundido debajo; los
 * puntitos son el índice. Los cuatro artículos están en el DOM (grilla de una
 * celda: el activo opaco, los otros invisibles), así nada se pierde. Solo
 * opacity y el scroll nativo.
 */
export function BarajaMovil({ items }: { items: ReadonlyArray<ItemDestacado> }) {
  const rielRef = useRef<HTMLDivElement | null>(null);
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const riel = rielRef.current;
    if (!riel) return;
    const covers = Array.from(riel.querySelectorAll<HTMLElement>("[data-baraja-cover]"));
    const io = new IntersectionObserver(
      (entradas) => {
        const mejor = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mejor) setActivo(covers.indexOf(mejor.target as HTMLElement));
      },
      { root: riel, threshold: [0.55, 0.75] },
    );
    covers.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const ir = (i: number) => rielRef.current?.querySelectorAll<HTMLElement>("[data-baraja-cover]")[i]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

  return (
    <div data-baraja className="bg-azul-principal relative lg:hidden">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
      <div className="relative z-10 mx-auto max-w-screen-xl pt-10 pb-14 md:px-10">
        {/* Riel de portadas: 72vw en celular, 38vw en tablet; el resto asoma. */}
        <div ref={rielRef} className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:px-0">
          {items.map(({ titulo, material }, i) => (
            <button
              key={titulo}
              type="button"
              data-baraja-cover
              aria-label={`Ver ${titulo}`}
              onClick={() => ir(i)}
              className="bg-azul-claro/30 relative aspect-[3/4] w-[72vw] shrink-0 snap-center overflow-hidden rounded-xl md:w-[38vw]"
            >
              <Image src={material.portada} alt="" fill sizes="(min-width: 768px) 38vw, 72vw" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-1" role="tablist" aria-label="Destacados">
          {items.map(({ rotulo }, i) => (
            <button
              key={rotulo}
              type="button"
              role="tab"
              data-baraja-punto
              data-i={i}
              aria-current={activo === i}
              aria-label={rotulo}
              onClick={() => ir(i)}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span className={`block h-1.5 rounded-full transition-[transform,background-color] duration-300 ${activo === i ? "bg-white w-6" : "bg-white/40 w-1.5"}`} />
            </button>
          ))}
        </div>

        {/* Los cuatro artículos en la misma celda: el activo opaco, los otros invisibles. */}
        <div className="mt-6 grid px-5 md:px-0">
          {items.map(({ titulo, tagline, detalle, material }, i) => (
            <article
              key={titulo}
              data-baraja-art
              data-i={i}
              data-activo={activo === i ? "" : undefined}
              aria-hidden={activo !== i}
              className={`col-start-1 row-start-1 transition-opacity duration-500 ${activo === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <h3 className="font-display font-extrabold tracking-[-0.02em] break-words hyphens-auto text-white" lang="es" style={{ fontSize: "clamp(1.6rem, 1rem + 2.4vw, 2.4rem)", lineHeight: 1.08 }}>
                {titulo}
              </h3>
              <p className="text-verde-concepto mt-2 font-sans text-[1rem] font-semibold">{tagline}</p>
              <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-white/80">{material.descripcion}</p>
              <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-white/80">{detalle}</p>
              <p className="mt-4 font-mono text-[0.7rem] tracking-[0.08em] text-white/45 uppercase">
                {material.autores} · {material.fecha} · {material.paginas ? `${material.paginas} páginas` : material.formato}
              </p>
              <a href={material.url} target="_blank" rel="noopener noreferrer" className="bg-naranja-accion mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-5 font-sans text-[0.92rem] font-medium text-white">
                {accionDe(material)}
                <ArrowUpRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: montaje.** `IntroDestacados.tsx` línea 47 (div `ref={refRow}`): agregar `max-lg:hidden`. `DestacadosBiblioteca.tsx` línea 88 (`<div className="bg-azul-principal relative">`): agregar `max-lg:hidden`; justo antes de ese div insertar `<BarajaMovil items={ITEMS_DESTACADOS} />` e importarlo. El `IndiceDestacados` ya es `hidden lg:block`.

- [ ] **Step 4: test + gate.** Esperado: todo OK en 390 y 768. Verificar a ojo con `qa-base` 390 que la baraja se ve (captura en `qa-02/destacados`).

- [ ] **Step 5: commit propuesto:** `design(biblioteca): en celular y tablet los destacados son una baraja deslizable`

---

### Task 4: puente como pila con lomos

**Files:**
- Create: `apps/sitio/src/features/biblioteca/components/puente/pila-movil.ts`
- Modify: `apps/sitio/src/features/biblioteca/components/PuenteInvestigacion.tsx` (modo `movil`; atributos `data-puente-*`; clases `max-lg:`)
- Test: agregar a `qa-biblioteca.mjs`

**Interfaces:** `crearPilaPuente(root: HTMLElement): () => void` — busca `[data-puente-pista]`, `[data-puente-escena]`, `[data-puente-pila]`, `[data-puente-card]`, `[data-puente-lomo]` y `[data-puente-cuerpo]`; exporta `ALTO_PILA_LVH`.

- [ ] **Step 1: test** — antes de `await browser.close()`:

```js
// puente: pila con lomos
for (const [vw, vh, esperaPila] of [[390, 844, true], [375, 667, true], [320, 568, false]]) {
  const c2 = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: true, hasTouch: true });
  const p2 = await c2.newPage();
  await p2.goto(base + "/biblioteca#puente-investigacion", { waitUntil: "networkidle" });
  await p2.waitForTimeout(1500);
  const modo = await p2.locator("#puente-investigacion").getAttribute("data-modo");
  ok(modo === (esperaPila ? "movil" : "quieto"), `${vw}x${vh}: modo ${modo}`);
  if (esperaPila) {
    const pista = p2.locator("[data-puente-pista]");
    const top = await pista.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const alto = await pista.evaluate((el) => el.getBoundingClientRect().height);
    await p2.evaluate((y) => window.scrollTo(0, y + 0.75 * innerHeight), top);
    await p2.waitForTimeout(1400);
    const ys = await p2.locator("[data-puente-card]").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    ok(ys[1] > ys[0] && ys[1] < innerHeight, `${vw}: la segunda tarjeta subió sobre la primera (${ys.join(",")})`);
    await p2.evaluate((y) => window.scrollTo(0, y), top + alto - vh);
    await p2.waitForTimeout(1400);
    const corte = await p2.locator("[data-puente-card]").last().evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight + 1);
    ok(corte, `${vw}: la última tarjeta no se corta abajo`);
  }
  await c2.close();
}
```

- [ ] **Step 2: `puente/pila-movil.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LVH_POR_PASO = 62;
const LVH_RESPIRO = 40;
/** Alto de la pista: una pantalla + un paso por tarjeta que llega + respiro. */
export const ALTO_PILA_LVH = 100 + 3 * LVH_POR_PASO + LVH_RESPIRO;

/**
 * El puente a Investigación bajo `lg`: la PILA, el mismo gesto que Cómo
 * trabajamos en celular (y que la pila de lomos de escritorio, en vertical).
 * Cada panel sube desde abajo y tapa al anterior; del tapado queda el lomo
 * (número y tipo de recurso) arriba. Si un panel no entra en lo que queda de
 * pantalla, su interior se escala (encajar): nada se corta. Solo transform y
 * opacity, en una línea atada al scroll de la pista.
 */
export function crearPilaPuente(root: HTMLElement) {
  const pista = root.querySelector<HTMLElement>("[data-puente-pista]");
  const escena = root.querySelector<HTMLElement>("[data-puente-escena]");
  const pila = root.querySelector<HTMLElement>("[data-puente-pila]");
  const cartas = gsap.utils.toArray<HTMLElement>("[data-puente-card]", root);
  const lomoDe = cartas[0]?.querySelector<HTMLElement>("[data-puente-lomo]");
  if (!pista || !escena || !pila || !lomoDe || cartas.length < 2) return () => {};

  const ctx = gsap.context(() => {
    const lomo = () => lomoDe.offsetHeight;
    // Con k tapadas, la carta activa arranca a k lomos del tope: su interior
    // tiene que entrar en lo que queda.
    const encajar = () => {
      cartas.forEach((c, k) => {
        const cuerpo = c.querySelector<HTMLElement>("[data-puente-cuerpo]");
        if (!cuerpo) return;
        gsap.set(cuerpo, { scale: 1 });
        const disponible = pila.clientHeight - k * lomo();
        gsap.set(cuerpo, { scale: Math.min(1, disponible / cuerpo.offsetHeight), transformOrigin: "50% 0%" });
      });
    };
    encajar();
    ScrollTrigger.addEventListener("refreshInit", encajar);

    gsap.set(cartas, { willChange: "transform" });
    gsap.set(cartas.slice(1), { y: () => escena.clientHeight });

    const total = cartas.length;
    const tramo = 1 / total;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: tramo * 0.6 },
      scrollTrigger: { trigger: pista, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
    });
    for (let k = 1; k < total; k++) {
      // La carta k descansa a k lomos del tope: los lomos de las tapadas quedan a la vista.
      tl.to(cartas[k], { y: () => k * lomo() }, (k - 1) * tramo + tramo * 0.4);
      for (let j = 0; j < k; j++) {
        tl.to(cartas[j].querySelector("[data-puente-cuerpo]") as HTMLElement, { autoAlpha: 0.35, duration: tramo * 0.3 }, (k - 1) * tramo + tramo * 0.5);
      }
    }
    tl.set({}, {}, 1);

    gsap.fromTo(
      pila,
      { y: 0, scale: 1, autoAlpha: 1 },
      { y: -56, scale: 0.97, autoAlpha: 0, ease: "power2.in", scrollTrigger: { trigger: pista, start: "bottom bottom", end: "bottom 45%", scrub: 1 } },
    );
  }, root);

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", () => {});
    ctx.revert();
  };
}
```
Corrección obligatoria al transcribir: guardar `encajar` en una constante fuera del `ctx` para poder hacer `ScrollTrigger.removeEventListener("refreshInit", encajar)` en la limpieza (el `() => {}` de arriba no quita nada).

- [ ] **Step 3: `PuenteInvestigacion.tsx`**

Reemplazar el estado `live` por un modo completo, sin tocar la rama viva:
```tsx
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");
  useIsomorphicLayoutEffect(() => {
    if (reduced) setModo("quieto");
    else if (window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) setModo("vivo");
    else if (window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) setModo("movil");
    else setModo("quieto");
  }, [reduced]);
  const live = modo === "vivo";
  const movil = modo === "movil";
```
(el comentario existente sobre 1024 se conserva). El efecto de GSAP de escritorio sigue dependiendo de `[live]` sin cambios. Agregar un segundo efecto:
```tsx
  useIsomorphicLayoutEffect(() => {
    if (!movil) return;
    const root = rootRef.current;
    if (!root) return;
    return crearPilaPuente(root);
  }, [movil]);
```
con `const rootRef = useRef<HTMLElement | null>(null)` en la `<section>` (`ref={rootRef}`, `data-modo={modo}`).
Markup (solo agregados): `zoneRef` div → `data-puente-pista`, className `live ? "h-[430svh]" : movil ? "" : ""` pasa a usar `style={movil ? { height: \`${ALTO_PILA_LVH}lvh\` } : undefined}` conservando el `className={live ? "h-[430svh]" : ""}`. `stageRef` div → `data-puente-escena`, className: `live ? "sticky … h-[100svh] …" : movil ? "sticky top-0 isolate flex h-lvh flex-col overflow-x-clip" : ""`. El div del encabezado: agregar `max-lg:pt-[5.25rem] max-lg:pb-5` (solo `max-lg:`). El contenedor de la pila (`mx-auto w-full …`): en movil agregar `min-h-0 flex-1 pb-4` (mismo string que live salvo el `pb-[3.5svh]`). `pilaRef` → `data-puente-pila`, className `live ? "relative h-full" : movil ? "relative h-full" : "flex flex-col gap-5"`. Cada `<article>` → `data-puente-card`, className en movil: `"absolute inset-x-0 top-0 rounded-2xl"` (mismo `overflow-hidden shadow…`), y en movil un lomo horizontal ANTES del cuerpo:
```tsx
                  {movil && (
                    <div aria-hidden="true" data-puente-lomo className={"flex h-12 items-center gap-3 px-5 " + c.tema.spine}>
                      <span className="font-mono text-[0.65rem] tracking-[0.14em]">{`0${i + 1}`}</span>
                      <span className="font-display text-[1rem] font-bold tracking-[-0.01em]">{c.tipo}</span>
                    </div>
                  )}
```
El `data-pila-body` div → además `data-puente-cuerpo`; en movil su className: `"grid gap-4 p-5 pt-0 md:grid-cols-[1fr_1.05fr] md:gap-8 md:p-8 md:pt-0"`, y la `<figure>` → agregar `max-md:aspect-[5/2] max-md:max-h-[28lvh]`. La descripción y la línea: `max-md:text-[0.92rem]`, `max-md:mt-3`.
NO cambiar ninguna clase de las ramas `live` ni estática existentes: solo agregar la rama `movil` en los ternarios y clases `max-md:`/`max-lg:`.

- [ ] **Step 4: test + gate.** Esperado: 390/375 en modo `movil` con segunda tarjeta encima y última sin corte; 320×568 `quieto`. Si `PuenteInvestigacion.tsx` supera las 420 líneas, extraer el `<article>` a `puente/PanelPuente.tsx` (mismo JSX) en un commit de refactor previo.

- [ ] **Step 5: commit propuesto:** `design(biblioteca): en celular y tablet el puente a Investigación se apila con lomos`

---

### Task 5: cierre

**Files:** `apps/sitio/src/features/biblioteca/components/CierreBiblioteca.tsx:113,120`

- [ ] Bola (`data-cierre-bola`): agregar `max-md:-bottom-24 max-md:-left-20 max-md:h-[14rem] max-md:w-[14rem]`. Contenedor `min-h-[58svh] … py-24`: agregar `max-md:min-h-[48lvh] max-md:py-16`. Gate. Commit propuesto: `design(biblioteca): cierre más compacto en celular`.

---

### Task 6: no regresión y QA final de la fase

- [ ] `pnpm build` (con el dev server parado) + `pnpm start` (preview `prod`); `qa-biblioteca.mjs` en 390 y 768 contra prod; `qa-base` de `/biblioteca` en 320/390/768/1024 táctil (revisar hojas de contacto) y `REDUCIDO=1` en 390 (todo quieto: modo `quieto`, sin baraja animada más allá del scroll nativo, hoja sin deslizamiento).
- [ ] Comparación de escritorio: `qa-base` de `/biblioteca,/,/que-hacemos` en 1280/1440/1920 y `comparar.mjs` contra `base/` → `pasosDist = 0`, `geoIgual = true`.
- [ ] Informe con archivos, tests, gate, comparación y los commits propuestos.
