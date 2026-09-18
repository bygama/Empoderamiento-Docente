# Monorepo: el repo pasa a `apps/` — diseño

- **Fecha:** 2026-09-17
- **Estado:** aprobado en conversación (Mateo), pendiente de plan de implementación
- **Decide:** Mateo, con Facundo y Gastón
- **Relación:** complementa al [diseño del panel](2026-09-15-panel-admin-diseno.md)
  y **corrige su §3**: el árbol que ahí se describe pasa a vivir dentro de
  `apps/sitio/`. Lo demás de ese spec (alcance, modelo de contenido, acceso,
  fases) no cambia.

---

## 1. Qué se quiere

El sitio de ED es hoy un solo proyecto Next en la raíz del repo. El panel
(spec del 2026-09-15) está por sumar Payload, la definición del panel
(`src/cms`), la capa de lectura (`src/contenido`), migraciones y tipos
generados. Y ED, como organización, puede crecer a más de un producto web:
un portal de inscripción, un campus, la landing de una diplomatura.

La pregunta que originó este diseño: **¿conviene partir sitio y panel en dos
apps desde ahora, pensando en ese crecimiento?**

Lo que se busca:

1. Que sumar una segunda app, el día que exista, no obligue a rediseñar el
   repo ni a mover lo que esté en vuelo.
2. Que el gate de AGENTS.md §5.8 (react-doctor 100/100 en el `pre-push`)
   siga midiendo **todo el código nuestro**, y no se vuelva ciego al crecer.
3. No pagar hoy complejidad de operación por un crecimiento que todavía no
   ocurrió.

## 2. Decisión: monorepo con una app

**El repo pasa a un workspace pnpm con `apps/`, y por ahora hay una sola
app: `apps/sitio`.** Ahí adentro viven el sitio y el panel, con los route
groups `(sitio)` y `(payload)` que describe el spec del panel. **No se crea
`packages/`** hasta que exista un segundo consumidor real.

Son dos ejes distintos y conviene no confundirlos:

- **Layout del repo** (`apps/` + `packages/`) → es lo que hace barato crecer.
- **Cantidad de deployables** → es lo que hace caro operar.

Se adopta el primero, no el segundo.

### 2.1 Por qué no dos apps hoy

La unidad que merece ser una app es **un deployable**, no una sección. Con
Payload 3, sitio y panel son un deployable por construcción:

| Lo que cambia              | Una app (decidido)                             | Dos apps                                                                        |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Leer contenido en el build | `getPayload` local, mismo proceso              | también local, si el config vive en un paquete compartido — no es acá el costo   |
| Publicar → regenerar rutas | `revalidatePath` en el mismo proceso           | webhook del panel al sitio, con secreto, reintentos y un modo de fallar callado  |
| Vista previa con borrador  | cookie `draftMode`, mismo dominio              | iframe cross-origin, cookie de otro host, `SameSite`                             |
| Entornos                   | un proyecto Vercel, una rama de Neon por PR    | dos proyectos, dos previews apuntando a la **misma** rama de Neon, dos env sets  |

Todo eso por un panel que usan tres personas. El costo del split no está en
las lecturas: está en el **loop de publicación**, que con dos apps cruza la
red.

### 2.2 Las dos costuras que dejan la puerta abierta

El split no se descarta para siempre: se deja preparado y no se paga.

- **`src/contenido/`** (ya está en el spec del panel): el sitio nunca importa
  Payload directo. El día que el panel se vaya a `apps/panel`, esa capa
  cambia de local API a fetch y **ningún componente se entera**.
- **`src/cms/`**: la definición del panel queda en un solo lugar, movible a
  `packages/cms` el día que dos apps consuman el mismo contenido.

### 2.3 Por qué ahora y no después

Hoy la mudanza es mover una carpeta y cinco configs, con cero cambios de
código: el alias `@/*` sigue apuntando a `src/*` dentro de la app y ni un
import se toca. Después de la fase 1 del panel es un conflicto con cada PR
en vuelo, porque el panel toca 46 componentes en cinco fases y borra un
`data.ts` por sección. **La mudanza entra antes de la fase 0 y en un PR
solo.**

## 3. Cómo queda el repo

