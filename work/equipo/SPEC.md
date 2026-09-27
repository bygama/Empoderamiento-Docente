# SPEC — Equipo

- **Fecha:** 2026-09-27
- **Estado:** aprobado por el padre el 2026-09-27, con un cambio (J: sin
  arrastre) y dos precisiones (H: los títulos cortos de la Biblioteca; N:
  vincular por palabra, sin tildes); ver DECISIONS
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y dependencias incluidas: DECISIONS del padre,
  2026-09-26)
- **Tier:** L · lane 8b del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/equipo`, dev server en el 3030, base `ed_equipo`
- **Diseño:** el brief del padre (lane 8b), sobre el SPEC padre §5.3 (la ficha
  de Equipo) y §9, las DECISIONS del padre («La lane 8 se parte en dos»,
  «SPEC de `novedades-y-kit` (6) aprobado», «SPEC de `biblioteca` (8a)
  aprobado»), el modelo de entidad de Novedades
  ([ADR-0014](../../docs/architecture/adrs/0014-kit-admin-y-modelo-de-entidad.md))
  y el spec del admin (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`)
  §6. Esto lo formaliza; no lo vuelve a decidir. Lo que el brief deja abierto
  y acá se propone está marcado **[propuesta]**, y la lista entera está en §13.

---

## 1. Qué se quiere

Los 15 perfiles del equipo viven hoy en
`features/quienes-somos/data/equipo.ts` (3071 líneas), con sus publicaciones
tipeadas a mano adentro de cada etapa del recorrido. Esta lane los pasa a la
base, con su pestaña en Contenido, y hace que **las publicaciones de cada
perfil salgan de la Biblioteca**: la lane 8a dejó la tabla `autorias`, donde
cada autor lleva la clave de su perfil del Equipo como texto, esperando esta
tabla; acá esa clave se vuelve una FK de verdad.

El sitio no cambia salvo lo que §8.2 lista y justifica: `/quienes-somos` lee
el equipo de la base con el mismo HTML de hoy (`scripts/comparar-render.mjs`),
y los perfiles abiertos muestran las mismas tarjetas, con el título, el año,
el tipo y el link de cada publicación tomados de su material.

## 2. Lo que ya existe y se usa

| Pieza | Dónde | Qué se toma |
| --- | --- | --- |
| `editarContenido` (los tres roles) | `packages/auth/src/permisos.ts` | tal cual; ninguna capacidad nueva |
| La guarda de Contenido y sus pestañas | `(protegido)/contenido/layout.tsx`, `admin/contenido/` | cubre las dos pantallas; nada de acá lo lee un rol y otro no (§10) |
| El molde de una entidad: dos esquemas, `columnasDe`, `publicadoDe`, choque, publicar con 308, despublicar, descartar, borrar | `datos/acciones/*-novedades.ts`, `datos/consultas/*novedad*`, `admin/novedades/` | copiado con las columnas de esta tabla |
| `redirecciones` y el 308 sin cadenas | `prisma/schema/sitio.prisma`, `publicar-novedades.ts` | el slug de un perfil |
| La vista previa (Draft Mode acotado) | `datos/vista-previa.ts` | el perfil abierto en `/quienes-somos` |
| `materiales` y `autorias`, `materialesDelSitio()`, `firmaDe`, `TIPOS` | `prisma/schema/materiales.prisma`, `datos/consultas/materiales.ts`, `features/biblioteca/contenido/` | de donde salen las publicaciones |
| «Agregar material» en dos pasos | `admin/biblioteca/AgregarMaterial.tsx`, `/admin/biblioteca/nuevo` | recibe la persona ya elegida (§7.3) |
| `CampoFoto`, `TextoCorto`, `Parrafo`, `Seleccion`, `Casilla`, `ListaVariable` | `packages/kit-admin` | el formulario |
| Encabezado, Volver, Lista (con miniatura), Insignia, Estado vacío, Confirmación, Qué cambió, Ficha de una entidad | `admin/armazon/`, DESIGN.md §11 | consumidos |
| Actividad, frases, módulos de Cuentas › Actividad | `datos/actividad.ts`, `admin/actividad/frase.ts` | una entrada por tipo nuevo |
| El registro de usos de fotos | `datos/fotos/registro.ts` (**de la lane 9, todavía no en `main`**) | Equipo suma su entrada (§9) |

## 3. Lo que hay hoy en `equipo.ts`, contado

| Qué | Cuánto | Qué pasa |
| --- | --- | --- |
| Personas | 15, en cuatro niveles: 1 · 2 · 6 · 6 | entran a `equipo`, publicadas, en el orden del archivo (§4) |
| Con recorrido inmersivo (`profile`) | 14; Marcela Cano tiene solo el perfil básico | columnas del recorrido, nulas en la de Marcela |
| Tarjetas de publicación en las etapas | **78**, en 18 etapas | pasan a referencias (§5) |
| Publicaciones distintas en esas tarjetas | **70** | 51 ya están en la Biblioteca; faltan 19 (§5.3) |
| `pubs` de la persona (17 entradas) | nada del sitio las lee | no se mudan: las reemplazan las autorías (§4.3) |
| `bio` (15) y `linkedin` (5) | nada del sitio los lee | no se mudan; quedan escritos para la fase 4 (§4.3) |
| Fotos en `public/equipo/` | 15 `.jpg`, una por persona, más el recorte de Daniela (`.png` y `.webp`) que nada usa | las 15 entran a `fotos` (§9) |
| Autorías vinculadas a una persona | 69, de 13 personas | pasan a la FK (§4.2) |

