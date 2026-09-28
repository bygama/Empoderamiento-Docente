# Entrega — celular y tablet en las secciones restantes

> Lane `work/mobile-tablet-secciones-restantes/`. Rama `feat/mobile-tablet-secciones-restantes`,
> creada desde `feat/que-hacemos-movil` @ `c198b3b`. **Nada commiteado, nada mergeado**:
> los commits propuestos están al final y esperan el OK del owner.

## 1. Alcance y estrategia

- **Adaptado a celular y tablet:** Contacto, Biblioteca, Novedades (listado y detalle),
  Quiénes somos, Investigación y la 404.
- **Intocables, y comprobado que siguen iguales:** Inicio y Qué hacemos (ningún archivo bajo
  `features/home`, `features/que-hacemos`, `components/`, `lib/`, `config/` ni `globals.css`
  aparece en `git status`), y la versión de **computadora (≥ 1024 con hover)** de todas las
  páginas.
- **Cómo se congeló computadora:** solo se agregan variantes (`max-lg:`, `max-md:`,
  `md:max-lg:`, `lg:hidden`, `[@media(hover:none)]:`, `[[data-modo=…]_&]:`, `data-[modo=…]:`).
  Ninguna clase `md:`/`lg:`/`sm:` existente se borró ni se editó: un script recorre el
  `git diff -U0` y exige que cada clase de escritorio borrada reaparezca en el mismo hunk
  (47 líneas revisadas, 4 mudanzas verificadas a mano). Los efectos GSAP de escritorio
  conservan su cuerpo y solo pasan a depender de `modo === "vivo"`.
- **Modo por escena.** Cada escena con coreografía decide un modo (`quieto | vivo | movil`,
  más `tablet | pila` en Líneas) completo en cada corrida, se suscribe al `change` de sus
  `matchMedia` (rotar re-decide) y limpia listeners y `gsap.context`. Gates: vivo
  `(hover: hover) and (min-width: 64rem)` (Origen: `(min-width: 1024px)` sin hover, como hoy);
  movil `(max-width: 63.999rem) and (min-height: 38.75rem)`; `prefers-reduced-motion` →
  quieto. El estado inicial reproduce el HTML servido de hoy.
- **Idioma móvil compartido:** pilas con lomos (escala `encajar` con piso 0.35, altura fijada en
  `refreshInit`), escenas pegadas `h-lvh` sobre pistas `lvh`, dibujos por `dash-offset` o
  `scaleX`, hojas `<dialog>` con `useLockScroll` + `data-lenis-prevent`, rieles con
  `scroll-snap` y progreso, detección de activo por centro de pantalla, `inert` + `tabIndex -1`
  para lo oculto, targets ≥ 44 px, inputs ≥ 16 px, safe-area en pies pegados.

## 2. Qué se hizo por sección (y cómo se reinterpretó cada animación)

### Contacto
- Los tres estados (hero, formulario, cierre) dejan de ser paneles superpuestos y van **en el
  flujo** bajo `lg`; las transiciones de envío tienen rama móvil sin pantallas en blanco.
- País: **selector nativo** en táctil (`PaisCampo`), estado conservado al cruzar 1024.
- Targets táctiles y hero centrado (`max-lg:min-h-[100svh]`).

### Biblioteca
- Filtros: **barra + hoja inferior** (`FiltrosMovil`, `HojaFiltros`) con los tres grupos
  abiertos; se cierra sola al pasar a `lg`.
- Destacados: **baraja deslizable** (`BarajaMovil`) con activo por centro y puntos.
- Puente a Investigación: **pila con lomos** (`puente/pila-movil.ts`, `useModoPuente`).
- Hero sin zoom en iOS, riel de categorías con snap, cierre compacto; la fila del catálogo pasó
  a `FilaMaterial.tsx`.

### Novedades
- Chips de filtro en **riel** (el activo se centra moviendo solo el riel, nunca la página),
  paginación ≥ 44 px, destacadas apiladas.
- «ED en movimiento»: el dolly de escritorio se convierte en **etapas** que muestran cada
  frase (`ed-en-movimiento/coreografia-movil.ts`, `Momento`).
- Lanzamientos: **riel con snap y barra de progreso**; en el detalle, la guía es un **riel
  pegajoso** (`GuiaNotaRiel`).

### Quiénes somos
- Origen: el pin de escritorio pasa a **capítulos** en una escena pegada
  (`origen/capitulos-movil.ts`); en ≥ 1024 sin hover sigue vivo, como hoy.