```
/
├── AGENTS.md  CLAUDE.md  DESIGN.md  README.md   ← el contrato es del repo
├── docs/                 ← documentación (incluye este spec)
├── skills/               ← workflows estables
├── .githooks/            ← pre-push: el gate de §5.8, del repo
├── scripts/              ← instalar-hooks.mjs, verificar-react-doctor.mjs
├── package.json          ← raíz del workspace: scripts que delegan + el gate
├── pnpm-workspace.yaml   ← packages: ["apps/*"]
├── pnpm-lock.yaml        ← uno solo, para todo el workspace
└── apps/
    └── sitio/
        ├── package.json        ← name "sitio": las dependencias de hoy
        ├── next.config.ts  tsconfig.json  eslint.config.mjs  postcss.config.mjs
        ├── .env.example
        ├── public/
        └── src/                ← lo único que mide el gate
            ├── payload.config.ts
            ├── payload-types.ts  ← GENERADO, se queda acá (§4.4)
            ├── cms/migraciones/  ← GENERADAS y commiteadas (§4.4)
            ├── app/
            │   ├── (sitio)/    ← el sitio de hoy; las URLs no cambian
            │   ├── (payload)/  ← GENERADO por Payload
            │   └── globals.css
            ├── cms/            ← definición del panel (nuestra)
            ├── contenido/      ← capa de lectura (la costura del §2.2)
            ├── components/  config/  features/  lib/
```

- **Se queda en la raíz** lo que es del repo y no de una app: el contrato
  (`AGENTS.md`, `CLAUDE.md`, `DESIGN.md`), `docs/`, `skills/`, el hook, los
  scripts del gate, el workspace y el lockfile.
- **Se muda a `apps/sitio/`** lo que es de la app: `src/`, `public/`, las
  configs de Next, TS, ESLint y PostCSS, y `.env.example`.
- **El alias `@/*` no cambia**: sigue siendo `./src/*`, resuelto por el
  `tsconfig.json` de la app.

## 4. El gate en monorepo

Es la parte que más se toca, y la que justifica el orden del §6.

### 4.1 Lo que hoy asume el verificador

- `package.json`: `react-doctor` = `pnpm dlx react-doctor --no-supply-chain src`
  — un solo path.
- `scripts/verificar-react-doctor.mjs` lee `informe.projects[0]` y prefija
  `src/` a mano en cada ruta.

Con más de un proyecto, **mediría uno y diría «todo en verde»**: exactamente
el desenlace que ese archivo fue escrito para evitar («una medición
incompleta no es un aprobado», §5.8). Por eso el verificador se arregla en
el mismo PR que la mudanza, no después.

### 4.2 Lo que se verificó de react-doctor (2026-09-17)

Comando:
`pnpm dlx react-doctor --no-supply-chain --json --project src/features,src/components`

| Lo que se quería saber              | Lo que devolvió                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ¿Soporta más de un proyecto?        | Sí. `--project a,b` acepta nombres de workspace o rutas y devuelve un `projects[]` con una entrada por proyecto. `-y` escanea todos.  |
| ¿Qué trae cada entrada?             | `directory`, `packageRoot`, `project.projectName`, `score: {score,label,rules}`, `complete`, `skippedChecks`, `analyzedFileCount`, `diagnostics[]`. |
| ¿El `summary` agrega?               | Sí: `summary.score` y `summary.totalDiagnosticCount` son del conjunto. Ojo: ahí `score` es número y en el proyecto es objeto (`p.score.score`). |
| ¿Se puede acotar a un subdirectorio?| Sí: `src/features` midió 266 archivos y `src/components`, 37 — y detectó igual framework y versiones subiendo al `package.json` de arriba. |

Con eso, acotar el gate a `apps/<app>/src` **no es apagar nada**: es el
mismo alcance que se mide hoy (`src`), declarado en el comando.

### 4.3 Cómo queda

En el `package.json` de la raíz, a la vista:

```json
"react-doctor": "pnpm dlx react-doctor --no-supply-chain --project apps/sitio/src"
```

La lista crece con cada app nueva. **El alcance del gate vive en el comando,
nunca en un config**, porque §5.8 prohíbe `doctor.config.*` y la clave
`reactDoctor`.

`scripts/verificar-react-doctor.mjs` pasa a:

- declarar la **lista de proyectos esperados** (hoy, `apps/sitio/src`) y
  **frenar si falta alguno** en el informe: un proyecto que no aparece es una
  medición incompleta, igual que un `skippedCheck`;
- recorrer `projects[]` y exigir, por cada uno, `complete !== false`,
  `skippedChecks` vacío y `score.score === 100`;
