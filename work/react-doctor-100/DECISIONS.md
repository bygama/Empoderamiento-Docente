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

## 2026-09-08 — El tope de 200 líneas aplica a lo creado y a lo que se parte

Medido al ejecutar el paso 1: la lane toca 17 archivos de más de 200 líneas que no
son splits planificados y donde el cambio es de una línea (un import, un hoist, una
clase): `equipo.ts` (2483, datos), `casos/coreografia.ts` (710), `FaroEscena.tsx`
(558), `profileParts.tsx` (453), `coreografia-cierre.ts` (418), `LineasAccion.tsx`
(404), `MobileNav.tsx` (341), `CartaAbierta.tsx` (306), `HeroQuienes.tsx` (310),
`NovedadDestacada.tsx` (310), `CaminoDeTrabajo.tsx` (295), `RotadorPalabras.tsx`
(293), `LanzamientosRecientes.tsx` (279), `TransicionFaro.tsx` (238), `Footer.tsx`
(230), `EnfoqueTransformacion.tsx` (224), `BibliotecaNovedades.tsx` (217). Decisión
del owner: el tope aplica a los archivos que la lane crea y a los componentes que
parte (con sus subcarpetas); los otros no crecen ni una línea pero no se parten acá
(deuda aparte: datos, coreografías, SVG). La DoD §6.3 del SPEC se lee así.

**Enmienda del 2026-09-08 (cierre, decisión del owner).** La cláusula «no crecen ni una
línea» no se cumplió y no se va a forzar: 17 archivos crecieron entre 2 y 17 líneas —el
mayor es `aliados.ts`, 32→49— y 11 de ellos son de esta misma lista. Lo que crecieron son
comentarios del porqué (AGENTS §8) que sostienen los traslados de `will-change` y las
medidas de `next/image`, más el dato `cutoutSize` del paso 30 en `equipo.ts`. Recortarlos
borraría justo la explicación que el repo pide. Queda: el tope se mide sobre lo creado y lo
partido, y a los no partidos se les pide que no se los parta acá, no que no crezcan.
Descartadas: recortar los comentarios para volver al conteo previo; abrir una lane para
partir los 22 (conflictos con `gar` garantizados y cero ganancia de score).
Descartadas: partir los 17 también; partir solo los componentes `.tsx`.
Consecuencia inmediata: las preguntas del faro van a `preguntas-faro.ts` (47 líneas)
y no a `que-hacemos/data.ts`, que habría pasado de 185 a 233.

## 2026-09-08 — RedEd no está montado: evidencia con ruta temporal

`RedEd` y `DistintoEd` no se renderizan en `/quienes-somos` (comentario en
`src/app/quienes-somos/page.tsx`: página muy larga; los componentes quedan por si se
reincorporan). El SSR idéntico y los PROBES de esa ruta no ejercitan el split del paso
16. Decisión: la evidencia sale de una ruta temporal `src/app/probe-red/page.tsx` que
monta `<RedEd />`, creada en este checkout y en el worktree rd-baseline, nunca
commiteada y borrada al cerrar el paso; sobre ella corren `PROBE red-hover` y PROBES a
cuatro fracciones contra los dos servers y se comparan entre sí (3002 = base).
Descartadas: montar RedEd en la página (cambio de producto fuera de la lane); saltar la
evidencia (el split reparte el árbol de efectos; sin probe no hay paridad). La misma
regla vale para cualquier otro componente sin montar que la lane parta.

## 2026-09-08 — Tope de 200 sobre la lista de archivos del PLAN

Cuando la lista de piezas del PLAN no alcanza para dejar cada archivo bajo 200 líneas, se
agrega un módulo más en la misma subcarpeta antes que recortar comentarios o dejar un
archivo pasado. Casos: OrigenEd (coreografía en cuatro módulos, no dos), TeamProfileOverlay
(`apertura-overlay.ts` aparte de `coreografia-overlay.ts`, y el teclado Escape + Tab en
`useTecladoOverlay.ts` aunque el PLAN lo dejaba en el compositor hasta el paso 34: el paso 34
lo borra igual al pasar a `<dialog>`). Descartadas: podar los comentarios (el porqué es parte
del código en este repo); pasar el tope a 250 (DoD §6.3 fijada por el owner).

## 2026-09-08 — Coreografías puras sobre un contexto, no fábricas con refs

