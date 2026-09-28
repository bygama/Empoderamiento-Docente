# Auditoría responsive · secciones restantes (celular y tablet)

- **Rama:** `feat/mobile-tablet-secciones-restantes`, creada desde `feat/que-hacemos-movil` @ `c198b3b` (contiene `main` `d452e61` completo más los 38 commits de la etapa móvil ya aprobada). Repo limpio al crearla; sin stash ni cambios ajenos tocados.
- **Fecha:** 2026-09-26. **Estado:** auditoría (fase 0 + fase 1). Sin código de producción escrito.
- **Regla madre:** computadora (≥ 1024 px, `lg`) congelada; Inicio y Qué hacemos intactas en todo dispositivo. Todo cambio nuevo va bajo `max-lg:` / `max-md:` o `gsap.matchMedia("(max-width: 63.999rem)")`, y nunca en la capa compartida.

---

## 0. Línea base (fase 0)

**Stack verificado.** Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 (tema en `apps/sitio/src/app/globals.css`, **sin `--breakpoint-*` propios** → valen los de Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280) + GSAP 3/ScrollTrigger + Lenis + Zod. Payload/Neon solo para `/admin` (fuera de alcance). **No hay tests automatizados** en el repo (sin `*.test`/`*.spec` ni carpeta `tests`): el gate es typecheck + lint + react-doctor + build.

**Breakpoints reales en uso.** Los `.tsx` usan `md:` y `lg:` mobile-first; las páginas ya adaptadas usan `max-lg:`/`max-md:` y `gsap.matchMedia` con `(max-width: 63.999rem)`, `(min-height: 38.75rem)` y `(hover: hover) and (min-width: 1024px)`. `globals.css` tiene medias en 48rem, 64rem, 63.999rem, 640px, 1024px y por altura (43.75rem, 54.5rem). Convención de este trabajo: **celular < 768**, **tablet 768–1023 (táctil)**, **computadora ≥ 1024**.

**Gate antes de tocar nada** (sobre `c198b3b`; log en `restantes/fase0-gate.log` del scratchpad):

| Paso | Resultado |
| --- | --- |
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0 |
| `react-doctor` | 100 / 100, 334 archivos, sin hallazgos |
| `pnpm build` | exit 0, 17 páginas estáticas generadas |

**Errores preexistentes registrados** (no son de este trabajo):
1. `/novedades/[slug]` emite un warning de consola por un `<link rel="preload">` de imagen no usada (`/quienes-somos/origen-03-pregunta.webp`, `w=384`). Aparece en 320, 390 y 1024.
2. La página 404 registra su propio 404 en red (esperado).
3. Nada más: consola limpia en las otras 8 rutas × 11 viewports.

**Servidor.** Para capturas y comparaciones: `pnpm build` + `pnpm start` (config `prod` de `.claude/launch.json`, :3000), sin el badge de dev ni HMR. Para implementar: `dev`.

**Harness de verificación** (Playwright 1.61 + Chromium 1228 ya cacheado en la máquina; instalado **fuera del repo**; copia estable en `%LOCALAPPDATA%\Temp\edqa\restantes\pw`):
- `qa-base.mjs <base> <out> <rutas> <WxH[t],…>`: recorre cada ruta con scroll real en pasos de 0,85 pantallas (Lenis adopta el scroll nativo; ScrollTrigger se asienta en 1,1 s), y guarda por paso captura PNG, geometría (rect/opacidad de `header, footer, main > *, section, [id], [data-indice]`) y, al final, métricas: desborde horizontal (`scrollWidth` vs `innerWidth` + elementos que asoman), targets < 44 px, inputs < 16 px, textos recortados, `overflow-x` de html/body/main, errores de consola y de red. Sufijo `t` = táctil (`isMobile` + `hasTouch` → `hover: none`, `pointer: coarse`).
- `comparar.mjs <antes> <después>`: diff de píxeles (pixelmatch) y de geometría paso a paso; escribe los diffs en `_diff/`.
- `montaje.mjs`: hojas de contacto para revisar un recorrido en una sola imagen.
- **`webapp-testing` no está instalada** en este entorno (no existe en los plugins ni en las skills locales). Se informa y se usa Playwright directo. WebKit de Playwright no está cacheado (descarga de ~100 MB si se quiere una aproximación a Safari).

**Capturas de referencia tomadas** (carpeta `base/`, misma copia estable):

| Grupo | Rutas | Viewports |
| --- | --- | --- |
| Computadora (referencia congelada) | `/`, `/que-hacemos`, `/quienes-somos`, `/investigacion`, `/biblioteca`, `/novedades`, `/novedades/relime-2025`, `/contacto`, 404 | 1280×800, 1440×900, 1920×1080 |
| Protegidas en celular/tablet | `/`, `/que-hacemos` | 375×812t, 390×844t, 768×1024t, 1024×1366t |
| Incluidas (estado actual) | las 7 restantes | 320×568t, 390×844t, 768×1024t, 1024×1366t |

Resultado transversal: **ninguna ruta tiene scroll horizontal** en ningún viewport (`scrollWidth == innerWidth` en las 63 corridas). Los "elementos que asoman" que reporta el harness son decorativos con `overflow` recortado por su contenedor (glow del Origen, chars del estallido, capas del faro).

---

## 1. Alcance

**Incluidas (se adaptan):**

| Página | Ruta | Secciones (ids / `data-indice`) |
| --- | --- | --- |
| Quiénes somos | `/quienes-somos` | hero, `#origen` Origen, `#mirada` Nuestra mirada, `#equipo` El equipo (+ overlay de perfil) |
| Investigación | `/investigacion` | `#sentido` hero + historia, `#lineas` Líneas, `#ciclo` Ciclo de investigación aplicada, `#en-accion` Casos (+ expediente `#expediente-caso`), Cierre (`#biblioteca`, `#conversemos`) |
| Biblioteca | `/biblioteca` | hero (`#biblioteca-buscar`), `#destacados` Destacados, `#materiales` Catálogo, `#puente-investigacion` Investigación, cierre `#hablemos` |
| Novedades | `/novedades` | hero, `#destacado` Destacado, `#ultimas` Últimas (filtros + grilla + paginación), `#ed-en-movimiento`, `#recien-salido`, cierre `#hablemos` |
| Novedad (detalle) | `/novedades/[slug]` | ficha (meta, título, foto, cuerpo, guía), TransicionFaro |
| Contacto | `/contacto` | experiencia de una pantalla: hero → apertura → formulario → cierre |
| 404 | `not-found.tsx` + `[...resto]/page.tsx` | título, links, CTA |

**Excluidas y protegidas (solo referencia, no se tocan):** Inicio (`features/home/**`, `app/(sitio)/page.tsx`) y Qué hacemos (`features/que-hacemos/**`, `app/(sitio)/que-hacemos/page.tsx`).

**Compartidas (no se modifican en este trabajo):** `app/(sitio)/layout.tsx`, `components/layout/*` (Header, MobileNav/cortina, Footer, IndicePagina, BotonSubir, AterrizajePorLink), `components/providers/LenisProvider`, `components/ui/*` (ButtonPrimary, ButtonSecondary, RevealLines, Highlight, PuntosFaro, MathField, SplitChars, iconos), `components/brand/*`, `lib/**` (hooks, lenis, indice, navegar, viewport), `config/**`, y en `globals.css` el `@theme`, `body`, las reglas fuera de `@layer` (`.bg-grain-*`, `.card-elevated`, `.scrollbar-none`), `prefers-reduced-motion` y el footer-dock.

**Sin UI:** `vista-previa/*` (route handlers de draft mode) y `(payload)`.

