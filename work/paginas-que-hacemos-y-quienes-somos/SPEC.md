# SPEC — Páginas: Qué hacemos, Quiénes somos y lo que comparten con Inicio

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first); el PLAN se
  escribe después
- **Decide:** Mateo; aprueba el padre (`work/mapa-del-admin/DECISIONS.md`,
  2026-09-26: «procede en automatico»). Esta lane **no crea tablas ni suma
  dependencias**.
- **Tier:** L · lane 4b de 12 del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md)
  · rama `mateo/paginas-que-hacemos-y-quienes-somos` · worktree propio · puerto
  3022 · base `ed_paginasqh`
- **Diseño:** el brief del padre (lane 4b, «La lane 4 se parte en tres»), el
  SPEC padre §5.3 y §9, el INVENTARIO de la lane del hero
  (`git show fa8d641^:work/edicion-de-paginas/INVENTARIO.md` §0, §2, §3) y el
  camino de la 4a (`git show 48ed711^:work/paginas-inicio/SPEC.md`). Los
  textos, los largos y los conteos de abajo salen del código de hoy (el
  INVENTARIO quedó viejo en varios puntos), medidos el 2026-09-26.

---

## 1. Para qué

La 4a dejó en `main` la edición completa de Inicio y la base que sirve a
cualquier página: versiones, «Qué cambió», el aviso de choque, la pestaña SEO
y el error en el campo. Esta lane la usa, sin reinventarla, para **Qué
hacemos** y **Quiénes somos**, y resuelve lo que hoy está dos veces: **las
siete áreas** y **el método de trabajo**, que Inicio y Qué hacemos tienen cada
una por su lado.

Mismo camino que la 4a, sección por sección: esquema e inicial en
`features/<pagina>/contenido/`, su línea en `contenido/paginas.ts`, el
componente lee por props, **su archivo de datos se borra en el mismo commit**,
un commit por sección, y `scripts/comparar-render.mjs` idéntico en cada una
(las tres excepciones esperadas están en §7).

## 2. Lo compartido: una sola fuente

### 2.1. Qué está dos veces, medido

**Las siete áreas son lo mismo.** Comparadas campo por campo contra
`features/home/contenido/areas.ts`: el título de Inicio es el `nombre` de Qué
hacemos, la frase es la `idea` y el detalle es el `queEs`, **idénticos en las
siete**. La única diferencia es que Inicio marca en negrita una idea de cada
detalle (`**…**`) y Qué hacemos lo muestra sin negrita. Qué hacemos suma lo
suyo: el nombre corto (índice y hero), «Qué te llevás» (3), «Para quién» y la
foto.

**El método no es lo mismo.** Inicio tiene 5 pasos y Qué hacemos 6 verbos:

| | Inicio (5) | Qué hacemos (6) |
| --- | --- | --- |
| Nombre | Dialogamos · Investigamos · Diseñamos · Implementamos · Evaluamos | Escuchar · Investigar · Diseñar · Acompañar · Evaluar · Transformar |
| Frase en verde | las 5 de la derecha, **idénticas** | 6 (la sexta, solo acá) |
| Texto | 5 detalles propios | 6 textos **distintos** (reescritos el 2026-09-10 para decir qué hace ED en cada paso) |
| Foto | los mismos 5 archivos | los mismos 5 + uno propio; **los alt son otros** («— etapa de diálogo» / «durante la etapa de escucha») y la segunda va con otro foco |

Dos nombres cambian de verbo (Dialogamos/Escuchar, Implementamos/Acompañar),
los textos son otros a propósito y el alt va con cada uso de una foto, no con
el archivo (decisión de la lane del hero). Lo único que es realmente lo mismo
son **las cinco frases en verde**, en el mismo orden. **Se comparten las
frases; el resto no**, porque no es lo mismo: juntarlo cambiaría una de las
dos páginas.

### 2.2. Dónde vive: en Qué hacemos, que es la versión completa

