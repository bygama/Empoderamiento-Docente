# PROGRESS — El admin a medida · Fase 0: la escisión

- **Rama:** `mateo/admin-a-medida` · worktree `C:/Briar/repos/work/ED-admin-a-medida`
- **Base:** `d452e61` (= `origin/main`)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) ·
  **Rulings:** [`DECISIONS.md`](DECISIONS.md)

Esta lane ejecuta la **fase 0**. Las fases 1 a 4 del SPEC abren su propia lane
y referencian este mismo SPEC.

**Estado: los 5 pasos ejecutados, verificados y commiteados.** El owner dio el
OK a la lista en seco de los 6 commits el 2026-09-18 (AGENTS.md §9); están en
`d452e61..8403d88`. Sin push: `main` solo se actualiza vía PR (§5.7).

## Baseline

Medido sobre `d452e61`, con Payload todavía adentro:

- Huella de Payload: **982 líneas** (702 generadas, 280 nuestras), 7
  dependencias, 10 tablas, 2 namespaces de URL (`/admin`, `/api`).
- Acoplamiento real: **un solo archivo** fuera de `cms/` y `(payload)/` importa
  Payload (`app/(sitio)/vista-previa/route.ts`).
- `pnpm typecheck` → 0 · `pnpm lint` → 0
- `node scripts/verificar-react-doctor.mjs` → **100/100, 312 archivos**.

## Hecho

- [x] **1. Borrar el código de Payload de `src/`.**
      20 archivos con `git rm`: `app/(payload)/` (6), `cms/` (10),
      `payload.config.ts`, `payload-types.ts` y `app/(sitio)/vista-previa/` (2).
      El comentario de `app/(sitio)/[...resto]/page.tsx` dejó de nombrar «el
      panel»; el archivo se queda (ver `DECISIONS.md`).
      **Aceptación:** `grep -rli payload apps/sitio/src` → exit 1 ·
      `pnpm typecheck` → 0.

- [x] **2. Sacar las 7 dependencias y limpiar la config.**
      `payload`, los 5 `@payloadcms/*` y `graphql` fuera, con sus 7 scripts;
      `withPayload` fuera de `next.config.ts`; `@payload-config` fuera de
      `tsconfig.json`; los 3 `globalIgnores` fuera de `eslint.config.mjs`;
      `PAYLOAD_SECRET` y `VISTA_PREVIA_SECRET` fuera de `.env.example`.
      `sharp`, `zod` y `DATABASE_URL_UNPOOLED` se quedan.
      **`pnpm install` sacó 226 paquetes.**
      **Aceptación:** `grep -ril payload` sobre los 7 archivos de config →
      exit 1 · typecheck, lint y build → 0 · react-doctor **100/100, 294
      archivos** (312 − 18 borrados).

- [x] **3. El sitio quedó idéntico a `d452e61`.** Sin commit: es verificación.
      Build de producción en los dos worktrees y diff del HTML prerenderizado,
      normalizando `BUILD_ID` y los hashes de chunk.

      **Son 11 páginas, y el PLAN decía 9: los dos números son correctos y
      cuentan cosas distintas.** El PLAN contaba **rutas** (`/novedades/<slug>`
      es una); el build emite **archivos**, y de ese slug salen dos
      (`relime-2025` y `unesco-montevideo`). Más `_global-error.html`, que la
      «una 404» del PLAN no cubría. 9 rutas + 1 slug extra + `_global-error`
      = 11 archivos. El conteo que vale para una verificación es el de
      archivos: es el que no deja ninguno afuera.

      | Comparación | Páginas | Resultado |
      | --- | --- | --- |
      | Texto visible | 11 | idénticas |
      | Links de navegación | 11 | idénticos |
      | `<title>` + `<meta>` | 11 | idénticos |
      | `robots.txt` | 1 | idéntico |

      La primera corrida cubrió 10 (faltaba `_global-error`) y tabulaba links y
      `<head>` solo de las 7 de nivel superior. `scripts/comparar-render.mjs`
      (`a216835`) cubre las tres dimensiones en las 11, y es lo que produjo la
      tabla de arriba.

      El build ya no lista `/admin/[[...segments]]`, `/api/[...slug]`,
      `/vista-previa` ni `/vista-previa/salir`; el resto de las rutas es el
      mismo. Evidencia en scratch de sesión (`%TEMP%/ed-diff-fase0`), fuera del
      repo.

