# PLAN — Las métricas del admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** que la portada del admin muestre cuánta gente entra al sitio y
qué páginas mira, leyendo una copia diaria de la analítica de Vercel guardada
en nuestra base.

**Arquitectura:** `<Analytics />` cuenta en el sitio; un cron diario pega en
`/api/cron/metricas` y la sincronización pide a la API de Web Analytics lo que
falte (nueve consultas de rango) y lo guarda en tres tablas; la portada del
admin renderiza `<PanelMetricas />` como sección, leyendo solo de esas tablas.
El cliente de la API y las fechas viven en `lib/metricas/` (sin dominio de
ED); lo que toca la base, en `datos/consultas/` y `datos/acciones/`.

**Stack:** Next 16.3 (App Router, Server Actions), Prisma 7.10 exacta,
better-auth (`auth.api.getSession`), `@vercel/analytics`, Web Analytics REST
API (`/v1/query/web-analytics`), Vercel Cron, `node --test` vía `tsx`.

**Spec:** [`SPEC.md`](SPEC.md) · decisiones en [`DECISIONS.md`](DECISIONS.md) ·
estado en [`PROGRESS.md`](PROGRESS.md). Depende de
[`../primer-deploy/PLAN.md`](../primer-deploy/PLAN.md): la tarea A1 necesita
el proyecto de Vercel creado y con Web Analytics activada.

## Restricciones (valen en todos los pasos)

- **Confirmación de Facundo** (AGENTS.md §5.6) antes de: cada commit, el push,
  el PR, `pnpm add @vercel/analytics`, tocar `AGENTS.md`, y cualquier acción en
  Vercel. El token de Vercel lo crea Facundo y **solo va en Production** y en
  su `.env.local`.
- **Commits** Conventional, en español, imperativo, header ≤ 72; nunca
  `git add -A`. Trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Gates** antes de cada push: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100). `pnpm build` antes del PR.
  `pnpm test` en verde en cada tarea que tenga tests.
- **Fronteras del repo** (AGENTS.md §3): ningún componente importa Prisma;
  `datos/consultas/` lee y `datos/acciones/` escribe; `lib/metricas/` no sabe
  nada de ED.
- **Componentes ≤ 200 líneas, utilidades ≤ 100.** Sin `any`. Comentarios en
  español que dicen el porqué. Lenguaje inclusivo en todo texto del panel.
  Colores y tipos del tema (`azul-principal`, `azul-claro`, `azul-medio`,
  `gris-texto`, `verde-concepto`, `naranja-accion`), sin hex.
- **Los días son UTC.** Las fechas viajan como `YYYY-MM-DD` y se guardan como
  `DateTime @db.Date` a medianoche UTC.
- **Secretos** nunca en archivos versionados ni en reportes. Las respuestas
  grabadas de la API son agregados, se versionan.
- **Migraciones** con `pnpm migrate` (nunca `db push`); se commitean.
- **`.env.local` de la app** es `apps/sitio/.env.local`. Los comandos de este
  plan se corren desde la raíz del repo salvo que digan otra cosa.

## Estructura de archivos

```
apps/sitio/
├── vercel.json                                   (+ crons)               A7
├── .env.example                                  (+ 4 variables)         A1
├── scripts/grabar-metricas.ts                    graba la API real       A1
├── prisma/schema/metricas.prisma                 3 tablas                A3
├── src/lib/metricas/
│   ├── tipos.ts                                  Dimension, FilaDiaria…  A4
│   ├── periodos.ts (+ .test.ts)                  fechas UTC, ventanas    A4
│   ├── vercel.ts (+ .test.ts)                    cliente y mapeos        A5
│   └── __fixtures__/*.json                       respuestas reales       A1
├── src/datos/acciones/sincronizar-metricas.ts (+ .test.ts)               A6
├── src/datos/acciones/actualizar-metricas.ts     Server Action + freno   A8
├── src/datos/consultas/metricas.ts               estado, tarjetas, …     A6/B1
├── src/admin/metricas/{PanelMetricas,Tarjeta,Estado,ActualizarAhora}.tsx A8
├── src/admin/metricas/{Curva,Lista}.tsx                                   B1
├── src/app/(sitio)/layout.tsx                    <Analytics />           A2
├── src/middleware.ts                             `_vercel` fuera         A2
├── src/app/api/cron/metricas/route.ts            el cron                 A7
└── src/app/(admin)/admin/(protegido)/page.tsx    renderiza el panel      A8
```

---

### Task A1: Grabar las respuestas reales de la API

**Files:**
- Create: `apps/sitio/scripts/grabar-metricas.ts`
- Create: `apps/sitio/src/lib/metricas/__fixtures__/*.json` (los graba el script)
- Modify: `apps/sitio/.env.example`

**Interfaces:**
- Produce: los archivos `__fixtures__/total-por-dia.json`, `pagina-por-dia.json`,
  `pais-por-dia.json`, `referido-por-dia.json`, `dispositivo-por-dia.json`,
  `ventana-sin-by.json`, `ventana-count.json`, cada uno con
  `{ estado, consulta, cuerpo }`; y una entrada en `DECISIONS.md` con la forma
  real de las respuestas y cómo se piden las ventanas.

- [ ] **Step 1: El token y el ID** (Facundo). Vercel → Account Settings → Tokens
→ Create: nombre «ED métricas», alcance la cuenta donde vive el proyecto,
vencimiento 1 año. El ID del proyecto está en Project → Settings → General
(`prj_…`). Los dos van a `apps/sitio/.env.local` como `VERCEL_TOKEN` y
`VERCEL_ANALYTICS_PROJECT_ID` (y `VERCEL_TEAM_ID` vacío en cuenta personal).

- [ ] **Step 2: `.env.example`** — agregar al final:

```bash
# --- Métricas (la API de Web Analytics de Vercel; ver work/metricas/SPEC.md) ---
# Token de acceso de la cuenta de Vercel. ABRE TODA LA CUENTA: nunca
# NEXT_PUBLIC_, nunca en el navegador. Solo en Production y en tu .env.local.
VERCEL_TOKEN=
# El prj_… del proyecto del sitio (Project → Settings → General).
VERCEL_ANALYTICS_PROJECT_ID=
# Vacío en una cuenta personal; el team_… si el proyecto vive en un equipo.
VERCEL_TEAM_ID=
# Lo que el cron manda en Authorization; Vercel lo inyecta si existe.
CRON_SECRET=
```

- [ ] **Step 3: El script** `apps/sitio/scripts/grabar-metricas.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config as cargarEntorno } from "dotenv";

// Graba respuestas reales de la API de Web Analytics para que los mapeos y
// sus tests se escriban contra lo que la API devuelve, no contra la doc.
// Uso: pnpm --filter sitio exec tsx scripts/grabar-metricas.ts
cargarEntorno({ path: [".env.local"], quiet: true });

const token = process.env.VERCEL_TOKEN;
const proyecto = process.env.VERCEL_ANALYTICS_PROJECT_ID;
const equipo = process.env.VERCEL_TEAM_ID;
if (!token || !proyecto) {
  console.error("Faltan VERCEL_TOKEN y/o VERCEL_ANALYTICS_PROJECT_ID en apps/sitio/.env.local");
  process.exit(1);
}

const BASE = "https://api.vercel.com/v1/query/web-analytics";
const DIR = path.resolve("src/lib/metricas/__fixtures__");
mkdirSync(DIR, { recursive: true });

const dia = (haceDias: number) => new Date(Date.now() - haceDias * 86_400_000).toISOString().slice(0, 10);
const ayer = dia(1);
const hace7 = dia(7);

async function grabar(nombre: string, ruta: string, params: Record<string, string | string[]>) {
  const url = new URL(`${BASE}/${ruta}`);
  url.searchParams.set("projectId", proyecto!);
  if (equipo) url.searchParams.set("teamId", equipo);
  for (const [clave, valor] of Object.entries(params)) {
    if (Array.isArray(valor)) valor.forEach((v) => url.searchParams.append(clave, v));
    else url.searchParams.set(clave, valor);
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const texto = await res.text();
  let cuerpo: unknown = texto;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    // Si no es JSON, se guarda el texto tal cual: también es evidencia.
  }
  writeFileSync(path.join(DIR, `${nombre}.json`), JSON.stringify({ estado: res.status, consulta: params, cuerpo }, null, 2) + "\n");
  console.log(`${nombre}: ${res.status}`);
  await new Promise((r) => setTimeout(r, 300));
}

const rango = { since: hace7, until: ayer };
await grabar("total-por-dia", "visits/aggregate", { ...rango, by: "day" });
// Dos dimensiones: primero como parámetro repetido; si da 400, probar "day,requestPath".
await grabar("pagina-por-dia", "visits/aggregate", { ...rango, by: ["day", "requestPath"], limit: "100" });
await grabar("pais-por-dia", "visits/aggregate", { ...rango, by: ["day", "country"], limit: "30" });
await grabar("referido-por-dia", "visits/aggregate", { ...rango, by: ["day", "referrerHostname"], limit: "30" });
await grabar("dispositivo-por-dia", "visits/aggregate", { ...rango, by: ["day", "deviceType"], limit: "10" });
// Ventanas: visitantes únicos de un rango entero, sin agrupar.
await grabar("ventana-sin-by", "visits/aggregate", { ...rango });
await grabar("ventana-count", "visits/count", { ...rango });
```