Lo compartido vive en **una página dueña** y las demás lo leen de ahí:

- **Las siete áreas** son la lista de la sección `areas` de **Qué hacemos**,
  con todos sus campos: título, nombre corto, frase, detalle (con su idea en
  negrita, que solo se ve en Inicio), «Qué te llevás», «Para quién» y foto.
  La sección `areas` de Inicio se queda con lo suyo —título, bajada y
  enlace— y pierde la lista.
- **Las frases del método** son la `idea` de cada verbo de la sección
  `comoTrabajamos` de **Qué hacemos**; los pasos de Inicio pierden su `frase`
  y muestran, en el paso *n*, la idea del verbo *n* (del 1 al 5; el sexto,
  «Transformar», es solo de Qué hacemos). El orden es el de las dos escenas,
  que es estructura.

**Por qué en una página dueña.** Todo lo que dejó la 4a (borrador, versiones,
«Qué cambió», choque, restaurar, vista previa) funciona **por página**. Si lo
compartido es una sección más de Qué hacemos, todo eso le sirve tal cual, sin
una línea nueva. La otra forma —una fila aparte para lo compartido, o una
octava «página» invisible— obliga a que publicar Inicio publique también otra
fila, a versionar dos documentos a la vez y a que «Qué cambió» mezcle dos
borradores: es rehacer la base de la 4a. Y editarlo desde las dos páginas, con
el guardado yendo a la dueña, dejaría en el editor de Inicio una sección que
«Publicar» de Inicio no publica.

**Cómo se declara.** El registro gana una sola anotación, del lado de quien
usa (`lib/contenido/`, sin ED):

```ts
// en lib/contenido/compartido.ts (nuevo)
/** Lo que esta sección muestra de otra página, que se edita allá. `que` va en plural: «Las siete áreas». */
export type Compartido = { pagina: string; seccion: string; que: string };
// SeccionRegistrada gana `usa?: Compartido`
```

```ts
// contenido/paginas.ts, en inicio
areas: { nombre: "Áreas de especialización", esquema, inicial,
  usa: { pagina: "que-hacemos", seccion: "areas", que: "Las siete áreas" } },
comoTrabajamos: { nombre: "Cómo trabajamos", esquema, inicial,
  usa: { pagina: "que-hacemos", seccion: "comoTrabajamos", que: "Las frases en verde de los pasos" } },
```

Todo lo demás se deriva de esa anotación, en `lib/contenido/compartido.ts`:

- `rutasQueMuestran(registro, slug): string[]` — la ruta de la página y la de
  cada página que usa alguna de sus secciones (`["/que-hacemos", "/"]`).
- `quienesUsan(registro, slug, seccion)` — las páginas que muestran esa
  sección (para el aviso de la dueña).
- El test del registro suma: cada `usa` apunta a una sección que existe, de
  **otra** página, que a su vez no usa nada de otra (sin cadenas).

**Cómo llega al sitio.** La ruta `/` pide también el contenido de Qué hacemos
(`contenidoDe("que-hacemos")`, que ya está envuelto en `cache()`) y le pasa a
cada componente lo que necesita: `LineasAccion` recibe las siete áreas y
`ComoTrabajamos` las ideas. La proyección —solo título, frase y detalle; solo
las cinco primeras ideas— vive con el contenido de Inicio
(`features/home/contenido/compartido.ts`: `areasDeInicio`, `ideasDelMetodo`),
así la ruta sigue siendo composición y al navegador de `/` no viaja lo que
Inicio no muestra. En vista previa, `/` lee el borrador de Qué hacemos, como
lee el propio.

### 2.3. Cómo lo edita el admin: una vez, con aviso en las dos

- **En Qué hacemos** se edita como cualquier sección. Su tarjeta lleva el
  aviso: «Inicio también muestra parte de esta sección: al publicar Qué
  hacemos, cambian las dos páginas.» La ayuda de cada campo compartido dice
  dónde se ve («La idea en negrita se ve solo en Inicio»; «Las cinco
  primeras son también las frases de Cómo trabajamos de Inicio»).
