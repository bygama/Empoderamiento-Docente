# SPEC — Casos, Aliados y Fotos

- **Fecha:** 2026-09-27
- **Estado:** aprobado por el padre el 2026-09-27, con las doce propuestas de
  §12 y tres resguardos (el SVG, el orden de reemplazar, el comentario del
  SQL generado); ver DECISIONS
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y dependencias incluidas: DECISIONS del padre,
  2026-09-26)
- **Tier:** L · lane 9 del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/casos-aliados-fotos`, dev server en el 3027, base `ed_casos`
- **Diseño:** el brief del padre (lane 9), sobre el SPEC padre §5.3, §6 y §9,
  el modelo de entidad de Novedades ([ADR-0014](../../docs/architecture/adrs/0014-kit-admin-y-modelo-de-entidad.md))
  y el spec del admin (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`)
  §5 y §6. Esto lo formaliza; no lo vuelve a decidir. Lo que el brief deja
  abierto y acá se propone está marcado **[propuesta]**, y la lista entera
  está en §12.

---

## 1. Qué se quiere

Las tres pestañas de Contenido que todavía son guías pasan a ser módulos:
**los cuatro casos de investigación**, **los aliados** —sus logos, con la regla
dura de AGENTS.md §5.4 garantizada por la consulta del sitio— y **la biblioteca
de Fotos**, que por primera vez sabe dónde se usa cada foto. Casos y Aliados
copian el molde de Novedades (lo publicado en columnas, el borrador en un
documento); Fotos suma un registro donde cada módulo declara cómo encontrar
sus fotos, y el campo de foto del kit aprende a elegir una ya subida.

El sitio no cambia: `/investigacion`, el pie, el Inicio y Qué hacemos leen de
la base con el mismo HTML de hoy (`scripts/comparar-render.mjs`).

## 2. Lo que ya existe y se usa

| Pieza | Dónde | Qué se toma |
| --- | --- | --- |
| `editarContenido` (los tres roles) y `autorizarAliados` (dirige y administra) | `packages/auth/src/permisos.ts` | tal cual; ninguna capacidad nueva |
| La guarda de Contenido | `(protegido)/contenido/layout.tsx` | cubre las tres pantallas; nada de acá lo lee un rol y otro no (§9) |
| El molde de una entidad: dos esquemas, `columnasDe`, `publicadoDe`, choque, publicar con 308, descartar, borrar | `datos/acciones/*-novedades.ts`, `datos/consultas/*novedad*`, `admin/novedades/` | copiado con las columnas de cada tabla |
| `redirecciones` y el 308 sin cadenas | `prisma/schema/sitio.prisma`, `publicar-novedades.ts` | el slug de un caso |
| La vista previa (Draft Mode acotado) | `datos/vista-previa.ts` | casos y aliados |
| `CampoFoto`, `TextoCorto`, `Parrafo`, `Seleccion`, `Casilla`, `ListaVariable` | `packages/kit-admin` | los formularios; `CampoFoto` crece (§7.4) |
| La tabla `fotos`, `subirFoto`, el almacén (Blob o disco), `leerImagen` | `prisma/schema/paginas.prisma`, `datos/acciones/fotos.ts`, `lib/contenido/` | la biblioteca; el almacén ya sabe borrar |
| Encabezado, Volver, pestañas de Contenido, Lista, Filtro, Insignia, Estado vacío, Confirmación, Qué cambió, Ficha de una entidad | `admin/armazon/`, `admin/contenido/`, DESIGN.md §11 | consumidos |
| Pendientes (`sin-autorizar` y `a-corregir` ya reservadas para esta lane), actividad, frases, módulos de Actividad | `datos/inicio/`, `datos/actividad.ts`, `admin/actividad/`, `admin/cuentas/actividad/` | una entrada por cosa nueva |

## 3. Fotos: la biblioteca

### 3.1. Qué hay en la tabla `fotos`

Hoy tiene solo lo que se subió desde el admin. El spec del admin §6 le da como
origen `public/**`, y los logos de los aliados y las láminas de los casos
pasan a ser fotos («logo de Fotos»), así que **las fotos del contenido que
viven en `public/` entran a la tabla por la migración** **[propuesta A]**:

