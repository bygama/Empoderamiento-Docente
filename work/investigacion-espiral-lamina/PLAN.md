# PLAN — investigacion-espiral-lamina

Tier M · rama `feat/investigacion-espiral-lamina` · checkout actual · SPEC aprobado el 2026-09-07.
Cada paso es un commit (Conventional, español, imperativo, ver `docs/COMMITS.md`).
El cierre (typecheck + lint + build + DoD §6 del SPEC + review) lo corre work-verify
una sola vez después del último paso; no es un paso de este plan.

## Restricciones (aplican a todos los pasos)

- Solo `transform`, `opacity`, `strokeDashoffset` y `attr r` se animan. Nada de layout.
- Colores por token (`var(--color-*)` / utilidades Tailwind). Cero hex en `src/`.
- Ningún archivo tocado o creado en `src/` supera las 200 líneas.
- La versión estática (touch / reduced-motion) no cambia de render: su `innerHTML`
  en `#ciclo` a 390×844 es idéntico al baseline del paso 0.
- Copy literal: nombres, textos, `destacado`, nota de bisagra y remate no se
  tocan.
- Comentarios en español, con el porqué. Sin `any`.
- Dev server siempre en una terminal propia de Orca, nunca como shell de fondo
  de la sesión. Navegador: el embebido de Orca (`orca goto` / `orca eval` /
  `orca screenshot`), con las mañas de la memoria `orca-browser-verification-quirks`.

## Pasos

0. **Baseline y entorno** (sin commit; evidencia en PROGRESS). Levantar `pnpm dev`
   en una terminal de Orca. En el navegador de Orca, a 390×844, ir a
   `/investigacion#ciclo` y guardar en el scratchpad (a) captura PNG y (b) el
   `innerHTML` de `#ciclo` como `baseline-ciclo-touch.html`. A 1536×850 guardar
   una captura del estado actual de la hoja 03 al fin de la vuelta 1, como
   referencia visual del "antes". Registrar `node -v`.
   Aceptación: los tres archivos existen en el scratchpad y `orca status --json`
   reporta el navegador listo → exit 0. *(mechanical · low)*

1. **Geometría de la cámara y las anotaciones** en `espiral.ts`, matemática pura
   sin DOM. Exporta: `type Encuadre = { cx; cy; alto }` (unidades del viewBox),
   `ENCUADRE_INTERIOR` (centro del bbox de los nodos 0-3, `alto` inicial 300),
   `ENCUADRE_GENERAL` (viewBox completo), `transformDeEncuadre(e): { x; y; scale }`
   para un `<g>` con origen `0 0`, `type Lado = "arriba" | "derecha" | "abajo" |
   "izquierda" | "arriba-derecha"`, `ANOTACIONES: ReadonlyArray<{ nodo; lado;
   encuadre }>` con nueve entradas (nodos 0-7 por cuadrante `k % 4`, y el remate
   = nodo 0 en `ENCUADRE_GENERAL` con lado `arriba-derecha`),
   `guiaAnotacion(i): { x1; y1; x2; y2 }` (borde del nodo → ancla, unidades del
   viewBox, más allá del rótulo) y `posicionAnotacion(i): { left; top }` (el ancla
   proyectada por el encuadre de la entrada, en % del cuadro del SVG).
   Aceptación: `pnpm typecheck` → exit 0, y un probe en el scratchpad
   (`node --experimental-strip-types probe-espiral.mjs`, o `tsx` si el Node local
   no soporta strip-types) imprime las nueve posiciones y sale 0 solo si todas
   caen en [−35, 135] % (las anotaciones laterales pueden desbordar el cuadro,
   no la hoja) y los nueve `lado` son los esperados. *(judgment · high)*