- **En Inicio** la tarjeta de la sección que usa lo compartido lleva el aviso
  con el link: «Las siete áreas se editan en Qué hacemos › Áreas de
  especialización: las comparten las dos páginas.» y «Editarlas en Qué
  hacemos» (a `/admin/contenido/paginas/que-hacemos#seccion-areas`). Sus
  campos propios (título, bajada, enlace; título, detalle y foto de cada paso)
  se siguen editando ahí.
- **El aviso** es un patrón nuevo de DESIGN.md §11 («Sección compartida»):
  una línea en meta `azul-principal` debajo del título de la sección, con el
  ícono del set y, del lado de quien usa, el link con cara de link (no un
  botón: navega). Sin primario, sin verde ni naranja; contraste medido y
  escrito en §11. No es un banner de §11 «Avisos»: aquellos contestan a una
  acción, este describe la sección.
- `paginaParaEditar` suma a cada sección su `compartida` (el texto y, si
  corresponde, el link), armada en el servidor desde el registro: el editor
  solo la dibuja.

### 2.4. Publicar revalida todas las rutas que lo muestran

Cierra la deuda «publicar revalida solo su ruta» de la 4a (su SPEC §12).
`publicarEnBase` devuelve `rutas: string[]` (hoy `ruta`), sacadas de
`rutasQueMuestran`, y la acción `publicar` revalida cada una. Publicar Qué
hacemos regenera `/que-hacemos` y `/`; publicar Inicio, solo `/`. Restaurar y
descartar no publican, así que no revalidan el sitio (como hoy).

### 2.5. Lo que ya está en las bases

Inicio ya tiene la lista de áreas y las frases en su documento donde alguien
las haya guardado (las bases locales; producción todavía no tiene filas en
`paginas`, DECISIONS de la 4a). No se migran: el esquema de Inicio deja de
tener esos campos, Zod los descarta al leer, y el sitio muestra lo de Qué
hacemos (que arranca con el mismo texto). Las versiones viejas de Inicio se
restauran igual, sin esa parte.

## 3. Qué hacemos: siete secciones

En el orden del scroll. Los máximos llevan aire sobre el texto más largo de hoy
(el criterio de la 4a); donde un texto está calibrado a la escena, la ayuda lo
dice. «Resaltado» es la marca de la 4a (`**así**`, `lib/contenido/resaltado.ts`),
y la ayuda de cada campo dice cómo se ve (verde, azul, negrita, tachado).

| Clave | En el admin | Campos (máximo de caracteres) | Hoy vive en |
| --- | --- | --- | --- |
| `hero` | Hero | título en dos renglones: primero (20) · segundo (20) · bajada (160) · botón de la cápsula (24) | `que-hacemos-hero/TitularQH.tsx`, `CapsulaPortal.tsx` |
| `faro` | Escena del faro | apertura (120) · mensaje con resaltado exacto (110) · 4 frases, lista fija, cada una con su palabra clave resaltada (90) · cierre: título (60) y botón (30) | `QueHacemosHeroFaro.tsx`, `hero-faro/CierreFaro.tsx`, `preguntas-faro.ts` (`PREGUNTAS`) |
| `comoTrabajamos` | Cómo trabajamos | título (30) · 6 verbos, lista fija: verbo (16) · idea (60, **compartida**) · texto (180) · foto · rótulo de los aliados (30) | `data/areas.ts` (`MIRADA`, `MIRADA_INTRO`), `mirada-pasos/BandaAliados.tsx` |
| `areas` | Áreas de especialización | título con resaltado (40) · rótulos «Qué te llevás» y «Para quién» (24) · 7 áreas, lista fija (**compartida**): título (60) · nombre corto (24) · frase (70) · detalle con un resaltado exacto (210) · qué te llevás, lista fija de 3 (32) · para quién (90) · foto | `data/areas.ts` (`AREAS`), `areas/IndiceAreas.tsx`, `areas/PanelArea.tsx` |
| `niveles` | Niveles | título con resaltado (45) · frase en dos renglones: primero (20) y segundo, en verde (30) · bajada con resaltado (120) · 5 niveles, lista fija: nombre (24) · texto (70) | `NivelesEscala.tsx`, `data/niveles.ts` |
| `proyectos` | Proyectos y aplicaciones | volanta con resaltado (40) · título con resaltado (40) · tres capítulos con nombre propio (4, 3 y 1 fichas): título (50) · bajada con un resaltado (130) · fichas: sello (40) · cifra (12) · unidad (28) · nombre (60) · texto (140) | `data/proyectos.ts` |
| `cierre` | Cierre | título (60) · texto (160) · texto del botón (30) · texto del link (40) | `CierreQueHacemos.tsx` |

