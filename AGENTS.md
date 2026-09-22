# AGENTS.md — Orchestrator Contract

> Contrato AI-neutral para trabajar dentro de este repositorio. Cualquier
> agente de IA (Claude, Codex, Gemini, Cursor, otros) lee este archivo para
> entender cómo opera el sistema: es la fuente de verdad, y lo que dice acá
> vale igual sin importar con qué herramienta se trabaje.
>
> Lo específico de una herramienta vive en su adapter. Hoy hay uno solo,
> `CLAUDE.md`, y es un puntero: mapea este contrato a Claude Code y no
> agrega reglas propias. Si una regla importa, va acá.

---

## Quickstart (30 segundos)

- **Qué es:** sitio web institucional de **Empoderamiento Docente (ED)**.
- **Forma del repo:** **monorepo** (workspace pnpm). El sitio y su admin viven
  en `apps/sitio/`, y lo reutilizable en `packages/`; la raíz es del repo, no
  de una app. Ver [ADR-0004](docs/architecture/adrs/0004-monorepo-apps.md) y
  [ADR-0006](docs/architecture/adrs/0006-packages-reutilizables.md).
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript strict +
  Tailwind CSS v4 (theming en CSS) + GSAP + Lenis + Zod.
- **Backend/persistencia:** **Neon** (Postgres) con **Prisma**, y un **admin a
  medida** en `/admin` con **better-auth**; fotos en Vercel Blob, correos por
  Resend. Ver [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md) y
  [ADR-0007](docs/architecture/adrs/0007-prisma-como-orm.md).
- **Onboarding humano:** [`README.md`](README.md) (instalación, scripts, estructura).
- **Lanzamiento:** **junio 2026** (estimado).
- **Reglas duras** (no negociables):
  1. **Lenguaje inclusivo siempre** (`las y los`), nunca "alumnos" → siempre "estudiantes".
  2. **Tokens, no hardcodes.** Colores y tipos viven en `DESIGN.md`.
  3. **Naranja solo CTAs.** Verde para conceptos. Azul base.
  4. **Commits atómicos** Conventional, español, imperativo.
  5. **Confirmación humana** antes de commits, push, dependencias o tocar
     meta-docs.
  6. **El gate no se negocia:** `react-doctor` 100/100 sin diagnósticos, más
     typecheck y lint en verde. El `pre-push` lo verifica y frena (§5.8).
- **Empezá leyendo:** este archivo + [`docs/README.md`](docs/README.md).

---

## Read Order by Task

### Siempre primero

1. Este archivo (`AGENTS.md`).
2. [`docs/README.md`](docs/README.md) — índice de documentación auxiliar.

### Después, según la tarea

| Tarea                                       | Leer en este orden                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Crear o modificar **componente UI**         | `DESIGN.md` → `docs/AI_GUIDELINES.md`                                                       |
| Implementar una **página nueva**            | `DESIGN.md` → `docs/AI_GUIDELINES.md` → `docs/GLOSSARY.md`                                  |
| **Animar** algo (GSAP / Lenis)              | §7 global rules → §8 anti-patterns GSAP → `docs/AI_GUIDELINES.md` §11                       |
| Escribir o revisar **copy**                 | `docs/GLOSSARY.md` → `docs/MESSAGING.md` → §5.1 lenguaje inclusivo → §5.5 mensajes pilares  |
| Configurar **metadata / SEO**               | `docs/AI_GUIDELINES.md` (SEO) → §6 quality standards (contenido)                            |
| **Refactorizar**                            | `docs/AI_GUIDELINES.md` (todo) → §8 anti-patterns → §9 commit protocol                      |
| Hacer **commits**                           | `docs/COMMITS.md` → §9 commit protocol                                                      |
| Hacer **review** antes de PR                | §6 quality standards → §10 pre-PR checklist                                                 |
| Entender la **arquitectura del repo**       | §1 purpose → §3 project structure → `docs/architecture/adrs/0001-stack-base.md`             |
| **Backend / datos / admin** (Neon + Prisma) | §2 stack → §12 backend/datos → `docs/architecture/adrs/0005-admin-a-medida.md` → `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` → `docs/AI_GUIDELINES.md` §12 |
| **Instalar y correr local**                 | `README.md` (getting started) → `package.json` scripts (`pnpm dev` / `build` / `start` / `lint` / `typecheck`) |

> Si tu tarea no entra en la tabla, pedile al usuario que la describa y
> elegí el enfoque que consideres apropiado (trabajo directo o delegación
> a un sub-agente, según las herramientas de la IA que estés usando).

---

## 1. System Purpose

