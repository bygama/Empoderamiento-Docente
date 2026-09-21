# SPEC — La edición de las páginas

- **Fecha:** 2026-09-21
- **Estado:** aprobado por el owner en conversación (cuatro partes); pendiente de plan
- **Decide:** Facundo (owner); las decisiones que tocan el spec del admin se
  acuerdan entre Facundo, Gastón y Mateo (ver §12)
- **Tier:** L · rama `feat/edicion-de-paginas`
- **Se apoya en:** el spec del admin
  ([`2026-09-18-admin-a-medida-diseno.md`](../../docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md)),
  los cimientos de la fase 1 (sesión, `datos/`, `admin/armazon/`) y el
  inventario de contenido del sitio (§3)

---

## 1. Qué se quiere

Que Gastón, Raquel y Daniela cambien los **textos y las imágenes** de las siete
páginas del sitio desde el admin, sin tocar código y sin romper las escenas:
**se edita todo menos la estructura**. Y que lo primero que se vea en pantalla
sea una página real editable de punta a punta, no un modelo de datos.

Tres decisiones tomadas en conversación el 2026-09-21:

1. **Formulario por sección**, no edición encima del sitio. El sitio está
   lleno de coreografía; un formulario que se lee como el sitio (misma
   jerarquía, mismo orden de scroll) es más claro y no se rompe.
2. **Borrador, vista previa y «Publicar» aparte.** Guardar no publica. Cada
   página tiene dos versiones: la publicada y el borrador. Sin aprobación de
   otra persona: quien edita, publica.
3. **Lo primero, Inicio → Hero, de punta a punta**: formulario, borrador, foto,
   vista previa y publicar. Después, cada sección y cada página se suman
   escribiendo su esquema (§4).

## 2. Cómo se usa

**Páginas.** En la portada del admin, «Páginas»: las siete del sitio, en el
orden del menú, con una marca en las que tienen cambios sin publicar y la fecha
de la última publicación.

**Una página.** Sus secciones en el orden del scroll, cada una un bloque
plegable con el nombre que tiene en el sitio («Hero», «¿Quiénes somos?»,
«Misión», «En números»…). Adentro, los campos:

- Los **textos**, con su largo máximo a la vista y un contador. Cuando el largo
  está calibrado a mano (un título que tiene que caer en dos renglones), el
  campo lo dice en llano: «un renglón en pantalla», «dos renglones».
- Las **fotos**, con una miniatura 4:3 donde se marca el punto de foco (no el
  recorte exacto de cada marco: ese lo hace el sitio), el texto alternativo
  (obligatorio) y el foco.
- Las **listas fijas** (las 11 tarjetas del hero, los 5 pasos), con la
  cantidad exacta que la escena necesita: se edita cada ítem, no se agregan ni
  se sacan. El formulario lo dice: «Son 5 pasos: la escena está armada para
  cinco».
- Los **enlaces internos** se eligen de una lista cerrada de rutas del sitio.

Arriba, fija, una barra con tres acciones: **Guardar borrador**, **Vista
previa** y **Publicar**, más el estado en llano («Borrador guardado hace 3
minutos, sin publicar» / «Publicado el 21/9 a las 14:05 por Raquel»).

**Cambios cruzados.** Si alguien guardó el borrador desde que la persona abrió
la página, «Guardar borrador» no pisa: avisa «Gastón guardó este borrador hace
2 minutos. Recargá para ver sus cambios antes de guardar los tuyos». Sin
bloqueo ni fusión: con tres editoras alcanza.

## 3. Qué hay que editar

El inventario completo (42 secciones, textos, imágenes, listas fijas y de dónde
sale cada cosa hoy) está en [`INVENTARIO.md`](INVENTARIO.md). Lo que decide el
diseño:

- El contenido vive en **tres lugares distintos** según la sección: archivos
  `data/*.ts`, archivos de datos dentro de la carpeta del componente, o arrays
  sueltos arriba del `.tsx`. Al pasar cada sección al admin, su contenido
  inicial se toma de donde esté y **ese archivo desaparece** (una sola fuente
  de verdad, como pide el spec del admin §9).
