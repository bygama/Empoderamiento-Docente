# SPEC — Biblioteca: los materiales en la base, agregar por DOI y la salud de los links

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y dependencias incluidas: DECISIONS del padre,
  2026-09-26)
- **Tier:** L · lane 8a del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/biblioteca`, dev server en el **3026**, base propia `ed_biblioteca`
- **Diseño:** el brief del padre (lane 8a), sobre el SPEC padre §5.5, §6 y §9,
  el DECISIONS del padre («SPEC de `novedades-y-kit` (6) aprobado», «La lane 8
  se parte en dos») y el ADR-0014 (el modelo de entidad que se copia). Esto lo
  formaliza; no lo vuelve a decidir. Lo que el brief deja abierto y acá se
  propone está marcado **[propuesta]**, y la lista entera está en §16.

---

## 1. Qué se quiere

Los materiales de la Biblioteca viven hoy en
`features/biblioteca/data/materiales.ts`. Esta lane los pasa a la base con su
módulo del admin, copiando el molde de Novedades (ADR-0014): lo publicado en
columnas, el borrador en un `jsonb`, un esquema para guardar y otro para
publicar, y las seis acciones. Suma lo que Novedades no tenía: **agregar un
material pegando un DOI, un ISBN o un link** —con la defensa de SSRF que pide
bajar una página que pegó una persona— y **el chequeo semanal de los links**.
Deja lista la **autoría** que la lane 8b (`equipo`) usa para que las
publicaciones de cada perfil salgan de acá, y pasa la `publicacion` de
Novedades a una relación con `materiales`.

## 2. Lo que ya existe y se usa

| Pieza | Dónde | Qué se toma |
| --- | --- | --- |
| `editarBiblioteca` (los tres roles) | `packages/auth/src/permisos.ts` | tal cual; ninguna capacidad nueva |
| Biblioteca en la sidebar, con su capacidad | `admin/armazon/barra-lateral/modulos.ts` | se le suma el acceso rápido «Agregar material» |
| El número de la sidebar | `admin/armazon/Numero.tsx`, `BarraLateral.tsx` | el de Biblioteca: los links rotos |
| La guarda, «Sin permiso», `sesionActual` | `admin/armazon/Guarda.tsx`, `datos/sesion.ts` | el layout y cada página del módulo |
| El molde de entidad | ADR-0014, `datos/acciones/*-novedades.ts`, `admin/novedades/` | copiado con las columnas de un material (§5, §7) |
| El aviso de choque | `datos/acciones/choque.ts` | tal cual |
| La vista previa (Draft Mode, cookie acotada) | `datos/vista-previa.ts` | el mismo mecanismo, para un material |
| Los controles | `packages/kit-admin` | `TextoCorto`, `Parrafo`, `Seleccion`, `Fecha`, `CampoFoto`, `ListaVariable`; ninguno nuevo |
| Lista, pestañas, filtro, buscador, paginado, insignias, estado vacío, volver, confirmación, «Qué cambió», ficha de una entidad | `admin/armazon/`, DESIGN.md §11 | consumidos; `Lista` se extiende con una miniatura (§11) |
| `registrarActividad`, `QUIEN_VE`, `VA_AL_INICIO`, `fraseDe`, el módulo de cada tipo | `datos/actividad.ts`, `admin/actividad/frase.ts`, `admin/cuentas/actividad/modulos.ts` | cinco tipos nuevos (§12) |
| El registro de pendientes | `datos/inicio/pendientes.ts` | la fila «Materiales con el link roto», urgencia `a-corregir` (ya prevista) |
| El cron diario y su registro de corridas | `datos/tareas/diarias.ts`, `corridas_de_tareas` | una tarea más (§10) |
| `next/og` y la Manrope de la imagen para redes | `features/novedades/imagen-para-redes/` | la portada tipográfica generada (§6.4) |
| `redirecciones` | `prisma/schema/sitio.prisma` | no se usa: los materiales no tienen URL propia (§16, B) |
| `scripts/comparar-render.mjs` | | el sitio igual, salvo «Copiar cita APA» (§13) |

## 3. La tabla `materiales`

Regla de inventario (spec del admin §6): una columna por lo que hoy tiene
`materiales.ts`, con el mismo nombre, más lo que el SPEC padre §5.5 suma. **No
hay más columnas que estas.** Como en `novedades`, las columnas del contenido
son nulas solo mientras el material nunca se publicó.

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `id` | `uuid`, pk | la ficha: `/admin/biblioteca/[id]` | nueva |
| `titulo` | `text`, nulo | | `titulo` |
| `autores` | `text`, nulo | **cómo se leen** en el sitio: «A, B y C», o lo que haga falta («… (editores)») | `autores` · **[propuesta C]** |
| `descripcion` | `text`, nulo | | `descripcion` |
| `tipo` | `text`, nulo | uno de los 7, lista cerrada en código | `tipo` |
| `tema` | `text`, nulo | uno de los 11, lista cerrada en código | `tema` |
| `publico` | `text`, nulo | uno de los 4, lista cerrada en código | `publico` |
| `fecha` | `text`, nulo | `AAAA` o `AAAA-MM`: la precisión que da la fuente. El año del filtro y el «Dic 2025» del sitio salen de acá | `anio` y `fecha` · **[propuesta E]** |
| `formato` | `text`, nulo | `PDF` · `ZIP` · `Video` · `Web`, lista cerrada | `formato` |
| `paginas` | `integer`, nulo | solo lo paginado | `paginas` |
| `portada` | `jsonb`, nulo | `{ src, alt, foco }`, como la imagen de una novedad; **nula es «la tipográfica generada»** | `portada` · **[propuesta G]** |
| `url` | `text`, nulo | adónde lleva la acción: la revista, la editorial, el DOI o un PDF propio | `url` |
| `fuente` | `text`, nulo | dónde se lee, para «Leer en RELIME» | `fuente` |
| `doi` | `text`, **único**, nulo | en minúsculas y sin `https://doi.org/` | SPEC §5.5 (sale de la `url` de los 36 que hoy linkean a doi.org) |
| `cita` | `text`, nulo | la cita APA, generada y editable | SPEC §5.5 · **[propuesta I]** |
| `destacado` | `smallint`, **único**, nulo | el lugar entre los destacados (1 a 4); nulo, no lo es | `DESTACADOS` (su orden) · **[propuesta F]** |
| `rotulo` | `text`, nulo | el rótulo del índice («RELIME 2025») | `DESTACADOS.rotulo` |
| `frase` | `text`, nulo | la bajada del destacado | `DESTACADOS.tagline` |
| `detalle` | `text`, nulo | el párrafo que amplía la descripción | `DESTACADOS.detalle` |
| `publicado` | `boolean`, `false` | el sitio lo muestra; ocultarlo lo deja en `false` y conserva las columnas | modelo de entidad |
| `publicado_en`, `publicado_por` | `timestamp`, `text`, nulos | la última publicación y quién, en llano | modelo de entidad |
| `borrador`, `borrador_en`, `borrador_por` | `jsonb`, `timestamp`, `text`, nulos | el documento que se edita (nulo es «el borrador es lo publicado») y la marca del choque | modelo de entidad |
| `creado_en`, `creado_por` | `timestamp` (`now()`), `text` nulo | también el orden de carga: dentro de un año, el sitio los muestra así (§13.1) | modelo de entidad |
| `chequeo_en` | `timestamp`, nulo | el último chequeo del link | SPEC §5.5 |
| `chequeo` | `text`, nulo | su resultado: `bien` · `roto` · `sin-respuesta` · `sin-chequear` (§10) | SPEC §5.5 |
| `chequeo_detalle` | `text`, nulo | qué pasó, en llano («Dio 404», «El DOI no está registrado») | SPEC §5.5 |

- `doi` único con el índice de Prisma (en Postgres dos nulos no chocan).
- `destacado` único igual: un solo material por lugar. Publicar uno en un
  lugar ocupado **suelta al que estaba**, en su columna y en su borrador, en la
  misma transacción, y lo dice (como la destacada de Novedades); ocultar un
  destacado lo suelta también.
- **Sin slug** [propuesta B]: los materiales no tienen ficha propia en el sitio
  (spec del admin §5: «Los 63 materiales no llevan ficha propia»), y las
  landings por tipo de la fase 4 van por tipo, no por material.

### 3.1. Los estados

| Estado | Qué es | Insignia | Filtro «Estado» |
| --- | --- | --- | --- |
| Sin publicar | nunca se publicó | fuerte, «Sin publicar» | Oculto |
| Publicado | el sitio lo muestra y no hay borrador | ninguna | Publicado |
| Publicado con cambios | el sitio lo muestra y hay borrador | fuerte, «Cambios sin publicar» | Publicado |
| Oculto | estuvo en el sitio y se ocultó | apagada, «Oculto» | Oculto |

«Ocultar» es el despublicar del molde con el nombre del SPEC padre §5.5
(Publicado · Oculto).

## 4. La tabla `autorias` y la relación de Novedades

### 4.1. `autorias`: quién firma cada material

| Columna | Tipo | Qué es |
| --- | --- | --- |
| `material_id` | `uuid`, fk → `materiales.id`, `ON DELETE CASCADE` | |
| `orden` | `smallint` | el lugar en la firma, desde 0 |
| `nombre` | `text` | como figura en la publicación («Daniela Reyes-Gasperini») |
| `persona` | `text`, nulo | la clave de la persona del Equipo (`daniela-reyes`) si es de ED; nula, es de afuera |

- Clave primaria `(material_id, orden)`; índice en `persona`.
- **Lo publicado vive acá; el borrador, en el documento** (`autorias: [{ nombre,
  persona }]`): publicar reemplaza las filas del material en la misma
  transacción. Así la 8b lee «los materiales publicados donde `persona` es tal»
  sin mirar borradores.
- **Cada autor tiene nombre siempre, y la persona es opcional** [propuesta D]:
  el brief dice «o un texto o una persona del Equipo», pero la cita y el sitio
  necesitan el nombre como se publicó, que no es el del perfil («Daniela Reyes»
  firma «Daniela Reyes-Gasperini»).
- **`persona` es texto, sin FK** [propuesta D]: la tabla `equipo` la crea la
  8b. Hasta entonces, la clave se valida contra las 15 de
  `features/quienes-somos/data/equipo.ts` (`key`), y la 8b pone la FK (a su
  slug, o convirtiendo a su id) en su migración. La migración de esta lane ya
  vincula a las personas de ED por nombre (§6), así la 8b arranca con las
  publicaciones hechas.

### 4.2. `novedades.material_id`

- La columna de texto `publicacion` se va y entra **`material_id`**, `uuid`,
  fk → `materiales.id`, `ON DELETE SET NULL` (borrar un material deja la
  novedad sin botón, no la borra). Un solo material, con **su select** en la
  ficha de la novedad, como hoy [propuesta M].
- En el documento de la novedad, la clave `publicacion` (un título) pasa a
  `material` (un id). Guardar y publicar chequean en `datos/` que ese material
  exista; el sitio muestra el botón **solo si el material está publicado**.
- La migración convierte lo que hay: la columna (por título exacto) y la clave
  de los borradores guardados.

## 5. El modelo: dos esquemas y lo que no necesita Zod

Como `features/novedades/contenido/`, en `features/biblioteca/contenido/`:

- **`material.ts`** — `esquemaMaterial` (completo: se valida al publicar y al
  leer) y `esquemaBorrador` (todo puede estar vacío; frena lo que está mal, no
  lo que falta). Los mismos campos y los mismos topes. Server-only: la clave
  de una persona se valida contra el Equipo, que no viaja al navegador.
- **`modelo.ts`** — sin Zod, lo leen el sitio y el formulario: `TIPOS`,
  `TEMAS`, `PUBLICOS`, `FORMATOS` (cerradas: sumar una es un cambio de código),
  `TOPES`, `LUGARES_DE_DESTACADO` (4), `accionDe` («Leer en RELIME»), la fecha
  del sitio («Dic 2025»), el año, `autoresEnTexto` (la lista con
  `Intl.ListFormat`, que ya pone «e Iván») y el borrador vacío.
- **`cita.ts`** — `citaApa(material)`, pura y con tests (§8.4).

**Qué pide publicar** (`esquemaMaterial`): título, al menos un autor y cómo se
leen, tipo, tema, público, fecha (al menos el año), formato, `url` y fuente, y
si es destacado su rótulo, frase y detalle. **Opcional**: descripción,
páginas, portada, DOI y cita. Lo opcional es lo que miden las insignias de
salud (§9.1).

**Topes**, del contenido de hoy con aire: título 200 (hoy 158), cómo se leen
los autores 200 (108), un autor 120, autores 30, descripción 500 (373), fuente
80 (62), `url` 500 (116), cita 600, rótulo 20 (11), frase 70 (54), detalle 320
(253), páginas 1 a 5000.

**La `url`**: `https://`, `http://` (hoy hay una, la de Acta Scientiae) o una
ruta propia que empieza con `/` (la tesis en PDF). El DOI se normaliza al
guardar.

## 6. La migración

Una sola, `biblioteca`, creada con `pnpm migrate --create-only` y completada
antes de su primera aplicación (AGENTS.md §12, ADR-0011) con, comentado en el
mismo archivo:

1. Las tablas, los índices y la fk de `novedades.material_id`.
2. **Los 57 materiales** [propuesta A: el SPEC padre y la guía dicen 63; el
   archivo tiene 57 —16 con PDF y 41 con link, como dice su propio comentario
   —, y la regla de inventario manda lo que existe]. Publicados, sin
   `publicado_por` («la carga inicial», como Novedades), con `creado_en`
   escalonado en el orden de carga para que el sitio los ordene igual. El SQL lo
   genera un script desde `materiales.ts`, que valida cada fila con
   `esquemaMaterial`; el script no se commitea (como en Novedades).
3. **Sus autorías**: los nombres salen de partir `autores` por «, », « y » y
   « e »; las tres firmas que no son una lista («… (editores)», «Coordinación
   de…, con…», «… y diez autoras y autores más») se cargan a mano con sus
   nombres y conservan su texto en `autores`. Las personas de ED se vinculan
   por nombre, con una tabla revisada a mano en el script (§4.1).
4. **Los DOI**: los de las 36 `url` de doi.org.
5. **Las citas APA**: para las 36 con DOI, con los nombres de Crossref
   (apellido y nombre separados, volumen, número y páginas); para las 21 sin
   DOI, con `citaApa` y revisadas una por una. Pedirlas a Crossref es del
   script, una vez, no de la migración.
6. **Los cuatro destacados**, con su lugar, rótulo, frase y detalle.
7. **Las portadas**: las 57 de `public/biblioteca/portadas/`, centradas, con
   el alt «Portada de «título»» (el sitio las muestra decorativas, con alt
   vacío, como hoy).
8. **Novedades**: `material_id` desde `publicacion` por título exacto (hoy una
   sola, `relime-2025`), la clave `publicacion` de cada borrador pasada a
   `material`, y `publicacion` borrada.

`features/biblioteca/data/materiales.ts` **se borra en el mismo PR**. Sin
base, el sitio compila y el catálogo sale vacío con su estado de siempre.

## 7. Las acciones

Server Actions en `datos/acciones/` que empiezan por la sesión y siguen con
`puede(rol, "editarBiblioteca")` (los dos tests que lo exigen), validan con Zod
y escriben con un cliente inyectado (probadas contra el Postgres local):

| Acción | Qué hace | Actividad |
| --- | --- | --- |
| **Crear** (el primer guardado de `/nuevo`) | la fila nace con su borrador; DOI repetido no entra | `agrego-un-material` |
| **Guardar borrador** | con el aviso de choque; no revalida | — |
| **Publicar** | guarda lo de pantalla, valida con `esquemaMaterial` y, en una transacción, copia a las columnas, reemplaza las autorías y suelta el lugar de destacado si otro lo tenía; si cambió la `url` o el DOI, borra el chequeo (queda pendiente para el próximo cron) | `publico-un-material` |
| **Ocultar** | `publicado` en falso, conserva las columnas y suelta su lugar de destacado | `oculto-un-material` |
| **Descartar cambios** | vuelve a lo publicado, con confirmación | `descarto-cambios-de-un-material` |
| **Borrar** | la fila entera y sus autorías; las novedades que lo abrían quedan sin botón | `borro-un-material` |
| **Vista previa** | el Draft Mode: `/biblioteca#materiales` con cada material como quedaría | — |
| **Buscar datos** | §8; no escribe nada | — |

- **DOI repetido**: al guardar y al publicar se avisa en el campo, con el
  título del que ya lo tiene y su link; la base lo garantiza con el índice.
- **Título parecido**: al buscar datos y al crear, un aviso (no un error) con
  link al existente. «Parecido» es el título normalizado (sin tildes, signos ni
  mayúsculas) igual, uno contenido en el otro, o con el 80 % de sus palabras en
  común; función pura con tests.
- **Qué se revalida**: `/biblioteca`, `/` (si el material es o era destacado)
  y la ficha de cada novedad que lo abre, más la lista del admin.

## 8. Agregar por DOI, ISBN o link

### 8.1. La pantalla

`/admin/biblioteca/nuevo`, en dos pasos, en la misma ruta:

1. **«DOI, ISBN o link»** y «Buscar datos» (el primario); «Cargar a mano»
   (terciario) salta al paso 2 vacío. Si no aparece nada, lo dice y ofrece
   cargar a mano.
2. **La ficha**, completa con lo que se encontró. Cada campo que vino de
   afuera lo dice debajo de su etiqueta, en meta: «De Crossref», «De
   OpenAlex», «De la página» (las etiquetas `citation_*`), «De la vista para
   redes» (Open Graph). La marca se va cuando se edita el campo. Tema y público
   se eligen a mano; el tipo se propone desde el tipo de la fuente. **Nada se
   guarda** hasta que una persona toca Guardar o Publicar.

### 8.2. Las fuentes, en orden

Todas por `fetch`/`https` de Node, **sin dependencias ni cuentas**:

| Entrada | Se consulta |
| --- | --- |
| DOI (`10.…`, o un link de doi.org) | Crossref (`api.crossref.org/works/{doi}`); si no está, OpenAlex (`api.openalex.org/works/doi:{doi}`) |
| ISBN (10 o 13, con su dígito verificador) | Crossref (`works?filter=isbn:…`) |
| Otro link | la página: si trae `citation_doi`, se sigue por el DOI y la página completa lo que falte; si no, sus `citation_*`; si tampoco, su Open Graph |

- Cada fuente llena solo lo que el siguiente no pisó: gana la primera que da el
  dato, y la marca dice cuál fue.
- Lo que se toma: título, autores (con apellido y nombre cuando la fuente los
  separa), fecha, fuente (la revista o la editorial), DOI, `url`, páginas,
  tipo, resumen como descripción (Crossref lo trae en JATS, que se pasa a
  texto), y la cita.
- Crossref pide un `User-Agent` con un contacto para su «polite pool»: va el
  del sitio (`config/site.ts`).

### 8.3. Lo que se busca afuera no sabe de ED

`lib/metadatos/` (sin `@/`, como `lib/metricas/`): reconocer la entrada
(DOI, ISBN, link), leer la respuesta de Crossref, de OpenAlex y las etiquetas
de una página (un lector de `<meta>` chico, sin parser de HTML), cada uno con
tests sobre respuestas grabadas. Lo de ED —pasar el tipo de Crossref a uno de
los 7— vive en `features/biblioteca/`.

### 8.4. La cita APA

APA 7 en castellano, sin cursivas (es texto plano): «Apellido, I. I.,
Apellido, I. I. y Apellido, I. I. (Año). Título. Fuente, volumen(número),
páginas. https://doi.org/…». Los apellidos: exactos cuando la fuente los separa; si no,
se deducen del nombre (las dos últimas palabras con cuatro o más, la última
con dos, y con tres las dos últimas; un apellido compuesto con guion es uno).
**Sigue a los datos** mientras nadie la escribe, como la URL de una novedad
sigue al título; escrita a mano, se queda, y «Volver a la generada» la
recupera. [propuesta I]

## 9. El módulo del admin

### 9.1. `/admin/biblioteca` — la lista

- Encabezado: «Biblioteca», el detalle («Los materiales que llevan a la revista
  o a la editorial») y **«Agregar material»**, el primario.
- **Tres filtros** (el patrón Filtro, apilados como en Cuentas › Actividad,
  cada uno con su «todos» y conservando los otros y la búsqueda): **Tipo** (los
  7), **Estado** (Publicado · Oculto) y **Salud** (Link roto · Sin portada ·
  Datos incompletos) [propuesta L: el tercero es a donde llevan la fila del
  Inicio y el número de la sidebar].
- **El buscador** (el de `main`): título, autores o fuente.
- **La lista** (`Lista`, con miniatura [§11]): la portada, el título, y debajo
  autores · tipo · año; a la derecha el estado y las insignias de salud, y
  «Editar». Paginada de a 50 con el paginado de `main`.
- **Las insignias de salud**, en tono normal: «Link roto» (el último chequeo dio
  `roto`), «Sin portada» (sin portada propia: el sitio muestra la generada) y
  «Datos incompletos» (le falta la descripción: lo único que el sitio muestra
  y publicar no exige).
- Vacía: «Todavía no hay materiales.» con «Agregar material» en el estado
  vacío; sin resultados, lo buscado y dónde.
- La columna «consultado N veces este mes» **no es de esta lane** (la 11).

### 9.2. `/admin/biblioteca/[id]` y `/nuevo` — la ficha

La «Ficha de una entidad» de DESIGN.md §11, con los campos de un material:

- **Encabezado** fijo: «← Biblioteca», el título con su insignia, quién y
  cuándo, y Guardar borrador · Vista previa · **Publicar**.
- **Bloques**: «El material» (título, descripción, tipo, tema, público,
  fecha, formato, páginas); «Autores» (una `ListaVariable` de hasta 30: el
  nombre y, en un select, «De afuera» o una persona del Equipo; debajo, «Cómo
  se leen», que sigue a la lista hasta que se escribe a mano); «Dónde se lee»
  (`url`, fuente, DOI); «Portada» (la generada, con «Usar otra» y «Volver a la
  generada», el patrón de la imagen para redes); «Cita APA» (con «Volver a la
  generada»); «Destacado» (el lugar, «No es destacado» o 1 a 4, diciendo quién
  lo ocupa hoy; con lugar, el rótulo, la frase y el detalle).
- **El panel**: «Salud del link» (el último chequeo, su resultado y su
  detalle, o «Todavía no se chequeó»; «Se vuelve a chequear el próximo día si
  cambiás el link») y **«Se ve en»**: Biblioteca › Catálogo; si es destacado,
  Biblioteca › Destacados y el Inicio; y las novedades que lo abren. «Ver en el
  sitio» si está publicado.
- **Debajo**: «Qué cambió» plegado y «Deshacer o sacar del sitio» (descartar,
  ocultar, borrar), como Novedades.

### 9.3. Lo que el módulo le suma al resto del admin

- **Sidebar**: el número de Biblioteca cuenta los publicados con el link roto
  («3 con el link roto»); si la base no contesta, sin número.
- **Inicio**: la fila de pendientes «2 materiales con el link roto» · «A» y
  «B», urgencia `a-corregir`, capacidad `editarBiblioteca`, «Ver los
  materiales» → la lista filtrada por Link roto; y el acceso rápido «Agregar
  material» en su línea de `modulos.ts`.
- **La guía** de Biblioteca sale de `admin/por-hacer/guias.ts`.
- **Cuentas › Actividad**: el módulo «Biblioteca» en su filtro, y el link
  «Ver el material» mientras exista.

## 10. La salud de los links

- **Una tarea del cron diario** (`salud-de-links`) que chequea los materiales
  publicados **cuyo último chequeo tiene más de 7 días** (o que nunca se
  chequearon), de los más viejos a los más nuevos, hasta 15 por corrida, de a
  5 en paralelo y sin empezar ninguno pasados 35 s: cada link se chequea una
  vez por semana, el día que le toca, y la tarea entra holgada en sus 50 s.
  Los 57 quedan chequeados en cuatro días. [propuesta J: el brief dice «una
  tarea semanal en el cron diario (corre el día que toca)»; repartirla por
  material es lo que entra en el tope de 50 s por tarea]
- **Cómo se chequea cada uno:**
  - con DOI: **en doi.org** (`doi.org/api/handles/{doi}`), no en la revista,
    que muchas veces frena a los robots: registrado es `bien`, no registrado es
    `roto`;
  - con `url` `https` y sin DOI: con el pedido protegido de §11, `HEAD` y, si
    la respuesta no sirve, `GET`: 2xx o 3xx que termina bien es `bien`; 404 o
    410, o un dominio que ya no existe, es `roto`; lo demás (403, 429, 5xx,
    se cortó, no contestó) es `sin-respuesta`, que **no es roto**;
  - con `url` `http`: `sin-chequear` («El link no es https: no se chequea»);
  - una ruta propia (`/biblioteca/….pdf`): `bien`, sin pedir nada (va con el
    deploy).
- **El resultado queda en el material** (`chequeo_en`, `chequeo`,
  `chequeo_detalle`) **y la corrida en `corridas_de_tareas`**: «Se chequearon 12
  links: 11 bien, 1 roto («Título»)».
- Solo `roto` prende la insignia, el número y la fila del Inicio: un sitio
  lento no es un link roto.

## 11. La defensa de SSRF

Pedir una página que pegó una persona —y chequear links que escribió una
persona— es una puerta para que el servidor le pida algo a la red interna o a
la metadata de la nube. `lib/red/pedido-protegido.ts` (sin ED):

- **Solo `https:`, en el puerto 443**, sin usuario ni contraseña en la URL.
- **La IP se chequea antes de conectar**: el host se resuelve (todas sus
  direcciones) y se rechaza si alguna es privada, local, de enlace local, de
  metadata, compartida (CGNAT), reservada, multicast o de documentación, en
  IPv4 y en IPv6 (incluidas las IPv4 mapeadas y NAT64). Un host que es una IP
  se chequea igual. **La conexión va a la IP chequeada** (un `lookup` propio en
  `https.request`), así un DNS que cambia entre el chequeo y la conexión no
  cuela nada.
- **Cada redirección se vuelve a chequear entera** (esquema, puerto, IP), hasta
  5.
- **Topes**: 2 MB de cuerpo (se corta al pasarse) y 8 s en total por pedido,
  redirecciones incluidas.
- **Sin cookies**: no manda ninguna ni guarda las que le den. Para leer
  etiquetas, solo `text/html`.
- **Sin dependencias**: `node:https` y `node:dns`. `undici` daría `fetch` con
  un `lookup` propio, pero no está en el lockfile.
- **Tests** (`node:test`): cada rango de IP; los esquemas, puertos y
  credenciales; un host que resuelve a una IP privada; una redirección a
  `http:`, a una IP privada y a un host que resuelve a una; el tope de bytes y
  el de tiempo. Sin red: el resolvedor y el pedido se inyectan.

## 12. Permisos y actividad

- **La guarda** en el layout del módulo (`<Guarda capacidad="editarBiblioteca">`,
  la que pide `guarda.test.ts`) y **en cada página** (`puede` antes de leer),
  aunque Biblioteca es de los tres roles: es lo que pide el brief, y lo que
  hace que una sesión rara no lea borradores. **Cada acción** chequea
  `editarBiblioteca` justo después de la sesión.
- **Cinco tipos de actividad**, con su frase, `QUIEN_VE` (`editarBiblioteca`),
  `VA_AL_INICIO` (sí) y su módulo en Cuentas › Actividad:
  `agrego-un-material` («Ana agregó el material «…»»), `publico-un-material`,
  `oculto-un-material`, `descarto-cambios-de-un-material` y
  `borro-un-material` [propuesta N: el brief nombra cuatro; descartar se anota
  en Novedades y se copia]. `sobre` es el título como era, `sobreId` el id.

## 13. El sitio

### 13.1. `/biblioteca` lee de la base

- `datos/consultas/materiales.ts`: los publicados (o, en vista previa, cada
  uno como quedaría), validados con `esquemaMaterial` al leer, ordenados por
  año y dentro de un año por `creado_en`: el orden de hoy. Con `cache` de
  React y `leerSinRomper`, como Novedades.
- **El catálogo** (`MaterialesListado`) y **los destacados**
  (`DestacadosBiblioteca`) reciben los materiales por props; los años del
  filtro salen de ellos. Los textos propios de la página (lane 4c) no se tocan.
- **El Inicio** (`BibliotecaNovedades`) recibe los destacados por props.
- **La ficha de una novedad** recibe su material resuelto (o nada).
- **La tarjeta pública suma «Copiar cita APA»**: un botón de texto en la línea
  de la fecha, que copia la cita y dice «Cita copiada» (anunciado). No es
  naranja: el naranja es la acción de la fila. Sin cita, no aparece.
- **Render idéntico**: `scripts/comparar-render.mjs` contra el build de
  `main` (guardado antes de tocar nada) tiene que dar igual `/`, `/novedades/*`
  y todo lo demás, y en `/biblioteca` solo el botón nuevo.

### 13.2. La portada tipográfica generada [propuesta G]

Las 57 portadas de hoy son tipográficas, 900 × 900, con el color por tipo.
Un material sin portada propia muestra **la misma pieza generada** con
`next/og` (la Manrope que ya está en el repo): el color de su tipo, «TIPO ·
FUENTE · AÑO», el título, los autores y «Empoderamiento Docente». En el sitio,
`/biblioteca/portada/[id]`, estática y revalidada al publicar, solo de
publicados; en la ficha del admin, la misma pieza en vivo con lo que está en
el formulario (una ruta del admin, con sesión).

## 14. Docs

- **ADR-0015**: agregar por DOI y la defensa de SSRF, y la salud de los links
  (con las alternativas: `undici`, un servicio de afuera, chequear en la
  revista).
- **AGENTS.md §3** (el árbol: `datos/`, `admin/biblioteca/`, `lib/red/`,
  `lib/metadatos/`, `features/biblioteca/contenido/`), §12 (las tablas que
  existen) y §13 si corresponde; **README** (la tarea nueva del cron); **spec
  del admin** §5 (57), §6 (la fila de `materiales` y `autorias`); **DESIGN.md
  §11**: la miniatura de la `Lista`, «de dónde salió el dato» y el agregar en
  dos pasos, y la salud en el panel. Los cambios a AGENTS.md y DESIGN.md van
  nombrados acá para que Mateo los vea en el PR (DECISIONS del padre).

## 15. Fuera de esta lane

- Equipo y sus perfiles (8b): la FK de `autorias.persona` y las publicaciones
  de cada perfil.
- Los contadores de consultas y «consultado N veces este mes» (11).
- Las 7 landings `/biblioteca/<tipo>` y el sitemap de materiales (fase 4).
- Importar CSV, BibTeX o RIS, taxonomías editables (SPEC padre §10).
- Elegir una foto ya subida para la portada: lo suma la lane 9 al `CampoFoto`;
  si está en `main` al rebasear, se usa.

## 16. Propuestas para aprobar

- **A.** Son 57 materiales, no 63: la regla de inventario manda el archivo.
- **B.** Sin slug: los materiales no tienen URL propia en el sitio.
- **C.** `autores` (texto, cómo se leen) se queda al lado de `autorias`: tres
  firmas no son una lista y el sitio tiene que quedar igual; en la ficha, el
  texto sigue a la lista hasta que se escribe a mano.
- **D.** Cada autoría con nombre siempre y la persona opcional; `persona` es la
  clave del Equipo como texto, validada contra las 15 de hoy, y la 8b le pone
  la FK. La migración ya vincula por nombre.
- **E.** `fecha` en `AAAA` o `AAAA-MM`; el año y «Dic 2025» salen de ahí.
- **F.** Los destacados son columnas del material (lugar 1 a 4 único, rótulo,
  frase, detalle); publicar en un lugar ocupado suelta al anterior.
- **G.** `portada` nula es la tipográfica generada con `next/og`, igual a las
  de hoy; «Sin portada» marca a los que no tienen una propia.
- **H.** Estados: Sin publicar · Publicado · Publicado con cambios · Oculto.
- **I.** `cita` guardada, generada y editable, que sigue a los datos hasta que
  se escribe; las 36 con DOI salen de Crossref en la migración.
- **J.** La tarea corre todos los días y chequea lo vencido (7 días), hasta 15
  por corrida; los DOI en doi.org; solo `roto` es roto.
- **K.** La defensa de SSRF con `node:https` y un `lookup` propio, sin
  dependencias.
- **L.** Un tercer filtro, Salud, destino de la fila del Inicio y del número.
- **M.** `novedades.material_id` (uno, `SET NULL`), con el botón solo si el
  material está publicado.
- **N.** Cinco tipos de actividad: los cuatro del brief más descartar.