- exigir además `summary.totalDiagnosticCount === 0`;
- imprimir cada hallazgo con el directorio de su proyecto adelante, en vez
  del `src/` fijo de hoy.

Lo demás del verificador no cambia: sigue midiendo por `--json` y no por el
código de salida, y sigue dejando pasar el push cuando el comando no se pudo
correr (registry caído, sin red).

### 4.4 Lo generado por Payload

> **Corregido el 2026-09-18, por medición.** Este apartado decía que
> `payload-types.ts` y `migraciones/` tenían que salir de `src/` para no
> ensuciar la medición del gate. **No hace falta:** con la fase 0 del panel
> ya en `main`, el gate da **100/100 con todo lo generado adentro de `src/`**
> (356 archivos, `payload-types.ts` incluido, que tiene 430 líneas). La
> justificación era proteger un score que no estaba en riesgo, y el costo
> —pelearse con los defaults de Payload y sumar dos opciones de config— era
> real. Lo que sigue es lo que vale.

- **Lo generado se queda donde Payload lo pone.** `payload-types.ts` y
  `payload.config.ts` en la raíz de `src/`, las migraciones en
  `src/cms/migraciones/`, el route group en `src/app/(payload)/`. Todo eso
  **entra en la medición y pasa**. Si algún día la baja, se discute con el
  owner y queda escrito acá — nunca se apaga en silencio (§5.8).
- **No se toca `typescript.outputFile` ni `db.migrationDir`.** Moverlos es
  config extra para nada: el defecto de Payload ya funciona y es lo que
  cualquiera que llegue de su documentación espera encontrar.
- La regla de **200 líneas** de AGENTS.md §6 se lee sobre código nuestro; lo
  generado no cuenta, y así quedó escrito en §6.

## 5. Archivos que se tocan

| Archivo                            | Qué pasa                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `package.json` (raíz)              | Queda como raíz del workspace: `packageManager`, `engines`, `prepare`, el gate, y scripts que delegan (`--filter sitio`, `-r`) |
| `apps/sitio/package.json`          | Nuevo. `name: "sitio"`, las dependencias de hoy, y `dev` / `build` / `start` / `lint` / `typecheck`                        |
| `pnpm-workspace.yaml`              | `packages: ["apps/*"]`. `allowBuilds` (sharp, unrs-resolver) queda igual                                                   |
| `tsconfig.json`                    | Se muda a la app. `@/*` → `./src/*` sin cambios. Un `tsconfig.base.json` en la raíz recién cuando haya dos apps            |
| `next.config.ts`                   | Se muda. `turbopack.root` se revisa en el PR (§9)                                                                          |
| `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts` | Se mudan a la app                                                                                         |
| `public/`, `.env.example`          | Se mudan a la app                                                                                                         |
| `.gitignore`                       | Los patrones anclados a la raíz (`/node_modules`, `/.next/`, `/out/`, `/build`) pasan a no anclados                        |
| `.githooks/pre-push`               | **Sin cambios**: sigue corriendo `pnpm typecheck`, el verificador y `pnpm lint` desde la raíz, que ahora delegan           |
| `scripts/verificar-react-doctor.mjs` | §4.3                                                                                                                    |
| `scripts/instalar-hooks.mjs`       | Sin cambios: busca `../.git` desde `scripts/`, y `scripts/` sigue en la raíz                                              |
| `.claude/`, `skills/`, `docs/`, los `.md` de la raíz | Sin cambios                                                                                             |

Los scripts de la raíz quedan así, y crecen solos con cada app:

```json
"dev": "pnpm --filter sitio dev",
"build": "pnpm --filter sitio build",
"start": "pnpm --filter sitio start",
"lint": "pnpm -r lint",
"typecheck": "pnpm -r typecheck"
```

## 6. Orden

**PR 1 — la mudanza, sin Payload.** Es mecánico y se verifica entero:

1. `git mv` de `src/`, `public/` y las configs a `apps/sitio/`.
2. `package.json` partido en dos, `pnpm-workspace.yaml` con `apps/*`,
   lockfile regenerado.
3. Verificador multi-proyecto (§4.3).
4. **Verificación**: `pnpm typecheck`, `pnpm lint`, el gate en 100/100 **con
   el mismo `analyzedFileCount` que da hoy** (la prueba de que no se perdió
   ningún archivo de la medición: el número va anotado en el PR), `pnpm
   build` y `pnpm dev` con todas las rutas respondiendo 200.