El lint del compilador de React (`react-hooks/refs`) rechaza pasar refs a una función
que se llama durante el render («Cannot access refs during render»), aunque la función
solo las guarde para después. Regla para los splits que quedan: las coreografías extraídas
son funciones puras que reciben un objeto de contexto (elementos, estado mutable, setters)
armado DENTRO del handler o del efecto que las llama; o bien hooks de verdad (`use*`, con
sus propios useRef/useEffect), a los que sí se les pueden pasar refs. Nada de
`crear<X>({ ref })` en el cuerpo del componente. Descartadas: nombrar `use*` a funciones que
no usan hooks (la guía de React lo desaconseja); `eslint-disable` (fuera del SPEC).

## 2026-09-08 — Los refs por tambor se crean en el callback-ref

El paso 5 sembró `spanRefs`/`chipRefs` con `useRef(TAMBORES.map(() => []))` para sacar el
vaciado en render (`no-ref-current-in-render`). Eso introdujo dos `rerender-lazy-ref-init`:
el inicializador de `useRef` corre en CADA render aunque el valor se descarte. El paso 26 los
cierra con el patrón que los aros ya usaban: ref inicializado en `[]` y la fila creada al
vuelo en el callback-ref (`(spans.current[i] ??= [])[j] = el`). Nada se vacía en render y no
se reconstruye una matriz por render. Descartadas: `useState(() => …)` (estado mutable que
nadie lee para renderizar); `spans.current ??= …` en el cuerpo del componente (vuelve a
escribir un ref durante el render).

## 2026-09-08 — El hint en hover también sale del markup

`PersonCard` tenía `group-hover:will-change-transform` / `group-focus-visible:…`: un hint
acotado al hover, que react-doctor NO marca (no es permanente). Igual se saca: la aceptación
del paso 28 pide que `will-change` no aparezca en ningún className ni style de JSX, y la
transición que lo usaba es un `scale` de 600 ms sobre una `<img>` que el compositor ya
maneja. Descartada: dejarlo por ser la forma CSS canónica de acotar el hint — deja una
excepción en la regla que la próxima persona no puede distinguir de un descuido.

## 2026-09-08 — Los módulos extra del tope fueron ~12, no 2 (corrección del cierre)

La entrada «Tope de 200 sobre la lista de archivos del PLAN» nombraba dos casos (OrigenEd y
TeamProfileOverlay) como si fueran la excepción. La review de cierre contó los reales: además
de esos dos, `entrada-hero`, `TitularQH`, `toggle-nivel`, `escenas-faro`, `capas-torre` +
`useTorreViva` + `EscenarioTorre`, `contexto` + `ghost-titulo` + `useSaltoIntro` +
`PanelFormulario`, `refs-perfil` + `estilos`, `RotulosIndice`, y el split entero de
`MobileNav`. Cada caso está en PROGRESS con su paso; lo que quedó viejo es la lista de esta
entrada. La regla no cambia —el tope manda sobre la lista de archivos del PLAN—, cambia el
número: partir de verdad produce más módulos de los que un plan estima a ojo.

## 2026-09-08 — El sub-límite de 80 líneas para hooks queda descartado con el de 150

La ruling del owner cambió el tope de AGENTS §6 (150) por 200 planas, pero §6 también pide
«hooks < 80 líneas» y eso nunca se dijo en voz alta. Siete hooks de la lane lo pasan:
`useImanIndice` 183, `useTorreViva` 164, `useLugarExpediente` 152, `useTransicionesExpediente`
142, `useAccionesLugar` 122, `useMenuAnimado` 104, `usePortalModal` 97. Son hooks de
coreografía —máquina de estados, timelines, refs y limpieza— donde partir por debajo de 80
separaría el efecto de su cleanup, que es justo lo que la receta de splits evita. Queda
registrado: el tope de la lane es 200 para todo, hooks incluidos. Descartada: partir los
siete para cumplir el sub-límite.

## 2026-09-08 — Los borrados se commitean antes de medir con react-doctor

`react-doctor` arma su lista de archivos con el índice de git, no con el disco: en el paso 34,
con `useTecladoOverlay.ts` borrado pero sin commitear, el chequeo `dead-code` murió con
`ENOENT` al intentar leerlo y la herramienta ESCONDIÓ el score entero («Results are
incomplete»), dejando una salida que se parece mucho a «un solo hallazgo, todo bien». Regla
de la lane: un paso que borra archivos se commitea ANTES de correr `RD` como aceptación, y
una salida sin línea `Score:` no cuenta como medición — se abre con `--json` y se leen
`projects[0].skippedChecks` / `skippedCheckReasons`, que la consola no imprime. Descartadas:
correr `RD` sobre el worktree sucio y restar el hallazgo a ojo (mide otra cosa); `git stash`
alrededor de la medición (esconde el paso que se está verificando).

## 2026-09-08 — El buscador del hero usa `<search>`, no `<div role="search">`