---

## 2. Diagnóstico general

1. **Hay un primer nivel de fallback en casi todo.** Las coreografías de Investigación, Biblioteca (destacados, puente), Novedades (dolly, riel) y Mirada de Quiénes somos están detrás de `(hover: hover) and (min-width: 64rem)` (o 768 en el dolly): en celular y tablet **no existen** y queda contenido estático apilado. No se rompe nada grave, pero es la "versión de computadora apilada" que se quiere evitar: sin gesto, sin narrativa, con vacíos (hero de Investigación, cierre de Investigación) y con páginas largas (Biblioteca 20 pantallas en 390, 31 en 320).
2. **Dos secciones corren la coreografía de computadora en celular sin ningún gate:** Origen de Quiénes somos (pin de 560 svh con 5 beats superpuestos; textos que se pisan entre beats, cita recortada, hito «Hoy» cortado abajo en 320/375/390) y Contacto (una sola pantalla `h-[100svh] overflow-hidden` con paneles absolutos: el teclado virtual no tiene dónde empujar).
3. **La densidad no se reinterpretó:** el catálogo de Biblioteca pone el bloque completo de filtros (título, buscador, 3 grupos de píldoras) antes del primer resultado; los destacados de Biblioteca son 4 artículos largos con portada grande cada uno; los 8 pasos del Ciclo son texto corrido.
4. **Táctil:** píldoras de filtros 28–30 px, paginación 36 px, chips de novedades que hacen tres filas, hover como única pista en cards (Novedades, equipo, carpetas de casos), riel de lanzamientos sin ninguna affordance en celular, dos buscadores con fuente < 16 px (zoom en iOS).
5. **Tablet (768–1023) es hoy un celular ancho:** salvo el panel de fotos del Origen (`md:`) y algunas grillas `md:`, no hay decisiones propias.
6. **≥ 1024 táctil (iPad Pro vertical, iPad apaisado):** se ve la composición de computadora quieta (las coreografías piden `hover: hover`). Es exactamente lo que ya hacen Inicio y Qué hacemos; se propone dejarlo igual (ver §9).
7. **Capa compartida sana:** Header/cortina, Footer, BotonSubir (44 px) e IndicePagina (oculto < lg) ya son responsive y no necesitan cambios para este trabajo.

---

## 3. Problemas encontrados (con evidencia)

Notación: `[cap: viewport/página/pNN]` = captura del harness; `archivo:línea` = código.

### Quiénes somos
- **QS-1** Origen sin gate de viewport: `OrigenEd.tsx:58-63` monta `crearOrigen` salvo `reduced`; zona `h-[560svh]` + sticky `h-[100svh]` (`:84-85`). En 390 son 7 de las 19 pantallas de la página. [cap 390/quienes/p01–p06]
- **QS-2** Beats superpuestos (`position:absolute` por GSAP): la cita 3D queda recortada arriba («Estaba a punto de jubilarme» cortada) [cap 390/p02, 768/p02]; entre beat 2 y 3 los textos se pisan [cap 390/p04, 1024/p04].
- **QS-3** Estallido de chars: `x = sin(i·3.7)·190` (`timeline-origen.ts:31-44`) saca letras fuera de 390 px (harness: chars con `right` 478–523 px).
- **QS-4** Trayectoria vertical: el hito «Hoy» queda cortado por el borde inferior de la escena sticky en 320/375/390 [cap 390/p05, 320/p05].
- **QS-5** Transición Origen → Mirada: la lámina blanca de Mirada entra sobre el texto del remate [cap 390/p07].
- **QS-6** Mirada estática (gate hover+1024): correcta pero plana; las fichas quedan como píldoras sueltas en columna [cap 390/p08–p10].
- **QS-7** Equipo: grillas `grid-cols-2` fijas (`ImpulsanEd.tsx:377`) → cards de ~165 px en 390 y ~140 px en 320, nombre 1.18rem/rol 0.79rem; «Ver trayectoria» solo en hover (`labelAtRest:false` en N2–N4); país en 0.59rem. [cap 390/quienes/p12–p15]
- **QS-8** Overlay de perfil: `PerfilLineal` < 64rem (`TeamProfileOverlay.tsx:57`) — funciona; hay que verificar cierre ≥ 44 px, safe-area y liberación del scroll-lock (`useLockScroll`).

### Investigación
- **IN-1** Hero en celular: solo titular + 2 CTAs sobre `min-h-[100svh]`; linterna `hidden lg:block` (`InvestigacionHero.tsx:109`), «Seguí bajando» `hidden lg:block` (`:157`); media pantalla vacía [cap 390/investigacion/p00, 768/p00]. La historia de la constelación (4 beats) no existe fuera de lg.
- **IN-2** Líneas: 6 papeles en 1 columna (`lg:grid-cols-2`), 4 pantallas de tarjetas iguales; sin entrada de la carpeta [cap 390/p01–p05].
- **IN-3** Ciclo: `EspiralEstatica` = SVG de 420 px + 8 pasos como texto corrido (3 pantallas) [cap 390/p05–p08]; la espiral no acompaña la lectura.
- **IN-4** Casos: las carpetas se ven bien apiladas [cap 390/p09]; el rótulo desplegable depende de hover con delay (`CarpetaCaso.tsx:108`), el toggle por click sí funciona. Expediente: evidencias con `rotate` aplicado siempre en columna (`EvidenciasCaso.tsx:127`), pista «seguir leyendo» solo lg (`ExpedienteCaso.tsx:148`), pestañas laterales `hidden lg:flex`.
- **IN-5** Cierre: dos bloques de texto apilados sobre cielo vacío; nubes y faro `hidden lg:*` (`CierreInvestigacion.tsx:287,318`) [cap 390/p10–p11].
- **IN-6** SVGs de cielo con `viewBox 1440×900` + `slice`: en vertical recortan los costados (decorativo, no bloqueante).

### Biblioteca
- **BI-1** Inputs < 16 px: buscador del hero `text-[0.98rem]` (`BibliotecaHero.tsx:159`) y del catálogo `text-[0.95rem]` (`MaterialesListado.tsx:247`) → zoom automático en iOS. El harness los detecta en los 4 viewports táctiles.
- **BI-2** Catálogo: el `<aside>` de filtros va en flujo arriba de los resultados (`MaterialesListado.tsx:203,214`) — título + buscador + 3 grupos ≈ 1 pantalla antes del primer material [cap 390/biblioteca/p07]; cada fila ocupa ~1 pantalla (portada 16/9 a todo el ancho + texto) [cap 390/p08–p15]; página total 20 pantallas en 390 y 31 en 320.
- **BI-3** Píldoras de filtro `px-3 py-1.5 text-[0.82rem]` (`FiltroGrupo.tsx:96`) ≈ 30 px de alto; píldoras del riel del hero ≈ 40 px.
- **BI-4** Destacados: sin pin ni barrido bajo lg (`coreografia-destacados.ts:45`); 4 artículos con portada inline grande + texto largo (5 pantallas en 390, más en 320) [cap 390/p02–p06, 320/p03–p11].
- **BI-5** Puente: gate hover+1024 (`PuenteInvestigacion.tsx:125`) → 4 paneles quietos en 1 columna [cap 390/p16–p19].
- **BI-6** Hover como única pista en la flecha de acción de cada fila (`MaterialesListado.tsx:402`); menor.

