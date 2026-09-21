# PLAN — El primer deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** el sitio y su admin publicados en Vercel (plan gratis) con la base
en Neon (gratis), las migraciones corriendo en cada build, Web Analytics
activada y la primera cuenta del admin creada en producción.

**Arquitectura:** un proyecto de Vercel con Root Directory `apps/sitio` sobre
el workspace pnpm; `apps/sitio/vercel.json` declara el build (generar el
cliente de Prisma, aplicar migraciones, compilar); Neon por la integración del
Marketplace; las variables en Vercel. Único cambio de código: `robots.ts`
cierra el sitio a los buscadores mientras viva en `vercel.app`.

**Stack:** Vercel CLI (`pnpm dlx vercel@latest`, 59.x), Neon, Next 16.3, Prisma
7.10 exacta, better-auth, pnpm 11.

**Spec:** [`SPEC.md`](SPEC.md) · decisiones en [`DECISIONS.md`](DECISIONS.md) ·
estado en [`PROGRESS.md`](PROGRESS.md).

## Restricciones (valen en todos los pasos)

- **Gratis:** Vercel Hobby y Neon gratis (riesgo no comercial aceptado en
  `DECISIONS.md`). Sin dominio propio, sin Blob, sin Resend.
- **Confirmación de Facundo** (AGENTS.md §5.6) antes de: cada commit, el push,
  el PR, tocar `AGENTS.md`, y cualquier acción en Vercel o Neon (son cuentas
  de afuera). Los pasos que abren el navegador los hace Facundo en su
  terminal (`! <comando>` en el prompt).
- **Commits** Conventional, en español, imperativo, header ≤ 72; nunca
  `git add -A`. Trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Gates** antes de cada push: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100). `pnpm build` antes del PR.
- **Secretos** nunca en archivos versionados ni en el reporte de una tarea.
  `vercel env pull` escribe en un archivo git-ignorado y se borra al terminar.
- **El repo es CRLF**: archivos nuevos en LF están bien; editar con reemplazos
  exactos.
- **Nada de código** salvo `vercel.json`, `robots.ts` y su helper, y los docs.

---

### Task 1: El build de Vercel en `apps/sitio/vercel.json`

**Files:**
- Create: `apps/sitio/vercel.json`

**Interfaces:**
- Produce: el Build Command que Vercel ejecuta desde `apps/sitio`; la lane
  `metricas` le suma después la clave `crons` a este mismo archivo.

- [ ] **Step 1: Escribir el archivo**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm -w run generate && pnpm -w run migrate:deploy && next build"
}
```

Por qué `pnpm -w run`: los scripts `generate` y `migrate:deploy` viven en el
`package.json` de la raíz del workspace y pasan por `scripts/guarda-prisma.mjs`;
desde `apps/sitio` (el Root Directory) `pnpm migrate:deploy` a secas falla con
«Command not found» (verificado el 2026-09-21). El cliente de Prisma
(`prisma/generado`) está ignorado por git, así que sin `generate` el `next
build` no compila.

- [ ] **Step 2: Probar la secuencia en local, parado donde va a pararse Vercel**

```bash
cd apps/sitio && rm -rf .next && pnpm -w run generate && pnpm -w run migrate:deploy && pnpm exec next build 2>&1 | tail -n 12
```

Esperado: «Generated Prisma Client», «No pending migrations to apply» (la base
local ya está migrada) y el build en verde. Si `migrate:deploy` pidiera
`DATABASE_URL`, es que `.env.local` no está en `apps/sitio`: ahí va.

- [ ] **Step 3: Commit** (con OK)

```bash
git add apps/sitio/vercel.json
git commit -m "ci(deploy): declarar el build de Vercel con el cliente de Prisma y las migraciones"
```

---

### Task 2: Sin dominio, el sitio no se indexa

**Files:**
- Create: `apps/sitio/src/lib/dominio.ts`
- Test: `apps/sitio/src/lib/dominio.test.ts`
- Modify: `apps/sitio/src/app/robots.ts`
- Modify: `apps/sitio/package.json` (script `test`), `package.json` raíz (script `test`)

**Interfaces:**
- Produce: `esElDominioDefinitivo({ publica, definitiva }: { publica: string | undefined; definitiva: string }): boolean`.

- [ ] **Step 1: El runner de tests, sin dependencias nuevas**

En `apps/sitio/package.json`, dentro de `scripts`:

```json
"test": "tsx --test \"src/**/*.test.ts\""
```

En el `package.json` de la raíz, dentro de `scripts`:

```json
"test": "pnpm --fail-if-no-match -r --if-present test"
```

`tsx` ya es dependencia de la app (lo usa `crear-cuenta`) y sabe correr el
test runner de Node.

- [ ] **Step 2: El test que falla**

`apps/sitio/src/lib/dominio.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { esElDominioDefinitivo } from "./dominio";

