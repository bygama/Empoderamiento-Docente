# Empoderamiento Docente — Sitio institucional

Sitio web institucional de **Empoderamiento Docente (ED)**, organización de
desarrollo profesional docente dirigida por **Daniela Reyes-Gasperini**, con
presencia en Chile, México y Argentina. El sitio comunica la oferta formativa
(talleres, cursos, diplomaturas), posiciona la marca y capta docentes vía CTA
de envío de CV.

> Onboarding humano. Si sos una IA trabajando en el repo, empezá por
> [`AGENTS.md`](AGENTS.md) (contrato AI-neutral). El dominio y la jerga están
> en [`docs/GLOSSARY.md`](docs/GLOSSARY.md).

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first: el tema vive en
  `apps/sitio/src/app/globals.css` con bloque `@theme`, sin
  `tailwind.config.js`)
- **GSAP 3** + **Lenis** (animaciones y smooth scroll)
- **Zod 4** (validación de bordes; se usa cuando aparezcan formularios)
- **pnpm 11** (pinned vía `packageManager`), **Node ≥ 22**

**Backend / persistencia:** **Neon** (Postgres) con **Prisma**, y un **admin a
medida** en `/admin` con **better-auth**, con fotos en Vercel Blob y correos por
Resend. Ver [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md) y
[ADR-0007](docs/architecture/adrs/0007-prisma-como-orm.md).

