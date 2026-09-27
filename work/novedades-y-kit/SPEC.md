# SPEC — Novedades y el kit del admin

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y dependencias incluidas: DECISIONS del padre,
  2026-09-26)
- **Tier:** L · lane 6 del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/novedades-y-kit`, dev server en el 3024, base `ed_novedades`
- **Diseño:** el brief del padre (lane 6), sobre el SPEC padre §5.4, §6 y §9 y
  el spec del admin (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`)
  §2, §3, §6 y §9. Esto lo formaliza; no lo vuelve a decidir. Lo que el brief
  deja abierto y acá se propone está marcado **[propuesta]**, y la lista
  entera está en §14.

---

## 1. Qué se quiere

Es la **fase 2 del spec del admin**: nace `packages/kit-admin` contra una
entidad de verdad, y Novedades queda de punta a punta, con el sitio leyéndola
de la base. Novedades es la **primera entidad** —una tabla con una columna por
texto y un formulario escrito a mano con los primitivos del kit—, así que lo
que se decida acá (el kit, cómo se guarda un borrador de una entidad y cómo se
publica) es lo que copian materiales, equipo, casos y aliados. Por eso el
modelo va en un ADR (§12).

## 2. Lo que ya existe y se usa

| Pieza | Dónde | Qué se toma |
| --- | --- | --- |
| `editarNovedades` (los tres roles) | `packages/auth/src/permisos.ts` | tal cual; no se suma ninguna capacidad |
| Novedades en la sidebar, con `editarNovedades` | `admin/armazon/barra-lateral/modulos.ts` | tal cual |
| La guarda y «Sin permiso» | `admin/armazon/Guarda.tsx` | el layout del módulo |
| `registrarActividad`, tipos cerrados | `datos/actividad.ts` | cuatro tipos nuevos (§9) |
| Los controles del editor, con props planas | `admin/campos/` | se mudan al kit (§3) |
| Slugs: `desdeTexto`, `esValido`, `libre` | `packages/db/src/slug.ts` | el slug de una novedad |
| La tabla `redirecciones` (nadie la lee todavía) | `prisma/schema/sitio.prisma` | el 308 de un slug que cambia (§5.6) |
| El aviso de choque (`vioLaFila`, `choqueCon`) | `datos/acciones/choque.ts` | tal cual, con el sujeto de la frase como parámetro |
| «Qué cambió» (`Diferencia`, `Legible`, `ListaDeCambios`) | `lib/contenido/comparar.ts`, `admin/paginas/` | los tipos y la lista; la comparación de una novedad se escribe a mano (§5.5) |
| La vista previa (Draft Mode con la cookie acotada) | `datos/acciones/vista-previa.ts` | el mismo mecanismo, para una novedad |
| El frenado de la salida con cambios sin guardar | `admin/paginas/useFrenarSalida.ts` | tal cual |
| La vista previa de buscador y redes | `admin/paginas/VistaPreviaSeo.tsx` | con la imagen generada en lugar de la del sitio |
| Las páginas con secciones y SEO (la 4a) | `contenido/paginas.ts`, `lib/contenido/` | la página Novedades (§8) |
| Encabezado, lista, pestañas, insignia, estado vacío, avisos, botones | `admin/armazon/`, DESIGN.md §11 | consumidos; los que se extienden, en §11 |
| `next/og` (viene con Next 16) | — | la imagen para redes, **sin dependencias** |

## 3. `packages/kit-admin`

**Qué entra: los controles de `admin/campos/`**, que ya reciben props planas y
la subida de fotos por prop (AGENTS.md §12 lo previó):