Construir el sitio web institucional de **Empoderamiento Docente (ED)**,
organización dirigida por **Daniela Reyes-Gasperini** que trabaja desarrollo
profesional docente en Chile, México y Argentina. El sitio también destaca
el trabajo y la trayectoria de **Raquel Ayala** (rol exacto y vínculo con
ED a definir con el cliente).

**Lanzamiento:** junio 2026 (estimado).
**Metas medibles:**
1. Posicionamiento institucional en buscadores y redes.
2. Captación de docentes vía CTA de envío de CV.
3. Comunicación clara de la oferta formativa (talleres, cursos, diplomaturas).

---

## 2. Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5** (strict, sin `any` salvo justificación)
- **Tailwind CSS v4** (vía `@tailwindcss/postcss`; el tema vive en CSS,
  en `apps/sitio/src/app/globals.css`, no en un `tailwind.config.js`)
- **GSAP 3** + **Lenis** (animaciones, smooth scroll)
- **Zod 4** (validación de datos en bordes; se usará cuando se sumen formularios)
- **Prisma 7** sobre **Neon** (Postgres) + **better-auth**: admin a medida en
  `/admin`, fotos en Vercel Blob, correos por Resend (ver ADR-0005 y ADR-0007)
- **pnpm 11** (pinned vía `packageManager`), **Node ≥ 22**

**Backend/persistencia: Neon con Prisma, y un admin propio.** La base es
Postgres en Neon (Docker en local); el admin se construye a medida y vive en
`/admin` dentro de esta app. El esquema está en `apps/sitio/prisma/schema/` y
sus migraciones se commitean; la única puerta a la base es
`apps/sitio/src/datos/`. Lo reutilizable vive en `packages/` y no sabe nada de
ED. Detalle y alternativas en
[ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md) y
[ADR-0007](docs/architecture/adrs/0007-prisma-como-orm.md); guías en §12 y en
`docs/AI_GUIDELINES.md` §12.

Versiones exactas → `apps/sitio/package.json`: las dependencias viven en la
app, no en la raíz del workspace. Fijar majors, minors flotando (`^`). **Prisma
es la excepción y va exacta, sin `^`**: el tag `latest` de npm resuelve hoy a
un release candidate de la 8 (ADR-0007).

---

## 3. Project Structure

```
/
├── README.md             ← onboarding humano (instalación, scripts, estructura)
├── AGENTS.md              ← este archivo (contrato AI-neutral)
├── CLAUDE.md              ← adapter para Claude Code: importa este archivo con
│                            `@AGENTS.md` y solo agrega el mapeo de herramientas
├── DESIGN.md              ← sistema de diseño (tokens, tipos, reglas)
├── docs/
│   ├── README.md          ← índice de documentación
│   ├── COMMITS.md         ← convenciones de commit
│   ├── GLOSSARY.md        ← jerga del dominio ED
│   ├── MESSAGING.md       ← copy canónico de marca
│   ├── AI_GUIDELINES.md   ← reglas detalladas de código IA-friendly
│   ├── conventions/       ← CODE-STYLE.md
│   └── architecture/
│       ├── adrs/          ← decisiones arquitectónicas (ADRs)
│       └── specs/         ← diseños largos (el admin, el monorepo)
├── skills/                ← workflows estables (adr-create, pr-review)
├── work/                  ← lanes de trabajo: SPEC, PLAN, PROGRESS y
│                            DECISIONS de cada cambio grande en curso
├── .githooks/             ← pre-push: el gate de §5.8 (se instala solo)
├── scripts/               ← instalar-hooks.mjs, verificar-react-doctor.mjs,
│                            guarda-prisma.mjs, comparar-render.mjs
├── package.json           ← raíz del workspace: delega en las apps + el gate
├── pnpm-workspace.yaml    ← packages: ["apps/*", "packages/*"] + publicHoistPattern
├── pnpm-lock.yaml         ← uno solo, de todo el workspace
├── packages/              ← LO REUSABLE, cero dominio de ED adentro
│   ├── db/                ← cliente Prisma, slugs, redirecciones
│   ├── auth/              ← better-auth configurado, permisos, guarda
│   └── kit-admin/         ← tabla, formulario, controles, uploader (fase 2)
└── apps/
    └── sitio/             ← el sitio y su admin (por ahora, la única app)
        ├── package.json   ← las dependencias viven acá, no en la raíz
        ├── .env.example   ← las variables son de la app
        ├── public/        ← assets estáticos (brand/, imágenes)
        ├── prisma/        ← el modelo de datos
        │   ├── schema/      ← base · auth · sitio (contenido: fase 2)
        │   └── migrations/  ← generadas, se commitean, nunca a mano
        ├── (config)       ← tsconfig.json, eslint.config.mjs,
        │                     next.config.ts, postcss.config.mjs
        └── src/
            ├── app/
            │   ├── (sitio)/   ← el sitio: sus páginas y su layout
            │   ├── (admin)/   ← SOLO rutas del admin
            │   ├── api/       ← auth/ · contacto y cv llegan en la fase 4
            │   └── globals.css
            ├── datos/         ← la ÚNICA puerta a la base
            │   ├── cliente.ts   ← el PrismaClient de la app
            │   ├── auth.ts      ← la sesión, armada con esa base
            │   ├── consultas/   ← lo que lee el sitio y el admin (paginas, editor-de-paginas, metricas)
            │   └── acciones/    ← Server Actions del admin (paginas, vista-previa, fotos, metricas)
            ├── admin/         ← las pantallas del admin
            │   ├── armazon/     ← la caja, los campos, salir
            │   ├── paginas/     ← «Páginas» y el editor (lista, barra, secciones)
            │   ├── campos/      ← los controles del formulario; se mudan a kit-admin en la fase 2
            │   └── <entidad>/   ← Lista, Formulario y sus límites (fase 2)
            ├── contenido/     ← el registro: páginas → secciones → esquemas (paginas.ts)
            ├── middleware.ts  ← sesión · cabeceras · rate limit
            ├── components/    ← UI reutilizable
            │   ├── brand/       ← logotipo / marca
            │   ├── layout/      ← Header, Footer, MobileNav, etc.
            │   ├── providers/   ← LenisProvider (smooth scroll)
            │   └── ui/          ← botones, reveals, íconos (ui/icons/)
            ├── features/      ← módulos por dominio
            │   ├── home/components/ ← secciones del home (Hero, …)
            │   │   └── hero/    ← al partir un componente, sus piezas van a
            │   │                   una subcarpeta con su nombre y el
            │   │                   compositor se queda en su ruta
            │   │                   (AI_GUIDELINES §2)
            │   └── <pagina>/contenido/ ← esquema Zod + contenido inicial de cada sección (hero.ts)
            ├── config/        ← site.ts (datos institucionales) + nav.ts
            └── lib/           ← hooks/, metricas/, contenido/ (tipos de campo, fotos, almacén: sin dominio de ED)
```