| Carpeta | Cuántas | Por qué |
| --- | --- | --- |
| `public/fotos/` | 38 de 39 | las de las páginas y las novedades. Queda afuera `auditorio-panoramica.webp`: es parte del diseño del pie (alt vacío, escrita en `Footer.tsx`), no contenido que se edite |
| `public/novedades/` | 1 | la imagen de la novedad de UNESCO |
| `public/investigacion/` | 3 | las láminas de los casos |
| `public/aliados/` | 5 | los logos (uno es SVG) |

Quedan afuera `public/equipo/` (lo trae la 8b con Equipo), las portadas de
`public/biblioteca/` (de la 8a), `brand/` y `firma/` (no son contenido).

Cada fila importada lleva su `url` estática (`/fotos/…`), su ancho, alto, peso
y tipo medidos del archivo, y como alt **el de su primer uso** (en el orden:
las páginas en el orden del menú, las novedades, los casos, los aliados); la
que no se usa en ningún lado entra sin alt (hoy ninguna: las 47 tienen al
menos un uso). `subida_por` queda nulo: la ficha dice «Llegó con el sitio».

### 3.2. Cambios en la tabla

| Cambio | Por qué |
| --- | --- |
| `url` pasa a ser **única** | un archivo es una foto; los usos la encuentran por su URL (§3.3) |
| `subida_por` pasa a **nulo** | las importadas no las subió nadie |
| `tipo` admite `image/svg+xml` | el logo de Techint. **Subir** sigue aceptando solo jpg, png y webp: un SVG puede traer código |
| el alt puede estar vacío | solo en lo importado sin uso (y lo que importen 8a y 8b); subir y editar lo siguen exigiendo. Es lo que cuentan el filtro, la tarjeta y la fila del Inicio |

Sin columnas nuevas. El reemplazo queda en la actividad, no en la fila.

### 3.3. Dónde se usa: el registro de usos

**Un uso se reconoce por la URL de la foto** **[propuesta B]**: páginas,
novedades y casos guardan cada foto como `{ src, alt, foco }` adentro de su
documento o de su columna, y los aliados igual. Cambiar ese modelo por un id
tocaría el esquema de cada sección y el HTML del sitio; la URL ya es única
(§3.2).

- **`datos/fotos/registro.ts`** es la lista de lo que cada módulo declara, sin
  que Fotos sepa nada de ellos por dentro (el patrón de `datos/inicio/`):

  ```ts
  type Uso = {
    src: string;
    donde: string;          // «Inicio › Hero», «Novedad «UNESCO Montevideo…»», «Caso 01», «Aliado UNESCO»
    enlace: string;         // la pantalla del admin que lo edita
    en: "sitio" | "sin-publicar" | "codigo";
    alt: string;            // el alt con que va en ese lugar
  };
  type UsosDeUnModulo = {
    modulo: string;
    buscar(base): Promise<Uso[]>;
    reemplazar(tx, vieja: string, nueva: string): Promise<string[]>;  // las rutas del sitio a regenerar
  };
  ```

- **Cuatro entradas**, cada una en su archivo de `datos/fotos/`: páginas (lo
  publicado, el borrador y, si una sección no está en la base, su contenido
  inicial del código, que es lo que el sitio muestra; más el SEO), novedades
  (`imagen`, `imagen_para_redes` y el borrador), casos (la lámina y el
  borrador) y aliados (el logo y el borrador). La 8b suma Equipo con una
  entrada más.
- **Un recorrido genérico** en `lib/contenido/` (sin ED) encuentra y cambia las
  fotos adentro de cualquier JSON: todo objeto con `src` y `alt` de texto.
  Las páginas le suman la etiqueta legible del camino («Inicio › Hero ›
  Tarjeta 3»).

### 3.4. Lo que se hace con una foto

- **Subir** — desde la grilla o desde cualquier campo de foto: el archivo y
  su alt (obligatorio), como hoy. Crea la fila.
- **Editar el alt** — el de la biblioteca: la descripción de la foto y el alt
  que toma un uso nuevo al elegirla. **No reescribe el de los lugares donde
  ya está** **[propuesta C]**: el alt va con cada uso (DECISIONS 1 de la
  edición de páginas, `lib/contenido/campos.ts`), porque la misma foto puede
  pedir otro en otro marco. «Se usa en» muestra el de cada lugar.
