# PROGRESS — Las condiciones de la revisión de la fase A

- **Rama:** `mateo/condiciones-de-la-revision`
- **Base:** `d6d4e2f` (= `origin/main` al 2026-09-22)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `d6d4e2f` el 2026-09-22, con `pnpm generate` y las migraciones
aplicadas a la base local (`pnpm migrate:deploy`):

- `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 sin diagnósticos.
- `pnpm test`: 60 pasan, 0 fallan, 1 salteado (el de la API de Vercel, que
  espera el token).
- `pnpm build` 0 (21 páginas).

## Done

- 2026-09-22 — SPEC, PLAN y la lista de commits aprobados por el owner.
- 2026-09-22 — Paso 1: `TextoCorto`, `Parrafo`, `RutaInterna`, `ListaFija`
  y `CampoFoto` reciben props planas (`etiqueta`, `ayuda`, `maximo`,
  `opciones`, `cantidad`, `etiquetaItem`, `itemVacio`); `CampoFoto` recibe
  `subir: SubirFoto` por prop; `Campo.tsx` (144 líneas) traduce la
  descripción e importa `subirFoto`.
  - `git grep -l -E "Descripcion|@/datos/" -- apps/sitio/src/admin/campos` →
    solo `Campo.tsx`.
  - HTML de `renderToStaticMarkup(Campo)` en seis casos (el hero con su
    descripción y contenido inicial, más párrafo con y sin ayuda, ruta
    desconocida, foto vacía y opcional apagado, para cubrir los controles que
    el hero no usa), sha256 antes → después, todos iguales:
    `hero 124af4d6…bbc8d` · `parrafo-con-ayuda 2cd22d65…50b5` ·
    `parrafo-sin-ayuda 77468da1…5fbd` · `ruta-desconocida 28abc7be…f359` ·
    `foto-vacia a5e6d516…cd1d` · `opcional-apagado 82f850d2…a6c7`. El script
    (scratch, borrado) corre con `tsx --env-file=.env.local` y un shim de
    `next/image`, que es CJS dentro de una app `"type": "module"`.
  - `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 sin
    diagnósticos.

- 2026-09-22 — Paso 2: `apps/sitio/src/datos/acciones/acciones-con-sesion.test.ts`
  recorre `src/` y exige que cada archivo con «use server» viva en
  `datos/acciones/`, lleve la directiva arriba, exporte solo funciones y
  tipos, y que cada función exportada llame a `auth.api.getSession`;
  `salir-de-vista-previa.ts` queda en `SIN_SESION` con su motivo, y un test
  frena si una excepción deja de apuntar a una acción.
  - RED: con el `getSession` de `publicar` reemplazado a mano, `tsx --test`
    del archivo → 4 pasan, 1 falla: `datos/acciones/paginas.ts` →
    `'publicar no llama a auth.api.getSession'`. Revertido con
    `git checkout -- apps/sitio/src/datos/acciones/paginas.ts`.
  - GREEN: `pnpm test` → 66 tests, 65 pasan, 0 fallan, 1 salteado ·
    `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100.

- 2026-09-22 — Paso 3: `apagarVistaPrevia()` en
  `datos/acciones/salir-de-vista-previa.ts` (sin sesión, mismo motivo que
  `salirDeVistaPrevia`) y `SalirDelAdmin` la llama antes de `signOut`.
  - `pnpm test` → 66 tests, 65 pasan, 0 fallan, 1 salteado (el test del paso
    2 acepta la función nueva por el archivo exceptuado) · `pnpm typecheck` 0
    · `pnpm lint` 0 · react-doctor 100/100.
  - E2E en el navegador de Orca contra `pnpm dev` (localhost:3000), con la
    cuenta descartable `lane-prueba@example.com` (rol edita, contraseña por
    el flujo de «olvidé», borrada de la base local al terminar): entrar →
    `/admin/paginas/inicio` → «Vista previa» → la cookie `__prerender_bypass`
    queda puesta y `/` contiene «Estás viendo un borrador» (`true`) →
    «Salir» → vuelve a `/admin/entrar`, ya no hay `__prerender_bypass` ni
    `better-auth.session_token`, y `/` recargada da `false`.
  - No corrí el control (el mismo recorrido sin el cambio). Que la cookie
    no vence sola sale del código de Next 16.3.4
    (`draft-mode-provider.js`: `enable()` la pone sin `expires` ni `maxAge`).
  - Visto de paso, y anterior a esta lane: el overlay de Next en desarrollo
    marca «1 Issue» por la CSP del admin, que bloquea `eval` (React lo usa
    solo en desarrollo), y el dev server avisa que `middleware` pasó a
    llamarse `proxy` en Next 16.

- 2026-09-22 — Paso 4: el spec del admin
  (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`) suma en §6
  la excepción de las páginas (documento JSON validado por esquema; las
  entidades siguen con una columna por texto), corrige en §7 la fila de la
  vista previa (marcada como corrección donde se lee) y suma el párrafo de
  las Server Actions con el test del paso 2, y en §9 anota que las páginas
  se adelantaron y cómo se mudan los controles.
  - `git diff --stat main -- docs/` → solo el spec (+23 −1).
  - `git grep -n -E "Draft Mode|props planas|columna por texto"` → líneas
    161 (§6), 177 (§7) y 234 (§9). El primer intento encontró solo §7: dos
    frases estaban partidas entre renglones; se reacomodó el corte.