> **Nota:** el theming de Tailwind v4 vive en
> `apps/sitio/src/app/globals.css` (bloque `@theme`), no en `src/styles/` ni
> en un `tailwind.config.js`. Las marcas «fase N» del árbol son del plan del
> [ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md): hoy existe lo que
> no las lleva, y el calendario está en §13 y en
> `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` §9.
>
> **Las cuatro fronteras** que sostienen ese layout, y que se revisan a ojo
> porque ningún gate las mide: `packages/` no sabe nada de ED; `datos/` es la
> única puerta a la base y ningún componente importa Prisma; `app/` son rutas
> y nada más; `features/` recibe props y nunca cambia de contrato.

> **Por qué `apps/` y `packages/`:** el layout es lo que hace barato crecer;
> partir el deployable es lo que hace caro operar. El sitio y su admin son **un
> solo deployable** y viven juntos en `apps/sitio`; una segunda app se agrega al
> lado, sin rediseñar nada. `packages/` existe desde ahora porque la
> reutilización entre proyectos es un **requisito**, no un descubrimiento: eso
> enmienda la regla original del ADR-0004 y queda registrado en el
> [ADR-0006](docs/architecture/adrs/0006-packages-reutilizables.md). Lo que
> viaja a otro proyecto son los packages, nunca las apps. El razonamiento
> completo, con las señales que dispararían cada cambio, en el
> [ADR-0004](docs/architecture/adrs/0004-monorepo-apps.md) y en su
> [diseño](docs/architecture/specs/2026-09-17-monorepo-apps-diseno.md).

**Golden rule:** los `.md` raíz y `docs/` son la fuente de verdad. El
adapter (`CLAUDE.md`, y un futuro folder `.claude/`) solo mapea ese contrato
a su herramienta — nunca contenido propio. Una regla que solo existe en un
adapter es una regla que el resto no cumple.

Por eso `CLAUDE.md` **importa** este archivo (`@AGENTS.md` en su primera
línea, que Claude Code resuelve al abrir la sesión) en vez de resumirlo: un
resumen se desfasa, un import no. Cualquier adapter futuro hace lo mismo con
el mecanismo que ofrezca su herramienta.

---

## 4. Cuándo delegar (vs. trabajar directo)

Cada IA decide **cómo y a quién delegar** según las herramientas que
tiene disponibles. Este repo no prescribe un roster fijo de sub-agentes —
es decisión de la IA (o del operador humano) elegir el enfoque correcto.