- **Reemplazar el archivo** — sube el nuevo, y en una transacción cambia la
  URL en cada uso de la base (lo publicado, los borradores y las versiones de
  las páginas, así restaurar una no trae un archivo que ya no está) y en la
  fila; después borra el archivo viejo de Blob o del disco, y regenera las
  rutas del sitio que la muestran. **Los usos siguen apuntando a la misma
  foto**: el id, la ficha y el alt no cambian. Si algún uso vive en el
  contenido inicial del código (una sección que nunca se publicó desde el
  admin), no se reemplaza y lo dice: «La usa Quiénes somos › Origen, que
  todavía muestra el contenido del código: cambiala desde su editor, o
  publicá esa página y volvé acá».
- **Borrar** — solo si no se usa en ningún lado (ni en un borrador ni en el
  código). Borra la fila y después el archivo. Un archivo de `public/` no se
  puede borrar desde el sitio: la fila se va y el archivo queda en el
  repositorio, y la ficha lo avisa antes.

**Las deudas que cierra:** reemplazar y borrar ahora sí borran el archivo en
Blob o en disco; una foto subida desde un formulario que nunca se guardó
aparece en «Sin usar» y se puede borrar.

**El archivo se borra después de la base, nunca antes** (resguardo 2 del
padre): si el borrado falla, queda en el log, y **una tarea del cron diario**
(`archivos-de-fotos-sueltos`) borra de Blob o del disco los archivos que
ninguna fila de `fotos` usa y tienen más de un día (una subida en curso guarda
el archivo antes que la fila). Nunca toca `public/`.

**El SVG entra solo por la importación** (resguardo 1): subir mira los bytes
con `sharp` y acepta jpg, png y webp, así que un SVG se rechaza aunque se
llame `.png`, y un test lo prueba. El logo de Techint se sirve como estático
de `public/aliados/`: es un archivo del repositorio, revisado como cualquier
código, y ningún SVG llega por el admin.

### 3.5. `origen-03-pregunta.webp`, una sola vez **[propuesta K]**

Los dos archivos son idénticos byte a byte (SHA-256 `A56CAE…60DE`). La
migración de fotos pasa la novedad `relime-2025` (su columna y su borrador) a
`/fotos/origen-03-pregunta.webp`; se borra `public/quienes-somos/`, y la
carpeta sale de las permitidas de `esSrcDeFoto`, que suma `aliados` e
`investigacion`.

## 4. La tabla `casos`

Regla de inventario (spec del admin §6): una columna por lo que hoy tiene
`features/investigacion/data/casos.ts`, con el mismo nombre. **Son siempre
cuatro**: entran publicados por la migración y el `data.ts` se borra.

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `id` | `text`, pk | `caso-01` … `caso-04`, fijos | `id` |
| `numero` | `text`, único | `01` … `04`: el lugar en la pila. No se edita | `numero` |
| `slug` | `text`, único | el ancla de hoy (`/investigacion#<slug>`) y la ficha de la fase 4 | `slug` · SPEC padre §5.3 |
| `pregunta` · `eje` · `indicio` | `text` | | `pregunta` · `eje` · `indicio` |
| `periodo` · `ambito` · `estado` | `text` | la ficha técnica; `estado` es `EN CURSO` o `CERRADO` | `ficha` |
| `contexto` · `pregunta_investigacion` | `text` | | `contexto` · `preguntaInvestigacion` |
| `lamina` | `jsonb` | `{ foto: { src, alt, foco }, sujecion, rotulo }`; sujeción `clip`, `cinta` o `esquinas` | `lamina` |
| `evidencias` | `jsonb` | `[{ titulo, descripcion, movible }]`, de 1 a 12 | `evidencias` |
| `analisis` · `aprendizaje` · `que_cambio` | `text` | | `analisis` · `aprendizaje` · `queCambio` |
| `produccion_relacionada` | `jsonb` | `[{ titulo, href }]`, hasta 4; `href` una ruta del sitio | `produccionRelacionada` |
| `es_demo` · `aclaracion` | `boolean` · `text` nulo | prende las marcas DEMO y la aclaración al pie | `esDemo` · `aclaracion` |
| `publicado_en` · `publicado_por` | `timestamptz` · `text`, nulos | la última publicación | como `novedades` |
| `borrador` · `borrador_en` · `borrador_por` | `jsonb` · `timestamptz` · `text`, nulos | el documento que se edita y la marca del choque | como `novedades` |