- **Los conteos fijos son de la escena:** 4 frases del faro (`VERBO_POS`,
  `HAZ_VERBO`, `PUNTOS_VERBO`), 6 verbos (dos grupos de 3), 5 niveles (`POS`,
  `FIN`, la víbora), y los capítulos 4 + 3 + 1 (`LADOS`, la víbora dibujada
  para 4 | 4). Por eso los capítulos son **tres grupos con nombre** y no una
  lista: cada uno tiene su propia cantidad de fichas. Donde hoy un módulo que
  no dibuja lee el largo de la lista (`grupos.ts`, `coreografia-niveles.ts`,
  `tiempos-faro.ts`), pasa a leer la constante de su escena, que es la misma
  que usa `listaFija`.
- **El texto de una ficha:** el tipo de hoy pide «≤ 20 palabras»; el campo lo
  dice en la ayuda y el tope es de caracteres (140).
- **El sello** se parte en renglones en « · », como hoy; la ayuda lo dice.
- **Lo que un `aria-label` repite de un texto editable sale de ese texto**
  (el `nav` de las áreas, el de Niveles, el de Proyectos, el `h2` sr-only del
  faro): con el mismo texto de hoy, el HTML no cambia, y si alguien lo edita
  lo siguen. Es lo que la revisión de la 4a encontró en Inicio.

## 4. Quiénes somos: cuatro secciones

| Clave | En el admin | Campos (máximo de caracteres) | Hoy vive en |
| --- | --- | --- | --- |
| `hero` | Hero | título en dos renglones: primero (24) y segundo, en verde (24) · bajada (160) · botón (30) | `QuienesSomosHero.tsx` |
| `origen` | Origen, sentido y evolución | origen: título (32) · texto (160) · la cita: 3 renglones, lista fija, el tercero en verde (32) · quién la dijo (110) · la pregunta (30) · la respuesta (180) · qué es ED: volanta (40) · título con un resaltado (70) · 5 hitos, lista fija: título (14) · texto (110) · remate: frase con resaltado (40) y texto (160) · 3 fotos, lista fija | `OrigenEd.tsx`, `origen/PilaresOrigen.tsx`, `origen/BeatRemate.tsx`, `origen/data.ts` |
| `mirada` | Nuestra mirada | volanta (30) · título con un resaltado (60) · 3 principios, lista fija: nombre (32) · frase con lo tachado resaltado (60) · afirmación con un resaltado (80) · 5 fichas, lista fija (48) · síntesis con un resaltado (100) · puente (110) | `MiradaEd.tsx`, `mirada/constelacion-mirada.ts`, `mirada/SintesisMirada.tsx` |
| `equipo` | Quiénes sostienen ED | volanta (30) · título con un resaltado (40) · bajada (140) · rótulos de los niveles: dirección general (30) · dirección (30) · áreas y proyectos: volanta (30) y título (50) · facilitación: volanta (30) y título (50) | `ImpulsanEd.tsx` |

- **La pregunta se escribe letra por letra** con el scroll: más de ~26 letras
  (sin espacios) se pisa con la respuesta. Tope 30 con esa ayuda.
