# SPEC — Espiral de Investigación como lámina que se dibuja sola

Lane: `work/investigacion-espiral-lamina/` · Tier: M · Rama: `feat/investigacion-espiral-lamina`
Origen: shaping del 2026-09-07 con el owner, diseño aprobado en conversación.

## 1. Propósito

La hoja 03 de `/investigacion` (`EspiralInvestigacion`) hoy es un diagrama con una
columna de texto al lado: un pin de 7000 px con diez paradas, lento de scrollear y
sin gesto memorable. Pasa a ser una lámina de investigación que se dibuja sola
mientras se lee: la figura ocupa el papel, las anotaciones viven sobre los nodos y
la escala cuenta la idea del copy («no cierra el ciclo»).

## 2. Alcance

Dentro:

- Layout live (desktop con hover, sin reduced-motion) de la hoja 03.
- Cámara con dos encuadres y su interpolación en la bisagra.
- Anotaciones HTML sobre la normal de cada nodo, con línea guía SVG.
- Timeline nueva: tres movimientos, cuatro relevos, pin de ~3000 px.
- Voz narradora en el rincón del título: título 1 → nota bisagra → título 2.
- Remate como anotación final en el nodo 01.
- Nota de decisión en `docs/content/arquitectura-investigacion.md` §6.

Fuera:

- Versión estática (touch / reduced-motion): no cambia de contenido ni de layout.
  Puede moverse a su propio archivo sin modificar su render.
- Chrome «Archivo ED · Hoja 03», `Highlight`, tokens, tipografías.
- Copy: íntegro y literal según `docs/content/arquitectura-investigacion.md`
  §6-7 (ya vive en el componente).
- Scrub: sigue `scrub: true` como el resto de la página (deuda de página, no de
  esta lane).
- Efectos de «trazo vivo» (cabeza luminosa, ondas, latidos extra). El único latido
  que queda es el del nodo 01 al aterrizar, que ya existe.

## 3. La escena (diseño aprobado)

### 3.1 Estados

**Primer plano (vuelta 1).** Papel en blanco salvo el personaje (punto naranja) en
el nodo 01. La cámara encuadra la vuelta interior (nodos 01-04) a escala grande. El
personaje recorre 01→04 de un solo gesto a velocidad constante sobre el trazo; la
espiral se dibuja detrás. Al pasar por cada nodo: el nodo brota, su número aparece
y de él se despliega una anotación (línea guía + bloque HTML con nombre y texto)
sobre la normal del nodo. Las cuatro anotaciones quedan visibles hasta el fin de
la vuelta. Pausa breve al llegar a 04.

**Bisagra.** El personaje sigue de 04 a 05 mientras la cámara pasa del encuadre
interior al general. Al arrancar: las cuatro anotaciones y sus guías salen; el
título 1 sale y entra la nota «La cuarta etapa no cierra el ciclo: abre nuevas
preguntas. Por eso volvemos a investigar.» en el rincón. Al llegar a 05: el nodo
brota y se despliega su anotación. Pausa de lectura de la nota; después la nota
sale y entra «Implementar no es terminar.»

**Plano general (vuelta 2).** Mismo modelo: 05→08 de un gesto, anotaciones 06, 07
y 08 al paso. Pausa al llegar a 08.

**Lazo y remate.** Las anotaciones 05-08 y sus guías salen. El lazo se dibuja en
verde y el personaje vuelve por él al nodo 01. Al aterrizar, el nodo 01 late (ya
existe) y se despliega la anotación final con el remate, anclada al 01 hacia
arriba a la derecha, libre del lazo que entra por arriba a la izquierda. Respiro
final y se suelta el pin.

### 3.2 Layout de la hoja (live)

```
[título / nota / título 2, rincón sup. izq.]          ARCHIVO ED · HOJA 03
                        anotación (arriba)
                              │
        anotación ─── [ figura centrada ] ─── anotación
                              │
                        anotación (abajo)
```