### Novedades
- **NO-1** Destacada 2: en celular queda como fila con miniatura del 36 % (`NovedadDestacada.tsx:252`), ~130 px [cap 390/novedades/p01–p02].
- **NO-2** Filtros: 6 chips `flex-wrap` en 3 filas + contador (`FiltrosNovedades.tsx:178`) [cap 390/p02]; paginación `h-9 w-9` = 36 px (`PaginacionNovedades.tsx:21`).
- **NO-3** NovedadCard: elevación y zoom solo en `group-hover` (`NovedadCard.tsx:40-49`); sin feedback táctil.
- **NO-4** ED en movimiento: gate `(hover: hover) and (min-width: 768px)` (`EdEnMovimiento.tsx:71`) → en táctil, mosaico 2×3 quieto con `min-h-[70svh]` y **las frases centrales invisibles** (`:246`, `opacity:0`): contenido que se pierde [cap 390/p06–p07, 768/p04].
- **NO-5** Recién salido: riel nativo, flechas y píldora-cursor `hidden md:*`, velo `hidden md:block` (`LanzamientosRecientes.tsx:160,259,268`); sin pista de que se desliza salvo el 24 % de la siguiente card [cap 390/p07–p08].
- **NO-6** Detalle: la guía de la nota `hidden lg:block` (`FichaNovedad.tsx:167`) → sin navegación interna en celular/tablet [cap 390/novedad-detalle].
- **NO-7** Warning de preload preexistente (ver §0).

### Contacto
- **CO-1** Raíz `h-[100svh] overflow-hidden` con paneles `absolute` (`ContactoExperiencia.tsx:135,167`): con el teclado virtual abierto el panel del formulario se recorta y el botón de envío puede quedar debajo del teclado (svh no se recalcula en iOS).
- **CO-2** `PaisDropdown`: listbox `absolute top-[calc(100%+0.4rem)] max-h-80` (`PaisDropdown.tsx:154`) sin inversión → se corta contra el borde inferior cuando el campo está en la mitad baja.
- **CO-3** Viaje del título "fantasma" medido con `getBoundingClientRect` sobre `position: fixed` (`ghost-titulo.ts:14-16`) sin `gsap.matchMedia`: con la barra dinámica del navegador la medición puede desfasarse.
- **CO-4** Formulario: sin `inputmode`/`autocomplete` (`CamposContacto.tsx`); errores solo por validación nativa; `mailto:` sin confirmación (`coreografia-envio.ts:31`). Estos tres no cambian el diseño de computadora y se listan como mejoras opcionales.
- **CO-5** Estado actual en 320/390/768: la apertura entra (título, equipo, 5 temas, canal directo) y scrollea dentro del panel; visualmente correcta [cap 390/contacto/p00, 320/p00, 768/p00].

### 404
- **E-1** Correcta en 320/390/768 (título, texto, 6 links en 1 columna, CTA). Solo revisar targets (los links miden > 44 px) y el `pt` bajo el header. Sin cambios de composición.

### Transversal
- **T-1** Componentes > 200 líneas que este trabajo va a tocar (AGENTS.md §6): `ImpulsanEd` 431, `PersonCard` 244, `TeamProfileOverlay` 210, `LineasInvestigacion` 397, `CierreInvestigacion` 365, `EvidenciasCaso` 207, `MaterialesListado` 410, `PuenteInvestigacion` 362, `EdEnMovimiento` 289, `NovedadDestacada` 297, `FiltrosNovedades` 244, `LanzamientosRecientes` 279. Ver decisión en §9.

---

## 4. Matriz de adaptación

Convenciones de las filas: **Escritorio** = qué hace hoy en computadora (congelado). **Celular** = < 768. **Tablet** = 768–1023 táctil. **Animación** = cómo se reinterpreta el gesto. **Táctil** = interacciones. **Archivos** = dónde va el cambio. **Compartidos** = dependencias que se usan sin modificar. **R-desk / R-prot** = riesgo para computadora / para Inicio y Qué hacemos (bajo = solo clases `max-lg:` o código nuevo montado bajo gate; medio = se toca un archivo grande de la página; alto = capa compartida, que no se toca). **Verificación** = método concreto.

### Quiénes somos

**QS1 · Hero «No capacitamos. Transformamos.»**
| | |
| --- | --- |
| Escritorio | Titular con relleno animado (background-clip) sobre MathField, bajada a la derecha, botón secundario; `min-h-[87svh]`. |
| Celular | Sin problema visible; en 320 el titular llena el ancho. |
| Tablet | Correcta. |
| Solución celular | Sin cambios de composición. Solo revisar `min-h` en 320×568 (que la lámina siguiente asome, como en 390). |
| Solución tablet | Sin cambios. |
| Animación | La misma (es CSS y clamp). |
| Táctil | Botón ≥ 44 px (medir). |
| Archivos | `QuienesSomosHero.tsx` (0–2 clases `max-md:`). |
| Compartidos | `MathField`, `ButtonSecondary` (sin tocar). |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness 320/390/768; comparación pixel 1280–1920 idéntica. |

**QS2 · Origen (lámina navy, 5 beats)**
| | |
| --- | --- |
| Escritorio | Pin de 560 svh: estallido de chars → cita 3D → typewriter → definición + trayectoria horizontal → remate desde blur; panel de fotos cruzando; tilt con mouse; 5 puntos. |
| Celular | QS-1…QS-5: coreografía de escritorio corriendo, textos superpuestos, cita recortada, «Hoy» cortado, 7 pantallas. |
| Tablet | Igual que celular pero con el panel de fotos (`md:block`) al lado; cita recortada [cap 768/p02]. |
| Solución celular | **Gate** de la coreografía de escritorio a `(hover: hover) and (min-width: 1024px)` (mismo patrón que `MiradaEd.tsx:73`). Nueva composición: **«pasador de capítulos»**: escena sticky `h-lvh` con pista de ~5 × 60 lvh + respiro; cada beat es un capítulo que entra (y+opacity) y sale hacia arriba; el indicador de 5 puntos se conserva. Gestos reinterpretados: beat 0 el título se arma por líneas (rise, sin dispersión); beat 1 la cita se levanta con un solo movimiento (y + opacity, sin 3D); beat 2 se tipea **por tiempo** al activarse el capítulo (1,2 s, once) con caret; beat 3 la trayectoria vertical se dibuja con dash-offset atado al scroll del capítulo (existe `TrayectoriaVertical`); beat 4 el remate aparece por palabras (opacity + y). Pantallas bajas (`min-height < 38.75rem`) y reduced-motion → capítulos en flujo (el fallback `motion-reduce:*` que ya existe). Fotos: una banda apaisada arriba del capítulo 0 (aspect 5/2, patrón «foto arriba» de Cómo trabajamos móvil). |
| Solución tablet | Misma escena; a partir de `md` la lámina va en dos columnas: fotos a la derecha con crossfade por capítulo (una imagen por beat 0–2, se apaga en 3–4) y texto a la izquierda. |
| Animación | Solo transform/opacity + strokeDashoffset; scrub 0.6–1; `gsap.matchMedia`; sin tilt (no hay mouse); `will-change` puesto y sacado por la coreografía. |
| Táctil | Sin interacción (solo scroll). |
| Archivos | `OrigenEd.tsx` (gate + wrappers `contents`), nuevo `origen/capitulos-movil.ts` + `origen/CapitulosMovil.tsx` (o clases en el mismo markup con `max-lg:`), `PanelFotos.tsx` (variante `max-lg`). |
| Compartidos | `SplitChars`, hooks (sin tocar). |
| R-desk / R-prot | medio (se toca `OrigenEd.tsx`, pero solo para agregar el gate: el efecto de escritorio corre exactamente igual cuando el gate es verdadero) / bajo. |
| Verificación | Harness 320/375/390/768 + captura por capítulo; comparación pixel + geometría de `/quienes-somos` en 1280/1440/1920 contra `base/`; reduced-motion en 390. |