- **La cita es una dramatización** que el código marca «VALIDAR con el
  cliente»: la marca sigue, en el comentario del inicial.
- **El remate** hoy es una lista de 4 palabras con la 1.ª y la 4.ª en verde
  por su índice; pasa a ser una frase con resaltado («**Vivir** para hacer
  **vivir.**»), y el componente la parte en palabras como hoy.
- **La frase de un principio va sin punto final**: lo pone el sitio (así se
  arma hoy, `frasePunto`), y lo tachado es su resaltado («La matemática no es
  solo **resolver cuentas**»); la ayuda lo dice y el esquema rechaza el punto
  final. Con el punto afuera, el HTML queda igual también en el principio que
  no tacha nada.
- **Las 3 fotos del origen** se ven solo en escritorio con movimiento: la
  ayuda lo dice.
- **«Quiénes sostienen ED» muestra el equipo, que es de la lane 8:** acá solo
  los textos propios de la sección. Las personas, sus niveles, sus fotos,
  «Ver trayectoria» y el perfil siguen en `data/equipo.ts` hasta Equipo. La
  ayuda de la sección lo dice.
- **El botón del hero y la volanta del equipo dicen hoy lo mismo** que el menú
  («Quiénes sostienen ED»): los dos se editan, cada ayuda nombra al otro, y el
  menú sigue en `config/nav.ts`.
- `aria-label` que repiten texto editable: el de Nuestra mirada sale de su
  volanta, el del equipo de su volanta más « — el equipo», el `h1` sr-only
  del hero de sus dos renglones. HTML igual.

## 5. SEO de las dos

Una línea cada una en el registro, como dejó la 4a: `seo: seoInicial` desde
`features/que-hacemos/contenido/seo.ts` y `features/quienes-somos/contenido/seo.ts`.
El inicial es la metadata de hoy **resuelta**: el título con el template del
layout («Qué hacemos | Empoderamiento Docente», «Quiénes somos | Empoderamiento
Docente»), su descripción (193 y 151 caracteres) y sin imagen propia. Cada
página cambia su `metadata` fijo por un `generateMetadata` que lee
`contenidoDe(...).seo` con `metadataDeSeo` (lo de la 4a).

**El `<head>` cambia en cuatro etiquetas, y es un arreglo.** Hoy las dos
páginas no dan su `openGraph`, así que heredan el del layout: al compartir
`/que-hacemos` la tarjeta dice el título y la descripción de **Inicio**
(`og:title`, `og:description`, `twitter:title`, `twitter:description`).
`metadataDeSeo` manda el de la página. `<title>`, `description` y la imagen
quedan iguales; comparar-render lo muestra como DISTINTA en `head` en esas dos
páginas y en ese paso, y la evidencia lista las etiquetas.

## 6. Lo que queda en código, a propósito

- **Los nombres con que se navega:** las anclas (`#areas`, `#area-<id>`,
  `#equipo`…), los `data-indice` del índice del celular, el menú
  (`config/nav.ts`) y los `aria-label` que nombran una región sin repetir un
  texto de la página («Qué hacemos», «Qué hace Empoderamiento Docente»,
  «Cierre», «Origen, sentido y evolución»).
- **Los nombres de los tres tiempos del origen** («01 — Origen», «Sentido»,
  «Evolución»): nombran los movimientos de la escena, como su `aria-label`.
- **Números e íconos que salen del índice** («01», «Área 01», «Proyecto 01»,
  «01 / 08»), los colores, la geometría y los tiempos de cada escena, el
  logo del faro y el sello.
- **Los países y el pictograma de cada ficha:** una bandera es un dibujo y no
  hay un tipo de campo para elegir de una lista cerrada que no sea una ruta;
  sumarlo es un séptimo tipo (AGENTS.md §12). Van en una lista por posición
  junto a las fichas (`proyectos-aplicaciones/`), con los nombres de los
  países.
