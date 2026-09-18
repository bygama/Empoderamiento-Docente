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

## Close review

Tres seats frescas, sin historial de la sesión que construyó la lane, sobre
`bb7fcd7..3a31cdc`. Modelo: Sonnet. Lentes: la del cambio entero, más una por
cada paso marcado `high`.

### Correctness contra el SPEC — **PASS**

> **PASS** — Los seis pasos del PLAN están implementados tal como los describe
> el SPEC y el diseño aprobado: `pnpm install/typecheck/lint/build` en 0, el
> gate da `100/100, sin diagnósticos (apps/sitio/src: 333 archivos)` (mismo
> número que el baseline), las 7 rutas públicas responden 200 por `localhost`,
> y `git diff -M --numstat bb7fcd7..3a31cdc` confirma cero cambios de
> contenido en cualquier archivo bajo `src/`. Los tres hallazgos "Importantes"
> son inconsistencias de bookkeeping en `PROGRESS.md`/`DECISIONS.md` (afirman
> como abierto lo que los últimos dos commits de la propia lane ya cerraron) —
> no afectan el código, el gate ni el comportamiento del sitio, pero conviene
> corregirlos antes de dar la lane por cerrada para que el registro no mienta.

### Fallas silenciosas — **PASS**

> **PASS** — Las cinco pruebas de ruptura pedidas (proyecto faltante, JSON no
> parseable, score como objeto/`null`, separadores de ruta, cwd distinto) se
> corrieron contra el script real y/o una copia fuera del repo, y en todos los
> casos que importan para el contrato de §5.8 el gate frena (exit 1)
> quedándose del lado seguro. El único hueco real encontrado —el `catch` que
> confunde "sin red" con "cualquier JSON no parseable" y deja pasar en
> silencio— es código heredado sin cambios de este diff (verificado con
> `git show bb7fcd7`), no algo que la mudanza haya introducido o empeorado en
> la práctica.

### Impacto en documentación — **FAIL**

> **FAIL** — `docs/README.md`, el índice de documentación que `AGENTS.md` y
> `README.md` mandan leer primero, está corrompido en HEAD (`3a31cdc`):
> confirmé con `xxd` sobre `git show HEAD:docs/README.md` que las 68 líneas
> tienen el mismo prefijo de tabla pegado sin newline, partiendo palabras.
> Sumado al link roto de `.env.example` en `README.md:78` (verificado con
> `ls`) y al barrido incompleto de `skills/pr-review/SKILL.md`, no cumple la
> barra de esta lane ("meta-docs al día" es parte explícita de la Definición
> de Done del SPEC).

### Qué se hizo con cada hallazgo

| Hallazgo | Seat | Qué se hizo |
| --- | --- | --- |
| `docs/README.md` corrompido: las 68 líneas con un prefijo de tabla pegado | docs (Crítico) | Restaurado desde `6598b7c` y la celda corregida con una edición puntual. Causa y regla nueva en DECISIONS |
| `README.md:78` linkea `.env.example` en la raíz, que se mudó | docs (Importante) | Apunta a `apps/sitio/.env.example` |
| `skills/pr-review/SKILL.md` con 7 rutas sin prefijo; `skills/` no estaba en el paso 4 | docs (Importante) | Las 7 corregidas |
| El `catch` del `JSON.parse` deja pasar cualquier salida rota | gate (Importante) | Arreglado: vacío no frena, roto frena. Ver DECISIONS |
| El mensaje «suele ser un archivo borrado» se imprimía siempre | gate (Menor) | Solo se imprime cuando la causa es un chequeo salteado |
| `PROGRESS.md`/`DECISIONS.md` declaraban abierto lo ya cerrado | correctness (×3) | Corregidos en este mismo archivo y en DECISIONS |

El loop de arreglo formal corresponde a la lente que falló (documentación). El
arreglo del gate no venía de un FAIL, pero toca el artefacto de más riesgo
**después** de revisado, así que también fue a la misma seat fresca.

### Re-review del diff del arreglo (`3a31cdc..ccb2407`) — **PASS**

Una sola seat, fresca, con veredicto por hallazgo. Nota de método: la
instalación no tiene `references/re-reviewer.md`; el briefing se compuso
adaptando `lane-reviewer.md` al alcance del diff de arreglo.

> **PASS** — Los 6 hallazgos están ADDRESSED con evidencia corrida (no leída):
> ejercité los dos caminos del `catch` y el camino feliz del gate, verifiqué
> archivo por archivo que `docs/README.md` no perdió contenido, confirmé cada
> ruta nueva en el filesystem, y contrasté cada afirmación de
> `PROGRESS.md`/`DECISIONS.md` contra el estado real del repo (commits,
> `.gitignore`, `AGENTS.md`). El barrido adicional a `docs/content/*.md` fue
> correcto y no introdujo corrupción ni links rotos, y `typecheck`/`lint`
> siguen en 0.

Lo que comprobó de más, sin que se lo pidiera nadie: que los 11 archivos
tocados tengan CRLF consistente al 100% (sin mezcla), y que los ~29 links
relativos de `README.md` y `docs/README.md` resuelvan.

Sobre el número de §6 hizo una distinción más precisa que la de esta lane: no
es «declarar cerrado lo abierto», es un dato que **el propio commit de arreglo
introdujo** al agrandar el script. Queda como el único pendiente del cierre.

## Cerrado después de escribir esto

- **`DESIGN.md`** — las 7 rutas corregidas en `f446758`.
- **Los `AGENTS.md` / `CLAUDE.md` que genera `next dev`** — al `.gitignore` en
  `3a31cdc`, con el comentario de por qué.
- **Push y PRs** — `mateo/docs-monorepo-apps` → PR #154, y
  `mateo/refactor-monorepo-apps` → PR #155, apilado sobre el primero. El
  `pre-push` corrió el gate en los dos.
- **La excepción de §6** — aceptada por el owner y escrita en `AGENTS.md`.

## Abierto

1. **Orden de merge con `bygama/fix-investigacion-titulo-pixelado`**, la
   precondición del SPEC. Está como callout en el PR #155.
2. **`AGENTS.md` §6 cita 137 líneas** y el verificador quedó en **160** al
   cerrar el hueco del `catch`. Corregir ese número necesita confirmación
   humana (§5.6).
3. **Que facundo confirme la corrección del §3 de su spec** (PR #154).