| Del kit | Sale de | Cambio |
| --- | --- | --- |
| `TextoCorto`, `Parrafo`, `Contador`, `PieDelCampo`, `estadoDelLargo` | `admin/campos/` | ninguno |
| `ListaFija`, `CampoFoto` | `admin/campos/` | el tope de bytes llega por prop (`maximoBytes`): es la política de la app, no del control |
| `Seleccion` | `admin/campos/RutaInterna.tsx` | opciones con valor y etiqueta (`{ valor, etiqueta }`): la categoría de una novedad no se muestra como su clave. `Campo.tsx` le pasa las rutas con la ruta de etiqueta, y se ve igual que hoy |
| `ENTRADA`, `Cambio`, `resolverCambio` | `admin/campos/clases.ts`, `cambio.ts` | ninguno |
| `Foco`, `ValorDeFoto`, `posicionDelFoco` | `lib/contenido/fotos.ts` | viven en el kit, en un subpath sin React (`@ed/kit-admin/foto`); `lib/contenido/fotos.ts` los re-exporta, así el sitio no importa el kit entero y no hay dos definiciones |
| `Casilla`, `Fecha`, `ListaVariable` | **nuevos**, con Novedades de primer consumidor | §11 |

- **`Campo.tsx` y `errores.ts` se quedan en `admin/campos/`**: son el
  generador de formularios de las páginas y su contexto de errores, y el kit
  no los conoce (AGENTS.md §12). Importan los controles de `@ed/kit-admin`. Las
  lanes en vuelo que consumen `Campo.tsx` no cambian nada; las que importaran
  un control suelto siguen el import al rebasear.
- **`admin/armazon/` se queda en la app** (brief). **[propuesta A]** Pero
  `CampoFoto` usa tres piezas del armazón —`Boton`, `claseDeBoton` y
  `Aviso`— y un package no puede importar la app. Propongo que **esas tres
  pasen al kit** (el spec del admin §3 ya pone «avisos» y el formulario en
  `kit-admin`) y que `armazon/Boton.tsx`, `armazon/clases.ts` y el `Aviso` de
  `armazon/Campos.tsx` queden **re-exportándolas** del kit: las lanes en vuelo
  siguen compilando sin tocar un import, y la mudanza mecánica del armazón
  borra esas tres líneas. Las alternativas: (b) pasarlas y cambiar todos los
  imports de la app ahora, y las lanes siguen el import al rebasear; (c) dejar
  `CampoFoto` en la app hasta esa mudanza, y el kit arranca sin foto.
- **Íconos:** el kit trae los suyos (`Alerta`, `Check`, `X`, `Subir` y los dos
  de mover y el de quitar de `ListaVariable`), con los mismos trazos del set
  del sitio: el set de `components/ui/icons` es de la app y el kit no lo ve.
- **La primera frontera:** el kit no sabe nada de ED. Ni «novedad», ni una
  ruta del sitio, ni un texto de ED; las etiquetas y las ayudas llegan por
  prop. `next/image` sí: el kit es para apps de Next.
- **El package:** `packages/kit-admin` (`@ed/kit-admin`), con `react`,
  `react-dom` y `next` como `peerDependencies` (los pone la app) y como
  `devDependencies` las mismas herramientas que `@ed/db` y `@ed/auth`
  (`typescript`, `eslint`, `eslint-config-next`, `@types/react`), en las
  versiones que ya están en el lockfile: **ninguna dependencia nueva**. ESLint
  con las reglas de React (`core-web-vitals`), `tsconfig` con `jsx`.
- **El gate:** el kit se suma a las dos listas de AGENTS.md §5.8 —el script
  `react-doctor` de la raíz y `PROYECTOS` de `scripts/verificar-react-doctor.mjs`—
  y tiene que dar 100/100 como los demás.
- **Tailwind:** `@source` del kit en `apps/sitio/src/app/globals.css`, así v4
  escanea sus clases.
- **Los tokens son de la app.** El kit usa clases con nombre de token
  (`text-admin-meta`, `bg-azul-principal`, `border-gris-texto`,
  `text-rojo-error`, `bg-naranja-accion`, `font-display`, la variante `dark:`…)
  y no define ninguno. El `README.md` del kit escribe ese contrato: qué tokens
  tiene que definir la app que lo usa, el `@source`, y que los contrastes
  medidos de DESIGN.md §11 valen solo con los valores de esta app.

## 4. La tabla `novedades`

Regla de inventario (spec del admin §6): una columna por lo que hoy tiene
`features/novedades/data/novedades.ts`, con el mismo nombre, más lo que el SPEC
padre §5.4 suma. **No hay más columnas que estas.**