- [ ] **Step 4: Correrlo y leer lo que vino**

```bash
pnpm --filter sitio exec tsx scripts/grabar-metricas.ts
ls apps/sitio/src/lib/metricas/__fixtures__
node -e "for (const n of ['total-por-dia','pagina-por-dia','ventana-sin-by','ventana-count']) { const j=require('./apps/sitio/src/lib/metricas/__fixtures__/'+n+'.json'); console.log(n, j.estado, JSON.stringify(j.cuerpo).slice(0,300)); }"
```

Esperado: siete archivos. Con ellos se decide, y queda en `DECISIONS.md`:
1. **Cómo van las dos dimensiones**: si `pagina-por-dia.json` trae `estado:
   400`, editar el script para mandar `by: "day,requestPath"` (y las otras
   tres) y volver a correr; el cliente de A5 usa la forma que funcionó.
2. **Qué claves trae cada fila**: `timestamp` o `day` para el día;
   `requestPath` / `country` / `referrerHostname` / `deviceType` para la
   dimensión; `pageviews` y `visitors`. Y cómo viene la fila del resto
   («Others», `null`, u otra cosa).
3. **Cómo se piden las ventanas**: (a) `ventana-sin-by.json` con `estado: 200`
   y `pageviews`/`visitors` → el cliente usa `visits/aggregate` sin `by`;
   (b) si (a) es 400 pero `ventana-count.json` es 200 → usa `visits/count`
   con `since`/`until`; (c) si las dos fallan → las tarjetas muestran vistas
   (que sí se suman) y «visitantes únicos: no disponible por ahora», y se
   anota como abierto.

- [ ] **Step 5: Commit** (con OK)

```bash
git add apps/sitio/scripts/grabar-metricas.ts apps/sitio/src/lib/metricas/__fixtures__ apps/sitio/.env.example work/metricas/DECISIONS.md
git commit -m "test(metricas): grabar las respuestas reales de la API de Web Analytics"
```

---

### Task A2: El sitio cuenta

**Files:**
- Modify: `apps/sitio/package.json` (dependencia `@vercel/analytics`)
- Modify: `apps/sitio/src/app/(sitio)/layout.tsx`
- Modify: `apps/sitio/src/middleware.ts` (matcher)

- [ ] **Step 1: La dependencia** (con OK): `pnpm --filter sitio add @vercel/analytics`.

- [ ] **Step 2: El componente, solo en producción.** En
`apps/sitio/src/app/(sitio)/layout.tsx`, sumar el import después del de
`siteConfig`:

```ts
import { Analytics } from "@vercel/analytics/next";
```

y, dentro de `<body>`, justo antes de `</body>` (después de `</LenisProvider>`):

```tsx
        {/* Cuenta vistas y visitantes sin cookies (ADR-0009). Solo en producción:
            en desarrollo cargaría un script de depuración desde un dominio de
            Vercel que la CSP bloquea, y no hay nada que medir. */}
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
```

- [ ] **Step 3: El matcher.** En `apps/sitio/src/middleware.ts`, la línea del
`matcher` queda:

```ts
  matcher: ["/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|woff2)$).*)"],
```

y en el comentario de arriba agregar: `_vercel` es el script y los envíos de
la analítica (`/_vercel/insights/…`): pasarlos por el middleware gastaba una
invocación por vista y no aportaba nada.

- [ ] **Step 4: Verificar con un build de producción**

```bash
cd apps/sitio && rm -rf .next && pnpm exec next build > /dev/null 2>&1 && (PORT=3100 pnpm exec next start > /tmp/analytics.log 2>&1 &); until curl -s -o /dev/null http://localhost:3100/; do sleep 1; done; curl -s http://localhost:3100/ | grep -o '/_vercel/insights/script.js' | head -n 1; curl -s http://localhost:3100/admin/entrar | grep -c '_vercel/insights' ; PID=$(netstat -ano | grep ":3100 " | grep LISTENING | awk '{print $5}' | head -n 1); taskkill //PID $PID //F > /dev/null
```

Esperado: la primera línea imprime `/_vercel/insights/script.js` (el sitio
carga el script); la segunda imprime `0` (el admin no).

- [ ] **Step 5: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/package.json pnpm-lock.yaml "apps/sitio/src/app/(sitio)/layout.tsx" apps/sitio/src/middleware.ts
git commit -m "feat(metricas): contar visitas con Vercel Web Analytics"
```

---

### Task A3: Las tres tablas

**Files:**
- Create: `apps/sitio/prisma/schema/metricas.prisma`
- Create: `apps/sitio/prisma/migrations/<marca>_metricas/` (la genera Prisma)

**Interfaces:**
- Produce: `base.metricaDiaria` (clave compuesta `fecha_dimension_valor`),
  `base.metricaVentana` (clave `fechaFin_dias`), `base.sincronizacionMetricas`.

- [ ] **Step 1: El esquema** `apps/sitio/prisma/schema/metricas.prisma`:

```prisma
// La copia diaria de la analítica de Vercel (ADR-0009, work/metricas/SPEC.md).
// La llena un cron; el admin lee de acá y nunca de la API en el render.

/// Una fila por día, dimensión y valor. `valor` es "" en la fila del total y
/// en la fila «el resto» (que además lleva `agrupado = true`).
model MetricaDiaria {
  fecha      DateTime @db.Date
  dimension  String   // total | pagina | pais | referido | dispositivo
  valor      String   // "" · la ruta · el país (ISO-2) · el host · el tipo
  agrupado   Boolean  @default(false)
  vistas     Int
  visitantes Int      // únicos DE ESE DÍA: no se suman entre días

  @@id([fecha, dimension, valor])
  @@map("metricas_diarias")
}

/// Visitantes únicos de una ventana entera, pedidos a la API como un rango:
/// una persona que entró tres días cuenta una vez. Es lo que muestran las
/// tarjetas; sumar los días daría un número inflado.
model MetricaVentana {
  fechaFin   DateTime @db.Date  // el último día de la ventana (ayer)
  dias       Int               // 7 | 30
  vistas     Int
  visitantes Int

  @@id([fechaFin, dias])
  @@map("metricas_ventanas")
}