- **Lo que sale de código, no de columnas** **[propuesta D]**: el tinte de
  cada carpeta es parte de la escena y va por número (`01` navy, `02` medio,
  `03` claro, `04` verde); el `id` de cada evidencia (clave de React) y su
  rótulo («EVIDENCIA 01») salen de su posición, que es lo que son hoy en los
  cuatro. `ETIQUETA_DEMO` se queda con los componentes.
- **Las columnas no son nulas**: un caso nunca deja de estar publicado (no se
  despublica, no se borra). No hay `publicado` booleano.
- **Topes**, del contenido de hoy con aire y lo que la escena aguanta (el
  informe de la exploración, en DECISIONS): pregunta 96 (dos renglones de
  48ch en la tapa), indicio 48 (un renglón fijo), eje 50, período 16, ámbito
  60, contexto 400, pregunta de investigación 180, análisis 320, aprendizaje 90,
  qué cambió 200, rótulo de lámina 44, título de evidencia 32, descripción 90,
  título de producción 60, aclaración 200. Cada campo dice su tope y por qué,
  como los de las páginas.
- **El título de una evidencia va en mayúsculas** (el sitio lo pasa a
  oración en el estilo de nota): el formulario lo guarda así.
- **El slug** no puede ser el `id` de una sección de la página (`sentido`,
  `lineas`, `ciclo`, `evidencia`, `en-accion`, `expediente-caso`,
  `conversemos`, `biblioteca`, `contenido`): el aterrizaje por link se
  confundiría.

### 4.1. El 308 y los links de las líneas

- **Publicar con otro slug** escribe el 308 de `/investigacion/casos/<viejo>`
  a `/investigacion/casos/<nuevo>` en `redirecciones`, sin cadenas, como
  Novedades (SPEC padre §10: la ficha es de la fase 4, el 308 ya queda). El
  ancla de hoy (`#slug`) no llega al servidor y no se puede redirigir: la
  ayuda del campo lo dice.
- **Las líneas de investigación apuntan al caso por su `id`, no por su
  slug** **[propuesta E]**: `CASO_DE_CADA_LINEA` pasa a `caso-01`…, y la
  página le da a `LineasInvestigacion` el slug de cada uno. Así «Ver en
  acción» sigue al slug nuevo en vez de no hacer nada.

## 5. La tabla `aliados`

Una columna por lo que hoy tiene `config/aliados.ts`, más lo que el brief
suma (nombre, URL, la autorización). Los cinco entran publicados y
autorizados, con la nota de dónde consta, y el archivo se borra.

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `id` | `uuid`, pk | la ficha: `/admin/contenido/aliados/[id]` | nueva |
| `nombre` | `text`, nulo | cómo lo llama el admin y la actividad («UCSH») | brief |
| `logo` | `jsonb`, nulo | `{ src, alt, foco }`: una foto de Fotos; el alt es lo que lee un lector de pantalla en la tira («Universidad Católica Silva Henríquez») | `src` · `alt` |
| `tamano` | `text`, nulo | `chico` · `mediano` · `grande`: cuánto alto le da la tira para que pese lo mismo que los demás | `alto` |
| `url` | `text`, nulo | su sitio: con URL, el logo es un link | brief |
| `orden` | `int` | el lugar en la tira (UNESCO primero, pedido por ED) | el orden de la lista |
| `publicado` · `publicado_en` · `publicado_por` | | como `novedades`: despublicar conserva las columnas | molde |
| `borrador` · `borrador_en` · `borrador_por` | | | molde |
| `autorizado` | `boolean`, `false` | **sin esto no se publica nunca** (AGENTS.md §5.4) | brief |
| `autorizacion` | `text`, nulo | dónde consta: la carta, el mail o la carpeta | brief |
| `autorizado_en` · `autorizado_por` | `timestamptz` · `text`, nulos | quién marcó y cuándo | |
| `creado_en` · `creado_por` | | | molde |

- **`nombre` aparte del alt del logo** **[propuesta G]**: hoy existe solo el
  alt, que en Science Up es largo («Science Up — Consorcio Ciencia 2030 PUCV,
  USACH, UCN»); el nombre corto es para listas y actividad.