El SPEC padre decía «33 de 36 repetidas»; contado sobre lo que el sitio
muestra, son 51 de 70. La cuenta está en DECISIONS con el script que la hizo
(no se commitea).

## 4. Las tablas

### 4.1. `equipo`

Regla de inventario (spec del admin §6): una columna por lo que hoy se ve y
tiene `equipo.ts`, con el nombre en español. Lo publicado en columnas y el
borrador en un documento, como Novedades **[propuesta A]**.

**La tarjeta y el perfil básico**

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `id` | `text`, pk (uuid) | la ficha: `/admin/contenido/equipo/[id]`; lo que apunta `autorias.persona_id` | nueva |
| `slug` | `text`, único, nulo | `/quienes-somos?persona=<slug>` hoy y la ficha de la fase 4 | `key` |
| `nombre` · `rol` · `pais` | `text`, nulos | lo que dice la tarjeta | `nombre` · `rol` · `pais` |
| `nivel` | `smallint`, nulo | 1 Dirección general · 2 Dirección · 3 Líderes de área y proyecto · 4 Facilitación y diseño de materiales | `tier` |
| `foto` | `jsonb`, nulo | `{ src, alt, foco }`: la foto de la tarjeta, de Fotos; el alt de hoy es el nombre, el foco sale del encuadre | `fotoDe(key)` · `imagePosition` |
| `sin_foto` | `boolean`, `false` | la persona pidió no publicar su foto: la tarjeta va tipográfica | `sinFoto` |
| `acercamiento` | `double precision`, `1` | cuánto se acerca la foto para emparejar el tamaño de los rostros (1 a 1,5) | `imageZoom` |
| `orden` | `integer` | el lugar dentro de su nivel; fuera del borrador (§6.2) | el orden del archivo |

**El recorrido** — nulas todas juntas en un perfil sin recorrido

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `nombre_completo` · `rol_completo` | `text` | el nombre validado y el rol entero | `fullName` · `role` |
| `lugar` · `origen` | `text`; `origen` puede faltar | dónde vive y de dónde es | `location` · `origin` |
| `titular` · `intro` | `text` | el titular del recorrido y su bajada | `headline` · `intro` |
| `formacion` | `jsonb` | `["Profesora de Matemática", …]`, hasta 6 | `formation` |
| `categorias` | `jsonb` | `[{ clave, etiqueta, color }]`, hasta 6: el índice vivo del recorrido; color `verde`, `azul` o `naranja` | `categories` |
| `figura` | `jsonb` | `{ tipo, foto, apaisado }`: `marco`, `recorte` o `sin`; la foto (de Fotos) y si es una lámina apaisada | `figura` · `cutout` · `cutoutPosition` · `marcoApaisado` |
| `etapas` | `jsonb` | las etapas en orden, de 1 a 8 (§4.1.1) | `stages` |
| `cierre_titulo` · `cierre_texto` · `cierre_texto_2` | `text`; el segundo puede faltar | el cierre del recorrido | `closing` |

**El molde**: `publicado` · `publicado_en` · `publicado_por`, `borrador` ·
`borrador_en` · `borrador_por`, `creado_en` · `creado_por`, como `novedades`:
despublicar conserva las columnas.

- **`cutoutSize` no se muda** **[propuesta A]**: con la figura en marco (las
  14 de hoy) la foto va con `fill` y las medidas no se usan; con recorte las
  lee la consulta de la fila de `fotos` de esa foto, que las tiene medidas.
- **La Dirección general es una sola**, con un índice único parcial
  (`equipo_una_sola_direccion_general`, sobre `nivel` donde `nivel = 1` y
  `publicado`), como la destacada de Novedades: el masthead tiene un lugar.
  **La Dirección lleva hasta dos** (una de cada lado): lo chequea publicar,
  en la transacción **[propuesta I]**.
- **Topes**, del contenido de hoy con aire, cada uno con su porqué en la ayuda
  del campo: nombre 30 (hoy 17), rol 60 (47), país 30, nombre completo 50,
  rol completo 90, lugar y origen 50, titular 100 (80), intro 400 (332), una
  formación 120 (97), una categoría 50 (41), título de cierre 70, texto de
  cierre 300 (238), segundo texto 200 (162).

#### 4.1.1. Una etapa

`{ clave, categoria, volanta, color, periodo, composicion, titulo, texto, cita, hitos, ramas, territorios, publicaciones }`