- 2026-09-22 — Paso 5: `AGENTS.md` §12 suma, debajo de «Una excepción,
  acotada», los cuatro límites: solo las páginas; los seis tipos son
  cerrados y un séptimo es una regla nueva; la descripción de un campo dice
  qué control es y cómo se rotula, sin visibilidad condicional, componentes
  por campo ni hooks; los controles no conocen el generador.
  - `git grep -n "visibilidad condicional" -- AGENTS.md` → línea 609, exit 0.
  - `git diff --stat HEAD` → `AGENTS.md` (+16) y este PROGRESS, que se
    commitea al cierre: fuera de la lane, solo `AGENTS.md`.

- 2026-09-22 — Paso 6: `AGENTS.md` §12 suma, debajo de «`datos/` es la
  única puerta», el criterio de `lib/`: lo que no sabe de ED incuba en
  `apps/sitio/src/lib/` sin importar nada de la app y pasa a `packages/`
  cuando lo use un segundo proyecto (ADR-0009 extendido a contenido).
  - `git grep -n "segundo proyecto" -- AGENTS.md` → líneas 581 y 584, exit 0.
  - `git grep -l 'from "@/' -- apps/sitio/src/lib/contenido apps/sitio/src/lib/metricas`
    → sin resultados, exit 1: lo que la regla dice es cierto hoy.

- Cierre: work-verify. Capas corridas sobre `7657385` (2026-09-22), todas
  en verde; después, la revisión de cierre.
  - L1: `pnpm typecheck` 0 · `pnpm lint` 0 · react-doctor 100/100 sin
    diagnósticos, exit 0.
  - L2: `pnpm test` → 66 tests, 65 pasan, 0 fallan, 1 salteado, exit 0 ·
    `pnpm build` exit 0 (21/21 páginas) · el dev server responde: `/` 200,
    `/admin` → redirect a `/admin/entrar`.
  - L3: la vista previa se apaga al salir (paso 3, arriba). La subida de
    fotos por la prop nueva (paso 1): con la cuenta descartable recreada,
    en `/admin/paginas/inicio` se elige `public/aliados/ucsh.png` para la
    primera tarjeta → «Subir foto» → la acción responde `POST
    /admin/paginas/inicio 200`, queda `.fotos/723b5fd7-….png` (52 550
    bytes, el tamaño del original), la miniatura pasa de
    `/fotos/docentes-trabajan-aula.webp` a `/api/fotos/723b5fd7-…` y esa
    ruta sirve `200`. Sin guardar borrador (`paginas` quedó en 0 filas); la
    fila de `fotos`, el archivo, la carpeta `.fotos/` y la cuenta se
    borraron. El primer clic por `orca click` no disparó nada (ni POST ni
    aviso) y el botón seguía habilitado con el archivo elegido; el clic por
    el DOM (`button.click()`, el mismo handler que un clic real) sí.