- Nuestra mirada: **mapa fijo** que se enciende al leer (`mirada/MapaMovil`, trazo por
  `scaleX`), con salto que no queda tapado por header + mapa.
- Equipo: cards táctiles con «Ver trayectoria» visible en reposo solo donde cabe
  (`labelTactil` por nivel), perfil con safe-area y botones ≥ 44 px.

### Investigación
- Hero: **faro chico** con el haz posado sobre el titular y la **historia en cuatro
  constelaciones** en escena pegada (`hero/HistoriaMovil`).
- Líneas: **pila con lomos** en celular y carpeta con entrada suave en tablet
  (`lineas/pila-movil.ts`).
- Ciclo: la **espiral acompaña la lectura** pegada arriba; trazo, nodo activo y personaje
  siguen la estación que se lee (`coreografia-espiral-movil.ts`).
- Casos: expediente y carpetas táctiles (indicio de la tapa visible en reposo, evidencias sin
  giro, pista «seguir leyendo» sobre la píldora «Volver»).
- Cierre: el **faro sube como silueta** en la esquina inferior derecha y **el haz gira** hacia
  cada mensaje (`cierre/coreografia-cierre-movil.ts`, `CierreLinternaMovil`).

### 404
- Menos aire bajo el header en celular y targets ≥ 48 px.

## 3. Decisiones tomadas (con el porqué)

- **≥ 1024 táctil sin hover = computadora estática**, salvo Origen (ya era vivo): la matriz
  aprobada lo fijó así para no rediseñar el iPad apaisado.
- **No se parten componentes que ya superaban 200 líneas** más allá de lo mínimo
  (`LineasInvestigacion`, `CierreInvestigacion`, `PersonCard`, `TeamProfileOverlay`,
  `EdEnMovimiento`, `MaterialesListado`, `PuenteInvestigacion`, `ExpedienteCaso`): partirlos
  mezclaría refactor con adaptación; queda anotado como deuda con nombre.
- **Etiqueta «Ver trayectoria» en táctil solo en niveles 1 y 2**: en los niveles 3 y 4
  aplastaba el país a 0 px; ahí la flecha sigue siendo la señal, como en escritorio en reposo.
- **Variante `quieto` acotada a `max-lg:`** en Origen: sin eso, en computadora con movimiento
  reducido cambiaba paddings.
- **Espiral pegada:** la grilla pasa a bloque y la hoja a `overflow-clip` en modo movil, porque
  una fila propia de grilla y un `overflow-hidden` anulan el sticky.
- **Header transparente sobre rieles pegados:** entre header y espiral/mapa/guía el texto pasa
  por debajo del logo, igual que en cualquier scroll del sitio. Se dejó consistente; darle fondo
  al header en esas franjas es decisión de diseño del owner.
- **`aria-hidden` del indicio de la tapa** sigue atado al estado: en táctil un lector de
  pantalla encuentra el mismo botón «Ver de qué trata el caso» que en escritorio.
- **Anclas `#biblioteca`/`#conversemos` en celular** aterrizan al final de la escena con
  `data-aterrizaje="fin"` (mecanismo del sitio), no con `scrollTo`.

## 4. Verificación

### Gate y build (rama completa, después de normalizar CRLF en los 65 archivos)
- `pnpm typecheck`: sin errores.
- `pnpm lint`: sin errores.
- `react-doctor`: **100 / 100, sin diagnósticos**.
- `pnpm build`: OK (17 páginas estáticas generadas).

### Tests funcionales (Playwright, fuera del repo en `%LOCALAPPDATA%\Temp\edqa\restantes\pw`)
- `qa-contacto.mjs`, `qa-biblioteca.mjs`, `qa-novedades.mjs` (26), `qa-quienes.mjs` (27),
  `qa-investigacion.mjs` (59): todos en verde contra el dev server; resultado contra
  producción en §4.4.
- `qa-rotacion.mjs`: en las 7 rutas, rotar 390×844 ↔ 844×390 sin recarga deja cada
  `data-modo` igual que una carga directa, sin `pin-spacer` de más y sin desborde.
- Movimiento reducido (`REDUCIDO=1`, 390×844 táctil): todas las escenas en `quieto`, sin
  pistas ni sticky de coreografía.