- [x] **4. Los ADR-0005, 0006 y 0007, y el 0003 marcado.**
      0005 (admin a medida reemplaza a Payload), 0006 (`packages/` desde ahora,
      enmienda al 0004), 0007 (Prisma 7.10.0 exacta). El 0003 pasa a
      `Superseded by ADR-0005` **solo en la parte de Payload**: Neon, Blob y
      Resend siguen vigentes y se leen ahí.
      **Aceptación:** los 3 con `Status: Accepted` · 1 ocurrencia de
      «Superseded by ADR-0005» en el 0003 · el índice lista los 3 · todos los
      links internos resuelven.

- [x] **5. La spec nueva y el contrato al día.**
      Borrada `specs/2026-09-15-panel-admin-diseno.md`; escrita
      `specs/2026-09-18-admin-a-medida-diseno.md`. Actualizados `AGENTS.md`
      (§2, §3, §5.8, §6, §7, §12, §13 y la tabla de read-order), `README.md`,
      `docs/README.md` y `docs/AI_GUIDELINES.md` (§8 y §12).
      Borrar la spec dejó **5 links colgados** en el ADR-0003, el ADR-0004 y la
      spec del monorepo: se repararon (ver `DECISIONS.md`).
      **Aceptación:** cero links markdown rotos en todo el repo · la spec vieja
      no existe · ninguna referencia la trata como archivo vivo.

## Verification

Sobre el árbol final, con los 5 pasos aplicados:

```
pnpm typecheck                          → exit 0
pnpm lint                               → exit 0
pnpm build                              → exit 0
node scripts/verificar-react-doctor.mjs → 100/100, sin diagnósticos (294 archivos)
links markdown rotos en todo el repo    → 0
```

Diff total: **40 archivos, +2302 / −7016** (21 borrados, 4 nuevos, 15
modificados).

### Review de cierre

Tres seats frescos sobre `d452e61..8403d88`, en Sonnet, sin historia compartida
con quien escribió la lane. Tres lentes y no cuatro: los pasos 4 y 5 están los
dos en `high` pero son la misma clase de riesgo (documentación), así que
comparten seat en vez de comprar dos que miran lo mismo.

**Seat 1 — Correctness against the SPEC — veredicto verbatim:**

> **PASS** — All six DoD commands exit 0 with the exact expected output
> (`pnpm typecheck`, `pnpm lint`, `pnpm build`,
> `node scripts/verificar-react-doctor.mjs` → 100/100 294 files, both `payload`
> greps empty). The 312→294 react-doctor arithmetic and the "sitio renderiza
> exactamente igual" claim were both independently re-derived (not just trusted)
> by rebuilding `d452e61` myself and diffing normalized HTML for all 9 routes —
> all identical. The AGENTS.md "cinco menciones deliberadas" reinterpretation is
> legitimate: SPEC §10's actual bar is "cero apariciones de `payload` en
> `apps/sitio/src`, en la config y en los `package.json`" — it never asked for a
> clean grep over `AGENTS.md`/`README.md`/`docs/`; that stricter test was PLAN's
> own invention.

Dos cosas que este seat hizo y que la lane no había hecho: rebuildeó `d452e61`
por su cuenta para re-derivar el diff sin confiar en la evidencia de scratch, y
corrió `pnpm install --frozen-lockfile` (exit 0, «Already up to date») más
`grep -c payload pnpm-lock.yaml` → 0, probando que el lockfile es consistente y
no editado a mano.