- **`tamano`** sale del `alto` de hoy: chico = `h-8`/`h-7` (UNESCO, Bloom),
  mediano = `h-11`/`h-10` (Science Up), grande = `h-12`/`h-11` (Techint,
  UCSH). Una lista cerrada en código, como las categorías.
- **La URL** está vacía en los cinco (hoy los logos no son links): el sitio
  no cambia. Con URL, el logo pasa a ser un link que abre en otra pestaña
  y lo dice al lector, como las redes del pie.
- **El orden** se cambia desde la lista, con «Subir» y «Bajar» en cada fila:
  mueve el lugar en la tira y regenera el sitio. No va al borrador: es de la
  tira, no de un aliado.

### 5.1. Autorizado: fuera del borrador, y garantizado en la consulta

- **La marca es una acción aparte** **[propuesta F]**, no un campo del
  borrador: «Marcar como autorizado» (con la nota, obligatoria) y «Quitar la
  autorización», con `autorizarAliados`. Rige ya: quitarla saca el logo del
  sitio en el momento, aunque siga publicado. Quien edita ve el apartado
  bloqueado con la explicación («Lo marca quien dirige o administra, con la
  nota de dónde consta la autorización»), y la acción lo rechaza igual.
- **Publicar exige la marca**: sin ella, «Publicar» contesta por qué.
- **La consulta del sitio filtra siempre por `autorizado`**, también en la
  vista previa, y un test lo prueba: un aliado publicado sin autorizar no
  sale nunca, ni con un borrador válido.
- **Los cinco de hoy**, autorizados por la carga inicial: la carpeta «LOGOS
  ALIANZAS» de ED (y la carta de UNESCO del 26 de agosto de 2026), como dice
  `docs/content/aliados-fuentes-drive.md`; la nota de Techint repite lo que
  ese documento deja pendiente («la hoja de ALIANZAS todavía dice
  “solicitado”: confirmar con Raquel»).

## 6. El modelo de entidad en cada una

| | Casos | Aliados |
| --- | --- | --- |
| Crear | no: son cuatro | la ficha vacía en `/nuevo`; el primer guardado crea la fila |
| Guardar borrador | sí, con el choque | sí, con el choque |
| Vista previa | `/investigacion#<slug>`, el expediente abierto | el Inicio, en la tira |
| Qué cambió | a mano, campo por campo (evidencias y producción, ítem por ítem) | nombre, logo, tamaño, URL |
| Publicar | valida entero, copia a columnas, 308 si cambió el slug | exige la marca; lo mismo |
| Despublicar | no | sí, conserva las columnas |
| Descartar cambios | sí | sí |
| Borrar | no | sí, con confirmación |

Dos esquemas Zod por entidad, con los mismos campos y topes, en
`features/investigacion/contenido/caso.ts` y `features/aliados/contenido/aliado.ts`
(y lo que no necesita Zod, en su `modelo.ts`), como `novedad.ts`. Las
acciones empiezan por la sesión y `editarContenido`, validan con Zod y
escriben con el cliente inyectado.

## 7. El admin

Todo cuelga de `/admin/contenido`, con sus cinco pestañas arriba
(`EncabezadoDeContenido`) y la guarda del layout.

### 7.1. Casos

- **`/admin/contenido/casos`** — una `Lista` de los cuatro: «Caso 01» y la
  pregunta; debajo el eje y quién publicó y cuándo; la insignia «Cambios sin
  publicar» si hay borrador, y «Editar». Sin primario: no se crean.
- **`/admin/contenido/casos/[id]`** — la «Ficha de una entidad»: «← Casos»,
  «Caso 01» con su insignia, Guardar borrador · Vista previa · **Publicar**.
  Bloques: «El caso» (pregunta, eje, indicio, URL), «Ficha técnica» (período,
  ámbito, estado), «El expediente» (contexto, pregunta de investigación,
  análisis, aprendizaje y qué cambió con el caso), «Lámina» (la foto, sin
  foco, su sujeción y su rótulo), «Evidencias» (lista variable: título,
  descripción, «se puede arrastrar»), «Producción relacionada» (lista
  variable: título y a qué página lleva) y «Caso provisional» (la casilla y
  la aclaración). El panel: «Se ve en» (Investigación, en la pila y con su
  ancla; y las líneas cuyo «Ver en acción» lo abre). Al pie, «Qué cambió» y
  «Descartar los cambios».