**Delegar a un sub-agente / contexto separado** cuando:
- La tarea requiere búsqueda extensa (>3 lecturas de archivos).
- Hay un dominio claramente especializado (animación GSAP, diseño, copy).
- Conviene proteger el contexto del hilo principal.
- La tarea es paralelizable (varias búsquedas o validaciones independientes).

**Trabajar directo** cuando:
- Es 1-2 archivos conocidos.
- Es decisión que requiere conversación con el usuario.
- Es escribir documentación o discutir arquitectura.

**Reglas comunes a cualquier delegación:**
- **Briefing auto-contenido:** un sub-agente no asume que leyó la
  conversación. Pasale todo el contexto necesario.
- **Verificación obligatoria:** quien delega revisa el resultado leyendo
  los archivos, no se confía del resumen.
- **Output formateado:** pedile el formato que necesitás (archivos
  modificados, reporte breve, lista de hallazgos…).

---

## 5. Hard Rules (no negociables)

Toda IA y todo humano que toque este repo respeta estas reglas. Sin
excepción.

### 5.1. Lenguaje inclusivo

Toda copy del sitio (UI, contenido, alt-text, errores, metadatos, emails)
usa lenguaje inclusivo:

- Desdoblamiento: `las y los profesores`, `las y los estudiantes`.
- **Nunca "alumnos"** → siempre `estudiantes` (ED evita "alumno"
  explícitamente: significa "sin luz").
- Cuidar inclusión de género en cargos, profesiones y roles.

### 5.2. Tokens, no hardcodes

- Colores, tipografías, espaciado, radius → tokens definidos en `DESIGN.md`,
  mapeados al config de Tailwind.
- **Sin valores arbitrarios** (`bg-[#1F2A44]`) salvo prototipo.
- Si hace falta un token nuevo, **se edita `DESIGN.md` primero**, después
  el código.
- Reglas claves: azul base, **naranja solo CTAs**, verde para conceptos,
  verde y naranja no compiten en el mismo bloque.

### 5.3. Datos institucionales centralizados

- Email, dirección, teléfono, URLs de redes → `apps/sitio/src/config/site.ts`.
- Nunca hardcodear datos institucionales en JSX.

### 5.4. Logos de aliados

Solo publicar con autorización confirmada por el usuario. Por defecto, NO
publicar. Los autorizados son exactamente los de la carpeta «LOGOS ALIANZAS»
de ED (hoy: Techint, UNESCO, Bloom/ser+, UCSH, Science Up); la lista única
vive en `apps/sitio/src/config/aliados.ts` y el detalle en
`docs/content/aliados-fuentes-drive.md`. Ministerio de Educación: no se
puede por contrato. OEI, SEMS-SEP, CENEVAL: sin autorización, no van.

### 5.5. Mensajes pilares

Reusar (no parafrasear sin chequear) las frases pilares de ED:

- "Generar escenarios de aprendizaje"
- "Potenciamos fortalezas, fortalecemos potencialidades"
- ED se centra en **aprender** más que en **enseñar**
- Las y los docentes son **profesionales de la educación**
- "Comunidad docente en torno a la Matemática Educativa"

### 5.6. Acciones que requieren confirmación humana

Ninguna IA ejecuta sin confirmación explícita del usuario:

- `git commit`, `git push`, `git reset --hard`, force-push.
- Crear/cerrar PRs o issues.
- Agregar dependencias (`npm install`, `pnpm add`).
- Modificar `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`.
- Cualquier acción visible fuera del repo local.

### 5.7. Estrategia de merge a `main`

- **`main` solo se actualiza vía PR mergeado en GitHub.** Push directo
  a `main` está prohibido salvo emergencia documentada por escrito
  (incident, prod caída). Aún en ese caso, abrir el PR del fix después
  de estabilizar para que el cambio quede revisado.
- **Estrategia:** *Rebase and merge*. Mantiene el grafo lineal y
  preserva los commits atómicos que pide §9. Merge commit y squash
  están deshabilitados a nivel repo.
- **Branch protection** (configurada en GitHub):
  - `required_linear_history: true`.
  - `allow_force_pushes: false`.
  - `allow_deletions: false`.
  - `required_conversation_resolution: true` (resolver review comments
    antes de mergear).
  - `required_approving_review_count: 0` — el gate de review es
    *cultural* (CODEOWNERS + convención), no técnico. Subir a 1+
    cuando el equipo crezca.
- **CI debe estar verde** antes de pedir review (`pnpm lint`,
  `pnpm typecheck`, `pnpm build`).

---

### 5.8. El gate: react-doctor en 100, y se arregla por código