- Revisión de cierre, seat 1 (Opus 5.5, todo el cambio contra el SPEC):
  PASS con un hallazgo Important confirmado (veredicto textual en
  `## Verification` al cerrar). El hallazgo revoca el PASS: ronda de fixes 1.
  - Important, arreglado: el test del paso 2 solo buscaba el texto
    `auth.api.getSession(`; una llamada comentada o una después de escribir
    en la base pasaban. Ahora saca los comentarios, exige que el primer
    `await` sea esa llamada y que nada toque `base.` antes; tres fixtures
    nuevas (llamada comentada, escritura antes con y sin `await`,
    excepción por acción). En rojo contra el bypass exacto del revisor en
    `paginas.ts` → 7 pasan, 1 falla: `'publicar no llama a
    auth.api.getSession'`; revertido con `git checkout`.
  - Minor, arreglados de paso: la excepción pasa de archivo entero a
    acciones con nombre; `SalirDelAdmin` cierra la sesión en un `finally`
    aunque apagar la vista previa falle; `AGENTS.md` y el comentario de
    `Campo.tsx` decían «conoce `Descripcion` y la app» (ahora «y las
    acciones de `datos/`»: `CampoFoto` sigue importando `armazon/Campos` y
    `lib/contenido/fotos`); «los seis tipos» aclara que `opcional` sale de
    `.nullable()`; el spec §7 dice que el test falla si una acción «no
    empieza por esa llamada». Corrección: `Campo.tsx` tiene 144 líneas, no
    138 (el 138 salió de `Measure-Object -Line`, que no cuenta las vacías).
  - Out-of-lens, no se toca: la cookie del Draft Mode va con
    `sameSite: 'none'` en producción (`draft-mode-provider.js:39`).
  - Re-verificado desde L1 con los fixes: `pnpm typecheck` 0 · `pnpm lint`
    0 · react-doctor 100/100 · `pnpm test` → 69 tests, 68 pasan, 0 fallan,
    1 salteado · `pnpm build` 0 (21/21). El cambio de `SalirDelAdmin` no
    se re-probó en el navegador: el camino feliz ejecuta lo mismo en el
    mismo orden, dentro de `try`/`finally`.
  - Re-review (una seat, Sonnet, acotada al Important): todos los
    hallazgos ADDRESSED, sin rotura nueva. Su observación fuera de alcance
    no se toma (DECISIONS).

- 2026-09-22 — Ronda de fixes 1 commiteada con el OK del owner: `95372cf`
  (test), `cdfa0ed` (salir en `finally`), `0b4ae1a` (AGENTS.md), `c4cce77`
  (comentario de `Campo.tsx`), `a2d7086` (spec §7). El árbol fuera de la
  lane es el mismo que pasó la verificación (`git diff HEAD -- apps
  AGENTS.md docs` vacío).
- 2026-09-22 — Cierre: sin restos (ni scratch en el árbol ni `TODO`,
  `console.log` o `debugger` sumados por la lane); la lane se borra en el
  commit siguiente.

## In progress

- Nada: la lane se cierra.

## Tried and failed

- Nada que no esté anotado en su paso: la primera búsqueda del paso 4
  (frases partidas entre renglones) y el primer `orca click` de la subida
  de fotos (no disparó el botón).

## Next

- Push de `mateo/condiciones-de-la-revision` y PR a `main`: esperan el OK
  del owner (AGENTS.md §5.6).