### 7.2. Aliados

- **`/admin/contenido/aliados`** — «Nuevo aliado» de primario; una `Lista` en
  el orden de la tira: el logo como se ve (blanco sobre el azul, chico), el
  nombre, y las insignias «Sin autorizar» (fuerte) o «Autorizado» (normal) y
  el estado de publicación; «Subir», «Bajar» y «Editar». Vacía: «Todavía no
  hay aliados» con «Nuevo aliado».
- **`/nuevo` y `/[id]`** — la ficha: «La tira» (nombre, logo, tamaño, URL),
  el apartado **«Autorización»** (el estado, la nota, quién y cuándo, y el
  botón, o bloqueado para quien edita), el panel con «Cómo se ve» (el logo
  en la tira, a su tamaño) y «Se ve en» (el pie de todas las páginas, el
  Inicio y Qué hacemos; sin autorizar, «En ningún lado: falta la
  autorización»), «Qué cambió» y «Deshacer o sacar del sitio».

### 7.3. Fotos

- **`/admin/contenido/fotos`** — «Subir foto» de primario (abre el
  formulario de subida en la misma pantalla: archivo y alt); el `Filtro`
  Todas · Sin texto alternativo · Sin usar (`?filtro=`), con su número; y la
  **grilla** (patrón nuevo, §10): la miniatura 4/3, el alt o «Sin texto
  alternativo», y «En N lugares» o «Sin usar». Cada tarjeta es el link a su
  ficha. Vacía por filtro: el estado vacío lo dice.
- **`/admin/contenido/fotos/[id]`** — «← Fotos»; la foto entera; el alt, con
  «Guardar» (el primario de la pantalla); los datos: ancho × alto, peso,
  tipo, quién la subió y cuándo (o «Llegó con el sitio»); **«Se usa en»**,
  una lista con divisor: dónde, con link a su pantalla, si está en el sitio,
  sin publicar o en el código, y el alt con que va ahí; y al pie
  «Reemplazar el archivo» (qué pasa, el archivo y el botón) y «Borrar» (con
  confirmación; si se usa, en lugar del botón dice dónde sacarla primero).

### 7.4. El campo de foto del kit **[propuesta H]**

- **«Elegir de Fotos…»** al lado de «Elegir foto…», cuando la app le pasa
  `elegir` (una función que trae las fotos; el kit no conoce la acción).
  Abre **un panel en línea, no un modal** (el admin no tiene modales): una
  grilla de miniaturas con un filtro por texto, cada una un botón con su alt
  («Elegir: Docentes en ronda…»), y «Cancelar». Elegir pone el `src`, el
  foco al centro y, si el alt del campo está vacío, el de la biblioteca. El
  foco vuelve al campo.
- **`conFoco={false}`** para logos y láminas, que no se recortan: la
  miniatura va entera y sin el punto.
- La acción que lista (`fotosParaElegir`) trae solo jpg, png y webp, con
  sesión y `editarContenido`. Los formularios de páginas, novedades, casos y
  aliados la pasan.

### 7.5. El índice de Contenido y las guías

Las tarjetas dicen su estado real: «4 casos · 1 con cambios sin publicar»,
«5 aliados · 1 sin autorizar», «47 fotos · 2 sin texto alternativo» (con
los números de ese momento; sin pendientes, solo la cuenta). Equipo sigue «Por hacer» (la 8b). Las guías de
casos, aliados y fotos se borran de `admin/por-hacer/guias-de-contenido.ts`.
**El punto de Contenido en la sidebar** cuenta también los casos y aliados con
cambios sin publicar **[propuesta J]**: el SPEC padre §6 lo define como
«cambios sin publicar» del módulo.

## 8. El sitio lee de la base