/// Qué pasó en cada sincronización: el panel muestra la última y sus errores.
model SincronizacionMetricas {
  id        Int      @id @default(autoincrement())
  corridaEn DateTime @default(now())
  desde     DateTime @db.Date
  hasta     DateTime @db.Date
  ok        Boolean
  detalle   String   // "3 días, 187 filas, 4 ventanas" o el error, en llano

  @@map("metricas_sincronizaciones")
}
```

Si en A1 la ventana quedó en la rama (c), `visitantes` de `MetricaVentana`
pasa a `Int?` y se anota en `DECISIONS.md`.

- [ ] **Step 2: Migración y cliente**

```bash
pnpm migrate --name metricas 2>&1 | tail -n 6
pnpm generate 2>&1 | tail -n 2
ls apps/sitio/prisma/migrations | tail -n 1
docker exec ed-postgres psql -U postgres -d ed -c "\dt" | grep metricas
```

Esperado: una carpeta `<marca>_metricas` con su `migration.sql`, cliente
regenerado y las tres tablas en la base local.

- [ ] **Step 3: Commit** (con OK)

```bash
git add apps/sitio/prisma/schema/metricas.prisma apps/sitio/prisma/migrations
git commit -m "feat(metricas): las tablas de la copia diaria"
```

---

### Task A4: Las fechas

**Files:**
- Create: `apps/sitio/src/lib/metricas/tipos.ts`
- Create: `apps/sitio/src/lib/metricas/periodos.ts`
- Test: `apps/sitio/src/lib/metricas/periodos.test.ts`

**Interfaces:**
- Produce (`tipos.ts`): `Dimension`, `FilaDiaria`, `Rango`, `Ventana`.
- Produce (`periodos.ts`): `diaISO(fecha: Date): string`,
  `ayerUTC(hoy: Date): string`, `sumarDias(dia: string, n: number): string`,
  `rangoFaltante({ ultimoGuardado, hoy }): Rango | null`,
  `ventanasDe(fechaFin: string): Array<{ fechaFin: string; dias: 7 | 30; desde: string }>`,
  `variacion(actual: number, anterior: number | null): string`.

- [ ] **Step 1: Los tipos** `apps/sitio/src/lib/metricas/tipos.ts`:

```ts
// Vocabulario de la copia diaria. Sin dominio de ED: sirve para cualquier
// sitio medido con Web Analytics.
export type Dimension = "total" | "pagina" | "pais" | "referido" | "dispositivo";

export const DIMENSIONES: readonly Dimension[] = ["total", "pagina", "pais", "referido", "dispositivo"];

/** Un día `YYYY-MM-DD`, siempre UTC, como agrupa la API. */
export type Dia = string;

export type Rango = { desde: Dia; hasta: Dia };

export type FilaDiaria = {
  fecha: Dia;
  dimension: Dimension;
  valor: string; // "" en total y en la fila «el resto»
  agrupado: boolean;
  vistas: number;
  visitantes: number;
};

export type Ventana = { fechaFin: Dia; dias: 7 | 30; vistas: number; visitantes: number };
```

- [ ] **Step 2: Los tests** `apps/sitio/src/lib/metricas/periodos.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { ayerUTC, diaISO, rangoFaltante, sumarDias, variacion, ventanasDe } from "./periodos";

test("diaISO y sumarDias trabajan en UTC", () => {
  assert.equal(diaISO(new Date("2026-09-21T23:30:00.000Z")), "2026-09-21");
  assert.equal(sumarDias("2026-03-01", -1), "2026-02-28");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
});

test("ayerUTC es el día anterior en UTC, no en la zona local", () => {
  assert.equal(ayerUTC(new Date("2026-09-21T00:30:00.000Z")), "2026-09-20");
});

test("sin nada guardado, el rango son los últimos 30 días hasta ayer", () => {
  assert.deepEqual(rangoFaltante({ ultimoGuardado: null, hoy: new Date("2026-09-21T12:00:00.000Z") }), {
    desde: "2026-08-22",
    hasta: "2026-09-20",
  });
});

test("con datos, el rango arranca el día siguiente al último guardado", () => {
  assert.deepEqual(rangoFaltante({ ultimoGuardado: "2026-09-17", hoy: new Date("2026-09-21T12:00:00.000Z") }), {
    desde: "2026-09-18",
    hasta: "2026-09-20",
  });
});

test("al día, no hay rango", () => {
  assert.equal(rangoFaltante({ ultimoGuardado: "2026-09-20", hoy: new Date("2026-09-21T12:00:00.000Z") }), null);
});

test("nunca más de 31 días por corrida", () => {
  const r = rangoFaltante({ ultimoGuardado: "2026-01-01", hoy: new Date("2026-09-21T12:00:00.000Z") });
  assert.deepEqual(r, { desde: "2026-08-21", hasta: "2026-09-20" });
});

test("las cuatro ventanas: 7 y 30 días hasta el fin, y las anteriores", () => {
  assert.deepEqual(ventanasDe("2026-09-20"), [
    { fechaFin: "2026-09-20", dias: 7, desde: "2026-09-14" },
    { fechaFin: "2026-09-20", dias: 30, desde: "2026-08-22" },
    { fechaFin: "2026-09-13", dias: 7, desde: "2026-09-07" },
    { fechaFin: "2026-08-21", dias: 30, desde: "2026-07-23" },
  ]);
});

test("la variación se lee como la leería una persona", () => {
  assert.equal(variacion(112, 100), "+12 %");
  assert.equal(variacion(97, 100), "−3 %");
  assert.equal(variacion(100, 100), "igual");
  assert.equal(variacion(5, 0), "sin datos previos");
  assert.equal(variacion(5, null), "sin datos previos");
});
```

- [ ] **Step 3: Verlos fallar** — `pnpm --filter sitio test` → falla por
`./periodos` inexistente.

- [ ] **Step 4: La implementación** `apps/sitio/src/lib/metricas/periodos.ts`:

```ts
import type { Dia, Rango } from "./tipos";

// Todo en UTC: es como la API agrupa los días. Para ED (Chile, Argentina,
// México) el corte cae entre las 20 y las 21; en un número mensual no se nota
// y el panel lo dice en la cabecera.

const MS_POR_DIA = 86_400_000;
const MAXIMO_DIAS_POR_CORRIDA = 31;

export function diaISO(fecha: Date): Dia {
  return fecha.toISOString().slice(0, 10);
}

export function sumarDias(dia: Dia, n: number): Dia {
  return diaISO(new Date(new Date(`${dia}T00:00:00.000Z`).getTime() + n * MS_POR_DIA));
}

export function ayerUTC(hoy: Date): Dia {
  return sumarDias(diaISO(hoy), -1);
}

/**
 * Qué días faltan copiar: del siguiente al último guardado (o hace 30 días si
 * no hay nada) hasta ayer. Hoy no: el día está incompleto. Nunca más de 31
 * días por corrida, para que una función no se quede sin tiempo.
 */
export function rangoFaltante({ ultimoGuardado, hoy }: { ultimoGuardado: Dia | null; hoy: Date }): Rango | null {
  const hasta = ayerUTC(hoy);
  const desdeDeseado = ultimoGuardado ? sumarDias(ultimoGuardado, 1) : sumarDias(hasta, -29);
  if (desdeDeseado > hasta) return null;
  const desdeMinimo = sumarDias(hasta, -(MAXIMO_DIAS_POR_CORRIDA - 1));
  return { desde: desdeDeseado < desdeMinimo ? desdeMinimo : desdeDeseado, hasta };
}

/** Las ventanas que muestran las tarjetas, y las anteriores para comparar. */
export function ventanasDe(fechaFin: Dia): Array<{ fechaFin: Dia; dias: 7 | 30; desde: Dia }> {
  const ventana = (fin: Dia, dias: 7 | 30) => ({ fechaFin: fin, dias, desde: sumarDias(fin, -(dias - 1)) });
  return [ventana(fechaFin, 7), ventana(fechaFin, 30), ventana(sumarDias(fechaFin, -7), 7), ventana(sumarDias(fechaFin, -30), 30)];
}

