# SPEC — El scrub de las coreografías

## 1. Qué se quiere

Sacar `scrub: true` de las coreografías del sitio, que `AGENTS.md` §8 lista
como anti-patrón («usar `scrub: 0.5` mínimo»), **sin cambiar lo que se ve**.

La regla existe porque `scrub: true` ata la animación al scroll sin
suavizado: con Lenis de por medio, cada tick del scroll entra crudo y la
coreografía se traba. El repo ya lo sufrió y lo dejó escrito en
`quienes-somos/components/mirada/timeline-fases.ts`:

> «discretos; con `scrub:true` la timeline saltaba con él (el "trabado")».

Ahí se arregló con `scrub: 1`. Esta lane hace lo mismo en el resto.

## 2. El alcance real (medido el 2026-09-28 sobre `bf4b995`)

**22 ocurrencias en 17 archivos**, sobre 6 páginas: Inicio, Qué hacemos,
Quiénes somos, Investigación, Biblioteca y Novedades.

El `PROGRESS` del mapa del admin anotaba «11 coreografías de 8 archivos».
Ese número quedó viejo: es la mitad del real. La cuenta de esta lane se
midió con `grep -rnE "scrub:[[:space:]]*true"` descontando la línea de
comentario de `timeline-fases.ts`.

## 3. Lo que `scrub` hace de verdad

Antes de elegir un valor por coreografía hubo que leer el fuente de
ScrollTrigger (`gsap@3.15.0/src/ScrollTrigger.js`), porque el efecto de
`scrub` **depende de si el trigger tiene una animación atada**:

- `isToggle = !scrub && scrub !== 0` (:615). Cualquier `scrub` —`true`, `0`
  o `0.5`— pone el trigger en modo scrub.
- `onUpdate && !isToggle && !reset && onUpdate(self)` (:1144). **`onUpdate`
  se llama en cada tick solo en modo scrub.** En modo toggle (:1173) se
  llama nada más en los cambios de estado.
- El suavizado es un tween aparte (`scrubTween`, :660) que se crea **solo
  si `_isNumber(scrub)`** y **solo dentro de `if (animation)`** (:662-668).

De ahí salen dos conclusiones que ordenan toda la lane:

1. En un `ScrollTrigger.create` **sin animación** (los que solo tienen
   `onUpdate`), `scrub` no suaviza nada: lo único que hace es mantener vivo
   el `onUpdate` por tick. `true`, `0` y `0.5` se comportan **idéntico**.
   Cambiarlos es gratis y no hay nada que verificar a ojo.
2. Donde sí hay animación, `scrub: 0.5` agrega hasta medio segundo de
   demora. Eso es lo que hay que mirar, y **no siempre es inocuo**: si la
   coreografía está atada a la posición de un elemento que se mueve con el
   scroll natural (no animado), la demora los separa a la vista.

## 4. Los cuatro grupos

| Grupo | Qué es | Cuántas | Riesgo |
| --- | --- | --- | --- |
| 1 | `ScrollTrigger.create` sin animación, solo `onUpdate` | 2 | ninguno: probado por código |
| 2 | Entradas, revelados, fundidos y parallax | 13 | bajo: nada atado a geometría ajena |
| 3 | Timelines largas dentro de un pin | 5 | bajo, pero se mira |
| 4 | Atadas a la posición de un elemento no animado | 2 | **alto: la demora se ve** |

### Grupo 4, el que tiene decisión adentro

- **`destacados/coreografia-destacados.ts:121`** — el `clipPath` de la
  portada avanza en el mismo rango de scroll que la divisoria del artículo,
  «así el borde del recorte ES la línea». La línea es un elemento de
  layout: se mueve con el scroll crudo, sin GSAP. Si el recorte se suaviza
  y la línea no, **el borde se despega de la línea** mientras se scrollea, y
  el efecto pierde exactamente lo que lo hace funcionar.
- **`lineas-investigacion/coreografia-lineas.ts:28`** — «la carpeta está
  derecha solo cuando está CENTRADA en la ventana». Con demora se endereza
  después del centro.

**No se resuelven con una excepción escrita, se resuelven por código**
(§5.8: «se arregla igual con un cambio que preserve el comportamiento»). Las
dos dejan de ser un tween con scrub y pasan a calcular su valor del
`getBoundingClientRect` real en cada tick, dentro de un
`ScrollTrigger.create` sin animación — que por el punto 1 del §3 queda
exacto y además cumple la regla. De paso quedan inmunes a los reflows, que
hoy obligan a `invalidateOnRefresh`.

## 5. Qué valor lleva cada grupo

- Grupos 1 y 4: `scrub: 0.5`, inerte por no haber animación atada.
- Grupos 2 y 3: `scrub: 0.5`, el mínimo de la regla. No se sube salvo que
  la verificación visual muestre que una coreografía puntual lo pide, y en
  ese caso el porqué queda en `DECISIONS.md`.

## 6. Cómo se verifica

Ningún gate mide esto. Por coreografía:

1. Captura a varias alturas de scroll **antes** y **después**. Con el scroll
   quieto el estado tiene que ser el mismo: el scrub cambia el camino, no el
   destino. Una diferencia con el scroll detenido es una regresión.
2. Recorrido a ojo de las 6 páginas afectadas, mirando las dos cosas que el
   owner lee como bug: que nada rebote y que no queden pantallas quietas.
3. Las dos del grupo 4, además, con el scroll en movimiento: el borde del
   recorte pegado a la línea, y la carpeta derecha en el centro.

## 7. Criterio de cierre

`grep -rnE "scrub:[[:space:]]*true" apps/sitio/src` no devuelve ninguna
línea de código, el gate (`typecheck`, `lint`, `react-doctor` 100/100,
`test`, `build`) en verde, y el recorrido visual de las 6 páginas sin
diferencias con el scroll quieto.

## 8. Fuera de esta lane

- Los `scrub` numéricos que ya existen (0.45 a 2): no se tocan.
- El resto de los anti-patrones GSAP de §8.