- Hay **textos partidos en fragmentos con resaltado** (`{t, accent}` en
  «¿Quiénes somos?» y «Misión»; `{antes, clave, despues}` en las áreas). Se
  editan como un párrafo con marcas (§4.2), no como una lista de pedazos.
- Hay **listas con cantidad fija** ligadas a coreografía: 11 + 8 tarjetas del
  hero, 4 métricas, 5 pasos, 7 áreas, 4 frases del faro, 5 niveles, 6 paneles,
  4 figuras, 4 casos. La cantidad es parte del esquema.
- Hay **contenido duplicado sin fuente única**: las 7 áreas (Inicio y Qué
  hacemos) y el método de trabajo (5 pasos en Inicio, 6 verbos en Qué
  hacemos). Se resuelve en la fase D (§10) con una fuente compartida; hasta
  entonces cada sección edita lo suyo y el formulario avisa que la otra página
  tiene su propia copia.
- Las **entidades** (novedades, materiales, casos, equipo, aliados) no son
  páginas: son tablas con lista y formulario propio, fases 2 y 3 del spec del
  admin. Este spec no las toca; las secciones que las muestran (Biblioteca y
  Novedades del Inicio, el catálogo, el equipo) editan acá solo sus textos
  propios (títulos y bajadas).

## 4. El modelo

### 4.1 La estructura vive en código: un esquema por sección

Cada sección tiene un esquema en
`apps/sitio/src/features/<pagina>/contenido/<seccion>.ts`:

```ts
import { z } from "zod";
import { foto, listaFija, rutaInterna, textoCorto } from "@/lib/contenido/campos";

export const esquemaHero = z.object({
  titulo: textoCorto({ maximo: 60, ayuda: "Dos renglones en pantalla. Se anima palabra por palabra." }),
  bajada: textoCorto({ maximo: 140 }),
  botonPrincipal: z.object({ texto: textoCorto({ maximo: 18 }), ruta: rutaInterna() }),
  botonSecundario: z.object({ texto: textoCorto({ maximo: 18 }), ruta: rutaInterna() }),
  tarjetas: listaFija(
    11,
    z.object({
      foto: foto(),
      cartel: z.object({ titulo: textoCorto({ maximo: 24 }), descripcion: textoCorto({ maximo: 48 }) }).nullable(),
    }),
    { ayuda: "Son 11 tarjetas: la escena del hero está armada para once." },
  ),
  tarjetasCelular: listaFija(8, z.object({ foto: foto() })),
});

export type Hero = z.infer<typeof esquemaHero>;

/** El contenido de hoy, tal cual está en el sitio: lo que se ve sin base y lo que se carga la primera vez. */
export const heroInicial: Hero = {
  /* … */
};
```

Un registro, `apps/sitio/src/contenido/paginas.ts`, dice qué secciones tiene
cada página y en qué orden: es lo que el admin recorre para armar la pantalla
y lo que `datos/consultas/` usa para validar. Agregar una sección al admin es
escribir su esquema, su contenido inicial y sumarla al registro; el formulario
sale del esquema, sin escribir JSX por sección.

**Por qué un documento por página y no una columna por texto.** El spec del
admin (§6) pide una columna por texto visible. Contadas, son cientos de
columnas (Qué hacemos solo tiene unos doscientos textos) y una migración por
cada campo que aparezca. La estructura ya vive en el esquema; la base guarda
el documento validado contra él. Es la decisión más importante que este spec
cambia respecto del spec del admin y se acuerda entre los tres (§12).

### 4.2 Los tipos de campo

En `apps/sitio/src/lib/contenido/campos.ts` (sin dominio de ED):

- `textoCorto({ maximo, ayuda? })` — una línea, sin saltos; el admin muestra
  contador y la ayuda.
