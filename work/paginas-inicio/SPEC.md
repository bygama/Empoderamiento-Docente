# SPEC — Páginas: Inicio completo y la base de la edición

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first)
- **Decide:** Mateo; aprueba el padre (`work/mapa-del-admin/DECISIONS.md`,
  2026-09-26: «procede en automatico», tablas incluidas)
- **Tier:** L · lane 4a de 12 del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md)
  · rama `mateo/paginas-inicio` · worktree propio · puerto 3014 · base
  `ed_paginasinicio`
- **Diseño:** el brief del padre (lane 4a, «La lane 4 se parte en tres»), el
  SPEC padre §5.3, §6, §7 y §9, y el modelo de la lane que hizo el hero
  (`git show fa8d641^:work/edicion-de-paginas/SPEC.md` e `INVENTARIO.md` §1).
  Este SPEC lo formaliza; no lo re-decide.
- **Reabre:** el spec del admin
  (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`) §11:
  versiones sale de «fuera de alcance».

---

## 1. Para qué

Hoy desde el admin se edita solo Inicio → Hero. Esta lane termina Inicio y
pone la base que las otras seis páginas van a usar (4b y 4c, en paralelo,
después): **versiones, «ver qué cambió», el aviso de choque y la pestaña
SEO**. Lo que se construya acá tiene que servir para cualquier página sin
cambios: una página nueva suma sus secciones (y su SEO) al registro y hereda
todo lo demás.

## 2. El resto de Inicio

Seis secciones más, en el orden del scroll (INVENTARIO §1). Cada una tiene su
esquema y su contenido inicial en `apps/sitio/src/features/home/contenido/`,
su línea en `apps/sitio/src/contenido/paginas.ts`, y su componente lee por
props. **Su archivo o arreglo de datos se borra en el mismo commit** (una sola
fuente de verdad). **El sitio no cambia:** el HTML prerenderizado de `/`
antes y después de cada sección da idéntico con
`scripts/comparar-render.mjs`.

| Clave | En el admin | Campos (máximo de caracteres) | Hoy vive en |
| --- | --- | --- | --- |
| `quienesSomos` | ¿Quiénes somos? | título (30) · cuerpo, párrafo con resaltado (500) · botón: texto (30) y adónde lleva · foto | `Manifiesto.tsx` (`QS_PARAGRAPHS`, foto y botón en el JSX) |
| `mision` | Misión | título (30) · cuerpo, párrafo con resaltado (500) · foto | `MisionPanel.tsx` (`MISION_PARAGRAPHS`) |
| `enNumeros` | En números | 4 datos, lista fija: cifra (9) · etiqueta (28) · nota (80) | `DatosDuros.tsx` (`DATOS`) |
| `comoTrabajamos` | Cómo trabajamos | 5 pasos, lista fija: título (16) · frase (56) · detalle (260) · foto | `como-trabajamos/data.ts` (`PASOS`) |
| `areas` | Áreas de especialización | título (40) · bajada (150) · enlace: texto (40) y adónde lleva · 7 áreas, lista fija: título (60) · frase (70) · detalle con una idea resaltada (210) | `LineasAccion.tsx` y `lineas-accion/data.ts` (`AREAS`) |
| `bibliotecaYNovedades` | Biblioteca y Novedades | Biblioteca: título (20) · bajada (60) · Novedades: título (20) · bajada (60) | `BibliotecaNovedades.tsx` |

Los máximos llevan aire sobre el texto más largo de hoy (el mismo criterio
que el hero: con el tope al ras, quien edita choca contra `maxLength` en el
primer intento).

**Lo que queda en código, a propósito:**

- Los logos de aliados de En números son `config/aliados.ts` (AGENTS.md §5.4):
  se editan en Aliados (lane 9), no acá.
- Los íconos de las siete áreas y el número de cada paso y de cada área
  («01»…) salen del índice: son estructura, no copy.
- Las filas de Biblioteca y Novedades (los materiales y las novedades) son
  entidades de las lanes 8 y 6: acá solo los textos propios de la sección.
- Las áreas y el método tienen otra copia en Qué hacemos: la fuente única es
  de 4b. Acá Inicio edita la suya y la ayuda de la lista lo avisa («Qué
  hacemos tiene su propia versión: si cambiás esto, revisala allá»).

### 2.1. El resaltado, sin un séptimo tipo de campo

«¿Quiénes somos?», «Misión» y el detalle de cada área tienen partes
resaltadas. Se escriben **entre dobles asteriscos**, como en WhatsApp:
«Somos una manera distinta de comprender **las matemáticas**…». No hace falta
un tipo de campo nuevo:

- El campo es un `parrafo` (o un `textoCorto`) con su ayuda, y la sección le
  suma un `.refine()` que exige los asteriscos cerrados. Zod 4 hereda el
  registro de metadata a través de los refinamientos (comprobado en 4.5.4:
  `registro.get(campo.refine(...))` devuelve la metadata del campo), así que
  el formulario sigue saliendo igual: **los seis tipos de AGENTS.md §12 no
  cambian**.
- `apps/sitio/src/lib/contenido/resaltado.ts` (sin ED): `fragmentos(texto)`
  → `Array<{ texto: string; resaltado: boolean }>` y `resaltadoValido(texto,
  { exactamente? })`. Los espacios fuera de las marcas se conservan tal cual.
- **Párrafos:** en el cuerpo de «¿Quiénes somos?» y «Misión» cada salto de
  línea separa un párrafo (los renglones vacíos no cuentan).
- **Áreas:** exactamente **un** resaltado por detalle, la idea que distingue
  al área (Gastón, 2026-09-14, en el comentario de `lineas-accion/data.ts`).
  El esquema lo exige.
- **La cifra de En números** es un `textoCorto` como se lee («+14.000»,
  «500») con su `.refine()`: un número con prefijo o sufijo opcional. El
  componente la parte en prefijo, número y sufijo para el conteo; el HTML
  queda igual.

## 3. Versiones

Una tabla nueva, `versiones_de_paginas`. **Confirmarla es aprobar este SPEC**
(AGENTS.md §12, SPEC padre §9):

```prisma
/// Cada publicación de una página: el documento que quedó en el sitio, quién
/// y cuándo. Se guardan las últimas 10 por página; al publicar se borran las
/// más viejas. «Restaurar como borrador» lee de acá.
model VersionDePagina {
  id           String   @id @default(uuid())
  slug         String
  pagina       Pagina   @relation(fields: [slug], references: [slug], onDelete: Cascade)
  documento    Json                  // el `publicado` que dejó esa publicación
  publicadoEn  DateTime @default(now())
  publicadoPor String                // nombre de la cuenta, en llano

  @@index([slug, publicadoEn(sort: Desc)])
  @@map("versiones_de_paginas")
}
```

Las columnas se llaman como las de `paginas` (`publicadoEn`, `publicadoPor`),
que es de donde salen. `Pagina` gana la relación inversa, sin columnas.

- **Publicar** guarda la versión en la misma transacción que actualiza
  `paginas`, y poda: quedan las 10 más nuevas de esa página.
- **Sin relleno hacia atrás:** la primera versión nace en la primera
  publicación después del deploy (rellenar pediría editar la migración a mano,
  que está prohibido).
- **«Restaurar como borrador»** (pestaña Versiones): el borrador pasa a ser lo
  que hay ahora (borrador o, si no hay, lo publicado) con cada sección de la
  versión que **pase el esquema de hoy** encima. Lo que no pasa, y lo que la
  versión trae de una sección que ya no existe, no entra, y el aviso lo dice
  sección por sección con el motivo («No entró «Hero»: Son 11 ítems, ni más ni
  menos. Queda como está ahora.»). Una sección que la versión no tiene queda
  como está. Restaurar no publica: después se ve en «Qué cambió» y se publica
  como cualquier borrador.

## 4. Ver qué cambió

Antes de publicar, el borrador guardado contra lo publicado, **campo por
campo, con las etiquetas de los campos** («¿Quiénes somos? › Botón › Texto»,
«Hero › Tarjetas (computadora) › Tarjeta 3 › Foto»), nunca las claves.

- **La comparación es una función pura** en
  `apps/sitio/src/lib/contenido/comparar.ts` (sin ED, con tests):
  `compararSeccion(descripcion, antes, despues)` recorre la `Descripcion` que
  ya arma `describir()` y devuelve `Array<{ donde: string[]; antes: Legible;
  despues: Legible }>`, con `Legible = { tipo: "texto"; texto } | { tipo:
  "foto"; src; alt; foco } | { tipo: "nada" }`. Una foto se compara entera
  (archivo, alt y foco); un opcional que aparece o se va es una diferencia
  contra «nada»; las listas van ítem por ítem («Tarjeta 3»).
- Se comparan los documentos **completados** (lo que el sitio muestra de
  verdad, con el contenido inicial donde falta una sección), así una sección
  que se edita por primera vez muestra qué cambió contra el inicial.
- Lo que no está guardado no entra en la comparación: la pestaña compara el
  borrador de la base, y salir del editor con cambios sin guardar ya pregunta.

## 5. Aviso de choque

- **Guardar no pisa** (ya existe para guardar): si otra persona guardó el
  borrador desde que abriste la página, el aviso dice quién y cuándo («Gastón
  guardó este borrador hace 2 minutos») y **ofrece recargar**: un botón
  «Recargar» adentro del aviso, que pregunta antes de tirar lo que escribiste
  sin guardar. Sin fusión ni bloqueo (spec del admin §11).
- **El mismo chequeo en las otras tres escrituras del borrador** —publicar,
  descartar y restaurar—, que hoy no lo tienen: publicar el borrador de otra
  persona sin haberlo visto, o descartarlo, también es pisar. Cada una recibe
  el `borradorEn` que vio la pantalla.
- **La carrera de dos pantallas que crean la fila a la vez se cierra en la
  base:** el primer guardado de una página sin fila hoy hace `create`, y el
  segundo tira por la clave primaria («No se pudo guardar»). Pasa a un
  `INSERT … ON CONFLICT DO NOTHING` (`createMany` con `skipDuplicates`): si
  no insertó nada, alguien la creó primero, y contesta con el aviso de choque.
  La condición la pone la clave primaria de `paginas`, no el cliente.

## 6. La pestaña SEO

Título, descripción e imagen para redes por página, con su vista previa.

- **Dónde vive en el documento:** una parte más del documento de la página,
  bajo la clave reservada `seo` (ninguna sección puede llamarse así). Así el
  SEO tiene borrador y publicado, entra en las versiones y en «qué cambió» sin
  código aparte. El esquema es uno para todas las páginas, en
  `apps/sitio/src/lib/contenido/seo.ts` (sin ED):
  - `titulo`: `textoCorto`, **60** (lo que Google muestra antes de cortar).
    Es el `<title>` entero, y también `og:title`.
  - `descripcion`: `textoCorto`, **160** (lo mismo para la descripción).
    También `og:description`.
  - `imagen`: `foto().nullable()`: sin imagen propia, la del sitio
    (`app/(sitio)/opengraph-image.png`, 1200 × 630).
- **El registro:** cada página gana un `seo` opcional con su valor inicial
  (lo de hoy). Una página con `seo` tiene la pestaña; 4b y 4c suman el de las
  suyas con una línea. En esta lane, solo Inicio: su `seo` inicial es su
  metadata de hoy (el título por defecto del layout y
  `siteConfig.description`, sin imagen propia), y el HTML de `/` no cambia.
- **Validado con los largos de buscador, con lo de hoy como inicial:** el
  título de hoy tiene 72 caracteres y la descripción 241, por arriba de los
  60 y 160. El valor inicial es el de hoy igual —el sitio no cambia hasta que
  alguien lo edite—, y el editor lo muestra en rojo con su contador («72/60»):
  la pestaña SEO no se guarda hasta acortarlos. Es la única parte cuyo inicial
  no pasa su esquema, y el test que lo exige para las secciones lo dice.
- **Lo lee el `generateMetadata` de cada página:** `/` suma uno que lee
  `contenidoDe("inicio").seo` (publicado, o el borrador en vista previa) y lo
  pasa por `metadataDeSeo(seo, comunes)`, que arma `title.absolute`,
  `description` y `openGraph` (con el `type`, `locale` y `siteName` del
  layout, que un `openGraph` de página reemplaza entero). `contenidoDe` pasa
  a ir envuelto en `cache()` de React: la metadata y la página leen una vez.
- **La vista previa:** al lado del formulario, cómo se vería en Google (la
  URL, el título y la descripción, cortados donde corta el buscador, con «…»)
  y en redes (la tarjeta con la imagen, el dominio, el título y la
  descripción). Se arma en vivo con lo que está en el formulario.

## 7. El editor: cuatro pestañas

La pantalla de una página pasa a tener **cuatro pestañas, que son links**
(DESIGN.md §11): **Secciones · SEO · Qué cambió · Versiones**.

| Pestaña | Ruta | Qué hay |
| --- | --- | --- |
| Secciones | `/admin/contenido/paginas/[slug]` | el editor de hoy, sin la parte `seo` |
| SEO | `/admin/contenido/paginas/[slug]/seo` | el formulario de `seo` y la vista previa |
| Qué cambió | `/admin/contenido/paginas/[slug]/cambios` | la comparación; vacía, «No hay cambios sin publicar» |
| Versiones | `/admin/contenido/paginas/[slug]/versiones` | las últimas 10, con «Restaurar como borrador» |

- **Rutas, no un parámetro:** cada pestaña es una pantalla con su URL, que se
  comparte y vuelve igual. Cambiar de pestaña con algo sin guardar pregunta,
  como cualquier salida del editor (`useFrenarSalida`).
- **El encabezado es el de hoy** (migas Contenido / Páginas, el `h1` con el
  nombre de la página, su insignia y «quién y cuándo»), con las pestañas en su
  fila. Secciones y SEO llevan Guardar borrador · Vista previa · Publicar;
  Qué cambió, Vista previa · Publicar y «Descartar borrador»; Versiones, sin
  primario. Un solo primario por pantalla.
- **Versiones:** una `Lista` (DESIGN.md §11); cada fila «Publicada el 21/9 a
  las 14:05 por Raquel», la más nueva con la insignia «En el sitio» y sin
  acción, las demás con «Restaurar como borrador» (secundario, con el
  `confirm` de siempre si hay un borrador que se reemplaza). Sin versiones,
  el `EstadoVacio`: «Todavía no hay versiones» · «Cada vez que publicás, la
  versión queda acá: las últimas 10.»
- **Títulos de pestaña:** «Inicio · Páginas» (Secciones, como hoy), «SEO ·
  Inicio · Páginas», «Qué cambió · Inicio · Páginas», «Versiones · Inicio ·
  Páginas».
- **`Pestanas` se extiende en su archivo**, porque este es su consumidor
  real: con las rutas anidadas, `/…/inicio/seo` cuelga de `/…/inicio` y hoy
  se encenderían las dos. La activa pasa a ser **la más específica** (la de
  `href` más largo que contiene la ruta). Las cinco de Contenido no cambian.
- Una página es editable si tiene secciones **o** `seo`: la lista de Páginas y
  la ruta lo preguntan así, para que 4c pueda sumar una página solo con SEO.

## 8. Deudas de la lane anterior

- **Los 19 alts del hero se leen.** Hoy se escriben y viven dentro de
  `aria-hidden`. Se decide leerlos y no dejar de pedirlos: el valor `foto()`
  exige alt en todo el sitio (y Fotos, lane 9, lo hace obligatorio por foto);
  dejar de pedirlo pediría un modo «decorativa» en el tipo `foto`, que es
  justo lo que AGENTS.md §12 cierra. Las fotos del hero muestran a ED
  trabajando —no son textura— y sus alts están escritos con ese cuidado. Se
  saca el `aria-hidden` de los dos campos de tarjetas (a cualquier ancho se ve
  uno solo: el otro es `display: none`); los carteles también se leen. El
  orden del DOM no cambia: las fotos quedan antes del `h1`, y se llega al
  título por encabezados. `comparar-render.mjs` no ve el atributo (no está
  en sus dimensiones): se prueba con el árbol de accesibilidad del navegador.
- **`config/nav.ts` baja de 104 a ≤ 100 líneas**, apretando comentarios sin
  perder el porqué.
- **`scripts/comparar-render.mjs` baja de 117 a ≤ 100 líneas** —sin sumar
  otra excepción a AGENTS.md §6—, con las mismas dimensiones y la misma
  salida.
- **`HeroQuienes.tsx` (237 líneas de código) baja de 200:** es uno de los 17
  que pasan el tope, y AGENTS.md §6 pide bajarlos cuando se toca la página.
  Esta lane lo toca (recibe «¿Quiénes somos?» y «Misión» por props), así que
  su coreografía se muda a `hero-quienes/coreografia-quienes.ts` con la receta
  de `docs/AI_GUIDELINES.md` §2 (una `crear…(…)` que devuelve su limpieza y la
  llama el mismo efecto), con render idéntico.

## 9. Dónde vive el código

```
apps/sitio/
├── prisma/schema/paginas.prisma            + VersionDePagina (y la relación en Pagina)
├── prisma/migrations/<fecha>_versiones_de_paginas/
├── src/contenido/paginas.ts                inicio: siete secciones + seo
├── src/features/home/contenido/            quienes-somos, mision, en-numeros,
│                                           como-trabajamos, areas,
│                                           biblioteca-y-novedades, seo (.ts)
├── src/features/home/components/           leen por props; se borran
│                                           como-trabajamos/data.ts y lineas-accion/data.ts
├── src/features/home/components/hero-quienes/coreografia-quienes.ts
├── src/lib/contenido/
│   ├── resaltado.ts (+ .test.ts)           «**así**» → fragmentos, y su validación
│   ├── comparar.ts (+ .test.ts)            ver qué cambió
│   ├── seo.ts (+ .test.ts)                 esquemaSeo, largos, metadataDeSeo
│   └── documento.ts                        partesDe(pagina): secciones + seo
├── src/datos/acciones/
│   ├── editar-paginas.ts                   guardar y descartar, con el choque y el ON CONFLICT
│   ├── publicar-paginas.ts                 publicar + versión + poda, en una transacción
│   ├── versiones-de-paginas.ts             restaurar como borrador
│   └── paginas.ts                          las Server Actions (+ restaurarVersion), con sesión
├── src/datos/consultas/
│   ├── editor-de-paginas.ts                la página para editar, por pestaña
│   └── historial-de-paginas.ts             qué cambió y las versiones
├── src/admin/paginas/                      las pestañas, la vista previa de SEO,
│                                           la comparación, la lista de versiones
├── src/admin/armazon/Pestanas.tsx          la activa es la más específica
└── src/app/(admin)/admin/(protegido)/contenido/paginas/[slug]/
    ├── page.tsx · seo/page.tsx · cambios/page.tsx · versiones/page.tsx
```

Las cuatro fronteras siguen: `lib/contenido/` no sabe de ED ni importa `@/`;
`datos/` es la única puerta a la base; `app/` son rutas; `features/` recibe
props. Toda Server Action nueva empieza por `auth.api.getSession` (el test
`acciones-con-sesion` la exige).

## 10. Docs

- **Spec del admin §11:** versiones sale de «fuera de alcance»
  (autoguardado y bloqueo de documento siguen afuera; el aviso de choque
  está), con su lugar en §6.
- **README «Editar las páginas»:** Inicio entero, las cuatro pestañas, el
  resaltado con asteriscos, las 10 versiones y el aviso de choque.
- **DESIGN.md §11** (lo revisa Mateo en el PR): las pestañas de una página del
  editor y la activa más específica; «Qué cambió» (antes y ahora, sin rojo ni
  verde); la vista previa de buscador y redes; el aviso con una acción
  adentro («Recargar»).
- **AGENTS.md** (lo revisa Mateo en el PR): §3, los archivos nuevos de
  `datos/consultas/` y `datos/acciones/`; §13, la línea de esta fase.

## 11. Pruebas

- **Unitarias** (`pnpm test`): `resaltado` (fragmentos ida y vuelta,
  espacios, marcas sin cerrar, exactamente uno), `comparar` (texto, foto,
  lista, opcional que aparece y se va, sin cambios), `seo` (metadata con y sin
  imagen), `Pestanas` (la activa más específica) y un test del registro: cada
  sección de cada página pasa su propio esquema con su inicial.
- **De integración contra el Postgres local** (`editar-paginas.test.ts` y
  vecinos): publicar guarda la versión y poda a 10; restaurar mete lo que pasa
  y avisa lo que no; el choque en guardar, publicar, descartar y restaurar; y
  la carrera del alta (una lectura vieja que no vio la fila: contesta choque,
  no tira).
- **Render:** `comparar-render.mjs` de `/` idéntico después de cada sección y
  del split de `HeroQuienes`.
- **En el navegador** (Orca, `localhost:3014`, los tres temas, 390 de ancho y
  teclado): editar una sección nueva, guardar, «Qué cambió», publicar, ver la
  versión, restaurar una anterior y ver qué no entró; el choque entre dos
  pestañas con «Recargar»; SEO con la vista previa y el `<title>` en la vista
  previa del sitio; el árbol de accesibilidad del hero con los alts.

## 12. Fuera de alcance

- Las otras seis páginas (4b y 4c), incluido su SEO; las áreas y el método en
  una sola fuente (4b).
- Borrar la foto reemplazada y «Se usa en» (lane 9, Fotos); el Inicio del
  admin (lane 3).
- **El error en el campo mismo** (SPEC padre §5.3): los errores siguen en el
  aviso del encabezado, con el camino del campo. Lo anoto para 4b/4c o una
  lane propia; no lo pide este brief.
- Autoguardado, bloqueo de documento, fusión de cambios, texto enriquecido.
- `publicar` revalida solo la ruta de su página: la sección repetida en dos
  páginas llega con la fuente única de 4b.