| Campo | Qué es | Tope | De dónde |
| --- | --- | --- | --- |
| `clave` | fija, no se edita: las de hoy y, para una nueva, una al azar | — | `id` |
| `categoria` | la `clave` de una de las categorías del perfil | — | `categoryId` |
| `volanta` · `periodo` | arriba del título | 50 (40) · 24 (17) | `eyebrow` · `period` |
| `color` | `verde`, `azul` o `naranja` (el acento, nunca un fondo) | — | `color` |
| `composicion` | `editorial`, `ficha`, `concepto`, `hitos`, `mapa`, `ramas` o `sintesis`: cómo se arma la etapa | — | `variant` |
| `titulo` · `texto` | | 100 (79) · 650 (542) | `title` · `body` |
| `cita` | solo en `concepto`: la frase destacada | 160 (130) | `quote` |
| `hitos` | `[{ periodo, titulo, detalle, principal }]`, hasta 8 (hoy 6) | 24 · 130 · 200 | `milestones` |
| `ramas` | `[{ periodo, lugar, detalle }]`, las estancias de `ficha`, hasta 4 | 16 · 60 · 130 | `branches` |
| `territorios` | los de `mapa`, hasta 8 (hoy 5) | 70 (56) | `tags` |
| `publicaciones` | §5, hasta 10 (hoy 8) | — | `publications` |

El número de la etapa es su lugar (hoy `n` es siempre el lugar más uno). Qué
usa cada composición lo dice su ayuda y el formulario muestra solo eso
(§7.2); lo que una composición no usa se guarda igual y el sitio no lo lee.

### 4.2. `autorias.persona` → `autorias.persona_id`, con su FK

**[propuesta C]**

- La columna de texto `persona` (la clave, `daniela-reyes`) se va y entra
  **`persona_id`**, `text`, fk → `equipo.id`, **`ON DELETE SET NULL`**: borrar
  un perfil deja la autoría como de afuera, con su nombre, y el material sigue
  igual en el sitio. Índice en `persona_id`, como el de hoy.
- **La FK va al `id` y no al `slug`**: el slug se puede cambiar (con su 308), y
  los borradores de los materiales guardan la persona adentro de un `jsonb`,
  donde un `ON UPDATE CASCADE` no llega.
- En la misma migración: las 69 autorías vinculadas pasan de la clave al id
  (por `slug`), y **los borradores de los materiales** que tengan autorías con
  persona se reescriben igual (hoy ninguno en `ed`; la migración lo hace
  igual, por si producción tiene alguno).
- El documento de un material sigue diciendo `persona`, ahora con el id. La
  validación contra las 15 claves del código (`z.enum` en
  `campos-del-material.ts`) pasa a la base: guardar y publicar un material
  chequean que la persona exista, y si no, el campo lo dice («Esa persona ya
  no está en el Equipo»). Las opciones del select salen de `equipo`.

### 4.3. Lo que no se muda **[propuesta B]**

La regla de inventario pide lo que **se ve**. Nada del sitio lee `bio`,
`linkedin` ni `pubs` (buscado en todo `src/`):

- **`pubs`** queda reemplazada por las autorías: de sus 17 entradas, las que
  tienen título están en la Biblioteca; las cuatro de Judith Hernández son
  referencias cortas («Hernández, Páez y Aké (2026)»), tres de ellas de
  materiales que ya están.
- **`bio` y `linkedin`** son datos que dio cada persona y que la fase 4 va a
  querer (el JSON-LD de cada perfil). Como el `data.ts` se borra, quedan
  escritos en `docs/content/equipo-sin-publicar.md` —el precedente es
  `docs/content/copy-que-hacemos.md`— y el spec del admin §6 lo dice al lado
  de las personas de referencia de Ajustes.

## 5. Las publicaciones salen de la Biblioteca

### 5.1. Una publicación de una etapa **[propuesta D]**

Una etapa tiene su lista curada: **cuáles, en qué etapa, en qué orden y cuál
destacada** es parte del recorrido (Gabriela Buendía reparte las suyas entre
«Libros pensados para el aula» y «La tortilla, la huerta…»; Iván Pérez firma
10 materiales y su recorrido muestra 7). Lo que dice cada una sale del
material:

```ts
type Publicacion =
  | { origen: "biblioteca"; material: string; detalle: string; conceptos: string[]; destacada: boolean }
  | { origen: "sin-link"; titulo: string; tipo: Tipo; anio: string; detalle: string; conceptos: string[]; destacada: boolean };
```

- **De la Biblioteca:** el título, el año (de `fecha`), el tipo y el link son
  los del material. Solo se puede elegir **un material donde la persona
  firma** (sus autorías publicadas): la lista de opciones es esa, y publicar
  lo vuelve a chequear. El sitio muestra la tarjeta solo si el material está
  publicado; si se oculta o se borra en la Biblioteca, la tarjeta se va del
  perfil sola, y la ficha del perfil lo marca.
- **`detalle`** es la línea de abajo del título, dicha desde el perfil («Con
  Karla Gómez-Osalde · Propuesta Educativa», «Capítulo — … · Atena
  Editora»): la Biblioteca no guarda con quién desde el punto de vista de
  cada autora, ni el libro de un capítulo. **Vacía, se lee la fuente del
  material** **[propuesta G]**, como la firma y la cita de la 8a: la
  migración deja vacías las 7 que hoy dicen exactamente la fuente.