- `parrafo({ maximo, ayuda? })` — varias líneas.
- `textoConResaltado({ maximo })` — un párrafo donde lo resaltado va entre
  dobles asteriscos, como en WhatsApp: «Somos **artesanas** del aula». El
  esquema lo guarda así y `lib/contenido/resaltado.ts` lo convierte a los
  fragmentos `{t, accent}` que la coreografía consume. Editar es escribir, no
  armar una lista de pedazos.
- `listaFija(n, esquemaDelItem, { ayuda })` — exactamente `n` ítems.
- `foto()` — el valor de una foto en su lugar: `{ src, alt, foco: { x, y } }`. `src`
  es una ruta de `public/`, `/api/fotos/…` en local o una URL de Blob; el foco
  va con el lugar (la misma foto puede tener foco distinto en marcos
  distintos) y el alt viaja con el valor, también para las fotos de `public/`.
- `rutaInterna()` — una de las rutas del sitio (lista cerrada en
  `config/nav.ts`).

Zod 4 valida en el borde (Server Actions) y al leer (la base podría traer un
documento viejo si el esquema cambió: se corrige con el contenido inicial y se
avisa en el log, nunca se rompe el sitio).

### 4.3 Las páginas

```prisma
/// Una fila por página del sitio. Dos versiones del contenido: la que lee el
/// sitio y la que se está editando. Sin historial: eso quedó fuera de alcance.
model Pagina {
  slug         String    @id            // inicio | que-hacemos | …
  publicado    Json?                    // { seccion: contenido } validado
  publicadoEn  DateTime?
  publicadoPor String?                  // nombre de la cuenta, en llano
  borrador     Json?
  borradorEn   DateTime?
  borradorPor  String?

  @@map("paginas")
}
```

`publicado` en `null` significa «esta página todavía muestra el contenido
inicial del código». El documento es `{ [seccion]: contenido }`; una sección
que falta en el documento se completa con su contenido inicial, así una página
puede pasar al admin sección por sección.

### 4.4 Las fotos

```prisma
/// Una foto subida desde el admin. `alt` es obligatorio (AGENTS.md §6). El
/// punto de foco dice dónde está lo importante para que cada marco recorte bien.
model Foto {
  id        String   @id @default(uuid())
  url       String                       // Blob en Vercel; /api/fotos/<id> en local
  alt       String
  ancho     Int
  alto      Int
  bytes     Int
  tipo      String                       // image/webp | image/jpeg | image/png
  subidaEn  DateTime @default(now())
  subidaPor String

  @@map("fotos")
}
```

Coincide con la tabla `fotos` del spec del admin (imagen, alt obligatorio); el
punto de foco no está en la tabla sino en el valor `foto()` de cada lugar, que
es donde tiene sentido (§4.2). Las fotos que hoy están en `public/fotos/**` no se migran a la
base de golpe: el contenido inicial las referencia por ruta, y la primera vez
que alguien elige otra foto para ese lugar, la nueva va a `fotos`. El campo
El valor
`foto()` (§4.2) lleva `src`, `alt` y `foco`, y `lib/contenido/fotos.ts` resuelve
el `object-position`.

**Subida.** Desde el formulario, jpg/png/webp de hasta 4 MB (Vercel corta el
cuerpo de una función en 4,5 MB: con más pasaría en local y fallaría en
producción). El servidor
verifica el tipo por los bytes (no por la extensión), lee ancho y alto, y
guarda. El punto de foco se elige con un clic sobre la miniatura. **Dónde se
guarda** lo decide `lib/contenido/almacen.ts` con dos implementaciones: en
Vercel, Blob (`@vercel/blob`, variable `BLOB_READ_WRITE_TOKEN`, ya declarada);
en local, la carpeta `apps/sitio/.fotos/` (git-ignorada) servida por
`/api/fotos/[id]`. Así lo visual no espera a la cuenta de Vercel. Recorte,
compresión y tamaños los sigue haciendo `next/image` en el sitio.

## 5. Cómo lee el sitio