test("con la URL definitiva, el sitio se indexa", () => {
  assert.equal(
    esElDominioDefinitivo({ publica: "https://empoderamientodocente.org", definitiva: "https://empoderamientodocente.org" }),
    true,
  );
});

test("la barra final y las mayúsculas no cambian la respuesta", () => {
  assert.equal(
    esElDominioDefinitivo({ publica: "https://EmpoderamientoDocente.org/", definitiva: "https://empoderamientodocente.org" }),
    true,
  );
});

test("en vercel.app no se indexa", () => {
  assert.equal(
    esElDominioDefinitivo({ publica: "https://empoderamiento-docente.vercel.app", definitiva: "https://empoderamientodocente.org" }),
    false,
  );
});

test("sin URL pública (local) no se indexa", () => {
  assert.equal(esElDominioDefinitivo({ publica: undefined, definitiva: "https://empoderamientodocente.org" }), false);
});
```

- [ ] **Step 3: Verlo fallar**

```bash
pnpm --filter sitio test
```

Esperado: falla porque `./dominio` no existe.

- [ ] **Step 4: El helper**

`apps/sitio/src/lib/dominio.ts`:

```ts
/**
 * ¿La URL pública de este deploy es la definitiva?
 *
 * Los canonicals y el `metadataBase` salen de `siteConfig.url`, que es el
 * dominio definitivo. Mientras el sitio viva en una URL provisoria
 * (`vercel.app`), esos canonicals apuntan a un dominio que todavía no lo sirve,
 * y Google indexaría la provisoria con canonicals rotos. Sin URL pública
 * (desarrollo, previews sin variable) tampoco hay nada que indexar.
 */
export function esElDominioDefinitivo({
  publica,
  definitiva,
}: {
  publica: string | undefined;
  definitiva: string;
}): boolean {
  if (!publica) return false;
  const limpiar = (url: string) => url.trim().toLowerCase().replace(/\/+$/, "");
  return limpiar(publica) === limpiar(definitiva);
}
```

- [ ] **Step 5: Verlo pasar**

```bash
pnpm --filter sitio test
```

Esperado: 4 tests en verde, salida limpia.

- [ ] **Step 6: `robots.ts` usa el helper**

`apps/sitio/src/app/robots.ts` queda así:

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { esElDominioDefinitivo } from "@/lib/dominio";

// El admin y su API no se indexan; el sitio, todo. Las tres rutas siguen
// listadas aunque hoy ninguna exista: `/admin` vuelve en la fase 1,
// `/vista-previa` en la 2 y `/api` en la 4 con los formularios de contacto y
// de CV (ADR-0005). Sacarlas para reponerlas sería churn.
//
// Mientras el sitio viva en una URL provisoria (vercel.app, sin dominio), se
// cierra entero: los canonicals apuntan al dominio definitivo y Google
// indexaría la provisoria con canonicals rotos (work/primer-deploy).
export default function robots(): MetadataRoute.Robots {
  const definitivo = esElDominioDefinitivo({
    publica: process.env.NEXT_PUBLIC_SITE_URL,
    definitiva: siteConfig.url,
  });
  if (!definitivo) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
```

- [ ] **Step 7: Verificar las dos salidas con un build**

```bash
cd apps/sitio && rm -rf .next && NEXT_PUBLIC_SITE_URL=https://ejemplo.vercel.app pnpm exec next build > /dev/null 2>&1 && (PORT=3100 pnpm exec next start > /tmp/robots.log 2>&1 &) ; sleep 6; curl -s http://localhost:3100/robots.txt; PID=$(netstat -ano | grep ":3100 " | grep LISTENING | awk '{print $5}' | head -n 1); taskkill //PID $PID //F > /dev/null
```

Esperado: `User-Agent: *` y `Disallow: /`. Repetir con
`NEXT_PUBLIC_SITE_URL=https://empoderamientodocente.org`: esperado `Allow: /`
y los tres `Disallow`. (Si la herramienta bloquea el `sleep` suelto, usar
`until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done`.)