- **Los destinos del cierre** (`/contacto?tema=formacion`, `/investigacion`):
  el del botón lleva el tema del formulario, que no es una ruta del menú. Se
  editan los textos.
- **Los logos de aliados:** `config/aliados.ts` (AGENTS.md §5.4), en Aliados
  (lane 9).
- **Los `hechos` de cada área no se publican** desde el 2026-09-09 y ningún
  componente los lee: no entran al esquema y se van con `data/areas.ts`. Los
  15 están, textuales, en `docs/content/copy-que-hacemos.md` §3, y el comentario
  que pedía conservarlos se muda a esa referencia.
- `aria-label` de la cápsula («Entrar al recorrido de lo que hacemos») no
  contiene su texto visible («Entrá al recorrido»): es un problema de hoy
  (WCAG 2.5.3) que no se arregla acá; va a los pendientes del cierre.

## 7. El sitio no cambia, salvo tres diferencias que se explican

Cada paso que toca una página se prueba con
`node scripts/comparar-render.mjs %TEMP%\ed-paginasqh\antes apps/sitio`
contra el build de `48ed711` (ya hecho, «11 páginas, render idéntico»), y sale
0. Las excepciones, cada una en su paso y con su salida en PROGRESS:

1. **Cómo trabajamos de Qué hacemos:** la foto del segundo verbo tiene hoy la
   clase `object-[50%_82%]`; con el foco de la foto (`{ x: 0.5, y: 0.82 }`),
   la misma posición va en el `style` de la imagen (`estiloDeFoco`). Se ve
   igual; comparar-render la marca en `imagenes` de `/que-hacemos` por el
   `style`.
2. **SEO de Qué hacemos** y 3. **SEO de Quiénes somos:** las cuatro etiquetas
   de §5.

Los bytes de JS se miran en cada paso: ninguno puede saltar, porque un
componente cliente que importa un valor de `features/*/contenido/` se lleva
Zod entero (DECISIONS de la 4a). Los componentes importan de ahí solo tipos.

## 8. Componentes que se parten

AGENTS.md §6: el que pasa el tope y se toca, se parte; el que no se toca, no.
Medidos en líneas de código, sin comentarios:

- **`ImpulsanEd.tsx` (282) se toca y se parte**, con la receta de
  `docs/AI_GUIDELINES.md` §2 en `quienes-somos/components/impulsan-ed/`: la
  coreografía a `coreografia-equipo.ts` (una `crear…` que devuelve su limpieza,
  llamada desde el mismo efecto), `Nivel.tsx` y `KickerRotulo.tsx`. Render
  idéntico, en su propio paso, antes de pasar sus textos a props.
- **Ningún otro componente con copy de estas páginas pasa las 200:** el más
  largo es `NivelesEscala.tsx` (121). `FaroEscena.tsx` (377),
  `profileParts.tsx` (428), `PersonCard.tsx` y `TeamProfileOverlay.tsx` no se
  tocan: el faro no tiene texto y lo demás es del equipo.

## 9. Dónde vive el código

```
apps/sitio/src/
├── lib/contenido/compartido.ts (+ .test.ts)   Compartido, rutasQueMuestran, quienesUsan
├── lib/contenido/documento.ts                 SeccionRegistrada.usa?
├── contenido/paginas.ts (+ .test.ts)          que-hacemos (7 + seo) · quienes-somos (4 + seo) · `usa` en inicio
├── features/que-hacemos/contenido/            hero, faro, como-trabajamos, areas, niveles, proyectos, cierre, seo
├── features/quienes-somos/contenido/          hero, origen, mirada, equipo, seo
├── features/home/contenido/                   areas y como-trabajamos pierden lo compartido;
│                                              compartido.ts (areasDeInicio, ideasDelMetodo)
├── features/que-hacemos/data/                 se borra entera (la estructura de las fichas
│                                              pasa a proyectos-aplicaciones/)
├── features/quienes-somos/components/
│   ├── origen/data.ts                         queda la geometría (NODOS, PATH_D)
│   ├── mirada/constelacion-mirada.ts          queda la geometría y los colores
│   └── impulsan-ed/                           las piezas de ImpulsanEd
├── datos/acciones/publicar-paginas.ts (+test) `rutas`: las que muestran la página
├── datos/acciones/paginas.ts                  revalida cada ruta
├── datos/consultas/editor-de-paginas.ts       cada sección con su `compartida`
├── admin/paginas/                             el aviso de sección compartida
└── app/(sitio)/page.tsx · que-hacemos/page.tsx · quienes-somos/page.tsx
```