`apps/sitio/src/datos/consultas/paginas.ts` → `contenidoDe("inicio")` devuelve
el documento completo de la página, validado: `publicado` de la base, o el
`borrador` si la petición viene en Draft Mode (§6), o el contenido inicial si
no hay fila, si falta una sección, o si no hay `DATABASE_URL`. **El sitio
sigue compilando sin base**, como hoy dice el README.

Las páginas siguen estáticas (spec del admin §4): `page.tsx` pide el contenido
y se lo pasa a las secciones **por props**. `features/` no cambia de contrato
ni importa Prisma; el componente que hoy tiene el texto pegado pasa a
recibirlo. El H1 del hero, que hoy está partido a mano palabra por palabra,
se parte con `split(" ")`: la coreografía no cambia.

## 6. Vista previa

«Vista previa» es una Server Action: verifica la sesión, habilita el **Draft
Mode** de Next (`draftMode().enable()`) y devuelve la URL de la página; el
botón la abre en otra pestaña. Con la cookie de Draft Mode puesta, Next saltea
lo prerenderizado y renderiza a pedido, y `contenidoDe()` devuelve el borrador.
Nadie sin sesión puede habilitarlo: la cookie solo la pone esa acción.

En ese estado el sitio muestra abajo (el header es una píldora flotante
arriba) una franja fina «Estás viendo un
borrador · Volver al sitio publicado» (un `POST` que deshabilita el Draft
Mode) y manda `noindex` en la metadata. Las demás visitas siguen viendo la
versión publicada.

## 7. Publicar y guardar

Tres Server Actions en `datos/acciones/paginas.ts`, todas verifican la sesión
primero (AGENTS.md §12) y validan con Zod:

- `guardarBorrador(slug, seccion, contenido, borradorEnVisto)` — valida contra
  el esquema de la sección, compara `borradorEn` con el que vio la pantalla
  (§2, cambios cruzados), escribe `borrador`, `borradorEn`, `borradorPor`.
- `publicar(slug)` — copia `borrador` a `publicado`, escribe `publicadoEn` y
  `publicadoPor`, y regenera la página con `revalidatePath("/<ruta>")`. Si la
  sección aparece también en otra página (§3, duplicados), regenera las dos.
- `descartarBorrador(slug)` — vuelve el borrador a lo publicado.

La subida de fotos es otra acción, `subirFoto`, en `datos/acciones/fotos.ts`; la
vista previa, `abrirVistaPrevia` (§6), vive con las tres de arriba.

## 8. Dónde vive el código

```
apps/sitio/
├── prisma/schema/paginas.prisma            Pagina, Foto
├── src/contenido/paginas.ts                el registro: páginas → secciones → esquemas
├── src/features/<pagina>/contenido/<seccion>.ts   esquema + contenido inicial (reemplaza al data.ts)
├── src/lib/contenido/
│   ├── campos.ts (+ .test.ts)              los tipos de campo (Zod)
│   ├── resaltado.ts (+ .test.ts)           «**así**» ↔ fragmentos {t, accent}
│   ├── fotos.ts (+ .test.ts)               src/alt/object-position de una foto
│   └── almacen.ts (+ .test.ts)             disco en local, Blob en Vercel
├── src/datos/consultas/paginas.ts          contenidoDe(slug), listaDePaginas()
├── src/datos/acciones/paginas.ts           guardarBorrador, publicar, descartarBorrador, abrirVistaPrevia
├── src/datos/acciones/fotos.ts             subirFoto
├── src/admin/paginas/                      ListaDePaginas, EditorDePagina, Seccion, BarraDeAcciones
├── src/admin/campos/                       TextoCorto, Parrafo, ConResaltado, ListaFija, CampoFoto, RutaInterna
├── src/app/(admin)/admin/(protegido)/paginas/page.tsx y [slug]/page.tsx
├── src/app/api/fotos/[id]/route.ts         sirve las fotos del disco (solo local)
└── src/app/(sitio)/…                       cada page.tsx pasa el contenido por props; franja de borrador en el layout
```