/** «+12 %», «−3 %», «igual» o «sin datos previos»: como lo diría una persona. */
export function variacion(actual: number, anterior: number | null): string {
  if (anterior === null || anterior === 0) return "sin datos previos";
  const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
  if (porcentaje === 0) return "igual";
  return `${porcentaje > 0 ? "+" : "−"}${Math.abs(porcentaje)} %`;
}
```

- [ ] **Step 5: Verlos pasar** — `pnpm --filter sitio test` → 8 tests en verde.

- [ ] **Step 6: Commit** (con OK)

```bash
git add apps/sitio/src/lib/metricas/tipos.ts apps/sitio/src/lib/metricas/periodos.ts apps/sitio/src/lib/metricas/periodos.test.ts
git commit -m "feat(metricas): las fechas y ventanas de la copia diaria"
```

---

### Task A5: El cliente de la API y sus mapeos

**Files:**
- Create: `apps/sitio/src/lib/metricas/vercel.ts`
- Test: `apps/sitio/src/lib/metricas/vercel.test.ts`

**Interfaces:**
- Consume: `Dimension`, `FilaDiaria`, `Rango` de `tipos.ts`; los `__fixtures__` de A1.
- Produce: `ErrorDeAnaliticas` (con `estado: number`), `mapearPorDia(cuerpo: unknown, dimension: Dimension): FilaDiaria[]`,
  `mapearVentana(cuerpo: unknown): { vistas: number; visitantes: number }`,
  `crearClienteDeAnaliticas({ token, proyecto, equipo?, fetchImpl? }): ClienteDeAnaliticas`
  con `porDia(rango, dimension): Promise<FilaDiaria[]>` y
  `ventana(rango): Promise<{ vistas: number; visitantes: number }>`.

- [ ] **Step 1: Los tests** `apps/sitio/src/lib/metricas/vercel.test.ts`
(ajustar las claves de las filas a lo que dijo A1 si difieren de
`timestamp`/`requestPath`):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ErrorDeAnaliticas, crearClienteDeAnaliticas, mapearPorDia, mapearVentana } from "./vercel";

test("el total por día se mapea con valor vacío", () => {
  const filas = mapearPorDia({ data: [{ timestamp: "2026-09-20T00:00:00.000Z", pageviews: 5, visitors: 4 }] }, "total");
  assert.deepEqual(filas, [{ fecha: "2026-09-20", dimension: "total", valor: "", agrupado: false, vistas: 5, visitantes: 4 }]);
});

test("una dimensión toma su clave y marca la fila del resto", () => {
  const filas = mapearPorDia(
    {
      data: [
        { timestamp: "2026-09-20T00:00:00.000Z", requestPath: "/novedades", pageviews: 3, visitors: 3 },
        { timestamp: "2026-09-20T00:00:00.000Z", requestPath: "Others", pageviews: 9, visitors: 7 },
      ],
    },
    "pagina",
  );
  assert.deepEqual(filas, [
    { fecha: "2026-09-20", dimension: "pagina", valor: "/novedades", agrupado: false, vistas: 3, visitantes: 3 },
    { fecha: "2026-09-20", dimension: "pagina", valor: "", agrupado: true, vistas: 9, visitantes: 7 },
  ]);
});

test("un referido vacío queda como cadena vacía sin marcarse como resto", () => {
  const [fila] = mapearPorDia({ data: [{ timestamp: "2026-09-20T00:00:00.000Z", referrerHostname: "", pageviews: 1, visitors: 1 }] }, "referido");
  assert.equal(fila.valor, "");
  assert.equal(fila.agrupado, false);
});

test("la ventana acepta un objeto o una lista de una fila", () => {
  assert.deepEqual(mapearVentana({ data: { pageviews: 10, visitors: 8 } }), { vistas: 10, visitantes: 8 });
  assert.deepEqual(mapearVentana({ data: [{ pageviews: 10, visitors: 8 }] }), { vistas: 10, visitantes: 8 });
});

test("las respuestas grabadas de la API se mapean enteras", () => {
  const ruta = path.resolve("src/lib/metricas/__fixtures__/pagina-por-dia.json");
  if (!existsSync(ruta)) return;
  const grabada = JSON.parse(readFileSync(ruta, "utf8")) as { estado: number; cuerpo: unknown };
  if (grabada.estado !== 200) return;
  for (const fila of mapearPorDia(grabada.cuerpo, "pagina")) {
    assert.match(fila.fecha, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(fila.vistas) && fila.vistas >= 0);
    assert.ok(Number.isInteger(fila.visitantes) && fila.visitantes >= 0);
  }
});

test("un 401 se explica en llano", async () => {
  const cliente = crearClienteDeAnaliticas({
    token: "x",
    proyecto: "prj_x",
    fetchImpl: async () => new Response("no", { status: 401 }),
  });
  await assert.rejects(() => cliente.porDia({ desde: "2026-09-01", hasta: "2026-09-02" }, "total"), (e: unknown) => {
    assert.ok(e instanceof ErrorDeAnaliticas);
    assert.equal(e.estado, 401);
    assert.match(e.message, /token/);
    return true;
  });
});
```

- [ ] **Step 2: Verlos fallar** — `pnpm --filter sitio test`.

- [ ] **Step 3: La implementación** `apps/sitio/src/lib/metricas/vercel.ts`:

```ts
import type { Dimension, FilaDiaria, Rango } from "./tipos";

// Cliente de la API pública de Web Analytics de Vercel. No sabe nada de ED:
// recibe proyecto, token y fechas, devuelve filas.
const BASE = "https://api.vercel.com/v1/query/web-analytics";

const CLAVE_POR_DIMENSION: Record<Exclude<Dimension, "total">, { by: string; limite: number }> = {
  pagina: { by: "requestPath", limite: 100 },
  pais: { by: "country", limite: 30 },
  referido: { by: "referrerHostname", limite: 30 },
  dispositivo: { by: "deviceType", limite: 10 },
};

export class ErrorDeAnaliticas extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeAnaliticas";
  }
}

function explicar(estado: number): string {
  if (estado === 401) return "Vercel respondió 401: el token no sirve o venció.";
  if (estado === 403) return "Vercel respondió 403: el token no tiene acceso a este proyecto.";
  if (estado === 429) return "Vercel respondió 429: demasiadas consultas, esperá un minuto.";
  return `Vercel respondió ${estado}.`;
}

type Fila = Record<string, unknown>;

function filasDe(cuerpo: unknown): Fila[] {
  const data = (cuerpo as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as Fila[];
  if (data && typeof data === "object") return [data as Fila];
  return [];
}

function entero(valor: unknown): number {
  return typeof valor === "number" && Number.isFinite(valor) ? Math.max(0, Math.round(valor)) : 0;
}

/** Filas de `visits/aggregate` con `by=day` (+ una dimensión) → filas nuestras. */
export function mapearPorDia(cuerpo: unknown, dimension: Dimension): FilaDiaria[] {
  return filasDe(cuerpo).map((fila) => {
    const dia = String(fila.timestamp ?? fila.day ?? "").slice(0, 10);
    let valor = "";
    let agrupado = false;
    if (dimension !== "total") {
      const crudo = fila[CLAVE_POR_DIMENSION[dimension].by];
      // La API junta lo que no entra en el límite en una fila «Others».
      if (crudo === null || crudo === undefined || crudo === "Others") agrupado = crudo === "Others";
      else valor = String(crudo);
    }
    return { fecha: dia, dimension, valor, agrupado, vistas: entero(fila.pageviews), visitantes: entero(fila.visitors) };
  });
}

/** Una consulta de rango sin agrupar → vistas y visitantes únicos del rango. */
export function mapearVentana(cuerpo: unknown): { vistas: number; visitantes: number } {
  const [fila] = filasDe(cuerpo);
  return { vistas: entero(fila?.pageviews), visitantes: entero(fila?.visitors) };
}

export type ClienteDeAnaliticas = {
  porDia(rango: Rango, dimension: Dimension): Promise<FilaDiaria[]>;
  ventana(rango: Rango): Promise<{ vistas: number; visitantes: number }>;
};

export function crearClienteDeAnaliticas({
  token,
  proyecto,
  equipo,
  fetchImpl = fetch,
}: {
  token: string;
  proyecto: string;
  equipo?: string;
  fetchImpl?: typeof fetch;
}): ClienteDeAnaliticas {
  async function consultar(ruta: "visits/aggregate" | "visits/count", params: Record<string, string>, by: string[] = []): Promise<unknown> {
    const url = new URL(`${BASE}/${ruta}`);
    url.searchParams.set("projectId", proyecto);
    if (equipo) url.searchParams.set("teamId", equipo);
    for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, valor);
    // Forma decidida en A1: parámetro repetido. Si la API pidió "day,x", cambiar por
    // url.searchParams.set("by", by.join(",")).
    for (const b of by) url.searchParams.append("by", b);
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new ErrorDeAnaliticas(res.status, explicar(res.status));
    return res.json();
  }

  return {
    async porDia(rango, dimension) {
      const params: Record<string, string> = { since: rango.desde, until: rango.hasta };
      const by = ["day"];
      if (dimension !== "total") {
        by.push(CLAVE_POR_DIMENSION[dimension].by);
        params.limit = String(CLAVE_POR_DIMENSION[dimension].limite);
      }
      return mapearPorDia(await consultar("visits/aggregate", params, by), dimension);
    },
    async ventana(rango) {
      // Rama decidida en A1: (a) aggregate sin `by`; si la API lo rechaza con 400,
      // (b) count con since/until. Si ninguna sirvió, A1 lo dejó anotado y este
      // método no se llama.
      try {
        return mapearVentana(await consultar("visits/aggregate", { since: rango.desde, until: rango.hasta }));
      } catch (e) {
        if (e instanceof ErrorDeAnaliticas && e.estado === 400) {
          return mapearVentana(await consultar("visits/count", { since: rango.desde, until: rango.hasta }));
        }
        throw e;
      }
    },
  };
}
```

