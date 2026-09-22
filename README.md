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

La que sigue está **declarada pero todavía no conectada**: hoy ningún código
la lee, y ponerla no cambia nada.

- `RESEND_API_KEY` — correos del admin. **Mientras tanto el enlace de
  «olvidé mi contraseña» sale siempre por la consola del servidor**, con clave
  o sin ella.

Las cuatro de las **métricas** ([ADR-0009](docs/architecture/adrs/0009-analitica-de-vercel-con-copia-diaria.md);
la portada del admin lee una copia diaria de la analítica de Vercel):

- `VERCEL_TOKEN` — token de la cuenta de Vercel para la API de Web Analytics.
  **Abre toda la cuenta**: solo en Production y en tu `.env.local`, nunca en
  un preview ni con `NEXT_PUBLIC_`.
- `VERCEL_ANALYTICS_PROJECT_ID` — el `prj_…` del proyecto (Settings → General).
- `VERCEL_TEAM_ID` — vacío en una cuenta personal; el `team_…` si es un equipo.
- `CRON_SECRET` — lo que el cron manda en `Authorization`; Vercel lo inyecta si
  existe. Sin él, `/api/cron/metricas` responde 401 a todo.

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
            ├── middleware.ts  ← sesión, cabeceras, rate limit
            ├── components/    ← UI reutilizable (brand/, layout/, ui/, …)
            ├── features/      ← secciones por dominio (home, novedades, …)
            ├── config/        ← site.ts (datos institucionales) + nav.ts
            └── lib/           ← hooks/ y utilidades
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
tiene los cimientos —entrar, salir y elegir contraseña—, la portada con las
métricas y **la edición del hero de Inicio** (ver «Editar las páginas»); las
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

# 4. La primera cuenta. No hay registro público: esta es la única puerta.
pnpm --filter sitio crear-cuenta tu@correo.org "Tu nombre" administra
```

Después, `/admin/olvide-mi-contrasena` con ese correo. El enlace sale **por la
consola del servidor**: el envío por Resend todavía no está conectado, así que
poner la clave no cambia nada por ahora.

> **Si ya tenías el contenedor de antes**, adentro vive una base `ed_panel` con
> las nueve tablas que dejó Payload. Quedó huérfana con la fase 0 y no la toca
> nadie: borrala cuando quieras con
> `docker exec ed-postgres psql -U postgres -c "DROP DATABASE ed_panel;"`.

### Editar las páginas

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

> **No compartas una base con fotos locales entre entornos:** una foto subida
> sin `BLOB_READ_WRITE_TOKEN` queda con una URL de disco (`/api/fotos/<id>`
> sobre `apps/sitio/.fotos/`), y en cuanto el token aparece en ese entorno
> (por ejemplo, al promover a producción) esa URL da 404, porque el archivo
> nunca viajó a Blob.

### Las métricas

La portada muestra cuánta gente entra al sitio y qué páginas mira: visitantes
y vistas de los últimos 7 y 30 días, contra el período anterior. No consulta a
Vercel al renderizar: un cron (`/api/cron/metricas`, a las 4 UTC) copia cada
día lo que falta a las tablas `metricas_*`, y el botón «Actualizar ahora» hace
lo mismo a mano, con un freno de diez minutos. Sin `VERCEL_TOKEN` y
`VERCEL_ANALYTICS_PROJECT_ID` el panel lo dice y no copia nada; en local no
hace falta cargarlos. Los días son UTC. Diseño y decisiones en
[`work/metricas/`](work/metricas/).

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
