# Contacto en celular y tablet · plan de implementación (fase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que la experiencia de Contacto funcione en celular y tablet con el teclado virtual abierto, con targets táctiles correctos y un selector de país nativo, sin cambiar un píxel ni un frame en computadora (≥ 1024 px).

**Architecture:** bajo `lg` (< 1024 px) la raíz deja de ser una pantalla fija: los paneles inactivos pasan a `display:none` y el activo va en el flujo normal (la página scrollea, el teclado empuja la página y no un panel recortado). Las transiciones GSAP existentes siguen corriendo (son por tiempo); solo el viaje del título fantasma se limita a computadora porque mide sobre `position: fixed` contra un panel que en celular está oculto. El país usa `<select>` nativo bajo `lg` y el dropdown propio en computadora.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 (`max-lg:` = `@media (width < 64rem)`), GSAP, Lenis (`getLenis()`), hook `useMediaQuery` de `@/lib/hooks/useMediaQuery`.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (CO1, CO2, CO3) y §5–7.

## Global Constraints

- Computadora congelada: **no editar ninguna clase `md:`/`lg:` existente**; solo agregar `max-lg:` / `max-md:`. Ningún archivo fuera de `apps/sitio/src/features/contacto/`.
- Copy inclusivo, sin «alumnos»; naranja solo en el CTA de envío.
- Solo `transform`/`opacity` en animaciones; nada de `will-change` en className.
- Componentes ≤ 200 líneas de código.
- Gate del repo en verde: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` (100/100).
- Archivos con CRLF (el repo es CRLF: el Edit conserva el final de línea existente; un archivo nuevo se normaliza con `sed -i 's/\r*$/\r/'`).
- Commits: Conventional, español, imperativo, un cambio lógico por commit, **solo con OK de Gastón** (el implementador prepara el commit en seco y lo lista; no commitea).

## Review Focus

1. Llegar con `/contacto?tema=investigacion` en 390 px: debe aterrizar en el formulario, en el flujo, con la página arriba (`scrollY === 0`) y sin panel de hero visible. Test en Task 3.
2. Con movimiento reducido en 390 px: hero → apertura de corte, sin ghost, sin errores de consola. Test en Task 3.
3. `Volver a los temas` en 390 px con texto tipeado: la apertura vuelve visible en el flujo y el texto sigue en los campos. Test en Task 3.
4. Computadora 1280/1440/1920: capturas y geometría idénticas a `edqa/restantes/base` en los 4 estados (hero, apertura, formulario, cierre). Test en Task 4.
5. `<select>` de país: su valor viaja en el `FormData` con `name="pais"` y el dropdown propio no se renderiza bajo `lg` (un solo `name="pais"` en el DOM). Test en Task 2.

---

### Task 1: paneles en el flujo bajo `lg` y raíz sin altura fija

**Files:**
- Modify: `apps/sitio/src/features/contacto/components/ContactoExperiencia.tsx:133-144` (raíz y escenario), `:163-168` (panel apertura)
- Modify: `apps/sitio/src/features/contacto/components/experiencia/PanelHero.tsx:19-24`
- Modify: `apps/sitio/src/features/contacto/components/experiencia/PanelFormulario.tsx:21-27`
- Modify: `apps/sitio/src/features/contacto/components/experiencia/PanelCierre.tsx:19-24`
- Modify: `apps/sitio/src/features/contacto/components/experiencia/coreografia-intro.ts:57-64` (ghost solo en computadora)
- Create: `apps/sitio/src/features/contacto/components/experiencia/movil.ts`
- Test: `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-contacto.mjs` (Playwright, fuera del repo)

**Interfaces:**
- Produces: `esMovil(): boolean` en `movil.ts` (true bajo 64rem) y la constante `PANEL_MOVIL` con las clases del panel en flujo; `panelClases(activo)` que devuelve `PANEL_MOVIL` más `max-lg:hidden` cuando `!activo`. Task 2 y 3 dependen de que los paneles usen `panelClases`.

- [ ] **Step 1: escribir el test de comportamiento (falla hoy)**

Crear `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-contacto.mjs`:

```js
// qa-contacto.mjs — flujo de Contacto en celular: hero → tema → formulario → cierre.
// Uso: node qa-contacto.mjs http://localhost:3000 [390x844]
import { chromium } from "playwright";
const [, , base = "http://localhost:3000", vpArg = "390x844"] = process.argv;
const [w, h] = vpArg.split("x").map(Number);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errores = [];
page.on("pageerror", (e) => errores.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
const ok = (cond, msg) => { console.log(`${cond ? "OK " : "FALLA"} ${msg}`); if (!cond) process.exitCode = 1; };

await page.goto(base + "/contacto", { waitUntil: "networkidle" });
await page.waitForTimeout(3200); // la intro se desarma sola (~1.2 s + desarme)
const root = page.locator('section[aria-label="Contacto"]');
ok((await root.evaluate((el) => getComputedStyle(el).overflowY)) !== "hidden", "la raíz no recorta el scroll bajo lg");
ok(await page.locator('[data-panel="apertura"]').isVisible(), "apertura visible tras la intro");
ok(!(await page.locator('[data-panel="hero"]').isVisible()), "hero oculto (display none) tras la intro");

await page.locator("[data-tema-card]").nth(1).tap();
await page.waitForTimeout(1300);
ok(await page.locator('[data-panel="formulario"]').isVisible(), "formulario visible");
ok(!(await page.locator('[data-panel="apertura"]').isVisible()), "apertura oculta durante el formulario");
ok((await page.evaluate(() => window.scrollY)) === 0, "la página arranca arriba al entrar al formulario");
// el botón de envío se alcanza scrolleando la PÁGINA (no un panel interno)
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(600);
const btn = page.locator('button[type="submit"]');
const r = await btn.boundingBox();
ok(r !== null && r.y + r.height <= h && r.y >= 0, "el botón Enviar queda dentro del viewport tras scrollear la página");
ok((await page.evaluate(() => window.scrollY)) > 0 || (await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)), "el scroll es de la página");
// país nativo bajo lg y un solo campo pais
ok((await page.locator('select[name="pais"]').count()) === 1, "select nativo de país");
ok((await page.locator('[name="pais"]').count()) === 1, "un solo campo pais en el DOM");
await page.locator('select[name="pais"]').selectOption({ index: 1 });
// targets ≥ 44 px en el canal directo
const chips = await page.locator('[data-panel="formulario"] button, [data-panel="formulario"] a').evaluateAll((els) => els.filter((e) => e.offsetParent).map((e) => Math.round(e.getBoundingClientRect().height)));
ok(chips.every((hh) => hh >= 44), `targets del formulario ≥ 44 px (${chips.join(",")})`);