- **`conceptos`** (hasta 8, de 30) son de la persona: el mismo material lleva
  siete en el perfil de Daniela Reyes y cuatro en el de Wendolyne Ríos.
- **Una destacada por etapa**, como mucho; en `concepto`, la tarjeta es la
  destacada o, si no hay, la primera (como hoy).
- El mismo material puede estar en dos etapas del mismo perfil (hoy, el libro
  de Gedisa en dos de Daniela Reyes), no dos veces en la misma.

### 5.2. El rótulo de la tarjeta **[propuesta F]**

La tarjeta del perfil usa cuatro rótulos (hoy «Libro», «Artículo»,
«Colección», «Materiales»); la Biblioteca, siete tipos. Se mapean en
`features/quienes-somos/contenido/`: Artículos, Actas de congreso y
Divulgación → «Artículo»; Libros y Capítulos de libro → «Libro»; Materiales →
«Materiales»; Tesis → «Tesis». El matiz («Capítulo — …», «Nota de
divulgación · …») ya lo lleva el detalle. Con esto, de las 59 tarjetas que
salen de la Biblioteca cambia el rótulo de una (§8.2). La alternativa —el
tipo en singular, «Capítulo de libro»— cambia el rótulo de 17.

### 5.3. Las 19 que no están en la Biblioteca **[propuesta E]**

| | Con link (5) → entran a la Biblioteca | Sin link (14) → quedan en la etapa, «sin link» |
| --- | --- | --- |
| Daniela Reyes | *Matemática en Red* (2024, colección, buenosaires.gob.ar) | *La transversalidad de la proporcionalidad* (2013, SEP) |
| Gabriela Buendía | *Diálogo entre lo comunitario y lo escolar: la cocción de la tortilla de maíz…* (RELIME 2024, DOI) | seis libros y capítulos de 2011 a 2016 (Díaz de Santos, Lectorum, MAA, Gedisa); *Docencia en matemáticas bajo la perspectiva socioepistemológica* (2024); *¿Ya está el pan?* (2019) |
| Luis López | *Emergencia de las ecuaciones paramétricas en Viète y Descartes* (Góndola 2022, DOI) | *Producción de fórmulas* (capítulo de *Matemática en Red*, 2024); *Matemáticas, 1.º a 4.º grado de primaria* (Yucatán, 2015 – 2017) |
| Pedro Vidal-Szabó | *Diseño de una trayectoria hipotética de aprendizaje…* (RELIME 2024, DOI) · *Secuencia de aprendizaje lúdica…* (Educación Matemática 2025, DOI) | — |
| Paola Balda | — | *Soacha celebra el saber…* (nota en *Solidario*, 2025) |
| Darly Ku Euán | — | *Interpretación del movimiento…* (capítulo, UAdeC 2023) |
| Luis Cabrera | — | *Matemáticas 2, Serie espiral del saber* (Santillana, 2015) |

- **Las 5 con link entran como materiales publicados**, en la misma migración
  (la recomendación del brief: una sola fuente). Cumplen lo que la Biblioteca
  pide —un link a la revista o a la página— y se cargan como los 57: los
  autores y la cita de Crossref bajados una vez al escribir la migración y
  guardados como datos fijos (la regla de la 8a), las personas de ED
  vinculadas, la portada tipográfica generada, sin descripción (es opcional
  y no se inventa: la Biblioteca los marca «datos incompletos» para que ED la
  escriba). Tipo, tema, público y formato propuestos, a confirmar con el
  resumen de cada uno al escribir la migración:

  | Material | Tipo | Tema | Público | Formato |
  | --- | --- | --- | --- | --- |
  | *Matemática en Red* | Materiales | Desarrollo profesional docente | Docentes | Web |
  | *Diálogo entre lo comunitario y lo escolar…* | Artículos | Ciudadanía y justicia social | Investigadoras e investigadores | PDF |
  | *Emergencia de las ecuaciones paramétricas…* | Artículos | Historia y epistemología | Investigadoras e investigadores | PDF |
  | *Diseño de una trayectoria hipotética…* | Artículos | Estadística y probabilidad | Investigadoras e investigadores | PDF |
  | *Secuencia de aprendizaje lúdica…* | Artículos | Estadística y probabilidad | Docentes | PDF |

- **Las 14 sin link no entran a la Biblioteca**: su esquema pide un link
  (`urlDe`), su catálogo es «lo que lleva a la revista o la editorial» (SPEC
  padre §5.5) y cargarlas pediría inventar tema, público y formato. Quedan
  como publicaciones `sin-link` de su etapa, escritas **una sola vez**, con
  su título, su tipo (de la lista de la Biblioteca), su año como texto
  («2015 – 2017»), su detalle y sus conceptos. La regla, dicha en el
  formulario: **con link, va a la Biblioteca; sin link, se escribe acá.**

## 6. El modelo de entidad

### 6.1. Los dos esquemas y las acciones

Dos esquemas Zod con los mismos campos y topes —uno para publicar (y leer),
otro para guardar, donde todo puede estar vacío—, en
`features/quienes-somos/contenido/persona.ts`, y lo que no necesita Zod
(niveles, composiciones, colores, topes, el rótulo de §5.2) en su
`modelo.ts`, como `novedad.ts`. Las acciones empiezan por la sesión y
`editarContenido`, validan con Zod y escriben con el cliente inyectado.

