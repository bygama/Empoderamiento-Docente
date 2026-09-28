# PROGRESS — El scrub de las coreografías

## In progress

- 2026-09-28 — Lane abierta por pedido de Facundo, sobre `bf4b995`, en la
  rama `refactor/scrub-de-las-coreografias`. SPEC, PLAN y DECISIONS
  escritos antes de tocar código.
- 2026-09-28 — **Paso 0, la línea base.** `capturar.mjs`: 6 páginas × 13
  alturas, scroll quieto 900 ms, 78 capturas. Dos corridas sobre el mismo
  código (`antes`, `antes2`): **70 de 78 idénticas píxel a píxel**; las 8
  que varían tienen animación autónoma en cuadro (`inicio-00/03`,
  `investigacion-10`, `novedades-00`, `quienes-somos-00/06/07/10`).
- 2026-09-28 — **Paso 1, los 20 de los grupos 1-3.** 16 archivos, 20
  líneas: `scrub: true` → `0.5` (`0.6` en los dos triggers sin animación
  de `hero-quienes/`, como su vecino). `sed -i` dejó los 16 en LF; se
  devolvieron a CRLF y `git diff` no avisa. Captura `despues1` contra
  `antes`: 12 marcadas sobre 0,05 %; 7 son las ruidosas conocidas; de las
  5 nuevas, 4 (`novedades-11`, `quienes-somos-01/02/03`) varían también
  entre dos corridas del mismo código nuevo (`despues1` vs `despues2`) —
  timing—, e `investigacion-11` son las estrellas del faro, que leen el
  tiempo de la escena y no el scroll. Queda `biblioteca-11` (0,43 %,
  determinista): se midió la tarjeta de cierre a los 900 ms y a los 4 s,
  `matrix(1, 0, 0, 1, 0, 0)`, opacidad 1, `top 184.65625` en los dos
  instantes. Geometría idéntica y estable; la máscara del diff es el
  contorno de las letras, sin desplazamiento: rasterizado del texto, no
  estado. **Paso 1: ningún destino cambió.**
- 2026-09-28 — **Paso 2, los 2 del grupo 4, por código.**
  - `destacados/coreografia-destacados.ts` (barrido): el `fromTo` con
    scrub pasó a un `ScrollTrigger.create` sin animación que escribe el
    `clipPath` desde `self.progress` en `onUpdate`/`onRefresh`.
  - `lineas-investigacion/coreografia-lineas.ts` (carpeta): el timeline
    con scrub pasó a `girar(self.progress)` con las tres curvas a mano
    (`power2` es cúbica en GSAP: verificado en `gsap-core.js:1068`), y
    `onRefreshInit` endereza la carpeta antes de medir, como hacía el
    revert del timeline (`ScrollTrigger.js:839`).
  - Prueba en movimiento (`movimiento.mjs`): a cada 120 px, el valor 2
    frames después de mover el scroll contra el valor 650 ms después.
    **Biblioteca:** 105 posiciones, 12 con el barrido en movimiento,
    rango 0→100 %, alcance posterior máximo **0.000**. **Investigación:**
    170 posiciones, 17 en movimiento, −5°→0°→−5°, alcance posterior
    **0.000**. Un tween con scrub habría dado un alcance del orden del
    paso entero.
  - Ojo con la prueba: Chromium serializa `inset(0% 0% 66.9% 0%)` como
    `inset(0% 0% 66.9%)`; la primera versión del parser pedía cuatro
    valores y leía 0 siempre (falso negativo). Se arregló el parser, no el
    código.
- 2026-09-28 — **Paso 2, verificación quieta.** `despues-p2` contra `antes`:
  Biblioteca idéntica en las 13 alturas (el barrido reescrito no mueve
  ningún destino). En Investigación quedaron `04` (0,18 %) y `08` (0,55 %),
  deterministas. Se aislaron:
  - `08` (título de Casos) desapareció al capturar viejo y nuevo **uno tras
    otro, mismas condiciones**: era ambiente. Entre dos corridas del mismo
    código nuevo en condiciones distintas (con el build del gate corriendo
    o no; 900 vs 1500 ms de espera) `04` y `08` varían 0,90 % y 2,17 %, más
    que viejo-vs-nuevo: esas alturas dependen de la corrida.
  - `04` (la carpeta a p=0,3365, −0,04°) sí tenía una causa propia: el
    primer `set` de la carpeta heredaba la matriz girada que dejaba el
    doble montaje de StrictMode (dev) y GSAP la descomponía en
    `rotate(-5.00022deg) scale(1.00001)` —ruido de 10 ppm, invisible, y
    **ausente en el build de producción**, medido en `:3001`. Se probaron y
    descartaron un `clearProps` en la limpieza y un flag que apaga los
    callbacks (la secuencia de `MutationObserver` mostró que el revert del
    contexto vuelve a escribir `rotate(-5deg)` después). La solución es por
    construcción: el `set` inicial declara `rotation: INCLINACION` y
    `scale: 1`, así nunca hereda el estilo. Con eso la carpeta da
    `rotate(-5deg)` limpio en dev, igual que en prod, y **`04` pasa a
    0,000 %** viejo-vs-nuevo, uno tras otro.
  - Resultado final, Investigación viejo vs nuevo, mismas condiciones: solo
    `00` (0,055 %) y `10` (0,060 %), las dos posiciones ruidosas conocidas.
- 2026-09-28 — **Movimiento, código final:** Biblioteca 105 posiciones, 12
  con el barrido en movimiento, 0→100 %, alcance posterior **0.000**;
  Investigación 170 posiciones, 17 en movimiento, −5°→0°→−5°, alcance
  posterior **0.000**.
- 2026-09-28 — `grep -rnE "scrub:[[:space:]]*true" apps/sitio/src`: ninguna
  línea de código (queda solo el comentario de `timeline-fases.ts`).
- 2026-09-28 — **Gate final, sobre el código definitivo** (después de
  borrar los tipos viejos de `.next/types`, que referenciaban rutas que ya
  no existen desde el pull): build 0 · typecheck 0 · lint 0 · react-doctor
  **100/100 sin diagnósticos** (1289 archivos) · test `sitio` 596: 591
  pasan, 0 fallan, 4 cancelados (los de `resend.test.ts`, de antes), 1
  saltado (de antes) · test `auth` 46/46.

## Hecho

## Abierto

- **`src/lib/correo/resend.test.ts` cancela 4 tests también en `main`**
  («Promise resolution is still pending but the event loop has already
  resolved», `cancelledByParent`, líneas 69/80/93/103), verificado con los
  cambios de esta lane guardados aparte: pass 3, cancelled 4. Falla igual
  sola que en la suite. No es de esta lane (`lib/correo` intacto) y no se
  toca acá: es del cliente de Resend, y va a su propia lane con la de
  `avisos.test.ts` que ya anotaba el mapa del admin.
- Los scripts de la lane (`capturar.mjs`, `comparar.mjs`, `diffimg.mjs`,
  `movimiento.mjs`) viven en el scratchpad de la sesión. Si aparece una
  segunda lane de coreografías, entran a `scripts/` con su excepción de
  tamaño en AGENTS.md §6.
- `.next/types/validator.ts` referencia rutas que ya no existen desde el
  pull del 28/9 (`/admin/paginas`, `/api/cron/metricas`): `tsc` a mano
  falla por eso, no por esta lane. Se limpia antes del gate.