- Queda afuera, a propósito: el choque entre guardar y una publicación
  ajena (`editar-paginas.ts:38`); la cookie del Draft Mode con
  `sameSite: 'none'` en producción (fuera de lente en la revisión); mudar
  los controles a `packages/kit-admin` (fase 2).

## Verification

### 2026-09-22 — M DoD — PASS

Sobre el árbol de la ronda de fixes 1 (base `7657385` + los fixes, antes de
commitearlos).

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos»).
- L2 behavioral: `pnpm test` → exit 0 (69 tests, 68 pasan, 0 fallan, 1
  salteado) · `pnpm build` → exit 0 (21/21 páginas); starts: el dev server
  responde `/` 200 y `/admin` → `/admin/entrar`.
- L3 end-to-end: salir del admin con la vista previa abierta deja `/` sin
  la franja y sin `__prerender_bypass` (paso 3); una subida de foto por la
  prop nueva guarda el archivo y la miniatura pasa a `/api/fotos/<id>`
  (cierre, arriba). Los dos en el navegador de Orca, con una cuenta
  descartable borrada al terminar.
- Close review — correctness against the SPEC (Opus 5.5, elección del
  owner): PASS con un Important confirmado → ronda de fixes 1.
- Re-review ronda 1 — correctness against the SPEC (Sonnet): All findings
  addressed, no new Critical/Important breakage.

#### Veredicto textual — close review (Opus 5.5)