5. Meta-docs (§10) y el ADR.

**PR 2 en adelante:** las cinco fases del panel, tal cual las define el spec
del 2026-09-15. Lo único que cambia es que todas sus rutas se leen bajo
`apps/sitio/`.

## 7. Vercel y entornos

- Un proyecto Vercel con **Root Directory = `apps/sitio`**. La instalación
  corre desde la raíz del workspace; Vercel detecta workspaces de pnpm.
- El **Ignored Build Step** (que una app no buildee por cambios de otra)
  entra recién cuando haya dos apps. Con una, no hace nada.
- Neon, Blob, Resend y las migraciones en el build no cambian respecto del
  spec del panel. Las variables son del proyecto de Vercel, no del repo.

## 8. Señales y reacción

Las puertas que este diseño deja abiertas, y cuándo se ejercen:

| Señal                                                                         | Qué se hace                                                                       |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Aparece una segunda app que consume el mismo contenido                        | `src/cms` → `packages/cms`. Sigue habiendo un solo Payload, con dos consumidores.  |
| El build del sitio se hace lento por el admin, o un upgrade de Payload frena un deploy urgente | `(payload)` → `apps/panel`, y `src/contenido/` cambia de local API a fetch. Un PR, sin tocar componentes. |
| Cuatro o más paquetes y el CI empieza a molestar                              | Entra Turborepo. Es aditivo: un `turbo.json`, nada se rediseña.                     |
| Entra gente externa que solo debe ver una app                                 | Esa app se saca a su repo. Es un caso puntual, no una arquitectura.                |

Ninguna se cierra con la decisión de hoy. La de «dos apps ya» sí cerraba
una: obligaba a construir el webhook de revalidación, el secreto y la vista
previa cross-origin antes de saber si iban a hacer falta.

## 9. Riesgos

| Riesgo                                                          | Qué se hace                                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `turbopack.root` mal resuelto en el workspace                   | Se verifica en el PR 1 con el dev server. El síntoma conocido está documentado en `next.config.ts`: 404 en todo.      |
| El verificador multi-proyecto se vuelve el punto ciego nuevo    | La lista de proyectos esperados se declara en el script: si falta uno, frena (§4.3).                                  |
| Lockfile y hoisting al partir el `package.json`                 | Lockfile regenerado y `pnpm build` verde antes de mergear.                                                            |
| Root Directory mal puesto en Vercel                             | Se prueba en un preview antes de mergear.                                                                             |
| Lo generado por Payload baja el score                           | Se mide en la fase 0; si baja, se discute con el owner y queda escrito acá (§4.4).                                    |
| La mudanza choca con trabajo en vuelo                           | Entra antes de la fase 0 del panel, en un PR solo y sin cambios de código (§2.3).                                     |

## 10. Qué cambia en la documentación

- **`AGENTS.md`** §3 (project structure) y el Quickstart; §5.8 gana la frase
  del alcance por proyecto. **Requiere confirmación humana explícita
  (§5.6).**
- **`README.md`**: instalación y scripts.
- **`docs/README.md`**: índice, con este spec.
- **`docs/AI_GUIDELINES.md`**: las rutas de ejemplo.
- **El spec del panel** no se reescribe: su §3 queda corregido por este
  documento, que lo referencia.
- **ADR**: la estructura del repo es una decisión arquitectónica y va en un
  ADR corto. El `0003` queda **reservado para Payload + Neon** (ya anunciado
  en el spec del panel y en su commit), así que la mudanza toma el `0004`
  aunque entre primero.

## 11. Fuera de alcance

Turborepo y la caché de tareas, los `packages/` compartidos, dividir el
panel en su propia app, y el CI (sigue pendiente en AGENTS.md §13). La
mudanza tampoco toca una línea de componente, de copy, de tokens ni de
coreografía: si un archivo cambia de contenido, es porque se equivocó el
PR.

## 12. Decisiones abiertas

- **Que Facundo confirme la corrección del §3 de su spec:** el árbol que ahí
  se describe cuelga ahora de `apps/sitio/`. Lo generado **se queda donde
  Payload lo pone**, como decía su spec — la corrección del §4.4 de este
  documento le dio la razón.
- **Cuándo entra el PR de la mudanza** — resuelto: entró después de la fase 0
  del panel, no antes, porque la fase 0 llegó primero a `main`.