### Revisiones
- Una revisión por tarea (Sonnet) y una revisión final de rama por plan (Opus), con ronda de
  correcciones y re-revisión acotada. Los cinco planes terminaron **APROBADOS**. Ledgers y
  paquetes en `.superpowers/sdd/PLAN-0N-*/` (ignorado por git).

### 4.4 Producción: matriz de viewports y comparación contra las bases

Corrida secuencial sobre `pnpm build` + `pnpm start` (script `fase6.sh`; capturas en
`%LOCALAPPDATA%\Temp\edqa\restantes\final\`, cada carpeta con su `comparacion.json` y sus
diffs en `_diff/`).

**Inicio y Qué hacemos (protegidas) contra `base-limpia/`** (build limpio de `c198b3b`):
- Táctil 375×812, 390×844, 768×1024, 1024×1366 y escritorio 1280×800, 1440×900, 1920×1080:
  **geometría idéntica en los 14 pares** (`geoIgual = true`, mismas pantallas, ningún paso
  faltante). Diferencias de píxel < 0,7 % salvo el paso p14 de Qué hacemos (ver abajo).
- **p14 de Qué hacemos** (la escena de cards de «Cómo trabajamos», con scrub): 1,4 a 21 % según
  la corrida. Es el instante de captura, no el layout: dos corridas seguidas sobre el mismo
  build ya difieren en ese paso (2,4 % a 1280), el diff muestra la card «Diseñar» en distinto
  punto de apertura, la geometría es igual en todas y ningún archivo de Qué hacemos, `components/`,
  `lib/` ni `globals.css` cambió.

**Escritorio de las nueve rutas (1280, 1440, 1920) contra `base/`:** mismas pantallas y
pasos en todas; diferencias de píxel < 0,3 % (fondo aleatorio del hero, badge de Next). Las dos
marcas `geoIgual = false` (Biblioteca, Investigación) son solo texto de selectores en la
auditoría (`div.contents`, el `div` que envuelve el link, la clase `max-lg:hidden` del aside);
alturas, anchos y posiciones coinciden.

**Matriz táctil de las siete rutas incluidas** (320×568, 360×800, 375×812, 390×844, 414×896,
430×932, 768×1024, 1024×768, 820×1180, 1180×820, 1024×1366, 1366×1024): en las 84
combinaciones `scrollWidth === innerWidth` (sin desborde horizontal), inputs ≥ 16 px, sin
errores de consola nuevos (solo la advertencia preexistente de Next por una imagen precargada
en el detalle de Novedades, idéntica en la base, y el 404 esperado). Contra `base/incluidas`
las páginas cambian a propósito (hasta 95 % de píxeles distintos en celular); a 1024×1366 táctil
la diferencia es < 0,4 %, que es lo esperado por la decisión de dejar ≥ 1024 como computadora.

**Suites contra producción:** `qa-contacto`, `qa-biblioteca`, `qa-novedades`, `qa-quienes`,
`qa-investigacion` sin fallas; `qa-rotacion` en las siete rutas «Todo OK».

## 4.5 Tarea agregada: el faro del hero de Investigación (pedido del 2026-09-28)

En celular y tablet el faro chico del hero **se enciende al cargar** (reinterpretación del
encendido de computadora, ~2.5 s, sin bloquear el scroll: la lámpara se prende, el haz baja del
cielo y se posa sobre el titular, con el ángulo medido hacia el `<h1>` como hace escritorio) y
**al scrollear el haz gira por la izquierda hacia la historia** y se desvanece cuando la escena de
las constelaciones llega arriba (`hero/coreografia-encendido-movil.ts`,
`hero/coreografia-entrega-movil.ts`). Con movimiento reducido el haz queda quieto apuntando al
titular. Escritorio intacto (el faro chico es `lg:hidden`; `coreografia-encendido.ts` y
`coreografia-historia.ts` sin cambios).

## 4.6 Paso a main: diagnóstico (decisión del owner: respaldo hoy, porte con Facundo)

- `origin/main` no es ancestro de esta rama: la cadena móvil nace en `d452e612` y main tiene
  **798 commits** que la cadena no tiene. Los **38 commits móviles previos** (menú cortina, hero
  e Inicio móvil, Cómo trabajamos, Áreas, Faro y Qué hacemos móvil) tampoco están en main ni
  fueron pusheados: esta rama es la única copia de toda la cadena.
- Main migró **todo el contenido al panel** (Payload): hero, cómo trabajamos, áreas, niveles,
  faro, proyectos y cierre de Qué hacemos; catálogo y destacados de Biblioteca; novedades;
  equipo; aliados; pie, menú y Contacto. Los datos estáticos que usan estas ramas
  (`equipo.ts`, `hero/hero-cards.ts`, `como-trabajamos/data.ts`, `lineas-accion/data.ts`) ya no
  existen; los componentes reciben el contenido tipado desde `contenido/*.ts`. Además main
  refactorizó las coreografías (`scrub` de `true` a `0.5`, barrido y carpeta medidos por tick).
- `git merge-tree origin/main HEAD` (simulación, sin tocar nada) da **19 archivos en
  conflicto**: `MobileNav.tsx`, `PieMenu.tsx`, `MaterialesListado.tsx` y dieciséis de
  `features/home` y `features/que-hacemos`, más cuatro «modificado / borrado».
- Conclusión: no es un rebase con conflictos sino un **porte** de la cadena móvil sobre los
  componentes que leen del panel, que necesita una base Postgres con contenido para verificar y
  coordinación con quien lleva main. Se hace como lane propia.

## 5. Errores preexistentes y limitaciones

- **Escritorio, `/investigacion#biblioteca`:** aterriza con los bloques del cierre en opacidad
  0 (código sin cambios en esta rama). Detectado por la re-revisión; queda como tarea aparte.
- **Header y skip-link:** el harness marca targets < 44 px y un recorte en el header, el
  footer y «Saltar al contenido»; son componentes compartidos fuera del alcance.
- **Hero de Investigación en celular:** el faro chico no se enciende ni gira al scrollear
  (queda el frame final). El encendido de escritorio es autónomo y podría reutilizarse; la
  historia ya vive en su escena. Pendiente de decisión del owner.
- **1024 táctil sin hover** ve computadora estática (decisión de la matriz).
- La comparación de píxeles contra `base/` para las páginas incluidas es informativa: cambió
  el diseño en celular a propósito. La prueba de no-regresión es la comparación de escritorio
  y la de Inicio/Qué hacemos contra `base-limpia/`.

## 6. Archivos tocados (61 modificados o nuevos + 4 sin trackear, +2193 / −424)

Ver `git status --short -- apps/sitio/src`. Por feature: `contacto/` (14), `biblioteca/` (14),
`novedades/` (12), `quienes-somos/` (11), `investigacion/` (14), `app/(sitio)/not-found.tsx`.

## 7. Commits (atómicos, en este orden; ejecutados con el OK del owner el 2026-09-28)

Los fixes que salieron de las revisiones se pliegan en el commit de diseño de su sección:
nunca se commiteó el bug, así que no hay un fix que contar aparte. Donde un archivo tenía
cambios de dos tareas (el hero de Investigación, el listado de Biblioteca) van en un commit.

1. `design(contacto): en celular y tablet los estados van en el flujo de la página`
2. `design(contacto): país con selector nativo y targets táctiles bajo lg`
3. `design(biblioteca): hero sin zoom en iOS, riel con snap y targets táctiles`
4. `design(biblioteca): en celular y tablet los filtros van en una barra y una hoja inferior`
5. `design(biblioteca): en celular y tablet los destacados son una baraja deslizable`
6. `design(biblioteca): en celular y tablet el puente a Investigación se apila con lomos`
7. `design(biblioteca): cierre más compacto en celular`
8. `design(novedades): chips en riel, paginación táctil y destacadas apiladas en celular`
9. `design(novedades): en celular «ED en movimiento» llega en etapas y muestra sus frases`
10. `design(novedades): riel de lanzamientos con snap y progreso en celular`
11. `design(novedades): la guía de la nota es un riel pegajoso en celular`
12. `design(quienes-somos): en celular y tablet el origen se lee por capítulos`
13. `design(quienes-somos): en celular la mirada lleva un mapa fijo que se enciende al leer`
14. `design(quienes-somos): cards del equipo y perfil táctiles en celular`
15. `design(investigacion): en celular el hero lleva el faro que se enciende y la historia`
16. `design(investigacion): en celular las líneas se apilan y en tablet la carpeta entra suave`
17. `design(investigacion): en celular la espiral acompaña la lectura de los ocho pasos`
18. `design(investigacion): expediente y carpetas afinados para táctil`
19. `design(investigacion): en celular el cierre sube el faro y gira la luz hacia cada mensaje`
20. `design(404): aire bajo el header y targets táctiles en celular`
21. `docs(work): auditoría, planes y entrega de la adaptación a celular y tablet`