El repo llegó a `react-doctor` **100/100 sin diagnósticos** el 2026-09-08,
partiendo de 57/100 con 126 hallazgos. La regla es no volver atrás.
`.githooks/pre-push` corre typecheck, react-doctor y lint —unos 10 segundos—
y **frena el push** si alguno falla. Se instala solo con `pnpm install`.

- **Se arregla por código, siempre.** Prohibidos `react-doctor-disable`,
  `doctor.config.*`, la clave `reactDoctor` en `package.json` y los
  `eslint-disable` de reglas del gate. Si una regla parece un falso positivo,
  se arregla igual con un cambio que preserve el comportamiento, o se discute
  con el owner y queda escrito — nunca se apaga en silencio.
- **El gate mide por proyecto, y los proyectos están declarados.** Desde el
  monorepo, el alcance vive en dos lugares a la vista: el script
  `react-doctor` del `package.json` de la raíz y la lista `PROYECTOS` de
  `scripts/verificar-react-doctor.mjs`. El verificador recorre todos y exige
  100 en cada uno — y **frena si alguno no aparece en el informe**, porque un
  proyecto ausente se lee igual que «cero hallazgos». Cuando se sume una app o
  un package con React, se suma a las dos listas.
- **No hay código generado adentro de `src/`, y se hizo a propósito.** La
  escisión de Payload se llevó las 702 líneas que generaba dentro del proyecto
  (`payload-types.ts`, el route group `(payload)`, su migración) y con ellas los
  `globalIgnores` de ESLint que existían para esconderlas. Lo que Prisma genera
  vive en `node_modules`, así que el gate no lo ve. Si alguna vez algo generado
  vuelve a caer en `src/`, se discute con el owner y queda escrito acá antes de
  esconderlo.
- **Una medición incompleta no es un aprobado.** react-doctor arma su lista de
  archivos con el índice de git: un borrado sin commitear le hace fallar el
  análisis de mantenibilidad y **esconder el score**, con una salida que se
  parece mucho a "todo bien". El verificador detecta ese caso y frena.
- **La única puerta de salida es `git push --no-verify`**, que queda en el
  reflog y se ve. A propósito no hay variable de entorno para saltear el gate:
  eso es lo que convierte un gate en decoración.
- **El build no está en el hook** porque tarda demasiado para un push; va en
  CI y en el checklist de §10.

Lo que el gate no puede medir, y por eso se pide igual: que el cambio sea el
más simple que resuelve el problema, que no duplique lo que ya existe, y que
la próxima persona pueda leerlo sin arqueología. Dos convenciones concretas
que salieron de la migración y que sí se revisan a ojo: cuando un componente
se parte, la receta y la subcarpeta están en `docs/AI_GUIDELINES.md` §2; y el
`will-change` lo pone y lo saca la coreografía, nunca un `className` (§11 de
esa misma guía).

---

## 6. Quality Standards (medibles)

### Contenido

- [ ] 0 ocurrencias de "alumno/alumnos/alumna/alumnas" en copy público.
- [ ] 0 masculinos genéricos detectables ("los profesores" sin desdoblar).
- [ ] Todo CTA usa verbo en imperativo ("Inscribite", "Descargá", "Sumate").
- [ ] Toda página tiene `<title>` y `<meta description>` únicos.
- [ ] Imágenes con `alt` descriptivo (no decorativo) cuando aportan info.

### Diseño / UI

- [ ] Contraste WCAG AA (4.5:1 cuerpo, 3:1 títulos grandes).
- [ ] Solo un CTA primario (naranja) visible por viewport.
- [ ] Verde y naranja nunca conviven en primer plano.
- [ ] Tipografía: Manrope para títulos/subtítulos, Inter para cuerpo.
- [ ] `prefers-reduced-motion` respetado en toda animación.

### Código

- [ ] TypeScript strict pasa sin warnings.
- [ ] Lint pasa.
- [ ] `react-doctor` da **100/100 sin diagnósticos** (§5.8). El `pre-push` lo
      verifica; no hay forma de "casi".
- [ ] Componentes **≤ 200 líneas**, y cuando se parten, sus piezas van a una
      subcarpeta (`docs/AI_GUIDELINES.md` §2). react-doctor recién frena a las
      300; el tope del proyecto es 200, y **hoy lo pasan 17 de 210** —contando
      código, sin comentarios—: `profileParts.tsx` (428), `FaroEscena.tsx`
      (377), `MaterialesListado.tsx` (348) y catorce más, casi todos de las
      páginas que crecieron después de la migración. Medido el 2026-09-18; este
      apartado decía que el tope «se cumple» y hacía rato que no. La dirección
      es que no se sumen: un componente nuevo por encima de 200 se parte antes
      del PR, y los 17 bajan cuando se toque la página que los usa.