| Lugar | Lee | Cambia |
| --- | --- | --- |
| `/investigacion` | `casosDelSitio()`: los cuatro por número, cada uno su borrador en la vista previa si pasa el esquema | `InvestigacionEnAccion` le pasa los casos a `CasosInvestigacion` por prop, y los dos hooks que importaban `CASOS` los reciben; `LineasInvestigacion` recibe los slugs (§4.1) |
| el pie (todas las páginas), `DatosDuros` (Inicio), `BandaAliados` (Qué hacemos) | `aliadosDelSitio()`: publicados **y** autorizados, en orden, con el ancho, el alto y el tipo de su foto | el layout del sitio los lee una vez y los baja por prop (como hace Ajustes con sus datos, en vuelo); un `LogoDeAliado` compartido dibuja cada uno |

- Las dos consultas usan `leerSinRomper` y `cache`, validan cada fila con su
  esquema al leer, y sin base devuelven nada: el sitio compila.
- **El HTML no cambia** (texto, links, head, imágenes). Lo que sí cambia y
  `comparar-render` no mira: los casos viajan en el payload de React del HTML
  en vez de en el JS de la página.
- **Qué se regenera:** publicar o descartar un caso, `/investigacion`; todo lo
  de un aliado (publicar, despublicar, borrar, autorizar, ordenar), el layout
  entero; reemplazar una foto, las rutas que devuelve cada módulo.

## 9. Permisos y actividad

- **Las pantallas** son de los tres roles (`editarContenido`, la guarda del
  layout de Contenido). Nada de lo que muestran es de un rol y no de otro: la
  nota de autorización la ve quien edita, solo no la cambia. **Las acciones**
  empiezan por la sesión y `editarContenido`; autorizar y quitar la
  autorización, por `autorizarAliados`, y un test lo prueba.
- **Actividad** **[propuesta I]**, cada tipo con su frase, quién lo ve y si va
  al Inicio:

| Tipo | Frase | Lo ve | Inicio |
| --- | --- | --- | --- |
| `publico-un-caso` · `descarto-cambios-de-un-caso` | «Ana publicó el caso 01» | `editarContenido` | sí |
| `autorizo-un-aliado` · `quito-la-autorizacion-de-un-aliado` | «Ana autorizó el logo de UNESCO» | `editarContenido` | sí |
| `publico-un-aliado` · `despublico-un-aliado` · `borro-un-aliado` | «Ana publicó el logo de UNESCO» | `editarContenido` | sí |
| `subio-una-foto` | «Ana subió una foto» | `editarContenido` | **no**: no cambia el sitio |
| `reemplazo-una-foto` · `borro-una-foto` | «Ana reemplazó la foto «Docentes…»» | `editarContenido` | sí |

  Subir queda anotado también desde un formulario (el brief lo pide; el
  comentario de `subirFoto` que decía lo contrario se corrige). En Cuentas ›
  Actividad van al módulo Contenido, y «Ver» lleva a la ficha del caso; un
  aliado o una foto, como una novedad, se pueden borrar, y no llevan link
  (DECISIONS).

- **Inicio**, dos filas de pendientes: «N aliados sin autorizar»
  (`sin-autorizar`, dirige y administra, a Aliados) y «N fotos sin texto
  alternativo» (`a-corregir`, los tres, a Fotos con el filtro puesto).

## 10. Patrones nuevos (DESIGN.md §11)

- **Grilla de fotos** — su primer consumidor es `/admin/contenido/fotos`.
- **Elegir una foto** — el panel en línea del campo de foto.
- **Logo de aliado** — el logo sobre el azul, como en la tira, en la lista y
  en «Cómo se ve».

Todo con tokens, los cuatro tamaños de tipo, un primario por pantalla, sin
verde ni naranja fuera de su regla y con los contrastes medidos y escritos;
los tres temas, 390 de ancho y el teclado.

## 11. Migraciones y documentos

- **Tres migraciones** **[propuesta L]**, cada una con `--create-only` y su SQL
  de datos antes de la primera aplicación (ADR-0011): `fotos_de_public`
  (§3.1, §3.2 y §3.5), `casos` (§4, los cuatro) y `aliados` (§5, los cinco).
  El SQL lo genera un script que valida cada fila con su esquema y mide cada
  archivo con `sharp`; el script no se commitea. Sin dependencias nuevas.