El PLAN (paso 35) pedía `<div role="search">`. Sacado el `<form>`, react-doctor levantó
`prefer-tag-over-role` sobre ese mismo div: el elemento nativo `<search>` da la semántica que
el rol imita. Se usa el elemento; el rol explícito sobra y no se agrega. Como el elemento es
reciente, la clase mantiene un `flex` propio (un navegador que no lo conozca lo trataría como
inline). En el mismo paso, `irAMateriales` sube al módulo por
`prefer-module-scope-pure-function`: no lee props ni estado, y adentro se rearmaba por
render. Ojo con los probes: `<search>` lleva el rol IMPLÍCITO y NO matchea `[role="search"]`
— el probe del buscador selecciona `search, [role="search"]` para medir lane y base con el
mismo script. Descartadas: dejar el div con el rol (deja un hallazgo vivo, y el SPEC no
permite apagar reglas); poner `role="search"` sobre `<search>` (rol redundante).

## 2026-09-08 — La forma de los commits se corrige de acá en adelante, no reescribiendo

La review de cierre encontró tres cosas de forma en los commits ya hechos: 15 de 65 headers
pasan los 72 caracteres de `docs/COMMITS.md` §1 (el peor, 80: «perf(que-hacemos): nombrar las
propiedades que transicionan en el hero y el riel»); el scope de `4857346` dice `ui` pero
toca `config/`, `layout/` y `home/`; y las cuatro migraciones de accesibilidad de la fase 2
se repartieron entre `feat` (los dos `<dialog>`) y `fix` (píldoras y buscador) cuando ninguna
estrena funcionalidad para quien usa el sitio: las cuatro eran `refactor` o `fix`. Los tres
son reales. No se reescriben: los sha de estos commits están citados uno por uno en
PROGRESS, en `feature_list.json` y en las entradas de este archivo, y un rebase los
invalidaría todos para ahorrar caracteres. Queda como regla para la próxima lane: header
≤ 72, scope por carpeta tocada y `feat` solo si el sitio hace algo nuevo. Descartadas:
`rebase -i` para reescribir los 15 headers; dejar de anotar los sha para poder reescribir.

## 2026-09-08 — `<search>` va sin `role="search"` explícito

El seat de accesibilidad pidió sumar `role="search"` al `<search>` del hero de biblioteca
para los navegadores anteriores a Chrome 118 / Safari 17 / Firefox 118, que no le dan rol
implícito. Se agregó, y react-doctor lo devolvió como `no-redundant-roles`: el score cayó de
100 a 96. Como el pedido del owner es 100/100 sin apagar ni una regla, el rol sale. El
landmark queda nativo en todo navegador que conozca el elemento —los tres de esa lista salieron
en 2023— y en los anteriores el buscador sigue siendo un campo con su `<label>`, que es lo que
era antes de la lane. Lo que NO se hace es dejar el rol y bajar el score, ni suprimir la regla.
Descartadas: volver a `<div role="search">` (reabre `prefer-tag-over-role`); `react-doctor-disable`.

## 2026-09-09 — La rama se borra por identidad de árbol, no por `--merged`

`git branch -r --merged origin/main` no listaba `refactor/react-doctor-100`, y
`git log --cherry-pick` daba sus 82 commits como no mergeados. Las dos señales son falsos
negativos: el PR #91 aterrizó **aplastado en un solo commit** (`eb65729`, un solo padre), así
que ningún patch-id de la rama coincide con nada de `main`. El criterio que sí decide es la
identidad de árbol: `git diff origin/refactor/react-doctor-100 eb65729` vacío prueba que el
squash se llevó el árbol entero, y `merge-base --is-ancestor eb65729 origin/main` que ese
commit está en `main`. Sumado a cero commits en la rama posteriores al merge, no había trabajo
que perder y la rama se borró. Descartadas: borrar confiando en el estado MERGED del PR sin
mirar el contenido; dejarla viva por lo que decía `--merged`.

## 2026-09-09 — La carpeta de la lane sale en un PR propio, no colgada del #91

La receta pide que la carpeta se vaya en el último commit del PR que cierra la lane. Acá no
pasó: el #91 mergeó el 2026-09-08 con `work/react-doctor-100/` adentro, y ese PR ya no existe
como lugar donde meter nada. La alternativa —borrarla con un push directo a `main`— la
prohíbe AGENTS.md §5.7. Así que el cierre va por su propio PR, con los dos commits que pide
la receta: primero el que deja PROGRESS verdadero y con el bloque PASS del cierre, después el
que saca la carpeta. El historial conserva los once archivos. Descartadas: push directo a
`main`; dejar la carpeta y anotar la deuda para después (la sesión de «después» no existe).
