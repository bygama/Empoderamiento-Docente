# PROGRESS — Mudanza a monorepo (`apps/sitio`)

- **Rama:** `mateo/refactor-monorepo-apps`, apilada sobre
  `mateo/docs-monorepo-apps` (que lleva el spec y la apertura de la lane).
- **Checkout:** el principal, `C:\Briar\repos\work\Empoderamiento-Docente`.
- **Rulings:** [`DECISIONS.md`](DECISIONS.md).

## Baseline (constraint del PLAN)

2026-09-17, antes de mover nada:

```
node scripts/verificar-react-doctor.mjs
  react-doctor: 100/100, sin diagnósticos (333 archivos)
```

## Hecho

- [x] **1. Mudar el proyecto a `apps/sitio/`** — `c05765a`.
      479 archivos movidos con `git mv`; `package.json` partido en raíz
      (workspace, scripts que delegan) y app (`name: "sitio"` con las
      dependencias); `pnpm-workspace.yaml` con `apps/*`; `.gitignore`
      desanclado; lockfile regenerado.
      Dos cosas que la mudanza destapó y se arreglaron acá:
      `turbopack.root` a la raíz del workspace (ver DECISIONS) y
      `publicHoistPattern` para `next` (ídem).
      **Aceptación:** `pnpm install`, `pnpm typecheck`, `pnpm lint` y
      `pnpm build` en 0; `git show --stat -M` lista `src/` y `public/` como
      renombres.

- [x] **2. El gate pasa a multi-proyecto** — `cbd265a`.
      `scripts/verificar-react-doctor.mjs` declara `PROYECTOS`, recorre
      `projects[]`, exige `complete`, `skippedChecks` vacío y `score.score`
      100 en cada uno, y frena si alguno falta. Suma el `error.message` de
      react-doctor cuando la herramienta rechaza la corrida. El script del
      `package.json` apunta a `--project apps/sitio/src`.
      **Aceptación:** `node scripts/verificar-react-doctor.mjs` → exit 0,
      100/100, **333 archivos** (el mismo número que el baseline).
      **Prueba negativa:** con `apps/panel/src` agregado a `PROYECTOS`, exit
      1 y «react-doctor no pudo completar la medición». Verificado además
      contra la herramienta: con una ruta inexistente devuelve `ok: false`,
      `projects: []` y `summary.score: null`.

- [x] **3. `turbopack.root`** — absorbido por el paso 1 (ver DECISIONS). La
      verificación de comportamiento está abajo.

- [x] **4. [batch] Los meta-docs** — `7e09171`.
      `AGENTS.md` (Quickstart, §3 con el árbol nuevo y `work/`, §5.8 con el
      alcance por proyecto, §6 con la excepción del verificador), `README.md`,
      `docs/AI_GUIDELINES.md` y `docs/README.md`. Aprobado por el owner en
      conversación, como pide §5.6.
      **Aceptación:** el grep de rutas viejas devuelve 0, con tres carve-outs
      documentados: las ramas de árbol que ya cuelgan de `apps/sitio/`, el
      alias `"./src/*"` del tsconfig (relativo a la app) y `src/styles/`,
      que se cita como ruta que NO existe.

- [x] **5. ADR-0004** — `06abaeb`. `docs/architecture/adrs/0004-monorepo-apps.md`
      con las tres alternativas descartadas, listado en el README de ADRs. El
      `0003` queda reservado para Payload + Neon.

## Verification

2026-09-17, sobre `06abaeb`:

| Capa | Comando | Resultado |
| --- | --- | --- |
| Estática | `pnpm typecheck` | exit 0 |
| Estática | `node scripts/verificar-react-doctor.mjs` | exit 0 — 100/100, 333 archivos |
| Estática | `pnpm lint` | exit 0 |
| Build | `pnpm build` | exit 0 — 12 rutas prerenderizadas |
| Comportamiento | dev server en 3010, las 7 rutas públicas por `localhost` | `/` `/que-hacemos` `/quienes-somos` `/investigacion` `/biblioteca` `/novedades` `/contacto` → **200**; `/que-es-ed` → **307** (el redirect viejo sigue) |
| Constraint | `git diff -M --numstat main...HEAD` | cero archivos de `src/` con cambio de contenido: todos `0 0`, y los tres `-` son binarios (favicon, apple-icon, opengraph) |

**Close review: NO hecha.** No se abrieron seats de review en esta sesión. La
rung queda declarada pendiente, no aprobada.

## Abierto

1. **`DESIGN.md` quedó con 7 rutas viejas** (líneas 17, 62, 116, 124, 210,
   225, 255). No entró en el paso 4 porque el PLAN no lo listó y porque §5.6
   pide confirmación humana para tocarlo. Es el mismo cambio mecánico de
   prefijo.
2. **`next dev` genera `apps/sitio/AGENTS.md` y `apps/sitio/CLAUDE.md`** con
   un bloque `nextjs-agent-rules`. No estaban en `main` y aparecieron al
   levantar el dev server. Hay que decidir si se commitean (lo que aconseja
   el propio bloque) o se ignoran — y tiene filo propio en este repo, donde
   la golden rule dice que los `.md` de la raíz son la fuente de verdad.
3. **Push y PR** — nada pusheado; §5.6 pide OK explícito.
4. **Orden de merge con `bygama/fix-investigacion-titulo-pixelado`**, la
   precondición del SPEC.