2. **Extraer sin cambiar el render**: `EspiralSvg` a `EspiralSvg.tsx` y la
   versión estática (grid de dos columnas con las dos listas) a
   `EspiralEstatica.tsx`; `EspiralInvestigacion.tsx` los compone. Commit
   `refactor(investigacion): …`.
   Aceptación: `pnpm typecheck && pnpm lint` → exit 0; `wc -l` de los tres
   archivos ≤ 200; a 390×844 el `innerHTML` de `#ciclo` es idéntico byte a byte
   a `baseline-ciclo-touch.html` (comparar con `cmp` en el scratchpad → exit 0).
   *(mechanical · low)*

3. **Grupo de cámara y guías en el SVG** (`EspiralSvg.tsx`): envolver espiral,
   lazo, nodos, rótulos y personaje en `<g data-espiral-camara>` (identidad en
   SSR, que es el encuadre general) y agregar nueve `<line data-espiral-guia
   data-indice={i}>` con las coordenadas de `guiaAnotacion(i)`, trazo
   `var(--color-azul-medio)`, `strokeOpacity` 0.55, ocultas por defecto en
   live (la coreografía las dibuja) y ausentes del render estático. Commit
   `feat(investigacion): …`.
   Aceptación: `pnpm typecheck && pnpm lint` → exit 0; en el navegador a
   1536×850, `document.querySelectorAll("[data-espiral-guia]").length === 9` y
   `[data-espiral-camara]` existe; a 390×844 `[data-espiral-guia]` = 0 y el
   `innerHTML` de `#ciclo` sigue idéntico al baseline. *(mechanical · low)*

4. **Layout live nuevo + coreografía nueva**, un solo cambio coherente porque
   comparten el contrato DOM. En `EspiralInvestigacion.tsx` (o un
   `EspiralLamina.tsx` si el tope de 200 líneas lo pide): rincón narrador con
   tres `data-espiral-voz` (título 1, nota, título 2, `absolute` arriba a la
   izquierda, 18ch); contenedor de figura centrado con `aspect-ratio: 400/480`,
   alto en `svh`, `relative` y `overflow-visible`, con `EspiralSvg` adentro;
   nueve bloques `data-espiral-anotacion` con `data-lado`, `absolute`, `left`/
   `top` de `posicionAnotacion(i)` (estilo inline en %), `translate` de anclaje
   por lado, `max-w-[30ch]`, texto a la izquierda, tipografía con `clamp()`
   sobre `svh` y mínimo 0.9rem, sin número. En `coreografia-espiral.ts`:
   `RECORRIDO_ESPIRAL = 3000`; timeline de SPEC §3.4 (intro 0.3 · vuelta 1.6
   `ease: none` en tramo y dash · pausa 0.3 · bisagra 1.0 con tween de cámara
   `transformDeEncuadre(INTERIOR → GENERAL)` y relevo título 1 → nota · lectura
   0.5 + relevo 0.2 a título 2 · vuelta 2 1.6 · pausa 0.3 · lazo 0.8 con salida
   de anotaciones 05-08 y latido del 01 · remate 0.6); tramos `{t0,t1,l0,l1}` uno
   por vuelta, bisagra y lazo; eventos por nodo en t proporcional a
   `LONGITUD_NODO`; cada anotación entra con guía (dash 0.15) + `autoAlpha` y
   10-14 px desde el nodo hacia afuera (0.3 `power2.out`), sale con `autoAlpha`
   (0.2 `power1.in`) guía incluida; estado pre-paint con `gsap.set` (cámara en
   `ENCUADRE_INTERIOR`, solo nodo 0, anotación 0 y título 1 visibles);
   `restaurar()` devuelve personaje al nodo 0 y cámara al encuadre general;
   `progresoBisagra` = fin del tramo 04→05; firma `crearEspiral({ zona }) →
   { tl, progresoBisagra, restaurar }` sin cambios. Commit
   `feat(investigacion): …`.
   Aceptación: `pnpm typecheck && pnpm lint` → exit 0; `wc -l` de cada archivo
   tocado ≤ 200; en el navegador a 1536×850 (tras `resize` para Lenis y
   `scrollTo(0,0)`): `[data-espiral-anotacion]` = 9, `[data-espiral-voz]` = 3,
   el `ScrollTrigger` de la hoja tiene `end - start` = 3000 ± 1, y sondeando
   cinco progresos (0, 0.30, 0.47, 0.80, 1.0) con polling hasta estabilidad las
   anotaciones visibles (opacidad > 0.5) son exactamente {0} · {0,1,2,3} ·
   {4 o ninguna} · {4,5,6,7} · {8}; navegar a `/investigacion#evidencia` deja
   `zona.dataset.progreso` a ±0.03 de `progresoBisagra`. *(judgment · high)*

