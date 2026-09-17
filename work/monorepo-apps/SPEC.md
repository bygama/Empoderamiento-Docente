# SPEC — Mudanza a monorepo (`apps/sitio`)

- **Lane:** `work/monorepo-apps/` · **Tier:** M
- **Rama:** `mateo/refactor-monorepo-apps` (nunca push directo a `main`, AGENTS.md §5.7)
- **Autoridad del diseño:**
  [`docs/architecture/specs/2026-09-17-monorepo-apps-diseno.md`](../../docs/architecture/specs/2026-09-17-monorepo-apps-diseno.md)

Este archivo no repite el diseño: acota qué entra en esta lane y cómo se
prueba que está hecha.

---

## Problema

El repo es un solo proyecto Next en la raíz, y está por engordar con Payload
(el panel: `src/cms`, `src/contenido`, migraciones y tipos generados). Dos
cosas se rompen si eso pasa primero:

1. **El gate se vuelve ciego.** `scripts/verificar-react-doctor.mjs` lee
   `informe.projects[0]`: con más de un proyecto mediría uno y diría «todo en
   verde» — el desenlace que ese archivo fue escrito para evitar (§5.8).
2. **La mudanza se encarece.** El panel toca 46 componentes en cinco fases;
   mover `src/` después es conflicto con cada PR en vuelo.

## Alcance

Entra la mudanza mecánica y el gate. **No entra Payload.**

1. `apps/sitio/` con el proyecto de hoy adentro; workspace pnpm en la raíz.
2. Gate multi-proyecto: alcance `apps/sitio/src` declarado en el
   `package.json`, y el verificador recorriendo `projects[]`.
3. `turbopack.root` revisado para el workspace, con el dev server probado.
4. Meta-docs al día y ADR-0004.

## Lo que NO entra

Payload y sus generados, `packages/` compartidos, Turborepo, el proyecto de
Vercel (todavía no existe; AGENTS.md §13 lo tiene pendiente), CI, y cualquier
cambio de **contenido** en un archivo de `src/`.

## Precondición

**`bygama/fix-investigacion-titulo-pixelado` mergeada o descartada.** Son 9
commits sobre 11 archivos de `src/` en un worktree activo. La mudanza renombra
`src/` entero, así que esa rama tendría que rebasar sobre un árbol movido. No
es un problema de checkout —dos worktrees no lo evitan— es de **orden de
merge**, y lo decide quien tenga las dos ramas.

## Definición de done

- `pnpm install`, `pnpm typecheck`, `pnpm lint` y `pnpm build` salen 0 desde
  la raíz.
- `node scripts/verificar-react-doctor.mjs` da 100/100 sin diagnósticos **y el
  mismo `analyzedFileCount` que da hoy**, anotado en el PR.
- El verificador **frena** cuando falta un proyecto esperado (prueba negativa
  hecha y anotada).
- `pnpm dev` responde 200 en las siete rutas públicas, por `localhost`.
- `git diff -M --stat main...HEAD` no muestra ni un cambio de contenido en
  archivos de `src/`: solo renombres.
- `AGENTS.md` §3, `README.md`, `docs/README.md` y `docs/AI_GUIDELINES.md`
  describen la estructura nueva; ADR-0004 escrito y listado.

## Riesgos

Los del §9 del spec. Los dos que mandan acá:

| Riesgo                                          | Qué lo contiene                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| El verificador nuevo es el punto ciego nuevo    | Lista de proyectos esperados + prueba negativa en la definición de done             |
| La mudanza choca con trabajo en vuelo           | La precondición de arriba, decidida antes de abrir la rama                          |
