# DECISIONS — El scrub de las coreografías

- 2026-09-28 — **La lane la pidió Facundo** («dale, agarrá la lane del
  scrub mientras tanto»), como trabajo mientras ED y Mateo resuelven lo
  externo del admin (Resend, DNS, Search Console).
- 2026-09-28 — **El alcance es 22 en 17, no 11 en 8.** Medido sobre
  `bf4b995` con `grep -rnE "scrub:[[:space:]]*true"` menos la línea de
  comentario de `timeline-fases.ts`. El número del `PROGRESS` del mapa del
  admin quedó viejo; se corrige acá y no allá, para no tocar una lane
  cerrada.
- 2026-09-28 — **Antes de elegir valores se leyó el fuente de
  ScrollTrigger** (`gsap@3.15.0`), y desmintió una suposición: en un
  trigger sin animación `scrub` **no es un no-op** —es lo que hace que
  `onUpdate` corra en cada tick (`:1144`)— pero **tampoco suaviza** (el
  `scrubTween` solo nace dentro de `if (animation)`, `:662-668`). Sacarlo
  habría roto el MathField del hero y el barrido de Quiénes somos;
  cambiarle el número no cambia nada. Ruling: en esos triggers va un
  número por cumplir la regla, y el SPEC §3 deja escrito por qué es inerte.
  Costo si está mal: ninguno visible; se detecta en la captura quieta.
- 2026-09-28 — **Grupo 4 por código, no por excepción escrita.** §5.8 da
  las dos salidas; se elige la que preserva el comportamiento. El borde
  del recorte de Biblioteca y la carpeta de Investigación pasan a medirse
  en cada tick en vez de tuitearse con scrub: quedan exactos, cumplen la
  regla y dejan de depender de `invalidateOnRefresh`. Costo si está mal:
  se ve en movimiento, y la verificación del paso 2 lo mira a propósito.
- 2026-09-28 — **`0.6` en los dos triggers sin animación de
  `hero-quienes/`**, no `0.5`: es el valor de su vecino
  `progreso-quienes.ts`, y en los tres es inerte. Coherencia de carpeta
  antes que el mínimo literal de la regla.
- 2026-09-28 — **La verificación es la captura quieta, no el diff de
  HTML.** `comparar-render.mjs` compara el render del servidor; el scrub
  vive en el cliente. Se arma una captura propia con Playwright (el del
  cache de npx, sin sumar dependencia) y un diff con sharp (ya en
  `apps/sitio`). Los scripts quedan en el scratchpad: sin segundo
  consumidor, no entran al repo.
- 2026-09-28 — **`self.progress` en vez de medir el rect a mano** (paso 2).
  El PLAN decía `getBoundingClientRect` por tick; en un trigger sin
  animación `self.progress` ya es el progreso crudo del scroll de ese
  rango (SPEC §3), y ScrollTrigger re-evalúa los `start`/`end` por función
  en cada refresh. Mismo resultado, menos código y sin medir dos veces.
  Costo si está mal: lo mide `movimiento.mjs`, que dio 0.000 de alcance.
- 2026-09-28 — **`onRefreshInit` endereza la carpeta antes de medir.** El
  timeline viejo se revertía al refrescar (`ScrollTrigger.js:839`), así
  que el tramo se medía con el rect sin girar. Sin ese paso, el rect
  girado 5° es ~150 px más alto (120 vw × sen 5°) y corre el `start`/`end`.
  ScrollTrigger revierte lo que devuelve `onRefreshInit` después de medir
  (`:305`). Costo si está mal: la carpeta se enderezaría antes o después
  del centro; lo delata el diff quieto de `investigacion`.
- 2026-09-28 — **La prueba en movimiento se arregla en la prueba, no en el
  código.** Su primer parser leía 0 por el shorthand colapsado de
  `inset()`; el debug mostró el barrido andando y la consola limpia.
- 2026-09-28 — **El `set` inicial de la carpeta declara `rotation` y
  `scale`** en vez de limpiar en el desmontaje. El doble montaje de
  StrictMode dejaba una matriz girada que GSAP descomponía con ruido; un
  `clearProps` en la limpieza y un flag que apaga los callbacks no lo
  sacaron (el revert del contexto reescribe `rotate(-5deg)` después). Un
  `set` que declara todo lo que le importa no hereda nada, sin importar
  qué haya en el estilo. Costo si está mal: lo mide `cuando-scale.mjs`
  (cuatro lecturas, dev y prod).
- 2026-09-28 — **El ruido de dev se investigó hasta la causa, no se
  descartó por invisible.** 10 ppm de escala no se ven, pero la regla de
  la lane era «con el scroll quieto, idéntico», y una diferencia
  determinista en la página reescrita tenía que explicarse. Costó cinco
  sondas; dejó la carpeta igual en dev y en prod.
- 2026-09-28 — **`resend.test.ts` se reporta, no se arregla acá.** Cancela
  4 tests en `main` con o sin esta lane; arreglarlo en este PR mezclaría
  scopes (§9). Queda en Abierto con la evidencia.
