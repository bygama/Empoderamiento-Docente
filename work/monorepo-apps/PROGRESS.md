# PROGRESS — Mudanza a monorepo (`apps/sitio`)

- **Rama:** `mateo/monorepo-apps`, sobre el `main` que ya trae la fase 0 del
  panel.
- **Rulings:** [`DECISIONS.md`](DECISIONS.md).
- **Rama anterior:** `mateo/refactor-monorepo-apps` (PR #155). Se hizo sobre
  el `main` viejo y no rebasa; queda como referencia y se cierra sin mergear.

## Baseline

Medido sobre `main` (`b0ec070`), con Payload adentro y antes de mover nada:

```
node scripts/verificar-react-doctor.mjs
  react-doctor: 100/100, sin diagnósticos (356 archivos)
```

**356** es el número que la mudanza tiene que reproducir. Y de paso contesta
la pregunta que el spec del panel dejó abierta en sus riesgos: lo generado por
Payload **no** baja el score.

## Hecho

- [x] **1. Mudar el proyecto a `apps/sitio/`** — `b83c409`.
      504 archivos con `git mv`, el panel incluido; `package.json` partido en
      raíz (workspace, scripts que delegan) y app (`name: "sitio"`, `"type":
      "module"`, las dependencias y los scripts de Payload);
      `pnpm-workspace.yaml` con `apps/*` y `publicHoistPattern`; `.gitignore`
      desanclado; lockfile regenerado. `turbopack.root` a la raíz del
      workspace.
      **Aceptación:** `pnpm install`, `pnpm typecheck`, `pnpm lint` y
      `pnpm build` en 0 — y el build lista `/admin`, `/api` y la vista previa
      junto a las rutas del sitio. Cero cambios de contenido en `src/`.

- [x] **2. El gate pasa a multi-proyecto** — `99ee793`.
      `PROYECTOS = ["apps/sitio/src"]`, recorre `projects[]`, frena si falta
      alguno, y el `catch` del `JSON.parse` deja de ser puerta de salida.
      **Aceptación:** exit 0, 100/100, **356 archivos** — igual que el
      baseline.

- [x] **3. Los meta-docs** — `9fe026d`.
      `AGENTS.md` (Quickstart, §3 con el árbol que incluye el panel, §5.8 con
      el alcance por proyecto y con lo generado medido, §6 con las dos
      excepciones, §13), `README.md` (árbol, comandos con `--filter`, Root
      Directory de Vercel), `DESIGN.md`, `docs/AI_GUIDELINES.md`,
      `docs/README.md`, `docs/content/` y `skills/pr-review/`.

- [x] **4. El spec se corrige por medición** — `374e832`. Ver DECISIONS.

- [x] **5. ADR-0004** — `8af33a9`, con cuatro alternativas descartadas.

## Verification

2026-09-18, sobre `8af33a9`:

| Capa | Comando | Resultado |
| --- | --- | --- |
| Estática | `pnpm typecheck` | exit 0 |
| Estática | `node scripts/verificar-react-doctor.mjs` | exit 0 — 100/100, 356 archivos |
| Estática | `pnpm lint` | exit 0 |
| Build | `pnpm build` | exit 0 — 19 rutas, incluidas `/admin/[[...segments]]`, `/api/[...slug]`, `/vista-previa` |
| Constraint | `git diff -M --numstat` | cero archivos de `src/` con cambio de contenido; 504 renombres |
| Documentación | detector de prefijo repetido sobre todos los `.md` | limpio |
| Documentación | resolución de links relativos | todos resuelven |

**Falta:** la prueba de comportamiento (dev server, las siete rutas en 200) y
la close review. Ninguna corrió todavía en esta rama.

## Abierto

1. **Correr el dev server y las siete rutas** por `localhost`, como en la
   rama anterior.
2. **Close review** — la ola de la rama anterior no vale acá: el diff es otro.
3. **Cerrar el PR #155** sin mergear, explicando que lo reemplaza esta rama.
4. **Vercel:** cuando exista el proyecto, Root Directory = `apps/sitio`.
5. **Preguntarle a facundo** por la ruta de vista previa: quedó en
   `app/(sitio)/vista-previa/route.ts`, o sea la URL pública
   `/vista-previa`; el spec del panel decía `api/vista-previa`. Funciona
   igual, pero es un handler viviendo entre páginas.