`lib/contenido/` no sabe nada de ED. `admin/campos/` son los controles de
formulario: cuando exista `packages/kit-admin` (fase 2 del spec del admin) se
mudan ahí; mientras, viven en la app para no frenar lo visual (§12).

## 9. Seguridad

- Sesión en cada Server Action; el rol no importa para editar y publicar (los
  dos roles publican, spec del admin §7).
- Zod en el borde: el contenido, el `slug` (lista cerrada del registro), la
  sección, la foto (tipo por bytes, tamaño, dimensiones), el punto de foco.
- Las rutas internas son una lista cerrada: no hay enlaces libres.
- La vista previa solo se habilita con sesión; el borrador nunca se sirve sin
  la cookie de Draft Mode; `noindex` mientras dura.
- El alt es obligatorio: sin él la foto no se guarda.
- Los textos se escapan como cualquier texto en React; el resaltado con
  asteriscos no es HTML.

## 10. Fases

| | Qué | Sale sola |
| --- | --- | --- |
| **A** | **Inicio → Hero, de punta a punta.** Tablas, tipos de campo, registro, esquema del hero con su contenido inicial, «Páginas» y el editor con una sección, fotos (subida, alt, foco, disco/Blob), vista previa, publicar; el hero del sitio lee por props. | sí: es lo que se ve en pantalla |
| **B** | El resto de Inicio: ¿Quiénes somos? y Misión (resaltado), En números, Cómo trabajamos, Áreas, Biblioteca y Novedades (solo textos propios). | sección por sección |
| **C** | Las otras seis páginas, cada una con sus secciones. | página por página |
| **D** | Compartidos: las áreas y el método con una sola fuente; la pestaña SEO por página; ajustes (`config/site.ts`). | por pieza |

Cada sección que pasa al admin borra su `data.ts` en el mismo PR.

## 11. Pruebas

- `lib/contenido/*`: tests unitarios (resaltado ida y vuelta, listas fijas,
  límites, resolución de fotos, almacén en disco).
- `datos/acciones/paginas.ts`: test de integración contra el Postgres local
  (guardar, conflicto de borrador, publicar, descartar), con un slug de prueba
  que se borra al final.
- En el navegador: editar el hero, guardar, ver la marca «sin publicar»,
  abrir la vista previa y ver el cambio, publicar y verlo en el sitio, subir
  una foto con foco y verla recortada.

## 12. Lo que se acuerda entre los tres

Decisiones de este spec que cambian o adelantan el spec del admin, para
hablar con Gastón y Mateo antes o durante la fase A:

1. **Documento por página validado por esquema, en vez de una columna por
   texto** (§4.1).
2. **Los controles de formulario nacen en `admin/campos/` de la app** y se
   mudan a `packages/kit-admin` cuando el kit exista, para no frenar lo
   visual ni pisar la fase 2.
3. **Borrador y publicado por página** (dos versiones, sin historial), que el
   spec del admin no contempla.
4. **El resaltado con asteriscos** como forma de editar los fragmentos.
5. **Blob en Vercel, disco en local**, con el mismo `almacen.ts`.
6. **El formulario de una página sale de su esquema** (seis tipos de campo
   cerrados, en la app). AGENTS.md §12 prohíbe una «meta-capa de configuración
   para los formularios» (la regla anti-Payload); acá es una excepción acotada a
   las páginas: las entidades siguen con formularios escritos a mano con los
   primitivos del kit. Necesita el OK del owner para el párrafo de AGENTS.md.

## 13. Fuera de alcance

- Historial de versiones, autoguardado, bloqueo de edición concurrente (spec
  del admin §11).
- Editor de texto enriquecido; el resaltado con asteriscos es todo el formato.
- Cambiar la estructura: cantidad de ítems, geometría, animaciones.
- Las entidades (novedades, materiales, casos, equipo, aliados) y sus fichas.
- Recorte manual de fotos: el punto de foco y `next/image` alcanzan.
- Aprobación previa a publicar.