**QS3 · Nuestra mirada (constelación)**
| | |
| --- | --- |
| Escritorio | Pin de 910 svh: cámara que viaja por 3 nodos; detalle + fichas por nodo; síntesis. |
| Celular | Estático (gate hover+1024): título, 3 bloques de texto con fichas en columna, síntesis. Correcto pero sin gesto ni orientación. |
| Tablet | Igual. |
| Solución celular | **Constelación vertical con mapa fijo:** un mini-mapa de los 3 nodos (SVG chico, `sticky` bajo el header, ~72 px) cuyo trazo se dibuja al avanzar (dash-offset scrub) y cuyo nodo activo se enciende; el contenido de cada perspectiva sigue en flujo; las fichas «florecen» al entrar (scale/opacity stagger, once). |
| Solución tablet | A partir de `md`, dos columnas: mapa sticky a la izquierda (más grande, con los rótulos) y contenido a la derecha; misma coreografía. |
| Animación | `gsap.matchMedia("(max-width: 63.999rem)")`; scrub para el trazo, `once` para las fichas; sin pin largo. |
| Táctil | Los nodos del mapa son botones que llevan a cada perspectiva (`irAElemento`), ≥ 44 px. |
| Archivos | `MiradaEd.tsx` (montar el modo móvil cuando `!live`), nuevo `mirada/mapa-movil.ts`, `MapaConstelacion.tsx` (variante compacta). |
| Compartidos | `lib/indice`, hooks. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness; el modo `live` de escritorio no cambia (misma rama de código). |

**QS4 · El equipo (+ overlay de perfil)**
| | |
| --- | --- |
| Escritorio | Pliego navy: masthead (Daniela) + dirección, N3 grilla 2, N4 grilla 3, columna vertebral, cards con placa hover, overlay inmersivo. |
| Celular | QS-7: cards chicas en 2 columnas, «Ver trayectoria» oculto, país minúsculo. |
| Tablet | Grillas de 2 columnas amplias; correcto. |
| Solución celular | Mantener 2 columnas (12 personas en 1 columna sería un desfile demasiado largo) pero con card móvil: nombre ≥ 1rem, rol 0.8rem, país en el mismo renglón que el rol, flecha + «Ver perfil» siempre visibles bajo `(hover: none)`, `active:` con escala 0.98; masthead 1 columna. Entrada de cards en `once` como hoy. |
| Solución tablet | N4 a 3 columnas desde `md` (hoy `sm:grid-cols-3` ya lo hace); nada más. |
| Animación | La misma (reveal once). |
| Táctil | Card completa como target; overlay: botón cerrar ≥ 44 px, `padding-bottom: env(safe-area-inset-bottom)`, verificar scroll-lock liberado al cerrar. |
| Archivos | `ImpulsanEd.tsx` y `PersonCard.tsx` (clases `max-md:` / `[@media(hover:none)]`), `TeamProfileOverlay.tsx`/`PerfilLineal` (safe-area). |
| Compartidos | `SelloED`, `useLockScroll`, `useMediaQuery` (sin tocar). |
| R-desk / R-prot | medio (archivos grandes; cambios limitados a clases con prefijo) / bajo. |
| Verificación | Harness + prueba de abrir/cerrar perfil con tap en 390 y 768; comparación pixel de escritorio. |

### Investigación

**IN1 · Hero + historia («Por qué investigamos»)**
| | |
| --- | --- |
| Escritorio | Noche + faro a la derecha, encendido autónomo, pin largo: titular sale, hoja 01 sube, estrellas forman 4 constelaciones (pregunta, lupa, red, espiral) con verbo y frase. |
| Celular | IN-1: titular + CTAs y media pantalla vacía; sin faro ni historia. |
| Tablet | Igual. |
| Solución celular | Dos partes. (a) Hero compacto: cielo, faro **chico a la derecha** (mismo SVG `LinternaFaro` escalado, quieto, ya encendido), titular y CTAs; `min-h` ≈ 88 lvh. (b) **La historia como escena corta:** sticky `h-lvh` con pista de 4 × 55 lvh; las 4 constelaciones pre-dibujadas en un SVG cuadrado (reutilizando las coordenadas de `coreografia-historia.ts`), cada beat dibuja su trazo (dash-offset) y muestra verbo + frase (las mismas hojas), la anterior se apaga (opacity/scale). Pantallas bajas / reduced-motion: las 4 hojas en flujo con la constelación estática. |
| Solución tablet | Misma escena con la constelación a la izquierda y el texto a la derecha (dos columnas desde `md`). |
| Animación | `gsap.matchMedia`; transform/opacity + dash-offset; sin encendido autónomo (el faro ya llega encendido: la intención «alumbrar lo que no se ve» queda en que las estrellas se dibujan al leer). |
| Táctil | Solo scroll. CTAs ≥ 44 px. |
| Archivos | `InvestigacionHero.tsx` (montaje bajo gate), nuevo `hero/HistoriaMovil.tsx` + `hero/coreografia-historia-movil.ts`, `hero/HojaHistoria.tsx` (variante). |
| Compartidos | `Highlight`, `ButtonPrimary/Secondary`, `RevealLines` (sin tocar). |
| R-desk / R-prot | medio (se toca el compositor del hero; la rama lg queda idéntica) / bajo. |
| Verificación | Harness + capturas por beat; comparación 1280/1440/1920 de `/investigacion`. |

**IN2 · Líneas de investigación (carpeta)**
| | |
| --- | --- |
| Escritorio | Carpeta a 120 vw que entra inclinada y se aplana; 6 papeles en 2 columnas con giros; CTA «Ver en acción» por línea. |
| Celular | IN-2: 6 tarjetas iguales en columna, 4 pantallas. |
| Tablet | Papeles en 2 columnas (ya), sin entrada. |
| Solución celular | **Pila de papeles dentro de la carpeta** (patrón pila de Inicio/Cómo trabajamos): escena sticky con la carpeta como fondo; cada papel sube desde abajo y tapa al anterior, del tapado queda el lomo con el número y el tema; 6 × ~58 lvh. Pantallas bajas / reduced-motion: columna como hoy. |
| Solución tablet | Carpeta con entrada inclinada suave (scrub sin pin, versión reducida del gesto de escritorio: `rotate` 4° → 0°) y 2 columnas; sin pila. |
| Animación | `gsap.matchMedia` con dos rangos (`max-width: 47.999rem` pila; `48rem–63.999rem` entrada). Solo transform/opacity. |
| Táctil | CTA «Ver en acción» ≥ 44 px; en la pila, el papel activo es el único interactivo. |
| Archivos | `LineasInvestigacion.tsx` (wrappers + gate), nuevo `lineas/pila-movil.ts`. |
| Compartidos | `Highlight`, `ButtonSecondary`. |
| R-desk / R-prot | medio (archivo de 397 líneas; cambios de markup mínimos) / bajo. |
| Verificación | Harness; `pnpm react-doctor`; comparación de escritorio. |