| Columna | Tipo | Qué es | De dónde |
| --- | --- | --- | --- |
| `id` | `uuid`, pk | la ficha del admin: `/admin/novedades/[id]` | nueva: el id de hoy pasa a ser el slug |
| `slug` | `text`, único, nulo | la URL publicada: `/novedades/<slug>` | el `id` de hoy · SPEC §5.4 |
| `titulo` | `text`, nulo | | `titulo` |
| `bajada` | `text`, nulo | | `bajada` |
| `fecha` | `text`, nulo | `AAAA-MM-DD`, `AAAA-MM` o `AAAA`: la precisión que da la fuente | `fecha` |
| `categoria` | `text`, nulo | una de la lista cerrada (§4.2) | `categoria` |
| `imagen` | `jsonb`, nulo | `{ src, alt, foco }`, el mismo valor que una foto de una página | `imagen` · SPEC §5.4 («de Fotos») |
| `cuerpo` | `jsonb`, nulo | `[{ titulo, parrafos[] }]`; sin cuerpo no hay ficha | `cuerpo` |
| `destacada` | `boolean`, no nulo, `false` | la de tapa; **una sola, en la base** (§4.1) | `destacada` · SPEC §5.4 |
| `publicacion` | `text`, nulo | el título exacto del material de la Biblioteca que la ficha abre | `publicacion` · **[propuesta B]** |
| `imagen_para_redes` | `jsonb`, nulo | la que reemplaza a la generada | SPEC §5.4 |
| `publicada` | `boolean`, no nulo, `false` | el sitio la muestra | SPEC §5.4 (estado) |
| `publicada_en` · `publicada_por` | `timestamptz` · `text`, nulos | la última publicación, quién en llano | como `paginas` |
| `borrador` | `jsonb`, nulo | el documento que se edita; nulo es «el borrador es lo publicado» | como `paginas` |
| `borrador_en` · `borrador_por` | `timestamptz` · `text`, nulos | el último guardado, y la marca del aviso de choque | como `paginas` |
| `creada_en` · `creada_por` | `timestamptz` `now()` · `text` nulo | | |

- **Las columnas del contenido son lo publicado**, y son nulas solo mientras
  la novedad nunca se publicó (§5). Lo que el sitio lee se valida con Zod al
  leer (AGENTS.md §12), así que una fila rota no llega a la pantalla.
- El nombre de las columnas en la base va en `snake_case` con `@map`, como
  `actividad` y `redirecciones`.

### 4.1. La destacada, garantizada en la base

`CREATE UNIQUE INDEX "novedades_una_sola_destacada" ON "novedades" ("destacada") WHERE "destacada"`,
a mano en la migración de `--create-only`, como `user_una_sola_dirige`
(Prisma no escribe índices parciales). Publicar una destacada desmarca la
anterior en la misma transacción —su columna y su borrador, si tiene: si no,
publicar un arreglo de la vieja le devolvería la tapa sin que nadie lo
pida— y lo avisa: «Publicada. «X» dejó de ser la destacada.».

### 4.2. Las categorías: una lista cerrada en código

Las de hoy, en el orden de los filtros: Publicaciones, Eventos, Convocatorias,
Prensa y Alianzas (SPEC padre §8: ED todavía no dio otras). Viven con el
esquema de la novedad (§5.1); sumar una es un cambio de código. Los íconos de
los filtros son del sitio y se quedan en `features/novedades/`.

### 4.3. Las novedades de hoy entran por la migración

- `pnpm migrate --create-only`, y en el mismo archivo el índice parcial y el
  **SQL de datos generado desde `novedades.ts`**, comentado (qué mueve y por
  qué), antes de su primera aplicación (AGENTS.md §12, ADR-0011). Así
  producción tiene las nueve en el primer deploy, publicadas, con
  `publicada_por` nulo («la carga inicial», sin persona).
- **El texto alternativo de las nueve imágenes**, que hoy no existe (el sitio
  las dibuja con `alt=""` y lo sigue haciendo: el título está al lado), sale
  del que ya tiene esa misma foto en el repo (`fotoDeRuta` de Inicio y los
  demás) y, donde no hay, se escribe mirando la foto. El foco, al centro:
  el HTML del sitio no cambia.