- [ ] Utilidades ≤ 100 líneas. Los hooks también, salvo los de coreografía:
      partir un hook por debajo de 80 suele separar el efecto de su limpieza,
      que es justo lo que hay que evitar. Ahí manda el tope de 200. La otra
      excepción es `scripts/verificar-react-doctor.mjs` (**170 líneas, 103 sin
      comentarios**, medido el 2026-09-18 después de sumarle los packages al gate): partir el script del gate en dos
      archivos lo vuelve más difícil de auditar de una lectura, que es
      exactamente para lo que existe, y sus comentarios son el «nunca se apaga
      en silencio» de §5.8 escrito donde se lee.
      **El tope se mide en líneas totales**, que es el número con el que se
      concedió esta excepción. Antes acá decía «160 líneas, 89 sin
      comentarios»: el 160 era cierto al escribirlo y quedó viejo por 5, pero
      el 89 nunca lo fue — en ese mismo commit eran 127. La excepción era 38
      líneas más grande de lo que este párrafo declaraba, y una excepción a una
      regla dura no se sostiene con un número que nadie volvió a medir.
- [ ] Lo **generado** no cuenta para estos topes: las migraciones de
      `apps/sitio/prisma/migrations/` las escribe Prisma, no se editan a mano y
      no se miden con la vara del código nuestro.
- [ ] Cero `any` sin comentario justificando.
- [ ] Cero rutas relativas largas (`../../..`) — usar `@/` alias.

### Performance (target en producción)

- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms

---

## 7. Global Rules (técnicas)

- **Server Components por defecto.** `"use client"` solo cuando hace falta.
- **Animaciones:** solo `transform` y `opacity`, nunca `width`/`height`/
  `top`/`left`.
- **GSAP:** registrar plugins una vez, usar `gsap.context()` para cleanup,
  `gsap.matchMedia()` para responsive + reduced-motion.
- **Lenis:** una sola instancia global, integrada con ScrollTrigger.
- **Imágenes:** `next/image` con `alt`, `width`, `height`, `loading="lazy"`
  excepto LCP.
- **Fonts:** `next/font/google` con `display: 'swap'` y subset `latin`.
- **Validación:** todo dato de entrada se valida en el borde con **Zod** antes
  de tocar la base — sin excepción, y eso incluye lo que escribe el admin por
  sus Server Actions (ver §12). No hay una capa que valide sola por nosotros.
- **Imports:** orden framework → externos → internos (`@/...`).
- **Naming:** PascalCase componentes/tipos, camelCase utils/hooks
  (con prefijo `use`), SCREAMING_SNAKE_CASE constantes, kebab-case carpetas.

---

## 8. Anti-Patterns

Detectables en code review automático. No deben llegar a `main`.

### Código
- `any` sin justificación.
- Rutas relativas largas (`../../../`).
- Hardcodes de color/typo/spacing.
- Comentarios que describen el "qué" en vez del "por qué".
- Componentes monstruo (>200 líneas).
- Estado en componentes server (no se puede; debe ser señal de mala separación).

### GSAP
- `scrub: true` (usar `scrub: 0.5` mínimo).
- ScrollTrigger sobre tweens hijos de timeline (poner en el timeline).
- `scrub` + `toggleActions` juntos.
- `markers: true` en producción.
- Animar propiedades caras (layout-affecting).
- Olvidar cleanup de `gsap.context()`.

### Contenido
- Masculino genérico ("los profesores").
- "Alumnos" en cualquier lugar.
- Siglas sin glosa en primera mención (ED, OEI, SEMS-SEP).
- Marketing barato ("revolucioná tu aula", "transformá tu vida").

### Commits
- Mensajes vagos ("cambios", "wip", "asdf").
- Mezclar varios scopes en un commit.
- `git add -A` o `git add .` sin verificar staging.
- Commitear sin lint/typecheck pasando.

---

## 9. Commit Protocol

**Conventional Commits + atómicos + alta granularidad.** Detalle completo
en `docs/COMMITS.md`.

Resumen para agentes:

```
<tipo>(<scope>): <descripción imperativa minúsculas>

[cuerpo opcional con el porqué]
```

- Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `chore`, `build`, `ci`, `content`, `design`.
- Idioma: español, imperativo.
- Header ≤ 72 chars, sin punto final.
- Un commit = un cambio lógico. **Muchos commits chicos > pocos gigantes.**
- Si el cambio toca varios scopes, partirlo en commits separados.

**Ninguna IA commitea sin que el usuario lo confirme explícitamente.**
Para cualquier cambio listo para versionar:

1. Listar los commits planeados (en seco).
2. Esperar OK del usuario.
3. Ejecutar.

---