**IN3 · Ciclo de investigación aplicada (espiral)**
| | |
| --- | --- |
| Escritorio | Lámina pinneada: espiral doble que se dibuja, personaje que recorre 8 estaciones, cámara que se aleja en la bisagra, lazo de cierre. |
| Celular | IN-3: SVG estático de 420 px + 8 pasos como texto corrido. |
| Tablet | Igual. |
| Solución celular | **Espiral que acompaña la lectura:** el SVG queda `sticky` arriba (≈ 36 lvh) mientras los 8 pasos pasan en flujo debajo; el trazo se dibuja hasta la estación del paso visible (dash-offset scrub sobre la sección) y la punta (el personaje) viaja por `getPointAtLength`, como la cinta de la escalera de Qué hacemos; en la bisagra (paso 4→5) el SVG hace su zoom-out (scale). Reduced-motion: espiral completa quieta + lista. |
| Solución tablet | Desde `md`, espiral sticky a la izquierda y pasos a la derecha (extender el `lg:sticky` actual a `md:`), misma coreografía. |
| Animación | Reutiliza `EspiralSvg`; scrub 0.6; transform + dash-offset. |
| Táctil | Solo scroll. |
| Archivos | `EspiralEstatica.tsx` (evoluciona a versión «acompañada»), nuevo `espiral/coreografia-espiral-movil.ts`. `EspiralLamina` (escritorio) no se toca. |
| Compartidos | ninguno crítico. |
| R-desk / R-prot | bajo (la rama escritorio usa `EspiralLamina`) / bajo. |
| Verificación | Harness; comparación de escritorio. |

**IN4 · Investigación en acción (casos + expediente)**
| | |
| --- | --- |
| Escritorio | Título que se achica (sticky) + pila de 4 carpetas; hover anticipa; click abre expediente a pantalla completa con scroll propio y pestañas laterales. |
| Celular | Carpetas apiladas correctas; expediente funcional; IN-4: evidencias giradas en columna, sin pista de scroll, rótulo por hover. |
| Tablet | Igual. |
| Solución celular | Mantener la pila de carpetas (es el gesto correcto). Ajustes: rótulo desplegado en reposo bajo `(hover: none)` (sin depender del tap doble); expediente: barra superior sticky con «Volver» ≥ 44 px y safe-area, pista «seguir leyendo» visible en celular (la misma, con `max-lg:flex`), evidencias sin `rotate` y en 1 columna (2 desde `md`), fotos con `sizes` correctos. |
| Solución tablet | Evidencias en 2 columnas (collage simplificado); resto igual. |
| Animación | Apertura del expediente como hoy (time-based); sin cambios en escritorio. |
| Táctil | Carpetas: target = toda la tapa (ya); navegación inferior `NavegacionCasos` (ya adapta); cerrar ≥ 44 px. |
| Archivos | `CarpetaCaso.tsx`, `ExpedienteCaso.tsx`, `EvidenciasCaso.tsx`, `HojaInforme.tsx` (clases `max-lg:`). |
| Compartidos | `useMediaQuery`, `useCopiar`, `getLenis`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness + prueba real de abrir un caso, scrollear el expediente y cerrarlo en 390/768 (Playwright tap). |

**IN5 · Cierre (faro que sube)**
| | |
| --- | --- |
| Escritorio | Nubes en parallax, faro que sube girando y se enciende, haz que lee dos mensajes (Biblioteca / Conversemos). |
| Celular | IN-5: dos bloques de texto sobre cielo vacío. |
| Tablet | Igual. |
| Solución celular | **Reprise compacto del faro** (mismo idioma que el faro móvil de Qué hacemos): escena sticky `h-lvh`, pista ≈ 220 lvh: dos nubes se abren (x), el faro sube (y) y se enciende (opacity del haz), el haz gira hacia el primer mensaje y después hacia el segundo (rotación del grupo del haz), cada mensaje aparece cuando la luz lo toca. Reduced-motion: faro encendido quieto con los dos mensajes. |
| Solución tablet | Misma escena, mensajes a los lados del faro (dos columnas). |
| Animación | Solo transform/opacity; `gsap.matchMedia`; reutiliza `LinternaFaro`. |
| Táctil | Dos CTAs ≥ 44 px; un solo naranja visible por pantalla (el segundo es secundario, como hoy). |
| Archivos | `CierreInvestigacion.tsx` (montaje bajo gate), nuevo `cierre/coreografia-cierre-movil.ts`. |
| Compartidos | `ButtonPrimary/Secondary`, `SelloED`, footer-dock (`data-footer-dock-tint="propio"`, sin tocar). |
| R-desk / R-prot | medio (archivo de 365 líneas) / bajo. |
| Verificación | Harness; comparación de escritorio; que el footer-dock siga igual. |

### Biblioteca

**BI1 · Hero (buscador + riel de categorías)**
| | |
| --- | --- |
| Escritorio | Azul a sangre, PuntosFaro al cursor, titular, buscador con botón naranja, riel con flechas. |
| Celular | Correcto salvo BI-1 (zoom iOS) y píldoras de ~40 px. |
| Tablet | Correcto. |
| Solución celular | Input a `max-lg:text-[1rem]` (16 px); píldoras del riel a ≥ 44 px bajo `max-lg:`; riel con `scroll-snap` y `scroll-padding` lateral; `min-h` ≈ 80 lvh (hoy 87 svh); PuntosFaro sin haz (no hay cursor: ya lo maneja el componente). |
| Solución tablet | Igual; flechas visibles desde `md` como hoy. |
| Animación | Entrada como hoy (time-based). |
| Táctil | Botón buscar 44×44 (ya). |
| Archivos | `BibliotecaHero.tsx`, `CategoriasRail.tsx`. |
| Compartidos | `PuntosFaro` (sin tocar). |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness (inputs<16 = 0); comparación de escritorio. |

**BI2 · Destacados**
| | |
| --- | --- |
| Escritorio | Fila de 4 portadas pinneada que converge a un slot; barrido clip-path entre artículos; índice lateral. |
| Celular | BI-4: portadas 2×2 + 4 artículos largos (5+ pantallas). |
| Tablet | Portadas 4 en fila + artículos largos. |
| Solución celular | **Baraja deslizable:** las 4 portadas en un carrusel `scroll-snap` horizontal (una por vez, con asomo de la siguiente), el artículo activo debajo con crossfade (IntersectionObserver define la activa), puntitos como índice. Conserva «una portada por vez» y el barrido (ahora, el propio deslizamiento). Texto de cada artículo con «leer más» solo si supera ~8 líneas (sin ocultar contenido: se expande in situ). |
| Solución tablet | Misma baraja, portada más grande a la izquierda y texto a la derecha desde `md`. |
| Animación | Scroll-snap nativo + crossfade (opacity/transform); sin GSAP scrub. |
| Táctil | Swipe nativo; puntitos ≥ 44 px de target. |
| Archivos | `DestacadosBiblioteca.tsx` (montaje), nuevo `destacados/BarajaMovil.tsx`; `ArticuloDestacado.tsx` (variante compacta). |
| Compartidos | `RevealLines`. |
| R-desk / R-prot | bajo (la coreografía de escritorio no cambia) / bajo. |
| Verificación | Harness + swipe con Playwright (`mouse.wheel` horizontal / `touchscreen`); comparación de escritorio. |