**Hallazgos y qué se hizo:**

- *Important* — `PROGRESS.md` afirmaba «Nada commiteado todavía» cuando los 6
  commits ya existían. **Correcto y corregido**: el encabezado ahora dice que el
  owner dio el OK y nombra el rango. Era una afirmación falsa contra el propio
  historial del repo.
- *Minor* — `PLAN.md` paso 2 enumeraba «6 scripts» y se sacaron 7: el séptimo
  es `build:vercel`, que llamaba a `payload migrate` sin matchear el patrón de
  nombre. El seat confirmó que nada más lo referenciaba. **No se toca el PLAN**:
  registra lo que se planeó, no lo que pasó, y `PROGRESS` ya dice 7.
- *Out-of-lens* — revalidar contra el registry que `prisma@latest` sigue
  resolviendo a un RC antes de que la fase 1 agregue la dependencia. Anotado
  para la fase 1.

**Seat 2 — Silent failures — veredicto verbatim:**

> **PASS** — I independently reproduced PLAN step 3's checkable claims from
> scratch (own HTML parser, own route-manifest diff, own markdown-link walker)
> against the actual build output in both worktrees, not the lane's retained
> snapshots, and every dimension it claimed — text, links, `<head>`, route list,
> `robots.txt`, alt text, zero broken doc links — came back identical. The
> assertion was "merely declared" in the sense that no diff artifact survives to
> prove it without redoing the work, and the stated method structurally cannot
> see client-bundle differences (concretely: +1 JS chunk per page, unexplained)
> — both real gaps worth fixing in the write-up, neither one evidence that the
> site actually diverged.

Este seat verificó además, contra el regex compilado de `routes-manifest.json`,
que `[...resto]` **no** es código muerto: la ruta sigue viva e idéntica a la
base. El ruling de conservarla queda respaldado por evidencia, no por lectura.

**Hallazgos y qué se hizo:**

- *Important* — la prueba del paso 3 vivía en scratch de sesión: nadie podía
  rechequearla sin rehacer todo. **Arreglado con `scripts/comparar-render.mjs`**
  (`a216835`). El seat propuso el cuerpo del PR como única sede durable, porque
  asumió que el script iría en `work/admin-a-medida/scripts/`, que muere en el
  handoff. Está en `scripts/` de la raíz: sobrevive al merge **y** se vuelve a
  correr, que un log pegado no. Las dos cosas igual: la invocación y su salida
  van también en el cuerpo del PR.
- *Important* — el método no ve el bundle, y había un `+1 chunk` por página sin
  explicar. **Medido:** ~2 KB **menos** por página, parejo en las once, y el JS
  total baja de 75 archivos y 3,70 MB a 29 y 1,60 MB. Es Turbopack
  re-particionando al irse `(payload)`. El seat midió `index` por su cuenta y
  dio el mismo delta al byte (−1938). La afirmación correcta es **«el render es
  idéntico y el bundle es más chico»**. El script ahora informa ese delta, así
  que la ceguera queda cerrada de forma permanente.
- *Minor* — eran 11 páginas y se tabularon 10. Corregido; `_global-error`
  verificada idéntica.

**Seat 3 — Documentation impact — veredicto: FAIL.** Seis hallazgos, todos
reales, todos arreglados en `3af7989`. Detalle y rulings en `DECISIONS.md`.
Re-review de esa lente en curso (`rerev-docs-r1`, ronda 1 de un cap de 5).

## Próximo

1. Veredictos de los seats 2 y 3, pegados acá verbatim.
2. Si alguno da FAIL: arreglar y **un** seat fresco por lente fallada sobre el
   diff del arreglo — nunca otra ola. Cap 5.
3. `work-handoff`: cierra la lane y borra `work/admin-a-medida/`.
4. Después, la lane de la **fase 1** contra este mismo SPEC.

## Notas

- La base local de Postgres (Docker, puerto 5435) queda huérfana: sus 10
  tablas eran de Payload. Se recrea desde cero en la fase 1. Nada que rescatar.