- [ ] **Step 4: Verlos pasar** — `pnpm --filter sitio test` → todo en verde.

- [ ] **Step 5: Commit** (con OK)

```bash
git add apps/sitio/src/lib/metricas/vercel.ts apps/sitio/src/lib/metricas/vercel.test.ts
git commit -m "feat(metricas): el cliente de la API de Web Analytics y sus mapeos"
```

---

### Task A6: Sincronizar y leer

**Files:**
- Create: `apps/sitio/src/datos/acciones/sincronizar-metricas.ts`
- Test: `apps/sitio/src/datos/acciones/sincronizar-metricas.test.ts`
- Create: `apps/sitio/src/datos/consultas/metricas.ts`

**Interfaces:**
- Consume: `base` de `@/datos/cliente`; `ClienteDeAnaliticas`, `crearClienteDeAnaliticas` de `@/lib/metricas/vercel`; `DIMENSIONES`, `FilaDiaria` de `@/lib/metricas/tipos`; `rangoFaltante`, `ventanasDe`, `ayerUTC`, `sumarDias`, `diaISO`, `variacion` de `@/lib/metricas/periodos`.
- Produce: `sincronizarMetricas({ cliente, base, hoy?, minimoDias? }): Promise<{ ok: boolean; detalle: string }>`,
  `clienteDesdeEntorno(): ClienteDeAnaliticas | null`,
  `hayVariablesDeMetricas(): boolean`; en consultas: `estadoDeMetricas()`, `tarjetas()`.

- [ ] **Step 1: La sincronización** `apps/sitio/src/datos/acciones/sincronizar-metricas.ts`:

```ts
import type { PrismaClient } from "@/../prisma/generado/client";
import { ayerUTC, rangoFaltante, sumarDias, ventanasDe } from "@/lib/metricas/periodos";
import { DIMENSIONES } from "@/lib/metricas/tipos";
import type { FilaDiaria, Rango } from "@/lib/metricas/tipos";
import { crearClienteDeAnaliticas, type ClienteDeAnaliticas } from "@/lib/metricas/vercel";

// Copia a nuestra base lo que la API de Web Analytics tiene y todavía no
// guardamos. Idempotente: correr dos veces deja lo mismo. Registra cada
// corrida, también las fallidas, con el motivo en llano.

const PAUSA_MS = 250;
const fechaUTC = (dia: string) => new Date(`${dia}T00:00:00.000Z`);
const pausa = () => new Promise((r) => setTimeout(r, PAUSA_MS));

export function hayVariablesDeMetricas(): boolean {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_ANALYTICS_PROJECT_ID);
}

export function clienteDesdeEntorno(): ClienteDeAnaliticas | null {
  if (!hayVariablesDeMetricas()) return null;
  return crearClienteDeAnaliticas({
    token: process.env.VERCEL_TOKEN!,
    proyecto: process.env.VERCEL_ANALYTICS_PROJECT_ID!,
    equipo: process.env.VERCEL_TEAM_ID || undefined,
  });
}

async function registrar(base: PrismaClient, corrida: Rango & { ok: boolean; detalle: string }) {
  await base.sincronizacionMetricas.create({
    data: { desde: fechaUTC(corrida.desde), hasta: fechaUTC(corrida.hasta), ok: corrida.ok, detalle: corrida.detalle },
  });
  return { ok: corrida.ok, detalle: corrida.detalle };
}

async function guardarFila(base: PrismaClient, fila: FilaDiaria) {
  const clave = { fecha: fechaUTC(fila.fecha), dimension: fila.dimension, valor: fila.valor };
  const datos = { agrupado: fila.agrupado, vistas: fila.vistas, visitantes: fila.visitantes };
  await base.metricaDiaria.upsert({ where: { fecha_dimension_valor: clave }, create: { ...clave, ...datos }, update: datos });
}

export async function sincronizarMetricas({
  cliente,
  base,
  hoy = new Date(),
  minimoDias = 0,
}: {
  cliente: ClienteDeAnaliticas;
  base: PrismaClient;
  hoy?: Date;
  /** El botón «Actualizar ahora» pide siempre los últimos N días, por lo que llegó tarde. */
  minimoDias?: number;
}): Promise<{ ok: boolean; detalle: string }> {
  const ultimo = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } });
  const ayer = ayerUTC(hoy);
  let rango = rangoFaltante({ ultimoGuardado: ultimo ? ultimo.fecha.toISOString().slice(0, 10) : null, hoy });
  if (minimoDias > 0) {
    const desdeMinimo = sumarDias(ayer, -(minimoDias - 1));
    rango = { desde: rango && rango.desde < desdeMinimo ? rango.desde : desdeMinimo, hasta: ayer };
  }
  if (!rango) return registrar(base, { desde: ayer, hasta: ayer, ok: true, detalle: "Nada nuevo: ya estaba al día." });

  try {
    let filas = 0;
    for (const dimension of DIMENSIONES) {
      for (const fila of await cliente.porDia(rango, dimension)) {
        await guardarFila(base, fila);
        filas++;
      }
      await pausa();
    }
    let ventanas = 0;
    for (const v of ventanasDe(rango.hasta)) {
      const medida = await cliente.ventana({ desde: v.desde, hasta: v.fechaFin });
      const clave = { fechaFin: fechaUTC(v.fechaFin), dias: v.dias };
      await base.metricaVentana.upsert({ where: { fechaFin_dias: clave }, create: { ...clave, ...medida }, update: medida });
      ventanas++;
      await pausa();
    }
    const dias = Math.round((fechaUTC(rango.hasta).getTime() - fechaUTC(rango.desde).getTime()) / 86_400_000) + 1;
    return registrar(base, { ...rango, ok: true, detalle: `${dias} días, ${filas} filas, ${ventanas} ventanas.` });
  } catch (e) {
    return registrar(base, { ...rango, ok: false, detalle: e instanceof Error ? e.message : String(e) });
  }
}
```

- [ ] **Step 2: El test contra la base local** `apps/sitio/src/datos/acciones/sincronizar-metricas.test.ts`
(usa fechas de 2001 para no mezclarse con datos reales y las borra al final):

```ts
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { ClienteDeAnaliticas } from "@/lib/metricas/vercel";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const HOY = new Date("2001-01-11T12:00:00.000Z");
const fechaUTC = (dia: string) => new Date(`${dia}T00:00:00.000Z`);

const clienteFalso: ClienteDeAnaliticas = {
  async porDia(rango, dimension) {
    if (dimension !== "total") return [];
    return [{ fecha: rango.hasta, dimension, valor: "", agrupado: false, vistas: 10, visitantes: 8 }];
  },
  async ventana() {
    return { vistas: 30, visitantes: 20 };
  },
};

const clienteRoto: ClienteDeAnaliticas = {
  async porDia() {
    throw new Error("Vercel respondió 401: el token no sirve o venció.");
  },
  async ventana() {
    throw new Error("no debería llegar acá");
  },
};

test("correr dos veces deja las mismas filas y registra cada corrida", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./sincronizar-metricas");
  const antes = await base.sincronizacionMetricas.count();
  const r1 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY });
  const r2 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY, minimoDias: 3 });
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  const filas = await base.metricaDiaria.count({ where: { fecha: { gte: fechaUTC("2000-12-01"), lte: fechaUTC("2001-01-10") } } });
  assert.equal(filas, 1);
  const ventanas = await base.metricaVentana.count({ where: { fechaFin: { gte: fechaUTC("2000-12-01"), lte: fechaUTC("2001-01-10") } } });
  assert.equal(ventanas, 4);
  assert.equal(await base.sincronizacionMetricas.count(), antes + 2);
});

test("si la API falla, queda la fila de error y nada más", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./sincronizar-metricas");
  const r = await sincronizarMetricas({ cliente: clienteRoto, base, hoy: new Date("2001-02-11T12:00:00.000Z") });
  assert.equal(r.ok, false);
  assert.match(r.detalle, /401/);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.metricaDiaria.deleteMany({ where: { fecha: { lte: fechaUTC("2001-12-31") } } });
  await base.metricaVentana.deleteMany({ where: { fechaFin: { lte: fechaUTC("2001-12-31") } } });
  await base.sincronizacionMetricas.deleteMany({ where: { hasta: { lte: fechaUTC("2001-12-31") } } });
  await base.$disconnect();
});
```