- **El `data.ts` se borra en el mismo PR**, con `MOVIMIENTO` y `LANZAMIENTOS`,
  que pasan a secciones de la página (§8): una sola fuente de verdad. Sin base
  (sin `DATABASE_URL`), el sitio compila y `/novedades` muestra su estado
  vacío.

## 5. El modelo de entidad: borrador y publicación

Es lo que el ADR registra (§12) y lo que copian las entidades que siguen.

**La fila tiene dos copias: lo publicado en columnas, que es lo que lee el
sitio, y el borrador en un documento, que es lo que edita el admin.** Es el
modelo de `paginas` (publicado · borrador), con una diferencia: lo publicado
no es un documento sino columnas tipadas, así el sitio consulta, ordena y la
base garantiza (el slug único, la destacada única) sobre columnas de verdad.
El borrador es un documento porque **un borrador puede estar incompleto**: una
novedad recién creada no tiene título ni foto, y una columna no nula no la
dejaría existir.

### 5.1. Dos esquemas, un lugar

En `features/novedades/contenido/novedad.ts`, como los esquemas de las
secciones: la lista de categorías, los topes y dos esquemas Zod.

- **`esquemaNovedad`** (publicar): todo lo que el sitio necesita, completo.
  Título (100), bajada (320), fecha válida en una de las tres precisiones,
  categoría de la lista, imagen con su alt, slug válido (`esValido`), cuerpo
  de hasta 10 secciones —título (80) y párrafos (hasta 2000 caracteres por
  sección)—, destacada, publicación de la lista del catálogo o nula, imagen
  para redes o nula. Los topes salen del contenido de hoy con aire, como hizo
  la 4a.
- **`esquemaBorrador`** (guardar): los mismos campos con los mismos topes,
  pero todo puede estar vacío. Guardar nunca frena por lo que falta; frena por
  lo que está mal (un texto demasiado largo, una fecha que no existe, un slug
  que ya usa otra novedad).

### 5.2. Los estados

| Estado | Qué es | Pestaña de la lista | Insignia |
| --- | --- | --- | --- |
| Borrador | nunca se publicó, o se despublicó | Borradores | fuerte, «Borrador» |
| Publicada | el sitio la muestra, sin cambios pendientes | Publicadas | normal, «Publicada» |
| Publicada con cambios | el sitio la muestra y hay un borrador | Publicadas | fuerte, «Cambios sin publicar» |

### 5.3. Las acciones

Todas en `datos/acciones/novedades.ts`: sesión, `editarNovedades`, Zod, y la
escritura en `datos/acciones/editar-novedades.ts` y
`publicar-novedades.ts`, con el cliente inyectado para probarlas contra el
Postgres local (como las de páginas).

- **Crear:** el primer «Guardar borrador» de `/admin/novedades/nueva` crea la
  fila con su borrador y la ficha pasa a `/admin/novedades/[id]` (§6.2).
- **Guardar borrador:** valida con `esquemaBorrador` y escribe `borrador`,
  `borrador_en` y `borrador_por`, con el aviso de choque de las páginas: trae
  el `borrador_en` que vio la pantalla y, si otra persona guardó, no pisa.
- **Publicar:** guarda antes lo que haya en pantalla, valida el borrador (o,
  sin borrador, lo publicado) con `esquemaNovedad` y, en una transacción:
  copia a las columnas, `publicada` en verdadero, `borrador` en nulo, la
  destacada única (§4.1) y el 308 si cambió el slug (§5.6). Los errores, en el
  campo, como en las páginas.
- **Despublicar:** `publicada` en falso; las columnas quedan (volver a
  publicar es un clic y el slug sigue reservado). Si era la destacada, deja de
  serlo, en la columna y en su borrador, y lo avisa: volver a publicarla no le
  roba la tapa a la que esté.
- **Descartar cambios:** en una publicada con borrador, vuelve a lo
  publicado. **[propuesta C]** El SPEC padre no lo lista, pero sin esto una
  publicada con un borrador que no se quiere queda trabada; es el «Descartar
  borrador» de las páginas.
