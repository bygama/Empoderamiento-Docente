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

La prueba de comportamiento corrió después: las siete rutas públicas en
**200** por `localhost`, `/que-es-ed` en 307 y `/robots.txt` en 200. `/admin`
da 500 sin Postgres —el demonio de Docker no está levantado en esta máquina—
y el sitio sigue en 200 después, que es lo que promete `src/cms/base.ts`. **El
panel andando queda sin verificar.**

## Close review

Tres seats frescas, sin historial de esta sesión, sobre `b0ec070..e20b4a6`.
Modelo: Sonnet. Solo la de correctness corrió build y dev server, para que
dos builds no se pisaran en el mismo checkout.

### Correctness contra el SPEC — **PASS**

> **PASS** — Los siete comandos de la DoD que me tocó correr salieron con el
> resultado que PROGRESS afirma (typecheck/lint/build en 0, react-doctor
> 100/100 con 356 archivos igual al baseline de `main`, prueba negativa en 1,
> las siete rutas públicas en 200 por `localhost`), y el constraint duro se
> sostiene con evidencia de hash: los 504 renombres son reales y ni un archivo
> de `src/` —panel incluido— cambió de contenido, solo `next.config.ts` (fuera
> de `src/`, cambio declarado en el propio PLAN paso 3).

### Fallas silenciosas — **PASS**

> **PASS** — los tres comandos del gate corren limpios y medí
> `scripts/verificar-react-doctor.mjs` contra 8 escenarios de falla (proyecto
> faltante, JSON roto, stdout vacío, `complete:false`, `skippedChecks`,
> `summary` ausente, error real de react-doctor) y todos frenan correctamente
> salvo el caso pre-existente de stdout vacío, que no es de este diff. El
> único hallazgo con dientes propios del lane es el blind spot de "cero
> paquetes matcheados" en `pnpm -r`/`--filter` que reemplazó a los comandos
> directos en `package.json`: no rompe nada hoy (verificado), pero es un hueco
> real y barato de tapar en el único gate que existe.

### Impacto en documentación — **FAIL**

> **FAIL** — no por regresión de la lógica ni por nada roto en build/gate
> (typecheck, lint y react-doctor corren en 0 con evidencia real), sino porque
> el spec que este PR editó específicamente para corregir el §4.4 quedó
> contradiciéndose a sí mismo en tres lugares (§3 ×2, §12), y `DESIGN.md` —un
> documento "hard rule" del contrato— tiene una ruta de `public/brand/` sin el
> prefijo `apps/sitio/` que las otras 7 rutas del mismo archivo sí recibieron
> en este mismo PR. Son arreglos chicos (4 líneas en total) pero caen
> exactamente en la categoría de barrido incompleto que esta lente existe para
> atrapar.

### Qué se hizo con cada hallazgo

| Hallazgo | Seat | Qué se hizo |
| --- | --- | --- |
| `pnpm -r` / `--filter` salen 0 sin matchear nada: el `pre-push` diría «todo en verde» sin chequear | silencio (Importante) | `--fail-if-no-match` en los cinco scripts. Verificado en un workspace vacío: sin guarda 0, con guarda 1 |
| El spec se contradice: §3 y §12 dicen «fuera de `src/`», §4.4 dice lo contrario | docs (Importante) | Corregidos los tres lugares |
| `DESIGN.md:312` con `public/brand/` sin prefijo | docs (Importante) | Prefijado, junto con todo lo que el barrido de `src/` no miraba |
| `docs/conventions/CODE-STYLE.md` apuntaba a las cuatro configs como si estuvieran en la raíz | docs (encontrado al barrer) | Prefijado. No había entrado en ningún barrido |
| `docs/content/publicaciones-fuentes-drive.md` con rutas de `public/` | docs (Menor) | Prefijado |
| El verificador tira stderr: «¿sin red?» ante cualquier causa | silencio (Menor) | Captura stderr y lo imprime |
| El criterio de aceptación del paso 4 no pasa literal | correctness (Menor) | Los carve-outs, documentados en el PLAN, más la regla de mirar el `diff --stat` |
| `turbopack.root` sin chequeo de sanidad | silencio (Menor) | **No implementado.** La prueba de comportamiento cubre el caso; agregar lógica al config de Next por un escenario hipotético es la especulación que el propio spec desaconseja |

El loop de arreglo corresponde a la lente que falló (documentación). El
arreglo del gate no venía de un FAIL pero toca el artefacto de más riesgo
después de revisado, así que fue a la misma seat fresca.

### Re-review del diff de arreglo (`e20b4a6..edb3cb0`) — **PASS**

> **PASS** — Los 6 hallazgos están ADDRESSED con evidencia de comando o de
> filesystem (incluida la ejecución real de los dos scripts de mayor riesgo,
> no solo lectura de código); nada de lo que el arreglo tocó fuera del alcance
> de los hallazgos quedó roto (CODE-STYLE.md, CRLF, links, gate en verde).
> Queda un nit menor de redacción en el propio criterio del paso 4 (conteo
> "tres" vs. cuatro bullets, categoría `work/*.md` no nombrada) que no amerita
> FAIL porque el contenido real que deja afuera el grep es legítimo en todos
> los casos que inspeccioné.

Cómo lo probó, que es lo que le da peso: armó un workspace pnpm vacío fuera
del repo para medir los dos lados de `--fail-if-no-match`, y se fabricó un
`pnpm.cmd` falso controlado por variable de entorno para ejercitar los tres
caminos del `catch` del verificador.

El nit de redacción se arregló en `63b667d` (los carve-outs pasan a ser
cuatro y el cuarto es «el registro»: ADRs, specs y `work/`). El único otro
apunte —el padding de la tabla de `CODE-STYLE.md`, cosmético— también.

## Abierto

1. **El panel andando.** `/admin` da 500 sin Postgres y el demonio de Docker
   no está levantado acá. Falta el `docker run` del README y entrar a
   `/admin`.
2. **Vercel:** cuando exista el proyecto, Root Directory = `apps/sitio`.
3. **Preguntarle a facundo** por la ruta de vista previa: quedó en
   `app/(sitio)/vista-previa/route.ts`, o sea la URL pública
   `/vista-previa`; el spec del panel decía `api/vista-previa`. Funciona
   igual, pero es un handler viviendo entre páginas.