- [ ] **Step 3: Correrlo** — `pnpm --filter sitio test` (con `.env.local` y el
Postgres de Docker arriba): los dos tests nuevos en verde.

- [ ] **Step 4: Las consultas** `apps/sitio/src/datos/consultas/metricas.ts`:

```ts
import { base } from "@/datos/cliente";
import { hayVariablesDeMetricas } from "@/datos/acciones/sincronizar-metricas";
import { sumarDias, variacion } from "@/lib/metricas/periodos";

// Lo que lee el panel. Solo de nuestras tablas: nunca de la API en el render.

const diaDe = (fecha: Date) => fecha.toISOString().slice(0, 10);
const fechaUTC = (dia: string) => new Date(`${dia}T00:00:00.000Z`);

export type EstadoDeMetricas = {
  hayVariables: boolean;
  hastaDia: string | null;
  ultima: { corridaEn: Date; ok: boolean; detalle: string } | null;
};

export async function estadoDeMetricas(): Promise<EstadoDeMetricas> {
  const [ultimoTotal, ultima] = await Promise.all([
    base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } }),
    base.sincronizacionMetricas.findFirst({ orderBy: { corridaEn: "desc" } }),
  ]);
  return { hayVariables: hayVariablesDeMetricas(), hastaDia: ultimoTotal ? diaDe(ultimoTotal.fecha) : null, ultima };
}

export type Tarjeta = {
  dias: 7 | 30;
  vistas: number;
  visitantes: number;
  variacionVistas: string;
  variacionVisitantes: string;
};

/** Las cuatro tarjetas: 7 y 30 días, cada una contra la ventana anterior. */
export async function tarjetas(hastaDia: string): Promise<Tarjeta[]> {
  const resultado: Tarjeta[] = [];
  for (const dias of [7, 30] as const) {
    const [actual, anterior] = await Promise.all([
      base.metricaVentana.findUnique({ where: { fechaFin_dias: { fechaFin: fechaUTC(hastaDia), dias } } }),
      base.metricaVentana.findUnique({ where: { fechaFin_dias: { fechaFin: fechaUTC(sumarDias(hastaDia, -dias)), dias } } }),
    ]);
    if (!actual) continue;
    resultado.push({
      dias,
      vistas: actual.vistas,
      visitantes: actual.visitantes,
      variacionVistas: variacion(actual.vistas, anterior?.vistas ?? null),
      variacionVisitantes: variacion(actual.visitantes, anterior?.visitantes ?? null),
    });
  }
  return resultado;
}
```

- [ ] **Step 5: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/datos/acciones/sincronizar-metricas.ts apps/sitio/src/datos/acciones/sincronizar-metricas.test.ts apps/sitio/src/datos/consultas/metricas.ts
git commit -m "feat(metricas): sincronizar la copia diaria y leer las tarjetas"
```

---

### Task A7: El cron

**Files:**
- Create: `apps/sitio/src/app/api/cron/metricas/route.ts`
- Modify: `apps/sitio/vercel.json` (clave `crons`)

- [ ] **Step 1: La ruta** `apps/sitio/src/app/api/cron/metricas/route.ts`:

```ts
import { base } from "@/datos/cliente";
import { clienteDesdeEntorno, sincronizarMetricas } from "@/datos/acciones/sincronizar-metricas";

// El cron de Vercel pega acá una vez por día. Sin el secreto correcto, 401 y
// no se toca nada. En el plan gratis corre con hasta una hora de imprecisión.
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const cliente = clienteDesdeEntorno();
  if (!cliente) {
    const detalle = "Faltan VERCEL_TOKEN y/o VERCEL_ANALYTICS_PROJECT_ID: ver el README.";
    const hoy = new Date();
    await base.sincronizacionMetricas.create({ data: { desde: hoy, hasta: hoy, ok: false, detalle } });
    return Response.json({ ok: false, detalle }, { status: 500 });
  }
  const resultado = await sincronizarMetricas({ cliente, base });
  return Response.json(resultado, { status: resultado.ok ? 200 : 500 });
}
```

- [ ] **Step 2: `vercel.json`** — sumar la clave `crons` al archivo que creó
`primer-deploy` (queda con `$schema`, `buildCommand` y esto):

```json
  "crons": [{ "path": "/api/cron/metricas", "schedule": "0 4 * * *" }]
```

- [ ] **Step 3: `CRON_SECRET` en local** — generar uno y ponerlo en
`apps/sitio/.env.local`; verificar con el server de dev levantado:

```bash
S=$(grep '^CRON_SECRET=' apps/sitio/.env.local | cut -d= -f2)
curl -s -o /dev/null -w "sin cabecera: %{http_code}\n" http://localhost:3000/api/cron/metricas
curl -s -w "\ncon cabecera: %{http_code}\n" -H "Authorization: Bearer $S" http://localhost:3000/api/cron/metricas
```

Esperado: 401; y 200 con `{"ok":true,"detalle":"… días, … filas, 4 ventanas."}`
(con el token y el ID en `.env.local`; la primera corrida trae hasta 30 días
del proyecto real) o 500 con «Faltan …» si no están.

- [ ] **Step 4: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/app/api/cron/metricas/route.ts apps/sitio/vercel.json
git commit -m "feat(metricas): el cron diario que copia la analítica"
```

---

### Task A8: El panel mínimo en la portada

**Files:**
- Create: `apps/sitio/src/datos/acciones/actualizar-metricas.ts`
- Create: `apps/sitio/src/admin/metricas/PanelMetricas.tsx`, `Tarjeta.tsx`, `Estado.tsx`, `ActualizarAhora.tsx`
- Modify: `apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx`

**Interfaces:**
- Consume: `estadoDeMetricas`, `tarjetas` de `@/datos/consultas/metricas`; `auth` de `@/datos/auth`; `Boton`, `Aviso` de `@/admin/armazon/Campos`.
- Produce: `actualizarMetricasAhora(): Promise<{ ok: boolean; detalle: string }>` (Server Action) y `<PanelMetricas />`.

- [ ] **Step 1: La acción, con sesión y freno** `apps/sitio/src/datos/acciones/actualizar-metricas.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { clienteDesdeEntorno, sincronizarMetricas } from "./sincronizar-metricas";

// Una Server Action corre antes de que se renderice el layout protegido, así
// que el layout no la cubre y el middleware solo mira que la cookie exista:
// la sesión se verifica acá. Y tiene freno: es el único disparador a mano de
// un token que abre toda la cuenta de Vercel.
const FRENO_MS = 10 * 60 * 1000;

export async function actualizarMetricasAhora(): Promise<{ ok: boolean; detalle: string }> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para actualizar." };

  const ultima = await base.sincronizacionMetricas.findFirst({ orderBy: { corridaEn: "desc" } });
  const hace = ultima ? Date.now() - ultima.corridaEn.getTime() : Infinity;
  if (hace < FRENO_MS) {
    const minutos = Math.max(1, Math.round(hace / 60_000));
    return { ok: false, detalle: `Se actualizó hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}; esperá un rato.` };
  }

  const cliente = clienteDesdeEntorno();
  if (!cliente) return { ok: false, detalle: "Faltan las variables de Vercel: ver el README." };

  const resultado = await sincronizarMetricas({ cliente, base, minimoDias: 3 });
  revalidatePath("/admin");
  return resultado;
}
```

