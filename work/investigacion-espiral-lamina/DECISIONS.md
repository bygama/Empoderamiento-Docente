# DECISIONS — investigacion-espiral-lamina

Append-only. Cada entrada: fecha, decisión, por qué, alternativas descartadas.

## 2026-09-07 — Textos junto a la espiral, de a cuatro

Decisión del owner en shaping. Descartadas: grilla debajo de la escena sin pin
(separaba lectura de figura) y textos bajo demanda en los nodos (escondía el
copy).

## 2026-09-07 — Enfoque A: la cámara se aleja

Elegido sobre B (trazo vivo: cabeza luminosa, ondas, latidos) y C (pseudo-3D).
Por qué: es el mismo gesto que hace el copy («no cierra el ciclo») contado con
escala; costo medio, riesgo bajo, solo transforms. C rompía la metáfora de hoja
plana y complicaba geometría y legibilidad. Los toques de B quedaron fuera: el
owner eligió «A» a secas.

## 2026-09-07 — Lámina anotada, no columna de texto

Las anotaciones van sobre la normal de cada nodo con línea guía, HTML
posicionado por matemática pura. Por qué: el texto vive donde pasa la cosa y la
lectura sigue al personaje; la columna derecha era la versión genérica que ya
existía. El owner pidió que fuera «wow de verdad» tras ver una primera
propuesta que solo comprimía el ritmo.

## 2026-09-07 — Rincón narrador con tres estados

Título 1 → nota bisagra → título 2 en el rincón superior izquierdo; el remate no
va ahí sino como anotación final en el nodo 01. Descartada por el owner: nota
grande y centrada durante el alejamiento.

## 2026-09-07 — Scrub queda en `true`

Toda la página usa `scrub: true` aunque AGENTS.md §8 lo marca anti-patrón.
Cambiarlo en una sola hoja sería una excepción sin criterio. Deuda de página,
fuera de esta lane.

## 2026-09-07 — El trazo no compensa el grosor al escalar

En primer plano la tinta es más gorda y al alejarse se afina: refuerza la
distancia sin efectos extra. `vector-effect: non-scaling-stroke` descartado
porque cambia la interpretación de `stroke-dasharray` y rompe el dibujado por
dash.

## 2026-09-07 — Corre en el checkout actual, en rama

Tier M sin criterio de aislamiento: checkout limpio, sin otras lanes, cambio
reversible por switch de rama. Sin worktree.

## 2026-09-07 — Mudanza a worktree propio (anula la decisión anterior)

A los ~20 min de abrir la rama en el checkout principal aparecieron cambios
de otra sesión de Claude en ese mismo checkout (`CartaAbierta.tsx`,
`LineasInvestigacion.tsx`, `PuntosCampo.tsx` nuevo): criterio de aislamiento
«checkout ocupado» (ADR-011). Se devolvió el checkout principal a `main`
con esos cambios intactos, se borró ahí la rama vacía y la lane sigue en
`C:/Users/mateo/orca/workspaces/Empoderamiento-Docente/investigacion-espiral-lamina`
(rama `feat/investigacion-espiral-lamina`, dev server en el 3001). Nada de
esta lane se commitea en el checkout principal.

## 2026-09-07 — La cámara vive en `lamina-espiral.ts`, no en `espiral.ts`

Agregarla a `espiral.ts` lo llevaba a 223 líneas (tope 200). Además separa
dos cosas distintas: la geometría de la figura (que comparten SSR y
coreografía) y la geometría de la lámina (cámara + anotaciones).
