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

**Backend / persistencia:** se eligió **Supabase** (Postgres gestionado + Auth
+ Storage) como backend, a integrar cuando aparezcan formularios (inscripción,
envío de CV). **Todavía no está integrado:** hoy el sitio corre 100% frontend,
sin `@supabase/supabase-js`, sin cliente, sin tablas ni env vars. Ver
[ADR-0002](docs/architecture/adrs/0002-adoptar-supabase-persistencia.md).

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
```

Antes de abrir un PR: `pnpm lint`, `pnpm typecheck` y `pnpm build` en verde
(ver [Pre-PR checklist en `AGENTS.md`](AGENTS.md) §10).

---

## Variables de entorno

Hoy **no hace falta ninguna** para correr el sitio: es 100% frontend.

Cuando se integre Supabase harán falta:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase (pública).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key (pública, cliente).
- `SUPABASE_SERVICE_ROLE_KEY` — service role key, **solo server-side**, nunca
  expuesta al cliente ni prefijada con `NEXT_PUBLIC_`.

Los placeholders viven en [`.env.example`](.env.example) (comentados, para la
futura integración). Los `.env*` reales están git-ignorados.

---

## Estructura del proyecto

```
/
├── AGENTS.md              ← contrato AI-neutral (fuente de verdad)
├── CLAUDE.md             ← adapter para Claude Code (puntero a AGENTS.md)
├── DESIGN.md              ← sistema de diseño (tokens, tipos, reglas)
├── docs/                  ← documentación auxiliar (ver docs/README.md)
├── public/                ← assets estáticos (brand/, hero/, aliados/, metodo/)
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

Sin configuración de deploy en el repo todavía (no hay `vercel.json` ni
workflows de CI/CD). Pendiente de definir. Para un proyecto Next.js, **Vercel**
es la opción natural (preview por PR, zero-config), pero la decisión queda
abierta hasta configurarla.