**BI3 · Catálogo (filtros + resultados)**
| | |
| --- | --- |
| Escritorio | Sidebar sticky de 300 px con buscador y 3 grupos; resultados con portada 218 px; «Ver más». |
| Celular | BI-2, BI-3, BI-6: filtros completos antes de los resultados, filas de 1 pantalla, píldoras chicas. |
| Tablet | Filtros arriba en vertical, filas con portada a la izquierda. |
| Solución celular | **Barra compacta + hoja de filtros:** el `<aside>` pasa a `max-lg:hidden` y bajo lg se monta `FiltrosMovil`: buscador (16 px) + fila horizontal con el botón «Filtros (n)» ≥ 44 px y las píldoras activas; la barra queda sticky bajo el header mientras se recorren resultados; «Filtros» abre una **hoja inferior** (`<dialog>` con `data-lenis-prevent`, safe-area, cierre por botón/arrastre) con los 3 grupos y «Limpiar»/«Ver n materiales». Filas compactas: portada 4/3 a la izquierda (≈ 34 %) + título/autoras/meta, descripción a 3 líneas con expansión. Misma lógica de estado y `?tipo=` (los callbacks se reutilizan). |
| Solución tablet | Misma barra + hoja (una sidebar de 300 px dejaría 440 px de resultados); filas con portada 218 px como hoy. |
| Animación | Hoja: entra desde abajo (transform) 0,32 s; el `filtros-abre` existente para los grupos. |
| Táctil | Píldoras ≥ 44 px; botón «Ver más» ≥ 48 px; foco atrapado en la hoja y devuelto al botón. |
| Archivos | `MaterialesListado.tsx` (2 líneas: `max-lg:hidden` + montar el componente móvil), nuevos `materiales-listado/FiltrosMovil.tsx` y `HojaFiltros.tsx`, `FilaMaterial` (variante `max-lg:`). |
| Compartidos | `getLenis`, `EVENTO_URL`, iconos. |
| R-desk / R-prot | medio (archivo de 410 líneas; el markup del aside no se modifica) / bajo. |
| Verificación | Harness + Playwright: abrir hoja, elegir tipo, ver contador, cerrar; `?tipo=` desde el submenú del header; comparación de escritorio. |

**BI4 · Puente a Investigación**
| | |
| --- | --- |
| Escritorio | Sticky 100 svh: 4 paneles se apilan desde la derecha con lomos verticales. |
| Celular | BI-5: 4 paneles quietos. |
| Tablet | Igual. |
| Solución celular | **Pila** (patrón de Inicio/Cómo trabajamos móvil): cada panel sube y tapa al anterior; lomos con número y nombre del recurso; 4 × 62 lvh + respiro. Pantallas bajas / reduced-motion: lista como hoy. |
| Solución tablet | Misma pila con el panel en dos columnas (foto + texto) como ya hace `md:grid-cols-[1fr_1.05fr]`. |
| Animación | `gsap.matchMedia`; transform/opacity. |
| Táctil | Solo scroll; links ≥ 44 px. |
| Archivos | `PuenteInvestigacion.tsx` (gate ya existe: agregar el modo móvil), nuevo `puente/pila-movil.ts`. |
| Compartidos | `RevealLines`, `ButtonPrimary/Secondary`. |
| R-desk / R-prot | medio (362 líneas) / bajo. |
| Verificación | Harness; comparación de escritorio. |

**BI5 · Cierre «Un faro para cada aula»**
| | |
| --- | --- |
| Escritorio | Tarjeta navy con PuntosFaro, sello, titular, CTA, link. |
| Celular | Correcta; bola decorativa de 26 rem domina el ancho. |
| Tablet | Correcta. |
| Solución celular | Bola a ~14 rem y `min-h` ≈ 48 lvh; padding `max-md:`. |
| Solución tablet | Sin cambios. |
| Animación | La misma (scrub de entrada). |
| Táctil | CTA ≥ 44 px (ya). |
| Archivos | `CierreBiblioteca.tsx`. |
| Compartidos | `PuntosFaro`, `SelloED`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness; comparación. |

### Novedades

**NO1 · Hero (split-flap)**
| | |
| --- | --- |
| Escritorio | Navy a sangre, titular con RotadorPalabras, fecha SplitFlap, «scrolleá para ver lo último». |
| Celular | Correcto; `min-h-[88svh]` deja aire de más. |
| Tablet | Correcto. |
| Solución celular | `min-h` ≈ 78 lvh bajo `max-md:`; pista de scroll 0.78rem. |
| Solución tablet | Sin cambios. |
| Animación | La misma. |
| Táctil | — |
| Archivos | `NovedadesHero.tsx`. |
| Compartidos | `PuntosFaro`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness; comparación. |

**NO2 · Destacadas**
| | |
| --- | --- |
| Escritorio | Panel navy; card principal a dos columnas al 78 %, segunda card solapada al 56 % con `-mt-24`; hover enciende flecha; RevealFoco. |
| Celular | NO-1: segunda card como fila con miniatura del 36 %. |
| Tablet | Solape correcto. |
| Solución celular | Ambas cards apiladas, foto arriba: la segunda con foto 16/9 y texto condensado (`max-md:` en la card 2); flecha visible en reposo bajo `(hover: none)`; `active:` de 0.98. |
| Solución tablet | Como hoy (`md:` ya aplica el solape); solo targets. |
| Animación | Entrada stagger como hoy; RevealFoco igual. |
| Táctil | Card completa como link ≥ 44 px. |
| Archivos | `NovedadDestacada.tsx`. |
| Compartidos | `RevealLines`, `PuntosFaro`. |
| R-desk / R-prot | medio (297 líneas; solo clases) / bajo. |
| Verificación | Harness; comparación. |

**NO3 · Últimas (filtros + grilla + paginación, FLIP)**
| | |
| --- | --- |
| Escritorio | Chips de filtro, grilla 3 columnas, FLIP real al filtrar/paginar, URL con `replaceState`. |
| Celular | NO-2, NO-3: chips en 3 filas, paginación 36 px, hover-only en cards. |
| Tablet | Grilla 2 columnas; chips en 2 filas. |
| Solución celular | Chips en **riel horizontal** con `scroll-snap` y fundido lateral (`max-md:`), ≥ 44 px; paginación a 44 px; NovedadCard con flecha visible y `active:`; FLIP igual (funciona en 1 columna). |
| Solución tablet | Chips en una fila (entran); grilla 2 columnas como hoy. |
| Animación | FLIP existente; el riel usa scroll nativo. |
| Táctil | Chips y paginación ≥ 44 px. |
| Archivos | `FiltrosNovedades.tsx`, `PaginacionNovedades.tsx`, `NovedadCard.tsx`. |
| Compartidos | `.scrollbar-none` (se usa, no se toca). |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness + Playwright: tocar «Eventos», ver grilla y URL; comparación. |

**NO4 · ED en movimiento (dolly)**
| | |
| --- | --- |
| Escritorio | Pin de 560 svh: 6 fotos emergen del punto de fuga con scrub; frases centrales. |
| Celular | NO-4: mosaico 2×3 quieto con `min-h-[70svh]` y **frases invisibles**. |
| Tablet | Igual (gate pide hover). |
| Solución celular | **Profundidad en etapas:** escena sticky `h-lvh`, pista ≈ 3 × 60 lvh: las fotos entran de a dos desde el centro (scale 0.3 → 1, y hacia su lugar en el mosaico), y **cada frase central aparece entre etapas** (recuperando contenido hoy perdido). Pantallas bajas / reduced-motion: mosaico con las frases como bandas de texto entre filas. |
| Solución tablet | Misma escena con mosaico 3×2. |
| Animación | `gsap.matchMedia` (nuevo modo `movil`); transform/opacity; el gate de escritorio (`hover + 768`) no se toca. |
| Táctil | Solo scroll. |
| Archivos | `EdEnMovimiento.tsx` (modo `movil` como en `ProyectosAplicaciones`), nuevo `ed-en-movimiento/coreografia-movil.ts`. |
| Compartidos | `.bg-grain-dark` (sin tocar). |
| R-desk / R-prot | medio (289 líneas) / bajo. |
| Verificación | Harness; comparación de escritorio incluida la rama de 768–1023 con mouse (no cambia: sigue pidiendo hover). |