5. **Encaje visual**: ajustar `ENCUADRE_INTERIOR.alto`, los offsets de ancla,
   el ancho de las anotaciones y los `clamp()` hasta que nada se pise. Commit
   `style(investigacion): …` (o `fix` si corrige un solape).
   Aceptación: probe en el scratchpad que, a 1536×850 y a 1920×1080, en los
   cinco progresos del paso 4, comprueba que cada `[data-espiral-anotacion]`
   con opacidad > 0.5 tiene `getBoundingClientRect()` dentro del rectángulo de
   la hoja (`#ciclo > div > div`) y sin intersección con el rectángulo de la voz
   visible ni con el del chrome «Archivo ED · Hoja 03» → `true` en los diez
   casos; capturas PNG de los diez estados guardadas en el scratchpad y
   revisadas con `Read`. *(judgment · medium)*

5b. **Jerarquía y entrada escalonada de las anotaciones** (pedido del owner
   el 2026-09-07 tras ver la escena: «mejorar jerarquías así no está muy
   plano… y si podés meter alguna animación»). Nombre más grande y apretado,
   cuerpo un tono más bajo, una frase `clave` por estación en peso medio con
   subrayado verde (span con scaleX, no text-decoration); entrada: guía →
   bloque → nombre → texto → subrayado, en `anotacion-espiral.ts`. Commit
   `style(investigacion): …`.
   Aceptación: probes de escena (ida, resize, vuelta) y de encaje en los
   tres viewports siguen OK; a p=0.29 los cuatro `[data-anot-subrayado]`
   visibles tienen scaleX 1 y a p=0 solo el de la anotación 0; typecheck,
   lint, ≤ 200 líneas por archivo. *(judgment · medium)*

6. **Registrar la decisión** en `docs/content/arquitectura-investigacion.md` §6:
   una nota fechada 2026-09-07 debajo de la del 04-09 (lámina anotada, cámara de
   dos encuadres, pin de 3000 px, copy íntegro) y actualizar el doc-comment de
   `EspiralInvestigacion` y de `coreografia-espiral.ts` para que describan la
   escena nueva. Commit `docs(investigacion): …`.
   Aceptación: `grep -c "2026-09-07" docs/content/arquitectura-investigacion.md`
   → 1; `grep -c "columna\|relevo" src/features/investigacion/components/coreografia-espiral.ts`
   no menciona los relevos uno por uno como mecanismo vigente (revisión de
   lectura, 0 menciones engañosas). *(mechanical · low)*

## Interfaces entre pasos

- 1 → 3, 4: `ENCUADRE_INTERIOR`, `ENCUADRE_GENERAL`, `transformDeEncuadre`,
  `ANOTACIONES`, `guiaAnotacion`, `posicionAnotacion`, `Lado`.
- 3 → 4: selectores `[data-espiral-camara]`, `[data-espiral-guia][data-indice]`.
- 4 → 5: selectores `[data-espiral-anotacion][data-lado]`, `[data-espiral-voz]`,
  `zona.dataset.progreso`, `RECORRIDO_ESPIRAL`.

## Riesgos

- Dos pasos `high`: el 1 (geometría de la que dependen todos) y el 4 (la escena).
  El cierre pide una lente por cada uno además de la lente de cambio completo.
- El paso 5 puede requerir volver al 1 (cambiar `alto` o offsets): es el mismo
  archivo y va en el commit del paso 5, no reabre el paso 1.