- [ ] **Step 8: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/lib/dominio.ts apps/sitio/src/lib/dominio.test.ts apps/sitio/src/app/robots.ts apps/sitio/package.json package.json
git commit -m "feat(seo): cerrar el sitio a los buscadores mientras viva en vercel.app"
```

---

### Task 3: La documentación del deploy

**Files:**
- Modify: `README.md` (secciones «Deploy» y «Admin»)
- Modify: `AGENTS.md` §3 (árbol: `vercel.json` bajo `apps/sitio`) y §13
  (checkbox de Vercel) — **pedir OK a Facundo antes**
- Modify: `work/primer-deploy/PROGRESS.md`

- [ ] **Step 1: README, sección Deploy** — reemplazar la sección entera por:

```markdown
## Deploy

El sitio y su admin corren en **Vercel** (plan gratis por ahora; ver
`work/primer-deploy/DECISIONS.md`), en un proyecto con **Root Directory
`apps/sitio`** conectado a este repo: producción desde `main`, un preview por
PR. El build lo declara `apps/sitio/vercel.json`: genera el cliente de Prisma,
aplica las migraciones que falten y recién después compila; un deploy con una
migración rota no se publica.

La base es **Neon** por la integración del Marketplace (escribe `DATABASE_URL`
y `DATABASE_URL_UNPOOLED` en el proyecto). Las demás variables se cargan en
Vercel: `BETTER_AUTH_SECRET` (uno por entorno) y `NEXT_PUBLIC_SITE_URL` (la URL
de producción). Blob y Resend siguen sin conectar: ningún código los lee.

Mientras el sitio viva en `vercel.app`, sin dominio propio, `robots.txt` lo
cierra a los buscadores: los canonicals apuntan a `empoderamientodocente.org`
y no conviene que Google indexe la URL provisoria. Se abre solo cuando
`NEXT_PUBLIC_SITE_URL` sea el dominio definitivo.
```

- [ ] **Step 2: README, sección Admin** — agregar al final de «Levantarlo en
local», antes de «Comandos de base»:

```markdown
### La primera cuenta en producción

El script de cuentas corre en tu máquina contra la base de Neon:

```bash
DATABASE_URL="<la DATABASE_URL_UNPOOLED del proyecto>" pnpm --filter sitio crear-cuenta correo@ed.org "Nombre" administra
```

Después, `/admin/olvide-mi-contrasena` en la URL de producción: el enlace sale
por los logs del deploy (`pnpm dlx vercel@latest logs <url>`) mientras Resend
no esté conectado.
```

- [ ] **Step 3: AGENTS.md** (con OK de Facundo). En el árbol de §3, debajo de
`├── .env.example   ← las variables son de la app`, agregar:

```
        ├── vercel.json    ← el build de Vercel (Root Directory = apps/sitio)
```

y en §13 reemplazar `- [ ] Vercel: Root Directory = \`apps/sitio\` cuando exista el proyecto`
por `- [x] Vercel: proyecto con Root Directory = \`apps/sitio\`, Neon y Web Analytics (work/primer-deploy)`.

- [ ] **Step 4: Verificar y commit** (con OK)

```bash
grep -n "pendiente de definir" README.md || echo "ok: ya no dice pendiente"
git add README.md AGENTS.md
git commit -m "docs(deploy): describir el deploy en Vercel y la primera cuenta en producción"
```

Ojo: si `AGENTS.md` tiene el bloque de `next dev` al final sin commitear,
sacarlo antes del `git add` y reponerlo después (queda sin commitear a
propósito).

---

### Task 4: PR de los cambios del repo

- [ ] **Step 1:** `pnpm build` en verde, push de la rama `chore/primer-deploy`
  (con OK), PR contra `main` con título `chore(deploy): preparar el primer
  deploy a Vercel` y cuerpo en español (qué cambia: `vercel.json`, `robots`
  cerrado en URL provisoria, README); merge con `gh pr merge --rebase
  --delete-branch` (con OK) y verificar MERGED. El proyecto de Vercel se crea
  sobre `main` ya mergeado, así el primer build usa el `vercel.json`.

---

### Task 5: El proyecto en Vercel y Neon (con Facundo)

Todo esto toca cuentas de afuera. Cada comando se corre con el OK de Facundo,
y los que abren el navegador los corre él. Se trabaja parado en `apps/sitio`.

- [ ] **Step 1: Entrar**

```
! pnpm dlx vercel@latest login
```

- [ ] **Step 2: Crear y vincular el proyecto, sin deployar todavía**

```bash
cd apps/sitio && pnpm dlx vercel@latest link
```