await page.fill("#ct-nombre", "Prueba QA");
await page.fill("#ct-email", "qa@ejemplo.org");
await page.fill("#ct-mensaje", "Mensaje de prueba");
await page.locator('[data-panel="formulario"] button:has-text("Volver a los temas")').tap();
await page.waitForTimeout(900);
ok(await page.locator('[data-panel="apertura"]').isVisible(), "volver a los temas muestra la apertura");
await page.locator("[data-tema-card]").nth(1).tap();
await page.waitForTimeout(1300);
ok((await page.inputValue("#ct-nombre")) === "Prueba QA", "lo tipeado se conserva al cambiar de tema");
ok(errores.length === 0, `sin errores de consola (${errores.join(" | ")})`);
await browser.close();
```

- [ ] **Step 2: correrlo contra el server de producción actual y ver que falla**

Run (Git Bash, con el server `prod` corriendo en :3000):
```bash
cd /c/Users/gasto/AppData/Local/Temp/edqa/restantes/pw && node qa-contacto.mjs http://localhost:3000 390x844
```
Expected: `FALLA la raíz no recorta el scroll bajo lg` (hoy `overflow-y: hidden`), `FALLA select nativo de país`, y probablemente `FALLA la página arranca arriba`.

- [ ] **Step 3: crear `movil.ts`**

```ts
/**
 * Contacto bajo `lg` (< 64rem): la experiencia deja de ser UNA pantalla fija.
 * En computadora los cuatro estados viven apilados en absoluto dentro de una
 * raíz de 100svh y morfean entre sí; en celular y tablet eso no sobrevive al
 * teclado virtual (svh no se recalcula y el panel de campos queda recortado).
 * Acá cada panel va en el flujo: el activo ocupa la página, los otros no se
 * renderizan (`display: none`), y el scroll es el de la página. Las clases
 * llevan `max-lg:` para que computadora quede exactamente igual.
 */
