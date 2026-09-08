# DECISIONS — react-doctor-100

Append-only. Cada entrada: fecha, decisión, por qué, alternativas descartadas.

## 2026-09-08 — Todo por código, cero reglas apagadas

Decisión del owner en shaping. Descartadas: apagar `no-giant-component` por config y
partir los gigantes en otra lane; y arreglar solo bugs reales y apagar el resto por
config. Por qué: el 100 tiene que reflejar el estado real del código, y los gigantes
ya violan el tope de 150/200 líneas de AGENTS.md.

## 2026-09-08 — Evidencia de no-regresión: SSR idéntico + capturas y probes

Decisión del owner. Para refactors puros, el HTML server-side normalizado de cada ruta
queda byte a byte igual al baseline. Para cambios de comportamiento, capturas y probes
numéricos antes/después en el navegador de Orca. Descartadas: solo los gates de
comando; y sumar una revisión visual del owner página por página.

## 2026-09-08 — Tope de 200 líneas por archivo

Decisión del owner. Es el umbral de anti-patrón de AGENTS.md §8 y el precedente de la
lane `investigacion-espiral-lamina`. Descartadas: 150 (objetivo estricto de §6, más
archivos y cortes artificiales en coreografías) y 300 (solo lo que pide react-doctor).

## 2026-09-08 — Commits de la lane autorizados en bloque

Decisión del owner: los commits de esta rama van sin confirmación individual, siguiendo
`docs/COMMITS.md`. Push, PR y merge siguen pidiendo OK explícito. Descartadas:
confirmar cada commit; confirmar por tanda.

## 2026-09-08 — Corre en el checkout actual, en rama, lo hace el agente de a poco

Decisión del owner («hacelo vos de a poco y largá al final reviewers»). Descartadas:
XL con lanes paralelas por área en worktrees de Orca (recomendación del agente por
reloj de pared); L en un worktree propio con un worker (default de AE para L). Tier
queda en L: una sola lane, este checkout, reviewers al cierre. Si en el camino aparece
otra sesión trabajando en este checkout, aplica el criterio «checkout ocupado» y la
lane se muda a un worktree (precedente de la lane anterior).

## 2026-09-08 — Splits antes que cambios de comportamiento

Por qué: los `will-change` y demás se editan en módulos ya chicos, y la paridad SSR de
los refactors puros se compara contra el baseline original sin ruido.

## 2026-09-08 — TeamProfileOverlay migra a `<dialog>` pese al relevamiento

El relevamiento de bugs recomendó no migrarlo (ya implementa `inert`, trampa de foco
filtrada, restauración de foco y scroll, mejor que un port ingenuo). El owner aprobó
migrarlo igual para no dejar ninguna supresión. Riesgo alto, verificación propia
(SPEC §6.9). Descartada: dejarlo como está con una supresión en línea justificada.

## 2026-09-08 — Buscador de biblioteca: `<div role="search">`, sin form

Comportamiento idéntico (scroll a `#materiales` en Enter y en click) sin `<form>` ni
`preventDefault`. El buscador hoy descarta lo tipeado; cablearlo queda fuera y se le
avisa al owner. Descartadas: `action="#materiales"` (navegación completa con query) y
supresión en línea.

## 2026-09-08 — Un paso `[batch]` puede llevar un commit por scope

AE pide un commit por paso; `docs/COMMITS.md` pide partir por scope cuando un cambio
toca varios. Prevalece el repo: los pasos `[batch]` que cruzan features se ejecutan
como una sola pasada pero se commitean por scope (uno por feature tocada). La
aceptación del paso se corre una vez, sobre el conjunto.

## 2026-09-08 — Subcarpeta cuando un split produce tres o más archivos

Decisión del owner (sección 2 del shaping). Precedente:
`quienes-somos/components/profile/`. El compositor queda en su ruta para no tocar a
quien lo importa. Descartada: piezas como hermanas en `components/`.