- [ ] **Step 2: El botón** `apps/sitio/src/admin/metricas/ActualizarAhora.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Aviso } from "@/admin/armazon/Campos";
import { actualizarMetricasAhora } from "@/datos/acciones/actualizar-metricas";

export function ActualizarAhora() {
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => empezar(async () => setAviso(await actualizarMetricasAhora()))}
        className="rounded-lg border border-azul-claro px-3 py-1.5 text-sm text-azul-medio transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pendiente ? "Actualizando…" : "Actualizar ahora"}
      </button>
      {aviso ? <Aviso tono={aviso.ok ? "bien" : "error"}>{aviso.detalle}</Aviso> : null}
    </div>
  );
}
```

- [ ] **Step 3: Tarjeta y Estado**

`apps/sitio/src/admin/metricas/Tarjeta.tsx`:

```tsx
const numero = new Intl.NumberFormat("es-AR");

export function Tarjeta({ etiqueta, valor, variacion }: { etiqueta: string; valor: number; variacion: string }) {
  return (
    <div className="rounded-xl border border-azul-claro bg-white p-4">
      <p className="text-sm text-gris-texto">{etiqueta}</p>
      <p className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">{numero.format(valor)}</p>
      <p className="mt-1 text-xs text-gris-texto">{variacion} contra el período anterior</p>
    </div>
  );
}
```

`apps/sitio/src/admin/metricas/Estado.tsx`:

```tsx
/** Los estados vacíos del panel, en llano: qué pasa y qué hacer. */
export function Estado({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-azul-claro p-6">
      <p className="font-medium">{titulo}</p>
      <p className="mt-1 max-w-prose text-sm text-gris-texto">{texto}</p>
    </div>
  );
}
```

- [ ] **Step 4: El panel** `apps/sitio/src/admin/metricas/PanelMetricas.tsx`:

```tsx
import { Aviso } from "@/admin/armazon/Campos";
import { estadoDeMetricas, tarjetas } from "@/datos/consultas/metricas";
import { ActualizarAhora } from "./ActualizarAhora";
import { Estado } from "./Estado";
import { Tarjeta } from "./Tarjeta";

const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });
const horaCorta = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

/** Cuánta gente entra al sitio y qué páginas mira: la primera sección de la portada. */
export async function PanelMetricas() {
  const estado = await estadoDeMetricas();
  const cabecera = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-bold">Cuánta gente entra al sitio</h2>
        <p className="text-sm text-gris-texto">
          {estado.hastaDia
            ? `Datos hasta el ${fechaLarga.format(new Date(`${estado.hastaDia}T00:00:00.000Z`))} (días en hora universal).`
            : "Todavía sin datos."}
          {estado.ultima ? ` Actualizado el ${horaCorta.format(estado.ultima.corridaEn)}.` : ""}
        </p>
      </div>
      <ActualizarAhora />
    </div>
  );

  if (!estado.hayVariables) {
    return (
      <section aria-labelledby="metricas" className="space-y-4">
        {cabecera}
        <Estado titulo="Faltan las variables de Vercel" texto="Sin el token y el ID del proyecto no hay nada que copiar. Están explicadas en el README, sección «Admin»." />
      </section>
    );
  }
  if (!estado.hastaDia) {
    return (
      <section aria-labelledby="metricas" className="space-y-4">
        {cabecera}
        <Estado titulo="El sitio empieza a contar cuando se publica" texto="La primera copia llega al día siguiente del primer deploy. Si ya pasó un día, tocá «Actualizar ahora»." />
      </section>
    );
  }

  const cards = await tarjetas(estado.hastaDia);
  return (
    <section aria-labelledby="metricas" className="space-y-4">
      {cabecera}
      {estado.ultima && !estado.ultima.ok ? <Aviso tono="error">La última actualización falló: {estado.ultima.detalle}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.flatMap((t) => [
          <Tarjeta key={`v${t.dias}`} etiqueta={`Visitantes, últimos ${t.dias} días`} valor={t.visitantes} variacion={t.variacionVisitantes} />,
          <Tarjeta key={`p${t.dias}`} etiqueta={`Vistas, últimos ${t.dias} días`} valor={t.vistas} variacion={t.variacionVistas} />,
        ])}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: La portada la renderiza como sección**
`apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx`:

```tsx
import { PanelMetricas } from "@/admin/metricas/PanelMetricas";

