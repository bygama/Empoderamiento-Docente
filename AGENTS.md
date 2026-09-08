# AGENTS.md — Orchestrator Contract

> Contrato AI-neutral para trabajar dentro de este repositorio. Cualquier
> agente de IA (Claude, Codex, Gemini, Cursor, otros) lee este archivo para
> entender cómo opera el sistema. Mappings específicos de cada IA viven en
> archivos adaptadores (`CLAUDE.md`, `GEMINI.md`, `.codex/`).

---

## Quickstart (30 segundos)

- **Qué es:** sitio web institucional de **Empoderamiento Docente (ED)**.
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript strict +
  Tailwind CSS v4 (theming en CSS) + GSAP + Lenis + Zod.
- **Backend/persistencia:** **Supabase** (Postgres + Auth + Storage), a
  integrar cuando haya formularios (inscripción, CV); **hoy el sitio corre
  100% frontend** (Supabase todavía no está en el repo). Ver
  [ADR-0002](docs/architecture/adrs/0002-adoptar-supabase-persistencia.md).
- **Onboarding humano:** [`README.md`](README.md) (instalación, scripts, estructura).
- **Lanzamiento:** **junio 2026** (estimado).
- **Reglas duras** (no negociables):
  1. **Lenguaje inclusivo siempre** (`las y los`), nunca "alumnos" → siempre "estudiantes".
  2. **Tokens, no hardcodes.** Colores y tipos viven en `DESIGN.md`.
  3. **Naranja solo CTAs.** Verde para conceptos. Azul base.
  4. **Commits atómicos** Conventional, español, imperativo.
  5. **Confirmación humana** antes de commits, push, dependencias o tocar
     meta-docs.
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
| **Backend / datos** (Supabase, a futuro)    | §2 stack → §12 backend/datos → `docs/architecture/adrs/0002-adoptar-supabase-persistencia.md` → `docs/AI_GUIDELINES.md` §12 |
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
  en `src/app/globals.css`, no en un `tailwind.config.js`)
- **GSAP 3** + **Lenis** (animaciones, smooth scroll)
- **Zod 4** (validación de datos en bordes; se usará cuando se sumen formularios)
- **Supabase** (backend/persistencia elegido: Postgres + Auth + Storage) —
  **a integrar a futuro**, todavía no está en el repo
- **pnpm 11** (pinned vía `packageManager`), **Node ≥ 22**

**Backend/persistencia: Supabase (a integrar).** Se eligió **Supabase**
(Postgres gestionado + Auth + Storage, BaaS) como backend para cuando aparezcan
formularios (inscripción, envío de CV). **Hoy el sitio corre 100% frontend:**
no hay `@supabase/supabase-js` en `package.json`, ni cliente, ni tablas, ni env
vars, ni API routes (`src/app/api/`). Detalle y alternativas en
[ADR-0002](docs/architecture/adrs/0002-adoptar-supabase-persistencia.md);
guías de código en §12 y en `docs/AI_GUIDELINES.md` §12.

Versiones exactas → `package.json`. Fijar majors, minors flotando (`^`).

---

## 3. Project Structure

```
/
├── README.md             ← onboarding humano (instalación, scripts, estructura)
├── AGENTS.md              ← este archivo (contrato AI-neutral)
├── CLAUDE.md              ← adapter para Claude Code
├── CODEX.md               ← adapter para OpenAI Codex CLI
├── GEMINI.md              ← adapter para Gemini CLI
├── DESIGN.md              ← sistema de diseño (tokens, tipos, reglas)
├── docs/
│   ├── README.md          ← índice de documentación
│   ├── COMMITS.md         ← convenciones de commit
│   ├── GLOSSARY.md        ← jerga del dominio ED
│   ├── MESSAGING.md       ← copy canónico de marca
│   ├── AI_GUIDELINES.md   ← reglas detalladas de código IA-friendly
│   ├── conventions/       ← CODE-STYLE.md
│   └── architecture/adrs/ ← decisiones arquitectónicas (ADRs)
├── skills/                ← workflows estables (adr-create, pr-review)
├── public/                ← assets estáticos (brand/, imágenes)
├── src/
│   ├── app/               ← App Router: layout.tsx, page.tsx, globals.css
│   ├── components/        ← UI reutilizable
│   │   ├── brand/         ← logotipo / marca
│   │   ├── layout/        ← Header, Footer, MobileNav, etc.
│   │   ├── providers/     ← LenisProvider (smooth scroll)
│   │   └── ui/            ← botones, reveals, íconos (ui/icons/)
│   ├── features/          ← módulos por dominio
│   │   └── home/components/ ← secciones del home (Hero, LineasAccion, …)
│   ├── config/            ← site.ts (datos institucionales) + nav.ts
│   └── lib/               ← hooks/ y utilidades (intro-signal.ts)
└── (config raíz)          ← tsconfig.json, eslint.config.mjs, next.config.ts,
                              postcss.config.mjs, pnpm-workspace.yaml, .npmrc
```