> **Estado:** el admin tiene sus cimientos —entrar, salir y elegir contraseña—
> y todavía ninguna pantalla de contenido. El plan de las fases que faltan, en
> [la spec](docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md) §9,
> y cómo levantarlo, más abajo en [Admin](#admin).

Versiones exactas en [`apps/sitio/package.json`](apps/sitio/package.json):
el repo es un workspace pnpm y las dependencias viven en la app.

---

## Requisitos

- **Node ≥ 22**
- **pnpm 11** (el repo fija la versión vía `packageManager`; usá
  [Corepack](https://nodejs.org/api/corepack.html) o instalá pnpm 11).

---

## Getting started

```bash
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo en http://localhost:3000
```

Otros scripts:

```bash
pnpm build        # build de producción
pnpm start        # servir el build de producción
pnpm lint         # ESLint (eslint-config-next)
pnpm typecheck    # TypeScript (tsc --noEmit)
```

Los comandos de base de datos están más abajo, en [Admin](#admin).

Antes de abrir un PR: `pnpm lint`, `pnpm typecheck` y `pnpm build` en verde
(ver [Pre-PR checklist en `AGENTS.md`](AGENTS.md) §10).

---

## Variables de entorno

**El sitio público no necesita ninguna**: corre sin `.env.local` y compila sin
base (con `DATABASE_URL` vacía; la URL se lee en la primera consulta). El
admin sí las necesita todas, y el build completo pide al menos
`BETTER_AUTH_SECRET`, porque la sesión se arma al cargar el admin:

- `DATABASE_URL` y `DATABASE_URL_UNPOOLED` — conexión a Postgres (Docker en
  local, Neon en Vercel). La segunda es la directa, sin pooler: el pooler corta
  las transacciones largas de una migración.
- `NEXT_PUBLIC_SITE_URL` — URL pública del sitio (pública, cliente).
- `BETTER_AUTH_SECRET` — firma las sesiones del admin. Sin esto no arranca.

`BLOB_READ_WRITE_TOKEN` — fotos a Vercel Blob. **Con el token, las fotos que
sube el admin van a Blob; sin él (local) van a `apps/sitio/.fotos/`**,
git-ignorada, y las sirve `/api/fotos/<id>`. No hace falta cargarlo en local.

Las dos de los **CV** ([ADR-0012](docs/architecture/adrs/0012-mensajes-cv-privados-y-retencion.md);
ver «Mensajes» más abajo):

- `CV_BLOB_READ_WRITE_TOKEN` — el token del **store privado** de los CV, otro
  que el de las fotos. Sin él, en local los CV van a `apps/sitio/.cv/`
  (git-ignorada); en Vercel, sin él el CV no se recibe.
- `CV_ABIERTO` — **el ajuste que enciende el formulario de CV**: `si` lo
  prende. Sin él, `/sumate-al-equipo` y `/api/cv` dan 404 y «Sumate al
  equipo» sigue abriendo el correo.

Las dos de los **correos** del admin («Elegí tu contraseña», «Tu contraseña
cambió»; ver «Correos» más abajo):

- `RESEND_API_KEY` — la clave de Resend. **Sin ella, en local el correo sale
  entero por la consola del servidor**, con el enlace; en producción no sale, y
  el log lo dice sin mostrar el enlace.
- `CORREO_REMITENTE` — desde qué dirección salen, de un dominio verificado en
  Resend: `Empoderamiento Docente <no-responder@empoderamientodocente.org>`.
  Con clave y sin remitente, el correo no sale.

Las cuatro de las **métricas** ([ADR-0009](docs/architecture/adrs/0009-analitica-de-vercel-con-copia-diaria.md);
Métricas, en el admin, lee una copia diaria de la analítica de Vercel):

- `VERCEL_TOKEN` — token de la cuenta de Vercel para la API de Web Analytics.
  **Abre toda la cuenta**: solo en Production y en tu `.env.local`, nunca en
  un preview ni con `NEXT_PUBLIC_`.
- `VERCEL_ANALYTICS_PROJECT_ID` — el `prj_…` del proyecto (Settings → General).
- `VERCEL_TEAM_ID` — vacío en una cuenta personal; el `team_…` si es un equipo.
- `CRON_SECRET` — lo que el cron diario manda en `Authorization`; Vercel lo
  inyecta si existe. Sin él, `/api/cron/diario` responde 401 a todo.

Las tres de las **búsquedas** ([ADR-0011](docs/architecture/adrs/0011-search-console-y-un-solo-cron.md);
Métricas › Búsquedas lee una copia diaria de Search Console). Salen del JSON
de una cuenta de servicio de Google Cloud; los pasos para crearla están en «Las
métricas y lo programado», más abajo:

- `SEARCH_CONSOLE_CLIENT_EMAIL` — el `client_email` de ese JSON.
- `SEARCH_CONSOLE_PRIVATE_KEY` — el `private_key`, entero y entre comillas;
  acepta los `\n` escritos, como queda al pegarlo en una variable.
- `SEARCH_CONSOLE_SITE_URL` — la propiedad: `sc-domain:empoderamientodocente.org`
  si es de dominio, o `https://empoderamientodocente.org/` si es de prefijo.

Con las mismas tres, una tarea del cron revisa si cada página del sitemap está
en Google (la API de inspección de URL; Ajustes › SEO). Sin las tres,
Búsquedas dice que no está conectado y ni la copia ni la revisión tocan la
API; en local no hace falta cargarlas.

Todas menos `NEXT_PUBLIC_SITE_URL` son secretas y **solo server-side**. Los
placeholders viven en
[`apps/sitio/.env.example`](apps/sitio/.env.example): las variables son de la
app, no del workspace. Los `.env*` reales están git-ignorados.

---

## Estructura del proyecto

```
/
├── AGENTS.md              ← contrato AI-neutral (fuente de verdad)
├── CLAUDE.md             ← adapter para Claude Code (puntero a AGENTS.md)
├── DESIGN.md              ← sistema de diseño (tokens, tipos, reglas)
├── docs/                  ← documentación auxiliar (ver docs/README.md)
├── scripts/               ← hooks, el gate, la guarda de Prisma, comparar-render
├── package.json           ← raíz del workspace: delega en las apps + el gate
├── pnpm-workspace.yaml    ← packages: ["apps/*", "packages/*"]
├── packages/              ← lo reutilizable, sin dominio de ED
│   ├── db/     ← cliente Prisma, slugs, redirecciones
│   ├── auth/   ← better-auth configurado, permisos, guarda
│   └── kit-admin/  ← los controles de los formularios del admin (su README: los tokens)
└── apps/
    └── sitio/             ← el sitio y su admin (por ahora, la única app)
        ├── package.json   ← las dependencias viven acá, no en la raíz
        ├── .env.example   ← las variables son de la app
        ├── public/        ← assets estáticos (brand/, fotos/, aliados/, …)
        ├── prisma/        ← esquema y migraciones
        ├── (config)       ← tsconfig.json, eslint.config.mjs,
        │                     next.config.ts, postcss.config.mjs
        └── src/
            ├── app/(sitio)/   ← las páginas del sitio y su layout
            ├── app/(admin)/   ← las rutas del admin
            ├── datos/         ← la única puerta a la base
            ├── admin/         ← las pantallas del admin
            ├── proxy.ts       ← sesión, cabeceras (CSP con nonce en el admin)
            ├── correos/       ← las plantillas de los correos y por dónde salen
            ├── components/    ← UI reutilizable (brand/, layout/, ui/, …)
            ├── features/      ← secciones por dominio (home, novedades, …)
            ├── config/        ← site.ts (la marca) + nav.ts, y la forma de lo que edita Ajustes
            └── lib/           ← hooks/, correo/ (Resend), seguridad/ (CSP), red/ (el
                                  pedido protegido), metadatos/ (DOI, Crossref) y utilidades
```

El plan completo, en el [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md);
el kit y el modelo de una entidad, en el
[ADR-0014](docs/architecture/adrs/0014-kit-admin-y-modelo-de-entidad.md).

Es un **monorepo** (workspace pnpm): hoy hay una sola app y una segunda se
agregaría al lado, en `apps/`. Lo que se comparte entre proyectos va en
`packages/`, nunca en una app. Los comandos se corren desde la raíz, que
delega en la app. El porqué está en el
[ADR-0004](docs/architecture/adrs/0004-monorepo-apps.md) y en el
[ADR-0006](docs/architecture/adrs/0006-packages-reutilizables.md).

El theming de Tailwind v4 vive en `apps/sitio/src/app/globals.css` (bloque
`@theme`), no en `tailwind.config.js`. Los datos institucionales (mail,
WhatsApp, dirección, países, redes) se editan en Ajustes › Datos del sitio y
viven en la base (ver «Ajustes»); `apps/sitio/src/config/site.ts` guarda lo de
la marca.

---

## Documentación

La fuente de verdad sobre cómo opera el repo son los `.md` de la raíz y de
`docs/`. Índice completo en [`docs/README.md`](docs/README.md).

| Documento                                                              | Para qué sirve                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                               | Contrato para agentes IA: hard rules, quality standards, protocolos |
| [`CLAUDE.md`](CLAUDE.md) | Adapter de Claude Code: mapea `AGENTS.md` a sus herramientas, sin reglas propias |
| [`DESIGN.md`](DESIGN.md)                                               | Tokens visuales: colores, tipografía, espaciado, componentes        |
| [`docs/README.md`](docs/README.md)                                    | Índice de la documentación auxiliar                                 |
| [`docs/AI_GUIDELINES.md`](docs/AI_GUIDELINES.md)                      | Reglas de código IA-friendly (naming, TS, Tailwind, GSAP, backend)  |
| [`docs/COMMITS.md`](docs/COMMITS.md)                                   | Conventional Commits + atómicos + ejemplos                          |
| [`docs/GLOSSARY.md`](docs/GLOSSARY.md)                                 | Jerga del dominio ED                                                |
| [`docs/MESSAGING.md`](docs/MESSAGING.md)                               | Copy canónico de marca                                              |
| [`docs/conventions/CODE-STYLE.md`](docs/conventions/CODE-STYLE.md)    | Estilo que las tools no enforce-an + índice de configs              |
| [`docs/architecture/adrs/`](docs/architecture/adrs/README.md)         | Decisiones arquitectónicas (stack base, persistencia)              |

---

## Convenciones

- **Lenguaje inclusivo** siempre (`las y los`); nunca "alumnos" → siempre
  "estudiantes".
- **Tokens, no hardcodes**: colores y tipos viven en `DESIGN.md` / `@theme`.
- **Naranja solo para CTAs**; verde para conceptos; azul base.
- **Commits Conventional en español, imperativos y atómicos**
  (ver [`docs/COMMITS.md`](docs/COMMITS.md)).
- **`main` está protegida**: todo entra vía **PR + rebase** (sin push directo,
  historia lineal). Detalle en [`AGENTS.md`](AGENTS.md) §5.7.

---

## Deploy

El sitio corre en **Vercel**: preview por PR, producción desde `main`, con
**Root Directory = `apps/sitio`** (es un monorepo: Vercel instala desde la raíz
del workspace y buildea la app). La base es **Neon** (una rama por preview), las
fotos van a **Vercel Blob** y los correos a **Resend**; las cuatro piezas se
instalan desde el Marketplace de Vercel y escriben sus variables solas.
Variables propias en `apps/sitio/.env.example`.

Cuando llegue la fase 1 del admin, el build pasa a correr las migraciones de
Prisma antes de `next build`.

## Admin

Vive en `/admin`, construido a medida sobre **Prisma** y **better-auth**. Hoy
tiene los cimientos —entrar (con segundo factor por correo), salir y elegir
contraseña—, **un Inicio** con lo pendiente, los números de la semana y la
actividad reciente, **Cuentas** (invitar, cambiar roles, suspender y la
actividad; ver «Las cuentas»), **Métricas con sus búsquedas en Google** (ver
«Las métricas y lo programado»), **la edición de las páginas** (ver «Editar
las páginas»), **Mensajes**, lo que llega por los formularios del sitio (ver
«Mensajes»), **Novedades**, la primera entidad (ver «Novedades»),
**Ajustes**, lo que se configura una vez (ver «Ajustes»), y en Contenido **los
casos, los aliados y la biblioteca de fotos** (ver «Casos, aliados y fotos»);
la biblioteca de materiales y el equipo llegan en la fase siguiente.
El diseño completo está en
[`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`](docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md)
y el porqué en el [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md).

### Levantarlo en local

```bash
# 1. Un Postgres
docker run -d --name ed-postgres -e POSTGRES_PASSWORD=ed -e POSTGRES_DB=ed \
  -p 5435:5432 -v ed-postgres-datos:/var/lib/postgresql/data postgres:17

# 2. Las variables: copiar apps/sitio/.env.example a .env.local y completarlo.
#    El secreto de better-auth se genera así:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. El esquema
pnpm migrate

# 4. La primera cuenta. No hay registro público: las demás se invitan desde Cuentas.
pnpm --filter sitio crear-cuenta tu@correo.org "Tu nombre" administra
```

Después, `/admin/olvide-mi-contrasena` con ese correo. Sin `RESEND_API_KEY`
el correo sale entero **por la consola del servidor**, con el enlace. Con
`dirige` o `administra`, entrar pide además **un código de 6 dígitos por
correo** (el segundo factor, obligatorio para esos roles): en local también
sale por la consola.

Los roles son tres: `dirige`, `administra` y `edita` (sin rol, `edita`).
**Dirige es una sola persona, de ED y no del desarrollo**, y la base no deja
que haya dos. Para el desarrollo alcanza con `administra`; la primera persona
que dirige se nombra de una de dos maneras:

```bash
# Si todavía no tiene cuenta: se da de alta directamente con ese rol.
pnpm --filter sitio crear-cuenta quien-dirige@correo.org "Nombre y apellido" dirige

# Si ya tiene cuenta (el caso de producción: ya entraba al admin con otro rol).
pnpm --filter sitio nombrar-direccion quien-dirige@correo.org
```

Los dos se niegan, con un mensaje y sin tocar nada, si ya hay quien dirige; de
ahí en más, la dirección se pasa desde Cuentas.

> **Si ya tenías el contenedor de antes**, adentro vive una base `ed_panel` con
> las nueve tablas que dejó Payload. Quedó huérfana con la fase 0 y no la toca
> nadie: borrala cuando quieras con
> `docker exec ed-postgres psql -U postgres -c "DROP DATABASE ed_panel;"`.

### Las cuentas

En Cuentas (`/admin/cuentas`, solo quien dirige y quien administra) están las
personas con su rol, su último acceso y su estado, y qué puede cada rol. Desde
ahí se **invita** (correo, nombre y rol; llega «Elegí tu contraseña», que vence
a las 72 h y se puede reenviar o cancelar), se cambia el rol o el correo de
alguien, se le cierran las sesiones, y se **suspende en vez de borrar**: una
cuenta suspendida no entra, pero su nombre queda en la actividad. Borrar solo
se puede si nunca hizo nada. Quien dirige le pasa la dirección a otra persona
desde su cuenta, con su contraseña. **Actividad** (`/admin/cuentas/actividad`)
dice quién hizo qué y cuándo, con buscador y filtros. El segundo factor de cada
persona se activa en Mi cuenta › Seguridad (para `edita`; los otros dos roles
lo tienen siempre). Decisión en el
[ADR-0013](docs/architecture/adrs/0013-segundo-factor-por-correo.md).

### Editar las páginas

En Contenido › Páginas (`/admin/contenido/paginas`) están las siete del sitio
en el orden del menú. Se editan enteras, con su SEO:

- **Inicio**: el hero, «¿Quiénes somos?», «Misión», «En números», «Cómo
  trabajamos», «Áreas de especialización» y los textos de «Biblioteca y
  Novedades».
- **Qué hacemos**: el hero, la escena del faro, «Cómo trabajamos», las áreas,
  los niveles, los proyectos y el cierre.
- **Quiénes somos**: el hero, el origen, «Nuestra mirada» y los textos de
  «Quiénes sostienen ED»; las personas del equipo tienen su propio módulo.
- **Investigación**: el hero y los cuatro pasos de su historia, las seis
  líneas, el ciclo de investigación aplicada (las ocho estaciones, con su
  versión breve para la lámina), el título de los casos y el cierre.
- **Biblioteca**: el hero, la presentación de los destacados, el aviso del
  catálogo sin resultados, el puente a Investigación y el cierre.
- **Novedades**: el hero, las destacadas, «Lo último», «ED en movimiento»,
  «Recién salido» y el cierre; las novedades mismas, en su módulo.
- **Contacto**: el titular, la apertura (la frase pilar y el equipo) y el
  cierre. Los temas de consulta no: el envío guarda su título en cada mensaje.

Lo que muestran los casos, los materiales y las novedades se edita en su
módulo, no en la página; los destinos de los botones y los rótulos de interfaz
quedan en el código. Cada sección nueva se suma escribiendo su esquema en
`src/features/<pagina>/contenido/` y anotándola en `src/contenido/paginas.ts`,
y el SEO de una página, con su `seo` en el mismo registro: una página que no es
la raíz arma su metadata con `openGraphDeLaPagina(padre)`
(`src/config/metadata.ts`), o pierde la imagen del sitio al compartirse.

**Lo que dos páginas muestran igual se edita en una sola.** Las siete áreas y
las frases en verde del método viven en Qué hacemos, e Inicio las lee de ahí:
la tarjeta de la sección lo avisa en las dos páginas (en Inicio, con el link a
donde se edita), y publicar Qué hacemos regenera también Inicio. Se anota con
`usa` en la sección del registro que las toma
(`src/lib/contenido/compartido.ts`).

La pantalla de una página tiene cuatro pestañas:

- **Secciones** — los textos y las fotos. Lo resaltado se escribe entre
  **dobles asteriscos** («Somos `**una idea**`»), y cada campo que no pasa
  muestra su error ahí mismo.
- **SEO** — el título, la descripción y la imagen para redes, con cómo se ven
  en Google y al compartir el link. Los contadores avisan pasados los 60 y 160
  caracteres que muestra Google, pero no frenan.
- **Qué cambió** — el borrador contra lo publicado, campo por campo. Se puede
  publicar desde ahí.
- **Versiones** — las últimas 10 publicaciones, con quién y cuándo, y
  «Restaurar como borrador», que avisa lo que ya no entra en el esquema de hoy.

Guardar **no publica**: cada página tiene un borrador y una versión publicada;
«Vista previa» abre el sitio con el borrador (Draft Mode de Next, solo con
sesión, con una franja abajo para volver) y «Publicar» lo pasa al sitio,
regenera la página y guarda la versión. Si otra persona guardó el borrador
mientras tanto, nada se pisa: el aviso dice quién y cuándo, y ofrece
«Recargar». Las fotos se suben desde el formulario (jpg, png o webp de hasta
4 MB, con texto alternativo obligatorio y punto de foco), o se eligen entre
las ya subidas: con
`BLOB_READ_WRITE_TOKEN` van a Vercel Blob; sin él, a `apps/sitio/.fotos/`
(git-ignorada), servida por `/api/fotos/<id>`. Sin base el sitio muestra el
contenido inicial del código y carga igual. El diseño está en el
[spec del admin](docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md)
(§6).

> **No compartas una base con fotos locales entre entornos:** una foto subida
> sin `BLOB_READ_WRITE_TOKEN` queda con una URL de disco (`/api/fotos/<id>`
> sobre `apps/sitio/.fotos/`), y en cuanto el token aparece en ese entorno
> (por ejemplo, al promover a producción) esa URL da 404, porque el archivo
> nunca viajó a Blob.

### Casos, aliados y fotos

Tres pestañas de **Contenido**, con el molde de Novedades (borrador, vista
previa, «Qué cambió» y publicar):

- **Casos** (`/admin/contenido/casos`) — los cuatro de Investigación, que se
  editan pero no se crean ni se borran. Cambiar el slug al publicar deja el
  308 del viejo.
- **Aliados** (`/admin/contenido/aliados`) — los logos de la tira del pie, del
  Inicio y de Qué hacemos, en su orden. **Sin la marca «Autorizado» un logo no
  se publica nunca** (AGENTS.md §5.4): la ponen quien dirige o administra, con
  la nota de dónde consta, y la consulta del sitio filtra siempre por ella.
- **Fotos** (`/admin/contenido/fotos`) — todas las fotos del sitio, las
  subidas y las de `public/`, con su texto alternativo y **dónde se usa cada
  una**. Reemplazar el archivo reescribe la URL en todos sus usos en una
  transacción y recién después borra el archivo viejo; si ese borrado falla,
  la tarea diaria limpia los archivos que ninguna fila usa. Una foto se borra
  solo si no se usa. Un SVG no se sube: el de Techint entró con la migración,
  desde el repositorio.

### Las métricas y lo programado

**Métricas** (`/admin/metricas`) tiene cinco pestañas. **Resumen** muestra
cuánta gente entra al sitio: visitantes y vistas de los últimos 7 y 30 días,
contra el período anterior (el Inicio lo muestra también, hasta que se
rehaga). **Búsquedas** muestra qué buscó la gente en Google para llegar: clics,
impresiones y puesto de los últimos 28 días con datos, por búsqueda, página y
país, y «Casi nos encuentran». Origen, Qué hace la gente y Links para
compartir todavía muestran lo que van a tener.

Ninguna pantalla consulta a Vercel ni a Google al renderizar. **Un solo cron**
(`/api/cron/diario`, a las 4 UTC) corre cada día las tareas registradas en
`apps/sitio/src/datos/tareas/diarias.ts`, cada una aislada: la copia de Vercel
Analytics (a las tablas `metricas_*`), la de Search Console (a
`busquedas_diarias`), la revisión de la indexación (a `indexacion_de_urls`,
hasta 20 páginas por día: la API tiene cuota), la retención de Mensajes y la
salud de los links de la Biblioteca (ver [Biblioteca](#biblioteca)).
Cada corrida, bien o con su error en llano, queda en
`corridas_de_tareas`. «Actualizar ahora», en cada pantalla, corre su tarea a
mano, con un freno de diez minutos por tarea. Lo que necesite correr solo más
adelante se suma como una tarea en esa lista, no como un cron nuevo
([ADR-0011](docs/architecture/adrs/0011-search-console-y-un-solo-cron.md)).

Sin sus variables, cada copia lo dice y no toca la API; en local no hace falta
cargarlas. Los días de Vercel son UTC; los de Google, hora del Pacífico, y
llegan con 2 o 3 días de atraso.

**Para conectar Search Console**, una vez:

1. **ED:** verificar el dominio en [Search Console](https://search.google.com/search-console)
   con su cuenta de Google (un registro TXT en el DNS). La propiedad de
   dominio (`sc-domain:…`) cubre todas las URLs del sitio.
2. **Desarrollo:** en Google Cloud, crear un proyecto, habilitar la «Google
   Search Console API», crear una cuenta de servicio y bajar su clave en JSON.
3. **ED:** en Search Console › Configuración › Usuarios y permisos, agregar el
   correo de la cuenta de servicio (termina en `.iam.gserviceaccount.com`) con
   permiso **Restringido**: solo puede leer.
4. **Desarrollo:** cargar las tres variables `SEARCH_CONSOLE_*` en Vercel
   (Production). La primera copia trae los últimos 90 días.

### Correos

El admin manda **«Elegí tu contraseña»** (el enlace de «Olvidé mi
contraseña», que vence en una hora, y la invitación de Cuentas, que vence a las
72 h), **«Tu contraseña cambió»** (cada vez que alguien elige una, con las demás
sesiones ya cerradas), **«Tu código para entrar»** (el segundo factor) y **«El
correo de tu cuenta del admin cambió»** (a la dirección vieja y a la nueva); el
aviso de cada mensaje nuevo está en «Mensajes».
Salen por la API de Resend desde `CORREO_REMITENTE`; el del código se espera,
y si no salió la pantalla lo dice. Decisión y detalles en el
[ADR-0010](docs/architecture/adrs/0010-seguridad-del-acceso.md) y el
[ADR-0013](docs/architecture/adrs/0013-segundo-factor-por-correo.md).

> **Condición del primer deploy con Cuentas: Resend configurado y probado.**
> Desde el segundo factor, quien dirige y quien administra necesitan que les
> llegue el código para entrar: sin `RESEND_API_KEY` en producción, o con el
> dominio sin verificar, no entran. Probalo mandándote un código antes de
> publicar. Si igual alguien queda afuera, con acceso a la base se le pasa el
> rol a `edita` y se le apaga el segundo factor.

**Lo que tiene que hacer ED en Resend**, una vez, antes de que salgan correos
de verdad:

1. **Agregar y verificar el dominio** (`empoderamientodocente.org`, o el
   subdominio que se elija para enviar) y cargar en su DNS los registros que
   Resend muestra: **SPF** y **DKIM**.
2. **Publicar un registro DMARC** (`_dmarc`), que dice qué hacer con un correo
   que diga venir del dominio y no pase SPF ni DKIM. Arrancar con `p=none` y
   subir a `p=quarantine` cuando los reportes estén limpios.
3. **Apagar el click tracking** (y el open tracking) del dominio: reescribe los
   enlaces del correo para contar clics, y el de la contraseña pasaría por un
   tercero.
4. Crear una clave con permiso **solo de envío** y cargarla como
   `RESEND_API_KEY` en Vercel (Production), junto con `CORREO_REMITENTE`.

**Si una cuenta queda frenada** (5 contraseñas mal en 15 minutos frenan esa
cuenta de 15 minutos a 1 hora, aunque vengan de distintos lugares), se destraba
sola al vencer el freno o al elegir una contraseña nueva desde «Olvidé mi
contraseña».

### Novedades

En `/admin/novedades`, con dos pestañas: **Publicadas** y **Borradores**, y un
buscador por título. «Nueva novedad» abre la ficha vacía; el primer «Guardar
borrador» la crea. La ficha tiene el título, la bajada, la fecha (con la
precisión que da la fuente: año, mes o día), la categoría, la foto, si es la
destacada, el cuerpo en secciones, el material de la Biblioteca que abre y
la URL, que sigue al título hasta que se publica. Al costado, cómo se ve en
Google y al compartir el link —con la imagen para redes generada con el
título, o una propia con «Usar otra»— y dónde se ve en el sitio.

Como una página, guardar **no publica**: «Vista previa» muestra el borrador
en el sitio y «Publicar» lo pasa. Publicar con otra URL deja la vieja
llevando a la nueva (308); la destacada es una sola, y marcar otra la
desmarca. Despublicar la saca del sitio y la deja en Borradores; «Descartar
cambios» vuelve a lo publicado y «Borrar» se la lleva para siempre. Lo que se
publica, se despublica, se descarta o se borra queda en la actividad del
Inicio, y un borrador quieto hace más de 7 días aparece en sus pendientes.

El sitio las lee de la base en `/novedades`, en cada ficha
(`/novedades/<slug>`, solo las que tienen cuerpo), en el Inicio (las cuatro
más nuevas) y en el feed **`/novedades/rss.xml`**. Las nueve que había
entraron con la migración `novedades`. Los controles del formulario son de
`packages/kit-admin`; el modelo (lo publicado en columnas, el borrador en un
documento) es el que copian las entidades que siguen:
[ADR-0014](docs/architecture/adrs/0014-kit-admin-y-modelo-de-entidad.md).

### Biblioteca

En `/admin/biblioteca`, los materiales con su portada, título, autores, tipo y
año, un buscador y tres filtros: el tipo, el estado (publicados u ocultos) y
la salud (link roto, sin portada, datos incompletos). Es de los tres roles, y el número de la sidebar cuenta los
publicados con el link roto.

**«Agregar material» pide una sola cosa: el DOI, el ISBN o el link.** El
servidor busca los datos en Crossref, en OpenAlex o en la página misma (sus
etiquetas `citation_*`, o las de redes) y llena la ficha, que dice de dónde
salió cada dato; nada se guarda hasta «Guardar borrador». Un DOI que ya está
en la Biblioteca lo dice, y un título parecido avisa. Lo que no se encuentre
se escribe a mano: «Cargar a mano» abre la ficha vacía.

La ficha es la de una novedad: guardar no publica, «Vista previa» muestra el
borrador en `/biblioteca`, y «Publicar», «Ocultar», «Descartar cambios» y
«Borrar» quedan en la actividad del Inicio. Los autores son una lista, y cada
uno se puede enlazar al perfil de alguien del equipo. Si no hay portada ni
cita, el sitio usa las que se generan con los datos: la portada tipográfica
del color del tipo (`/biblioteca/portada/<id>`) y la cita APA, que la tarjeta
del sitio copia con «Copiar cita APA». Los cuatro lugares de «Destacados» se
eligen en la ficha.

**La salud de los links:** el cron diario chequea cada link publicado una vez
por semana, de a 15 por corrida. Un material con DOI se chequea en doi.org, y
uno con link, pidiendo la página; solo un 404, un 410 o un sitio que ya no
existe cuentan como roto, y ahí aparece en «Materiales con el link roto» del
Inicio. Todo lo que el servidor le pide a un link que escribió una persona
pasa por un pedido protegido: solo `https`, nunca a una dirección interna,
con tope de tamaño y de tiempo. Decisión en el
[ADR-0016](docs/architecture/adrs/0016-agregar-por-doi-y-salud-de-links.md).

El sitio lee los materiales de la base en `/biblioteca`, en los destacados del
Inicio y en la ficha de la novedad que abre uno. Los 57 que había entraron con
la migración `biblioteca`.

### Mensajes

Lo que llega por los formularios del sitio queda en `/admin/mensajes`, en dos
bandejas: **Contacto** (los tres roles) y **CV** (quien dirige y quien
administra). Cada mensaje nuevo avisa por correo a quien tenga activado ese
aviso en Mi cuenta o en Ajustes › Avisos, sin nada de lo que escribieron. Se
borran solos en el cron diario, a los plazos de Ajustes › Privacidad (de
fábrica, Contacto a los 24 meses, un CV a los 12 con su archivo, el spam a los
30 días). Decisión en el
[ADR-0012](docs/architecture/adrs/0012-mensajes-cv-privados-y-retencion.md) y,
los plazos editables, en el [ADR-0015](docs/architecture/adrs/0015-ajustes-en-la-base.md).

**El formulario de CV nace apagado.** Para encenderlo, en este orden:

1. **ED confirma qué datos pide** y se ajusta la lista de
   `apps/sitio/src/config/cv.ts` (la única que hay que tocar), y **publica la
   política de privacidad**, con asesoría.
2. **Crear el store privado** en Vercel (Storage → Blob, acceso **Private**, o
   `vercel blob create-store --access private`) y conectarlo al proyecto con
   el prefijo `CV_BLOB`: eso carga `CV_BLOB_READ_WRITE_TOKEN`. Es otro que el
   de las fotos, que es público: el acceso de un store no se cambia después.
3. **Cargar `CV_ABIERTO=si`** en Vercel (Production) y volver a deployar.

Mientras tanto, en local se prueba con `CV_ABIERTO=si` en el `.env.local`:
los PDF quedan en `apps/sitio/.cv/` y se bajan desde la ficha del CV.

### Ajustes

`/admin/ajustes`, solo para quien dirige y quien administra, reúne lo que se
configura una vez, en cinco pantallas:

- **Datos del sitio:** el correo, el WhatsApp, la dirección, los países y las
  redes. Viven en la tabla `datos_del_sitio` y **guardar es publicar**: el pie,
  el menú del celular, Contacto y los formularios cambian sin un deploy. Ya no
  se tocan en el código.
- **SEO:** las redirecciones (las que el sitio escribe solo al cambiar un slug
  y las que se agregan a mano; la ruta vieja contesta un 308), si cada página
  está en Google según Search Console, y el `sitemap.xml`, que arma el sitio
  solo con las rutas que existen.
- **Avisos:** quién recibe un correo con cada mensaje de Contacto y con cada
  CV (la misma preferencia que Mi cuenta › Avisos).
- **Privacidad:** los plazos de retención, con sus topes. Alargar vale para lo
  que llegue desde ahora; acortar vale para todo y, si borra algo, pregunta
  antes ([ADR-0015](docs/architecture/adrs/0015-ajustes-en-la-base.md)).
- **Conexiones:** Vercel Analytics, Search Console, Resend, los dos Blob y el
  cron: si tienen sus variables (por el nombre, nunca el valor) y cómo corrió
  cada tarea. Es el primer lugar donde mirar si algo dejó de actualizarse.

### Comandos de base

```bash
pnpm migrate           # crea y aplica una migración (pide nombre)
pnpm migrate:status    # ¿hay pendientes?
pnpm migrate:deploy    # aplica las que falten, sin crear ninguna
pnpm generate          # regenera el cliente de Prisma
```

Todos pasan por `scripts/guarda-prisma.mjs`, que **bloquea `prisma db push`**:
`push` cambia la base sin dejar archivo de migración, y el entorno siguiente se
queda sin esas tablas con el síntoma recién en producción.

Una maña del repo que sobrevive a cualquier stack: si `pnpm typecheck` falla
por tipos de rutas que no existen en el código, borrar `apps/sitio/.next` y
buildear de nuevo los regenera. Y otra: después de una migración, reiniciá `pnpm dev`:
el cliente de Prisma vive en la memoria del proceso y el viejo no conoce las
tablas nuevas.