| Acción | Qué hace |
| --- | --- |
| Crear | la ficha vacía en `/nuevo`; el primer guardado crea la fila, último en su nivel |
| Guardar borrador | con el choque de siempre |
| Vista previa | `/quienes-somos?persona=<slug>`: el perfil abierto, con el borrador |
| Qué cambió | campo por campo; las etapas, etapa por etapa |
| Publicar | valida entero; cada publicación de la Biblioteca existe y la persona la firma; el nivel tiene lugar (§4.1); copia a columnas; 308 si cambió el slug; si cambió de nivel, queda último en el nuevo |
| Despublicar | sale del sitio (la tarjeta y el perfil), conserva las columnas |
| Descartar cambios | vuelve a lo publicado |
| Borrar | con confirmación: la fila, sus redirecciones, y sus autorías quedan de afuera, también en los borradores de los materiales **[propuesta O]** |

### 6.2. El orden **[propuesta J]**

- El orden es **dentro de un nivel** y **no va al borrador**: es del equipo,
  no de una persona (como el orden de los aliados en la lane 9). Se aplica en
  el momento y regenera `/quienes-somos`.
- **Se mueve con «Subir» y «Bajar»** en cada fila, y **no arrastrando**
  (cambio del padre a la propuesta J): igual que Aliados en la lane 9 y que
  la regla de DESIGN.md §11; el arrastre nativo no anda en pantallas
  táctiles y suma código que los botones ya cubren.
- La acción copia la forma de `moverAliado` de la lane 9:
  **`moverPersona({ id, hacia })`**, un paso dentro de su nivel por clic, en
  una transacción, aplicado en el momento; el foco sigue a la persona movida
  y el cambio se anuncia en un `role="status"`.
- **Equipo es el segundo consumidor** de ese orden: al rebasear sobre la 9,
  el patrón sube a DESIGN.md §11 como «Lista que se ordena» (una regla que no
  nombra ruta) y la entrada de Aliados apunta a él. Si lo compartido en
  código (el foco que sigue, el anuncio, el botón quieto mientras mueve)
  queda duplicado, se extrae a una pieza de `admin/armazon/` que usen las dos
  listas; si lo compartido es solo la forma, alcanza con la regla.

### 6.3. La URL **[propuesta K]**

El slug es la clave de hoy (`daniela-reyes`): lo usan `?persona=` y el botón
«Copiar link» del perfil. Publicar con otro slug escribe el 308 de
`/quienes-somos/equipo/<viejo>` a `/quienes-somos/equipo/<nuevo>` en
`redirecciones`, sin cadenas, como los casos: la ficha es de la fase 4 y la
redirección ya queda. `?persona=<viejo>` no llega al servidor como ruta y no
se puede redirigir: la página abre sin el perfil, y la ayuda del campo lo
dice.

## 7. El admin

Todo cuelga de `/admin/contenido`, con las cinco pestañas arriba
(`EncabezadoDeContenido`) en la lista y la guarda del layout.

### 7.1. `/admin/contenido/equipo`

- **«Nuevo perfil»** de primario.
- **La lista, por nivel**: cuatro grupos con su rótulo («Dirección general»,
  «Dirección», «Líderes de área y proyecto», «Facilitación y diseño de
  materiales») y, al final, los que todavía no tienen nivel. Cada fila, una
  `Lista` con miniatura (la foto de la tarjeta; sin foto, el cuadrado con el
  ícono): el nombre, el rol · el país en el detalle, las insignias («Sin
  publicar», «Cambios sin publicar», «Despublicado»), «Subir», «Bajar» y
  «Editar» (§6.2).
- Vacía: «Todavía no hay perfiles» con «Nuevo perfil».

### 7.2. `/admin/contenido/equipo/nuevo` y `/[id]`

La «Ficha de una entidad»: «← Equipo», el nombre con su insignia, Guardar
borrador · Vista previa · **Publicar**. Bloques:

1. **La tarjeta** — nombre, rol, país, nivel (con cuántos lugares tiene),
   la foto con su foco (`CampoFoto`; «Elegir de Fotos» si la lane 9 ya está),
   «Sin foto» (la casilla: la persona pidió no publicarla) y el acercamiento.
2. **La URL** — el slug, con lo de §6.3 en su ayuda.
3. **El recorrido** — «Tiene recorrido» (sin él, el perfil básico: foto,
   nombre, rol y país); nombre completo, rol completo, lugar, origen,
   titular, intro, la formación (lista variable) y las categorías (lista
   variable: etiqueta y color).
4. **La figura** — marco, recorte o sin foto; la foto con su foco; «Es una
   lámina apaisada».
5. **Las etapas** — una lista variable de hasta 8; cada etapa con volanta,
   período, título, texto, composición, color y categoría, y lo que su
   composición usa: la cita; los hitos (con «principal» en `hitos` y
   `sintesis`); las ramas; los territorios; las publicaciones. Cada
   publicación: «De la Biblioteca» (un select con los materiales que firma
   la persona, que dice cuáles están ocultos) o «Sin link, fuera de la
   Biblioteca» (título, tipo, año), y su detalle, sus conceptos y
   «Destacada».