- **Borrar:** la fila entera, con confirmación que dice si está en el sitio;
  su URL da 404 y se borran las redirecciones que apuntaban a ella.

### 5.4. La vista previa

El Draft Mode de las páginas, abierto por una acción con sesión y
`editarNovedades`. **En vista previa cada novedad se ve como quedaría al
publicarla:** las publicadas con su borrador, y las que no están en el sitio
solo si tienen un borrador que pasa `esquemaNovedad`. La acción lleva a la
ficha de la novedad si tiene cuerpo, y a `/novedades` si no.

### 5.5. Qué cambió

El formulario contra lo publicado, **campo por campo y en vivo** (incluye lo
que todavía no se guardó, que es lo que «Publicar» va a publicar), con la
lista de «Qué cambió» de DESIGN.md §11. La comparación de una novedad se
escribe a mano, campo por campo con su etiqueta
(`admin/novedades/cambios.ts`): una entidad no se describe con el esquema de
las páginas (AGENTS.md §12). Una novedad que nunca se publicó no la muestra:
se publica entera.

### 5.6. El slug

- **Mientras la novedad no se publicó**, el slug sigue al título
  (`desdeTexto`) hasta que alguien lo edita a mano. **Después de publicada, no
  se mueve solo** (spec del admin §5).
- Guardar avisa en el campo si otra novedad ya lo usa (publicada o en
  borrador); la base lo garantiza igual con el índice único.
- **Publicar con un slug distinto del publicado** escribe en la misma
  transacción el 308 de `/novedades/<viejo>` a `/novedades/<nuevo>`, rehace
  las que apuntaban al viejo (sin cadenas) y borra la que saliera del nuevo.
- **El sitio lee `redirecciones`** en la ficha: un slug que no es de ninguna
  novedad busca su redirección antes del 404 y contesta `permanentRedirect`
  (308). Es el primer lector de esa tabla; Ajustes › SEO (lane 10) la
  generaliza.

## 6. El módulo Novedades

### 6.1. `/admin/novedades` — la lista

- **Encabezado:** `h1` «Novedades», **«Nueva novedad»** (el primario, un link a
  `/nueva`) y las pestañas **[propuesta D]** **Publicadas · Borradores**, con
  Publicadas de puerta (`/admin/novedades` y `/admin/novedades/borradores`).
  El SPEC padre las nombra al revés; después de la migración las nueve están
  publicadas, y con Borradores de puerta lo primero que vería ED es una lista
  vacía.
- **El buscador:** si la 3b ya lo dejó en `main` al rebasear, se consume; si
  no, nace acá en `admin/armazon/` con su interfaz (un `GET` con `?q=`) y el
  que rebasea segundo concilia. Busca en el título, sin distinguir mayúsculas
  ni acentos, en lo que hoy son decenas de filas: se filtra en el servidor
  después de leer, sin índice.
- **Las filas** (`Lista`): el título, con **★ Destacada** si lo es; en el
  detalle, la categoría, la fecha y quién y cuándo (publicó o guardó); la
  insignia de §5.2; y «Editar» con el título para el lector. En el orden del
  sitio (§7.2).
- **Vacía:** «Todavía no hay novedades.» con **[Nueva novedad]** adentro del
  `EstadoVacio`, que estrena acá su acción (§11). Una pestaña vacía con
  novedades en la otra lo dice («No hay borradores: todas están publicadas.»),
  con la misma acción.
- Título de pestaña «Novedades · Admin ED»; la guía de `por-hacer/guias.ts`
  se borra.

### 6.2. `/admin/novedades/nueva` y `/admin/novedades/[id]` — la ficha

**`/nueva` es la ficha vacía, sin fila todavía**: un `GET` que crea filas lo
dispararía el prefetch de un link. El primer guardado crea la fila y la
dirección pasa a `/[id]` sin recargar. Fecha de hoy, primera categoría, lo
demás vacío.

- **Encabezado fijo** (el del editor de páginas, con su modo navy con cambios
  sin guardar): «← Novedades» (el «volver» de la 3b, o nace acá si no está),
  el título de la novedad («Nueva novedad» mientras no tiene), su insignia, y
  en el detalle quién y cuándo más **Despublicar**, **Descartar cambios** y
  **Borrar** (terciario y destructivos) cuando aplican. Acciones: Guardar
  borrador · Vista previa · **Publicar** (el único primario).