- Título: `absolute` arriba a la izquierda, ancho máx. 18ch, misma escala
  tipográfica que hoy. Tres elementos superpuestos con `data-espiral-voz`
  (título 1, nota, título 2).
- Figura: contenedor centrado con la relación de aspecto del viewBox (400:480),
  alto derivado de la altura del viewport (`svh`), `position: relative`,
  `overflow: visible`. Dentro, el SVG con un grupo `data-espiral-camara` que
  envuelve espiral, lazo, nodos, rótulos, guías y personaje.
- Anotaciones: nueve bloques HTML `absolute` (ocho estaciones + remate),
  posicionados por `left`/`top` en % del contenedor de la figura, calculados en
  matemática pura desde la geometría y el encuadre de su vuelta.
  `data-espiral-anotacion` + `data-lado` (arriba | derecha | abajo | izquierda |
  arriba-derecha) decide el `translate` de anclaje. Texto siempre alineado a la
  izquierda. Ancho máx. 30ch. No repiten el número: el número vive en el rótulo
  del SVG.
- Tipografía de anotaciones: nombre en `font-display` 600, texto en cuerpo;
  tamaños con `clamp()` sobre `svh`, mínimo 0.9rem para el texto. El `destacado`
  de la estación 01 conserva su estilo actual.
- Criterio de ajuste: en viewports de 1280×720 a 1920×1080, con `100svh` ≥ 720 px,
  ninguna anotación visible sale del rectángulo de la hoja ni pisa el título o
  el chrome.

### 3.3 Cámara

- Dos encuadres en unidades del viewBox, definidos en `espiral.ts`:
  `ENCUADRE_INTERIOR` (centro = centro del bounding box de los nodos 01-04; alto
  ≈ 300 unidades, a ajustar en la lane hasta cumplir el criterio de 3.2) y
  `ENCUADRE_GENERAL` (el viewBox completo).
- Un encuadre se traduce a `{ x, y, scale }` para el grupo `data-espiral-camara`
  con `transformOrigin: "0 0"`. La bisagra tweenea de un encuadre al otro con
  GSAP (solo transform).
- Trazo, nodos, rótulos, guías y personaje escalan con la cámara: en primer plano
  la tinta es más gorda, en plano general se afina. No se compensa `strokeWidth`.
- Posiciones de anotación: función pura `(k, encuadre) → { left%, top%, lado }`,
  con el ancla sobre la normal del nodo, más allá del rótulo. El remate usa el
  nodo 01 en el encuadre general con dirección arriba-derecha.
- La guía de cada anotación es un `<line data-espiral-guia>` dentro del grupo de
  cámara, del borde del nodo al ancla, calculada con la misma matemática que el
  bloque HTML para que coincidan.

### 3.4 Timeline

Unidades de timeline; `RECORRIDO_ESPIRAL` = 3000 px.

| Beat | Unidades | Detalle |
| --- | --- | --- |
| Intro | 0.3 | Estado inicial: personaje en 01, nodo 01 y su anotación visibles, título 1. |
| Vuelta 1 | 1.6 | Un tramo 01→04, `ease: none` en el tramo y en el dash del trazo. Eventos por nodo en t proporcional a la longitud acumulada. |
| Pausa | 0.3 | |
| Bisagra | 1.0 | Tramo 04→05 (`power1.inOut`) + tween de cámara de la misma duración. Salidas de anotaciones 01-04 al inicio; relevo título 1 → nota. Nodo 05 y anotación 05 al final. |
| Lectura nota | 0.5 | Luego: nota sale, título 2 entra (0.2 de relevo). |
| Vuelta 2 | 1.6 | Un tramo 05→08, `ease: none`. Anotaciones 06-08 al paso. |
| Pausa | 0.3 | |
| Lazo | 0.8 | Anotaciones 05-08 salen al inicio. Lazo visible + dash. Tramo sobre el lazo. Latido del 01 al aterrizar. |
| Remate | 0.6 | La anotación del remate se despliega al aterrizar. Respiro y fin del pin. |