## 10. Pre-PR Checklist (mandatorio)

Antes de pedir merge a `main`:

- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm react-doctor` da 100/100 sin diagnósticos (§5.8).
- [ ] `pnpm build` pasa.
- [ ] Tests pasan (si existen).
- [ ] Quality Standards (§6) cumplidos en lo modificado.
- [ ] No hay copy con masculino genérico ni "alumnos".
- [ ] No hay logos de aliados sin autorización confirmada.
- [ ] Commits atómicos siguiendo `docs/COMMITS.md`.
- [ ] PR description en español, link a la sección/feature, screenshots
  cuando sea visual.

---

## 11. References

- **Mensajes pilares de marca:** §5.5 de este archivo + `docs/GLOSSARY.md`.
- **Sistema de diseño:** `DESIGN.md`.
- **Convenciones de commit:** `docs/COMMITS.md`.
- **Guía de código IA-friendly:** `docs/AI_GUIDELINES.md`.
- **Glosario del dominio:** `docs/GLOSSARY.md`.
- **Adapter Claude:** `CLAUDE.md`.
- **Otras herramientas:** leen `AGENTS.md` directo (Codex lo hace de forma
  nativa). Se suma un adapter solo si la herramienta necesita un mapeo que
  este contrato no puede expresar.

---

## 12. Backend y datos (Neon + Prisma, admin propio)

**El backend es Neon (Postgres) con Prisma, y el admin se construye a medida**,
adentro de esta app en `/admin`. Decisión y alternativas en
[ADR-0005](docs/architecture/adrs/0005-admin-a-medida.md) y
[ADR-0007](docs/architecture/adrs/0007-prisma-como-orm.md); diseño en
`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`.

> **Qué de esto ya existe.** Las fases 0 y 1 están hechas (§13): `packages/db`,
> `packages/auth`, `apps/sitio/prisma/` con sus migraciones,
> `apps/sitio/src/datos/`, `apps/sitio/src/admin/`, `middleware.ts` y
> `scripts/guarda-prisma.mjs` están en el árbol y las reglas de abajo describen
> lo que hay. Lo único que todavía no existe es `packages/kit-admin`, que nace
> en la fase 2 contra una entidad de verdad. De las tablas de contenido existen
> `paginas` y `fotos` (`work/edicion-de-paginas/`); las de las entidades llegan
> con ellas.

Reglas para el admin y sus datos:

- **`datos/` es la única puerta a la base.** `apps/sitio/src/datos/consultas/`
  lee y `apps/sitio/src/datos/acciones/` escribe. **Ningún componente importa
  Prisma.** Lo reutilizable vive en `packages/` y no sabe nada de ED.
- **Lo que no sabe de ED pero todavía no tiene un segundo proyecto que lo use
  incuba en `apps/sitio/src/lib/`** (`lib/contenido/`, `lib/metricas/`). No
  importa nada de la app, ni un `@/`, así que pasa a `packages/` sin cambios el
  día que lo use un segundo proyecto. Es el criterio del ADR-0009 para las
  métricas, extendido a contenido: mudarlo antes sería un package sin
  consumidor, el riesgo que anota el ADR-0006.
- **El esquema está en `apps/sitio/prisma/schema/`** y sus migraciones se
  generan con Prisma y **se commitean**. Nunca se editan a mano ni se aplican a
  mano contra la base: `scripts/guarda-prisma.mjs` bloquea `prisma db push`
  con exit 1, porque `push` crea tablas sin archivo de migración y el síntoma
  aparece recién en producción.
- **Nada de meta-capa de configuración para los formularios.** Cada entidad
  escribe el suyo con los primitivos de `packages/kit-admin`. Un objeto que un
  renderizador genérico traduce a formulario es el modelo de Payload, y es cómo
  se termina reescribiendo Payload.

  **Una excepción, acotada:** las páginas —documentos validados por el esquema
  Zod de cada sección (`work/edicion-de-paginas/SPEC.md` §4.1)— generan su
  formulario desde ese esquema, con tipos de campo cerrados
  (`lib/contenido/campos.ts`) y un dibujante recursivo (`admin/campos/Campo.tsx`).
  Las entidades (novedades, materiales, casos, equipo, aliados) siguen
  escribiendo el suyo a mano con los primitivos del kit. La diferencia con
  Payload es el tamaño y el borde: seis tipos, una descripción serializable de
  una pantalla, y nada de colecciones ni de configuración abierta.

  Sus límites, para que no crezca hasta volverse Payload (revisión del
  2026-09-22, `work/condiciones-de-la-revision/`):
  - **Solo las páginas.** Ninguna entidad genera su formulario desde un
    esquema.
  - **Los seis tipos son cerrados.** Un séptimo se discute con el owner como
    una regla nueva y se escribe acá antes de sumarlo; no entra en un PR de
    contenido.
  - **La descripción de un campo dice qué control es y cómo se rotula**:
    etiqueta, ayuda, largo, opciones, cantidad. Nada de
    visibilidad condicional, componentes propios por campo ni hooks. Una
    sección que los necesite escribe su formulario a mano.
  - **Los controles no conocen el generador.** Los de `admin/campos/` reciben
    props planas y la subida de fotos por prop; solo `Campo.tsx` conoce
    `Descripcion` y la app. Así se mudan a `packages/kit-admin` en la fase 2
    sin llevárselo.
- **Se escribe en vocabulario relacional**: tablas, columnas y controles. No
  «colecciones», «globals» ni `CollectionConfig`.
- **Validar todos los bordes con Zod** antes de escribir o leer, incluidas las
  Server Actions del admin. Nunca confiar en input externo.
- **Secretos solo server-side:** `DATABASE_URL`, el secreto de better-auth,
  `BLOB_READ_WRITE_TOKEN` y `RESEND_API_KEY` nunca llevan `NEXT_PUBLIC_` ni
  llegan al browser. Placeholders en `apps/sitio/.env.example`.
- **La sesión se verifica antes de renderizar:** el middleware solo mira que la
  cookie exista, el layout protegido la comprueba de verdad para las páginas, y
  **toda Server Action del admin empieza por `auth.api.getSession`** y contesta
  en llano si no hay sesión, porque el layout no las cubre (el middleware las
  deja pasar: un redirect no es una respuesta válida para una acción). Dos
  roles, administra y edita; nada del admin es público.
- **Migraciones / schema:** confirmar el diseño con el humano antes de crear
  tablas. No inventar tablas ni columnas que no estén acordadas.

No describir aquí tablas concretas: el modelo de datos vive en la spec y se
define al implementar cada fase.

---

## 13. Estado del proyecto

- [x] Manual de marca procesado → `DESIGN.md`
- [x] Documentación AI-neutral (`AGENTS.md`, adapters, `docs/`)
- [x] Scaffold Next.js 16 (App Router) + React 19 + TS strict + Tailwind v4 + ESLint 9
- [x] Stack adicional instalado: GSAP, Lenis, Zod
- [x] `pnpm-workspace.yaml` con `allowBuilds` (sharp, unrs-resolver, esbuild)
- [x] Mapear tokens de `DESIGN.md` al Tailwind v4 (`globals.css` con `@theme`)
- [x] Cargar fuentes Manrope + Inter (+ JetBrains Mono) vía `next/font/google`
- [x] Configurar metadata base + `lang="es"` en root layout
- [x] `apps/sitio/src/config/site.ts` con datos institucionales + `nav.ts`
- [x] Home real (`apps/sitio/src/app/(sitio)/` + `apps/sitio/src/features/`)
- [x] Crear `README.md` de onboarding humano en la raíz
- [x] El repo pasa a monorepo: el sitio, en `apps/sitio/`
- [x] **Payload afuera** (fase 0 del ADR-0005): su código, sus 7 dependencias y
      su spec salieron del repo, y el sitio quedó idéntico — comprobado con el
      diff del HTML prerenderizado de las **11** páginas contra `d452e61`.
- [x] **Admin, fase 1 — cimientos:** `packages/db` y `packages/auth`, el esquema
      de Prisma con sus migraciones, `middleware.ts` con las cabeceras de
      seguridad y el rate limit por IP, y entrar / salir / elegir contraseña en
      `/admin`. Sin contenido: eso es la fase 2.
- [x] **Páginas, fase A — Inicio → Hero de punta a punta:** las tablas
      `paginas` y `fotos`, los tipos de campo, el registro, el editor con
      borrador, vista previa (Draft Mode) y publicar, y las fotos en Blob o en
      disco. El hero del sitio lee por props. Diseño en
      `work/edicion-de-paginas/`.
- [ ] **Admin, fase 2 — el kit y una entidad entera:** `packages/kit-admin` y
      novedades de punta a punta, con el sitio leyéndola por `datos/consultas/`.
- [ ] **Admin, fase 3 — el resto del contenido:** materiales, casos, equipo,
      aliados, páginas y ajustes.
- [ ] **Admin, fase 4 — URLs y SEO:** las 26 rutas nuevas (15 perfiles, 4 casos,
      7 landings de tipo), `sitemap.xml`, canonicals, redirecciones y JSON-LD.
      Reemplaza al «sitemap definitivo» que este §13 venía arrastrando.
- [ ] Vercel: Root Directory = `apps/sitio` cuando exista el proyecto
- [ ] CI/CD