Las cuatro fronteras siguen: `lib/contenido/` no sabe de ED ni importa `@/`;
`datos/` es la única puerta a la base; `app/` son rutas (componen, no
transforman); `features/` recibe props. No hay Server Actions nuevas.

**Otras lanes en vuelo:** 4c suma páginas a `contenido/paginas.ts` (concilia
quien rebasea segundo); la lane 6 muda `admin/campos/` a `packages/kit-admin`
(esta lane no toca `admin/campos/`; si al rebasear se mudó, se sigue).

## 10. Docs

- **README «Editar las páginas»:** Qué hacemos y Quiénes somos, y lo
  compartido (dónde se edita, que publicar cambia las dos).
- **DESIGN.md §11** (lo revisa Mateo en el PR): el aviso de sección compartida.
- **AGENTS.md §13** (lo revisa Mateo en el PR): la línea de esta fase.
- **`docs/content/`:** `arquitectura-que-hacemos.md` y
  `que-hace-ed-fuentes.md` apuntan a `data/areas.ts`, que se borra: pasan a
  apuntar al contenido nuevo.

## 11. Pruebas

- **Unitarias** (`pnpm test`): `compartido` (las rutas de la dueña y de quien
  usa; quién usa una sección); el registro (cada parte pasa su esquema con su
  inicial —ya cubre las secciones nuevas—, y cada `usa` apunta a una sección
  real de otra página, sin cadenas); `areasDeInicio` e `ideasDelMetodo`.
- **De integración contra el Postgres local** (`ed_paginasqh`): publicar Qué
  hacemos devuelve `["/que-hacemos", "/"]` y publicar Inicio `["/"]`.
- **Render:** comparar-render después de cada paso (§7).
- **En el navegador** (Orca, `localhost:3022`, los tres temas, 390 de ancho y
  teclado): las dos páginas en el editor, sus pestañas SEO, el aviso en las
  dos puntas y su link; editar una área en Qué hacemos y verla en la vista
  previa de `/`; y **la revalidación de punta a punta**: con un build de
  producción (`next start -p 3022`), publicar Qué hacemos y ver `/` con el
  cambio sin rebuildear.

## 12. Fuera de alcance

- Investigación, Biblioteca y Contacto (4c); Novedades (lane 6); el equipo
  como entidad (lane 8); los logos (lane 9).
- Cambiar geometría, animaciones o conteos de las escenas.
- Publicar los `hechos`; revisar el copy («pensamos juntas» del cierre).
- El `aria-label` de la cápsula (§6) y los comentarios viejos de archivos que
  esta lane no toca: van a los pendientes del cierre.

## 13. Lo que el padre decide al aprobar

1. **Lo compartido vive en Qué hacemos** (§2.2), se edita solo ahí y aparece
   con su aviso en las dos páginas.
2. **Del método se comparten solo las cinco frases** (§2.1). La alternativa
   es no compartir nada del método y dejar el aviso cruzado que ya tiene
   Inicio; la recomiendo menos porque las frases son idénticas y son copy
   oficial.
3. **El `<head>` de las dos páginas cambia en `og:`/`twitter:` title y
   description** (§5): pasan a ser los de la página.
4. **Lo que queda en código** (§6), en especial los nombres de los tres
   tiempos del origen, los países de las fichas y los destinos del cierre.
