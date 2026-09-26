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

Sin las tres, Búsquedas dice que no está conectado y la copia no toca la API;
en local no hace falta cargarlas.

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
│   └── kit-admin/  ← los primitivos del admin (fase 2, todavía no existe)
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
            ├── config/        ← site.ts (datos institucionales) + nav.ts
            └── lib/           ← hooks/, correo/ (Resend), seguridad/ (CSP) y utilidades
```

Todo eso existe salvo `kit-admin`, que está marcado y llega en la fase 2. El
plan completo, en el [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md).

Es un **monorepo** (workspace pnpm): hoy hay una sola app y una segunda se
agregaría al lado, en `apps/`. Lo que se comparte entre proyectos va en
`packages/`, nunca en una app. Los comandos se corren desde la raíz, que
delega en la app. El porqué está en el
[ADR-0004](docs/architecture/adrs/0004-monorepo-apps.md) y en el
[ADR-0006](docs/architecture/adrs/0006-packages-reutilizables.md).

El theming de Tailwind v4 vive en `apps/sitio/src/app/globals.css` (bloque
`@theme`), no en `tailwind.config.js`. Los datos institucionales (mail,
dirección, redes) están centralizados en `apps/sitio/src/config/site.ts`.

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
tiene los cimientos —entrar, salir y elegir contraseña—, **un Inicio** con lo
pendiente, los números de la semana y la actividad reciente, **Métricas con
sus búsquedas en Google** (ver «Las métricas y lo programado»), **la edición
de Inicio** (ver «Editar las páginas») y **Mensajes**, lo que llega por los
formularios del sitio (ver «Mensajes»); las
novedades, la biblioteca, los casos y el equipo llegan en las fases siguientes.
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

# 4. Las cuentas. No hay registro público: esta es la única puerta.
pnpm --filter sitio crear-cuenta tu@correo.org "Tu nombre" administra
```

Después, `/admin/olvide-mi-contrasena` con ese correo. Sin `RESEND_API_KEY`
el correo sale entero **por la consola del servidor**, con el enlace.

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

### Editar las páginas

En Contenido › Páginas (`/admin/contenido/paginas`) están las siete del sitio
en el orden del menú. Por ahora se edita **Inicio entero**: el hero, «¿Quiénes
somos?», «Misión», «En números», «Cómo trabajamos», «Áreas de especialización»
y los textos de «Biblioteca y Novedades». Cada sección nueva se suma escribiendo
su esquema en `src/features/<pagina>/contenido/` y anotándola en
`src/contenido/paginas.ts`, y el SEO de una página, con su `seo` en el mismo
registro.

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
4 MB, con texto alternativo obligatorio y punto de foco): con
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
Analytics (a las tablas `metricas_*`) y la de Search Console (a
`busquedas_diarias`). Cada corrida, bien o con su error en llano, queda en
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

El admin manda dos: **«Elegí tu contraseña»** (el enlace de «Olvidé mi
contraseña», que vence en una hora) y **«Tu contraseña cambió»** (cada vez que
alguien elige una, con las demás sesiones ya cerradas). Salen por la API de
Resend, en segundo plano, desde `CORREO_REMITENTE`. Decisión y detalles en el
[ADR-0010](docs/architecture/adrs/0010-seguridad-del-acceso.md).

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

### Mensajes

Lo que llega por los formularios del sitio queda en `/admin/mensajes`, en dos
bandejas: **Contacto** (los tres roles) y **CV** (quien dirige y quien
administra). Cada mensaje nuevo avisa por correo a quien tenga activado ese
aviso en Mi cuenta, sin nada de lo que escribieron. Se borran solos (Contacto a
los 24 meses, un CV a los 12 con su archivo, el spam a los 30 días) en el cron
diario. Decisión en el
[ADR-0012](docs/architecture/adrs/0012-mensajes-cv-privados-y-retencion.md).

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