6. **En la Biblioteca** — lo que firma en la Biblioteca, de solo lectura: cada
   material con su link a la ficha y dónde está en el perfil («Etapa 5 ·
   Producción» o «Fuera del perfil»), y **«Agregar en Biblioteca»**
   (secundario, §7.3). En un perfil que todavía no se guardó, en su lugar:
   «Guardá el perfil para sumarle publicaciones».
7. **El cierre** — título, texto y segundo texto.

El panel: **«Se ve en»** — Quiénes somos, en «Quiénes sostienen ED» (la
tarjeta en su nivel) y su perfil (`/quienes-somos?persona=<slug>`); sin
publicar, «Todavía no está en el sitio». Publicado, «Ver en el sitio». Al pie,
«Qué cambió» y «Deshacer o sacar del sitio» (descartar, despublicar, borrar).

### 7.3. «Agregar en Biblioteca» **[propuesta N]**

Lleva a `/admin/biblioteca/nuevo?persona=<id>`. La página chequea que la
persona exista y se la pasa a «Agregar material»:

- **«Cargar a mano»** abre la ficha con la persona como primera autora (su
  nombre completo y el vínculo).
- **«Buscar datos»** vincula la persona al autor que la nombra: cada palabra
  de su nombre corto está, entera, entre las palabras del nombre del autor,
  sin mayúsculas ni tildes («Luis Cabrera» ↔ «Luis Manuel Cabrera Chim»,
  «Iván Pérez» ↔ «Ivan Perez»), comparando palabra por palabra y no por
  subcadena (precisión del padre, con su test); si ninguno la nombra, no la agrega sola —un DOI
  equivocado sumaría una autora que no es— y lo avisa arriba de la ficha:
  «Ningún autor de este material es Luis Cabrera: vinculala a mano en
  Autores».

### 7.4. El índice de Contenido, el punto y la guía

La tarjeta de Equipo dice su estado real («15 perfiles · 1 con cambios sin
publicar»; sin pendientes, solo la cuenta). **El punto de Contenido en la
sidebar** cuenta también los perfiles con cambios sin publicar (la
definición del SPEC padre §6). La guía de Equipo se borra de
`admin/por-hacer/guias-de-contenido.ts`; la lane 9 borra las suyas, y la que
rebasea segunda concilia.

## 8. El sitio lee de la base

### 8.1. Qué cambia

| Lugar | Lee | Cambia |
| --- | --- | --- |
| `/quienes-somos`, «Quiénes sostienen ED» | `equipoDelSitio()`: los publicados por nivel y orden, cada uno con su recorrido y sus publicaciones resueltas; en vista previa, el borrador si pasa el esquema | la página le pasa las personas a `ImpulsanEd` por prop; los componentes del perfil reciben lo mismo que hoy (los tipos `Persona` y `Profile` se mudan de `data/equipo.ts` a `contenido/`, sin `bio`, `linkedin` ni `pubs`) |
| La ficha de un material (admin) y sus autores | las personas de `equipo` | §4.2 |
| Publicar, ocultar o borrar un material | — | regenera también `/quienes-somos` **[propuesta P]**: sus tarjetas están en los perfiles |

- La consulta usa `leerSinRomper` y `cache`, valida cada fila con su esquema
  al leer, y sin base devuelve nada: el sitio compila y la sección muestra
  sus textos sin personas.
- **Los textos propios de la sección** («Quiénes sostienen ED», los rótulos
  de los niveles) ya son editables en Páginas (lane 4b): no se tocan.
- **Lo que no mira `comparar-render`:** los perfiles viajan en el payload de
  React del HTML en vez de en el JS de la página (unos 110 KB de JSON, lo
  mismo que hoy pesa el `data.ts` en el bundle), como los casos de la lane 9.

### 8.2. Lo que se ve distinto, y por qué **[propuesta H]**

- **15 títulos**, en 12 materiales, pasan a ser **los de la Biblioteca**: 10
  tarjetas (7 materiales) tenían en el perfil una versión corta («Una
  aproximación variacional» → «… para la significación de los criterios de
  la derivada»), 2 tienen en la Biblioteca la versión corta (una de Iván
  Pérez, la de Andrea Vergara) y 3 difieren en una coma o una mayúscula. Es
  la regla de una sola fuente. **Precisión del padre:** esos 2 se miran en
  la fuente del material (Crossref o la página de la revista); si el título
  completo es el de la fuente, la migración de `equipo` lo corrige en
  `materiales` (con su línea en DECISIONS) y el perfil no muestra menos que
  hoy; si la fuente dice la versión corta, queda como está.
- **2 rótulos**: el capítulo de Karla Gómez en actas del CIAEM pasa de
  «Libro» a «Artículo» (su tipo en la Biblioteca es «Actas de congreso»), y
  *Matemática en Red* de «Colección» a «Materiales».