**NO5 · Recién salido (riel)**
| | |
| --- | --- |
| Escritorio | Riel con drag e inercia, píldora-cursor, flechas, velo. |
| Celular | NO-5: scroll nativo sin pista. |
| Tablet | Igual. |
| Solución celular | Riel con `scroll-snap`, barra de progreso (transform `scaleX` por scroll del riel) o puntitos, eyebrow «Deslizá →» y velo lateral visible; cards 76 vw como hoy. |
| Solución tablet | Cards 42 vw, snap y progreso. |
| Animación | Scroll nativo; progreso con `scaleX`. |
| Táctil | Swipe nativo; CTA final ≥ 44 px. |
| Archivos | `LanzamientosRecientes.tsx`. |
| Compartidos | `.scrollbar-none`. |
| R-desk / R-prot | medio (279 líneas; solo clases y un listener bajo gate) / bajo. |
| Verificación | Harness + swipe; comparación. |

**NO6 · Cierre «No te pierdas nada»**
| | |
| --- | --- |
| Escritorio | Tarjeta navy, CTA naranja, redes. |
| Celular / Tablet | Correcta. |
| Solución | Padding `max-md:`; nada más. |
| Archivos | `CierreNovedades.tsx`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness; comparación. |

**NO7 · Detalle de novedad (+ TransicionFaro)**
| | |
| --- | --- |
| Escritorio | Dos columnas: cuerpo + columna sticky con foto y guía por IntersectionObserver; telón TransicionFaro. |
| Celular | NO-6: sin guía; foto bajo el título; lectura correcta. |
| Tablet | Igual (la columna es `lg:`). |
| Solución celular | **Guía compacta:** riel horizontal sticky bajo el header con las secciones (chips), que marca la activa (reutiliza `GuiaNota` con variante `max-lg:`); «Volver» ≥ 44 px; `pt` ajustado; ancho de lectura ≤ 65 ch. |
| Solución tablet | Misma guía compacta (una columna: 768 − 340 px de aside dejaría 428 px de lectura). |
| Animación | TransicionFaro como hoy (revisar que su telón use `lvh` y no `svh`, como se corrigió en el faro de Qué hacemos). |
| Táctil | Chips ≥ 44 px. |
| Archivos | `FichaNovedad.tsx`, `GuiaNota.tsx`, `TransicionFaro.tsx` (solo si usa `svh`). |
| Compartidos | `getLenis`, `RevealLines`. |
| R-desk / R-prot | bajo–medio (`TransicionFaro` 241 líneas) / bajo. |
| Verificación | Harness en las 2 notas; comparación. |

### Contacto

**CO1 · Hero + apertura**
| | |
| --- | --- |
| Escritorio | «Hablemos.» autoanimado que se desarma; apertura en grilla 5/7 (identidad + índice de temas + canal directo). |
| Celular | Entra y scrollea dentro del panel; correcta visualmente. |
| Tablet | Correcta. |
| Solución celular | Mantener estados y transiciones (son por tiempo, funcionan en táctil). **Soltar la altura fija bajo lg:** raíz `max-lg:h-auto max-lg:min-h-[100lvh]`, paneles `max-lg:relative` y los inactivos `hidden`; el viaje del título fantasma se limita a lg (`gsap.matchMedia`); en celular la transición entre estados es crossfade + rise de 0,5 s. Temas como filas ≥ 56 px. |
| Solución tablet | Igual que celular (la grilla 5/7 recién a partir de lg, como hoy). |
| Animación | Intro del hero igual; `useSaltoIntro` igual. |
| Táctil | Filas de temas y «Copiar mail» ≥ 44 px. |
| Archivos | `ContactoExperiencia.tsx`, `coreografia-intro.ts`, `ghost-titulo.ts`, `IndiceTemas.tsx`. |
| Compartidos | `MathField`, `siteConfig`. |
| R-desk / R-prot | medio (la raíz y las coreografías se tocan; en lg todo queda igual) / bajo. |
| Verificación | Playwright: recorrer hero → tema → formulario → cierre en 390 y 768; comparación de escritorio de los 4 estados. |

**CO2 · Formulario**
| | |
| --- | --- |
| Escritorio | Grilla 2/3: rail navy del tema + campos en 2 columnas, país con dropdown propio, submit naranja, `mailto:`. |
| Celular | CO-1, CO-2, CO-4. |
| Tablet | Campos en 2 columnas; mismos problemas de altura. |
| Solución celular | Con la altura suelta (CO1) el teclado empuja la página, no el panel. Rail navy como banda compacta arriba de los campos; campos 16 px, `autocomplete` (name, email, organization) e `inputmode="email"`; **país**: bajo `(hover: none)` se usa `<select>` nativo (picker del sistema), el dropdown propio sigue en escritorio; botón de envío ≥ 48 px pegado abajo del formulario. |
| Solución tablet | Campos 2 columnas (ya); resto igual. |
| Animación | Entrada de campos (stagger) igual. |
| Táctil | Targets ≥ 44 px; sin zoom. |
| Archivos | `PanelFormulario.tsx`, `CamposContacto.tsx`, `PaisDropdown.tsx`, `RailTema.tsx`. |
| Compartidos | ninguno. |
| R-desk / R-prot | bajo–medio / bajo. |
| Verificación | Playwright con `isMobile`: enfocar campos, comprobar que el submit queda alcanzable (medición con `visualViewport`), enviar; comparación de escritorio. |

**CO3 · Cierre**
| | |
| --- | --- |
| Escritorio | Confirmación centrada + CanalDirecto + «Hacer otra consulta». |
| Celular / Tablet | Correcta. |
| Solución | Botones ≥ 44 px; padding `max-md:`. |
| Archivos | `PanelCierre.tsx`, `CanalDirecto.tsx`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Playwright (flujo completo). |

### 404

**E1 · Página no encontrada**
| | |
| --- | --- |
| Escritorio | Título, texto, grilla de links 3 columnas, CTA. |
| Celular / Tablet | Correcta (1 col / 2 col). |
| Solución | `pt` bajo el header y `gap` en 320; nada más. |
| Archivos | `not-found.tsx`. |
| Compartidos | `ButtonPrimary`, `nav.ts`. |
| R-desk / R-prot | bajo / bajo. |
| Verificación | Harness. |

---

## 5. Estrategia recomendada