- **Documentos:** AGENTS.md §3 (el árbol) y §5.4 (la lista vive en la tabla
  `aliados` y la consulta del sitio garantiza la marca); el README (Fotos y
  el reemplazo); el spec del admin §6 (el origen de `casos`, `aliados` y
  `fotos`, y cómo se encuentran los usos); DESIGN.md §11 (§10);
  `docs/content/aliados-fuentes-drive.md` (dónde vive la lista). Los cambios a
  AGENTS.md y DESIGN.md los revisa Mateo en el PR (DECISIONS del padre).

## 12. Lo que se propone

| | Propuesta | Por qué |
| --- | --- | --- |
| A | Las fotos de `public/` del contenido entran a `fotos` (47), con el alt de su primer uso; Equipo y portadas quedan para 8b y 8a | el spec del admin §6 le da `public/**` de origen, y logos y láminas son «de Fotos» |
| B | Un uso se reconoce por la URL; reemplazar la reescribe en cada uso de la base, y no reemplaza si un uso vive en el código | cambiar a ids tocaría el esquema de cada sección y el HTML; el código no se puede reescribir desde el admin |
| C | Editar el alt en Fotos no reescribe el de los usos; «Se usa en» muestra el de cada uno | el alt va con cada uso (DECISIONS 1 de la edición de páginas) |
| D | Número, tinte e id fijos de los casos; id y rótulo de cada evidencia por su posición; `es_demo` y la aclaración quedan como campos | son cuatro y la escena está armada para ellos; lo demás es contenido |
| E | Las líneas apuntan al caso por `id` y leen su slug | si no, cambiar un slug deja «Ver en acción» mudo |
| F | «Autorizado» es una acción aparte que rige ya, y la consulta del sitio filtra siempre, también en la vista previa | la marca es un hecho sobre ED, no contenido; y §5.4 no admite «casi» |
| G | En aliados, `nombre` aparte del alt del logo, `tamano` de tres, `orden` con Subir y Bajar, y con URL el logo es un link | el alt largo de Science Up; el alto y el orden existen hoy; la URL que el brief pide tiene que servir para algo |
| H | «Elegir de Fotos» como panel en línea, `conFoco={false}` para logos y láminas, solo jpg, png y webp en el selector | el admin no tiene modales; un SVG no va en una foto del contenido |
| I | La actividad de §9, con subir fuera del Inicio | el molde de Novedades anota publicar, despublicar, descartar y borrar; subir no cambia el sitio |
| J | El punto de Contenido y las tarjetas cuentan casos y aliados con cambios sin publicar | es la definición del punto (SPEC padre §6) |
| K | `origen-03-pregunta.webp` queda solo en `public/fotos/` | los dos son idénticos y la novedad ya puede apuntar a ese |
| L | Tres migraciones, una por tabla, con los datos adentro | un commit atómico por cosa, y el camino del ADR-0011 |

## 13. Fuera de esta lane

Equipo (8b, que suma su entrada al registro de usos), la Biblioteca (8a), las
fichas públicas de los casos y su canonical (fase 4), aplicar las
redirecciones en el sitio (Ajustes, en vuelo), mudar `admin/armazon/` al kit.

## 14. Cómo se sabe que está

- El gate entero con su salida en PROGRESS: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100), `pnpm test` y
  `pnpm build`.
- Tests, uno por comportamiento: el recorrido de fotos; los usos de cada
  módulo; reemplazar (reescribe, borra el archivo viejo, frena si hay código);
  borrar solo sin usos; guardar, choque, publicar con 308 y descartar un
  caso; crear, publicar sin marca (frena), autorizar sin capacidad (frena),
  despublicar y borrar un aliado; **la consulta del sitio nunca devuelve un
  aliado sin autorizar**; las dos filas del Inicio; las frases; y los dos
  tests de guarda y de sesión.
- Las tres migraciones aplicadas en `ed_casos` desde cero, y el HTML de todas
  las páginas comparado contra `main` con `scripts/comparar-render.mjs`: igual.
- De punta a punta en el navegador de Orca, con una cuenta de cada rol que
  importa: editar y publicar un caso (y su vista previa), cambiarle el slug;
  crear un aliado, que quien edita no lo pueda autorizar, autorizarlo como
  quien administra, publicarlo y verlo en el pie; subir una foto, elegirla en
  un formulario, reemplazarla y ver el cambio en el sitio, e intentar borrarla
  usada; los tres temas, 390 de ancho y el teclado.