- `pnpm-workspace.yaml` sigue en `packages: ["apps/*"]`: `packages/*` se suma en
  la fase 1, cuando exista el primer package. Un glob vacío no aporta.

### Fix loop — ronda 1 de 5 (lente: documentation impact)

Seis hallazgos arreglados en `3af7989` y `a216835`. Un seat fresco los
verdictó sobre el diff del arreglo.

**Veredicto verbatim:**

> **Fix round:** All findings addressed, no new Critical/Important breakage.

El único que volvió NOT ADDRESSED en la primera pasada fue la deriva de conteo
entre documentos: yo había arreglado `AGENTS.md` y dejado `PLAN.md` y
`PROGRESS.md`. Se cerró reconciliando en `PROGRESS` en vez de reescribiendo el
`PLAN`, y el seat respaldó ese criterio:

> Putting that arithmetic in PROGRESS.md rather than editing PLAN.md is the
> right call: PLAN records intent, PROGRESS records what the build actually
> emitted, and rewriting a plan post-hoc to match execution would erase the
> distinction your own DECISIONS.md ruling protects.

Sin breakage nuevo y sin observaciones fuera de alcance. **Loop cerrado en la
ronda 1**, muy por debajo del cap de 5.

## Verification (final)

Sobre `a216835` + el ajuste de `robots.ts`:

```
pnpm typecheck                          → exit 0
pnpm lint                               → exit 0
pnpm build                              → exit 0
node scripts/verificar-react-doctor.mjs → 100/100, sin diagnósticos (294 archivos)
node scripts/comparar-render.mjs <base> <head>
                                        → 11 páginas, render idéntico (exit 0)
links markdown rotos en todo el repo    → 0
```

**Review de cierre: HECHA.** Tres seats frescos en Sonnet, una lente cada uno,
sin historia compartida con quien escribió la lane.

| Seat | Lente | Veredicto |
| --- | --- | --- |
| 1 | Correctness against the SPEC | **PASS** |
| 2 | Silent failures | **PASS** |
| 3 | Documentation impact | **FAIL** → fix loop ronda 1 → cerrado |

### El camino de arranque del README, corrido de verdad

`next start` sobre el build de `c035098`, por `localhost` (nunca `127.0.0.1`,
que no hidrata):

```
/  /que-hacemos  /quienes-somos  /investigacion  /biblioteca
/novedades  /novedades/relime-2025  /contacto  /robots.txt     → 200

/admin        → 404
/api/fotos    → 404     ← el endpoint público y enumerable, cerrado en vivo
/vista-previa → 404

<title>Empoderamiento Docente — Transformamos el aprendizaje de las matemáticas</title>
```

Los tres 404 son la prueba en runtime de que los hallazgos 2 y 3 de seguridad
del SPEC §6 quedaron cerrados: sin REST autogenerada no hay biblioteca de
medios que enumerar, y `/api` quedó libre para los formularios de la fase 4.

## Cierre

Lane **cerrada**. Los cuatro archivos y su evidencia quedan en el historial de
git; la carpeta `work/admin-a-medida/` se borra en el commit de cierre, como
manda el handoff, y viaja en el mismo PR.

**Lo que sigue:** la lane de la **fase 1** (cimientos: `packages/db`,
`packages/auth`, middleware con cabeceras y rate limit, login en `/admin`)
contra este mismo SPEC, que vive en
`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`.

Dos cosas anotadas para esa lane:

1. **Revalidar contra el registry que `prisma@latest` siga resolviendo a un
   RC** antes de agregar la dependencia. La medición del ADR-0007 es del
   2026-09-18 y eso se mueve.
2. **Sumar `packages/` a las dos listas del gate** (`PROYECTOS` en
   `scripts/verificar-react-doctor.mjs` y el script `react-doctor` de la raíz)
   en el mismo PR que cree el primer package, y a `pnpm-workspace.yaml`.