- **1 detalle**: el destacado de Daniela Reyes decía el subtítulo del libro
  en su línea; con el título entero, esa línea pasa a «Editorial Gedisa»
  (como la otra tarjeta del mismo libro).
- **`/biblioteca` suma los 5 materiales** de §5.3 (el catálogo, sus filtros
  y la cuenta del listado).
- Nada más: años, links, detalles y conceptos de las 78 tarjetas quedan
  iguales, y un script (no se commitea) compara las tarjetas de antes y de
  después, una por una; su salida va a PROGRESS.

## 9. Fotos **[propuesta M]**

- **Las 15 fotos de `public/equipo/` entran a `fotos`** con su migración,
  como hizo la lane 9 con las de `public/fotos/`: su `url` estática, ancho,
  alto, peso y tipo medidos del archivo, y el alt de su primer uso (el
  nombre de la persona). El recorte de Daniela (`.png` y `.webp`) no entra:
  nada lo usa, y queda en el repositorio como dice su comentario.
- **Equipo suma su entrada al registro de usos** (`datos/fotos/del-equipo.ts`):
  la foto de la tarjeta y la de la figura, en lo publicado y en el borrador,
  con «Perfil de <nombre> › Tarjeta» y «… › Figura» y el link a la ficha; y
  reemplazar reescribe las dos URL en la fila y en el borrador, y devuelve
  `/quienes-somos`.
- **`/equipo/` entra a las carpetas de fotos** de `esSrcDeFoto`
  (`lib/contenido/fotos.ts`): el esquema de la foto la valida.
- **Depende de la lane 9** (`casos-aliados-fotos`): la `url` única, `subida_por`
  nulo y el registro son suyos. Si al llegar a ese paso no está en `main`, la
  lane lo anota en PROGRESS y espera al padre; lo demás no depende de eso.

## 10. Permisos y actividad

- **Las pantallas** son de los tres roles (`editarContenido`, la guarda del
  layout de Contenido): nada de lo que muestran es de un rol y no de otro.
  Cada página chequea igual la capacidad antes de leer (la regla del bloque
  común), y **las acciones** empiezan por la sesión y `editarContenido`;
  `acciones-con-sesion.test.ts` y `guarda.test.ts` las cubren.
- **Actividad** **[propuesta L]**, cada tipo con su frase, quién lo ve y si va
  al Inicio (como Novedades, más el orden):

| Tipo | Frase | Lo ve | Inicio |
| --- | --- | --- | --- |
| `publico-un-perfil` · `despublico-un-perfil` | «Ana publicó el perfil de Daniela Reyes» | `editarContenido` | sí |
| `descarto-cambios-de-un-perfil` · `borro-un-perfil` | «Ana borró el perfil de Daniela Reyes» | `editarContenido` | sí |
| `movio-un-perfil` | «Ana movió a Iván Pérez en el orden del equipo» | `editarContenido` | sí |

  En Cuentas › Actividad van al módulo Contenido; «Ver» lleva a la ficha del
  perfil (un perfil borrado no lleva link). Mover es un paso por clic (§6.2):
  cada paso queda anotado, con la persona que se movió.

## 11. Patrones nuevos (DESIGN.md §11)

- **Lista que se ordena** — la trae la lane 9 con Aliados; Equipo es el
  segundo consumidor y la sube a regla general de §11 (§6.2).
- **Una lista variable adentro de otra** (los hitos y las publicaciones de
  una etapa), si la anidada pide algo distinto de la «Lista variable» de hoy;
  si no, se consume tal cual y no se escribe nada.

Todo con tokens, los cuatro tamaños de tipo, un primario por pantalla, sin
verde ni naranja fuera de su regla y con los contrastes medidos y escritos;
los tres temas, 390 de ancho y el teclado.

## 12. Migraciones y documentos

- **Dos migraciones**, cada una con `--create-only` (o `migrate diff`, como la
  8a si `migrate dev` se niega) y su SQL de datos antes de la primera
  aplicación (ADR-0011):
  - `equipo` — la tabla, el índice parcial, los 15 perfiles publicados en su
    orden, `autorias.persona` → `persona_id` con su FK y los borradores de
    materiales (§4.2), y los 5 materiales de §5.3 con sus autorías. El SQL lo
    genera un script desde `equipo.ts` que valida cada fila con su esquema y
    cada referencia contra las autorías; el script no se commitea, y el
    `data.ts` se borra en el mismo cambio que deja de leerlo.
  - `fotos_del_equipo` — las 15 fotos (§9), después de la lane 9.
- **Documentos:** AGENTS.md §3 (el árbol: `datos/consultas/equipo`,
  `datos/acciones/*-equipo`, `admin/equipo/`, `features/quienes-somos/contenido/`)
  y §13 (Equipo, hecho); el README (Equipo en Contenido); el spec del admin
  §6 (el origen de `equipo`, la FK de `autorias`, dónde quedaron `bio` y
  `linkedin`); DESIGN.md §11 (§11); `docs/content/equipo-sin-publicar.md`
  (§4.3). Los cambios a AGENTS.md y DESIGN.md los revisa Mateo en el PR
  (DECISIONS del padre).
- Sin dependencias nuevas.