> ### DoD run
>
> **L1 static**
> - `pnpm typecheck` → exit 0 → `apps/sitio typecheck: Done` (`EXIT typecheck=0`)
> - `pnpm lint` → exit 0 → `apps/sitio lint: Done` (`EXIT lint=0`)
> - `node scripts/verificar-react-doctor.mjs` → exit 0 → `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 375 archivos · packages/db/src: 3 archivos · packages/auth/src: 5 archivos)`
>
> **L2 behavioral**
> - `pnpm test` → exit 0 → `ℹ tests 66` · `ℹ pass 65` · `ℹ fail 0` · `ℹ skipped 1`. The skipped test is the recorded-Vercel-API one (`# sin respuestas grabadas: falta correr A1`).
> - `pnpm build` → exit 0 → `✓ Generating static pages using 25 workers (21/21)`, `EXIT build=0`
>
> **Each PLAN step's acceptance command**
> - **Step 1:** `git grep -l -E "Descripcion|@/datos/" -- apps/sitio/src/admin/campos` → `apps/sitio/src/admin/campos/Campo.tsx` only.
> - **Step 1, render check:** I re-ran it myself.
>   - Setup: I copied `admin/campos/*` at `d6d4e2f` and at `HEAD` into a scratch folder (`apps/sitio/.review-render/`, outside `src/`). It used a tsconfig `paths` shim for `next/image` and ran under `tsx --env-file=.env.local`.
>   - Result: 7 cases rendered with `renderToStaticMarkup`, and old == new in every one (`TODOS IGUALES`).
>   - Hero hash: `124af4d629cced809fedf100d7d0a47de5fab44aeb09c45057a3c2757dfbbc8d` for both. This matches PROGRESS's `124af4d6…bbc8d`. The hero render contains 19 `<img>`, 2 `<select>` and 65 `<input>`, so the photo controls were covered.
>   - `foto-vacia` hash `a5e6d516…cb4b0cd1d` also matches PROGRESS.
>   - The scratch folder is deleted.
> - **Step 2, red run:** I edited line 37 of `paginas.ts` temporarily (`auth.api.getSession(` → `obtenerSesion(`).
>   - Command: `tsx --test src/datos/acciones/acciones-con-sesion.test.ts` → exit 1 → `ℹ pass 4` · `ℹ fail 1` · `AssertionError [ERR_ASSERTION]: datos/acciones/paginas.ts … 'publicar no llama a auth.api.getSession'`
>   - Restored with `git checkout -- src/datos/acciones/paginas.ts`. `git status --short` then showed only the two lane `.md` files.
> - **Step 4:**
>   - `git grep -n -E "Draft Mode|props planas|columna por texto" -- docs/…/2026-09-18-admin-a-medida-diseno.md` → hits at lines 161 (§6), 177 (§7) and 234 (§9).
>   - `git diff --stat main -- docs/` → only that spec, `23 insertions(+), 1 deletion(-)`.
> - **Step 5:** `git grep -n "visibilidad condicional" -- AGENTS.md` → `AGENTS.md:615`, exit 0.
> - **Step 6:**
>   - `git grep -n "segundo proyecto" -- AGENTS.md` → lines 581 and 584, exit 0.
>   - `git grep -l 'from "@/' -- apps/sitio/src/lib/contenido apps/sitio/src/lib/metricas` → no output, exit 1.
>   - A wider grep (any `@/`, any `../` import) was also clean.
> - **Commit scope:** each of the 6 step commits touches only the files of its own step. Nothing outside the SPEC.
>
> **L3 (not re-run)**
> - I did not re-run either end-to-end claim: logging out turns off the preview, and the photo upload goes through the new `subir` prop. The password-reset link prints to the dev-server console, which I cannot read.
> - I checked the code paths instead:
>   - `SalirDelAdmin.tsx:15` awaits `apagarVistaPrevia()` before `signOut`, and that calls `draftMode().disable()`.
>   - `Campo.tsx:61` passes `subir={subirFoto}`, and `CampoFoto.tsx:92` calls `subir(datos)` the same way as before.
> - I confirmed the §7 cookie claims in `next/dist/server/async-storage/draft-mode-provider.js:37-40`. `enable()` sets `httpOnly`, sets `secure` outside dev, and sets no `expires`/`maxAge`. The value is `previewModeId`, which is fixed per build.
>
> ### What was done well
> All six SPEC rows are in the code and docs, and each commit maps to one PLAN step with no drift. The step 1 hash evidence reproduces exactly under an independent harness. The step 2 red run reproduces as recorded. The doc correction in §7 is honest and matches the Next source.
>
> ### Issues
> #### Critical (Must Fix)
> None.
>
> #### Important (Should Fix)
> - **`apps/sitio/src/datos/acciones/acciones-con-sesion.test.ts:35` only checks that the text appears.** The check is `cuerpo.includes("auth.api.getSession(")`. It does not check that the action starts with the session call, or that it calls it at all.
>   - SPEC row 5 asks for a test that fails if an action "no empieza por `auth.api.getSession`". Spec §7 (lines 195-198) and `AGENTS.md:630` now say the test enforces that the action starts with the call and answers in plain words when there is no session.
>   - I proved the gap: I replaced publicar's line 37 with `const sesion = { user: { name: "nadie" } }; // auth.api.getSession( ya no se llama` and the test passed with `ℹ pass 5` / `ℹ fail 0` (then restored).
>   - A getSession call placed after a database write would also pass.
>   - It matters because the test catches a forgotten call, but not a commented-out or late one, while the docs claim it does.
>   - Fix: strip comments first, and require the call before the first `await` or `base.` in the body. Or narrow the doc wording to "calls".
>
> #### Minor (Nice to Have)
> - **`AGENTS.md:618-619` and `apps/sitio/src/admin/campos/Campo.tsx:36` overclaim.** Both say only `Campo.tsx` knows `Descripcion` "y la app". But `CampoFoto.tsx:5-6` still imports `@/admin/armazon/Campos` and `@/lib/contenido/fotos`, and `clases.ts` carries ED design tokens. The SPEC condition itself ("no conocen `Descripcion` ni `datos/`") holds; only the wording is too strong.
> - **`AGENTS.md:610` says "Los seis tipos son cerrados. Un séptimo…".** `Descripcion` already has seven variants (`descripcion.ts:8-14`, counting `opcional`), and `Campo.tsx:28` says "los siete casos". A reader could argue about what "a seventh" means.
> - **`apps/sitio/src/admin/armazon/SalirDelAdmin.tsx:15` has no try/finally.** If `apagarVistaPrevia()` rejects (for example on a network error), `signOut` never runs. Logging out now depends on one extra request succeeding.
> - **`acciones-con-sesion.test.ts:465-468` exempts the whole file, not the function.** Any future action added to `salir-de-vista-previa.ts` would skip the check silently. This matches the SPEC's wording, but it is a quiet hole.
> - **PROGRESS is out of date in places.** It says `Campo.tsx (138 líneas)`, but `wc -l` gives 144. `## Next` (line 128) still reads "Pasos 2 a 6, y el cierre". `## Verification` is empty. Every PLAN checkbox is still `[ ]`.
>
> ### Out-of-lens
> - In production, the Draft Mode cookie is `sameSite: 'none'` (`draft-mode-provider.js:39`). Worth a look from a security lens. Non-blocking.
>
> ### Verdict
> **PASS** — Every gate is green in my own runs: typecheck, lint, react-doctor 100/100, `pnpm test` with `ℹ fail 0` and `pnpm build` with `EXIT build=0`. Every PLAN acceptance command gives the expected output, the step 1 hero hash `124af4d6…dfbbc8d` reproduces, and the step 2 red run fails naming `publicar`. The Important finding is a gap between how strong the test is and what the docs say about it; it is not a defect in the shipped behaviour. I only judged the L3 claims by reading the code, not by running them.

