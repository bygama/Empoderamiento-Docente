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
- **Tailwind CSS v4** (CSS-first: el tema vive en `src/app/globals.css` con
  bloque `@theme`, sin `tailwind.config.js`)
- **GSAP 3** + **Lenis** (animaciones y smooth scroll)
- **Zod 4** (validación de bordes; se usa cuando aparezcan formularios)
- **pnpm 11** (pinned vía `packageManager`), **Node ≥ 22**

**Backend / persistencia:** **Neon** (Postgres) + **Payload** (panel de
contenido en `/admin`), con fotos en Vercel Blob y correos por Resend. Ver
[ADR-0003](docs/architecture/adrs/0003-adoptar-neon-y-payload.md).

Versiones exactas en [`package.json`](package.json).

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
pnpm payload         # CLI de Payload (acceso directo a sus subcomandos)
pnpm migrate         # corre las migraciones pendientes de Payload
pnpm migrate:create  # genera una migración nueva a partir de las colecciones
pnpm generate:types  # regenera src/payload-types.ts desde las colecciones
pnpm build:vercel    # el build que usa Vercel: migra y después next build
```

Antes de abrir un PR: `pnpm lint`, `pnpm typecheck` y `pnpm build` en verde
(ver [Pre-PR checklist en `AGENTS.md`](AGENTS.md) §10).

---

## Variables de entorno

Hacen falta para correr el panel (`/admin`); sin panel, el sitio no necesita
ninguna:

- `DATABASE_URL` y `DATABASE_URL_UNPOOLED` — conexión a Postgres (Docker en
  local, Neon en Vercel).
- `PAYLOAD_SECRET` — firma las sesiones del panel.
- `VISTA_PREVIA_SECRET` — protege la ruta de vista previa en modo borrador.
- `NEXT_PUBLIC_SITE_URL` — URL pública del sitio (pública, cliente).
- `BLOB_READ_WRITE_TOKEN` — fotos a Vercel Blob; sin token, se guardan en
  `fotos-local/`.
- `RESEND_API_KEY` — correos del panel; sin clave, salen por consola.

Todas menos `NEXT_PUBLIC_SITE_URL` son secretas y **solo server-side**. Los
placeholders viven en [`.env.example`](.env.example). Los `.env*` reales
están git-ignorados.

---

## Estructura del proyecto

```
/
├── AGENTS.md              ← contrato AI-neutral (fuente de verdad)
├── CLAUDE.md             ← adapter para Claude Code (puntero a AGENTS.md)
├── DESIGN.md              ← sistema de diseño (tokens, tipos, reglas)
├── docs/                  ← documentación auxiliar (ver docs/README.md)
├── public/                ← assets estáticos (brand/, fotos/, aliados/, equipo/)
├── src/
│   ├── app/               ← App Router: layout.tsx, page.tsx, globals.css
│   ├── components/        ← UI reutilizable (brand/, layout/, providers/, ui/)
│   ├── features/home/     ← secciones del home (Hero, LineasAccion, …)
│   ├── config/            ← site.ts (datos institucionales) + nav.ts
│   └── lib/               ← hooks/ y utilidades
└── (config raíz)          ← tsconfig.json, eslint.config.mjs, next.config.ts,
                              postcss.config.mjs, pnpm-workspace.yaml, .npmrc
```

El theming de Tailwind v4 vive en `src/app/globals.css` (bloque `@theme`), no
en `tailwind.config.js`. Los datos institucionales (mail, dirección, redes)
están centralizados en `src/config/site.ts`.

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

El sitio y el panel corren en **Vercel**: preview por PR, producción desde
`main`, build con `pnpm build:vercel` (corre las migraciones de Payload y
después `next build`). La base es **Neon** (una rama por preview), las fotos
van a **Vercel Blob** y los correos del panel a **Resend**; las cuatro
piezas se instalan desde el Marketplace de Vercel y escriben sus variables
solas. Variables propias en `.env.example`.

## Panel de administración

En `/admin`. Para correrlo en local hace falta un Postgres (Docker):

    docker run -d --name ed-postgres -e POSTGRES_PASSWORD=ed -e POSTGRES_DB=ed_panel -p 5435:5432 -v ed-postgres-datos:/var/lib/postgresql/data postgres:17

y un `.env.local` según `.env.example`. La primera vez, `/admin` pide crear
el primer usuario. Sin token de Blob las fotos se guardan en `fotos-local/`;
sin clave de Resend los correos salen por la consola. Diseño y decisiones:
`docs/architecture/specs/2026-09-15-panel-admin-diseno.md` y el ADR-0003.

Tres cosas que aprendimos hoy armando el panel: cada vez que se suma un
plugin o un componente propio, hay que correr `pnpm generate:importmap` (sin
eso `/admin` no carga); si `pnpm typecheck` falla por tipos de rutas que no
existen en el código, `pnpm next typegen` los regenera; y en local no hace
falta correr `pnpm migrate` contra la base de desarrollo — esa base la
sincroniza Payload solo (`push`) y las migraciones son para producción y
previews.