1. **Aislamiento por construcción.** Todo lo nuevo vive en `features/<página>/` (archivos nuevos `*-movil.ts[x]` o clases con prefijo `max-lg:`/`max-md:`/`[@media(hover:none)]`). Ningún archivo de `components/`, `lib/`, `config/`, `app/(sitio)/layout.tsx` ni las reglas transversales de `globals.css` se modifican. Si una regla CSS nueva es imprescindible, va anclada a un `data-*` de la feature (como `[data-mirada].is-pila`).
2. **Gate explícito y completo por modo** (lección de Qué hacemos): cada sección decide `escritorio | movil | quieto` en cada corrida del efecto (reduced-motion → quieto; `(hover: hover) and (min-width: 1024px)` → escritorio; `(max-width: 63.999rem) and (min-height: 38.75rem)` → móvil; si no, quieto). La rama de escritorio conserva su código y su gate actuales.
3. **Un idioma móvil, el que ya existe en el sitio:** pila con lomos (Inicio/Cómo trabajamos), desplegables (Áreas), escalera/cinta con dash-offset (Niveles), escena sticky `h-lvh` con pista en `lvh` y `LVH_POR_UNIDAD`, faro con travellings (Qué hacemos), foto apaisada arriba (Cómo trabajamos). Cada gesto de escritorio se mapea a uno de estos, para que la lectura del sitio en celular sea una sola.
4. **Tablet con decisiones propias:** dos columnas cuando aportan (Mirada mapa + contenido, Ciclo espiral + pasos, Origen texto + foto, Historia constelación + hoja, Puente foto + texto), grillas de 3 en el equipo, chips en una fila; y los mismos gestos móviles cuando el espacio no cambia la narrativa (pila de Líneas → entrada inclinada suave, catálogo con barra + hoja).
5. **Táctil:** targets ≥ 44 px vía `max-lg:`; `active:` como feedback; información de hover visible en reposo bajo `(hover: none)`; scroll-snap nativo para rieles; hoja inferior con `data-lenis-prevent` y safe-area; inputs 16 px.
6. **Rendimiento:** sin filtros/blur animados, sin `will-change` en className; escenas cortas (≤ 5 × 60 lvh); imágenes con `sizes` reales por breakpoint.
7. **Verificación continua con el harness:** después de cada fase, (a) gate completo, (b) `qa-base` de la página en 320/390/768/1024 + reduced-motion, (c) `comparar` de la página en 1280/1440/1920 contra `base/` (píxeles + geometría idénticos), (d) `comparar` de `/` y `/que-hacemos` en los 7 viewports contra `base/` (idénticos). Al final, la corrida completa de la fase 3 con los 13 viewports pedidos y pruebas de rotación sin recarga.

---

## 6. Riesgos para computadora (y cómo se neutralizan)

| Riesgo | Mitigación |
| --- | --- |
| Tocar clases `md:`/`lg:` existentes (aplican también a ≥ 1024). | Regla: **nunca editar una clase `md:`/`lg:` existente**; solo agregar `max-lg:`/`max-md:` o rangos `md:max-lg:`. Grep de control en el diff final: cero líneas que quiten/alteren `md:`/`lg:`. |
| Gate nuevo que cambie el comportamiento de escritorio (p. ej. Origen). | El gate se agrega **alrededor** de la llamada actual; la rama verdadera ejecuta el mismo código. Comparación pixel + geometría de la página en 3 anchos contra `base/`. |
| Archivos > 200 líneas que se editan (T-1). | Cambios mínimos (gate, `max-lg:hidden`, montaje de un componente nuevo); lo nuevo va en archivos nuevos < 200 líneas. Ver decisión §9. |
| `globals.css` fuera de `@layer` pisa utilities. | No se agregan reglas fuera de layer; las nuevas van con selector `[data-<feature>]` y solo `max-width` medias. |
| ScrollTrigger/pins nuevos que muevan el refresh global (`LenisProvider`, `refreshPriority`). | Escenas nuevas solo bajo matchMedia móvil; en escritorio no se crean triggers nuevos. |
| `EdEnMovimiento` con gate a 768: tablet con mouse recibe el dolly hoy. | No se cambia ese gate; el modo móvil se agrega para táctil. |

## 7. Riesgos para Inicio y Qué hacemos

| Vía | Riesgo | Mitigación |
| --- | --- | --- |
| Capa compartida (`components/ui`, `layout`, `lib`, `globals.css` transversal, `nav.ts`) | Alto si se toca | **No se toca.** Si apareciera una necesidad, se propone aparte con su propio diff y comparación. |
| `AccionPublicacion` (Novedades) importa `biblioteca/data/materiales` | Solo lectura | Sin cambios de datos. |
| `[data-mirada]` en `globals.css` lo usan Qué hacemos (`MiradaPasos`) y Quiénes somos (`IndicadorFases`) | Medio si se editara | No se edita; Quiénes somos usa selectores propios. |
| Footer-dock (`body:has([data-footer-dock-tint])`) | Bajo | Se conservan los valores actuales por página. |
| Verificación | — | `comparar` de `/` y `/que-hacemos` en 1280/1440/1920 (sin táctil) y 375/390/768/1024 (táctil) contra `base/` después de cada fase; además, gate completo. |

---

## 8. Orden propuesto de implementación (fases; cada una con sus commits atómicos y su QA)

1. **Contacto** (chica, alta conversión): altura suelta bajo lg, gate del título fantasma, formulario táctil, select nativo de país. — 1 día.
2. **Biblioteca**: inputs 16 px + riel; **catálogo con barra + hoja de filtros**; baraja de destacados; pila del puente; cierre. — 2 días.
3. **Novedades**: chips en riel + paginación 44 px + cards táctiles; destacada 2; **profundidad en etapas** (recupera las frases); riel con snap y progreso; guía compacta del detalle; cierre/hero. — 2 días.
4. **Quiénes somos**: **gate del Origen + pasador de capítulos** (celular) y dos columnas con fotos (tablet); constelación vertical de Mirada; equipo táctil + overlay. — 2 días.
5. **Investigación** (la más grande): hero compacto + historia en escena; pila de Líneas y entrada en tablet; espiral que acompaña; ajustes de casos/expediente; reprise del faro en el cierre. — 3 días.
6. **404 + pasada transversal**: safe-area, rotación sin recarga en cada escena (matchMedia revierte y rearma), reduced-motion en todo, revisión final del diff (grep de `md:`/`lg:` alterados = 0), fase 3 completa (13 viewports), `verification-before-completion` y `requesting-code-review`.

Cada fase: plan con `superpowers:writing-plans` (se genera después de la aprobación), implementación con `subagent-driven-development` (ejecutor + revisor en pasadas separadas), TDD solo para comportamiento con estado (hoja de filtros, `?tipo=`, modo por media query, guía activa, flujo del formulario); sin tests para CSS.

---

## 9. Decisiones que se presentan (con la recomendación) y supuestos

1. **≥ 1024 táctil (iPad apaisado / iPad Pro vertical):** hoy se ve la composición de computadora quieta, igual que en Inicio y Qué hacemos. **Recomendación:** dejarlo así en esta etapa (coherencia con las protegidas y cero riesgo en lg); queda como limitación declarada.
2. **Componentes > 200 líneas que se tocan (T-1):** AGENTS.md pide partirlos «cuando se toque la página». **Recomendación:** no partirlos en este trabajo (un split es un refactor que puede alterar computadora); tocarlos con el mínimo de líneas y poner lo nuevo en archivos nuevos. Si preferís cumplir la regla, se hace en una fase aparte con comparación pixel.
3. **País en Contacto:** `<select>` nativo en táctil (recomendado) vs. dropdown propio con inversión de dirección. Ambos conservan la lógica.
4. **Equipo en celular:** 2 columnas con card móvil (recomendado) vs. 1 columna.
5. **Historia del hero de Investigación:** escena de 4 constelaciones (recomendado, es el gesto de la página) vs. versión simple (hojas en flujo con constelación estática). La simple es el fallback de pantallas bajas, así que se construye igual.

Supuestos si no hay respuesta: se toman las recomendaciones.

---

## 10. Limitaciones de la verificación

- **Safari real:** no probado. Chromium emula táctil, `hover: none` y el viewport, pero no la barra dinámica de iOS ni WebKit. WebKit de Playwright se puede descargar (~100 MB) como aproximación; la prueba final la hace Gastón en su iPhone, como con el faro.
- **Rendimiento en dispositivos reales:** no medido; se controla por diseño (transform/opacity, escenas cortas) y con el trazado de Chromium en modo móvil.
- **Gestos multitáctiles / inercia real:** Playwright emula tap y wheel; el drag con dedo se aproxima con `touchscreen`.
- **Determinismo de capturas con scrub:** cada paso espera 1,1–1,4 s; ante diferencias en la comparación se repite el par antes/después en la misma corrida y en el mismo entorno.
