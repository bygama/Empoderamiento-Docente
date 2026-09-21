# PLAN — La edición de las páginas, fase A (Inicio → Hero)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** que el hero de Inicio (título, bajada, dos botones y las 11 + 8
fotos con sus carteles) se edite desde el admin de punta a punta: formulario,
borrador, foto con foco, vista previa y publicar, sin que el sitio cambie un
byte mientras nadie publique.

**Arquitectura:** cada sección tiene un esquema Zod con su contenido inicial
en `features/<pagina>/contenido/`; un registro (`src/contenido/paginas.ts`)
dice qué secciones tiene cada página; la base guarda un documento por página
en dos versiones (`publicado` y `borrador`). El sitio pide el contenido en
`page.tsx` y lo pasa por props; el admin genera el formulario recorriendo el
esquema (una descripción serializable, sin Zod en el navegador) y escribe por
Server Actions que empiezan por `auth.api.getSession`. Las fotos van a Blob en
Vercel y a `apps/sitio/.fotos/` en local, con la misma interfaz.

**Stack:** Next 16.3 (App Router, Server Actions, Draft Mode, `revalidatePath`),
React 19, Prisma 7.10 exacta, better-auth, Zod 4 (registro de metadata),
`sharp` (ya en deps), `@vercel/blob` (nueva), `node --test` vía `tsx`.

**Spec:** [`SPEC.md`](SPEC.md) · decisiones en [`DECISIONS.md`](DECISIONS.md) ·
inventario en [`INVENTARIO.md`](INVENTARIO.md) (§1.1 es el hero) · estado en
[`PROGRESS.md`](PROGRESS.md) · revisión de este plan en
`.superpowers/plan-edicion-review.md`. Base: `main` en `2ac8a57`; rama
`feat/edicion-de-paginas` (se crea en A0, con OK).

## Restricciones (valen en todos los pasos)

- **Confirmación de Facundo** (AGENTS.md §5.6) antes de: crear la rama, cada
  commit, el push, el PR, `pnpm --filter sitio add @vercel/blob`, tocar
  `AGENTS.md`, y crear las tablas (A1: las del SPEC §4.3/§4.4 con los dos
  ajustes de DECISIONS que dice esa tarea).
- **Antes de A2 hace falta el OK de Facundo a la excepción de AGENTS.md §12**
  (ver «Lo que este plan fija», 9). Sin ese OK, A2, A6 y A7 cambian de forma
  y no conviene escribirlos.
- **Commits** Conventional, en español, imperativo, header ≤ 72; **cada uno
  con un cuerpo corto que dice el porqué** (líneas ≤ 72) y el trailer
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`, como los del
  historial. Los pasos de commit usan `git commit -F -` con un heredoc para
  que header, cuerpo y trailer viajen enteros; nunca `git add -A`.
- **Gates** antes de cada push: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100). `pnpm build` antes del
  PR. `pnpm --filter sitio test` en verde en cada tarea que tenga tests.
- **Fronteras del repo** (AGENTS.md §3): ningún componente importa Prisma;
  `datos/consultas/` lee y `datos/acciones/` escribe; `lib/contenido/` no sabe
  nada de ED; `features/` recibe props y no importa `datos/`. **El sitio
  compila y corre sin base**: A0 hace que importar `datos/cliente` no lea el
  entorno, y nada de lo que alcanza `app/(sitio)/` importa `datos/auth` (que
  exige el secreto al cargarse). A5 y A8 lo comprueban con el build sin
  `DATABASE_URL`.
- **Componentes ≤ 200 líneas, utilidades ≤ 100.** Sin `any`; cada `as` lleva
  su comentario o no va. Comentarios en español que dicen el porqué. Lenguaje
  inclusivo en todo texto del admin («quien edita», «la persona»). Colores y
  tipos del tema (`azul-principal`, `azul-medio`, `azul-claro`, `gris-texto`,
  `gris-fondo`, `verde-concepto`, `naranja-accion` solo en «Publicar»), sin hex.
- **Imports** framework → externos → internos (`@/…`) → relativos.
- **Server Components por defecto**; `"use client"` solo donde hay estado o
  eventos (el editor, los controles, `Momento`, `RutaActual`).
- **Zod en cada borde**: el `slug` (lista cerrada del registro), la sección,
  el contenido contra su esquema, la foto (tipo por bytes, tamaño, `src`
  acotado a lo que el sitio sabe mostrar), el foco.
- **Las Server Actions del admin no tiran**: `getSession` y todo lo demás van
  adentro de un `try`, y el `catch` contesta en llano, como
  `actualizar-metricas.ts`. En el navegador, cada llamada a una acción va en
  `try/catch` con un `Aviso`: un error en una transición sin `error.tsx` se
  lleva la pantalla entera y lo que había sin guardar.
- **Secretos** solo server-side: `BLOB_READ_WRITE_TOKEN` nunca `NEXT_PUBLIC_`.
  `apps/sitio/.fotos/` queda git-ignorada.
- **Migraciones** con `pnpm migrate` (nunca `db push`); se commitean.
  **Después de migrar, reiniciar `pnpm dev`**: el `PrismaClient` vive en la
  memoria del proceso (`globalThis.base`) y el viejo no conoce `paginas` ni
  `fotos`; el síntoma es «Unknown model» en la primera acción.
- **Next 16**: `draftMode()`, `headers()` y `params` son promesas
  (`await`). El cuerpo de una Server Action está capado en 1 MB por defecto:
  A3 lo sube en `next.config.ts`. Leer `draftMode().isEnabled` **no** vuelve
  dinámica una página (en el prerender responde «apagado»); `enable()` y
  `disable()` solo en Server Actions o Route Handlers.
- **`.env.local` de la app** es `apps/sitio/.env.local`. Los comandos se
  corren desde la raíz del repo, en bash, salvo que digan otra cosa. El
  Postgres local es el contenedor `ed-postgres` (README, «Admin»). Para probar
  «sin base» se corre el comando con `DATABASE_URL= DATABASE_URL_UNPOOLED=`
  adelante: Next no pisa una variable ya definida, aunque esté vacía, y nunca
  hay que mover `.env.local` (el secreto de better-auth sí tiene que estar:
  `crearAuth` lo exige al cargarse).
- **Cuenta local del admin** para los pasos en el navegador:
  `facundo@prueba.local` con contraseña `Prueba-2026-panel`. Si no existe,
  `pnpm --filter sitio crear-cuenta facundo@prueba.local "Facundo" administra`
  y después `/admin/olvide-mi-contrasena` (el enlace sale por la consola).

## Lo que este plan fija (y queda en DECISIONS.md)

Cosas que el SPEC deja abiertas o que el código obligó a resolver. Cada una
tiene su paso «anotar en DECISIONS» en la tarea donde aparece (11 en A0, 10 en
A1, 1 y 2 en A2, 3 en A3, 4 y 5 en A5, 6 a 8 en A7). Las que cambian texto
normativo del SPEC (1, 3, 7, 8 y 10) las enmienda el controlador en el SPEC.

1. **El valor de `foto()` es un objeto `{ src, alt, foco }`, no un id.** El
   spec dice «id de `fotos` o ruta de `public/`». Con un id, el sitio tendría
   que hacer un join al renderizar y el `alt` de las fotos de `public/` no
   tendría dónde vivir. `alt` y `foco` van **con cada uso** (la misma foto en
   dos marcos hoy tiene dos alt distintos en `hero-cards.ts`); la tabla `fotos`
   guarda el archivo, sus medidas y quién lo subió, y su `url` es el `src`.
   El `src` se acota con Zod a lo que el sitio sabe mostrar: `/fotos/…`,
   `/api/fotos/<uuid>` y `https://<tienda>.public.blob.vercel-storage.com/…`
   (un host fuera de `remotePatterns` rompería el render de la home).
2. **`rutaInterna(rutas)` recibe la lista** (`RUTAS_INTERNAS` de
   `config/nav.ts`): `lib/contenido/` no puede importar la nav sin saber de
   ED. **`grupo(forma, { etiqueta })`** es un `z.object` con nombre para que
   el formulario pueda titular «Botón principal» sin JSX por sección.
3. **Las fotos pesan hasta 4 MB, no 8.** Vercel corta el cuerpo de una
   función en 4,5 MB (Server Actions incluidas): con 8 MB, una foto de 6 MB
   pasa en local y da 413 en producción. El tope se chequea también en el
   navegador antes de mandar: `bodySizeLimit` corta antes de entrar a la
   acción y ese error no lo ve ningún `try` del servidor.
4. **Publicar y descartar dejan `borrador` en `null`**: «no hay borrador»
   significa «el borrador es lo publicado». La marca «sin publicar» de la
   lista es `borradorEn !== null`, y el chequeo de cambios cruzados compara
   `borradorEn` con el que vio la pantalla (`null` cuando no había).
5. **La sesión y la base se separan en dos archivos**: la lógica con el
   cliente inyectado (`editar-paginas.ts`, se prueba contra el Postgres
   local) y las Server Actions (`paginas.ts`, `vista-previa.ts`) que
   verifican la sesión y la llaman. **`salirDeVistaPrevia` va en un tercer
   archivo sin `datos/auth`**: la importa el layout del sitio, no necesita
   sesión, y `datos/auth` exige el secreto de better-auth al cargarse.
6. **Las fechas se muestran en la zona de quien mira**, con un componente
   cliente (`Momento`) y `suppressHydrationWarning`: el servidor corre en UTC
   y el equipo está en tres países. El borrador se dice en relativo («hace 3
   minutos», SPEC §2) y lo publicado en absoluto («el 21/9 a las 14:05»).
7. **La franja de borrador va abajo**, no arriba: el header del sitio es una
   píldora `fixed top-4` y una franja arriba la tapa.
8. **La miniatura del foco es un marco 4/3 con un punto**, no el recorte
   exacto del sitio: las 11 tarjetas tienen 11 relaciones de aspecto y el
   campo es uno solo. El recorte real se ve en la vista previa.
9. **El formulario sale del esquema, y eso es una excepción acotada a
   AGENTS.md §12** («nada de meta-capa de configuración para los
   formularios»). El texto a acordar: *las páginas (documentos validados por
   el esquema Zod de cada sección) generan su formulario desde el esquema, con
   tipos de campo cerrados; las entidades (novedades, materiales, casos,
   equipo, aliados) siguen escribiendo el suyo a mano con los primitivos del
   kit.* **Necesita el OK de Facundo antes de A2** y se suma como punto 6 del
   SPEC §12 para la charla con Gastón y Mateo; A9 escribe el párrafo en
   AGENTS.md (con OK).
10. **`Foto` no lleva `focoX`/`focoY` y su id es `@default(uuid())`.** El foco
    vive en el valor `foto()` de cada lugar (1), así que en la tabla quedaban
    muertas; y el id lo genera `randomUUID()` porque la ruta pública solo
    acepta un UUID. Ruling del controlador sobre la revisión (I6).
11. **`datos/cliente.ts` lee `DATABASE_URL` en la primera consulta, no al
    importar.** Hoy el build sin base ya falla en `/api/cron/metricas`:
    `next build` importa cada ruta para leer su configuración y el cliente se
    armaba al cargar el módulo. Ruling del controlador sobre la revisión (I7),
    con un ajuste comprobado: no es un Proxy que instancia el cliente en el
    primer acceso, sino un **adaptador que posterga la lectura de la URL hasta
    `connect()`**, porque better-auth lee `_runtimeDataModel` del cliente al
    construirse y con el Proxy ese acceso tira adentro de su arranque
    asíncrono, como un rechazo sin manejar que mata al worker del build.

## Estructura de archivos

```
apps/sitio/
├── .gitignore                                        (+ .fotos/)                     A3
├── .env.example                                      (comentario de BLOB)            A3
├── next.config.ts                                    (bodySizeLimit)                 A3
├── package.json                                      (+ @vercel/blob)                A3
├── src/datos/cliente.ts                              (la URL, en la 1.ª consulta)    A0
├── prisma/schema/paginas.prisma                      Pagina, Foto                    A1
├── src/config/nav.ts                                 (+ RUTAS_INTERNAS)              A2
├── src/lib/contenido/
│   ├── fotos.ts (+ .test.ts)                         ValorFoto, src permitido, foco  A2
│   ├── campos.ts (+ .test.ts)                        textoCorto, parrafo, foto, …    A2
│   ├── descripcion.ts                                Descripcion, valorVacio         A2
│   ├── describir.ts (+ .test.ts)                     esquema → Descripcion           A2
│   ├── documento.ts (+ .test.ts)                     completarPagina                 A2
│   ├── imagen.ts (+ .test.ts)                        tipo por bytes + medidas        A3
│   ├── almacen.ts (+ .test.ts)                       disco en local, Blob en Vercel  A3
│   └── tiempo.ts (+ .test.ts)                        haceCuanto, fechaYHora          A5
├── src/app/api/fotos/[id]/route.ts                   sirve .fotos/ (solo local)      A3
├── src/datos/acciones/fotos.ts                       subirFoto                       A3
├── src/features/home/
│   ├── contenido/hero.ts                             esquemaHero, Hero, heroInicial  A4
│   └── components/hero/geometria-hero.ts             (reemplaza hero-cards.ts)       A4
├── src/contenido/paginas.ts                          el registro                     A4
├── src/datos/consultas/paginas.ts                    contenidoDe (el sitio)          A5
├── src/datos/consultas/editor-de-paginas.ts          listaDePaginas, paginaParaEditar A5
├── src/datos/acciones/editar-paginas.ts (+ .test.ts) la lógica, con base inyectada  A5
├── src/datos/acciones/paginas.ts                     guardar, publicar, descartar    A5
├── src/datos/acciones/vista-previa.ts                abrirVistaPrevia (con sesión)   A5
├── src/datos/acciones/salir-de-vista-previa.ts       salirDeVistaPrevia (sin sesión) A5
├── src/admin/armazon/Momento.tsx                     fecha en la zona de quien mira  A6
├── src/admin/campos/{clases.ts,Campo,TextoCorto,Parrafo,RutaInterna,ListaFija,CampoFoto}.tsx A6
├── src/admin/paginas/{ListaDePaginas,EditorDePagina,BarraDeAcciones,Seccion}.tsx    A7
├── src/app/(admin)/admin/(protegido)/paginas/page.tsx y [slug]/page.tsx             A7
├── src/app/(admin)/admin/(protegido)/page.tsx        (link «Páginas»)                A7
├── src/components/layout/{FranjaDeBorrador,RutaActual}.tsx                           A8
└── src/app/(sitio)/layout.tsx                        (franja + noindex)              A8
```

Fuera de `apps/sitio`: `work/edicion-de-paginas/{DECISIONS,PROGRESS}.md`
(A0, A1, A2, A3, A5, A7, A9), `README.md` y `AGENTS.md` (A9, con OK), y la
carpeta hermana `../ed-render-antes/` con el build del «antes» (la crea A4).

---

### Task A0: El cliente de Prisma lee la base en el primer uso

**Files:**
- Modify: `apps/sitio/src/datos/cliente.ts`
- Modify: `work/edicion-de-paginas/PROGRESS.md` («Baseline») y `DECISIONS.md` (una entrada)

**Interfaces:**
- Produce: el mismo `base: PrismaClient` de siempre, pero **importarlo ya no
  lee el entorno**: la URL se lee al conectar, en la primera consulta, con el
  mismo error en llano («Falta DATABASE_URL…») si no está. Todo `datos/` sigue
  igual; el sitio compila sin base.

**Por qué.** `next build` importa cada ruta y cada layout para leer su
configuración (`maxDuration`, `dynamic`…) aunque no los renderice, y lo hace
con el entorno que tenga. Hoy `datos/cliente.ts` arma el cliente al cargarse y
`adaptadorPostgres()` tira «Falta DATABASE_URL»: el build sin base muere en
`/api/cron/metricas` (medido por el controlador sobre `main`, 2ac8a57). Es
previo a esta lane, y cualquier módulo que importe `datos/cliente` lo hereda.

**Por qué un adaptador perezoso y no un Proxy sobre el cliente.** better-auth
lee `prisma._runtimeDataModel` al construirse (para chequear el esquema), y
`betterAuth()` corre al importar `datos/auth.ts`. Con un Proxy que instancia
el cliente en el primer acceso, ese acceso tira adentro del arranque asíncrono
de better-auth: queda como rechazo sin manejar y mata al worker del build.
Comprobado con un script sobre este repo: «UNHANDLED REJECTION: Falta
DATABASE_URL». Con el cliente real construido desde el import (existen los
modelos y `_runtimeDataModel`) y un adaptador que recién lee la URL en
`connect()`, better-auth arranca, y Prisma llama a `connect()` en la primera
consulta: ahí, y solo ahí, aparece el error.

- [ ] **Step 1: La rama** (con OK)

```bash
git switch -c feat/edicion-de-paginas main
```

- [ ] **Step 2: Ver el problema una vez**, para tener el «antes» a mano:

```bash
DATABASE_URL= DATABASE_URL_UNPOOLED= pnpm --filter sitio exec next build > ../ed-build-sin-base.log 2>&1; echo "exit $?"
grep -n "Falta DATABASE_URL\|Failed to collect" ../ed-build-sin-base.log | head -n 4
```

Esperado: `exit 1` y «Failed to collect configuration for /api/cron/metricas»
con «Falta DATABASE_URL».

- [ ] **Step 3: El cliente** — `apps/sitio/src/datos/cliente.ts` queda así:

```ts
import { PrismaClient, type Prisma } from "@/../prisma/generado/client";
import { adaptadorPostgres } from "@ed/db";

/**
 * El cliente de Prisma de la app. **Esta es la única puerta a la base**
 * (AGENTS.md §3, la segunda frontera): ningún componente importa Prisma, todo
 * pasa por `datos/consultas/` y `datos/acciones/`.
 *
 * Acá se juntan las dos mitades que los paquetes dejan sueltas a propósito:
 * `@ed/db` sabe de Neon pero no del esquema, y el cliente generado sabe del
 * esquema pero no de dónde conectarse.
 *
 * **La URL de la base se lee en la primera consulta, no al importar.**
 * `next build` importa cada ruta y cada layout para leer su configuración
 * (`maxDuration`, `dynamic`…) aunque no los renderice, y lo hace con el
 * entorno que tenga: con el adaptador armado al cargar el módulo, el build sin
 * `.env.local` moría en `/api/cron/metricas` con «Falta DATABASE_URL». Prisma
 * llama a `adapter.connect()` recién en la primera consulta, así que el
 * adaptador de abajo posterga hasta ahí la lectura de la URL; el error, con el
 * mismo texto, aparece donde de verdad hace falta la base. El sitio compila
 * sin base, como dice el README.
 *
 * No es un Proxy que instancie el cliente en el primer acceso, a propósito:
 * better-auth lee `_runtimeDataModel` del cliente al construirse (para
 * chequear el esquema), y ese acceso tiraría adentro de su arranque asíncrono,
 * como un rechazo sin manejar que mata al build. El cliente real existe desde
 * el import; lo único que espera es la conexión.
 */

const adaptadorPerezoso: Prisma.PrismaClientOptionsWithAdapter["adapter"] = {
  provider: "postgres",
  adapterName: "@prisma/adapter-pg",
  connect: () => adaptadorPostgres().connect(),
};

// En desarrollo, cada recarga en caliente crearía un cliente nuevo y la base
// se quedaría sin conexiones. En producción el módulo se evalúa una vez y esto
// no hace falta.
const global_ = globalThis as unknown as { base?: PrismaClient };

export const base: PrismaClient = global_.base ?? new PrismaClient({ adapter: adaptadorPerezoso });

if (process.env.NODE_ENV !== "production") global_.base = base;
```

- [ ] **Step 4: Aceptación.** Las cuatro, en este orden:

```bash
DATABASE_URL= DATABASE_URL_UNPOOLED= pnpm --filter sitio exec next build > ../ed-build-sin-base.log 2>&1; echo "build sin base: exit $?"
cd apps/sitio && DATABASE_URL= DATABASE_URL_UNPOOLED= pnpm exec tsx -e "import('./src/datos/cliente').then(async ({ base }) => { try { await base.user.count(); console.log('no debería llegar acá'); } catch (e) { console.log('primera consulta sin base →', e.message.split('\n')[0]); } })" && cd ../..
pnpm --filter sitio test 2>&1 | grep -E "^# (tests|pass|fail)"
```

Esperado: `build sin base: exit 0`; «primera consulta sin base → Falta
DATABASE_URL. Copiá apps/sitio/.env.example…»; y `# tests 22` / `# pass 22` /
`# fail 0` (con `.env.local` y el Postgres de Docker: los de integración
consultan de verdad). La cuarta es en el navegador: `pnpm dev`, entrar a
`/admin` con la cuenta local y ver la portada con las métricas; «Salir» y
volver a entrar.

- [ ] **Step 5: PROGRESS y DECISIONS.** En `PROGRESS.md`, «Baseline», una
línea: «Build sin `DATABASE_URL` sobre `2ac8a57`: fallaba en
`/api/cron/metricas` (`datos/cliente.ts` armaba el adaptador al cargarse); A0
lo arregla». Y al final de `DECISIONS.md`:

```markdown
**2026-09-21 — `datos/cliente.ts` lee `DATABASE_URL` en la primera consulta, no al importar.**
`next build` importa cada ruta para leer su configuración, sin base: el
adaptador armado al cargar el módulo hacía fallar el build en
`/api/cron/metricas` desde la fase A de métricas. Ahora el adaptador posterga
la lectura de la URL hasta `connect()`, que Prisma llama en la primera
consulta, con el mismo error en llano. No es un Proxy sobre el cliente porque
better-auth lee `_runtimeDataModel` al construirse y ese acceso tiraría
adentro de su arranque asíncrono (rechazo sin manejar que mata al build);
comprobado con un script antes de decidirlo.
```

- [ ] **Step 6: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/datos/cliente.ts work/edicion-de-paginas/PROGRESS.md work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
fix(datos): leer DATABASE_URL en la primera consulta, no al importar

next build importa cada ruta para leer su configuración, sin .env.local,
y el cliente armaba el adaptador al cargarse: el build sin base moría en
/api/cron/metricas con «Falta DATABASE_URL». Ahora la URL se lee en
connect(), que Prisma llama en la primera consulta, con el mismo error.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A1: Las tablas

**Files:**
- Create: `apps/sitio/prisma/schema/paginas.prisma`
- Create: `apps/sitio/prisma/migrations/<marca>_paginas/` (la genera Prisma)
- Modify: `work/edicion-de-paginas/DECISIONS.md` (una entrada)

**Interfaces:**
- Produce: `base.pagina` (clave `slug`; columnas `publicado`, `publicadoEn`,
  `publicadoPor`, `borrador`, `borradorEn`, `borradorPor`) y `base.foto`
  (`id` uuid, `url`, `alt`, `ancho`, `alto`, `bytes`, `tipo`, `subidaEn`,
  `subidaPor`); los tipos `Pagina` y `Foto` del cliente generado.