## 13. Lo que se propone

| | Propuesta | Por qué |
| --- | --- | --- |
| A | `equipo` con una columna por texto y `jsonb` para listas y grupos; las del recorrido nulas juntas; `cutoutSize` no se muda | el molde y la regla de inventario; las medidas solo sirven al recorte y las tiene `fotos` |
| B | `bio`, `linkedin` y `pubs` no se mudan; `bio` y `linkedin` quedan en `docs/content/equipo-sin-publicar.md` | la regla pide lo que se ve (el precedente de las personas de referencia); son datos de las personas que la fase 4 va a querer |
| C | `autorias.persona` → `persona_id`, FK a `equipo.id`, `ON DELETE SET NULL`, con los borradores de materiales reescritos; la persona de un material se valida en la base | el slug cambia y el `jsonb` no sigue un cascade; borrar un perfil no toca la Biblioteca |
| D | Cada etapa tiene su lista curada de referencias a materiales que la persona firma; título, año, tipo y link salen del material | el recorrido es una narración por etapas y hoy no muestra todo lo que cada persona firma |
| E | Las 5 que faltan y tienen link entran a la Biblioteca en la migración; las 14 sin link quedan en su etapa, escritas una vez | la Biblioteca pide un link y no se inventan tema, público ni formato |
| F | El rótulo de la tarjeta: los cuatro de hoy, mapeados desde el tipo | cambia 1 de 59 en vez de 17 |
| G | El detalle vacío lee la fuente; la migración guarda solo los que dicen otra cosa | una sola fuente, como la firma y la cita de la 8a |
| H | Lo que se ve distinto es solo §8.2 | la regla de una sola fuente; cada diferencia, contada |
| I | Dirección general una sola (índice parcial), Dirección hasta dos (al publicar) | el masthead tiene un lugar al centro y dos a los costados |
| J | El orden dentro del nivel, fuera del borrador, con «Subir» y «Bajar» (`moverPersona`), como Aliados; sin arrastre (cambio del padre) | un solo modo de ordenar en el admin, que llega con teclado, lector y pantalla táctil |
| K | El slug es la clave de hoy; 308 a la ruta de la fase 4 al cambiarlo | como los casos |
| L | La actividad de §10, todo al Inicio | el molde de Novedades, más reordenar, que cambia el sitio |
| M | Las 15 fotos de `public/equipo/` entran a `fotos` y Equipo suma su entrada al registro de usos, después de la lane 9 | el spec del admin §6 le da `public/**` de origen, y la lane 9 dejó `public/equipo/` para esta |
| N | «Agregar en Biblioteca» con la persona elegida; con datos de afuera, se vincula por nombre y si no, avisa | no suma una autora que el DOI no nombra |
| O | Borrar un perfil deja sus autorías de afuera, también en los borradores | la FK con `SET NULL`, y un borrador no puede apuntar a una persona que ya no está |
| P | Publicar, ocultar o borrar un material regenera `/quienes-somos` | sus tarjetas están en los perfiles |

## 14. Fuera de esta lane

Las fichas públicas de cada persona y su JSON-LD (fase 4); la Biblioteca
(8a, en `main`: acá solo la FK, las 5 que faltan y regenerar
`/quienes-somos`, y los dos títulos cortos si la fuente los da enteros,
§8.2); el registro de usos de fotos, el campo «Elegir de
Fotos» y la tabla `fotos` (lane 9); los contadores de consultas (lane 11).

## 15. Cómo se sabe que está

- El gate entero con su salida en PROGRESS: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100), `pnpm test` y
  `pnpm build`.
- Tests, uno por comportamiento: los dos esquemas (publicar pide lo que el
  sitio necesita, guardar deja vacío, una destacada por etapa, la categoría
  de una etapa existe); la consulta del sitio (orden por nivel, vista previa,
  una referencia a un material oculto o que la persona no firma no sale, las
  `sin-link` salen); guardar con choque, publicar con 308, la Dirección
  general una sola, la Dirección hasta dos, una referencia que la persona no
  firma frena, despublicar, descartar, borrar (las autorías quedan de afuera);
  mover (un paso dentro del nivel; en la punta no se mueve); un material con
  una persona que no existe no se guarda; vincular por nombre al agregar un
  material (palabra por palabra, sin tildes ni mayúsculas); las frases; y los
  dos tests de guarda y de sesión.
- Las migraciones aplicadas en `ed_equipo` desde cero, `migrate status` al
  día y `migrate diff` vacío.
- El HTML de todas las páginas comparado contra `main` con
  `scripts/comparar-render.mjs`: igual salvo `/biblioteca` (los 5 de §5.3);
  y el script de las 78 tarjetas, con exactamente las diferencias de §8.2.
- De punta a punta en el navegador de Orca, con una cuenta `edita`: editar y
  publicar un perfil (y su vista previa), cambiarle el slug, reordenar un
  nivel con «Subir» y «Bajar», sumar una publicación de la
  Biblioteca a una etapa, «Agregar en Biblioteca» con la persona elegida,
  despublicar y borrar un perfil de prueba; los tres temas, 390 de ancho y
  el teclado.