export default function InicioDelAdmin() {
  return (
    <div className="space-y-12">
      <PanelMetricas />
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-bold">Todavía no hay nada que editar</h2>
        <p className="max-w-prose text-gris-texto">
          Estos son los cimientos: entrar, salir y elegir una contraseña. Las novedades, la
          biblioteca, los casos y el equipo llegan en las fases siguientes.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Verificar en el navegador** (server de dev levantado, sesión
con la cuenta local `facundo@prueba.local`):
  1. La portada muestra la sección «Cuánta gente entra al sitio» con el estado
     que corresponda: sin variables, sin datos, o las cuatro tarjetas si A7 ya
     trajo datos.
  2. «Actualizar ahora» dos veces seguidas: la segunda responde «Se actualizó
     hace 1 minuto; esperá un rato.»
  3. La acción exige sesión: con la portada abierta en una pestaña, cerrar
     sesión desde otra («Salir») y volver a la primera sin recargar; tocar
     «Actualizar ahora» responde «Hay que entrar al admin para actualizar.» y
     no crea ninguna fila en `metricas_sincronizaciones`
     (`docker exec ed-postgres psql -U postgres -d ed -c "select count(*) from metricas_sincronizaciones"` antes y después).

- [ ] **Step 7: Gates y commit** (con OK)

```bash
pnpm typecheck && pnpm lint && node scripts/verificar-react-doctor.mjs
git add apps/sitio/src/datos/acciones/actualizar-metricas.ts apps/sitio/src/admin/metricas "apps/sitio/src/app/(admin)/admin/(protegido)/page.tsx"
git commit -m "feat(metricas): el panel con las cuatro tarjetas en la portada del admin"
```

Con esto cierra la **fase A**: PR `feat(metricas): la copia diaria de la analítica y el panel mínimo` (con OK), gates y `pnpm build` en verde, merge con rebase.

---

### Task B1: La curva y las listas

**Files:**
- Modify: `apps/sitio/src/datos/consultas/metricas.ts` (sumar `curva`, `listas`)
- Test: `apps/sitio/src/lib/metricas/etiquetas.test.ts`
- Create: `apps/sitio/src/lib/metricas/etiquetas.ts`
- Create: `apps/sitio/src/admin/metricas/Curva.tsx`, `Lista.tsx`
- Modify: `apps/sitio/src/admin/metricas/PanelMetricas.tsx`

**Interfaces:**
- Produce: `etiquetaDe(dimension, valor, agrupado): string`; `curva(hastaDia): Promise<Array<{ fecha: string; visitantes: number }>>`;
  `listas(hastaDia): Promise<Record<"pagina" | "referido" | "pais" | "dispositivo", Array<{ etiqueta: string; vistas: number }>>>`.

- [ ] **Step 1: Test de las etiquetas** `apps/sitio/src/lib/metricas/etiquetas.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { etiquetaDe } from "./etiquetas";

test("los países salen con nombre en español", () => {
  assert.equal(etiquetaDe("pais", "AR", false), "Argentina");
  assert.equal(etiquetaDe("pais", "ZZ", false), "ZZ");
});

test("un referido vacío es tráfico directo y el resto se dice así", () => {
  assert.equal(etiquetaDe("referido", "", false), "directo");
  assert.equal(etiquetaDe("referido", "", true), "el resto");
  assert.equal(etiquetaDe("referido", "google.com", false), "google.com");
});

test("los dispositivos hablan castellano", () => {
  assert.equal(etiquetaDe("dispositivo", "mobile", false), "celular");
  assert.equal(etiquetaDe("dispositivo", "desktop", false), "computadora");
  assert.equal(etiquetaDe("dispositivo", "tablet", false), "tablet");
});
```

- [ ] **Step 2: Verlo fallar; después** `apps/sitio/src/lib/metricas/etiquetas.ts`:

```ts
import type { Dimension } from "./tipos";

// Cómo se muestra cada valor crudo de la API. Sin dominio de ED.
const paises = new Intl.DisplayNames(["es"], { type: "region" });
const DISPOSITIVOS: Record<string, string> = { mobile: "celular", desktop: "computadora", tablet: "tablet" };

export function etiquetaDe(dimension: Dimension, valor: string, agrupado: boolean): string {
  if (agrupado) return "el resto";
  if (dimension === "pais") {
    try {
      return paises.of(valor) ?? valor;
    } catch {
      return valor;
    }
  }
  if (dimension === "referido") return valor === "" ? "directo" : valor;
  if (dimension === "dispositivo") return DISPOSITIVOS[valor] ?? valor;
  return valor;
}
```

`pnpm --filter sitio test` → en verde.

- [ ] **Step 3: Las consultas** — agregar al final de `apps/sitio/src/datos/consultas/metricas.ts`:

```ts
import { etiquetaDe } from "@/lib/metricas/etiquetas";

/** Visitantes de cada día, últimos 30 días hasta `hastaDia`. */
export async function curva(hastaDia: string): Promise<Array<{ fecha: string; visitantes: number }>> {
  const filas = await base.metricaDiaria.findMany({
    where: { dimension: "total", fecha: { gte: fechaUTC(sumarDias(hastaDia, -29)), lte: fechaUTC(hastaDia) } },
    orderBy: { fecha: "asc" },
  });
  return filas.map((f) => ({ fecha: diaDe(f.fecha), visitantes: f.visitantes }));
}

const LISTAS = ["pagina", "referido", "pais", "dispositivo"] as const;
export type ListaDimension = (typeof LISTAS)[number];

/** Vistas sumadas de los últimos 30 días, las diez primeras por dimensión. */
export async function listas(hastaDia: string): Promise<Record<ListaDimension, Array<{ etiqueta: string; vistas: number }>>> {
  const grupos = await base.metricaDiaria.groupBy({
    by: ["dimension", "valor", "agrupado"],
    where: { dimension: { in: [...LISTAS] }, fecha: { gte: fechaUTC(sumarDias(hastaDia, -29)), lte: fechaUTC(hastaDia) } },
    _sum: { vistas: true },
  });
  const resultado = { pagina: [], referido: [], pais: [], dispositivo: [] } as Record<ListaDimension, Array<{ etiqueta: string; vistas: number }>>;
  for (const g of grupos) {
    const dimension = g.dimension as ListaDimension;
    resultado[dimension].push({ etiqueta: etiquetaDe(dimension, g.valor, g.agrupado), vistas: g._sum.vistas ?? 0 });
  }
  for (const lista of Object.values(resultado)) lista.sort((a, b) => b.vistas - a.vistas).splice(10);
  return resultado;
}
```

(los `import` van arriba del archivo, con los demás.)

- [ ] **Step 4: La curva** `apps/sitio/src/admin/metricas/Curva.tsx` (SVG propio, con tabla oculta para lectores de pantalla):

```tsx
const ANCHO = 600;
const ALTO = 160;
const MARGEN = 24;
const diaCorto = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });

/** Visitantes por día, últimos 30 días. */
export function Curva({ puntos }: { puntos: Array<{ fecha: string; visitantes: number }> }) {
  if (puntos.length < 2) return null;
  const maximo = Math.max(1, ...puntos.map((p) => p.visitantes));
  const x = (i: number) => MARGEN + (i / (puntos.length - 1)) * (ANCHO - 2 * MARGEN);
  const y = (v: number) => ALTO - MARGEN - (v / maximo) * (ALTO - 2 * MARGEN);
  const linea = puntos.map((p, i) => `${x(i).toFixed(1)},${y(p.visitantes).toFixed(1)}`).join(" ");
  const etiquetas = puntos.filter((_, i) => i % 7 === 0 || i === puntos.length - 1);

  return (
    <figure className="rounded-xl border border-azul-claro bg-white p-4">
      <figcaption className="text-sm text-gris-texto">Visitantes por día, últimos 30 días</figcaption>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mt-2 w-full" role="img" aria-label="Curva de visitantes por día">
        <polyline points={linea} fill="none" className="stroke-azul-principal" strokeWidth="2" />
        {puntos.map((p, i) => (
          <circle key={p.fecha} cx={x(i)} cy={y(p.visitantes)} r="3" className="fill-azul-principal">
            <title>{`${diaCorto.format(new Date(`${p.fecha}T00:00:00.000Z`))}: ${p.visitantes}`}</title>
          </circle>
        ))}
        {etiquetas.map((p) => (
          <text key={p.fecha} x={x(puntos.indexOf(p))} y={ALTO - 6} textAnchor="middle" className="fill-gris-texto text-[10px]">
            {diaCorto.format(new Date(`${p.fecha}T00:00:00.000Z`))}
          </text>
        ))}
      </svg>
      <table className="sr-only">
        <caption>Visitantes por día</caption>
        <tbody>
          {puntos.map((p) => (
            <tr key={p.fecha}>
              <th scope="row">{p.fecha}</th>
              <td>{p.visitantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
```

- [ ] **Step 5: La lista** `apps/sitio/src/admin/metricas/Lista.tsx`:

```tsx
const numero = new Intl.NumberFormat("es-AR");

/** Una lista con barras proporcionales: páginas, referidos, países o dispositivos. */
export function Lista({ titulo, filas }: { titulo: string; filas: Array<{ etiqueta: string; vistas: number }> }) {
  const maximo = Math.max(1, ...filas.map((f) => f.vistas));
  return (
    <div className="rounded-xl border border-azul-claro bg-white p-4">
      <h3 className="text-sm font-medium">{titulo}</h3>
      {filas.length === 0 ? (
        <p className="mt-2 text-sm text-gris-texto">Sin datos en estos 30 días.</p>
      ) : (
        <ol className="mt-2 space-y-2">
          {filas.map((f) => (
            <li key={f.etiqueta} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{f.etiqueta}</span>
                <span className="text-gris-texto">{numero.format(f.vistas)}</span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-azul-claro/40">
                <div className="h-1.5 rounded bg-azul-principal" style={{ width: `${(f.vistas / maximo) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 6: El panel las suma.** En `PanelMetricas.tsx`, importar
`curva`, `listas`, `Curva` y `Lista`; en la rama con datos, después de las
tarjetas:

```tsx
      <Curva puntos={await curva(estado.hastaDia)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Lista titulo="Páginas más vistas" filas={l.pagina} />
        <Lista titulo="De dónde llegan" filas={l.referido} />
        <Lista titulo="Países" filas={l.pais} />
        <Lista titulo="Dispositivos" filas={l.dispositivo} />
      </div>
```

con `const l = await listas(estado.hastaDia);` junto a `const cards = …`. Si
`PanelMetricas.tsx` pasa de 200 líneas, la rama con datos se muda a
`ConDatos.tsx` en la misma carpeta.

- [ ] **Step 7: Verificar en el navegador** con datos reales (A7 ya sincronizó):
la curva con sus puntos y títulos al pasar el mouse, las cuatro listas con
barras, el overlay de Next sin issues nuevos, y react-doctor en 100.

- [ ] **Step 8: Gates y commit** (con OK); PR `feat(metricas): la curva y las listas del panel`.

---

### Task C1: Verificación en producción y cierre

- [ ] **Step 1: Variables en Vercel** (Facundo): `pnpm dlx vercel@latest env add VERCEL_TOKEN production`,
`VERCEL_ANALYTICS_PROJECT_ID production`, `CRON_SECRET production` (generado
con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
Nada en preview: los previews no sincronizan.

- [ ] **Step 2: Deploy** con la fase A y B mergeadas (push a `main` deploya).
`pnpm dlx vercel@latest inspect <url> --logs | grep -i cron` muestra el cron
registrado.

- [ ] **Step 3: Disparar el cron y mirar**

```bash
pnpm dlx vercel@latest crons run /api/cron/metricas
```

y en `/admin` de producción: la sección con las tarjetas, la curva y las
listas; los totales de «últimos 7 días» coinciden con el dashboard de
Vercel → Analytics para el mismo rango (mismo día de corte, UTC).

- [ ] **Step 4: Cierre**

- README, sección «Admin»: las cuatro variables nuevas y una línea sobre el
  panel («la portada muestra cuánta gente entra; se actualiza sola una vez por
  día y a mano con «Actualizar ahora»»).
- `AGENTS.md` §3 (con OK): `lib/metricas/` y `admin/metricas/` en el árbol.
- `PROGRESS.md`: fases A, B y C hechas, con la fecha del primer cron en
  producción. Commit `docs(work): cerrar la lane de las métricas` (con OK) por PR.