- [ ] **Step 1: El esquema** `apps/sitio/prisma/schema/paginas.prisma`
(SPEC §4.3 tal cual; §4.4 sin `focoX`/`focoY` y con `uuid()`, ver DECISIONS
10; con OK):

```prisma
// El contenido editable de las páginas (work/edicion-de-paginas/SPEC.md §4).
// Un documento por página validado por el esquema de cada sección, y no una
// columna por texto: la estructura vive en código, la base guarda el
// documento. Es la divergencia más grande con el spec del admin (§12).

/// Una fila por página del sitio. Dos versiones del contenido: la que lee el
/// sitio y la que se está editando. Sin historial: eso quedó fuera de alcance.
/// `publicado` en null significa «esta página todavía muestra el contenido
/// inicial del código»; `borrador` en null, «el borrador es lo publicado».
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

/// Una foto subida desde el admin. `alt` es obligatorio (AGENTS.md §6). El
/// punto de foco NO va acá: vive con cada uso de la foto en el contenido,
/// porque la misma foto puede recortarse distinto en dos marcos. El id es el
/// UUID que nombra el archivo (`/api/fotos/<id>` en local, `fotos/<id>.<ext>`
/// en Blob); lo genera la acción y la ruta pública solo acepta esa forma.
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

- [ ] **Step 2: Migración y cliente** (con el Postgres de Docker arriba)

```bash
pnpm migrate --name paginas 2>&1 | tail -n 6
pnpm generate 2>&1 | tail -n 2
ls apps/sitio/prisma/migrations | tail -n 1
docker exec ed-postgres psql -U postgres -d ed -c "\dt" | grep -E "paginas|fotos"
docker exec ed-postgres psql -U postgres -d ed -c "\d fotos" | grep -c foco
grep -n "export type Pagina\|export type Foto" apps/sitio/prisma/generado/client.ts
```

Esperado: una carpeta `<marca>_paginas` con su `migration.sql`, las dos tablas
en la base, `0` columnas de foco, y las dos líneas `export type` en el cliente
generado. Reiniciar `pnpm dev` si estaba corriendo.

- [ ] **Step 3: DECISIONS.** Agregar al final de `work/edicion-de-paginas/DECISIONS.md`:

```markdown
**2026-09-21 — `Foto` sin `focoX`/`focoY`, y con id `uuid()`.**
El foco vive en el valor `foto()` de cada lugar del contenido (la misma foto
puede recortarse distinto en dos marcos), así que en la tabla quedaban
muertas. El id lo genera la acción con `randomUUID()` porque nombra también el
archivo y la ruta pública solo acepta un UUID; el default de la columna dice lo
mismo. Ruling del controlador sobre la revisión del plan (I6).
```

- [ ] **Step 4: Commit** (con OK)

```bash
git add apps/sitio/prisma/schema/paginas.prisma apps/sitio/prisma/migrations work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
feat(paginas): las tablas de páginas y fotos

Un documento por página en dos versiones (publicado y borrador) y la
tabla de las fotos subidas desde el admin. El foco no va en la tabla:
vive con cada uso de la foto en el contenido.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A2: Los tipos de campo y la descripción del formulario

Requiere el OK de Facundo a la excepción de AGENTS.md §12 («Lo que este plan
fija», 9).

**Files:**
- Create: `apps/sitio/src/lib/contenido/fotos.ts`
- Test: `apps/sitio/src/lib/contenido/fotos.test.ts`
- Create: `apps/sitio/src/lib/contenido/campos.ts`
- Test: `apps/sitio/src/lib/contenido/campos.test.ts`
- Create: `apps/sitio/src/lib/contenido/descripcion.ts`
- Create: `apps/sitio/src/lib/contenido/describir.ts`
- Test: `apps/sitio/src/lib/contenido/describir.test.ts`
- Create: `apps/sitio/src/lib/contenido/documento.ts`
- Test: `apps/sitio/src/lib/contenido/documento.test.ts`
- Modify: `apps/sitio/src/config/nav.ts` (sumar `RUTAS_INTERNAS` al final)
- Modify: `work/edicion-de-paginas/DECISIONS.md` (dos entradas)

**Interfaces:**
- Produce (`fotos.ts`, sin Zod ni sharp: lo importan componentes del
  navegador): `type Foco = { x: number; y: number }`,
  `type ValorFoto = { src: string; alt: string; foco: Foco }`, `MAXIMO_BYTES`,
  `esSrcDeFoto(src: string): boolean`, `posicionDelFoco(foco): string`,
  `estiloDeFoco(foco): { objectPosition: string } | undefined`,
  `resolverFoto(valor): { src; alt; objectPosition }`, `fotoDeRuta(src, alt): ValorFoto`.
- Produce (`campos.ts`): `textoCorto({ maximo, etiqueta?, ayuda? })`,
  `parrafo({ maximo, etiqueta?, ayuda? })`, `foto({ etiqueta?, ayuda? })`,
  `rutaInterna(rutas: readonly string[], { etiqueta?, ayuda? })`,
  `listaFija(cantidad, item, { etiqueta?, ayuda?, etiquetaDelItem? })`,
  `grupo(forma, { etiqueta?, ayuda? })`, `metaDe(esquema): MetaDeCampo | undefined`.
- Produce (`descripcion.ts`): el tipo `Descripcion` (árbol serializable),
  `valorVacio(d: Descripcion): unknown`, `humanizar(clave: string): string`.
- Produce (`describir.ts`): `describir(esquema: z.ZodType, etiquetaPorDefecto?: string): Descripcion`.
- Produce (`documento.ts`): los tipos `SeccionRegistrada`, `PaginaRegistrada`,
  `RegistroDePaginas`; `comoDocumento(json: unknown): Record<string, unknown>`;
  `completarPagina(pagina, documento, avisar?): Record<string, unknown>`.
- Produce (`nav.ts`): `RUTAS_INTERNAS: readonly string[]` (las siete rutas).

- [ ] **Step 1: El test de `fotos.ts`** `apps/sitio/src/lib/contenido/fotos.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { esSrcDeFoto, estiloDeFoco, fotoDeRuta, posicionDelFoco, resolverFoto } from "./fotos";

test("el foco se vuelve un object-position en porcentajes redondos", () => {
  assert.equal(posicionDelFoco({ x: 0.5, y: 0.5 }), "50% 50%");
  assert.equal(posicionDelFoco({ x: 0.254, y: 1 }), "25% 100%");
});

test("en el centro no hay estilo: es el default del navegador y el HTML queda igual", () => {
  assert.equal(estiloDeFoco({ x: 0.5, y: 0.5 }), undefined);
  assert.deepEqual(estiloDeFoco({ x: 0.2, y: 0.5 }), { objectPosition: "20% 50%" });
});

test("resolverFoto devuelve lo que el <Image> del sitio necesita", () => {
  assert.deepEqual(resolverFoto({ src: "/fotos/a.webp", alt: "Un aula", foco: { x: 0, y: 0.5 } }), {
    src: "/fotos/a.webp",
    alt: "Un aula",
    objectPosition: "0% 50%",
  });
});

test("fotoDeRuta arma una foto de public/ centrada, con su propio foco", () => {
  const a = fotoDeRuta("/fotos/a.webp", "A");
  const b = fotoDeRuta("/fotos/b.webp", "B");
  assert.deepEqual(a, { src: "/fotos/a.webp", alt: "A", foco: { x: 0.5, y: 0.5 } });
  assert.notEqual(a.foco, b.foco);
});

test("solo se aceptan las fotos que el sitio sabe mostrar", () => {
  assert.equal(esSrcDeFoto("/fotos/docentes-trabajan-aula.webp"), true);
  assert.equal(esSrcDeFoto("/api/fotos/0f0e0d0c-0b0a-4908-8706-050403020100"), true);
  assert.equal(esSrcDeFoto("https://abc123xyz.public.blob.vercel-storage.com/fotos/x.webp"), true);
  assert.equal(esSrcDeFoto("https://otro.sitio/x.jpg"), false);
  assert.equal(esSrcDeFoto("/api/fotos/../.env.local"), false);
  assert.equal(esSrcDeFoto("fotos/sin-barra.webp"), false);
  assert.equal(esSrcDeFoto(""), false);
});
```

- [ ] **Step 2: Verlo fallar; después** `apps/sitio/src/lib/contenido/fotos.ts`:

```ts
// Cómo se muestra una foto guardada en el contenido: `src`, `alt` y el
// `object-position` que sale del punto de foco (SPEC §4.4). Sin Zod y sin
// sharp: lo importan componentes del navegador. El esquema del campo vive en
// campos.ts y usa lo de acá.

export type Foco = { x: number; y: number };
export type ValorFoto = { src: string; alt: string; foco: Foco };

/** 4 MB: Vercel corta el cuerpo de una función en 4,5 MB (DECISIONS, 3). Se chequea en el navegador y en el servidor. */
export const MAXIMO_BYTES = 4 * 1024 * 1024;

// Lo único que el sitio sabe mostrar: sus fotos de public/, las subidas en
// local y las del Blob de Vercel (el host de next.config.ts). Un host fuera
// de remotePatterns haría tirar a next/image en cada visita a la home.
const SRC_PERMITIDO = /^(\/fotos\/[^\s?#]+|\/api\/fotos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s]+)$/;

export function esSrcDeFoto(src: string): boolean {
  return SRC_PERMITIDO.test(src);
}

/** `{ x: 0.25, y: 0.5 }` → `"25% 50%"`, lo que `object-position` entiende. */
export function posicionDelFoco(foco: Foco): string {
  return `${Math.round(foco.x * 100)}% ${Math.round(foco.y * 100)}%`;
}

/**
 * El `style` del `<Image>` del sitio, o `undefined` cuando el foco está en el
 * centro: es el default del navegador, y así el HTML de las fotos de hoy
 * queda byte a byte igual que antes de esta lane.
 */
export function estiloDeFoco(foco: Foco): { objectPosition: string } | undefined {
  return foco.x === 0.5 && foco.y === 0.5 ? undefined : { objectPosition: posicionDelFoco(foco) };
}

/** Lo que una foto del contenido tiene para mostrarse, con la posición siempre explícita. */
export function resolverFoto(valor: ValorFoto): { src: string; alt: string; objectPosition: string } {
  return { src: valor.src, alt: valor.alt, objectPosition: posicionDelFoco(valor.foco) };
}

/** Una foto de `public/`, centrada: la forma del contenido inicial. Cada llamada trae su propio foco, para que nadie lo comparta por referencia. */
export function fotoDeRuta(src: string, alt: string): ValorFoto {
  return { src, alt, foco: { x: 0.5, y: 0.5 } };
}
```

`pnpm --filter sitio test` → los 5 tests en verde.

- [ ] **Step 3: El test de los campos** `apps/sitio/src/lib/contenido/campos.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { foto, grupo, listaFija, metaDe, parrafo, rutaInterna, textoCorto } from "./campos";

test("textoCorto recorta, exige algo y no acepta saltos ni más del máximo", () => {
  const campo = textoCorto({ maximo: 10, etiqueta: "Título", ayuda: "Un renglón." });
  assert.equal(campo.parse("  hola  "), "hola");
  assert.equal(campo.safeParse("").success, false);
  assert.equal(campo.safeParse("hola\nchau").success, false);
  assert.equal(campo.safeParse("12345678901").success, false);
  assert.deepEqual(metaDe(campo), { tipo: "textoCorto", maximo: 10, etiqueta: "Título", ayuda: "Un renglón." });
});

test("parrafo acepta saltos de línea", () => {
  assert.equal(parrafo({ maximo: 50 }).safeParse("una línea\notra").success, true);
  assert.equal(parrafo({ maximo: 5 }).safeParse("demasiado largo").success, false);
});

test("listaFija pide la cantidad exacta", () => {
  const lista = listaFija(3, textoCorto({ maximo: 5 }), { ayuda: "Son 3." });
  assert.equal(lista.safeParse(["a", "b", "c"]).success, true);
  assert.equal(lista.safeParse(["a", "b"]).success, false);
  assert.equal(lista.safeParse(["a", "b", "c", "d"]).success, false);
  assert.deepEqual(metaDe(lista), { tipo: "listaFija", cantidad: 3, ayuda: "Son 3." });
});

test("rutaInterna es una lista cerrada", () => {
  const ruta = rutaInterna(["/", "/contacto"]);
  assert.equal(ruta.safeParse("/contacto").success, true);
  assert.equal(ruta.safeParse("https://otro.sitio").success, false);
  assert.equal(metaDe(ruta)?.tipo, "rutaInterna");
});

test("foto exige un src que el sitio sepa mostrar, alt y un foco entre 0 y 1", () => {
  const campo = foto({ etiqueta: "Foto" });
  const buena = { src: "/fotos/a.webp", alt: "Docentes en un aula", foco: { x: 0.5, y: 0.5 } };
  assert.deepEqual(campo.parse(buena), buena);
  assert.equal(campo.safeParse({ ...buena, src: "https://abc.public.blob.vercel-storage.com/fotos/a.webp" }).success, true);
  assert.equal(campo.safeParse({ ...buena, alt: "" }).success, false);
  assert.equal(campo.safeParse({ ...buena, src: "" }).success, false);
  assert.equal(campo.safeParse({ ...buena, src: "https://otro.sitio/a.jpg" }).success, false);
  assert.equal(campo.safeParse({ ...buena, foco: { x: 1.5, y: 0 } }).success, false);
});

test("cada llamada tiene su propia metadata", () => {
  const a = textoCorto({ maximo: 5, etiqueta: "A" });
  const b = textoCorto({ maximo: 9, etiqueta: "B" });
  assert.equal(metaDe(a)?.etiqueta, "A");
  assert.equal(metaDe(b)?.etiqueta, "B");
  assert.equal(metaDe(grupo({ a }, { etiqueta: "Par" }))?.etiqueta, "Par");
});
```

- [ ] **Step 4: Verlo fallar** — `pnpm --filter sitio test` → falla por
`./campos` inexistente.

- [ ] **Step 5: Los campos** `apps/sitio/src/lib/contenido/campos.ts`:

```ts
import { z } from "zod";
import { esSrcDeFoto } from "./fotos";

// Los tipos de campo con los que se escribe el esquema de una sección
// (SPEC §4.2). Sin dominio de ED. Cada campo valida y, aparte, deja en un
// registro de Zod lo que el admin necesita para dibujarlo: etiqueta, largo
// máximo, ayuda. El registro va por instancia, por eso cada llamada crea un
// esquema nuevo: dos campos nunca comparten metadata.

type Comun = { etiqueta?: string; ayuda?: string };

export type MetaDeCampo =
  | ({ tipo: "textoCorto"; maximo: number } & Comun)
  | ({ tipo: "parrafo"; maximo: number } & Comun)
  | ({ tipo: "foto" } & Comun)
  | ({ tipo: "rutaInterna" } & Comun)
  | ({ tipo: "listaFija"; cantidad: number; etiquetaDelItem?: string } & Comun)
  | ({ tipo: "grupo" } & Comun);

const registro = z.registry<MetaDeCampo>();

/** Lo que el admin sabe de un campo, o `undefined` si el esquema no salió de acá. */
export function metaDe(esquema: z.ZodType): MetaDeCampo | undefined {
  return registro.get(esquema);
}

const SIN_SALTOS = /^[^\r\n]*$/;

/** Una línea, sin saltos. El admin muestra el contador y la ayuda. */
export function textoCorto({ maximo, ...resto }: { maximo: number } & Comun) {
  return z
    .string()
    .trim()
    .min(1, "Este texto no puede quedar vacío.")
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.")
    .register(registro, { tipo: "textoCorto", maximo, ...resto });
}

/** Varias líneas. */
export function parrafo({ maximo, ...resto }: { maximo: number } & Comun) {
  return z
    .string()
    .trim()
    .min(1, "Este texto no puede quedar vacío.")
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .register(registro, { tipo: "parrafo", maximo, ...resto });
}

/**
 * Una foto: de dónde sale (`/fotos/…` de `public/`, `/api/fotos/<id>` o el
 * Blob del sitio: nada más, ver fotos.ts), su texto alternativo —obligatorio—
 * y el punto de foco en 0..1. `alt` y `foco` van con cada uso y no con el
 * archivo: la misma foto en dos marcos puede pedir otro alt y otro recorte
 * (DECISIONS, 1).
 */
export function foto(opciones: Comun = {}) {
  return z
    .object({
      src: z.string().trim().min(1, "Falta la foto.").refine(esSrcDeFoto, "La foto tiene que estar en /fotos/, en /api/fotos/ o en el Blob del sitio."),
      alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(200, "Como mucho 200 caracteres."),
      foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
    })
    .register(registro, { tipo: "foto", ...opciones });
}

/** Una de las rutas del sitio. La lista cerrada la trae quien llama (`config/nav.ts`): acá no se sabe de ED. */
export function rutaInterna(rutas: readonly string[], opciones: Comun = {}) {
  return z.enum(rutas).register(registro, { tipo: "rutaInterna", ...opciones });
}

/** Exactamente `cantidad` ítems: la cantidad es parte de la escena, no del contenido. */
export function listaFija<T extends z.ZodType>(cantidad: number, item: T, opciones: Comun & { etiquetaDelItem?: string } = {}) {
  return z
    .array(item)
    .length(cantidad, `Son ${cantidad} ítems, ni más ni menos.`)
    .register(registro, { tipo: "listaFija", cantidad, ...opciones });
}

/** Un grupo de campos con nombre propio (un botón: texto + ruta). */
export function grupo<T extends z.ZodRawShape>(forma: T, opciones: Comun = {}) {
  return z.object(forma).register(registro, { tipo: "grupo", ...opciones });
}
```

- [ ] **Step 6: Verlo pasar** — `pnpm --filter sitio test` → los 6 tests de
`campos.test.ts` en verde.

- [ ] **Step 7: La descripción, sin Zod** `apps/sitio/src/lib/contenido/descripcion.ts`
(este archivo viaja al navegador: no importa `zod`):

```ts
// El árbol que describe un formulario: qué control va en cada lugar y con qué
// etiqueta, largo y ayuda. Sin Zod adentro: sale del servidor como JSON y el
// editor lo recorre en el navegador.

type Base = { etiqueta: string; ayuda?: string };

export type Descripcion =
  | (Base & { tipo: "textoCorto"; maximo: number })
  | (Base & { tipo: "parrafo"; maximo: number })
  | (Base & { tipo: "foto" })
  | (Base & { tipo: "rutaInterna"; opciones: string[] })
  | (Base & { tipo: "listaFija"; cantidad: number; item: Descripcion })
  | (Base & { tipo: "grupo"; campos: Array<{ clave: string; descripcion: Descripcion }> })
  | (Base & { tipo: "opcional"; de: Descripcion });

/** «botonPrincipal» → «Boton principal»: la etiqueta de emergencia cuando el esquema no trae una. */
export function humanizar(clave: string): string {
  const conEspacios = clave.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
}

/** Un valor vacío con la forma que pide la descripción: lo que aparece al activar un opcional. */
export function valorVacio(d: Descripcion): unknown {
  switch (d.tipo) {
    case "textoCorto":
    case "parrafo":
      return "";
    case "rutaInterna":
      return d.opciones[0] ?? "/";
    case "foto":
      return { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };
    case "listaFija":
      return Array.from({ length: d.cantidad }, () => valorVacio(d.item));
    case "grupo":
      return Object.fromEntries(d.campos.map((c) => [c.clave, valorVacio(c.descripcion)]));
    case "opcional":
      return null;
  }
}
```

- [ ] **Step 8: El test de describir** `apps/sitio/src/lib/contenido/describir.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { foto, grupo, listaFija, rutaInterna, textoCorto } from "./campos";
import { describir } from "./describir";
import { humanizar, valorVacio } from "./descripcion";

const esquema = z.object({
  titulo: textoCorto({ maximo: 20, etiqueta: "Título", ayuda: "Un renglón." }),
  boton: grupo({ texto: textoCorto({ maximo: 8 }), ruta: rutaInterna(["/", "/contacto"]) }, { etiqueta: "Botón" }),
  tarjetas: listaFija(2, grupo({ foto: foto(), cartel: grupo({ titulo: textoCorto({ maximo: 5 }) }).nullable() }), { etiquetaDelItem: "Tarjeta" }),
});

test("describir arma el árbol del formulario, sin Zod adentro", () => {
  assert.deepEqual(describir(esquema, "Hero"), {
    tipo: "grupo",
    etiqueta: "Hero",
    campos: [
      { clave: "titulo", descripcion: { tipo: "textoCorto", etiqueta: "Título", ayuda: "Un renglón.", maximo: 20 } },
      {
        clave: "boton",
        descripcion: {
          tipo: "grupo",
          etiqueta: "Botón",
          campos: [
            { clave: "texto", descripcion: { tipo: "textoCorto", etiqueta: "Texto", maximo: 8 } },
            { clave: "ruta", descripcion: { tipo: "rutaInterna", etiqueta: "Ruta", opciones: ["/", "/contacto"] } },
          ],
        },
      },
      {
        clave: "tarjetas",
        descripcion: {
          tipo: "listaFija",
          etiqueta: "Tarjetas",
          cantidad: 2,
          item: {
            tipo: "grupo",
            etiqueta: "Tarjeta",
            campos: [
              { clave: "foto", descripcion: { tipo: "foto", etiqueta: "Foto" } },
              {
                clave: "cartel",
                descripcion: {
                  tipo: "opcional",
                  etiqueta: "Cartel",
                  de: { tipo: "grupo", etiqueta: "Cartel", campos: [{ clave: "titulo", descripcion: { tipo: "textoCorto", etiqueta: "Titulo", maximo: 5 } }] },
                },
              },
            ],
          },
        },
      },
    ],
  });
});

test("lo que no salió de campos.ts no se sabe dibujar", () => {
  assert.throws(() => describir(z.number(), "Edad"), /No sé dibujar/);
});

test("humanizar y valorVacio", () => {
  assert.equal(humanizar("botonPrincipal"), "Boton principal");
  // El `as` es del test: valorVacio devuelve unknown a propósito y acá se sabe qué esquema se describió.
  const vacio = valorVacio(describir(esquema, "Hero")) as {
    titulo: string;
    boton: { ruta: string };
    tarjetas: Array<{ cartel: unknown; foto: { alt: string } }>;
  };
  assert.equal(vacio.titulo, "");
  assert.equal(vacio.boton.ruta, "/");
  assert.equal(vacio.tarjetas.length, 2);
  assert.equal(vacio.tarjetas[0].cartel, null);
  assert.equal(vacio.tarjetas[1].foto.alt, "");
});
```

- [ ] **Step 9: Verlo fallar** — `pnpm --filter sitio test` → falla por
`./describir` inexistente.

- [ ] **Step 10: El recorrido del esquema** `apps/sitio/src/lib/contenido/describir.ts`:

```ts
import { z } from "zod";
import { metaDe } from "./campos";
import { humanizar, type Descripcion } from "./descripcion";

/**
 * Recorre un esquema y devuelve lo que el admin necesita para dibujar el
 * formulario (SPEC §4.1: el formulario sale del esquema; excepción acotada a
 * AGENTS.md §12, ver «Lo que este plan fija», 9). Lo que no salió de
 * `campos.ts` —salvo un `z.object` pelado, que es un grupo, y un `.nullable()`,
 * que es un opcional— no se sabe dibujar y tira: mejor romper en desarrollo
 * que mostrar un campo mudo.
 *
 * Los `as z.ZodType` de abajo: Zod tipa a los hijos (`element`, `unwrap()`,
 * los valores de `shape`) como `SomeType`, la interfaz mínima de su núcleo;
 * para nosotros son esquemas más, y así los trata la recursión.
 */
export function describir(esquema: z.ZodType, etiquetaPorDefecto = ""): Descripcion {
  const meta = metaDe(esquema);
  const etiqueta = meta?.etiqueta ?? etiquetaPorDefecto;
  // Sin la clave cuando no hay ayuda: así el árbol se compara entero en los tests.
  const base = meta?.ayuda === undefined ? { etiqueta } : { etiqueta, ayuda: meta.ayuda };

  if (meta?.tipo === "textoCorto" || meta?.tipo === "parrafo") return { ...base, tipo: meta.tipo, maximo: meta.maximo };
  if (meta?.tipo === "foto") return { ...base, tipo: "foto" };
  if (meta?.tipo === "rutaInterna") {
    if (!(esquema instanceof z.ZodEnum)) throw new Error("rutaInterna tiene que ser un z.enum");
    return { ...base, tipo: "rutaInterna", opciones: esquema.options.map(String) };
  }
  if (meta?.tipo === "listaFija") {
    if (!(esquema instanceof z.ZodArray)) throw new Error("listaFija tiene que ser un z.array");
    return { ...base, tipo: "listaFija", cantidad: meta.cantidad, item: describir(esquema.element as z.ZodType, meta.etiquetaDelItem ?? "Ítem") };
  }
  if (esquema instanceof z.ZodNullable) return { etiqueta, tipo: "opcional", de: describir(esquema.unwrap() as z.ZodType, etiqueta) };
  if (esquema instanceof z.ZodObject) {
    return {
      ...base,
      tipo: "grupo",
      campos: Object.entries(esquema.shape).map(([clave, sub]) => ({ clave, descripcion: describir(sub as z.ZodType, humanizar(clave)) })),
    };
  }
  throw new Error(`No sé dibujar un campo «${esquema.def.type}» (${etiqueta || "sin etiqueta"}).`);
}
```

- [ ] **Step 11: Verlo pasar** — `pnpm --filter sitio test` → los 3 tests de
`describir.test.ts` en verde.

- [ ] **Step 12: El test del documento** `apps/sitio/src/lib/contenido/documento.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { textoCorto } from "./campos";
import { comoDocumento, completarPagina, type PaginaRegistrada } from "./documento";

const pagina: PaginaRegistrada = {
  ruta: "/prueba",
  nombre: "Prueba",
  secciones: {
    bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "Inicial" } },
  },
};

test("comoDocumento solo acepta un objeto", () => {
  assert.deepEqual(comoDocumento(null), {});
  assert.deepEqual(comoDocumento([1]), {});
  assert.deepEqual(comoDocumento("x"), {});
  assert.deepEqual(comoDocumento({ a: 1 }), { a: 1 });
});

test("una sección que falta vuelve al inicial, sin aviso", () => {
  const avisos: string[] = [];
  assert.deepEqual(completarPagina(pagina, {}, (m) => avisos.push(m)), { bloque: { titulo: "Inicial" } });
  assert.equal(avisos.length, 0);
});

test("una sección válida se usa tal cual; una inválida vuelve al inicial y avisa", () => {
  const avisos: string[] = [];
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "Nuevo" } }, (m) => avisos.push(m)), { bloque: { titulo: "Nuevo" } });
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "" } }, (m) => avisos.push(m)), { bloque: { titulo: "Inicial" } });
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /Bloque/);
});

test("las secciones que no están en el registro se descartan", () => {
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "Ok" }, vieja: 1 }, () => {}), { bloque: { titulo: "Ok" } });
});
```

- [ ] **Step 13: Verlo fallar; después el documento** `apps/sitio/src/lib/contenido/documento.ts`:

```ts
import type { z } from "zod";

// El documento de una página es `{ [seccion]: contenido }` (SPEC §4.3). Acá
// se completa y se valida contra el registro; no sabe de la base ni de ED.

export type SeccionRegistrada = { nombre: string; esquema: z.ZodType; inicial: unknown };
export type PaginaRegistrada = { ruta: string; nombre: string; secciones: Record<string, SeccionRegistrada> };
export type RegistroDePaginas = Record<string, PaginaRegistrada>;

/** Lo que hay en una columna Json, leído como documento: un objeto por sección, o nada. */
export function comoDocumento(json: unknown): Record<string, unknown> {
  // El `as` solo dice que un objeto que no es array se puede recorrer por clave; los valores siguen siendo unknown.
  return json !== null && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
}

/**
 * El contenido completo de una página: cada sección del registro, validada
 * contra su esquema. La que falta o no pasa vuelve al contenido inicial y se
 * avisa: la base puede traer un documento viejo si el esquema cambió, y el
 * sitio no se rompe por eso (SPEC §4.2).
 */
export function completarPagina(
  pagina: PaginaRegistrada,
  documento: Record<string, unknown>,
  avisar: (mensaje: string) => void = console.warn,
): Record<string, unknown> {
  const completo: Record<string, unknown> = {};
  for (const [clave, seccion] of Object.entries(pagina.secciones)) {
    if (!(clave in documento)) {
      completo[clave] = seccion.inicial;
      continue;
    }
    const valido = seccion.esquema.safeParse(documento[clave]);
    if (valido.success) {
      completo[clave] = valido.data;
    } else {
      avisar(`La sección «${seccion.nombre}» de ${pagina.nombre} no pasa su esquema; se muestra el contenido inicial.`);
      completo[clave] = seccion.inicial;
    }
  }
  return completo;
}
```

`pnpm --filter sitio test` → los 4 tests de `documento.test.ts` en verde.

- [ ] **Step 14: Las rutas internas.** Al final de `apps/sitio/src/config/nav.ts`
(después de `esPaginaActiva`):

```ts
/**
 * Las siete rutas del sitio, la lista cerrada que el admin ofrece para un
 * enlace interno (SPEC §4.2, `rutaInterna`). Sale del menú para que no haya
 * dos listas: Inicio, las cinco del nav y Contacto.
 */
export const RUTAS_INTERNAS: readonly string[] = [HOME_LINK.href, ...NAV_LINKS.map((l) => l.href), CTA_LINK.href];
```

- [ ] **Step 15: DECISIONS.** Agregar al final de `work/edicion-de-paginas/DECISIONS.md`:

```markdown
**2026-09-21 — El valor de `foto()` es un objeto `{ src, alt, foco }`, no un id.**
Con un id, el sitio tendría que hacer un join al renderizar y el `alt` de las
fotos de `public/` no tendría dónde vivir. `alt` y `foco` van con cada uso (la
misma foto en dos marcos tenía dos alt distintos en `hero-cards.ts`); la tabla
`fotos` guarda el archivo, sus medidas y quién lo subió, y su `url` es el
`src`. El `src` se acota a `/fotos/…`, `/api/fotos/<uuid>` y el host del Blob:
un host fuera de `remotePatterns` rompería el render de la home al publicar.

**2026-09-21 — `rutaInterna(rutas)` recibe la lista; `grupo()` para los sub-objetos con nombre.**
`lib/contenido/` no puede importar `config/nav.ts` sin saber de ED, así que la
lista cerrada (`RUTAS_INTERNAS`) la trae quien escribe el esquema. `grupo` es
un `z.object` con etiqueta para que el formulario titule «Botón principal» sin
escribir JSX por sección.
```

- [ ] **Step 16: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/lib/contenido/fotos.ts apps/sitio/src/lib/contenido/fotos.test.ts apps/sitio/src/lib/contenido/campos.ts apps/sitio/src/lib/contenido/campos.test.ts apps/sitio/src/lib/contenido/descripcion.ts apps/sitio/src/lib/contenido/describir.ts apps/sitio/src/lib/contenido/describir.test.ts apps/sitio/src/lib/contenido/documento.ts apps/sitio/src/lib/contenido/documento.test.ts apps/sitio/src/config/nav.ts work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
feat(contenido): los tipos de campo y la descripción del formulario

Seis tipos de campo con su metadata en un registro de Zod, y el árbol
serializable que el admin recorre para dibujar el formulario: sumar
una sección al admin es escribir su esquema, no su JSX (SPEC §4.1).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A3: Las fotos

**Files:**
- Modify: `apps/sitio/package.json` (dependencia `@vercel/blob`, con OK)
- Create: `apps/sitio/src/lib/contenido/imagen.ts`
- Test: `apps/sitio/src/lib/contenido/imagen.test.ts`
- Create: `apps/sitio/src/lib/contenido/almacen.ts`
- Test: `apps/sitio/src/lib/contenido/almacen.test.ts`
- Create: `apps/sitio/src/app/api/fotos/[id]/route.ts`
- Create: `apps/sitio/src/datos/acciones/fotos.ts`
- Modify: `apps/sitio/.gitignore`, `apps/sitio/.env.example`, `apps/sitio/next.config.ts`
- Modify: `work/edicion-de-paginas/DECISIONS.md` (una entrada)

**Interfaces:**
- Consume: `MAXIMO_BYTES` de `@/lib/contenido/fotos` (A2).
- Produce (`imagen.ts`, solo servidor: importa `sharp`): `type TipoDeImagen`,
  `EXTENSION_POR_TIPO`, `leerImagen(bytes: Buffer): Promise<{ tipo; ancho; alto } | null>`.
- Produce (`almacen.ts`): `type Almacen = { guardar({ id, tipo, bytes }): Promise<{ url: string }> }`,
  `almacenEnDisco(carpeta)`, `almacenEnBlob(token)`, `almacenDesdeEntorno()`,
  `hayBlob()`, `carpetaLocal()`, `buscarEnDisco(carpeta, id)`.
- Produce (`acciones/fotos.ts`): `subirFoto(datos: FormData): Promise<ResultadoDeSubida>`
  con `ResultadoDeSubida = { ok: true; foto: { src; alt; ancho; alto } } | { ok: false; detalle: string }`.

- [ ] **Step 1: La dependencia** (con OK): `pnpm --filter sitio add @vercel/blob`
(hoy resuelve a `^2.8.0`; `sharp` ya está en `dependencies` y en `allowBuilds`).

- [ ] **Step 2: El test de `imagen.ts`** `apps/sitio/src/lib/contenido/imagen.test.ts`
(las imágenes las fabrica `sharp`, así el test no depende de archivos):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { leerImagen } from "./imagen";

const pixel = (formato: "png" | "jpeg" | "webp" | "gif") =>
  sharp({ create: { width: 3, height: 2, channels: 3, background: "#1f9a78" } }).toFormat(formato).toBuffer();

test("reconoce jpg, png y webp por los bytes y lee ancho y alto", async () => {
  assert.deepEqual(await leerImagen(await pixel("png")), { tipo: "image/png", ancho: 3, alto: 2 });
  assert.deepEqual(await leerImagen(await pixel("jpeg")), { tipo: "image/jpeg", ancho: 3, alto: 2 });
  assert.deepEqual(await leerImagen(await pixel("webp")), { tipo: "image/webp", ancho: 3, alto: 2 });
});

test("lo que no es jpg, png o webp no pasa, diga lo que diga su extensión", async () => {
  assert.equal(await leerImagen(await pixel("gif")), null);
  assert.equal(await leerImagen(Buffer.from("no soy una imagen.png")), null);
});
```

- [ ] **Step 3: Verlo fallar; después** `apps/sitio/src/lib/contenido/imagen.ts`:

```ts
import sharp from "sharp";

// Qué es de verdad un archivo que dice ser una imagen. El tipo sale de los
// bytes y no del nombre ni del `Content-Type` que mandó el navegador (SPEC
// §4.4). `sharp` ya estaba en la app (lo usa next/image) y lee los tres
// formatos que aceptamos. Solo servidor: el tope de bytes, que también se
// chequea en el navegador, vive en fotos.ts.

export type TipoDeImagen = "image/jpeg" | "image/png" | "image/webp";

export const EXTENSION_POR_TIPO: Record<TipoDeImagen, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TIPO_POR_FORMATO: Record<string, TipoDeImagen> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Tipo, ancho y alto de una imagen, o `null` si no es jpg, png o webp (o no es una imagen). */
export async function leerImagen(bytes: Buffer): Promise<{ tipo: TipoDeImagen; ancho: number; alto: number } | null> {
  try {
    const meta = await sharp(bytes).metadata();
    // El índice puede no tener el formato (gif, avif…): por eso el tipo se anota como posible undefined.
    const tipo: TipoDeImagen | undefined = meta.format ? TIPO_POR_FORMATO[meta.format] : undefined;
    if (!tipo || !meta.width || !meta.height) return null;
    return { tipo, ancho: meta.width, alto: meta.height };
  } catch {
    // sharp tira con cualquier cosa que no sea una imagen: para nosotros es «no pasa», no un error.
    return null;
  }
}
```

`pnpm --filter sitio test` → en verde.

- [ ] **Step 4: El test del almacén** `apps/sitio/src/lib/contenido/almacen.test.ts`
(solo el disco: Blob pide la cuenta de Vercel):

```ts
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { almacenEnDisco, buscarEnDisco } from "./almacen";

// Sincrónico a propósito: un await de nivel superior depende de que el
// archivo se cargue como ESM, y eso lo decide el package.json más cercano.
const carpeta = mkdtempSync(path.join(os.tmpdir(), "ed-fotos-"));
const ID = "0f0e0d0c-0b0a-4908-8706-050403020100";

test("guardar deja el archivo con su extensión y devuelve la URL local", async () => {
  const { url } = await almacenEnDisco(carpeta).guardar({ id: ID, tipo: "image/webp", bytes: Buffer.from("RIFF") });
  assert.equal(url, `/api/fotos/${ID}`);
  assert.equal((await readFile(path.join(carpeta, `${ID}.webp`))).toString(), "RIFF");
  assert.deepEqual(await buscarEnDisco(carpeta, ID), { ruta: path.join(carpeta, `${ID}.webp`), tipo: "image/webp" });
});

test("buscarEnDisco no acepta ids raros ni encuentra lo que no está", async () => {
  assert.equal(await buscarEnDisco(carpeta, "../../.env.local"), null);
  assert.equal(await buscarEnDisco(carpeta, "0f0e0d0c-0b0a-4908-8706-050403020199"), null);
});

after(() => rm(carpeta, { recursive: true, force: true }));
```

- [ ] **Step 5: Verlo fallar; después** `apps/sitio/src/lib/contenido/almacen.ts`:

```ts
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { EXTENSION_POR_TIPO, type TipoDeImagen } from "./imagen";

// Dónde queda el archivo de una foto (SPEC §4.4): en Vercel, Blob; en local,
// una carpeta de la app servida por /api/fotos/[id]. La misma interfaz para
// las dos, así lo visual no espera a la cuenta de Vercel.

export type Almacen = {
  guardar(foto: { id: string; tipo: TipoDeImagen; bytes: Buffer }): Promise<{ url: string }>;
};

/** Relativa a la app (`process.cwd()` es `apps/sitio` con `next dev`). Git-ignorada. */
export const CARPETA_LOCAL = ".fotos";

export function carpetaLocal(): string {
  return path.resolve(process.cwd(), CARPETA_LOCAL);
}

export function hayBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function almacenEnDisco(carpeta: string): Almacen {
  return {
    async guardar({ id, tipo, bytes }) {
      await mkdir(carpeta, { recursive: true });
      await writeFile(path.join(carpeta, `${id}.${EXTENSION_POR_TIPO[tipo]}`), bytes);
      return { url: `/api/fotos/${id}` };
    },
  };
}

export function almacenEnBlob(token: string): Almacen {
  return {
    async guardar({ id, tipo, bytes }) {
      // El id ya es único: sin sufijo aleatorio la URL queda legible.
      const subida = await put(`fotos/${id}.${EXTENSION_POR_TIPO[tipo]}`, bytes, { access: "public", contentType: tipo, token });
      return { url: subida.url };
    },
  };
}

/** Blob si hay token; si no, el disco. */
export function almacenDesdeEntorno(): Almacen {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? almacenEnBlob(token) : almacenEnDisco(carpetaLocal());
}

// Un UUID v4 y nada más: es lo único que la ruta pública acepta como nombre,
// así nadie pide `../.env.local`.
const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Object.entries pierde el tipo de la clave (da string): el `as` lo devuelve, y las claves son exactamente las de EXTENSION_POR_TIPO.
const EXTENSIONES = Object.entries(EXTENSION_POR_TIPO) as Array<[TipoDeImagen, string]>;

/** El archivo de una foto del disco, con su tipo, o `null`. */
export async function buscarEnDisco(carpeta: string, id: string): Promise<{ ruta: string; tipo: TipoDeImagen } | null> {
  if (!ID_VALIDO.test(id)) return null;
  for (const [tipo, extension] of EXTENSIONES) {
    const ruta = path.join(carpeta, `${id}.${extension}`);
    try {
      await access(ruta);
      return { ruta, tipo };
    } catch {
      // No está con esta extensión: probar la siguiente.
    }
  }
  return null;
}
```

`pnpm --filter sitio test` → en verde.

- [ ] **Step 6: La ruta que sirve el disco** `apps/sitio/src/app/api/fotos/[id]/route.ts`:

```ts
import { readFile } from "node:fs/promises";
import { buscarEnDisco, carpetaLocal, hayBlob } from "@/lib/contenido/almacen";