- **El formulario**, escrito a mano con los controles del kit: título, bajada,
  fecha (`Fecha`), categoría (`Seleccion`), imagen (`CampoFoto`), destacada
  (`Casilla`, que dice cuál lo es hoy y que marcarla la desmarca), el cuerpo
  (`ListaVariable` de secciones: título y texto, un renglón por párrafo), la
  publicación de la Biblioteca (`Seleccion`) y la URL (`TextoCorto` con la
  dirección completa a la vista).
- **El panel lateral** (al lado desde `lg`, abajo en el celular):
  - **Cómo se ve** en Google y al compartir, en vivo, con el título y la
    bajada (como hoy: la ficha usa esos dos de metadata).
  - **La imagen para redes:** la generada, y «Usar otra» (un `CampoFoto`
    opcional) para reemplazarla; «Volver a la generada» la saca.
  - **Se ve en:** `/novedades`, su ficha si tiene cuerpo, e Inicio si está
    entre las cuatro más nuevas. **[propuesta E]** El SPEC padre dice «Inicio
    (si es la destacada)», pero el Inicio muestra hoy las cuatro más nuevas y
    no la destacada, y `features/` no cambia de contrato: «Se ve en» dice lo
    que pasa.
  - **Ver en el sitio**, si está publicada: su ficha, o `/novedades`.
  - **Qué cambió** (§5.5), si está publicada.
- **Cambios sin guardar:** el mismo aviso al salir que el editor de páginas.
- **Título de pestaña:** «<título> · Admin ED»; «Nueva novedad · Admin ED».

### 6.3. La imagen para redes, generada

Con `ImageResponse` de `next/og`: el título en Manrope sobre el azul de la
marca, con la categoría, la fecha y el logo. **[propuesta F]** Manrope entra
como archivo (`.woff` de latín en negrita, licencia OFL) al lado del
generador: `next/og` no lee las fuentes de `next/font`, y sin eso sale en la
fuente de fábrica. Un solo generador (`features/novedades/imagen-para-redes.tsx`)
para dos rutas:

- **En el sitio,** `/novedades/[slug]/imagen-para-redes`, estática como la
  ficha, que la pone en su `og:image` cuando no hay una propia.
- **En el admin,** `/admin/novedades/imagen-para-redes?titulo=…&categoria=…&fecha=…`,
  para la vista previa en vivo de lo que está en pantalla. Pide sesión y
  `editarNovedades` adentro (un route handler no pasa por el layout); si no,
  cualquiera generaría imágenes con la marca de ED.

## 7. El sitio lee de la base

### 7.1. Las consultas

`datos/consultas/novedades.ts`, con el guardado de `filaDe` de las páginas: sin
`DATABASE_URL`, nada (y el sitio compila); un hipo en `next build` falla el
build; en una visita se absorbe. Todo se valida con `esquemaNovedad` al leer.

- `novedadesDelSitio()`: las publicadas (o, en vista previa, §5.4), en orden.
- `novedadPorSlug(slug)`: la de la ficha.
- `redireccionDe(ruta)`: el 308 de §5.6.

### 7.2. El orden

**Por fecha, de la más nueva a la más vieja**, y una fecha con menos precisión
va después de las más precisas del mismo período («2025» después de
«2025-05»): es el orden de los textos, y no depende de la collation de la base
porque se ordena en el servidor. **Un cambio visible, uno solo:** hoy el orden
es el de la lista escrita a mano, y en la página 2 del listado «Problematizar
la matemática escolar» (2025) pasa después de «Los criterios de la derivada»
(2025-05). Las cuatro del Inicio, la destacada y la última actualización del
hero no cambian.

### 7.3. Lo que lee cada lugar

- **`/novedades`:** el hero (la fecha de la más nueva), las destacadas (la
  marcada, o la más nueva, y la siguiente), el listado con sus filtros. Los
  componentes reciben las novedades por props (cuarta frontera): dejan de
  importar el `data.ts`.