#### Veredicto textual — re-review ronda 1 (Sonnet)

> **Test-only `.includes()` check that ignored comments and call position (`acciones-con-sesion.test.ts:35` in the original)** — ADDRESSED. The fix (`apps/sitio/src/datos/acciones/acciones-con-sesion.test.ts:27-30, 46-62`) strips comments via `sinComentarios()` before matching, and `problemasDe()` now requires the `auth.api.getSession(` call to be the first `await` in the function body and requires no `base.` reference to precede it (`cuerpo.search(/\bbase\./)`, lines 55-58). Both exploits from the finding are covered by new regression tests: `"el chequeo no cuenta una llamada comentada"` (line 94-97) reproduces the exact comment-substitution bypass from the finding and now fails with `publicar no llama a auth.api.getSession`, and `"el chequeo encuentra una acción que escribe antes de mirar la sesión"` (line 99-104) reproduces a `base.` write placed before the session check (both awaited and fire-and-forget variants) and now fails with `publicar hace algo antes de auth.api.getSession`. I ran the test file directly (`npx tsx --test src/datos/acciones/acciones-con-sesion.test.ts`): all 8 tests pass, including these two, and the full-repo scan test still passes against the real `datos/acciones/` files (verified by hand-tracing `paginas.ts`, `fotos.ts`, `vista-previa.ts`, `actualizar-metricas.ts`, `salir-de-vista-previa.ts` — none produce false positives, since legitimate `base.xxx` calls all occur after the session check, and nested `await headers()` inside the `getSession(...)` call argument still counts as the same leading `await`).
>
> ### New breakage in the fix diff
> None. `SalirDelAdmin.tsx`'s try/finally wrap and the two comment/wording edits (`Campo.tsx`, `AGENTS.md`) are cosmetic/robustness-only; `tsc --noEmit` on `apps/sitio` is clean and the full test file passes.
>
> ### Out-of-scope observations
> The exemption-matching mechanism (`exceptuadas.includes(nombre)`, test file line 53) matches by bare function name only, not by file+name pair — so if a second `datos/acciones/*.ts` file ever exported a function literally named `apagarVistaPrevia` or `salirDeVistaPrevia`, it would silently inherit the exemption meant only for `salir-de-vista-previa.ts`. This is a pre-existing/incidental design point of the fix's own new exemption structure, not a regression of the reviewed finding, and there's no such collision today — noted for awareness, non-blocking.
>
> ### Verdict
> **Fix round:** All findings addressed, no new Critical/Important breakage.