// Las fotos subidas en local viven en apps/sitio/.fotos/ y salen por acá. En
// Vercel están en Blob y esta ruta no sirve nada: no hay carpeta que mirar.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  if (hayBlob()) return new Response("No encontrado", { status: 404 });
  const { id } = await params;
  const archivo = await buscarEnDisco(carpetaLocal(), id);
  if (!archivo) return new Response("No encontrado", { status: 404 });
  // Copia a un Uint8Array con ArrayBuffer propio: un Buffer no entra en BodyInit desde TS 5.7.
  return new Response(new Uint8Array(await readFile(archivo.ruta)), {
    headers: { "Content-Type": archivo.tipo, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
```

- [ ] **Step 7: La acción de subir** `apps/sitio/src/datos/acciones/fotos.ts`
(todo adentro del `try`, incluida la sesión: si la base no responde, la acción
contesta en llano en vez de tirar):

```ts
"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { almacenDesdeEntorno } from "@/lib/contenido/almacen";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import { leerImagen } from "@/lib/contenido/imagen";

// Sube una foto desde el formulario (SPEC §4.4). Empieza por la sesión, como
// toda Server Action del admin (AGENTS.md §12); el tipo se verifica por los
// bytes, no por la extensión; sin alt no se guarda.

const esquemaSubida = z.object({
  archivo: z.file().max(MAXIMO_BYTES, "La foto pesa más de 4 MB: achicala antes de subirla."),
  alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(200, "El texto alternativo tiene como mucho 200 caracteres."),
});

export type ResultadoDeSubida =
  | { ok: true; foto: { src: string; alt: string; ancho: number; alto: number } }
  | { ok: false; detalle: string };

export async function subirFoto(datos: FormData): Promise<ResultadoDeSubida> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para subir fotos." };

    const entrada = esquemaSubida.safeParse({ archivo: datos.get("archivo"), alt: datos.get("alt") });
    if (!entrada.success) return { ok: false, detalle: entrada.error.issues[0]?.message ?? "Faltan datos de la foto." };

    const bytes = Buffer.from(await entrada.data.archivo.arrayBuffer());
    const imagen = await leerImagen(bytes);
    if (!imagen) return { ok: false, detalle: "El archivo no es una imagen jpg, png o webp." };

    // El mismo id nombra el archivo y la fila: /api/fotos/<id> en local, fotos/<id>.<ext> en Blob.
    const id = randomUUID();
    const { url } = await almacenDesdeEntorno().guardar({ id, tipo: imagen.tipo, bytes });
    await base.foto.create({
      data: { id, url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto, bytes: bytes.byteLength, tipo: imagen.tipo, subidaPor: sesion.user.name },
    });
    return { ok: true, foto: { src: url, alt: entrada.data.alt, ancho: imagen.ancho, alto: imagen.alto } };
  } catch (e) {
    // Si esto tira sin capturar, Next reemplaza el editor por su pantalla de error: mejor un aviso en el campo.
    console.error("subirFoto:", e);
    return { ok: false, detalle: "No se pudo guardar la foto; probá de nuevo en un rato." };
  }
}
```

- [ ] **Step 8: Config y entorno.**

`apps/sitio/.gitignore` — agregar al final:

```gitignore
# Las fotos subidas desde el admin en local (SPEC §4.4). En Vercel van a Blob.
.fotos/
```

`apps/sitio/.env.example` — reemplazar el bloque de Fotos por:

```bash
# --- Fotos (Vercel Blob) ---
# Con el token, las fotos que sube el admin van a Blob. Sin él (local), van a
# apps/sitio/.fotos/ (git-ignorada) y las sirve /api/fotos/<id>.
BLOB_READ_WRITE_TOKEN=
```

`apps/sitio/next.config.ts` — dentro de `nextConfig`, después de `images`:

```ts
  experimental: {
    // Las fotos suben por una Server Action y Next capa el cuerpo en 1 MB
    // por defecto. 5 MB = los 4 MB del tope de la foto (lib/contenido/fotos.ts)
    // más el margen del multipart. Más que eso no tiene sentido: Vercel corta
    // el cuerpo de una función en 4,5 MB. Este corte pasa ANTES de entrar a la
    // acción, por eso el navegador chequea el tamaño antes de mandar.
    serverActions: { bodySizeLimit: "5mb" },
  },
```

- [ ] **Step 9: DECISIONS.** Agregar al final de `work/edicion-de-paginas/DECISIONS.md`:

```markdown
**2026-09-21 — Las fotos pesan hasta 4 MB, no 8.**
Vercel corta el cuerpo de una función en 4,5 MB, Server Actions incluidas: con
el tope del spec, una foto de 6 MB pasa en local y da 413 en producción. Para
las fotos del sitio (webp de 100–300 KB) sobra. El tope se chequea también en
el navegador, porque `bodySizeLimit` corta antes de entrar a la acción y ese
error no lo ve ningún `try` del servidor. Si algún día hace falta más, la
salida es la subida directa desde el navegador (`@vercel/blob/client`).
```

- [ ] **Step 10: Probar a mano la ruta** (con `pnpm dev` levantado, desde bash):

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/fotos/../.env.local
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/fotos/0f0e0d0c-0b0a-4908-8706-050403020100
```

Esperado: `404` y `404` (nada subido todavía; la subida real se prueba en A8
desde el formulario).

- [ ] **Step 11: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/package.json pnpm-lock.yaml apps/sitio/.gitignore apps/sitio/.env.example apps/sitio/next.config.ts apps/sitio/src/lib/contenido/imagen.ts apps/sitio/src/lib/contenido/imagen.test.ts apps/sitio/src/lib/contenido/almacen.ts apps/sitio/src/lib/contenido/almacen.test.ts "apps/sitio/src/app/api/fotos/[id]/route.ts" apps/sitio/src/datos/acciones/fotos.ts work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
feat(fotos): subir fotos al disco o a Blob y servirlas en local

El tipo sale de los bytes (sharp) y no de la extensión; sin alt no se
guarda. Blob con el token de Vercel y la carpeta .fotos/ sin él, con la
misma interfaz, para que lo visual no espere a la cuenta de Vercel.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A4: El registro y el esquema del hero; el hero lee por props

**Files:**
- Create: `apps/sitio/src/features/home/components/hero/geometria-hero.ts`
- Create: `apps/sitio/src/features/home/contenido/hero.ts`
- Create: `apps/sitio/src/contenido/paginas.ts`
- Delete: `apps/sitio/src/features/home/components/hero/hero-cards.ts`
- Modify: `apps/sitio/src/features/home/components/hero/HeroCopy.tsx`
- Modify: `apps/sitio/src/features/home/components/hero/CampoCards.tsx`
- Modify: `apps/sitio/src/features/home/components/hero/CampoCardsMobile.tsx`
- Modify: `apps/sitio/src/features/home/components/Hero.tsx`
- Modify: `apps/sitio/src/features/home/components/HeroQuienes.tsx`
- Modify: `apps/sitio/src/app/(sitio)/page.tsx`

**Interfaces:**
- Consume: `textoCorto`, `foto`, `rutaInterna`, `listaFija`, `grupo` de
  `@/lib/contenido/campos`; `fotoDeRuta`, `estiloDeFoco` de
  `@/lib/contenido/fotos`; `RUTAS_INTERNAS` de `@/config/nav`;
  `RegistroDePaginas` de `@/lib/contenido/documento`.
- Produce (`contenido/hero.ts`): `esquemaHero` (un `z.object`), `type Hero`,
  `heroInicial: Hero`.
- Produce (`geometria-hero.ts`): `type Geometria`, `GEOMETRIA_CARDS` (11),
  `GEOMETRIA_MOBILE` (8).
- Produce (`contenido/paginas.ts`): `PAGINAS`, `type Slug`, `SLUGS: Slug[]`,
  `esSlug(valor: string): valor is Slug`, `type ContenidoDe<S extends Slug>`
  (para `"inicio"` es `{ hero: Hero }`).
- Produce (componentes): `HeroQuienes({ hero: Hero })`, `Hero({ contenido: Hero })`,
  `HeroCopy({ contenido })`, `CampoCards({ tarjetas })`, `CampoCardsMobile({ tarjetas })`.

- [ ] **Step 1: La foto del «antes».** Antes de tocar nada, un build del
sitio tal cual está, guardado afuera del repo para compararlo al final:

```bash
pnpm build > /dev/null 2>&1 && echo build ok
rm -rf ../ed-render-antes && mkdir -p ../ed-render-antes/.next
cp -r apps/sitio/.next/server ../ed-render-antes/.next/server
cp -r apps/sitio/.next/static ../ed-render-antes/.next/static
ls ../ed-render-antes/.next/server/app | head -n 5
```

Esperado: `build ok` y una lista con `index.html` entre otros. Si el build
falla acá, el problema es previo a esta tarea. La carpeta la usan el paso 12
de esta tarea y A5.13: si A5 corre en otra sesión o máquina y no está, se
rehace desde `main` con estos mismos comandos (`git stash` o un worktree de
`main`, build, copiar, volver).

- [ ] **Step 2: La geometría** `apps/sitio/src/features/home/components/hero/geometria-hero.ts`
(los números son los de `hero-cards.ts`, sin las fotos):

```ts
/**
 * La geometría del campo de tarjetas del hero: dónde va cada una, de qué
 * tamaño y con qué parallax. Es estructura, no contenido: vive en código y no
 * se edita desde el admin (SPEC §1). Las fotos y los carteles están en
 * `features/home/contenido/hero.ts`, en el mismo orden; la cantidad de
 * tarjetas del esquema sale del largo de estas listas.
 *
 * Réplica del campo de imágenes de blueprintapps.io: medidas del original
 * como fracción del viewport (su rem = 100vw/1728), sin rotación.
 */
export type Geometria = {
  /** ancho como % del viewport (designRem / 1728 * 100). */
  w: number;
  /** relación de aspecto ancho/alto (CSS aspect-ratio). */
  ar: string;
  /** centro X como % del ancho del hero. */
  cx: number;
  /** centro Y: % del alto del hero en desktop, svh en mobile. */
  cy: number;
  /** factor de parallax de scroll medido en el original (>1 = adelanta). */
  par: number;
};

// Desktop (≥ lg): las 9 del original más dos sumadas para llenar el vacío de
// abajo y "bajar" hacia Acerca de.
export const GEOMETRIA_CARDS: readonly Geometria[] = [
  { w: 17.36, ar: "300 / 250", cx: 31.25, cy: 7.1, par: 1.027 },
  { w: 12.73, ar: "220 / 280", cx: 81.6, cy: 16.07, par: 1.108 },
  { w: 13.89, ar: "240 / 320", cx: 93.75, cy: 26.85, par: 1.014 },
  { w: 12.73, ar: "220 / 260", cx: 5.21, cy: 25.01, par: 1.068 },
  { w: 16.2, ar: "280 / 240", cx: 16.2, cy: 44.61, par: 1.034 },
  { w: 19.68, ar: "340 / 260", cx: 72.92, cy: 55.71, par: 1.007 },
  { w: 14.47, ar: "250 / 320", cx: 24.59, cy: 71.16, par: 1.088 },
  { w: 19.68, ar: "340 / 250", cx: 53.24, cy: 84.82, par: 1.024 },
  { w: 9.84, ar: "170 / 230", cx: 85.94, cy: 93.84, par: 1.068 },
  { w: 14, ar: "300 / 210", cx: 50, cy: 64, par: 1.04 },
  { w: 13, ar: "240 / 300", cx: 11, cy: 84, par: 1.07 },
];

// Mobile/tablet (< lg): pocas fotos, ENTERAS dentro de la pantalla. `cx`
// hacia adentro (25/75) y el ancho clampeado en el componente garantizan que
// cada una entre completa de 320 a 1023 px. `cy` va en svh y no en %: así la
// posición vertical no depende del alto total del hero. Las cuatro primeras
// quedan en el primer pantallazo, en las bandas libres; las otras cuatro se
// ven al scrollear, ya asentadas.
export const GEOMETRIA_MOBILE: readonly Geometria[] = [
  { w: 38, ar: "300 / 250", cx: 25, cy: 22, par: 1 },
  { w: 34, ar: "300 / 230", cx: 75, cy: 22, par: 1 },
  { w: 38, ar: "280 / 240", cx: 25, cy: 87, par: 1 },
  { w: 40, ar: "340 / 260", cx: 75, cy: 87, par: 1 },
  { w: 42, ar: "340 / 250", cx: 31, cy: 112, par: 1 },
  { w: 34, ar: "250 / 320", cx: 73, cy: 117, par: 1 },
  { w: 38, ar: "240 / 300", cx: 28, cy: 139, par: 1 },
  { w: 42, ar: "300 / 210", cx: 72, cy: 143, par: 1 },
];
```

- [ ] **Step 3: El esquema y el contenido de hoy** `apps/sitio/src/features/home/contenido/hero.ts`
(los textos y las fotos son los que el sitio muestra hoy, copiados de
`HeroCopy.tsx` y `hero-cards.ts`; medidos: título 56/60, bajada 130/140):

```ts
import { z } from "zod";
import { RUTAS_INTERNAS } from "@/config/nav";
import { foto, grupo, listaFija, rutaInterna, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { GEOMETRIA_CARDS, GEOMETRIA_MOBILE } from "../components/hero/geometria-hero";

// El hero de Inicio: lo que se edita (SPEC §4.1) y lo que se ve sin base. La
// cantidad de tarjetas sale de la geometría para que las dos listas no se
// desfasen nunca.

const boton = (etiqueta: string) =>
  grupo({ texto: textoCorto({ maximo: 18, etiqueta: "Texto" }), ruta: rutaInterna(RUTAS_INTERNAS, { etiqueta: "Adónde lleva" }) }, { etiqueta });

const tarjeta = grupo({
  foto: foto({ etiqueta: "Foto" }),
  cartel: grupo(
    { titulo: textoCorto({ maximo: 24, etiqueta: "Título" }), descripcion: textoCorto({ maximo: 48, etiqueta: "Descripción" }) },
    { etiqueta: "Cartel", ayuda: "Flota sobre la foto: dos o tres palabras y una frase corta." },
  ).nullable(),
});

export const esquemaHero = z.object({
  titulo: textoCorto({ maximo: 60, etiqueta: "Título", ayuda: "Dos renglones en pantalla. Se anima palabra por palabra y la última va en verde." }),
  bajada: textoCorto({ maximo: 140, etiqueta: "Bajada" }),
  botonPrincipal: boton("Botón principal (naranja)"),
  botonSecundario: boton("Botón secundario"),
  tarjetas: listaFija(GEOMETRIA_CARDS.length, tarjeta, {
    etiqueta: "Tarjetas (computadora)",
    etiquetaDelItem: "Tarjeta",
    ayuda: `Son ${GEOMETRIA_CARDS.length} tarjetas: la escena del hero está armada para once. Seis llevan cartel (la 1, 3, 5, 6, 8 y 11).`,
  }),
  tarjetasCelular: listaFija(GEOMETRIA_MOBILE.length, grupo({ foto: foto({ etiqueta: "Foto" }) }), {
    etiqueta: "Tarjetas (celular)",
    etiquetaDelItem: "Tarjeta",
    ayuda: `Son ${GEOMETRIA_MOBILE.length} tarjetas: en el celular la escena muestra ocho, casi todas repetidas de las de computadora.`,
  }),
});

export type Hero = z.infer<typeof esquemaHero>;

/** El contenido de hoy, tal cual está en el sitio: lo que se ve sin base y lo que se carga la primera vez. */
export const heroInicial: Hero = {
  titulo: "La transformación educativa comienza en las matemáticas.",
  bajada: "Escuchamos cada realidad y diseñamos soluciones educativas a medida, con base en la investigación y más de 15 años de experiencia.",
  // La acción principal al final del recorrido del ojo, y del lado en que el navbar tiene Contacto (Gastón, 2026-09-11).
  botonPrincipal: { texto: "Contactanos", ruta: "/contacto" },
  botonSecundario: { texto: "Qué hacemos", ruta: "/que-hacemos" },
  // Las fotos son de la carpeta que aprobó ED (`public/fotos/`), en el orden de GEOMETRIA_CARDS.
  tarjetas: [
    { foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula"), cartel: { titulo: "En el aula", descripcion: "Acompañamos el aprendizaje donde sucede" } },
    { foto: fotoDeRuta("/fotos/globos-medicion.webp", "Docentes miden alturas con globos durante un taller"), cartel: null },
    { foto: fotoDeRuta("/fotos/exposicion-grafica.webp", "Una formadora señala una gráfica durante una clase"), cartel: { titulo: "Investigación aplicada", descripcion: "Conocimiento que vuelve al aula" } },
    { foto: fotoDeRuta("/fotos/materiales-sobre-la-mesa.webp", "Estudiantes trabajan con papeles de colores sobre una mesa"), cartel: null },
    { foto: fotoDeRuta("/fotos/formadora-guia-taller.webp", "Una formadora guía a docentes durante un taller"), cartel: { titulo: "Acompañamiento situado", descripcion: "Junto a cada docente y escuela" } },
    { foto: fotoDeRuta("/fotos/encuentro-mesas-rojas.webp", "Encuentro de formación docente con mesas de trabajo"), cartel: { titulo: "Formación docente", descripcion: "Trayectos para docentes de matemáticas" } },
    { foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda"), cartel: null },
    { foto: fotoDeRuta("/fotos/encuentro-institucional.webp", "Docentes e instituciones reunidas en un encuentro en México"), cartel: { titulo: "Presencia regional", descripcion: "Chile · México · Argentina · Colombia · Brasil" } },
    { foto: fotoDeRuta("/fotos/formadora-sentada-grupo.webp", "Una formadora trabaja sentada junto a un grupo"), cartel: null },
    { foto: fotoDeRuta("/fotos/mesa-con-materiales.webp", "Docentes trabajan con materiales alrededor de una mesa"), cartel: null },
    { foto: fotoDeRuta("/fotos/cubos-dos-manos.webp", "Dos cubos de papel armados, uno en cada mano"), cartel: { titulo: "Materiales propios", descripcion: "Recursos listos para llevar al aula" } },
  ],
  // En el orden de GEOMETRIA_MOBILE. Solo `comparar-tareas-ronda` es exclusiva del celular.
  tarjetasCelular: [
    { foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula") },
    { foto: fotoDeRuta("/fotos/comparar-tareas-ronda.webp", "Docentes en ronda comparan dos tareas") },
    { foto: fotoDeRuta("/fotos/formadora-guia-taller.webp", "Una formadora guía a docentes durante un taller") },
    { foto: fotoDeRuta("/fotos/encuentro-mesas-rojas.webp", "Encuentro de formación docente con mesas de trabajo") },
    { foto: fotoDeRuta("/fotos/encuentro-institucional.webp", "Docentes e instituciones reunidas en un encuentro en México") },
    { foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda") },
    { foto: fotoDeRuta("/fotos/cubos-dos-manos.webp", "Dos cubos de papel armados") },
    { foto: fotoDeRuta("/fotos/mesa-con-materiales.webp", "Docentes trabajan con materiales alrededor de una mesa") },
  ],
};
```

- [ ] **Step 4: Comprobar que el inicial pasa su propio esquema** (sin test
permanente: es un dato, no lógica; desde `apps/sitio`):

```bash
cd apps/sitio && pnpm exec tsx -e "import { esquemaHero, heroInicial } from './src/features/home/contenido/hero'; const r = esquemaHero.safeParse(heroInicial); console.log(r.success ? 'inicial ok' : JSON.stringify(r.error.issues, null, 2));" && cd ../..
```

Esperado: `inicial ok`.

- [ ] **Step 5: El registro** `apps/sitio/src/contenido/paginas.ts`:

```ts
import type { z } from "zod";
import { esquemaHero, heroInicial } from "@/features/home/contenido/hero";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

// Qué secciones tiene cada página y en qué orden (SPEC §4.1). Es lo que el
// admin recorre para armar la pantalla y lo que datos/ usa para validar.
// Sumar una sección al admin es escribir su esquema en
// features/<pagina>/contenido/ y anotarla acá. Las siete páginas están desde
// ya, en el orden del menú; las que no tienen secciones aparecen en la lista
// del admin como «todavía no se edita».

export const PAGINAS = {
  inicio: { ruta: "/", nombre: "Inicio", secciones: { hero: { nombre: "Hero", esquema: esquemaHero, inicial: heroInicial } } },
  "que-hacemos": { ruta: "/que-hacemos", nombre: "Qué hacemos", secciones: {} },
  "quienes-somos": { ruta: "/quienes-somos", nombre: "Quiénes somos", secciones: {} },
  investigacion: { ruta: "/investigacion", nombre: "Investigación", secciones: {} },
  biblioteca: { ruta: "/biblioteca", nombre: "Biblioteca", secciones: {} },
  novedades: { ruta: "/novedades", nombre: "Novedades", secciones: {} },
  contacto: { ruta: "/contacto", nombre: "Contacto", secciones: {} },
} satisfies RegistroDePaginas;

export type Slug = keyof typeof PAGINAS;

// Object.keys devuelve string[]: el `as` recupera las claves literales del registro, que son exactamente esas.
export const SLUGS = Object.keys(PAGINAS) as Slug[];

export function esSlug(valor: string): valor is Slug {
  return SLUGS.some((slug) => slug === valor);
}

type Secciones<S extends Slug> = (typeof PAGINAS)[S]["secciones"];

/** El contenido tipado de una página: `ContenidoDe<"inicio">` es `{ hero: Hero }`. */
export type ContenidoDe<S extends Slug> = {
  [K in keyof Secciones<S>]: Secciones<S>[K] extends { esquema: infer E extends z.ZodType } ? z.output<E> : never;
};
```

- [ ] **Step 6: `HeroCopy` recibe el texto** — `apps/sitio/src/features/home/components/hero/HeroCopy.tsx`
queda así (el halo y las clases no cambian; el `h1` se arma con `split(/s+/)`,
la última palabra lleva el acento como hoy):

```tsx
import { Fragment } from "react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { Hero } from "@/features/home/contenido/hero";

type Props = { contenido: Pick<Hero, "titulo" | "bajada" | "botonPrincipal" | "botonSecundario"> };

/**
 * Contenido CENTRADO en el primer viewport (se va con el scroll): halo de
 * legibilidad, titular palabra por palabra, descripción y acciones. Todo
 * entra por data-attributes desde la coreografía del hero. El texto llega por
 * props: es lo que se edita desde el admin.
 */
export function HeroCopy({ contenido }: Props) {
  // Cada palabra es un <span data-hero-word> para animarla; la última lleva
  // el acento verde (data-hero-accent): es la que remata la frase. Se parte
  // por cualquier espacio: dos seguidos no dejan un span vacío.
  const palabras = contenido.titulo.split(/s+/);
  return (
    <div
      data-hero-copy-scroll
      className="absolute inset-x-0 top-0 z-20 flex h-screen flex-col items-center justify-center px-5 text-center md:px-10"
    >
      {/* Halo blanco suave detrás del texto central (solo desktop ≥ lg). En
          desktop angosto el scatter se acerca al copy; este velo difumina SOLO
          las fotos que quedan detrás de las palabras (las de los costados se
          ven igual) y deja el texto flotando limpio sin reubicar las cards.
          Vive dentro del copy → se desvanece con el scroll junto al texto. En
          mobile el scatter va en bandas que no tocan el centro → no se monta. */}
      <span
        data-hero-halo
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden h-[clamp(26rem,80vh,36rem)] w-[clamp(30rem,62vw,52rem)] -translate-x-1/2 -translate-y-[45%] lg:block"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.9) 46%, rgba(255,255,255,0) 78%)",
        }}
      />
      <div data-hero-copy className="mx-auto max-w-2xl translate-y-[5vh]">
        <h1
          data-hero-headline
          className="font-display font-bold text-balance tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.85rem, 1rem + 2.4vw, 2.7rem)", lineHeight: 1.12 }}
        >
          {palabras.map((palabra, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              {i === palabras.length - 1 ? (
                <span data-hero-word data-hero-accent className="text-verde-concepto inline-block">
                  {palabra}
                </span>
              ) : (
                <span data-hero-word className="inline-block">
                  {palabra}
                </span>
              )}
            </Fragment>
          ))}
        </h1>

        <p
          data-hero-desc
          className="text-gris-texto mx-auto mt-6 max-w-[40rem] text-balance font-sans text-[1.02rem] leading-relaxed md:text-[1.12rem]"
        >
          {contenido.bajada}
        </p>

        <div
          data-hero-actions
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {/* La acción principal al final del recorrido del ojo, y del lado
              en que el navbar tiene Contacto (Gastón, 2026-09-11). */}
          <ButtonSecondary href={contenido.botonSecundario.ruta}>{contenido.botonSecundario.texto}</ButtonSecondary>
          <ButtonPrimary href={contenido.botonPrincipal.ruta}>{contenido.botonPrincipal.texto}</ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: `CampoCards` recibe las tarjetas** — `apps/sitio/src/features/home/components/hero/CampoCards.tsx`
queda así (desaparece la rama del cuadrado de marca: hoy las once tienen foto
y el esquema exige `src`):

```tsx
import Image from "next/image";
import type { Hero } from "@/features/home/contenido/hero";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { GEOMETRIA_CARDS } from "./geometria-hero";

/**
 * Campo de tarjetas dispersas (desktop, ≥ lg). Tres capas por tarjeta:
 * `[data-card-outer]` (posición + parallax de scroll), `[data-card-mouse]`
 * (parallax de mouse por profundidad) y `[data-card-inner]` (la entrada).
 * La geometría vive en código; foto y cartel llegan por props, en el mismo
 * orden.
 */
export function CampoCards({ tarjetas }: { tarjetas: Hero["tarjetas"] }) {
  return (
    <div
      data-hero-cards
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
    >
      {GEOMETRIA_CARDS.map((c, i) => {
        const tarjeta = tarjetas[i];
        // El esquema garantiza once; el chequeo es por si alguna vez llega un documento a medias.
        if (!tarjeta) return null;
        // Profundidad del mouse-parallax: más grande = más cerca = se mueve más
        // (negativo = en contra del mouse), igual que la referencia.
        const depth = -Math.round(c.w * 2);
        return (
          <div
            key={i}
            data-card-outer
            data-par={c.par}
            className="absolute"
            style={{ left: `${c.cx}%`, top: `${c.cy}%`, width: `${c.w}vw`, transform: "translate(-50%, -50%)" }}
          >
            <div
              data-card-mouse
              style={{ transform: `translate(calc(var(--pnx, 0) * ${depth}px), calc(var(--pny, 0) * ${depth}px))` }}
            >
              <div data-card-inner className="relative">
                <div
                  className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
                  style={{ aspectRatio: c.ar }}
                >
                  {/* Sin style cuando el foco está en el centro: el HTML de hoy queda igual. */}
                  <Image
                    src={tarjeta.foto.src}
                    alt={tarjeta.foto.alt}
                    fill
                    sizes="22vw"
                    className="object-cover"
                    style={estiloDeFoco(tarjeta.foto.foco)}
                  />
                </div>

                {/* Cartel referencial (tipo web de referencia): sobresale del
                    borde inferior para "rellenar" el hueco al scrollear. */}
                {tarjeta.cartel && (
                  <div
                    data-card-label
                    className="absolute -bottom-5 left-3 z-10 w-max max-w-[20rem] rounded-xl bg-white/85 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 ring-azul-principal/10 backdrop-blur-md"
                  >
                    <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                      {tarjeta.cartel.titulo}
                    </p>
                    <p className="text-gris-texto mt-0.5 font-sans text-[0.72rem] leading-snug whitespace-nowrap">
                      {tarjeta.cartel.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8: `CampoCardsMobile` recibe las tarjetas** — `apps/sitio/src/features/home/components/hero/CampoCardsMobile.tsx`:

```tsx
import Image from "next/image";
import type { Hero } from "@/features/home/contenido/hero";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { GEOMETRIA_MOBILE } from "./geometria-hero";

/**
 * Campo CURADO para mobile/tablet (< lg): pocas fotos clave, ENTERAS dentro de
 * la pantalla (no asoman cortadas). DOS CAPAS para tener la MISMA animación de
 * deploy que el desktop SIN el bug de transforms:
 *  · SLOT (el div exterior): posición + centrado por CSS `translate(-50%,-50%)`.
 *    GSAP NUNCA lo toca → la foto queda exacta en su cx/cy.
 *  · ANIM ([data-mcard]): GSAP la anima con x/y/scale PURO (stack→deploy), sin
 *    transform inline de React → sin conflicto ni doble-centrado.
 * Ancho clampeado (no se dispara en tablet) y cx hacia adentro (25/75) para que
 * cada foto entre completa. Las fotos llegan por props, en el orden de la
 * geometría.
 */
export function CampoCardsMobile({ tarjetas }: { tarjetas: Hero["tarjetasCelular"] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 block lg:hidden"
    >
      {GEOMETRIA_MOBILE.map((c, i) => {
        const tarjeta = tarjetas[i];
        if (!tarjeta) return null;
        return (
          <div
            key={`m${i}`}
            className="absolute"
            style={{
              left: `${c.cx}%`,
              top: `${c.cy}svh`,
              width: `clamp(6rem, ${c.w}vw, 16rem)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div data-mcard>
              <div
                className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
                style={{ aspectRatio: c.ar }}
              >
                <Image
                  src={tarjeta.foto.src}
                  alt={tarjeta.foto.alt}
                  fill
                  sizes="45vw"
                  className="object-cover"
                  style={estiloDeFoco(tarjeta.foto.foco)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 9: `Hero` y `HeroQuienes` pasan el contenido.**

En `apps/sitio/src/features/home/components/Hero.tsx`: sumar el import de tipo
(después del de `useMouseParallax`), reemplazar la firma y las tres piezas, y
actualizar el párrafo «Piezas:» del comentario.

```ts
import type { Hero as ContenidoDelHero } from "@/features/home/contenido/hero";
```

```tsx
 * Piezas: geometría en `hero/geometria-hero.ts`, coreografía en
 * `hero/coreografia-hero.ts` (+ `entrada-hero.ts`), campos en `CampoCards` /
 * `CampoCardsMobile`, copy en `HeroCopy`. El contenido (textos, fotos y
 * carteles) llega por props desde `features/home/contenido/hero.ts` o desde la
 * base. Este compositor arma la sección y dispara la coreografía desde el
 * layout effect.
 */
export function Hero({ contenido }: { contenido: ContenidoDelHero }) {
```

```tsx
      <CampoCards tarjetas={contenido.tarjetas} />
      <CampoCardsMobile tarjetas={contenido.tarjetasCelular} />
      <HeroCopy contenido={contenido} />
```

En `apps/sitio/src/features/home/components/HeroQuienes.tsx`: el import de
tipo después del de `useReducedMotion`, la firma y el uso de `<Hero />`:

```ts
import type { Hero as ContenidoDelHero } from "@/features/home/contenido/hero";
```

```tsx
export function HeroQuienes({ hero }: { hero: ContenidoDelHero }) {
```

```tsx
      {/* Hero — scrollea normal (sin slide). */}
      <div className="relative z-10">
        <Hero contenido={hero} />
      </div>
```

- [ ] **Step 10: `page.tsx` pasa el inicial (por ahora).** En
`apps/sitio/src/app/(sitio)/page.tsx`, el import (primero de los internos) y
el uso; en A5 el inicial se reemplaza por `contenidoDe("inicio")`:

```ts
import { heroInicial } from "@/features/home/contenido/hero";
```

```tsx
      <HeroQuienes hero={heroInicial} />
```

- [ ] **Step 11: Borrar `hero-cards.ts`** y comprobar que nadie más lo usaba:

```bash
git rm -q apps/sitio/src/features/home/components/hero/hero-cards.ts
grep -rn "hero-cards" apps/sitio/src || echo "sin referencias"
```

Esperado: `sin referencias`.

- [ ] **Step 12: El sitio quedó igual** — gates, build y la comparación con
el «antes» del paso 1:

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
pnpm build > /dev/null 2>&1 && node scripts/comparar-render.mjs ../ed-render-antes apps/sitio
```

Esperado: cada página «igual» y la última línea `N páginas, render idéntico.`
(los bytes de los activos pueden variar; el script los informa y no frena).
Si `index.html` sale «DISTINTA en texto», comparar a ojo los dos HTML
(`../ed-render-antes/.next/server/app/index.html` contra
`apps/sitio/.next/server/app/index.html`): la causa típica es un espacio de
más entre palabras del título o un alt cambiado.

- [ ] **Step 13: Commits** (con OK; dos, porque son dos cambios)

```bash
git add apps/sitio/src/features/home/components/hero/geometria-hero.ts apps/sitio/src/features/home/contenido/hero.ts apps/sitio/src/contenido/paginas.ts
git commit -F - <<'MSG'
feat(contenido): el esquema del hero, su contenido inicial y el registro

Lo que se edita del hero y lo que se ve sin base, en un solo lugar; la
geometría queda en código porque es estructura, no contenido. El
registro dice qué secciones tiene cada página y en qué orden.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
git add apps/sitio/src/features/home/components/hero/HeroCopy.tsx apps/sitio/src/features/home/components/hero/CampoCards.tsx apps/sitio/src/features/home/components/hero/CampoCardsMobile.tsx apps/sitio/src/features/home/components/Hero.tsx apps/sitio/src/features/home/components/HeroQuienes.tsx "apps/sitio/src/app/(sitio)/page.tsx" apps/sitio/src/features/home/components/hero/hero-cards.ts
git commit -F - <<'MSG'
refactor(hero): el hero recibe su contenido por props

features/ no cambia de contrato ni importa datos/: el texto, las fotos
y los carteles entran por props y hero-cards.ts desaparece (una sola
fuente de verdad). El render prerenderizado quedó idéntico.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A5: Leer y escribir

**Files:**
- Create: `apps/sitio/src/lib/contenido/tiempo.ts`
- Test: `apps/sitio/src/lib/contenido/tiempo.test.ts`
- Create: `apps/sitio/src/datos/acciones/editar-paginas.ts`
- Test: `apps/sitio/src/datos/acciones/editar-paginas.test.ts`
- Create: `apps/sitio/src/datos/acciones/paginas.ts`
- Create: `apps/sitio/src/datos/acciones/vista-previa.ts`
- Create: `apps/sitio/src/datos/acciones/salir-de-vista-previa.ts`
- Create: `apps/sitio/src/datos/consultas/paginas.ts`
- Create: `apps/sitio/src/datos/consultas/editor-de-paginas.ts`
- Modify: `apps/sitio/src/app/(sitio)/page.tsx`
- Modify: `work/edicion-de-paginas/DECISIONS.md` (una entrada)

**Interfaces:**
- Consume: `PAGINAS`, `SLUGS`, `Slug`, `ContenidoDe` de `@/contenido/paginas`;
  `comoDocumento`, `completarPagina`, `RegistroDePaginas`, `PaginaRegistrada`,
  `SeccionRegistrada` de `@/lib/contenido/documento`; `describir` de
  `@/lib/contenido/describir`; `Descripcion` de `@/lib/contenido/descripcion`;
  `RUTAS_INTERNAS` de `@/config/nav`; `base`, `auth`; los tipos `Pagina`,
  `PrismaClient` y el namespace `Prisma` del cliente generado.
- Produce (`tiempo.ts`): `haceCuanto(desde: Date, ahora?: Date): string`,
  `fechaYHora(iso: string, zona?: string): string`.
- Produce (`editar-paginas.ts`): `guardarBorradorEnBase(base, { slug, seccion, contenido, borradorEnVisto, quien }, registro?)`,
  `publicarEnBase(base, { slug, quien }, registro?)`, `descartarBorradorEnBase(base, slug)`,
  y los tipos `ResultadoDeGuardar = { ok: true; borradorEn: string; borradorPor: string } | { ok: false; detalle: string }`,
  `ResultadoDePublicar = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; ruta: string } | { ok: false; detalle: string }`.
- Produce (`acciones/paginas.ts`, Server Actions): `guardarBorrador({ slug, seccion, contenido, borradorEnVisto })`,
  `publicar(slug)`, `descartarBorrador(slug)`.
- Produce (`acciones/vista-previa.ts`, Server Action con sesión): `abrirVistaPrevia(slug): Promise<{ ok: true; url: string } | { ok: false; detalle: string }>`.
- Produce (`acciones/salir-de-vista-previa.ts`, Server Action **sin** sesión ni
  `datos/auth`: la importa el layout del sitio): `salirDeVistaPrevia(datos: FormData): Promise<void>`.
- Produce (`consultas/paginas.ts`): `contenidoDe<S extends Slug>(slug: S): Promise<ContenidoDe<S>>`.
- Produce (`consultas/editor-de-paginas.ts`): `listaDePaginas(): Promise<FilaDeLista[]>`,
  `paginaParaEditar(slug: Slug): Promise<PaginaParaEditar>`, y los tipos
  `FilaDeLista = { slug: Slug; nombre; ruta; editable: boolean; sinPublicar: boolean; publicadoEn: string | null; publicadoPor: string | null }`,
  `PaginaParaEditar = { slug: Slug; nombre; ruta; estado: { borradorEn; borradorPor; publicadoEn; publicadoPor } (string | null cada uno); secciones: Array<{ clave; nombre; descripcion: Descripcion; contenido: unknown }> }`.

- [ ] **Step 1: El test del tiempo** `apps/sitio/src/lib/contenido/tiempo.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fechaYHora, haceCuanto } from "./tiempo";

const AHORA = new Date("2026-09-21T14:05:00.000Z");
const hace = (segundos: number) => new Date(AHORA.getTime() - segundos * 1000);

test("haceCuanto habla como una persona", () => {
  assert.equal(haceCuanto(hace(20), AHORA), "hace un momento");
  assert.equal(haceCuanto(hace(60), AHORA), "hace 1 minuto");
  assert.equal(haceCuanto(hace(150), AHORA), "hace 3 minutos");
  assert.equal(haceCuanto(hace(2 * 3600), AHORA), "hace 2 horas");
  assert.equal(haceCuanto(hace(5 * 86400), AHORA), "hace 5 días");
});

test("fechaYHora en la zona pedida", () => {
  assert.equal(fechaYHora("2026-09-21T14:05:00.000Z", "UTC"), "21/9 a las 14:05");
  assert.equal(fechaYHora("2026-09-21T14:05:00.000Z", "America/Argentina/Buenos_Aires"), "21/9 a las 11:05");
});
```

- [ ] **Step 2: Verlo fallar; después** `apps/sitio/src/lib/contenido/tiempo.ts`:

```ts
// Fechas en llano para el admin. Sin dominio de ED.

/** «21/9 a las 14:05». Sin zona usa la de quien corre el código: en el navegador, la de la persona. */
export function fechaYHora(iso: string, zona?: string): string {
  const fecha = new Date(iso);
  const dia = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "numeric", timeZone: zona }).format(fecha);
  const hora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zona }).format(fecha);
  return `${dia} a las ${hora}`;
}

/** «hace un momento», «hace 3 minutos», «hace 2 horas», «hace 5 días». */
export function haceCuanto(desde: Date, ahora: Date = new Date()): string {
  const segundos = Math.max(0, Math.round((ahora.getTime() - desde.getTime()) / 1000));
  if (segundos < 60) return "hace un momento";
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}
```

`pnpm --filter sitio test` → en verde.

- [ ] **Step 3: El test de integración** `apps/sitio/src/datos/acciones/editar-paginas.test.ts`
(contra el Postgres local, con un slug de prueba que no existe en el registro
y un registro falso inyectado; se borra al final):

```ts
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const SLUG = "prueba-edicion";
const registro: RegistroDePaginas = {
  [SLUG]: {
    ruta: "/prueba-edicion",
    nombre: "Prueba",
    secciones: {
      bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "Inicial" } },
    },
  },
};

test("guardar, chocar, publicar y descartar", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase } = await import("./editar-paginas");
  await base.pagina.deleteMany({ where: { slug: SLUG } });

  // Sin fila: el primer guardado la crea.
  const r1 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Uno" }, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r1.ok, true);
  if (!r1.ok) return;
  assert.equal(r1.borradorPor, "Gastón");

  // Otra pantalla que abrió antes (vio null) no pisa: avisa quién guardó.
  const choque = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Dos" }, borradorEnVisto: null, quien: "Raquel" }, registro);
  assert.equal(choque.ok, false);
  if (choque.ok) return;
  assert.match(choque.detalle, /Gastón guardó este borrador hace un momento/);

  // Con el borradorEn correcto sí guarda; un contenido inválido no.
  const invalido = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "" }, borradorEnVisto: r1.borradorEn, quien: "Raquel" }, registro);
  assert.equal(invalido.ok, false);
  if (invalido.ok) return;
  assert.match(invalido.detalle, /vacío/);
  const r2 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Dos" }, borradorEnVisto: r1.borradorEn, quien: "Raquel" }, registro);
  assert.equal(r2.ok, true);

  // Publicar copia el borrador y lo deja en null.
  const pub = await publicarEnBase(base, { slug: SLUG, quien: "Raquel" }, registro);
  assert.equal(pub.ok, true);
  if (!pub.ok) return;
  assert.equal(pub.ruta, "/prueba-edicion");
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.publicado, { bloque: { titulo: "Dos" } });
  assert.equal(fila?.publicadoPor, "Raquel");
  assert.equal(fila?.borrador, null);
  assert.equal(fila?.borradorEn, null);

  // Sin borrador no hay nada que publicar; un borrador nuevo se descarta y vuelve a null.
  assert.equal((await publicarEnBase(base, { slug: SLUG, quien: "Raquel" }, registro)).ok, false);
  const r3 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Tres" }, borradorEnVisto: null, quien: "Daniela" }, registro);
  assert.equal(r3.ok, true);
  assert.equal((await descartarBorradorEnBase(base, SLUG)).ok, true);
  const despues = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.equal(despues?.borrador, null);
  assert.deepEqual(despues?.publicado, { bloque: { titulo: "Dos" } });
});

test("una página o sección que no está en el registro no se guarda", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const r = await guardarBorradorEnBase(base, { slug: "no-existe", seccion: "bloque", contenido: {}, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r.ok, false);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  await base.$disconnect();
});
```

- [ ] **Step 4: Verlo fallar; después la lógica** `apps/sitio/src/datos/acciones/editar-paginas.ts`:

```ts
import { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { comoDocumento, type PaginaRegistrada, type RegistroDePaginas, type SeccionRegistrada } from "@/lib/contenido/documento";
import { haceCuanto } from "@/lib/contenido/tiempo";

// Lo que hace cada acción del editor en la base (SPEC §7), con el cliente y
// el registro inyectados para probarlo contra el Postgres local. Las Server
// Actions de paginas.ts verifican la sesión y llaman acá. Publicar y
// descartar dejan `borrador` en null: «no hay borrador» quiere decir «el
// borrador es lo publicado» (DECISIONS, 4).

type Fila = { borrador: unknown; publicado: unknown; borradorEn: Date | null; borradorPor: string | null };

export type ResultadoDeGuardar = { ok: true; borradorEn: string; borradorPor: string } | { ok: false; detalle: string };
export type ResultadoDePublicar =
  | { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; ruta: string }
  | { ok: false; detalle: string };

/** El primer problema de Zod, en llano y con el camino al campo. */
function primerProblema(error: z.ZodError): string {
  const [problema] = error.issues;
  const donde = problema && problema.path.length > 0 ? ` (en ${problema.path.map(String).join(" › ")})` : "";
  return `${problema?.message ?? "Hay un dato que no pasa."}${donde}`;
}

function mensajeDeConflicto(fila: Fila | null): string {
  if (fila?.borradorEn) {
    return `${fila.borradorPor ?? "Alguien"} guardó este borrador ${haceCuanto(fila.borradorEn)}. Recargá para ver sus cambios antes de guardar los tuyos.`;
  }
  return "Este borrador se publicó o se descartó desde que abriste la página. Recargá para seguir.";
}

export async function guardarBorradorEnBase(
  base: PrismaClient,
  { slug, seccion, contenido, borradorEnVisto, quien }: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDeGuardar> {
  const pagina: PaginaRegistrada | undefined = registro[slug];
  const definicion: SeccionRegistrada | undefined = pagina?.secciones[seccion];
  if (!definicion) return { ok: false, detalle: "Esa página o esa sección no se editan desde acá." };
  const valido = definicion.esquema.safeParse(contenido);
  if (!valido.success) return { ok: false, detalle: primerProblema(valido.error) };

  const fila = await base.pagina.findUnique({ where: { slug } });
  if ((fila?.borradorEn?.toISOString() ?? null) !== borradorEnVisto) return { ok: false, detalle: mensajeDeConflicto(fila) };

  // El borrador arranca como copia de lo publicado: así las otras secciones
  // viajan con él y publicar no las pierde. El `as` vale porque el documento
  // es JSON válido: salió de Zod o de la misma columna.
  const documento = { ...comoDocumento(fila?.borrador ?? fila?.publicado), [seccion]: valido.data } as Prisma.InputJsonObject;
  const ahora = new Date();
  const datos = { borrador: documento, borradorEn: ahora, borradorPor: quien };
  if (!fila) {
    await base.pagina.create({ data: { slug, ...datos } });
  } else {
    // La condición sobre borradorEn hace que dos guardados a la vez no se
    // pisen: el segundo no encuentra la fila y avisa.
    const { count } = await base.pagina.updateMany({ where: { slug, borradorEn: fila.borradorEn }, data: datos });
    if (count === 0) return { ok: false, detalle: mensajeDeConflicto(await base.pagina.findUnique({ where: { slug } })) };
  }
  return { ok: true, borradorEn: ahora.toISOString(), borradorPor: quien };
}

export async function publicarEnBase(
  base: PrismaClient,
  { slug, quien }: { slug: string; quien: string },
  registro: RegistroDePaginas = PAGINAS,
): Promise<ResultadoDePublicar> {
  const pagina: PaginaRegistrada | undefined = registro[slug];
  if (!pagina) return { ok: false, detalle: "Esa página no se edita desde acá." };
  const fila = await base.pagina.findUnique({ where: { slug } });
  if (!fila?.borrador) return { ok: false, detalle: "No hay cambios sin publicar." };

  // Se valida de nuevo al publicar: el esquema pudo cambiar desde que se
  // guardó el borrador, y lo publicado tiene que pasar siempre.
  const borrador = comoDocumento(fila.borrador);
  const publicado: Record<string, unknown> = {};
  for (const [clave, seccion] of Object.entries(pagina.secciones)) {
    if (!(clave in borrador)) continue;
    const valido = seccion.esquema.safeParse(borrador[clave]);
    if (!valido.success) return { ok: false, detalle: `La sección «${seccion.nombre}» no pasa: ${primerProblema(valido.error)}` };
    publicado[clave] = valido.data;
  }
  const ahora = new Date();
  // Mismo `as` que al guardar: cada valor salió de Zod, así que es JSON válido.
  await base.pagina.update({
    where: { slug },
    data: { publicado: publicado as Prisma.InputJsonObject, publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  return { ok: true, detalle: "Publicado: el sitio ya muestra esta versión.", publicadoEn: ahora.toISOString(), publicadoPor: quien, ruta: pagina.ruta };
}

export async function descartarBorradorEnBase(base: PrismaClient, slug: string): Promise<{ ok: boolean; detalle: string }> {
  const { count } = await base.pagina.updateMany({ where: { slug }, data: { borrador: Prisma.DbNull, borradorEn: null, borradorPor: null } });
  return count === 0
    ? { ok: false, detalle: "Esa página todavía no tiene nada guardado." }
    : { ok: true, detalle: "Se descartó el borrador: la página vuelve a lo publicado." };
}
```

- [ ] **Step 5: Correrlo** — `pnpm --filter sitio test` (con `.env.local` y el
Postgres de Docker arriba): los dos tests nuevos en verde. Sin `DATABASE_URL`
quedan en skip, como los de métricas.

- [ ] **Step 6: Las Server Actions del editor** `apps/sitio/src/datos/acciones/paginas.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase, type ResultadoDeGuardar, type ResultadoDePublicar } from "./editar-paginas";

// Las tres acciones del editor (SPEC §7). Toda acción del admin empieza por
// `auth.api.getSession` y contesta en llano si no hay sesión: el layout
// protegido no las cubre y el middleware las deja pasar (AGENTS.md §12). Todo
// va adentro del `try`, la sesión incluida: si la base no responde, la acción
// contesta en llano en vez de tirar y llevarse el editor (como
// actualizar-metricas.ts). El contenido lo valida editar-paginas.ts contra el
// esquema de la sección.

const esquemaSlug = z.enum(SLUGS);
const esquemaPedido = z.object({ slug: esquemaSlug, seccion: z.string().min(1), borradorEnVisto: z.string().nullable() });

export async function guardarBorrador(pedido: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para guardar." };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    return await guardarBorradorEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    console.error("guardarBorrador:", e);
    return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
  }
}

export async function publicar(slug: string): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para publicar." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    const resultado = await publicarEnBase(base, { slug: valido.data, quien: sesion.user.name });
    // La página del sitio es estática: esto la regenera en la próxima visita (spec del admin §4).
    if (resultado.ok) revalidatePath(resultado.ruta);
    return resultado;
  } catch (e) {
    console.error("publicar:", e);
    return { ok: false, detalle: "No se pudo publicar; probá de nuevo en un rato." };
  }
}

export async function descartarBorrador(slug: string): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para descartar." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    return await descartarBorradorEnBase(base, valido.data);
  } catch (e) {
    console.error("descartarBorrador:", e);
    return { ok: false, detalle: "No se pudo descartar; probá de nuevo en un rato." };
  }
}
```

- [ ] **Step 7: Abrir la vista previa** `apps/sitio/src/datos/acciones/vista-previa.ts`:

```ts
"use server";

import { draftMode, headers } from "next/headers";
import { z } from "zod";
import { PAGINAS, SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";

// La vista previa (SPEC §6) es el Draft Mode de Next: con la cookie puesta,
// el sitio saltea lo prerenderizado y `contenidoDe()` devuelve el borrador.
// La cookie solo la pone esta acción, y solo con sesión. Salir vive en
// salir-de-vista-previa.ts: lo importa el layout del sitio y no puede
// arrastrar `datos/auth` (que arma el cliente de Prisma al cargarse).

const esquemaSlug = z.enum(SLUGS);

/** Habilita el Draft Mode para quien edita y devuelve adónde ir; el botón abre esa URL en otra pestaña. */
export async function abrirVistaPrevia(slug: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    (await draftMode()).enable();
    return { ok: true, url: PAGINAS[valido.data].ruta };
  } catch (e) {
    console.error("abrirVistaPrevia:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}
```

- [ ] **Step 8: Salir de la vista previa** `apps/sitio/src/datos/acciones/salir-de-vista-previa.ts`
(archivo aparte a propósito: solo `next/headers`, `next/navigation` y la nav;
ni `datos/auth` ni `datos/cliente`):

```ts
"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { RUTAS_INTERNAS } from "@/config/nav";

// Está separada de vista-previa.ts porque la importa el layout del sitio, y
// todo lo que alcanza app/(sitio)/ tiene que poder cargarse sin base: un
// import de datos/auth acá armaría el cliente de Prisma en cada render de la
// home y el sitio dejaría de compilar y de correr sin DATABASE_URL.

/** ¿La ruta es una del sitio, o cuelga de una (`/novedades/algo`)? Nunca se redirige a lo que llegó tal cual. */
function rutaDelSitio(ruta: string): boolean {
  return RUTAS_INTERNAS.some((conocida) => ruta === conocida || (conocida !== "/" && ruta.startsWith(`${conocida}/`)));
}

/**
 * Deshabilita el Draft Mode y vuelve al sitio publicado, en la misma página.
 * Sin sesión a propósito: la cookie es de quien la tiene, y quien ya salió del
 * admin también tiene que poder salir del borrador.
 */
export async function salirDeVistaPrevia(datos: FormData): Promise<void> {
  (await draftMode()).disable();
  const ruta = datos.get("ruta");
  redirect(typeof ruta === "string" && rutaDelSitio(ruta) ? ruta : "/");
}
```

- [ ] **Step 9: Lo que lee el sitio** `apps/sitio/src/datos/consultas/paginas.ts`
(con `base` importado como en cualquier otra consulta: desde A0 importarlo no
toca el entorno; lo que no se hace es consultar sin `DATABASE_URL`):

```ts
import { draftMode } from "next/headers";
import type { Pagina } from "@/../prisma/generado/client";
import { PAGINAS, type ContenidoDe, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { comoDocumento, completarPagina } from "@/lib/contenido/documento";

// Lo que lee el sitio (SPEC §5): el documento publicado, o el borrador si la
// visita viene en Draft Mode, completado con el contenido inicial de cada
// sección que falte o no pase. Sin fila, sin base o sin DATABASE_URL, el
// contenido inicial: el sitio sigue compilando sin base (importar `base` no
// lee el entorno desde A0; consultar sin URL sí tiraría, por eso el `if`).

async function filaDe(slug: Slug): Promise<Pagina | null> {
  if (!process.env.DATABASE_URL) return null;
  return base.pagina.findUnique({ where: { slug } });
}

export async function contenidoDe<S extends Slug>(slug: S): Promise<ContenidoDe<S>> {
  const fila = await filaDe(slug);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled: enBorrador } = await draftMode();
  const documento = comoDocumento(enBorrador ? (fila?.borrador ?? fila?.publicado) : fila?.publicado);
  // completarPagina devuelve un Record; la forma precisa la garantiza el
  // esquema de cada sección, que es de donde sale ContenidoDe.
  return completarPagina(PAGINAS[slug], documento) as unknown as ContenidoDe<S>;
}
```

- [ ] **Step 10: Lo que lee el admin** `apps/sitio/src/datos/consultas/editor-de-paginas.ts`
(acá `base` se importa directo: el admin no arranca sin base):

```ts
import { PAGINAS, SLUGS, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { describir } from "@/lib/contenido/describir";
import type { Descripcion } from "@/lib/contenido/descripcion";
import { comoDocumento, completarPagina, type SeccionRegistrada } from "@/lib/contenido/documento";

// Lo que leen las dos pantallas del admin (SPEC §2): la lista de las siete
// páginas y una página lista para editar. Las fechas viajan como ISO: el
// navegador las muestra en la zona de quien mira.

export type FilaDeLista = {
  slug: Slug;
  nombre: string;
  ruta: string;
  editable: boolean;
  sinPublicar: boolean;
  publicadoEn: string | null;
  publicadoPor: string | null;
};

export async function listaDePaginas(): Promise<FilaDeLista[]> {
  const filas = await base.pagina.findMany();
  const porSlug = new Map(filas.map((f) => [f.slug, f]));
  return SLUGS.map((slug) => {
    const pagina = PAGINAS[slug];
    const fila = porSlug.get(slug);
    return {
      slug,
      nombre: pagina.nombre,
      ruta: pagina.ruta,
      editable: Object.keys(pagina.secciones).length > 0,
      sinPublicar: Boolean(fila?.borradorEn),
      publicadoEn: fila?.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila?.publicadoPor ?? null,
    };
  });
}

export type PaginaParaEditar = {
  slug: Slug;
  nombre: string;
  ruta: string;
  estado: { borradorEn: string | null; borradorPor: string | null; publicadoEn: string | null; publicadoPor: string | null };
  secciones: Array<{ clave: string; nombre: string; descripcion: Descripcion; contenido: unknown }>;
};

/** La página con lo que se está editando (el borrador, o lo publicado, o el inicial) y la descripción de cada sección. */
export async function paginaParaEditar(slug: Slug): Promise<PaginaParaEditar> {
  const pagina = PAGINAS[slug];
  const fila = await base.pagina.findUnique({ where: { slug } });
  const documento = completarPagina(pagina, comoDocumento(fila?.borrador ?? fila?.publicado));
  // Anotado como Record para que Object.entries no caiga en `any` con la unión de páginas.
  const secciones: Record<string, SeccionRegistrada> = pagina.secciones;
  return {
    slug,
    nombre: pagina.nombre,
    ruta: pagina.ruta,
    estado: {
      borradorEn: fila?.borradorEn?.toISOString() ?? null,
      borradorPor: fila?.borradorPor ?? null,
      publicadoEn: fila?.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila?.publicadoPor ?? null,
    },
    secciones: Object.entries(secciones).map(([clave, s]) => ({ clave, nombre: s.nombre, descripcion: describir(s.esquema, s.nombre), contenido: documento[clave] })),
  };
}
```

- [ ] **Step 11: El sitio lee de verdad.** En `apps/sitio/src/app/(sitio)/page.tsx`
reemplazar el import de `heroInicial` por el de la consulta y volver la página
async:

```ts
import { contenidoDe } from "@/datos/consultas/paginas";
```

```tsx
export default async function Home() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const { hero } = await contenidoDe("inicio");
  return (
    <main>
```

y `<HeroQuienes hero={hero} />` donde estaba `heroInicial`.

- [ ] **Step 12: DECISIONS.** Agregar al final de `work/edicion-de-paginas/DECISIONS.md`:

```markdown
**2026-09-21 — Publicar y descartar dejan `borrador` en null.**
«No hay borrador» quiere decir «el borrador es lo publicado». La marca «sin
publicar» de la lista es `borradorEn !== null`, y el chequeo de cambios
cruzados compara `borradorEn` con el que vio la pantalla (`null` cuando no
había). La lógica con la base inyectada vive en `editar-paginas.ts` y se
prueba contra el Postgres local; las Server Actions solo verifican la sesión.

**2026-09-21 — `salirDeVistaPrevia` va en su propio archivo, sin `datos/auth`.**
La importa el layout del sitio para la franja de borrador. `datos/auth` exige
el secreto de better-auth al cargarse y arranca la sesión: no tiene por qué
entrar en cada render de la home. No necesita sesión: solo borra la cookie de
quien la tiene y vuelve a la ruta por la que entró (o a Inicio).
```

- [ ] **Step 13: El sitio sigue igual, con y sin base.** Si falta
`../ed-render-antes` (otra sesión u otra máquina), rehacerla desde `main` con
los comandos de A4.1 antes de seguir. Gates, y el build con `.env.local` (lee
la base: no hay fila de `inicio`, así que sale el inicial):

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
pnpm build > /dev/null 2>&1 && node scripts/comparar-render.mjs ../ed-render-antes apps/sitio
```

Esperado: `N páginas, render idéntico.`. Después el mismo build **sin base**,
el que A0 dejó en verde, con el mismo render:

```bash
DATABASE_URL= DATABASE_URL_UNPOOLED= pnpm --filter sitio exec next build > /dev/null 2>&1 && node scripts/comparar-render.mjs ../ed-render-antes apps/sitio
```

Esperado: `N páginas, render idéntico.` otra vez. Y, como chequeo secundario,
que el camino del sitio no toque `datos/auth` (exige el secreto al cargarse)
ni las acciones con sesión:

```bash
grep -rn "datos/auth\|datos/acciones/vista-previa\|datos/acciones/paginas\|datos/acciones/fotos" apps/sitio/src/components apps/sitio/src/features "apps/sitio/src/app/(sitio)" apps/sitio/src/datos/consultas/paginas.ts || echo "el sitio no toca datos/auth ni las acciones del admin"
```

Esperado: la frase.

- [ ] **Step 14: Commits** (con OK)

```bash
git add apps/sitio/src/lib/contenido/tiempo.ts apps/sitio/src/lib/contenido/tiempo.test.ts apps/sitio/src/datos/acciones/editar-paginas.ts apps/sitio/src/datos/acciones/editar-paginas.test.ts apps/sitio/src/datos/acciones/paginas.ts apps/sitio/src/datos/consultas/paginas.ts apps/sitio/src/datos/consultas/editor-de-paginas.ts "apps/sitio/src/app/(sitio)/page.tsx" work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
feat(paginas): leer, guardar, publicar y descartar el contenido

El sitio lee el documento publicado (o el borrador, en Draft Mode) y
sin base muestra el inicial. Guardar compara el borradorEn que vio la
pantalla para no pisar a nadie; publicar valida de nuevo y deja el
borrador en null. La lógica va con la base inyectada para probarla.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
git add apps/sitio/src/datos/acciones/vista-previa.ts apps/sitio/src/datos/acciones/salir-de-vista-previa.ts
git commit -F - <<'MSG'
feat(paginas): la vista previa con Draft Mode

Abrir pide sesión y pone la cookie; salir no la pide y vive en un
archivo sin datos/auth, porque lo importa el layout del sitio y la
home tiene que seguir cargando sin base.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A6: Los controles del formulario

**Files:**
- Create: `apps/sitio/src/admin/armazon/Momento.tsx`
- Create: `apps/sitio/src/admin/campos/clases.ts`, `TextoCorto.tsx`, `Parrafo.tsx`, `RutaInterna.tsx`, `ListaFija.tsx`, `CampoFoto.tsx`, `Campo.tsx`

**Interfaces:**
- Consume: `Descripcion`, `valorVacio` de `@/lib/contenido/descripcion`;
  `ValorFoto`, `MAXIMO_BYTES`, `posicionDelFoco` de `@/lib/contenido/fotos`;
  `fechaYHora`, `haceCuanto` de `@/lib/contenido/tiempo`; `subirFoto` de
  `@/datos/acciones/fotos`; `Aviso` de `@/admin/armazon/Campos`.
- Produce: `Momento({ iso, relativo? })`; el componente recursivo
  `Campo({ nombre, descripcion, valor, alCambiar, raiz? })` y sus controles;
  las clases `ENTRADA` y `BOTON_SECUNDARIO`.

Los componentes de `admin/campos/` que no llevan `"use client"` igual corren
en el navegador: los importa `EditorDePagina` (A7), que sí lo lleva. La
directiva va solo donde hay hooks (`CampoFoto`, `Momento`) para que un import
equivocado desde un Server Component avise temprano.

- [ ] **Step 1: La fecha en la zona de quien mira** `apps/sitio/src/admin/armazon/Momento.tsx`:

```tsx
"use client";

import { fechaYHora, haceCuanto } from "@/lib/contenido/tiempo";

/**
 * Una fecha en la zona de quien mira: absoluta («21/9 a las 14:05») o
 * relativa («hace 3 minutos», como pide el SPEC §2 para el borrador). El
 * servidor la renderiza con su reloj y su zona (UTC en Vercel) y el navegador
 * la corrige al hidratar: `suppressHydrationWarning` existe para esto y solo
 * cubre este elemento. La relativa se recalcula en cada render, o sea cada
 * vez que el estado del editor cambia.
 */
export function Momento({ iso, relativo = false }: { iso: string; relativo?: boolean }) {
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {relativo ? haceCuanto(new Date(iso)) : fechaYHora(iso)}
    </time>
  );
}
```

- [ ] **Step 2: Las clases compartidas** `apps/sitio/src/admin/campos/clases.ts`:

```ts
/** La misma caja de texto que usan las pantallas de acceso (armazon/Campos.tsx). */
export const ENTRADA =
  "mt-1 w-full rounded-lg border border-azul-claro bg-white px-3 py-2 outline-none focus:border-azul-medio focus:ring-2 focus:ring-azul-claro";

/** Un botón secundario: borde, sin relleno. El único naranja del editor es «Publicar». */
export const BOTON_SECUNDARIO =
  "rounded-lg border border-azul-claro bg-white px-3 py-2 text-sm text-azul-medio transition-opacity hover:opacity-80 disabled:opacity-50";
```

- [ ] **Step 3: Texto corto y párrafo.**

`apps/sitio/src/admin/campos/TextoCorto.tsx`:

```tsx
import type { Descripcion } from "@/lib/contenido/descripcion";
import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "textoCorto" }>;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Una línea con su largo máximo a la vista y un contador (SPEC §2). */
export function TextoCorto({ nombre, descripcion, valor, alCambiar }: Props) {
  const idAyuda = `${nombre}-ayuda`;
  return (
    <div>
      <label className="block">
        <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
          {descripcion.etiqueta}
          <span className="text-xs font-normal text-gris-texto">
            {valor.length}/{descripcion.maximo}
          </span>
        </span>
        <input
          type="text"
          value={valor}
          maxLength={descripcion.maximo}
          aria-describedby={descripcion.ayuda ? idAyuda : undefined}
          onChange={(e) => alCambiar(e.target.value)}
          className={ENTRADA}
        />
      </label>
      {descripcion.ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {descripcion.ayuda}
        </p>
      ) : null}
    </div>
  );
}
```

`apps/sitio/src/admin/campos/Parrafo.tsx`:

```tsx
import type { Descripcion } from "@/lib/contenido/descripcion";
import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "parrafo" }>;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Varias líneas, con contador. El hero no lo usa; existe porque `parrafo()` existe y el dibujante cubre todos los tipos. */
export function Parrafo({ nombre, descripcion, valor, alCambiar }: Props) {
  const idAyuda = `${nombre}-ayuda`;
  return (
    <div>
      <label className="block">
        <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
          {descripcion.etiqueta}
          <span className="text-xs font-normal text-gris-texto">
            {valor.length}/{descripcion.maximo}
          </span>
        </span>
        <textarea
          rows={4}
          value={valor}
          maxLength={descripcion.maximo}
          aria-describedby={descripcion.ayuda ? idAyuda : undefined}
          onChange={(e) => alCambiar(e.target.value)}
          className={ENTRADA}
        />
      </label>
      {descripcion.ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {descripcion.ayuda}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: La ruta interna** `apps/sitio/src/admin/campos/RutaInterna.tsx`:

```tsx
import type { Descripcion } from "@/lib/contenido/descripcion";
import { ENTRADA } from "./clases";

type Props = {
  descripcion: Extract<Descripcion, { tipo: "rutaInterna" }>;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Un enlace interno se elige de la lista cerrada de rutas del sitio (SPEC §2): no hay enlaces libres. */
export function RutaInterna({ descripcion, valor, alCambiar }: Props) {
  const conocida = descripcion.opciones.includes(valor);
  return (
    <label className="block">
      <span className="text-sm font-medium">{descripcion.etiqueta}</span>
      <select value={conocida ? valor : ""} onChange={(e) => alCambiar(e.target.value)} className={ENTRADA}>
        {/* Si el valor guardado ya no está en la lista, que se vea que falta elegir. */}
        {conocida ? null : <option value="">Elegí una ruta</option>}
        {descripcion.opciones.map((ruta) => (
          <option key={ruta} value={ruta}>
            {ruta}
          </option>
        ))}
      </select>
      {descripcion.ayuda ? <span className="mt-1 block text-xs text-gris-texto">{descripcion.ayuda}</span> : null}
    </label>
  );
}
```

- [ ] **Step 5: La lista fija** `apps/sitio/src/admin/campos/ListaFija.tsx`
(recibe cómo dibujar cada ítem para no importar a `Campo` y armar un ciclo):

```tsx
import type { ReactNode } from "react";
import { valorVacio, type Descripcion } from "@/lib/contenido/descripcion";

type Props = {
  descripcion: Extract<Descripcion, { tipo: "listaFija" }>;
  valor: unknown[];
  alCambiar: (valor: unknown[]) => void;
  porItem: (indice: number, valor: unknown, cambiar: (valor: unknown) => void) => ReactNode;
};

/** Exactamente `cantidad` ítems: se edita cada uno, no se agregan ni se sacan (SPEC §2). */
export function ListaFija({ descripcion, valor, alCambiar, porItem }: Props) {
  // Siempre la cantidad exacta: si el valor trae menos, se completa con vacíos; si trae más, se recorta.
  const items = Array.from({ length: descripcion.cantidad }, (_, i) => (i < valor.length ? valor[i] : valorVacio(descripcion.item)));
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{descripcion.etiqueta}</p>
      {descripcion.ayuda ? <p className="text-xs text-gris-texto">{descripcion.ayuda}</p> : null}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-azul-claro/60 p-4">
            <p className="mb-3 text-sm font-medium">
              {descripcion.item.etiqueta} {i + 1}
            </p>
            {porItem(i, item, (nuevo) => alCambiar(items.map((x, j) => (j === i ? nuevo : x))))}
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 6: La foto** `apps/sitio/src/admin/campos/CampoFoto.tsx`
(miniatura con el punto de foco, alt obligatorio, subida; el tamaño se chequea
**antes** de mandar y la acción va en `try/catch`: `bodySizeLimit` corta antes
de entrar a la acción y un error en la transición se llevaría el editor entero):

```tsx
"use client";

import Image from "next/image";
import { useState, useTransition, type MouseEvent } from "react";
import { Aviso } from "@/admin/armazon/Campos";
import { subirFoto } from "@/datos/acciones/fotos";
import type { Descripcion } from "@/lib/contenido/descripcion";
import { MAXIMO_BYTES, posicionDelFoco, type ValorFoto } from "@/lib/contenido/fotos";
import { BOTON_SECUNDARIO, ENTRADA } from "./clases";

type Props = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "foto" }>;
  valor: ValorFoto;
  alCambiar: (valor: ValorFoto) => void;
};

/**
 * Una foto del contenido: la miniatura recortada alrededor del foco, el texto
 * alternativo (obligatorio) y la subida de un archivo nuevo (SPEC §2 y §4.4).
 * El foco se elige con un clic sobre la miniatura. El marco es 4/3 y no el de
 * cada tarjeta: las once tienen once relaciones de aspecto y el campo es uno
 * solo (DECISIONS, 8); el recorte real se ve en la vista previa.
 */
export function CampoFoto({ nombre, descripcion, valor, alCambiar }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();
  const idArchivo = `${nombre}-archivo`;

  const elegirFoco = (e: MouseEvent<HTMLButtonElement>) => {
    // Enter o espacio disparan un click sin coordenadas (detail 0): no hay dónde poner el foco.
    if (e.detail === 0) return;
    const caja = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width));
    const y = Math.min(1, Math.max(0, (e.clientY - caja.top) / caja.height));
    alCambiar({ ...valor, foco: { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) } });
  };

  const subir = () => {
    if (!archivo) return;
    if (!valor.alt.trim()) {
      setAviso("Escribí primero el texto alternativo: sin él la foto no se guarda.");
      return;
    }
    // Acá y no solo en el servidor: el tope del cuerpo de la acción corta
    // antes de entrar a ella, y ese error no lo contesta nadie en llano.
    if (archivo.size > MAXIMO_BYTES) {
      setAviso("La foto pesa más de 4 MB: achicala antes de subirla.");
      return;
    }
    const datos = new FormData();
    datos.append("archivo", archivo);
    datos.append("alt", valor.alt);
    empezar(async () => {
      try {
        const r = await subirFoto(datos);
        if (!r.ok) {
          setAviso(r.detalle);
          return;
        }
        setAviso(null);
        setArchivo(null);
        // Foto nueva, foco al centro: el anterior era de otra imagen.
        alCambiar({ ...valor, src: r.foto.src, foco: { x: 0.5, y: 0.5 } });
      } catch {
        // Sin red, o el servidor cortó el pedido: un aviso, no la pantalla de error de Next.
        setAviso("No se pudo subir la foto. Fijate la conexión y probá de nuevo.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{descripcion.etiqueta}</p>
      {valor.src ? (
        <button
          type="button"
          onClick={elegirFoco}
          aria-label="Elegir el punto de foco con un clic sobre la foto"
          className="relative block aspect-[4/3] w-full max-w-xs cursor-crosshair overflow-hidden rounded-lg border border-azul-claro"
        >
          <Image src={valor.src} alt={valor.alt} fill sizes="320px" className="object-cover" style={{ objectPosition: posicionDelFoco(valor.foco) }} />
          <span
            aria-hidden="true"
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-verde-concepto shadow"
            style={{ left: `${valor.foco.x * 100}%`, top: `${valor.foco.y * 100}%` }}
          />
        </button>
      ) : (
        <p className="text-sm text-gris-texto">Sin foto todavía.</p>
      )}
      <p className="text-xs text-gris-texto">Tocá la miniatura donde está lo importante: cada marco del sitio recorta alrededor de ese punto.</p>
      <label className="block">
        <span className="text-sm font-medium">Texto alternativo (obligatorio)</span>
        <input type="text" value={valor.alt} maxLength={200} onChange={(e) => alCambiar({ ...valor, alt: e.target.value })} className={ENTRADA} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={idArchivo} className="sr-only">
          Archivo de la foto
        </label>
        <input id={idArchivo} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="text-sm" />
        <button type="button" disabled={!archivo || pendiente} onClick={subir} className={BOTON_SECUNDARIO}>
          {pendiente ? "Subiendo…" : "Subir foto"}
        </button>
      </div>
      <p className="text-xs text-gris-texto">jpg, png o webp de hasta 4 MB.{descripcion.ayuda ? ` ${descripcion.ayuda}` : ""}</p>
      {aviso ? <Aviso tono="error">{aviso}</Aviso> : null}
    </div>
  );
}
```

- [ ] **Step 7: El dibujante** `apps/sitio/src/admin/campos/Campo.tsx`
(recorre la descripción y se llama a sí mismo para grupos, listas y opcionales):

```tsx
import { valorVacio, type Descripcion } from "@/lib/contenido/descripcion";
import type { ValorFoto } from "@/lib/contenido/fotos";
import { CampoFoto } from "./CampoFoto";
import { ListaFija } from "./ListaFija";
import { Parrafo } from "./Parrafo";
import { RutaInterna } from "./RutaInterna";
import { TextoCorto } from "./TextoCorto";

export type PropsDeCampo = {
  /** Camino del campo («hero.tarjetas.0.foto»): solo para ids únicos. */
  nombre: string;
  descripcion: Descripcion;
  valor: unknown;
  alCambiar: (valor: unknown) => void;
  /** La raíz de una sección o de un ítem no lleva caja propia: ya la tiene su bloque. */
  raiz?: boolean;
};

/**
 * Dibuja un campo según su descripción (SPEC §4.1: el formulario sale del
 * esquema, sin JSX por sección; excepción acotada a AGENTS.md §12). Los dos
 * `as` de abajo son seguros: el valor y la descripción salen del mismo
 * esquema, ya validado al leer, así que un «foto» trae un ValorFoto y un
 * «grupo» trae un objeto por clave; los `typeof` cubren un valor a medias.
 */
export function Campo({ nombre, descripcion, valor, alCambiar, raiz = false }: PropsDeCampo) {
  switch (descripcion.tipo) {
    case "textoCorto":
      return <TextoCorto nombre={nombre} descripcion={descripcion} valor={typeof valor === "string" ? valor : ""} alCambiar={alCambiar} />;
    case "parrafo":
      return <Parrafo nombre={nombre} descripcion={descripcion} valor={typeof valor === "string" ? valor : ""} alCambiar={alCambiar} />;
    case "rutaInterna":
      return <RutaInterna descripcion={descripcion} valor={typeof valor === "string" ? valor : ""} alCambiar={alCambiar} />;
    case "foto":
      return <CampoFoto nombre={nombre} descripcion={descripcion} valor={valor as ValorFoto} alCambiar={alCambiar} />;
    case "listaFija":
      return (
        <ListaFija
          descripcion={descripcion}
          valor={Array.isArray(valor) ? valor : []}
          alCambiar={alCambiar}
          porItem={(i, item, cambiarItem) => <Campo raiz nombre={`${nombre}.${i}`} descripcion={descripcion.item} valor={item} alCambiar={cambiarItem} />}
        />
      );
    case "opcional": {
      const activo = valor !== null && valor !== undefined;
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={activo} onChange={(e) => alCambiar(e.target.checked ? valorVacio(descripcion.de) : null)} />
            Lleva {descripcion.etiqueta.toLowerCase()}
          </label>
          {activo ? <Campo raiz nombre={nombre} descripcion={descripcion.de} valor={valor} alCambiar={alCambiar} /> : null}
        </div>
      );
    }
    case "grupo": {
      const grupo = (valor ?? {}) as Record<string, unknown>;
      const campos = descripcion.campos.map(({ clave, descripcion: d }) => (
        <Campo key={clave} nombre={`${nombre}.${clave}`} descripcion={d} valor={grupo[clave]} alCambiar={(v) => alCambiar({ ...grupo, [clave]: v })} />
      ));
      if (raiz) return <div className="space-y-5">{campos}</div>;
      return (
        <fieldset className="space-y-4 rounded-lg border border-azul-claro/60 p-4">
          <legend className="px-1 text-sm font-medium">{descripcion.etiqueta}</legend>
          {descripcion.ayuda ? <p className="text-xs text-gris-texto">{descripcion.ayuda}</p> : null}
          {campos}
        </fieldset>
      );
    }
  }
}
```

- [ ] **Step 8: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/admin/armazon/Momento.tsx apps/sitio/src/admin/campos
git commit -F - <<'MSG'
feat(admin): los controles del formulario que sale del esquema

Un control por tipo de campo y un dibujante recursivo que recorre la
descripción serializable: así una sección nueva no escribe JSX. La
foto chequea el tamaño antes de mandar, porque el tope del cuerpo de
la acción corta antes de que el servidor pueda contestar en llano.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A7: «Páginas» y el editor

**Files:**
- Create: `apps/sitio/src/admin/paginas/Seccion.tsx`, `BarraDeAcciones.tsx`, `EditorDePagina.tsx`, `ListaDePaginas.tsx`
- Create: `apps/sitio/src/app/(admin)/admin/(protegido)/paginas/page.tsx`
- Create: `apps/sitio/src/app/(admin)/admin/(protegido)/paginas/[slug]/page.tsx`
- Modify: `apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx` (link «Páginas»)
- Modify: `work/edicion-de-paginas/DECISIONS.md` (una entrada)

**Interfaces:**
- Consume: `Campo` de `@/admin/campos/Campo`; `BOTON_SECUNDARIO` de
  `@/admin/campos/clases`; `Momento` de `@/admin/armazon/Momento`; `Aviso` de
  `@/admin/armazon/Campos`; `guardarBorrador`, `publicar`, `descartarBorrador`
  de `@/datos/acciones/paginas`; `abrirVistaPrevia` de
  `@/datos/acciones/vista-previa`; `listaDePaginas`, `paginaParaEditar`,
  `FilaDeLista`, `PaginaParaEditar` de `@/datos/consultas/editor-de-paginas`;
  `esSlug`, `PAGINAS` de `@/contenido/paginas`; `Descripcion` de
  `@/lib/contenido/descripcion`.
- Produce: las rutas `/admin/paginas` y `/admin/paginas/[slug]`.

- [ ] **Step 1: La sección** `apps/sitio/src/admin/paginas/Seccion.tsx`:

```tsx
import { Campo } from "@/admin/campos/Campo";
import type { Descripcion } from "@/lib/contenido/descripcion";

type Props = {
  clave: string;
  nombre: string;
  descripcion: Descripcion;
  valor: unknown;
  alCambiar: (valor: unknown) => void;
};

/** Un bloque plegable por sección, con el nombre que tiene en el sitio (SPEC §2). */
export function Seccion({ clave, nombre, descripcion, valor, alCambiar }: Props) {
  return (
    <details open className="rounded-xl border border-azul-claro bg-white">
      <summary className="cursor-pointer px-5 py-3 font-[family-name:var(--font-manrope)] text-lg font-bold">{nombre}</summary>
      <div className="space-y-5 border-t border-azul-claro px-5 py-5">
        <Campo raiz nombre={clave} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />
      </div>
    </details>
  );
}
```

- [ ] **Step 2: La barra** `apps/sitio/src/admin/paginas/BarraDeAcciones.tsx`
(el borrador se dice en relativo y lo publicado en absoluto, como el SPEC §2):

```tsx
import Link from "next/link";
import { Momento } from "@/admin/armazon/Momento";
import { BOTON_SECUNDARIO } from "@/admin/campos/clases";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";

type Props = {
  nombre: string;
  ruta: string;
  estado: PaginaParaEditar["estado"];
  haySinGuardar: boolean;
  pendiente: boolean;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
  alDescartar: () => void;
};

/** El estado en llano de la página, con las fechas en la zona de quien mira. */
function EstadoEnLlano({ estado }: { estado: PaginaParaEditar["estado"] }) {
  if (estado.borradorEn) {
    return (
      <>
        Borrador guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}, sin publicar.
      </>
    );
  }
  if (estado.publicadoEn) {
    return (
      <>
        Publicado el <Momento iso={estado.publicadoEn} />
        {estado.publicadoPor ? ` por ${estado.publicadoPor}` : ""}.
      </>
    );
  }
  return <>Todavía muestra el contenido inicial del código.</>;
}

/** La barra fija de arriba: el estado y las tres acciones (más «Descartar» cuando hay borrador). */
export function BarraDeAcciones({ nombre, ruta, estado, haySinGuardar, pendiente, alGuardar, alVerBorrador, alPublicar, alDescartar }: Props) {
  return (
    <div className="sticky top-0 z-10 -mx-6 border-b border-azul-claro bg-gris-fondo/95 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gris-texto">
            <Link href="/admin/paginas" className="hover:underline">
              Páginas
            </Link>{" "}
            › {nombre} · {ruta}
          </p>
          <p className="text-sm">
            <EstadoEnLlano estado={estado} />
            {haySinGuardar ? <span className="font-medium"> Hay cambios sin guardar.</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={pendiente || !haySinGuardar} onClick={alGuardar} className={BOTON_SECUNDARIO}>
            {pendiente ? "Guardando…" : "Guardar borrador"}
          </button>
          <button type="button" disabled={pendiente} onClick={alVerBorrador} className={BOTON_SECUNDARIO}>
            Vista previa
          </button>
          {/* El único naranja de la pantalla: es la acción (DESIGN.md, naranja solo CTAs). */}
          <button
            type="button"
            disabled={pendiente || (!estado.borradorEn && !haySinGuardar)}
            onClick={alPublicar}
            className="rounded-lg bg-naranja-accion px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Publicar
          </button>
          {estado.borradorEn ? (
            <button type="button" disabled={pendiente} onClick={alDescartar} className="text-sm text-gris-texto underline-offset-2 hover:underline">
              Descartar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: El editor** `apps/sitio/src/admin/paginas/EditorDePagina.tsx`
(cada llamada a una acción va en `try/catch`: un error en la transición, sin
`error.tsx`, se lleva la pantalla y lo que había sin guardar):

```tsx
"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Aviso } from "@/admin/armazon/Campos";
import { descartarBorrador, guardarBorrador, publicar } from "@/datos/acciones/paginas";
import { abrirVistaPrevia } from "@/datos/acciones/vista-previa";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { BarraDeAcciones } from "./BarraDeAcciones";
import { Seccion } from "./Seccion";

type AvisoDelEditor = { ok: boolean; detalle: ReactNode };

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

/**
 * El editor de una página: la barra fija con las acciones y las secciones en
 * el orden del scroll (SPEC §2). El contenido vive en el estado del navegador
 * hasta que se guarda; cada guardado encadena el `borradorEn` que devolvió el
 * anterior, así el chequeo de cambios cruzados vale sección tras sección.
 * Publicar y ver el borrador guardan primero lo que haya sin guardar: nadie
 * publica algo distinto de lo que tiene en pantalla.
 */
export function EditorDePagina({ pagina }: { pagina: PaginaParaEditar }) {
  const [contenidos, setContenidos] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(pagina.secciones.map((s) => [s.clave, s.contenido])),
  );
  const [sucias, setSucias] = useState<Record<string, boolean>>({});
  const [estado, setEstado] = useState(pagina.estado);
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, empezar] = useTransition();
  const haySinGuardar = Object.values(sucias).some(Boolean);

  const cambiar = (clave: string, valor: unknown) => {
    setContenidos((c) => ({ ...c, [clave]: valor }));
    setSucias((s) => ({ ...s, [clave]: true }));
  };

  /** Guarda las secciones tocadas, una por una. Devuelve false si alguna falló (y ya avisó). */
  async function guardarTodo(): Promise<boolean> {
    let visto = estado.borradorEn;
    let quien = estado.borradorPor;
    for (const s of pagina.secciones) {
      if (!sucias[s.clave]) continue;
      const r = await guardarBorrador({ slug: pagina.slug, seccion: s.clave, contenido: contenidos[s.clave], borradorEnVisto: visto });
      if (!r.ok) {
        setAviso(r);
        return false;
      }
      visto = r.borradorEn;
      quien = r.borradorPor;
      setSucias((x) => ({ ...x, [s.clave]: false }));
    }
    setEstado((e) => ({ ...e, borradorEn: visto, borradorPor: quien }));
    return true;
  }

  /** Corre una acción del editor y convierte una excepción (sin red, servidor caído) en un aviso. */
  const correr = (accion: () => Promise<void>) =>
    empezar(async () => {
      try {
        await accion();
      } catch {
        setAviso({ ok: false, detalle: SIN_RED });
      }
    });

  const guardar = () =>
    correr(async () => {
      if (await guardarTodo()) setAviso({ ok: true, detalle: "Borrador guardado. El sitio sigue mostrando lo publicado." });
    });

  const verBorrador = () =>
    correr(async () => {
      if (haySinGuardar && !(await guardarTodo())) return;
      const r = await abrirVistaPrevia(pagina.slug);
      if (!r.ok) {
        setAviso(r);
        return;
      }
      // Después de esperar al servidor algunos navegadores frenan la pestaña nueva: queda el link a mano.
      const pestana = window.open(r.url, "_blank", "noopener");
      setAviso({
        ok: true,
        detalle: pestana ? (
          "La vista previa se abrió en otra pestaña."
        ) : (
          <>
            El navegador frenó la pestaña nueva:{" "}
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
              abrí la vista previa desde acá
            </a>
            .
          </>
        ),
      });
    });

  const publicarAhora = () =>
    correr(async () => {
      if (haySinGuardar && !(await guardarTodo())) return;
      const r = await publicar(pagina.slug);
      setAviso(r);
      if (r.ok) setEstado({ borradorEn: null, borradorPor: null, publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor });
    });

  const descartar = () => {
    if (!window.confirm("¿Descartar los cambios sin publicar? La página vuelve a lo que está publicado.")) return;
    correr(async () => {
      const r = await descartarBorrador(pagina.slug);
      if (!r.ok) {
        setAviso(r);
        return;
      }
      // Recargar es lo más simple para volver a lo publicado: el editor se arma de nuevo desde el servidor.
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <BarraDeAcciones
        nombre={pagina.nombre}
        ruta={pagina.ruta}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={pendiente}
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicarAhora}
        alDescartar={descartar}
      />
      {aviso ? <Aviso tono={aviso.ok ? "bien" : "error"}>{aviso.detalle}</Aviso> : null}
      {pagina.secciones.map((s) => (
        <Seccion key={s.clave} clave={s.clave} nombre={s.nombre} descripcion={s.descripcion} valor={contenidos[s.clave]} alCambiar={(v) => cambiar(s.clave, v)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: La lista** `apps/sitio/src/admin/paginas/ListaDePaginas.tsx`
(Server Component: sin hooks):

```tsx
import Link from "next/link";
import { Momento } from "@/admin/armazon/Momento";
import type { FilaDeLista } from "@/datos/consultas/editor-de-paginas";

/** Las siete páginas en el orden del menú, con la marca «sin publicar» y la última publicación (SPEC §2). */
export function ListaDePaginas({ filas }: { filas: FilaDeLista[] }) {
  return (
    <ul className="divide-y divide-azul-claro rounded-xl border border-azul-claro bg-white">
      {filas.map((f) => (
        <li key={f.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-medium">
              {f.nombre} <span className="text-sm text-gris-texto">{f.ruta}</span>
            </p>
            <p className="text-sm text-gris-texto">
              {f.publicadoEn ? (
                <>
                  Publicado el <Momento iso={f.publicadoEn} />
                  {f.publicadoPor ? ` por ${f.publicadoPor}` : ""}
                </>
              ) : (
                "Muestra el contenido inicial del código."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {f.sinPublicar ? <span className="rounded-full bg-azul-claro/40 px-2.5 py-0.5 text-xs font-medium text-azul-principal">Cambios sin publicar</span> : null}
            {f.editable ? (
              <Link href={`/admin/paginas/${f.slug}`} className="rounded-lg border border-azul-claro px-3 py-1.5 text-sm text-azul-medio transition-opacity hover:opacity-80">
                Editar
              </Link>
            ) : (
              <span className="text-sm text-gris-texto">Todavía no se edita desde acá</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Las dos rutas del admin.**

`apps/sitio/src/app/(admin)/admin/(protegido)/paginas/page.tsx`:

```tsx
import { ListaDePaginas } from "@/admin/paginas/ListaDePaginas";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";

export default async function PaginasDelAdmin() {
  const filas = await listaDePaginas();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Páginas</h1>
        <p className="mt-1 max-w-prose text-gris-texto">
          Los textos y las fotos de las siete páginas del sitio, en el orden del menú. Guardar no publica: cada
          página tiene un borrador y una versión publicada.
        </p>
      </div>
      <ListaDePaginas filas={filas} />
    </div>
  );
}
```

`apps/sitio/src/app/(admin)/admin/(protegido)/paginas/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { EditorDePagina } from "@/admin/paginas/EditorDePagina";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { paginaParaEditar } from "@/datos/consultas/editor-de-paginas";

export default async function EditarPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Un slug que no está en el registro, o una página sin secciones todavía, no tiene editor.
  if (!esSlug(slug) || Object.keys(PAGINAS[slug].secciones).length === 0) notFound();
  const pagina = await paginaParaEditar(slug);
  return (
    <>
      <h1 className="sr-only">Editar {pagina.nombre}</h1>
      <EditorDePagina pagina={pagina} />
    </>
  );
}
```

- [ ] **Step 6: El link desde la portada.** En
`apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx`, sumar
`import Link from "next/link";` arriba del import de `PanelMetricas` y
reemplazar la sección «Todavía no hay nada que editar» por:

```tsx
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-bold">Páginas</h2>
        <p className="max-w-prose text-gris-texto">
          Los textos y las fotos de las siete páginas del sitio. Por ahora se edita el hero de Inicio; las
          demás secciones se van sumando. Las novedades, la biblioteca, los casos y el equipo llegan en las
          fases siguientes.
        </p>
        <Link href="/admin/paginas" className="inline-block rounded-lg border border-azul-claro px-3 py-1.5 text-sm text-azul-medio transition-opacity hover:opacity-80">
          Ir a Páginas
        </Link>
      </section>
```

- [ ] **Step 7: DECISIONS.** Agregar al final de `work/edicion-de-paginas/DECISIONS.md`:

```markdown
**2026-09-21 — Las fechas del admin se muestran en la zona de quien mira.**
El servidor corre en UTC y el equipo está en tres países: un componente
cliente (`Momento`) formatea en el navegador y `suppressHydrationWarning` cubre
la diferencia con lo que renderizó el servidor. El borrador se dice en relativo
(«hace 3 minutos», SPEC §2) y lo publicado en absoluto («el 21/9 a las 14:05»).

**2026-09-21 — La franja de borrador va abajo, y la miniatura del foco es un marco 4/3.**
El header del sitio es una píldora `fixed top-4` que una franja arriba
taparía. Y las once tarjetas del hero tienen once relaciones de aspecto con un
solo campo de foto: la miniatura muestra el punto elegido sobre un marco 4/3,
no el recorte exacto de cada tarjeta; la vista previa es donde se ve el
recorte real.
```

- [ ] **Step 8: Mirar las dos pantallas** (server de dev levantado, sesión con
la cuenta local de las Restricciones): `/admin` → «Ir a Páginas» →
`/admin/paginas` con las siete filas y solo Inicio con «Editar»; «Editar» →
el bloque Hero con todos los campos y solo «Publicar» en naranja. Guardar,
publicar y las fotos se prueban enteros en A8, cuando existe la franja.

- [ ] **Step 9: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/admin/paginas "apps/sitio/src/app/(admin)/admin/(protegido)/paginas" "apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx" work/edicion-de-paginas/DECISIONS.md
git commit -F - <<'MSG'
feat(admin): «Páginas» y el editor del hero de Inicio

La lista de las siete páginas con la marca «sin publicar», y el editor
con la barra fija: guardar encadena el borradorEn de cada sección para
no pisar a nadie, y publicar y ver el borrador guardan primero lo que
haya en pantalla. Cada acción va en try/catch: un error en la
transición se llevaría el editor entero.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A8: La franja de borrador y la verificación de punta a punta

**Files:**
- Create: `apps/sitio/src/components/layout/RutaActual.tsx`
- Create: `apps/sitio/src/components/layout/FranjaDeBorrador.tsx`
- Modify: `apps/sitio/src/app/(sitio)/layout.tsx` (franja + `noindex` en Draft Mode)

**Interfaces:**
- Consume: `salirDeVistaPrevia` de `@/datos/acciones/salir-de-vista-previa`
  (**nunca** de `vista-previa.ts`, que importa `datos/auth`); `draftMode` de
  `next/headers`; `usePathname` de `next/navigation`.
- Produce: la franja del sitio en Draft Mode y el `noindex` mientras dura.

- [ ] **Step 1: La ruta actual** `apps/sitio/src/components/layout/RutaActual.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";

/** La ruta en la que está la persona, para que «Volver al sitio publicado» la deje en la misma página. */
export function RutaActual() {
  return <input type="hidden" name="ruta" value={usePathname()} />;
}
```

- [ ] **Step 2: La franja** `apps/sitio/src/components/layout/FranjaDeBorrador.tsx`
(Server Component):

```tsx
import { draftMode } from "next/headers";
import { salirDeVistaPrevia } from "@/datos/acciones/salir-de-vista-previa";
import { RutaActual } from "./RutaActual";

/**
 * «Estás viendo un borrador · Volver al sitio publicado» (SPEC §6). Solo con
 * la cookie de Draft Mode; el resto de las visitas no ve nada. Va abajo y no
 * arriba porque el header es una píldora `fixed top-4` que una franja arriba
 * taparía (DECISIONS, 7). Leer `isEnabled` no vuelve dinámicas las páginas.
 * La acción de salir viene de su propio archivo, sin `datos/auth`: este
 * componente vive en el layout del sitio y no puede arrastrar el cliente de
 * Prisma a cada render de la home.
 */
export async function FranjaDeBorrador() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <aside
      role="status"
      className="fixed inset-x-0 bottom-0 z-[300] flex flex-wrap items-center justify-center gap-x-3 bg-azul-principal px-4 py-2 font-sans text-sm text-white"
    >
      <span>Estás viendo un borrador</span>
      <span aria-hidden="true">·</span>
      <form action={salirDeVistaPrevia}>
        <RutaActual />
        <button type="submit" className="underline underline-offset-2 hover:opacity-80">
          Volver al sitio publicado
        </button>
      </form>
    </aside>
  );
}
```

- [ ] **Step 3: El layout del sitio.** En `apps/sitio/src/app/(sitio)/layout.tsx`:

1. Sumar `import { draftMode } from "next/headers";` después del import de
   `Metadata`, y `import { FranjaDeBorrador } from "@/components/layout/FranjaDeBorrador";`
   después del de `AterrizajePorLink`.
2. Renombrar `export const metadata: Metadata = {` a `const METADATA: Metadata = {`
   (el objeto no cambia) y agregar debajo:

```ts
/**
 * En Draft Mode el sitio manda `noindex`: un borrador no se indexa (SPEC §6).
 * Leer `draftMode()` acá no vuelve dinámicas las páginas: en el prerender
 * responde «apagado» y la metadata queda igual que antes.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  return isEnabled ? { ...METADATA, robots: { index: false, follow: false } } : METADATA;
}
```

3. Dentro de `<body>`, antes de `<LenisProvider>`:

```tsx
        {/* Solo se ve con la cookie de Draft Mode (vista previa del admin). */}
        <FranjaDeBorrador />
```

- [ ] **Step 4: El sitio sigue compilando sin base.** Es el build de A0 y de
A5.13 repetido después de tocar el layout, porque la franja es el camino más
corto para que `datos/auth` se cuele en la home:

```bash
DATABASE_URL= DATABASE_URL_UNPOOLED= pnpm --filter sitio exec next build > /dev/null 2>&1 && echo "build sin base ok"
grep -rn "datos/auth\|datos/acciones/vista-previa\|datos/acciones/paginas\|datos/acciones/fotos" apps/sitio/src/components apps/sitio/src/features "apps/sitio/src/app/(sitio)" apps/sitio/src/datos/consultas/paginas.ts || echo "el sitio no toca datos/auth ni las acciones del admin"
```

Esperado: `build sin base ok` y la frase (`salir-de-vista-previa.ts` pasa el
filtro porque no importa ninguno).

- [ ] **Step 5: El render sigue idéntico.** Con `.env.local` (si falta
`../ed-render-antes`, rehacerla con los comandos de A4.1):

```bash
pnpm build > /dev/null 2>&1 && node scripts/comparar-render.mjs ../ed-render-antes apps/sitio
```

Esperado: `N páginas, render idéntico.` (el `<head>` no cambia: sin la cookie,
`generateMetadata` devuelve el mismo objeto de siempre).

- [ ] **Step 6: Verificar en el navegador** (server de dev levantado con
`.env.local`, sesión con la cuenta local de las Restricciones; una pestaña B
con `/` abierta sin tocar):

1. `/admin` → «Ir a Páginas» → `/admin/paginas`: siete filas en el orden del
   menú; solo Inicio tiene «Editar»; las demás dicen «Todavía no se edita
   desde acá»; todas «Muestra el contenido inicial del código».
2. «Editar» → `/admin/paginas/inicio`: la barra con «Todavía muestra el
   contenido inicial del código», el bloque «Hero» con Título (56/60),
   Bajada, Botón principal (naranja), Botón secundario, Tarjetas
   (computadora) 1–11 con foto, alt y cartel (marcado en 1, 3, 5, 6, 8 y 11),
   Tarjetas (celular) 1–8. Solo «Publicar» es naranja.
3. Cambiar el título (sumar «hoy» al final) → «Hay cambios sin guardar» →
   «Guardar borrador» → «Borrador guardado hace un momento por Facundo, sin
   publicar» y el aviso verde. Recargar B: sigue el título viejo.
   `/admin/paginas` marca «Cambios sin publicar» en Inicio.
4. «Vista previa» → pestaña nueva con `/`: título nuevo y la franja abajo.
   Navegar a `/novedades` y a una ficha (`/novedades/relime-2025`): la franja
   sigue; «Volver al sitio publicado» desde la ficha → sin franja, título
   viejo en `/`, y la URL sigue siendo la de la ficha. En la pestaña de vista
   previa, `view-source:` mostraba `<meta name="robots" content="noindex, nofollow">`.
5. Vaciar el título → «Guardar borrador» → aviso rojo «Este texto no puede
   quedar vacío. (en titulo)»; restaurar.
6. Tarjeta 1: escribir un alt, elegir un jpg/png/webp de menos de 4 MB,
   «Subir foto» → la miniatura cambia; clic en una esquina de la miniatura →
   el punto se mueve. Comprobar `ls apps/sitio/.fotos` (un archivo
   `<uuid>.<ext>`) y la fila:
   `docker exec ed-postgres psql -U postgres -d ed -c 'select id, alt, ancho, alto, tipo, "subidaPor" from fotos'`
   (las columnas de `Foto` no llevan `@map`, así que van con mayúsculas y
   entre comillas; el `id` coincide con el nombre del archivo). Un `.gif`
   renombrado a `.jpg` → «El archivo no es una imagen jpg, png o webp.» Un
   archivo de más de 4 MB → «La foto pesa más de 4 MB: achicala antes de
   subirla.» sin que el editor se rompa ni pierda el título.
7. «Guardar borrador», «Vista previa»: la primera tarjeta del hero muestra la
   foto nueva recortada alrededor del punto elegido (probar con el foco en
   una esquina para verlo).
8. «Publicar» → «Publicado: el sitio ya muestra esta versión.» y la barra
   pasa a «Publicado el … por Facundo.» Recargar B: título y foto nuevos.
   `/admin/paginas`: «Publicado el …» y sin marca.
9. Cambios cruzados: dos pestañas del editor, C y D. En C cambiar la bajada
   y guardar. En D cambiar el título y guardar → «Facundo guardó este
   borrador hace un momento. Recargá para ver sus cambios antes de guardar
   los tuyos.» y nada se pisa.
10. «Descartar» → confirmar → la página recarga con lo publicado y sin marca.
11. Sin sesión: con el editor abierto, «Salir» desde otra pestaña, volver al
    editor sin recargar y tocar «Guardar borrador» → «Hay que entrar al admin
    para guardar.» «Vista previa» → «Hay que entrar al admin para ver la
    vista previa.» y `curl -s -D - -o /dev/null http://localhost:3000/ | grep -i set-cookie`
    no muestra ninguna cookie: el borrador no se sirve sin la acción.
12. Sin red: con el editor abierto, frenar `pnpm dev`, cambiar el título y
    «Guardar borrador» → el aviso «No hubo respuesta del servidor…» y el
    título sigue en pantalla; levantar `pnpm dev` y guardar de nuevo → pasa.
13. El overlay de Next sin issues nuevos en el sitio ni en el admin.

- [ ] **Step 7: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/components/layout/FranjaDeBorrador.tsx apps/sitio/src/components/layout/RutaActual.tsx "apps/sitio/src/app/(sitio)/layout.tsx"
git commit -F - <<'MSG'
feat(sitio): la franja de borrador y el noindex en vista previa

Con la cookie de Draft Mode el sitio avisa que es un borrador, deja
volver a lo publicado en la misma página y manda noindex. Sin la
cookie el HTML queda idéntico, y la franja no arrastra datos/auth: la
home sigue cargando sin base.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

---

### Task A9: Cierre

**Files:**
- Modify: `README.md` (secciones «Variables de entorno» y «Admin»)
- Modify: `AGENTS.md` §3, §12 y §13 (con OK)
- Modify: `work/edicion-de-paginas/PROGRESS.md`

- [ ] **Step 1: README, «Variables de entorno».** La frase de arranque «**El
sitio público no necesita ninguna**: compila y corre sin `.env.local`. El
admin sí las necesita todas:» pasa a:

```markdown
**El sitio público no necesita ninguna**: corre sin `.env.local` y compila sin
base (con `DATABASE_URL` vacía; la URL se lee en la primera consulta). El
admin sí las necesita todas, y el build completo pide al menos
`BETTER_AUTH_SECRET`, porque la sesión se arma al cargar el admin:
```

Y el párrafo que empieza «Las dos que siguen están **declaradas pero todavía
no conectadas**» y sus dos viñetas quedan así:

```markdown
`BLOB_READ_WRITE_TOKEN` — fotos a Vercel Blob. **Con el token, las fotos que
sube el admin van a Blob; sin él (local) van a `apps/sitio/.fotos/`**,
git-ignorada, y las sirve `/api/fotos/<id>`. No hace falta cargarlo en local.

La que sigue está **declarada pero todavía no conectada**: hoy ningún código
la lee, y ponerla no cambia nada.

- `RESEND_API_KEY` — correos del admin. **Mientras tanto el enlace de
  «olvidé mi contraseña» sale siempre por la consola del servidor**, con clave
  o sin ella.
```

- [ ] **Step 2: README, «Admin».** Reemplazar la frase de la intro «Hoy tiene
los cimientos —entrar, salir y elegir contraseña— y **nada de contenido
todavía**: las novedades, la biblioteca, los casos y el equipo llegan en las
fases siguientes.» por:

```markdown
Hoy tiene los cimientos —entrar, salir y elegir contraseña—, la portada con las
métricas y **la edición del hero de Inicio** (ver «Editar las páginas»); las
novedades, la biblioteca, los casos y el equipo llegan en las fases siguientes.
```

y agregar, entre «Levantarlo en local» y «Las métricas», una subsección con
el encabezado `### Editar las páginas` (nivel `###`, como sus vecinas) y
este cuerpo:

```markdown
En «Páginas» están las siete del sitio en el orden del menú; por ahora se
edita el **hero de Inicio** (textos, botones y las 11 + 8 fotos con sus
carteles), y cada sección nueva se suma escribiendo su esquema en
`src/features/<pagina>/contenido/` y anotándola en `src/contenido/paginas.ts`.
Guardar **no publica**: cada página tiene un borrador y una versión publicada;
«Vista previa» abre el sitio con el borrador (Draft Mode de Next, solo con
sesión, con una franja abajo para volver) y «Publicar» lo pasa al sitio y
regenera la página. Las fotos se suben desde el formulario (jpg, png o webp de
hasta 4 MB, con texto alternativo obligatorio y punto de foco): con
`BLOB_READ_WRITE_TOKEN` van a Vercel Blob; sin él, a `apps/sitio/.fotos/`
(git-ignorada), servida por `/api/fotos/<id>`. Sin base el sitio muestra el
contenido inicial del código y carga igual. Diseño y decisiones en
[`work/edicion-de-paginas/`](work/edicion-de-paginas/).
```

- [ ] **Step 3: AGENTS.md** (con OK; tres lugares).

**§3, el árbol**, dentro de `src/`:

- bajo `datos/`: cambiar `consultas/   ← lo que lee el sitio (fase 2)` por
  `consultas/   ← lo que lee el sitio y el admin (paginas, editor-de-paginas, metricas)`
  y `acciones/    ← Server Actions que escribe el admin (fase 2)` por
  `acciones/    ← Server Actions del admin (paginas, vista-previa, fotos, metricas)`.
- bajo `admin/`: sumar `│   ├── paginas/     ← «Páginas» y el editor (lista, barra, secciones)`
  y `│   ├── campos/      ← los controles del formulario; se mudan a kit-admin en la fase 2`.
- bajo `features/`: sumar `│   └── <pagina>/contenido/ ← esquema Zod + contenido inicial de cada sección (hero.ts)`.
- sumar `├── contenido/     ← el registro: páginas → secciones → esquemas (paginas.ts)`
  entre `admin/` y `middleware.ts`.
- bajo `lib/`: cambiar por `└── lib/           ← hooks/, metricas/, contenido/ (tipos de campo, fotos, almacén: sin dominio de ED)`.

**§12, la nota «Qué de esto ya existe»**: la última frase «Lo único que todavía
no existe es `packages/kit-admin`, que nace en la fase 2 contra una entidad de
verdad, y las tablas de contenido.» pasa a:

```markdown
> Lo único que todavía no existe es `packages/kit-admin`, que nace en la fase 2
> contra una entidad de verdad. De las tablas de contenido existen `paginas` y
> `fotos` (`work/edicion-de-paginas/`); las de las entidades llegan con ellas.
```

**§12, la regla «Nada de meta-capa de configuración para los formularios»**:
queda como está y se le agrega, a continuación, la excepción acordada
(«Lo que este plan fija», 9; el texto exacto es el que aprobó Facundo antes de
A2):

```markdown
  **Una excepción, acotada:** las páginas —documentos validados por el esquema
  Zod de cada sección (`work/edicion-de-paginas/SPEC.md` §4.1)— generan su
  formulario desde ese esquema, con tipos de campo cerrados
  (`lib/contenido/campos.ts`) y un dibujante recursivo (`admin/campos/Campo.tsx`).
  Las entidades (novedades, materiales, casos, equipo, aliados) siguen
  escribiendo el suyo a mano con los primitivos del kit. La diferencia con
  Payload es el tamaño y el borde: seis tipos, una descripción serializable de
  una pantalla, y nada de colecciones ni de configuración abierta.
```

**§13**, después de la línea de «Admin, fase 1 — cimientos», sumar:

```markdown
- [x] **Páginas, fase A — Inicio → Hero de punta a punta:** las tablas
      `paginas` y `fotos`, los tipos de campo, el registro, el editor con
      borrador, vista previa (Draft Mode) y publicar, y las fotos en Blob o en
      disco. El hero del sitio lee por props. Diseño en
      `work/edicion-de-paginas/`.
```

- [ ] **Step 4: PROGRESS.** En `work/edicion-de-paginas/PROGRESS.md`:
`Rama` pasa a `feat/edicion-de-paginas` (sobre `main` 2ac8a57); el
`Estado` a «fase A implementada (A0–A9) y revisada tarea por tarea; PR en
preparación»; sumar el link al plan en la línea de Spec
(`**Plan:** [\`PLAN.md\`](PLAN.md)`); y en «Hecho» una línea por tarea **con
la fecha real en que se terminó cada una** (la pone quien ejecuta; nada de
fechas inventadas), en el estilo de `work/metricas/PROGRESS.md`. Qué dice cada
línea:

- A0: `datos/cliente.ts` lee `DATABASE_URL` en la primera consulta; el build sin base, que fallaba en `/api/cron/metricas`, pasa.
- A1: `prisma/schema/paginas.prisma` (Pagina, Foto sin foco y con id uuid) y su migración.
- A2: `lib/contenido/fotos.ts` (ValorFoto, `src` acotado, foco), `campos.ts` (textoCorto, parrafo, foto, rutaInterna, listaFija, grupo con metadata en un registro de Zod), `describir.ts` (esquema → árbol serializable), `documento.ts` (completar y validar por sección); `RUTAS_INTERNAS` en nav.ts; tests.
- A3: `@vercel/blob`; `lib/contenido/imagen.ts` (tipo por bytes con sharp), `almacen.ts` (disco/Blob); `/api/fotos/[id]`; `subirFoto`; `.fotos/` ignorada; `bodySizeLimit` 5mb.
- A4: `features/home/contenido/hero.ts` (esquema + inicial), `geometria-hero.ts`, el registro `contenido/paginas.ts`; el hero lee por props; `hero-cards.ts` borrado; render idéntico comprobado con `comparar-render.mjs`.
- A5: `consultas/paginas.ts` (contenidoDe, Draft Mode, sin base), `consultas/editor-de-paginas.ts`, `acciones/editar-paginas.ts` (+ test de integración), `acciones/paginas.ts`, `acciones/vista-previa.ts`, `acciones/salir-de-vista-previa.ts`; `page.tsx` lee de la base.
- A6: `Momento` y los controles de `admin/campos/` (con el tope de tamaño en el navegador).
- A7: «Páginas» y el editor (barra con estado relativo, secciones, acciones en try/catch).
- A8: la franja de borrador y el `noindex`; verificado en el navegador (los 13 puntos del plan) y el sitio sin base.
- A9: README, AGENTS.md §3/§12/§13, este PROGRESS.

En «Abierto»: lo que quedó de la verificación, más «Cargar
`BLOB_READ_WRITE_TOKEN` en Vercel (Mateo/Gastón) y probar una subida en
producción», «Mover el punto de foco con el teclado (hoy solo con clic)»,
«Fase B: ¿Quiénes somos? y Misión con `textoConResaltado`», y «Las decisiones
del SPEC §12 con Gastón y Mateo (incluida la excepción a AGENTS.md §12)».

- [ ] **Step 5: Gates completos y build**

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs && pnpm --filter sitio test && pnpm build > /dev/null 2>&1 && echo "todo en verde"
```

Esperado: `todo en verde`. Si react-doctor baja de 100 por un componente
largo, se parte (el candidato es `CampoFoto.tsx`: la subida a `SubirFoto.tsx`
en la misma carpeta) antes de seguir.

- [ ] **Step 6: Commits** (con OK)

```bash
git add README.md work/edicion-de-paginas/PROGRESS.md
git commit -F - <<'MSG'
docs(work): cerrar la fase A de la edición de las páginas

El README cuenta cómo se editan las páginas y que Blob ya está
conectado; PROGRESS deja la fase A hecha, tarea por tarea, y lo que
queda abierto para B.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
git add AGENTS.md
git commit -F - <<'MSG'
docs(agents): el registro de contenido y el editor en el árbol

El árbol de §3 suma contenido/, lib/contenido/, features/*/contenido/
y admin/{paginas,campos}; §12 registra la excepción acotada al
formulario desde el esquema y que ya existen dos tablas de contenido;
§13 marca la fase A de páginas.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
MSG
```

- [ ] **Step 7: Push y PR** (con OK). `git push -u origin feat/edicion-de-paginas`
(el `pre-push` corre el gate) y el PR contra `main`, título
`feat(paginas): editar el hero de Inicio desde el admin`, con este cuerpo:

```markdown
**Qué**

La fase A de la edición de las páginas (`work/edicion-de-paginas/SPEC.md` §10):
el hero de Inicio se edita desde el admin de punta a punta.

- Tablas `paginas` (un documento por página, publicado + borrador) y `fotos`.
- Tipos de campo en `lib/contenido/campos.ts` (Zod 4 con metadata) y el
  formulario que sale del esquema (`describir.ts` → `admin/campos/`).
- El registro `contenido/paginas.ts`; el esquema y el contenido inicial del
  hero en `features/home/contenido/hero.ts` (reemplaza a `hero-cards.ts`).
- `datos/cliente.ts` lee `DATABASE_URL` en la primera consulta: el build sin
  base, roto desde métricas, vuelve a pasar.
- El sitio lee por `contenidoDe("inicio")` y pasa el contenido por props; sin
  base muestra el inicial y compila igual (comprobado con `comparar-render`
  sobre el build con y sin `DATABASE_URL`).
- «Páginas» y el editor: guardar borrador (con chequeo de cambios cruzados),
  vista previa con Draft Mode (franja abajo + `noindex`), publicar
  (`revalidatePath`) y descartar.
- Fotos: subida con tipo por bytes (`sharp`), alt obligatorio, punto de foco,
  tope de 4 MB chequeado en el navegador y en el servidor; Blob en Vercel y
  `apps/sitio/.fotos/` en local (`/api/fotos/[id]`).

**Decisiones que cambian el spec**

Anotadas en `DECISIONS.md` y enmendadas en el SPEC: el valor de `foto()` es
`{ src, alt, foco }` con el `src` acotado; `Foto` sin foco y con id uuid;
`rutaInterna(rutas)` recibe la lista; las fotos pesan hasta 4 MB (Vercel corta
en 4,5); publicar deja `borrador` en null; la franja va abajo; el formulario
sale del esquema como excepción acotada a AGENTS.md §12. Las del SPEC §12
siguen para hablar con Gastón y Mateo.

**Cómo probarlo**

`pnpm dev`, entrar a `/admin` con la cuenta local, «Ir a Páginas» → Inicio →
Editar. Los trece puntos están en `PLAN.md`, tarea A8, paso 6. Tests:
`pnpm --filter sitio test` (los de integración piden el Postgres local).

**Capturas**

- La lista de páginas.
- El editor con el bloque Hero abierto y una tarjeta con foto y foco.
- La vista previa con la franja de borrador.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Después del merge (rebase, como pide AGENTS.md §5.7): borrar
`../ed-render-antes` y `../ed-build-sin-base.log`.

---

## Autorrevisión

**Cobertura del spec.**

| SPEC | Dónde |
| --- | --- |
| §1 formulario por sección, borrador/vista previa/publicar, Inicio → Hero primero | A7 (Seccion, BarraDeAcciones), A5, A4 |
| §2 «Páginas» con marca «sin publicar» y fecha de publicación | A5 `listaDePaginas`, A7 `ListaDePaginas` |
| §2 textos con máximo y contador; ayuda en llano | A2 `textoCorto`, A6 `TextoCorto`; `ayuda` del hero en A4 |
| §2 fotos con miniatura recortada, alt obligatorio, punto de foco | A3 `subirFoto`, A2 `foto()`, A6 `CampoFoto` (marco 4/3, DECISIONS 8) |
| §2 listas fijas con la cantidad exacta y el aviso | A2 `listaFija`, A6 `ListaFija`, ayuda «Son 11 tarjetas…» en A4 |
| §2 enlaces internos de lista cerrada | A2 `rutaInterna` + `RUTAS_INTERNAS`, A6 `RutaInterna` |
| §2 barra fija con tres acciones y estado en llano («hace 3 minutos» / «el 21/9 a las 14:05 por Raquel») | A7 `BarraDeAcciones` + `Momento` relativo (A6) |
| §2 cambios cruzados sin pisar | A5 `guardarBorradorEnBase` (+ test), A8 paso 6.9 |
| §3 el archivo de datos desaparece | A4 borra `hero-cards.ts` |
| §4.1 esquema por sección + registro; el formulario sale del esquema | A4 `hero.ts`, `contenido/paginas.ts`; A2 `describir`, A6 `Campo` (excepción a AGENTS §12, con OK, A9) |
| §4.2 tipos de campo (menos `textoConResaltado`: fase B) | A2 |
| §4.2 validar al leer y volver al inicial con aviso | A2 `completarPagina`, A5 `contenidoDe` |
| §4.3 / §4.4 tablas | A1 (con DECISIONS 10) |
| §4.4 subida: tipo por bytes, medidas, Blob/disco, `/api/fotos/[id]` | A3 |
| §5 `contenidoDe`, estático, sin base, props, `split` por palabra | A5, A4 `HeroCopy`; A0 arregla el build sin base y A5.13/A8.4 lo repiten |
| §6 vista previa con Draft Mode, solo con sesión, franja, `noindex` | A5 `vista-previa.ts` + `salir-de-vista-previa.ts`, A8 |
| §7 guardar / publicar (`revalidatePath`) / descartar / `subirFoto` | A5, A3 |
| §8 dónde vive el código | Estructura de archivos (con las divisiones de DECISIONS 5) |
| §9 seguridad (sesión, Zod, lista cerrada, alt, escape, `src` acotado) | A2, A3, A5; el redirect de salir solo a rutas del sitio (por prefijo) |
| §11 pruebas unitarias, de integración y en el navegador | A2/A3/A5 tests, A8 paso 6 |

Fuera de esta fase, a propósito: `textoConResaltado`/`resaltado.ts` (B), las
otras secciones y páginas (B, C), los duplicados y regenerar dos rutas al
publicar (D). Las enmiendas al texto del SPEC (I5 de la revisión) las hace el
controlador, no este plan.

**Placeholders.** No hay «TBD», «similar a», fechas inventadas ni pasos sin
código: cada archivo nuevo está entero; las modificaciones muestran el texto
exacto. Las fechas de PROGRESS las pone quien ejecuta.

**Tipos.** `ResultadoDeGuardar` (A5) es lo que `EditorDePagina` (A7) lee
(`borradorEn`, `borradorPor`); `ResultadoDePublicar` trae `publicadoEn`,
`publicadoPor` y `ruta`, que usan `publicar` (revalidate) y el editor;
`Descripcion` (A2) es lo que `paginaParaEditar` (A5) devuelve y `Campo` (A6)
recorre; `ValorFoto` y `MAXIMO_BYTES` (A2, `fotos.ts`) los usan `foto()`
(A2), `subirFoto` (A3) y `CampoFoto` (A6); `estiloDeFoco` (A2) lo usan los
dos campos del hero (A4); `ContenidoDe<"inicio">` (A4) es `{ hero: Hero }`,
lo que `page.tsx` desarma en A5; `RegistroDePaginas` (A2) es lo que `PAGINAS`
satisface (A4) y lo que `editar-paginas.ts` recibe inyectado (A5);
`salirDeVistaPrevia` (A5, archivo propio) es lo que `FranjaDeBorrador` (A8)
importa. Los nombres de las acciones coinciden entre `acciones/*` y sus
llamadas en el editor.

**Sin base.** Desde A0 importar `datos/cliente` no lee el entorno, y
`consultas/paginas.ts` no consulta sin `DATABASE_URL`; `salir-de-vista-previa.ts`
no importa `datos/auth`. A0, A5.13 y A8.4 corren el build sin base y A5.13
compara el render con y sin ella.