- **`/novedades/[slug]`:** la ficha de las que tienen cuerpo; los anclajes de
  sus secciones salen del título con `desdeTexto` (dan los mismos de hoy).
  Metadata: título y bajada, y la imagen propia o la generada.
- **Inicio:** las cuatro más nuevas en «Biblioteca y Novedades», por prop.
- **`/novedades/rss.xml`** (nuevo): RSS 2.0 con las publicadas —título, link
  (la ficha o `/novedades`), `guid`, `pubDate` desde la fecha (el primer día
  del mes o del año si no hay más), bajada y categoría—, estático, y el
  `<link rel="alternate">` en la metadata de `/novedades`. El XML lo arma una
  función sin ED en `lib/`, con su test.
- **Al publicar, despublicar o borrar** se revalida lo afectado: `/`,
  `/novedades`, `/novedades/rss.xml`, la ficha y su imagen (el slug viejo y el
  nuevo).

## 8. La página Novedades en el admin

Los textos propios de la página (INVENTARIO §6, `git show
fa8d641^:work/edicion-de-paginas/INVENTARIO.md`) pasan a secciones de página
por el camino de la 4a: esquema e inicial en `features/novedades/contenido/`,
una línea en `contenido/paginas.ts`, y la pestaña SEO.

| Sección | Qué se edita |
| --- | --- |
| Hero | «Siempre hay», las cinco palabras del tablero (cantidad fija), la bajada y «Última actualización» |
| Destacadas | el título de la sección y el texto del botón («Leer la nota») |
| Lo último | el título y los tres textos del estado vacío de un filtro |
| ED en movimiento | los seis momentos (cantidad fija: la escena los calcula a mano): etiqueta, frase, acento (tiene que estar en la frase) y foto |
| Recién salido | el título, el texto del link a Biblioteca y los cinco lanzamientos (tipo, título y foto) |
| Cierre | el título, el párrafo con redes y sin redes, y el texto del botón |
| SEO | el título y la descripción de hoy, sin imagen propia |

Los largos máximos salen del texto de hoy con aire; los que animan (el
tablero, la escena) lo dicen en su ayuda. Las fotos piden alt como en Inicio,
aunque el sitio las muestre decorativas. `contenido/paginas.ts` lo tocan
también la 4b y la 4c: el que rebasea segundo concilia su línea.

## 9. Permisos y actividad

- `app/(admin)/admin/(protegido)/novedades/layout.tsx` pasa por
  `<Guarda capacidad="editarNovedades">` (`guarda.test.ts` lo exige). Cada
  acción chequea `editarNovedades` después de la sesión
  (`acciones-con-sesion.test.ts`); la ruta de la imagen del admin, también.
- **La actividad**, con la novedad en `sobre` (su título) y su id en `sobreId`:
  `publico-una-novedad`, `despublico-una-novedad`, `descarto-cambios-de-una-novedad`
  y `borro-una-novedad`. Guardar un borrador no se anota (no cambia el sitio),
  como en las páginas. **La frase y quién ve cada tipo** van en el registro de
  la 3c (`admin/actividad/frase.ts`) si ya está en `main` al rebasear; si no,
  queda en PROGRESS para quien rebasee segunda.

## 10. Inicio

Si al rebasear el registro de pendientes y el de accesos rápidos de la 3c ya
están en `main`: el pendiente **«Novedades en borrador hace más de 7 días»**
(las que no están en el sitio y no se guardaron en 7 días, lleva a Borradores)
y el acceso rápido **«Nueva novedad»** en el módulo de `modulos.ts`. Si no,
queda anotado en PROGRESS.

## 11. Patrones nuevos (DESIGN.md §11)

Cada uno nace con Novedades como primer consumidor y se escribe en §11 en este
PR, con sus contrastes medidos en los tres temas:

- **Estado vacío con acción:** la acción principal de la pantalla, debajo de
  la frase (§11 ya dice que llega con Novedades).
- **`Casilla`:** una casilla con su etiqueta y su ayuda, en el azul de la
  marca (el `accent` de la casilla de los opcionales de hoy).