> **Nota:** el theming de Tailwind v4 vive en `src/app/globals.css` (bloque
> `@theme`), no en `src/styles/` ni en un `tailwind.config.js`. Todavía **no
> hay** `src/lib/supabase/` (cliente), ni tablas, ni `src/app/api/`: el backend
> con **Supabase** es la dirección elegida pero está **por integrar** (ver
> [ADR-0002](docs/architecture/adrs/0002-adoptar-supabase-persistencia.md)).

**Golden rule:** los `.md` raíz y `docs/` son la fuente de verdad. Los
adapters (`CLAUDE.md`, `CODEX.md`, `GEMINI.md`, y un futuro folder
`.claude/`) solo mapean ese contrato a cada herramienta — nunca contenido
propio.

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

- Email, dirección, teléfono, URLs de redes → `src/config/site.ts`.
- Nunca hardcodear datos institucionales en JSX.

### 5.4. Logos de aliados

Solo publicar con autorización confirmada por el usuario. Por defecto, NO
publicar. Los autorizados son exactamente los de la carpeta «LOGOS ALIANZAS»
de ED (hoy: Techint, UNESCO, Bloom/ser+, UCSH, Science Up); la lista única
vive en `src/config/aliados.ts` y el detalle en
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
- Modificar `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md`,
  `DESIGN.md`.
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
- [ ] Componentes < 150 líneas, hooks < 80 líneas, utilidades < 100.
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
- **Validación:** cuando se sumen formularios o datos de entrada, validar
  los bordes con **Zod** antes de tocar Supabase. (Hoy el sitio corre 100%
  frontend; Supabase es el backend elegido a integrar — ver §12.)
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

- [ ] `pnpm typecheck` (o equivalente) pasa.
- [ ] `pnpm lint` pasa.
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
- **Adapter Gemini:** `GEMINI.md` (cuando se sume).
- **Adapter Codex:** `.codex/AGENTS.override.md` (cuando se sume; Codex
  lee `AGENTS.md` nativamente).

---

## 12. Backend y datos (Supabase)

**El backend/persistencia elegido es [Supabase](https://supabase.com)** (BaaS
sobre Postgres gestionado + Auth + Storage). **Todavía no está integrado:** hoy
el sitio corre 100% frontend (sin `@supabase/supabase-js`, sin cliente, sin
tablas, sin env vars, sin `src/app/api/`). Decisión completa, consecuencias y
alternativas en
[ADR-0002](docs/architecture/adrs/0002-adoptar-supabase-persistencia.md).

Enfoque para cuando se integre (no implementar antes de que aparezcan los
formularios y el usuario lo confirme):

- **Acceso a datos** vía el SDK oficial **`@supabase/supabase-js`**; schema,
  queries y políticas **RLS** definidas en Supabase.
- **Validar todos los bordes con Zod** antes de escribir/leer (formularios,
  payloads). Nunca confiar en input externo.
- **Env vars por contexto:** `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicas (cliente); la
  `SUPABASE_SERVICE_ROLE_KEY` es secreta y **solo server-side** (nunca
  `NEXT_PUBLIC_`, nunca expuesta al browser). Placeholders en `.env.example`.
- **RLS activada** en toda tabla con datos sensibles desde el día uno.
- **Migraciones / schema:** confirmar el diseño con el humano antes de crear
  tablas o políticas. No inventar tablas ni columnas que no estén acordadas.

No describir aquí tablas concretas: el modelo de datos se define al
implementar (y, si amerita, en un ADR de implementación).

---

## 13. Estado del proyecto

- [x] Manual de marca procesado → `DESIGN.md`
- [x] Documentación AI-neutral (`AGENTS.md`, adapters, `docs/`)
- [x] Scaffold Next.js 16 (App Router) + React 19 + TS strict + Tailwind v4 + ESLint 9
- [x] Stack adicional instalado: GSAP, Lenis, Zod
- [x] `pnpm-workspace.yaml` con `allowBuilds` aprobando sharp y unrs-resolver
- [x] Mapear tokens de `DESIGN.md` al Tailwind v4 (`globals.css` con `@theme`)
- [x] Cargar fuentes Manrope + Inter (+ JetBrains Mono) vía `next/font/google`
- [x] Configurar metadata base + `lang="es"` en root layout
- [x] `src/config/site.ts` con datos institucionales + `src/config/nav.ts`
- [x] Home real (`src/app/page.tsx` + `src/features/home/`)
- [x] Crear `README.md` de onboarding humano en la raíz
- [ ] Integrar **Supabase** (cliente, schema, RLS, env vars) cuando haya formularios
- [ ] Sitemap definitivo
- [ ] CI/CD
