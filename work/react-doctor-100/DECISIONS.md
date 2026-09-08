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

## 2026-09-08 — La lane se basa en `bygama/gar`; gar mergea primero

Al abrir la fase 0 apareció otra lane en vuelo en un worktree de Orca (`bygama/gar`,
dos sesiones activas): 20+ commits, 64 archivos de `src/`, solapados con 27 de los 43
archivos de esta lane y con 12 de los 16 gigantes (TeamProfileOverlay +335/−85,
`equipo.ts` +259). Partir componentes sobre `main` mientras gar los reescribe condena al
segundo en mergear a reaplicar commits sobre archivos partidos. El owner decidió
(«si rebasalas pushea esos commits y continua aca»): rebase de esta rama sobre gar, push
de la rama de la lane (`origin/refactor/react-doctor-100`, que arrastra los commits de
gar en su historia) y seguir acá. Orden de merge: gar → main, después esta lane
rebaseada. Mientras gar siga moviéndose, la lane se rebasea sobre su punta antes de
cada tanda de splits que toque archivos compartidos. Descartadas: esperar a que gar
llegue a `main`; arrancar solo por lo que gar no toca; seguir sobre `main` ignorando gar.
No se pushea `bygama/gar` ni `main` desde esta lane (§5.7 de AGENTS.md).

## 2026-09-08 — El baseline es el de la nueva base (57/100, 126 hallazgos)

El 100 se mide sobre lo que va a ser `main`. Las reglas y sitios nuevos que trae gar
entran al alcance por enmienda del SPEC, que el owner aprueba en conversación antes del
primer paso de código (el SPEC es del owner; el agente solo propone el texto). El
baseline de `main` se conserva en `react-doctor-baseline-main.json` como referencia.

## 2026-09-08 — Probes de escena con Playwright; Orca para interacciones y capturas

La memoria del repo ya documentaba que el navegador embebido de Orca no puede fijar el
viewport antes de hidratar y que sus capturas pueden tumbar el runtime. Medido acá:
un barrido de 4 páginas × 6 estados tardó 7 minutos en Orca (viewport post-hidratación,
`docH` distinto al de un viewport real) y 8 páginas × 6 estados tardó menos de 2 minutos
en Playwright con contexto nuevo y viewport fijo, más emulación táctil real a 390×844.
Las escenas se miden con Playwright; el navegador de Orca queda para interacciones y
capturas. Aprobado por el owner en la enmienda §0.8 del SPEC. Doble pasada del baseline
desktop contra sí mismo: idéntica salvo `data-caret` (parpadeo de opacidad), que entra a
`PROBE_IGNORE`.

## 2026-09-08 — La foto viajera es un `<div>` con `background-image`, no una supresión

El clon animado de la foto de la card copia `currentSrc` para no descargar dos veces; con
`next/image` no se puede. La alternativa honesta a suprimir dos hallazgos es un `<div>`
con `background-image: url(currentSrc)` y `background-size: cover`: misma caché, mismo
encuadre, ningún `<img>`. Aprobado en la enmienda §0.4.

## 2026-09-08 — `cutoutCrop` se borra del tipo `Profile`

Declarado por gar sin ningún dato ni consumidor vivo (el camino `recorte` del overlay es
código muerto desde que Daniela pasó a `marco`). Aprobado en la enmienda §0.4; si gar lo
necesita después, lo reintroduce con datos.

## 2026-09-08 — El split del overlay no extrae `useFocusTrap`

El `<dialog>` del paso 34 reemplaza entera la trampa de Tab y el bucle de `inert`; un hook
creado en el paso 21 para borrarlo en el 34 es ceremonia sin valor. El teclado queda en el
compositor hasta la migración. Aprobado en la enmienda §0.4.

## 2026-09-08 — PLAN renumerado a 36 pasos y `feature_list` a 37 filas

Por la enmienda: sale el split de LineasAccion (gar la bajó del umbral), entran los de
IndicePagina (paso 14) y CarpetaCaso (paso 19), el paso 9 pasa a ser el código muerto y
la foto viajera del overlay (los aliados ya viven en `src/config/aliados.ts`), y aparece el
paso 32 (píldoras de IndicePagina como botón). Los pasos `[batch]` que cruzan features se
siguen commiteando por scope.