Elegir la cuenta personal de Facundo (decisión de `SPEC.md` §3), «Link to
existing project? No», nombre `empoderamiento-docente`. Queda `.vercel/` en
`apps/sitio`, git-ignorado (verificar con `git status --short`; si apareciera,
agregar `.vercel` a `apps/sitio/.gitignore`).

- [ ] **Step 3: Root Directory y archivos fuera de él** (dashboard, Facundo)

Vercel → proyecto → Settings → General: **Root Directory = `apps/sitio`** y
**«Include source files outside of the Root Directory in the Build Step»
encendido** (el build corre `scripts/guarda-prisma.mjs`, que vive en la raíz).
Framework Preset: Next.js. Guardar.

- [ ] **Step 4: Neon**

```bash
pnpm dlx vercel@latest integration add neon
```

Si pide terminar en el navegador, Facundo lo termina ahí. Después:

```bash
pnpm dlx vercel@latest env ls
```

Esperado: `DATABASE_URL` y `DATABASE_URL_UNPOOLED` en Production (y en
Preview/Development si la integración las escribe). Solo nombres, nunca
valores.

- [ ] **Step 5: Las variables propias**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # uno para production y otro para preview
pnpm dlx vercel@latest env add BETTER_AUTH_SECRET production
pnpm dlx vercel@latest env add BETTER_AUTH_SECRET preview
pnpm dlx vercel@latest env add NEXT_PUBLIC_SITE_URL production   # https://empoderamiento-docente.vercel.app
```

Preview no lleva `NEXT_PUBLIC_SITE_URL`: better-auth cae a `VERCEL_URL`, que
es la URL de cada preview.

- [ ] **Step 6: Conectar el repo y hacer el primer deploy**

```bash
pnpm dlx vercel@latest git connect
```

(Facundo autoriza la app de GitHub de Vercel sobre `bygama` si hace falta.)
Después, el primer deploy de producción desde la CLI, para no depender de un
push:

```bash
pnpm dlx vercel@latest deploy --prod 2>&1 | tail -n 5
```

Esperado: la URL de producción. Si el build falla, `pnpm dlx vercel@latest
inspect <url> --logs` muestra el motivo; los dos sospechosos de siempre son el
Root Directory sin guardar y la opción de archivos fuera del root apagada.

- [ ] **Step 7: Web Analytics** (dashboard, Facundo): proyecto → Analytics →
Enable. No cambia el código: el componente que cuenta llega con la lane de
métricas.

---

### Task 6: Verificación en producción y cierre

- [ ] **Step 1: El sitio y el admin responden**

```bash
P=https://empoderamiento-docente.vercel.app
curl -s -o /dev/null -w "sitio %{http_code}\n" $P/
curl -s -o /dev/null -w "admin %{http_code} -> %{redirect_url}\n" $P/admin
curl -s $P/robots.txt
curl -s -D - -o /dev/null $P/admin/entrar | grep -iE "x-robots-tag|strict-transport"
```

Esperado: 200; 307 a `/admin/entrar`; `Disallow: /` (URL provisoria); las
cabeceras de seguridad.

- [ ] **Step 2: Las migraciones corrieron en el build**

```bash
pnpm dlx vercel@latest inspect $P --logs 2>&1 | grep -iE "migration|prisma" | head -n 8
```

Esperado: «3 migrations found» y «applied» (o «No pending migrations» en
deploys siguientes).

- [ ] **Step 3: La primera cuenta**

```bash
cd apps/sitio && pnpm dlx vercel@latest env pull .env.vercel.local --environment production
URL=$(grep '^DATABASE_URL_UNPOOLED=' .env.vercel.local | cut -d= -f2- | tr -d '"')
DATABASE_URL="$URL" pnpm crear-cuenta gaston@<correo-real> "Gastón" administra
rm .env.vercel.local
```

(El correo real lo da Facundo.) Después, en el navegador,
`$P/admin/olvide-mi-contrasena` con ese correo; el enlace sale en
`pnpm dlx vercel@latest logs $P` (buscar «Correo de contraseña nueva»);
abrirlo, elegir la contraseña, entrar y ver la portada del admin.

- [ ] **Step 4: Cierre de la lane**

Al día siguiente, Vercel → Analytics muestra las visitas de las pruebas.
`PROGRESS.md`: marcar las seis tareas, anotar la URL de producción y el
nombre del proyecto, y mover a «Hecho» lo abierto (cuenta elegida, si Neon
dio rama por preview). Commit `docs(work): cerrar la lane del primer deploy`
(con OK) por PR.
