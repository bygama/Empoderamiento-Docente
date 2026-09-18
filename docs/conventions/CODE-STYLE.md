# CODE-STYLE.md — Estilo de código y documentación

> Las reglas operativas que sí están automatizadas viven en la configuración
> de la app (`apps/sitio/eslint.config.mjs`, `apps/sitio/tsconfig.json`). Este archivo agrupa las decisiones
> de estilo **que las herramientas no enforce-an** y sirve como índice para
> encontrar dónde vive cada regla. No hay Prettier, commitlint ni
> `.editorconfig` configurados por ahora.

---

## Índice rápido por archivo

| Donde vive                      | Qué regula                                      |
| ------------------------------- | ----------------------------------------------- |
| `apps/sitio/eslint.config.mjs`  | Reglas semánticas TS/React/Next.js              |
| `apps/sitio/tsconfig.json`      | TS strict + path aliases (`@/*`)                |
| `apps/sitio/next.config.ts`     | Configuración de Next.js                        |
| `apps/sitio/postcss.config.mjs` | PostCSS + `@tailwindcss/postcss` (v4)           |
| `pnpm-workspace.yaml`           | Qué apps tiene el monorepo y el hoist de `next` |
| `.gitignore`                    | Qué no se versiona                              |
| `docs/COMMITS.md`               | Convención humana de commits                    |
| `docs/AI_GUIDELINES.md`         | Reglas de código IA-friendly                    |
| `docs/GLOSSARY.md`              | Vocabulario del dominio                         |
| `DESIGN.md`                     | Tokens visuales (`@theme` en globals.css)       |
| `AGENTS.md`                     | Hard rules + quality standards                  |

---

## Reglas que las herramientas no enforce-an

### Markdown

- **Sin emojis** salvo que el cliente lo pida explícito. Los badges del
  README son la excepción permitida (usan shields.io con texto, no
  pictogramas Unicode).
- **80 columnas prose-wrap** como objetivo. No hay formatter de Markdown
  configurado; el wrap lo cuidás vos al escribir.
- **Headers ATX (`#`, `##`, `###`)**, no setext (`====`, `----`).
- **Listas con guion `-`**, no asterisco `*`.
- **Code fences con triple backtick y lenguaje declarado** (` ```ts `,
  no ` ``` ` pelado). Lenguajes válidos comunes: `ts`, `tsx`, `js`,
  `bash`, `yaml`, `jsonc`, `md`, `diff`.
- **Tablas alineadas con espacios** para que el raw sea legible; GitHub
  las renderiza igual si no, pero la lectura en el editor sufre.

### Naming

Detalle en [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md) §3. Lo que se
repite acá por visibilidad:

- **Identificadores en código:** inglés salvo conceptos del dominio
  educativo que no traducimos (`trayecto`, `formacion`, `diplomatura`,
  `inscripcion`).
- **Identificadores visibles al usuario:** español inclusivo.
- **Branches:** `<tipo>/<scope>-<descripcion-corta>` en kebab-case.
  Ejemplos:
  - `feat/home-hero`
  - `fix/forms-validacion-email`
  - `chore/ci-deploy-placeholder`
  - `docs/glossary-aliados`
- **Tags:** `v0.x.y` semver, prefijo `v` obligatorio.

### Estructura de PRs

- **Un PR = una unidad lógica de cambio.** Si toca 5 áreas distintas,
  partilo en 2-3 PRs encadenados.
- **Título sigue Conventional Commits** del commit principal:
  `feat(home): integrar hero con animación de faro`.
- **Descripción en español** con, al menos: resumen, cambios principales,
  verificación local (`pnpm lint` / `typecheck` / `build`) y compliance con
  las hard rules (`AGENTS.md` §5). _(No hay plantilla de PR en `.github/`
  por ahora.)_
- **Tamaño objetivo:** ≤ 400 líneas cambiadas (excluyendo lockfile y
  artifacts). Más que eso, considerá partirlo.

### Idioma

| Contexto                | Idioma                                       |
| ----------------------- | -------------------------------------------- |
| Identificadores código  | Inglés (con concepto-dominio en español)     |
| Commits                 | Español, imperativo (`agregar`, no `agregado`) |
| PR / issues             | Español                                      |
| Docs (`.md`)            | Español rioplatense conversacional           |
| Copy del sitio          | Español inclusivo (`AGENTS.md` §5.1)         |
| Comentarios de código   | Español (default), consistente por archivo   |

### Antipatrones que no detecta ESLint

- Comentarios que describen el **qué** en vez del **por qué**.
- `TODO` sin contexto (sin "qué falta" y "por qué no se hizo ahora").
- Archivos > 300 líneas — partir antes de cruzar ese umbral.
- Hooks o componentes con > 5 props sin nombrar las props como tipo
  (`type FooProps = {...}`).
- `useEffect` sin cleanup cuando crea suscripciones, timers, listeners
  o controllers.
- Imports relativos largos (`../../../`) — usar `@/`.
- Estado en componentes server (no se puede ni debería).

---

## Cómo evoluciona esta lista

Cuando aparezca una decisión de estilo nueva:

- **Si las tools la pueden enforce-ar** → mejor sumar la regla a
  `apps/sitio/eslint.config.mjs` o su `tsconfig.json` (o sumar la tool que
  falte, p. ej.
  Prettier, y documentarla). Acá solo dejamos la referencia al archivo
  donde quedó.
- **Si es decisión humana** (Markdown, naming de branches, idioma) →
  sumarla acá.
- **Si es del dominio educativo / IA-friendly** → va a
  [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md) o
  [`../GLOSSARY.md`](../GLOSSARY.md).
