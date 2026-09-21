# PLAN — Poner al día el deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** que el proyecto de Vercel que ya sirve
`https://empoderamientodocente.org` publique el `main` de hoy con el admin
andando: base en Neon (gratis), migraciones en cada build, Web Analytics
activada y la primera cuenta creada en producción.

**Arquitectura:** el proyecto existe en la cuenta de Mateo y Gastón (Facundo
no tiene acceso) y hoy publica un build viejo, anterior al monorepo. Del lado
del repo: `apps/sitio/vercel.json` declara el build y `robots.ts` cierra los
previews a los buscadores. Del lado de Vercel: un checklist para quien tiene
la cuenta (Git al repo, Root Directory `apps/sitio`, Neon, variables,
analítica, deploy).

**Stack:** Vercel (Hobby), Neon, Next 16.3, Prisma 7.10 exacta, better-auth,
pnpm 11, `node --test` vía `tsx`.

**Spec:** [`SPEC.md`](SPEC.md) · decisiones en [`DECISIONS.md`](DECISIONS.md) ·
estado en [`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Gratis:** Vercel Hobby y Neon gratis (riesgo no comercial aceptado en
  `DECISIONS.md`). Sin cambiar de cuenta ni de dominio; sin Blob ni Resend.
- **Confirmación de Facundo** (AGENTS.md §5.6) antes de cada commit, push, PR y
  de tocar `AGENTS.md`. Lo que pasa en Vercel lo hacen Mateo o Gastón con el
  checklist de la Task 5.
- **Commits** Conventional, en español, imperativo, header ≤ 72; nunca
  `git add -A`. Trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Gates** antes de cada push: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100). `pnpm build` antes del PR.
- **Producción no se cierra a los buscadores bajo ninguna variable nuestra:**
  el único criterio para `robots.ts` es `VERCEL_ENV`, que Vercel fija solo.
- **Secretos** nunca en archivos versionados, en reportes ni por chat.
- **El repo es CRLF**: archivos nuevos en LF están bien; editar con reemplazos
  exactos.
- **Nada de código** salvo `vercel.json`, `robots.ts` y su helper, y los docs.

---

### Task 1: El build de Vercel en `apps/sitio/vercel.json` — HECHA (`bc40e65`)

**Files:** `apps/sitio/vercel.json` (creado).

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm -w run generate && pnpm -w run migrate:deploy && next build"
}
```

Por qué `pnpm -w run`: los scripts `generate` y `migrate:deploy` viven en el
`package.json` de la raíz y pasan por `scripts/guarda-prisma.mjs`; desde
`apps/sitio` (el Root Directory) `pnpm migrate:deploy` a secas falla con
«Command not found». El cliente de Prisma está ignorado por git, así que sin
`generate` el `next build` no compila. Verificado en local parado en
`apps/sitio`: cliente generado, 3 migraciones sin pendientes, build en verde.

---

### Task 2: Los previews no se indexan; producción no cambia

**Files:**
- Create: `apps/sitio/src/lib/dominio.ts`
- Test: `apps/sitio/src/lib/dominio.test.ts`
- Modify: `apps/sitio/src/app/robots.ts`
- Modify: `apps/sitio/package.json` (script `test`), `package.json` raíz (script `test`)

**Interfaces:**
- Produce: `esUnPreviewDeVercel(entorno: string | undefined): boolean`.

- [ ] **Step 1: El runner de tests, sin dependencias nuevas.** En
`apps/sitio/package.json`, dentro de `scripts`: `"test": "tsx --test \"src/**/*.test.ts\""`.
En el `package.json` de la raíz: `"test": "pnpm --fail-if-no-match -r --if-present test"`.
`tsx` ya es dependencia de la app (lo usa `crear-cuenta`) y sabe correr el
test runner de Node.

- [ ] **Step 2: El test que falla** `apps/sitio/src/lib/dominio.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { esUnPreviewDeVercel } from "./dominio";

test("producción no es un preview", () => {
  assert.equal(esUnPreviewDeVercel("production"), false);
});

test("los previews y los deploys de desarrollo de Vercel sí", () => {
  assert.equal(esUnPreviewDeVercel("preview"), true);
  assert.equal(esUnPreviewDeVercel("development"), true);
});

test("en local no hay entorno de Vercel y no se cierra nada", () => {
  assert.equal(esUnPreviewDeVercel(undefined), false);
});
```

- [ ] **Step 3: Verlo fallar** — `pnpm --filter sitio test` → falla por `./dominio` inexistente.

- [ ] **Step 4: El helper** `apps/sitio/src/lib/dominio.ts`:

```ts
/**
 * ¿Este deploy es un preview de Vercel?
 *
 * Los previews son URLs públicas (`*.vercel.app`) que Google puede indexar, y
 * sus canonicals apuntan al dominio real: conviene cerrarlos a los buscadores.
 * Producción y local no se tocan. Se decide por `VERCEL_ENV`, que Vercel fija
 * solo en cada deploy: nunca por una variable nuestra, que si faltara en
 * producción cerraría el dominio real.
 */
export function esUnPreviewDeVercel(entorno: string | undefined): boolean {
  return entorno !== undefined && entorno !== "production";
}
```

- [ ] **Step 5: Verlo pasar** — `pnpm --filter sitio test` → 3 tests en verde.

- [ ] **Step 6: `robots.ts` usa el helper** (`apps/sitio/src/app/robots.ts`):

```ts
import type { MetadataRoute } from "next";
import { esUnPreviewDeVercel } from "@/lib/dominio";

// El admin y su API no se indexan; el sitio, todo. Las tres rutas siguen
// listadas aunque hoy ninguna exista: `/admin` vuelve en la fase 1,
// `/vista-previa` en la 2 y `/api` en la 4 con los formularios de contacto y
// de CV (ADR-0005). Sacarlas para reponerlas sería churn.
//
// Los previews de Vercel se cierran enteros: son URLs públicas con canonicals
// que apuntan al dominio real. Producción no cambia (work/primer-deploy).
export default function robots(): MetadataRoute.Robots {
  if (esUnPreviewDeVercel(process.env.VERCEL_ENV)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
```

- [ ] **Step 7: Verificar las salidas con un build.** Parado en `apps/sitio`:
`rm -rf .next && VERCEL_ENV=preview pnpm exec next build`, levantar
`PORT=3100 pnpm exec next start` en segundo plano, esperar con
`until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done`,
`curl -s http://localhost:3100/robots.txt` → `Disallow: /`; apagar el proceso
(PID de `netstat -ano | grep ":3100 " | grep LISTENING`, `taskkill //PID <pid> //F`).
Repetir con `VERCEL_ENV=production` y sin la variable: `Allow: /` y los tres
`Disallow`.

- [ ] **Step 8: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/lib/dominio.ts apps/sitio/src/lib/dominio.test.ts apps/sitio/src/app/robots.ts apps/sitio/package.json package.json
git commit -m "feat(seo): cerrar los previews de Vercel a los buscadores"
```

---

### Task 3: La documentación del deploy real

**Files:**
- Modify: `README.md` (secciones «Deploy» y «Admin»)
- Modify: `AGENTS.md` §3 (árbol: `vercel.json` bajo `apps/sitio`) y §13
  (checkbox de Vercel) — **pedir OK a Facundo antes**
- Modify: `work/primer-deploy/PROGRESS.md`

Se escribe cuando Mateo o Gastón hayan respondido las preguntas de `SPEC.md`
§3, para que el README diga lo que hay y no lo que se supone.

- [ ] **Step 1: README, sección Deploy** — reemplazar la sección entera por:

```markdown
## Deploy

El sitio y su admin corren en **Vercel**, en el proyecto que ya sirve
`https://empoderamientodocente.org` (la cuenta la administran Mateo y Gastón;
ver `work/primer-deploy/`). El proyecto tiene **Root Directory `apps/sitio`**
y está conectado a este repo: producción desde `main`, un preview por PR. El
build lo declara `apps/sitio/vercel.json`: genera el cliente de Prisma, aplica
las migraciones que falten y recién después compila; un deploy con una
migración rota no se publica.

La base es **Neon** por la integración del Marketplace (escribe `DATABASE_URL`
y `DATABASE_URL_UNPOOLED` en el proyecto). Las demás variables se cargan en
Vercel: `BETTER_AUTH_SECRET` (una por entorno) y `NEXT_PUBLIC_SITE_URL` (solo
en Production). Blob y Resend siguen sin conectar: ningún código los lee.

Los previews se cierran a los buscadores (`robots.txt` con `Disallow: /`):
son URLs públicas con canonicals que apuntan al dominio real. Producción se
indexa normal.
```

(Ajustar el nombre de la cuenta o del equipo con lo que respondan.)

- [ ] **Step 2: README, sección Admin** — agregar antes de «Comandos de base»:

```markdown
### La primera cuenta en producción

El script de cuentas corre en tu máquina contra la base de Neon; hace falta la
`DATABASE_URL_UNPOOLED` del proyecto (la tiene quien administra Vercel):

```bash
DATABASE_URL="<la DATABASE_URL_UNPOOLED del proyecto>" pnpm --filter sitio crear-cuenta correo@ed.org "Nombre" administra
```

Después, `/admin/olvide-mi-contrasena` en la URL de producción: el enlace sale
por los logs del deploy (Vercel → proyecto → Logs) mientras Resend no esté
conectado.
```

- [ ] **Step 3: AGENTS.md** (con OK de Facundo). En el árbol de §3, debajo de
`├── .env.example   ← las variables son de la app`, agregar
`        ├── vercel.json    ← el build de Vercel (Root Directory = apps/sitio)`;
en §13 reemplazar `- [ ] Vercel: Root Directory = \`apps/sitio\` cuando exista el proyecto`
por `- [x] Vercel: el proyecto que sirve empoderamientodocente.org, con Root Directory = \`apps/sitio\`, Neon y Web Analytics (work/primer-deploy)`.

- [ ] **Step 4: Commit** (con OK): `docs(deploy): describir el deploy real en Vercel y la primera cuenta en producción`.
Ojo con el bloque de `next dev` al final de `AGENTS.md`: sacarlo antes del
`git add` y reponerlo después.

---

### Task 4: PR de los cambios del repo

- [ ] **Step 1:** `pnpm build` en verde, push de `chore/primer-deploy` (con OK),
PR contra `main` con título `chore(deploy): preparar el deploy del monorepo en
Vercel` y cuerpo en español; merge con `gh pr merge --rebase --delete-branch`
(con OK) y verificar MERGED. Cuando Vercel esté conectado al repo, ese PR o el
siguiente trae el primer preview y sirve para la Task 6.

---

### Task 5: Poner al día el proyecto que existe (Mateo o Gastón)

El proyecto de Vercel ya existe, sirve `https://empoderamientodocente.org` y
lo administran Mateo y Gastón. Facundo no tiene acceso: este checklist se les
manda tal cual, con las cuatro preguntas de `SPEC.md` §3. Cada paso dice qué
verificar y qué cambiar si no está. Nada de esto toca el dominio ni los DNS.

- [ ] **Step 1: Git.** Vercel → proyecto → Settings → Git. Tiene que estar
conectado al repo `bygama/Empoderamiento-Docente`, con Production Branch
`main`. Si está conectado a otro repo (un fork viejo) o no está conectado,
conectarlo: «Connect Git Repository» → GitHub → `bygama/Empoderamiento-Docente`
(la app de GitHub de Vercel tiene que tener acceso a la organización
`bygama`). Con eso, cada push a `main` deploya producción y cada PR recibe su
preview; hoy nada de eso pasa (GitHub no muestra checks de Vercel).

- [ ] **Step 2: Root Directory.** Settings → General → Root Directory =
`apps/sitio`, y «Include source files outside of the Root Directory in the
Build Step» **encendido** (el build corre `scripts/guarda-prisma.mjs`, que
vive en la raíz del repo). Framework Preset: Next.js. Build Command y Output
Directory se dejan en blanco: los toma de `apps/sitio/vercel.json`. Sin este
paso, el próximo deploy de `main` falla: desde la mudanza a monorepo no hay
`next` en la raíz.

- [ ] **Step 3: Neon.** Vercel → proyecto → Storage → Create Database → Neon
(plan gratis), conectado a Production, Preview y Development. Escribe
`DATABASE_URL` y `DATABASE_URL_UNPOOLED` (verificar en Settings → Environment
Variables). Si el proyecto ya tuviera una base, decirlo antes de crear otra.

- [ ] **Step 4: Variables propias.** Settings → Environment Variables:
  - `BETTER_AUTH_SECRET` en Production y otro valor en Preview. Se generan con
    `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
    Sin esto el admin no arranca.
  - `NEXT_PUBLIC_SITE_URL` = `https://empoderamientodocente.org`, solo en
    Production (en los previews better-auth usa la URL del preview).
  - No hace falta nada de Blob ni de Resend todavía.

- [ ] **Step 5: Web Analytics.** Proyecto → Analytics → Enable. Gratis en el
plan Hobby (50.000 vistas por mes). El componente que cuenta llega con la lane
de métricas; activarla ahora no cambia nada del sitio.

- [ ] **Step 6: Deploy de `main`.** Con Git conectado (Step 1), cualquier
push a `main` deploya producción solo; si no hay nada que pushear,
Deployments → «Create Deployment» → rama `main`. En el log tienen que verse
«Generated Prisma Client», «migrations applied» (o «No pending migrations»)
y el build en verde. Producción sale siempre de un build de `main`: no usar
«Promote to Production» sobre un preview, porque no rebuildea y publicaría
en el dominio real el `robots.txt` cerrado del preview (el sitio entero fuera
de Google hasta el próximo deploy).

- [ ] **Step 7: Avisar.** Mandar a Facundo: el nombre del proyecto y de la
cuenta/equipo, cómo se deployaba lo de antes, y que los seis pasos están. Para
la lane de métricas van a hacer falta, más adelante, el ID del proyecto
(`prj_…`, en Settings → General), el ID del equipo si es un equipo, y un token
de la cuenta cargado **solo en Production** como `VERCEL_TOKEN` (Account
Settings → Tokens; nunca se manda por chat).

---

### Task 6: Verificación en producción y cierre

- [ ] **Step 1: El sitio y el admin responden** (cuando Mateo o Gastón avisen
que el deploy de `main` salió)

```bash
D=https://empoderamientodocente.org
curl -s -o /dev/null -w "sitio %{http_code}\n" $D/
curl -s -o /dev/null -w "admin %{http_code} -> %{redirect_url}\n" $D/admin
curl -s $D/robots.txt
curl -s -D - -o /dev/null $D/admin/entrar | grep -iE "x-robots-tag|strict-transport|content-security"
```

Esperado: 200; 307 a `/admin/entrar`; `Allow: /` con los tres `Disallow`
(producción no se cierra); las cabeceras de seguridad. Hoy (2026-09-21, antes
de la puesta al día) `/admin` da 404 y `/robots.txt` devuelve la 404 del sitio.

- [ ] **Step 2: Un preview se cierra a los buscadores.** En el PR de esta
lane (o en el siguiente que se abra), el check de Vercel deja la URL del
preview: `curl -s https://<preview>.vercel.app/robots.txt` → `Disallow: /`.

- [ ] **Step 3: La primera cuenta.** La corre quien tenga la
`DATABASE_URL_UNPOOLED` de Neon (Mateo o Gastón, desde su clon del repo con
las dependencias instaladas):

```bash
DATABASE_URL="<DATABASE_URL_UNPOOLED de Neon>" pnpm --filter sitio crear-cuenta gaston@<correo-real> "Gastón" administra
```

Después, `https://empoderamientodocente.org/admin/olvide-mi-contrasena` con
ese correo; el enlace sale en los logs del deploy (Vercel → proyecto → Logs,
buscar «Correo de contraseña nueva») mientras Resend no esté conectado.
Abrirlo, elegir la contraseña, entrar y ver la portada.

- [ ] **Step 4: Cierre de la lane.** Al día siguiente, Vercel → Analytics
muestra las visitas. `PROGRESS.md`: marcar las seis tareas, anotar el nombre
del proyecto y de la cuenta, cómo se deployaba antes y qué respondieron Mateo y
Gastón. Commit `docs(work): cerrar la lane del deploy` (con OK) por PR.