export const PANEL_MOVIL =
  "max-lg:relative max-lg:inset-auto max-lg:min-h-[100lvh] max-lg:overflow-visible";

/** Clases del panel según esté activo: en celular el inactivo no ocupa lugar. */
export function panelClases(activo: boolean) {
  return activo ? PANEL_MOVIL : `${PANEL_MOVIL} max-lg:hidden`;
}

/** ¿Estamos bajo `lg`? Solo en el cliente; en SSR devuelve false. */
export function esMovil() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 63.999rem)").matches;
}
```

- [ ] **Step 4: raíz y paneles**

En `ContactoExperiencia.tsx`, la `<section>` raíz (línea 135): agregar al final de `className`:
`max-lg:h-auto max-lg:min-h-[100lvh] max-lg:overflow-x-clip max-lg:overflow-y-visible`

El escenario (línea 144, `relative z-10 mx-auto h-full …`): agregar `max-lg:h-auto`.

El panel apertura (línea 163-168): importar `panelClases` y cambiar el `className` a:
```tsx
className={`absolute inset-x-5 top-0 bottom-0 flex overflow-x-hidden overflow-y-auto pt-24 pb-8 opacity-0 md:inset-x-10 md:pt-28 md:pb-28 [@media(max-height:860px)_and_(min-height:761px)]:md:pt-24 [@media(max-height:860px)_and_(min-height:761px)]:md:pb-8 [@media(max-height:760px)]:md:pt-[5.5rem] [@media(max-height:760px)]:md:pb-6 ${panelClases(vista === "apertura")} max-lg:pb-12`}
```
Agregar también, después del `useSaltoIntro`, el vuelto al tope de página al cambiar de vista en celular (Lenis o nativo):
```tsx
  // En celular los paneles van en el flujo: cada estado arranca con la página
  // arriba (si no, el formulario aparecía a la altura a la que se había
  // scrolleado la apertura).
  useEffect(() => {
    if (!esMovil()) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [vista]);
```
con `import { getLenis } from "@/lib/lenis";` y `import { esMovil, panelClases } from "./experiencia/movil";`.

`PanelHero.tsx`: `className={`absolute inset-x-5 top-0 bottom-0 md:inset-x-10 ${panelClases(activo)}`}` (importar `panelClases` desde `./movil`).

`PanelFormulario.tsx`: `className={`absolute inset-x-5 top-0 bottom-0 flex overflow-y-auto pt-24 pb-24 opacity-0 md:inset-x-10 md:pt-28 md:pb-28 [@media(max-height:860px)_and_(min-height:761px)]:md:pb-10 [@media(max-height:760px)]:md:pb-6 ${panelClases(activo)} max-lg:pb-12`}`.

`PanelCierre.tsx`: `className={`absolute inset-x-5 top-0 bottom-0 flex flex-col items-center justify-center text-center opacity-0 md:inset-x-10 ${panelClases(activo)} max-lg:px-2 max-lg:py-24`}`.

- [ ] **Step 5: el ghost solo en computadora**

En `coreografia-intro.ts`, dentro de `desarmar`, la condición `if (srcTit && dstTit && h2)` pasa a `if (srcTit && dstTit && h2 && !esMovil())` (importar `esMovil` desde `./movil`) y el comentario del `else` se amplía: «sin medida (titular no montado) o en celular (el panel destino está en display:none y mide 0): corte simple, sin viaje».

- [ ] **Step 6: correr el test y el gate**

```bash
cd "<raíz del repo>" && pnpm build && (preview `prod` reiniciado) && cd /c/Users/gasto/AppData/Local/Temp/edqa/restantes/pw && node qa-contacto.mjs http://localhost:3000 390x844
```
Expected: todo `OK` salvo `select nativo` (Task 2). Gate: `pnpm typecheck && pnpm lint && npx -y react-doctor --no-supply-chain --project apps/sitio/src` en verde (archivos nuevos: `git add -N` antes de react-doctor).

- [ ] **Step 7: commit en seco (listar, no ejecutar)**

`design(contacto): en celular y tablet los estados van en el flujo de la página`

---

### Task 2: país con `<select>` nativo bajo `lg` y targets táctiles

**Files:**
- Create: `apps/sitio/src/features/contacto/components/experiencia/PaisCampo.tsx`
- Modify: `apps/sitio/src/features/contacto/components/experiencia/CamposContacto.tsx:38-39`
- Modify: `apps/sitio/src/features/contacto/components/CanalDirecto.tsx:49-50` (chip)
- Modify: `apps/sitio/src/features/contacto/components/experiencia/PanelFormulario.tsx:35-47` (botón volver)

**Interfaces:**
- Consumes: `INPUT_BASE` de `./estilos`, `useMediaQuery` de `@/lib/hooks/useMediaQuery` (firma `useMediaQuery(query: string): boolean`), `PaisDropdown` de `../PaisDropdown`.
- Produces: `<PaisCampo id name options />` con las mismas props que `PaisDropdown`.

- [ ] **Step 1: crear `PaisCampo.tsx`**

```tsx
"use client";

import { ChevronDown } from "@/components/ui/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { PaisDropdown } from "../PaisDropdown";
import { INPUT_BASE } from "./estilos";

type Props = { id: string; name: string; options: readonly string[]; placeholder?: string };

/**
 * País: en computadora el dropdown propio (misma caja que los otros campos,
 * teclado completo); bajo `lg` el `<select>` nativo, que abre el picker del
 * sistema (la rueda de iOS, la hoja de Android): no se corta contra el borde
 * de la pantalla ni pelea con el teclado, y es lo que la mano espera. Un
 * solo `name="pais"` en el DOM en cada caso, así el FormData no se duplica.
 */
export function PaisCampo({ id, name, options, placeholder = "Elegir…" }: Props) {
  const movil = useMediaQuery("(max-width: 63.999rem)");
  if (!movil) return <PaisDropdown id={id} name={name} options={options} placeholder={placeholder} />;
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue="" className={`${INPUT_BASE} appearance-none pr-10`}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="text-azul-principal/50 pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
      />
    </div>
  );
}
```

- [ ] **Step 2: usarlo en `CamposContacto.tsx`**

Reemplazar `import { PaisDropdown } from "../PaisDropdown";` por `import { PaisCampo } from "./PaisCampo";` y la línea `<PaisDropdown id="ct-pais" … />` por `<PaisCampo id="ct-pais" name="pais" options={[...siteConfig.paises, "Otro"]} />`. El comentario de arriba pasa a: «Dropdown propio en computadora, `<select>` nativo bajo lg (PaisCampo)».

- [ ] **Step 3: targets**

`CanalDirecto.tsx`, constante `chip`: agregar `max-lg:min-h-11 max-lg:px-4`.
`PanelFormulario.tsx`, botón «Volver a los temas»: agregar `max-lg:min-h-11 max-lg:py-2`.
`IndiceTemas.tsx` no cambia (las filas ya miden ≥ 60 px).

- [ ] **Step 4: test + gate**

Mismo comando de Task 1 Step 6. Expected: todos `OK`. Verificar además en el server que `useMediaQuery` devuelve false en SSR sin warning de hidratación (no hay: el cambio de rama ocurre en un efecto).

- [ ] **Step 5: commit en seco**

`design(contacto): país con selector nativo y targets táctiles bajo lg`

---

### Task 3: escenarios de borde (URL con tema, movimiento reducido, tablet)

**Files:**
- Modify: `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-contacto.mjs` (agregar escenarios)

- [ ] **Step 1: agregar al final del test, antes de `browser.close()`**

```js
// ?tema= aterriza en el formulario, arriba
const p2 = await ctx.newPage();
await p2.goto(base + "/contacto?tema=investigacion", { waitUntil: "networkidle" });
await p2.waitForTimeout(800);
ok(await p2.locator('[data-panel="formulario"]').isVisible(), "?tema= aterriza en el formulario");
ok(!(await p2.locator('[data-panel="hero"]').isVisible()), "?tema=: hero oculto");
ok((await p2.evaluate(() => window.scrollY)) === 0, "?tema=: página arriba");
await p2.close();
// movimiento reducido: corte directo, sin ghost
const ctxR = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
const p3 = await ctxR.newPage();
const errR = [];
p3.on("pageerror", (e) => errR.push(e.message));
await p3.goto(base + "/contacto", { waitUntil: "networkidle" });
await p3.waitForTimeout(600);
ok(await p3.locator('[data-panel="apertura"]').isVisible(), "reduced: apertura directa");
ok((await p3.evaluate(() => document.body.querySelectorAll("body > div[aria-hidden]").length)) === 0, "reduced: sin ghost en body");
ok(errR.length === 0, "reduced: sin errores");
await ctxR.close();
```

- [ ] **Step 2: correr en 390×844, 320×568 y 768×1024**

```bash
cd /c/Users/gasto/AppData/Local/Temp/edqa/restantes/pw && node qa-contacto.mjs http://localhost:3000 390x844 && node qa-contacto.mjs http://localhost:3000 320x568 && node qa-contacto.mjs http://localhost:3000 768x1024
```
Expected: todo `OK` en los tres.

---

### Task 4: no regresión en computadora y en las protegidas

**Files:** ninguno del repo (solo el harness).

- [ ] **Step 1: recapturar `/contacto` en computadora y comparar**

```bash
cd /c/Users/gasto/AppData/Local/Temp/edqa/restantes/pw && for v in 1280x800 1440x900 1920x1080; do MSYS_NO_PATHCONV=1 node qa-base.mjs http://localhost:3000 "C:/Users/gasto/AppData/Local/Temp/edqa/restantes/despues-01/desktop-${v%x*}" "/contacto" "$v" 80; done && for d in 1280 1440 1920; do node comparar.mjs "C:/Users/gasto/AppData/Local/Temp/edqa/restantes/base/desktop-$d" "C:/Users/gasto/AppData/Local/Temp/edqa/restantes/despues-01/desktop-$d"; done
```
Expected: `pasosDist = 0`, `geoIgual = true` para `contacto` en los tres anchos (los otros directorios de `base` aparecen como «falta en después», es esperado).

- [ ] **Step 2: estados de computadora**

Con Playwright a 1440×900 sin táctil: entrar, esperar 3,2 s, elegir el tema 2, capturar; enviar; capturar. Comparar a ojo con `base/desktop-1440/1440x900/contacto/p00.png` y confirmar `getComputedStyle(root).overflowY === "hidden"` y `height === 900` en computadora (la raíz sigue fija).

- [ ] **Step 3: protegidas**

No se tocó nada compartido; igual: `qa-base` de `/` y `/que-hacemos` en 390x844t y 1440x900 a `despues-01/` y `comparar` contra `base/` → `pasosDist = 0`.

- [ ] **Step 4: informe**

Listar: archivos tocados (todos bajo `features/contacto`), resultado de los tests, gate, comparación; los dos commits en seco para el OK de Gastón.
