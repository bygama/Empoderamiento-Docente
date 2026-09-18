# PLAN — Mudanza a monorepo (`apps/sitio`)

Spec de la lane: [`SPEC.md`](SPEC.md). Diseño:
[`docs/architecture/specs/2026-09-17-monorepo-apps-diseno.md`](../../docs/architecture/specs/2026-09-17-monorepo-apps-diseno.md).

## Constraints (valen en todos los pasos)

- **Ni un archivo de `src/` cambia de contenido.** Solo de ruta. Si un diff
  muestra otra cosa, el paso se equivocó.
- **Antes de tocar nada, anotar el `analyzedFileCount` que da hoy**
  `pnpm react-doctor`. Ese número es el criterio de aceptación del paso 2:
  si baja, la mudanza perdió archivos de la medición.
- **No se pushea entre el paso 1 y el 2.** En el medio, el gate apunta a un
  `src` que ya no existe en la raíz. El push va cuando los dos están.
- **El gate no se apaga.** El alcance vive en el `package.json`, a la vista;
  nunca en `doctor.config.*`, en la clave `reactDoctor` ni en un
  `eslint-disable` (AGENTS.md §5.8).
- **El repo es CRLF.** Un reemplazo multilínea con `perl`/`node` falla en
  silencio si no se normaliza: leer, pasar a `\n`, editar, volver a `\r\n`.
- **Commits** Conventional, español, imperativo, uno por paso. Nada de
  `git add -A` (AGENTS.md §8, `docs/COMMITS.md`).

## Pasos

1. **Mudar el proyecto a `apps/sitio/`** — `git mv` de `src/`, `public/`,
   `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
   `postcss.config.mjs` y `.env.example`; `package.json` partido en raíz
   (workspace, `packageManager`, `engines`, `prepare`, y scripts que delegan
   con `--filter sitio` / `-r`) y app (`name: "sitio"` con las dependencias
   de hoy); `pnpm-workspace.yaml` con `packages: ["apps/*"]`; los patrones
   anclados de `.gitignore` (`/node_modules`, `/.next/`, `/out/`, `/build`)
   desanclados; lockfile regenerado. *(mechanical · high)*
   **Aceptación:** `pnpm install && pnpm typecheck && pnpm lint && pnpm build`
   salen 0, y `git show --stat -M HEAD` lista los archivos de `src/` y
   `public/` como renombres, sin cambios de contenido.

2. **El gate pasa a multi-proyecto** — en el `package.json` de la raíz,
   `react-doctor` con `--project apps/sitio/src`; y
   `scripts/verificar-react-doctor.mjs` declara la lista de proyectos
   esperados (hoy `apps/sitio/src`), **frena si falta alguno** en el informe,
   recorre `projects[]` exigiendo por cada uno `complete !== false`,
   `skippedChecks` vacío y `score.score === 100` (ojo: en el proyecto el
   score es objeto, en `summary` es número), exige
   `summary.totalDiagnosticCount === 0`, e imprime cada hallazgo con el
   directorio de su proyecto adelante en vez del `src/` fijo de hoy.
   *(judgment · high)*
   **Aceptación:** `node scripts/verificar-react-doctor.mjs` sale 0 con
   100/100 y el mismo `analyzedFileCount` anotado en los constraints; y, con
   un proyecto inexistente agregado a la lista esperada, sale 1 con el
   mensaje de medición incompleta. El experimento negativo se revierte antes
   de commitear.

3. **`turbopack.root` al workspace y dev server verde** — ajustar el valor y
   el comentario de `next.config.ts`, que hoy explica un caso de worktrees y
   ya no describe la situación: ahora hay un workspace por encima de la app.
   *(integration · medium)*
   **Aceptación:** con `pnpm dev` levantado, `/`, `/que-hacemos`,
   `/quienes-somos`, `/investigacion`, `/biblioteca`, `/novedades` y
   `/contacto` responden 200 por `localhost` (no `127.0.0.1`: ahí solo se
   mide SSR).

4. **[batch] Los meta-docs describen la estructura nueva** — `AGENTS.md`
   (Quickstart, §3 project structure, y §5.8 con el alcance por proyecto),
   `README.md` (instalación y scripts), `docs/AI_GUIDELINES.md` (rutas de
   ejemplo) y `docs/README.md` si le quedó alguna ruta vieja. Tocar
   `AGENTS.md` **requiere confirmación humana explícita** (§5.6): se pide
   antes de editarlo, no después. *(mechanical · medium)*
   **Aceptación:**
   el grep de rutas viejas no devuelve ninguna línea **fuera de estos cuatro
   carve-outs, que son correctos y hay que excluir a mano**:

   - las ramas de un diagrama de árbol (`└── src/`) que ya cuelgan de
     `apps/sitio/`;
   - el alias `"@/*": ["./src/*"]` del tsconfig y la frase que explica que es
     relativo al archivo y **no** lleva prefijo;
   - `src/styles/`, que se cita como una ruta que NO existe;
   - el **registro**: los ADRs, los specs y los archivos de `work/`, que
     describen el repo que había cuando se escribieron, árboles relativos a la
     app, o la mudanza misma en pasado. Los ADRs además son inmutables una vez
     aceptados, por la regla de `docs/architecture/adrs/README.md`.

   El chequeo es sobre la documentación **operativa** —la que alguien sigue
   para trabajar hoy—, no sobre el registro histórico.

   ```bash
   git ls-files "*.md" | xargs grep -n "src/" \
     | grep -v "apps/sitio/src" | grep -vE "src/$" \
     | grep -v '"\./src/\*"' | grep -v "relativo a ese archivo" \
     | grep -v "src/styles/"
   ```

   **Y el grep no alcanza:** también se mira `git diff --stat`. Un `.md` que
   cambia 68 líneas cuando se esperaba una es la señal que un grep de
   contenido no da — un archivo corrompido con el patrón nuevo pasa el grep
   justamente porque está lleno del patrón nuevo.

5. **ADR-0004: el repo pasa a monorepo** — escribirlo con `skills/adr-create`
   sobre `docs/architecture/adrs/_template.md`: contexto, decisión,
   alternativas descartadas (dos apps desde ya; quedarse en la raíz),
   consecuencias y las señales del §8 del spec. El `0003` queda reservado
   para Payload + Neon. *(judgment · medium)*
   **Aceptación:** existe `docs/architecture/adrs/0004-monorepo-apps.md`,
   `grep -n "0004" docs/architecture/adrs/README.md` devuelve su fila, y el
   archivo tiene las mismas secciones que `_template.md`.

## Cierre

La review de cierre no es un paso: corre una vez, después del paso 5, en
`work-verify`, y se dimensiona por las marcas — los dos `high` son el paso 1
(la mudanza, cara de rehacer) y el paso 2 (el gate, que si se equivoca deja
de avisar sin que se note).