- El personaje sigue saliendo del **tiempo** de la timeline (tramos
  `{ t0, t1, l0, l1 }` + `getPointAtLength`), nunca de tweens. Cambia la lista de
  tramos, no el mecanismo.
- Cada anotación se despliega como: guía dibujada con dash (0.15) + bloque HTML
  `autoAlpha` 0→1 con un desplazamiento corto de 10-14 px desde el nodo hacia
  afuera (0.3, `power2.out`). Sale con `autoAlpha` 1→0 (0.2, `power1.in`), guía
  incluida.
- `#evidencia` sigue aterrizando en el progreso de la bisagra (`progresoBisagra`
  = fin del tramo 04→05).
- `zona.dataset.progreso` se conserva.

## 4. Restricciones

- Solo `transform` y `opacity` (y `strokeDashoffset` / `attr r` como hoy). Nada
  de layout.
- Tokens: colores por `var(--color-*)` y utilidades Tailwind; cero hex en los
  archivos tocados.
- `gsap.context()` + cleanup como hoy; `restaurar()` sigue devolviendo el
  personaje al nodo 01 y ahora también la cámara al encuadre general (que es lo
  que dibuja el SSR).
- El SSR dibuja la figura completa formada en el encuadre general, como hoy.
- Ningún archivo de la lane supera las 200 líneas (umbral de anti-patrón de
  AGENTS.md §8). Si el componente crece, se extrae: la versión estática y/o el
  SVG a archivos propios, sin cambiar su render.
- Comentarios en español, con el porqué (estilo del repo).
- Lenguaje inclusivo en cualquier texto nuevo (no debería haber: el copy es el
  existente).

## 5. Archivos

| Archivo | Cambio |
| --- | --- |
| `src/features/investigacion/components/espiral.ts` | + encuadres, transform de encuadre, posiciones de anotación, geometría de guías. Matemática pura. |
| `src/features/investigacion/components/coreografia-espiral.ts` | Timeline nueva (§3.4). |
| `src/features/investigacion/components/EspiralInvestigacion.tsx` | Layout live nuevo (§3.2). Extracciones permitidas por §4. |
| `docs/content/arquitectura-investigacion.md` | Nota de decisión en §6 (fecha, lámina anotada, cámara). |

## 6. Definition of done

Todo por comando; evidencia en `PROGRESS.md`.

1. `pnpm typecheck` → exit 0.
2. `pnpm lint` → exit 0.
3. `pnpm build` → exit 0.
4. Copy íntegro: los ocho nombres de estación, la nota de la bisagra y el remate
   aparecen literalmente en `EspiralInvestigacion.tsx` o en el archivo al que se
   extraigan (grep de cada uno → 1+ coincidencia; 10 en total).
5. Sin hardcodes: `grep -E "#[0-9a-fA-F]{6}"` sobre los archivos tocados o
   creados en `src/` → 0 líneas.
6. Tamaño: `wc -l` de cada archivo tocado o creado en `src/` ≤ 200.
7. Encaje visual, en el navegador de Orca a 1536×850 y 1920×1080, congelando el
   scroll en cinco progresos (0, fin vuelta 1, mitad bisagra, fin vuelta 2, fin):
   captura de cada uno guardada, y un `evaluate` que compruebe que todo
   `[data-espiral-anotacion]` con opacidad > 0.5 tiene su
   `getBoundingClientRect()` dentro del rectángulo de la hoja y no intersecta el
   rectángulo del título ni el del chrome → `true` en los diez casos.
8. Pin: en el mismo navegador, el `ScrollTrigger` de la hoja tiene
   `end - start` = 3000 (±1).
9. Estática intacta: captura a 390×844 (touch) de `/investigacion#ciclo` antes y
   después de la lane; diff visual nulo. Y con `prefers-reduced-motion: reduce` a
   1536×850, la hoja renderiza la versión estática.
10. `#evidencia`: navegar a `/investigacion#evidencia` a 1536×850 aterriza con
    `zona.dataset.progreso` dentro de ±0.03 de `progresoBisagra`.
