# Relevamiento DELTA — react-doctor 0.9.13 sobre `refactor/react-doctor-100` (base `bygama/gar`)

Fecha: 2026-09-08 · HEAD `1a0dabd` · base comparada: `main` (baseline vía `git show HEAD:work/react-doctor-100/react-doctor-baseline.json`)

Comando: `pnpm dlx react-doctor --no-supply-chain --json src`
Salida nueva: `<scratch>/rd-now.json` (275 014 bytes) · baseline vieja: `<scratch>/rd-old.json` (262 825 bytes)
Script de comparación: `<scratch>/delta.mjs`

| | main | gar (HEAD) |
|---|---|---|
| diagnostics | 120 | 126 |
| errors | 9 | 9 |
| warnings | 111 | 117 |
| archivos afectados | 43 | 44 |
| score | 58 (Critical) | 57 (Critical) |

Las tres encuestas previas (`relevamiento-bugs.md`, `relevamiento-performance.md`, `relevamiento-gigantes.md`) siguen describiendo los 117 sitios que sobrevivieron sin cambios ni corrimiento. Este documento cubre lo que se movió.

---

## 1. Delta por regla

| regla | main | gar | Δ |
|---|---|---|---|
| click-events-have-key-events | 0 | 1 | **+1** |
| no-broken-image-source | 0 | 1 | **+1** |
| no-static-element-interactions | 0 | 1 | **+1** |
| nextjs-no-img-element | 8 | 9 | +1 |
| no-giant-component | 16 | 17 | +1 |
| no-high-complexity-react-function | 1 | 2 | +1 |
| no-permanent-will-change | 32 | 33 | +1 |
| prefer-module-scope-pure-function | 5 | 6 | +1 |
| no-transition-all | 13 | 11 | **−2** |
| html-no-nested-interactive | 1 | 1 | 0 |
| js-combine-iterations | 2 | 2 | 0 |
| no-array-index-as-key | 12 | 12 | 0 |
| no-prevent-default | 1 | 1 | 0 |
| no-ref-current-in-render | 5 | 5 | 0 |
| no-scale-from-zero | 1 | 1 | 0 |
| no-unguarded-browser-global-in-render-or-hook-init | 4 | 4 | 0 |
| only-export-components | 13 | 13 | 0 |
| prefer-html-dialog | 2 | 2 | 0 |
| prefer-module-scope-static-value | 2 | 2 | 0 |
| prefer-use-effect-event | 2 | 2 | 0 |

Balance: 9 sitios nuevos, 3 sitios que desaparecen, 51 que solo cambiaron de renglón.

---

## 2. Sitios que DESAPARECIERON (3)

**`features/home/components/LineasAccion.tsx:110 no-giant-component` — desaparición REAL.**
gar borró la rama mobile/tablet de la coreografía (la pila vertical superpuesta) y dejó solo el abanico desktop: el archivo pasó de 433 a 404 líneas y el cuerpo de `LineasAccion` cayó por debajo del umbral de 300. No hay nada que hacer acá; el plan debe sacar `LineasAccion` de la lista de gigantes.

**`features/investigacion/casos/CarpetaCaso.tsx:253` y `:280 no-transition-all` — desaparición APARENTE. Ojo.**
Las dos clases `transition-all` SIGUEN en el código, ahora en 376 y 408:

```
376:  className={`mt-2 block h-5 font-sans text-[0.88rem] transition-all duration-300 ${
408:  className={`font-display block max-w-[50ch] ... transition-all duration-[400ms] lg:text-[1.9rem] ${
```

Lo que cambió es que gar convirtió esos `className` de string literal a template literal con interpolación (el toggle `desplegada`), y la regla solo lee strings estáticos. Se confirma con el archivo vecino: `NavegacionCasos.tsx:46` tiene `transition-all` dentro de un template literal y no está reportado, mientras que `:92`, string plano, sí lo está.

Consecuencia para el plan: el conteo de `no-transition-all` bajó de 13 a 11 sin que se arreglara nada. Si la lane apunta a 0 diagnostics, esos dos sitios igual hay que arreglarlos o quedan como deuda invisible; y al revés, cualquier arreglo que convierta un `className` estático en template literal va a "bajar" el número sin mejorar nada. Conviene que el plan cuente los `transition-all` con grep además de con react-doctor.

---

## 3. Sitios NUEVOS (9) — verdictos

### 3.1 `components/layout/IndicePagina.tsx` (archivo entero nuevo en gar, 372 líneas)

Índice lateral de la página: columna de marquitas fijas a la derecha con imán de hover, capa hermana de píldoras con los rótulos, y botón de "volver arriba" para mobile. Son dos capas fijas hermanas porque `mix-blend-difference` tiene que vivir en el propio elemento fijo.

**`IndicePagina.tsx:69` — `export function IndicePagina()` — TRUE POSITIVE (alta) — no-giant-component.**
Mecanismo: el cuerpo va de 69 a 372, 304 líneas, apenas por encima del umbral de 300.
Fix mínimo que preserva comportamiento: extraer la lógica del imán (los cinco `quickTo` de `Animadores`, `cercania`, `aplicar`, `entrar`, `salir`, `filaDesde`, los temporizadores) a un `useImanIndice(items, reduced)` en `src/lib/hooks/`, dejando en el componente los tres bloques de JSX. Son ~120 líneas de lógica sin JSX, corte natural. Alternativa más chica: sacar el botón mobile de "volver arriba" (últimas ~18 líneas) a un `BotonSubir`, que ya no comparte nada con el resto.
Riesgo: bajo para la extracción del botón; medio para el hook, porque `aplicar` cierra sobre `items`, `esActiva` y `setCerca` — el hook tendría que recibir `items` y devolver `cerca`.

**`IndicePagina.tsx:181` — `const ir = (it: Item) => …` — TRUE POSITIVE (alta) — prefer-module-scope-pure-function.**

```
const ir = (it: Item) => (it.id === null ? irArriba() : irASeccion(it.id));
```

Mecanismo: no toca estado local, solo dos imports de módulo, y se reconstruye en cada render.
Fix mínimo: moverla arriba del componente, junto a `cercania`. Cambio de una línea.
Riesgo: nulo.

**`IndicePagina.tsx:335` — el `<span>` de la píldora — FALSE POSITIVE (alta) — click-events-have-key-events + no-static-element-interactions (dos diagnostics sobre el mismo elemento).**
Mecanismo: la capa de píldoras es un `<div aria-hidden="true">` y cada rótulo es un `<span onClick>`. La regla ve un elemento estático con `onClick`, sin `role` ni handler de teclado. Pero el equivalente accesible existe: la capa de marcas es un `<nav aria-label>` con un `<button type="button" aria-label>` y `aria-current` por fila, en la misma grilla y con el mismo `onClick`. Las píldoras son puro afordance de mouse sobre una capa que el lector de pantalla no ve.
Fix mínimo para silenciarlo sin cambiar la experiencia: cambiar el `<span>` por `<button type="button" tabIndex={-1}>` con las mismas clases. Dentro de un contenedor `aria-hidden` no suma anuncio, `tabIndex={-1}` evita un segundo tab-stop por fila, y el `<button>` deja de ser elemento estático y trae activación por teclado implícita. Cuidado con el reset del user-agent: hay que conservar `cursor-pointer`, la alineación del texto y que no aparezcan borde ni fondo propios.
Riesgo: bajo. Verificar que `pildoras.current[i]` siga apuntando al elemento que GSAP anima (`x`, `opacity`, `scale`) — el tipo del ref pasa de `HTMLSpanElement` a `HTMLButtonElement`.

### 3.2 `features/investigacion/casos/CarpetaCaso.tsx` (436 líneas; en main eran 300)

**`CarpetaCaso.tsx:112` — `export function CarpetaCaso({…})` — TRUE POSITIVE (alta) — no-giant-component.**
Mecanismo: en main el componente empezaba en 71 y el archivo terminaba en 300 (≈230 líneas de cuerpo). gar reescribió la carpeta: la tapa ahora cae en hover, hay dos botones hermanos (capa "abrir" en `absolute inset-0` + toggle del rótulo del eje), un acordeón de anticipación con estado, el faldón, los slivers y la hoja de relevo. El cuerpo quedó en 112–436, 325 líneas.
Fix mínimo: el árbol es una sola pieza de JSX plano con `useState` + `useId`; el corte natural es sacar la anatomía de la tapa (el bloque `data-carpeta-front`, líneas ~281–433) a un `<TapaCarpeta>` que reciba `caso`, `tinte`, `peso`, `esUltima`, `interactiva`, `desplegada`, `onToggle` e `idPanel`. Eso deja el padre en ~55 líneas y lleva el hijo a ~150.
Riesgo: medio. `coreografia.ts` toca esta anatomía por selectores de atributo (`[data-carpeta-front]`, `[data-carpeta-rotulos]`, `[data-carpeta-front-sombra]`, `[data-carpeta-tab]`, `[data-carpeta-sheet]`, …) desde el `<li>` hacia abajo, así que mientras el DOM resultante sea idéntico la coreografía no se entera. Hay que verificar que el `group` de Tailwind siga siendo el mismo ancestro: el hover de la tapa depende de `group-hover` y el `group` vive en `[data-carpeta-cuerpo]`, que quedaría en el padre.

**`CarpetaCaso.tsx:112` — no-high-complexity-react-function — TRUE POSITIVE mecánico / BAJO VALOR (alta).**
Mensaje: complejidad ciclomática 16, cognitiva 15, **anidamiento máximo 1**.
Mecanismo: el anidamiento 1 es la pista — no hay lógica ramificada, la complejidad es toda condicional de presentación. Contando: `PESO_TAPA[indice] ??`, `OFFSET_PESTANA[indice] ??`, `PAPELES[indice]?.map`, `esUltima ? … : …` (×2), `!esUltima &&`, `esUltima &&`, `interactiva ? … : …` (×2), `interactiva &&` (×2), `desplegada ? … : …` (×4), `caso.esDemo &&`. Ninguna decide flujo; todas eligen una clase de Tailwind o un pedazo de copy.
Fix mínimo: es el mismo fix que el gigante. Sacar `<TapaCarpeta>` se lleva la mayoría de los ternarios y las dos métricas bajan juntas. No hace falta un arreglo propio.
Riesgo: el mismo del split anterior.

### 3.3 `features/quienes-somos/components/TeamProfileOverlay.tsx`

**`TeamProfileOverlay.tsx:503` — `<img alt="" className="h-full w-full object-cover" />` — FALSE POSITIVE (alta) — no-broken-image-source + nextjs-no-img-element (dos diagnostics sobre el mismo elemento).**
Mecanismo: es el clon animado de la foto de la card. El `src` se asigna imperativamente en la fase de layout (línea 204: `imgViajera.src = originImg.currentSrc || originImg.src`), copiando la imagen que la card YA descargó y decodificó — precisamente para que el viaje no dispare una segunda descarga. Nunca se ve roto: el elemento solo se monta si `fotoViaja` es true, su contenedor arranca con `invisible`, y `fotoViaja` es false en reduced-motion y por debajo de 64rem. Ya hay un `eslint-disable-next-line @next/next/no-img-element` con la justificación escrita.
Fix mínimo: ninguno de comportamiento. Si la lane necesita el número en cero, el camino honesto es un supresor a nivel react-doctor con el mismo comentario, no un `next/image` — que no permite asignar `src` desde otro `<img>` ya cargado ni saltearse el pipeline de optimización, que es justo lo que acá se busca evitar.
Riesgo: nulo si se suprime; alto si alguien lo "arregla" con `next/image`, porque rompe el punto del clon.

**`TeamProfileOverlay.tsx:500` — `will-change-[left,top,width,height]` en la foto viajera — TRUE POSITIVE (media) — no-permanent-will-change.**
Mecanismo: la clase queda puesta todo el tiempo que el perfil está abierto, aunque el viaje dura `APERTURA` = 0.95 s. Peor: `left/top/width/height` son propiedades de layout, `will-change` no las puede promover a capa, así que el hint no compra nada y sí reserva memoria.
Fix mínimo: sacar la clase. Si se quiere conservar la intención, ponerla desde GSAP (`gsap.set(viajera, { willChange: "left,top,width,height" })` al arrancar el viaje y `clearProps` en su `onComplete`), pero medir antes: es probable que no cambie nada.
Riesgo: bajo. El arreglo de fondo — animar con `transform` en vez de `left/top/width/height` — es una reescritura del viaje y no entra en "behavior-preserving".

**`TeamProfileOverlay.tsx:550` — `will-change-transform` en `heroRef` — TRUE POSITIVE (alta) — no-permanent-will-change.**
Mecanismo: el retrato del modo SHELL sí anima `transform` (FLIP de ida en 215–224 y 309, de vuelta en el timeline de cierre), pero la clase queda permanente durante toda la vida del overlay, incluida la lectura estática entre apertura y cierre.
Fix mínimo: pasar el hint a GSAP: `gsap.set(hero, { willChange: "transform" })` justo antes del tween de entrada, `clearProps` en su `onComplete`, y volver a ponerlo al armar el timeline de cierre.
Riesgo: bajo, pero medir: quitar el hint durante el reposo puede meter un frame de promoción al arrancar el cierre. Es el caso donde el hint tiene sentido, solo que acotado.

---

## 4. Sitios que solo CAMBIARON DE RENGLÓN (51)

Mismo archivo, misma regla, línea nueva. Para actualizar el plan sin re-relevar.

**no-permanent-will-change (18)**

- `biblioteca/components/DestacadosBiblioteca.tsx` 230 → **235**
- `contacto/components/ContactoExperiencia.tsx` 670 → **700**
- `home/components/ComoTrabajamos.tsx` 271 → **274**
- `home/components/HeroQuienes.tsx` 257 → **262**
- `investigacion/casos/ExpedienteCaso.tsx` 439 → **459**
- `investigacion/components/CartaAbierta.tsx` 274 → **275**
- `que-hacemos/components/CaminoDeTrabajo.tsx` 201 → **206**
- `que-hacemos/components/EnfoqueTransformacion.tsx` 159 → **164**
- `que-hacemos/components/FaroEscena.tsx` 524 → **539**, 530 → **545**, 543 → **558**, 548 → **563**
- `quienes-somos/components/MiradaEd.tsx` 660 → **661**, 798 → **799**
- `quienes-somos/components/OrigenEd.tsx` 572 → **573**, 582 → **583**, 588 → **589**, 630 → **631**
- `quienes-somos/components/TeamProfileOverlay.tsx` 300 → **500**

**no-transition-all (8)**

- `contacto/components/ContactoExperiencia.tsx` 817 → **847**, 850 → **880**, 1013 → **1040**
- `home/components/BibliotecaNovedades.tsx` 100 → **102**, 165 → **167**
- `home/components/ComoTrabajamos.tsx` 366 → **369**
- `home/components/LineasAccion.tsx` 421 → **392**
- `investigacion/casos/NavegacionCasos.tsx` 58 → **92**

**nextjs-no-img-element (8)**

- `components/layout/Footer.tsx` 175 → **162**
- `home/components/DatosDuros.tsx` 135 → **123**
- `quienes-somos/components/profile/ImmersiveProfile.tsx` 476 → **489**, 486 → **499**, 609 → **624**, 619 → **634**, 788 → **803**, 797 → **812**

**no-giant-component (5)**

- `contacto/components/ContactoExperiencia.tsx` 125 → **126**
- `home/components/ComoTrabajamos.tsx` 80 → **81**
- `investigacion/casos/CasosInvestigacion.tsx` 40 → **41**
- `investigacion/casos/ExpedienteCaso.tsx` 85 → **88**
- `quienes-somos/components/TeamProfileOverlay.tsx` 33 → **78**

**only-export-components (3)** — los tres en `que-hacemos/components/FaroEscena.tsx`: 52 → **56**, 62 → **66**, 117 → **121** (solo creció el comentario de cabecera).

**no-array-index-as-key (2)**

- `quienes-somos/components/OrigenEd.tsx` 884 → **885**
- `quienes-somos/components/profile/ImmersiveProfile.tsx` 681 → **696**

**prefer-use-effect-event (2)** — los dos en `investigacion/casos/CasosInvestigacion.tsx`: 280 → **315**, 295 → **330**.

**prefer-html-dialog (2)**

- `components/layout/MobileNav.tsx` 174 → **184**
- `quienes-somos/components/TeamProfileOverlay.tsx` 258 → **475**

**Uno cada uno**

- `biblioteca/components/CategoriasRail.tsx` prefer-module-scope-pure-function 68 → **70**
- `quienes-somos/components/profile/ImmersiveProfile.tsx` js-combine-iterations 124 → **130**

---

## 5. `TeamProfileOverlay.tsx` en su estado actual (para el split y la migración a `<dialog>`)

### 5.1 Tamaño y mapa

| | main | gar |
|---|---|---|
| líneas del archivo | 348 | **598** |
| cuerpo del componente | 33–348 (316) | **78–598 (521)** |
| helpers de módulo | 0 | **4** |

Módulo (1–76): constantes de tiempo `APERTURA` 0.95, `CIERRE` 0.55, `PAUSA_APOYO` 0.15, `LLEGADA_FOTO` 1.10, `ESPERA_IMAGEN` 300 ms, `DISOLUCION_FONDO` 0.65, `EASE_VIAJE` `"power3.inOut"`; y las funciones puras `mascara(r)` (50–52), `coverEn(box,iw,ih,pos)` (55–61), `clipDe(r)` (66–68), `paresDe(originEl)` (71–76).

Cuerpo (78–598):

| tramo | líneas | qué |
|---|---|---|
| hooks y derivados | 87–95 | `useReducedMotion`, `useMediaQuery("(min-width: 64rem)")`, `useCopiar()`, `immersive`, `desktopChoreo`, `staticProfile` |
| estado | 96–98 | `useState` con inicializador perezoso: el `<div>` contenedor del portal |
| refs | 99–108 | `rootRef`, `backdropRef`, `heroRef`, `contentRef`, `backRef`, `copiarRef`, `patronRef`, `inmersivoRef`, `viajeraRef`, `closingRef` (10) |
| derivado en render | 112 | `fotoViaja = immersive && !staticProfile && !!originEl?.querySelector("img")` — **lee el DOM en render** |
| lock | 114 | `useLockScroll(true)` |
| portal + inert + entrada | **120–378** (259) | un solo `useIsomorphicLayoutEffect`, deps `[container, originEl, reduced, immersive]` |
| cierre | **381–437** (57) | `requestClose` en `useCallback`, deps `[originEl, onClose, reduced, immersive]` |
| teclado | **440–470** (31) | `useEffect` con listener en `window`: ESC + trampa de Tab |
| render | 472–598 (127) | `createPortal` |

Cinco responsabilidades en un archivo, sí, pero **una sola ocupa la mitad**: el efecto 120–378.

### 5.2 Qué agregó gar

- **La card se convierte en el perfil.** Es lo nuevo grande. En main el inmersivo entraba con un fade y el FLIP de la figura lo hacía `ImmersiveProfile` por su cuenta. Ahora el overlay lleva una **foto viajera** (`viajeraRef`, un `<div>` fijo con un `<img>` clonado) que arranca exactamente sobre la foto de la card, viaja hasta el recuadro de la figura del perfil, se apoya, espera `PAUSA_APOYO` y recién ahí se funde en la figura. `ImmersiveProfile` recibe el prop nuevo `figuraDesdeCard` para no hacer su propio FLIP cuando el overlay se encarga.
- **El lienzo nace de la card.** El backdrop entra con `clip-path: inset(...) round 1.5rem` sobre el rectángulo de la card y se abre a pantalla completa; al cerrar se contrae al mismo rectángulo.
- **Las otras cards se alejan.** `paresDe()` busca los `[data-reveal]` hermanos dentro de `#equipo` y los lleva a `opacity .4 / scale .98` mientras el perfil está abierto. Viven FUERA del portal, así que no entran en el `gsap.context` y se restauran a mano en el cleanup.
- **Botón "Copiar link"** (`copiarRef`, `useCopiar`), que copia `${origin}/quienes-somos?persona=${persona.key}`.
- **Restauración determinística del scroll**: `savedY` capturado antes de todo, `getLenis()?.stop()` a la entrada y, en el cleanup, `window.scrollTo` + `lenis.scrollTo(immediate, force)` + `lenis.start()` + tres re-aserciones (`rAF`, `rAF+1`, `setTimeout 180`), porque el `ResizeObserver` del provider y `ScrollTrigger.refresh()` hacían derivar la página.
- **Trampa de Tab más fina**: filtra los focusables por visibilidad real (`offsetParent !== null || getClientRects().length > 0`), porque en el inmersivo el botón de cierre puede estar todavía oculto por el revelado.
- **`data-portrait-outer` / `data-portrait-mover`**: atributos nuevos en `ImmersiveProfile` para que el overlay pueda medir el destino del viaje.

### 5.3 Variantes de entrada y qué miden

Tres, decididas por `reduced`, `immersive` y `fotoViaja`.

1. **Reduced motion** (344–346): `gsap.set(root, { autoAlpha: 1 })` y nada más. No mide nada.
2. **Viaje de la foto** (inmersivo + desktop; `viaja` en 185): mide `originEl.getBoundingClientRect()` (el lienzo), `originEl.querySelector("img").getBoundingClientRect()` (el origen de la foto) y, con `medirDestino()` (167–184), el `getBoundingClientRect()` de la `<img>` de la figura del perfil. La medición del destino es diferida: dos `requestAnimationFrame` anidados y, si `imgFigura` todavía no cargó, espera su `load` con techo de `ESPERA_IMAGEN` (300 ms). Los dos rAF son deliberados: el montaje del perfil traba el primer frame y `lagSmoothing(0)` de Lenis haría que los tweens salten al final.
3. **FLIP del hero** (modo shell; `heroFlip` en 192): mide la foto de la card y `heroRef.getBoundingClientRect()`, y setea `x/y/scaleX/scaleY` con `transformOrigin: "top left"` (215–224), animando de vuelta a cero en 309. Las líneas de texto de `contentRef` entran escalonadas desde la izquierda.

Fallback (300–305): si no hay destino medible, la figura se revela con un fade, para que no quede escondida — `ImmersiveProfile` la dejó en `autoAlpha: 0` esperando a este overlay.

**Salida** (381–437), timeline única con `onComplete: finish` (`const finish = () => onClose()`, línea 384):

- Reduced o sin root: `finish()` inmediato.
- Los pares vuelven a `opacity 1 / scale 1`; los dos botones fijos salen; el patrón sale.
- Inmersivo: `inmersivoRef` a `autoAlpha 0`. **La foto NO viaja de vuelta.** El morph de retorno lo hace el `clip-path` del backdrop contrayéndose a `clipDe(from)`, más el fade del contenido.
- Shell: el hero FLIPea de vuelta midiendo `originImg` y `hero` en ese momento (no reusa la medición de entrada), y `contentRef` sale.
- `closingRef` evita el doble cierre.

Asimetría a tener presente: "vuelve al cerrar" es literal en el shell y aproximado en el inmersivo.

### 5.4 Lock de scroll, foco, inert

- **Lock**: `useLockScroll(true)` en 114 — el hook pone `document.body.style.overflow = "hidden"` con contador de consumidores a nivel de módulo, compartido con `MobileNav` e `IntroGate`.
- **Acoplamiento oculto e importante**: `IndicePagina.tsx:96-99` detecta que hay un overlay leyendo `document.documentElement.style.overflow === "hidden" || document.body.style.overflow === "hidden"`, y además observa esos dos `style` con un `MutationObserver` para enterarse. Si el split o la migración a `<dialog>` cambian **cómo** se bloquea el scroll, el índice lateral deja de esconderse sobre el perfil abierto. Hay que conservar `useLockScroll` tal cual, aunque `<dialog>` haga la página inerte por su cuenta.
- **Foco**: `backRef.current?.focus()` en 138, después de `gsap.set(root, { autoAlpha: 1 })` — el comentario avisa que `visibility: hidden` impide enfocar. Restauración en el cleanup con `originEl?.focus({ preventScroll: true })`, **después** de quitar `inert` (un elemento inert no puede recibir foco).
- **inert**: bucle manual sobre `document.body.children` salvo el container, poniendo `aria-hidden="true"` + `inert`; se revierte en el cleanup.
- **Teclado**: listener en `window`. ESC hace `preventDefault()` + `requestClose()`. Tab: recolecta `button, a[href], [tabindex]:not([tabindex="-1"])` dentro de `rootRef`, filtra por visibilidad real y cicla.

### 5.5 Qué hace el split MÁS FÁCIL de lo que asumía el relevamiento anterior

**Hay código muerto, y no es poco.** gar pasó a Daniela de `figura: "recorte"` a `figura: "marco"` (decisión de ED del 2026-09-08). Hoy **ninguna** de las 12 personas con perfil usa `"recorte"`: 11 son `"marco"` y 1 es `"sin"`. Y `cutoutCrop`, el campo nuevo del tipo `Profile`, **no tiene ni un solo valor en `equipo.ts`**: solo existe la declaración del tipo en la línea 158 y la lectura en `TeamProfileOverlay.tsx:189`.

Por lo tanto, en el estado actual del repo:

- `crop` (189) es siempre `undefined`;
- `alineable` (190) es siempre `false`;
- la rama de reencuadre alineado al píxel (209–212 y 262–298), con el velo de máscara radial, está **muerta**;
- `mascara()` (50–52), `coverEn()` (55–61) y `DISOLUCION_FONDO` (46) **no se usan**;
- la rama `figura === "recorte"` de `medirDestino()` (172–183) tampoco se alcanza.

Son ~60 líneas, y son justamente las más densas del efecto. Borrarlas antes del split baja el gigante y la complejidad sin tocar nada que se vea. **Recomendación: hacerlo como primer paso, en su propio commit, y decidir explícitamente si `cutoutCrop` se borra del tipo o se deja documentado como preparado-pero-sin-datos.**

Además:

- **`closingRef` ya existe**, así que `close()` en el `onComplete` no necesita guarda nueva.
- **`finish` es un solo punto** (línea 384): meter `dialogRef.current?.close()` ahí cubre las dos variantes y el camino reduced.
- **El `<img>` de la foto viajera ya tiene su `eslint-disable` con justificación escrita**: el split no tiene que re-argumentarlo.

### 5.6 Qué lo hace MÁS DIFÍCIL

- **El cleanup del efecto grande hace seis cosas en un orden que importa** (348–377): `ctx.revert()` → restaurar `pares` → quitar `aria-hidden`/`inert` → sacar el container del body → **devolver el foco** → restaurar el scroll con tres re-aserciones. El comentario del código dice explícitamente que el foco va después de quitar `inert`. Si `usePortalModal` se queda con portal + lock + scroll y `coreografia-overlay.ts` con el `gsap.context`, esas dos limpiezas quedan en hooks distintos y React las corre en el orden de declaración de los efectos, no en el orden actual. **El plan tiene que fijar que el hook del portal se declare primero y que foco e inert viajen juntos en el mismo hook.**
- **`fotoViaja` se calcula en render leyendo el DOM** (`originEl?.querySelector("img")`, línea 112) porque `ImmersiveProfile` lo necesita como prop. No es puro y no se puede mover a un efecto sin cambiar el primer render de `ImmersiveProfile`.
- **`ImmersiveProfile` busca su scroller con `closest("[data-profile-scroller]")`** (línea 143) y el overlay pone ese atributo en su root (478). El `<dialog>` tiene que ser **el mismo elemento** que lleva `data-profile-scroller`, `data-lenis-prevent`, `overflow-y-auto` y `overscroll-contain`.
- **`showModal()` y los hijos `fixed`**: el backdrop, la foto viajera, los dos botones y la capa de retrato de `ImmersiveProfile` son todos `position: fixed` contra el viewport. Un `<dialog>` no crea bloque contenedor para `fixed`, pero **cualquier `transform`, `filter`, `perspective`, `contain` o `will-change` sobre el `<dialog>` sí lo crearía** y les rompería el posicionamiento a todos. Hoy el root solo recibe `autoAlpha` (opacity + visibility), que es seguro, pero es una restricción a escribir en el plan.
- **Doble cierre con ESC**: el listener de `window` intercepta ESC hoy. Con `showModal()` el navegador dispara `cancel` y cierra por su cuenta. Si se dejan los dos, `requestClose()` corre dos veces (lo tapa `closingRef`, pero además el `preventDefault()` sobre el `keydown` de `window` puede impedir que llegue el `cancel`). **Al migrar hay que sacar la rama ESC del listener de `window` en el mismo commit que agrega `oncancel`, ni antes ni después.**
- **`showModal()` mueve el foco por su cuenta** (al primer focusable o al `autofocus`). El `backRef.current?.focus()` de la línea 138 tiene que quedar **después** de `showModal()`, o hay que poner `autoFocus` en el botón "Volver al equipo".
- **`useFocusTrap.ts` va a quedar sin consumidor real** después de la migración: la trampa de Tab la reemplaza `showModal()` entera, igual que el bucle de `inert`. Si el paso (a) lo extrae y el paso (b) lo borra, conviene decidir de entrada si vale la pena crearlo o si se salta directo al `<dialog>`.
- **`data-scroll-principal` está en `ExpedienteCaso` y NO en `TeamProfileOverlay`.** El `Header` usa ese atributo (líneas 212 y 219) para seguir el scroll de la capa a pantalla completa en vez del de la ventana. Si el split saca un `usePortalModal` compartido entre los dos lugares, hay que decidir a propósito si el perfil también lo lleva; hoy no lo lleva.
- **Inconsistencia latente en `figura`**: `ImmersiveProfile.tsx:133` resuelve el default con `profile.figura ?? "recorte"`, mientras que `TeamProfileOverlay.tsx:189` compara con `=== "recorte"` sin aplicar ese default. Un perfil nuevo sin `figura` explícita se renderizaría como recorte y tomaría la rama de no-recorte en el overlay. Hoy no pasa porque las 12 fichas declaran `figura`, pero si el split toca esa línea conviene alinear los dos lados.

### 5.7 `ImmersiveProfile`, `PersonCard` e `ImpulsanEd` en la coreografía

**`ImmersiveProfile.tsx` — SÍ, ahora participa (+23/−7).**

- Prop nuevo `figuraDesdeCard = true`. Con `false` (que es lo que manda el overlay cuando la foto viaja) el componente **no hace su propio FLIP**: `portraitOuterRef` queda visible (`autoAlpha: 1`, porque el tween scrubbeado de scroll lo gobierna) y es `portraitMoverRef` el que arranca en `autoAlpha: 0`, esperando que el overlay lo revele. Con `true` conserva el FLIP de main.
- Atributos nuevos `data-portrait-outer` y `data-portrait-mover` en el `<div>` fijo del retrato: son los ganchos que el overlay usa para medir el destino del viaje. **Refs compartidos no hay; el contrato es por atributo de datos.**
- `cardImg` pasa a ser `figuraDesdeCard ? originEl?.querySelector("img") : null`, y `figuraDesdeCard` entra en las deps del efecto.

**`PersonCard.tsx` — SÍ, participa, del lado de la precarga (+22/−8).**

- Nuevo `precargarPerfil(persona)` a nivel de módulo, con un `Set` de ya-precargadas: en `onPointerEnter` y en `onFocus` dispara `new window.Image()` sobre `persona.profile?.cutout`. El comentario lo dice: es para que al abrir el overlay pueda medir el recuadro real de la figura. O sea, existe para que el techo de `ESPERA_IMAGEN` (300 ms) casi nunca se toque.
- El resto es responsive (aspect `3/5` en mobile para tiers 3 y 4, `line-clamp-3`).

**`ImpulsanEd.tsx` — SÍ, pero en el enrutado, no en la coreografía (+88/−36).**

- La sección ahora lleva `id="equipo"` + `data-indice="El equipo"`. **`id="equipo"` es lo que hace funcionar a `paresDe()`**, que busca `originEl.closest("#equipo")`. Antes de gar ese id no estaba: `paresDe` es código nuevo que depende de un id nuevo.
- Deep link: `openProfile` hace `history.replaceState` a `?persona=<key>`, `closeProfile` lo limpia, y un efecto de montaje lee `?persona=`, busca `[data-persona-key]`, llama `irAElemento(el, true)` para centrar la card y abre el perfil 400 ms después.
- Layout del masthead reordenado: Daniela al centro, las dos direcciones flanqueándola a la misma altura.

**`equipo.ts` (+262/−6)** — lo que ganó el dato:

- Campo nuevo `Profile.cutoutCrop?: { x, y, w, h }` — **declarado y sin ningún valor** (ver 5.5).
- Daniela pasa de `figura: "recorte"` + `daniela-reyes-cutout.webp` a `figura: "marco"` + `daniela-reyes.jpg`.
- Perfil completo nuevo para **Pedro Vidal-Szabó** (antes solo ficha corta), más sus `pubs` y la corrección del apellido con tilde. Perfiles: 11 → **12** sobre 15 personas. Sin perfil quedan `ivan-perez`, `gabriela-buendia` y `marcela-cano`.
- **No hay** ids nuevos, ni slugs, ni dimensiones de imagen. La clave de ruteo sigue siendo `persona.key`, que usan `?persona=` y `[data-persona-key]`.
- Nota de mantenimiento: el comentario de cabecera de `TeamProfileOverlay` (línea 26) todavía dice "las 11 personas sin recorrido desarrollado". Son 3.

---

## 6. Qué cambió gar en los archivos del paso 4

**`investigacion/casos/CasosInvestigacion.tsx` (+42/−6)** — `abrir(i, desdeUrl = false)`: con `desdeUrl` no se hace `pushState`, porque la URL ya trae el hash. `cerrar` limpia el hash con `replaceState` cuando la entrada no era propia. Efecto de montaje nuevo que lee `location.hash`, busca el caso por `slug`, centra el botón con `irAElemento` y abre 500 ms después; usa un `abrirRef` actualizado en un efecto sin deps para no atar el montaje a la identidad de `abrir`. La sección suma `data-indice="Casos"`. Los dos `prefer-use-effect-event` corrieron a 315 y 330 por ese bloque. **El split no puede sacar `abrir` de donde está sin mantener el `abrirRef`**, y el gigante de este archivo ahora incluye ese efecto de deep link.

**`investigacion/casos/ExpedienteCaso.tsx` (+24/−4)** — el lugar suma `data-scroll-principal`: el `Header` sigue ESTE scroll y no el de la ventana, que queda congelada debajo. Botón nuevo "COPIAR LINK" con `useCopiar`, que copia `${origin}/investigacion#${caso.slug}`. La pestaña de la carcasa gana `data-exp-pestana`, que la coreografía mide como destino de la pestaña del índice. **El split debe conservar los tres atributos de datos y no mover el `useCopiar` fuera del componente**, porque `copiado` gobierna el rótulo del botón.

**`investigacion/casos/NavegacionCasos.tsx`** — rediseño completo: de pila vertical con CTA grande a **una fila en píldora** (volver a la izquierda, selector numérico al medio solo por debajo de `lg`, siguiente a la derecha). La anticipación del próximo caso dejó de imprimirse y viaja en el `title`. El `no-transition-all` que estaba en 58 está ahora en 92, en el botón naranja. **El plan no debería tocar la forma: es una decisión de diseño de gar alineada con la píldora de `TeamProfileOverlay`.**

**`que-hacemos/components/FaroEscena.tsx` (+20/−5)** — solo el SVG del faro: de tres franjas azules a **dos**, más dos ojos de buey apagados, más juntas de sillería reacomodadas, para tomar el ritmo del isotipo (decisión de ED del 2026-09-08). Los cuatro `no-permanent-will-change` y los tres `only-export-components` solo corrieron de renglón. **Nada estructural, pero los números de línea del plan viejo están corridos ~4 arriba y ~15 abajo.**

**`components/layout/Footer.tsx` (+29/−42)** — la lista `ALIADOS` se fue a `@/config/aliados`, compartida con `DatosDuros`, con alturas por contexto (`alto.pie` acá, `alto.home` allá). Las redes ahora se filtran: sin URL confirmada el ícono no se renderiza, y si ninguna tiene URL desaparece la `<ul>` entera. El área táctil de los íconos creció con `-m-2.5 p-2.5`. El `nextjs-no-img-element` bajó de 175 a 162. **Cualquier split debe importar de `@/config/aliados`, no re-declarar la lista.**

**`home/components/DatosDuros.tsx` (+6/−18)** — el mismo movimiento de `ALIADOS` a `@/config/aliados`, usando `a.alto.home`. La sección suma `id="en-numeros"` + `data-indice="En números"`. El `nextjs-no-img-element` bajó de 135 a 123. **La duplicación que el relevamiento viejo señalaba entre Footer y DatosDuros ya está resuelta.**

**`contacto/components/ContactoExperiencia.tsx` (+44/−20)** — estado nuevo `mensajeListo` con el texto que armó el formulario, para poder copiarlo si el `mailto:` no abrió. Componente nuevo `CanalDirecto` (archivo aparte, 89 líneas) que reemplaza los dos `<a href="mailto:">` sueltos, en la apertura y en el cierre. Efecto de montaje nuevo que lee `?tema=` y aterriza directo en el formulario, matando la intro con `introTl.current?.kill()` y `desarmeTl.current?.kill()`; lleva un `eslint-disable react-hooks/exhaustive-deps` explícito. El resto son retoques responsive. **El split tiene que respetar que ese efecto corre un frame después del montaje y llama `finIntro()`: moverlo antes rompe la intro.**

---

## 7. Recomendaciones para el plan

1. **Antes de cualquier split de `TeamProfileOverlay`, borrar el camino de `figura: "recorte"`** (§5.5): ~60 líneas muertas, en su propio commit, y decidir qué pasa con `cutoutCrop`. Es el cambio con mejor relación resultado/riesgo de toda la lane.
2. **Reconsiderar `useFocusTrap.ts`** como paso intermedio: si el paso (b) migra a `<dialog>`, ese hook y el bucle de `inert` nacen para morir.
3. **Escribir como restricción del plan** que el `<dialog>` no puede recibir `transform`, `filter` ni `will-change`, y que tiene que llevar él mismo `data-profile-scroller`, `data-lenis-prevent`, `overflow-y-auto` y `overscroll-contain`.
4. **Escribir como restricción** que `useLockScroll` se conserva aunque `<dialog>` haga la página inerte, porque `IndicePagina` detecta los overlays leyendo `body.style.overflow`.
5. **Un solo commit** para "sacar la rama ESC del `window` + agregar `oncancel`".
6. **Contar `no-transition-all` con grep además de con react-doctor** (§2): la regla no ve los `className` template literal, y hay dos sitios reales que el reporte ya no muestra.
7. Sacar `LineasAccion` de la lista de gigantes y agregar `IndicePagina` y `CarpetaCaso`.