- **`Fecha`:** año, mes y día, con mes y día opcionales («Sin mes», «Sin
  día»): una fecha con la precisión que da la fuente.
- **`ListaVariable`:** ítems que se agregan, se quitan y se mueven (arriba ·
  abajo, con botones y no arrastrando), con la cantidad máxima a la vista.
- **`Seleccion`:** el `select` de las rutas, con etiquetas.
- **La ficha de una entidad:** el formulario y el panel lateral, y «Se ve en».
- La ubicación: los controles viven en `packages/kit-admin`, el armazón en
  `admin/armazon/` (§11 dice hoy que todo está en el armazón).

## 12. Documentos que cambian

- **ADR nuevo** (el número libre al escribirlo; la 3b tiene reservado el
  0012): «El kit del admin y el modelo de entidad» — qué es el kit y su
  frontera, los tokens de la app, y §5 entero.
- **AGENTS.md** §3 (el árbol: `packages/kit-admin`, `admin/novedades/`, las
  consultas y acciones nuevas, `features/novedades/contenido/`), §12 («lo
  único que todavía no existe es `packages/kit-admin`» deja de ser cierto; el
  modelo de entidad en una línea) y §13 (la fase 2, hecha). Cambia AGENTS.md:
  lo revisa Mateo en el PR.
- **El spec del admin** §3 (el kit tal como quedó), §6 (la tabla `novedades`
  y el modelo) y §9 (la fase 2, hecha).
- **README:** el kit, el módulo Novedades y el RSS.
- **DESIGN.md §11:** lo de §11 de este SPEC. Cambia DESIGN.md: lo revisa Mateo
  en el PR.

## 13. Fuera de esta lane

- Los materiales relacionados de una novedad (la relación llega con la
  Biblioteca, lane 8, que reemplaza `publicacion`); la marca en la curva de
  Métricas al publicar (lane 11); mudar `admin/armazon/` al kit (un cambio
  mecánico aparte, cuando no haya lanes en vuelo).
- Elegir una foto ya subida en el campo de foto (llega con Fotos, lane 9).
- Publicación programada, versiones de una novedad y texto enriquecido (SPEC
  padre §10).

## 14. Lo que se propone

| | Propuesta | Por qué |
| --- | --- | --- |
| A | `Boton`, `claseDeBoton` y `Aviso` pasan al kit; `armazon/` los re-exporta hasta su mudanza | `CampoFoto` los usa y el armazón se queda en la app (§3) |
| B | `publicacion` queda como columna (texto), editada con un `Seleccion` de los títulos del catálogo | existe hoy (la ficha de RELIME abre el artículo); la lane 8 la cambia por la relación |
| C | «Descartar cambios» en una publicada con borrador | sin eso, un borrador no deseado de una publicada queda trabado |
| D | Pestañas Publicadas · Borradores, con Publicadas de puerta | tras la migración todo está publicado |
| E | «Se ve en» dice Inicio si está entre las cuatro más nuevas | es lo que el Inicio muestra; `features/` no cambia de contrato |
| F | Manrope como archivo `.woff` (OFL) para la imagen generada | `next/og` no lee `next/font` |

## 15. Cómo se sabe que está

- El gate entero con su salida en PROGRESS: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100 en los cuatro proyectos),
  `pnpm test` y `pnpm build`.
- Tests, uno por comportamiento: guardar, choque, publicar (con la destacada
  única, el 308 y los errores en el campo), despublicar, descartar y borrar
  contra el Postgres local; el orden; la vista previa; el RSS; y los dos tests
  de guarda y de sesión con el módulo nuevo.
- La migración aplicada en `ed_novedades` desde cero, y `/novedades`, las dos
  fichas y el Inicio con las nueve, con el HTML comparado contra `main`
  (`scripts/comparar-render.mjs`): la única diferencia es el orden de §7.2.
- De punta a punta en el navegador de Orca: crear una novedad, guardarla,
  verla en vista previa, publicarla, verla en el sitio y en el RSS, cambiarle
  el slug y que el viejo dé 308, marcarla destacada, despublicarla y
  borrarla; los tres temas, 390 de ancho y el foco con teclado.
