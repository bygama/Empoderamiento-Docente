| `apps/sitio/src/config/site.ts` (fuente canónica)# Documentación — Empoderamiento Docente
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)Índice de la documentación auxiliar del proyecto.
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)- **Si sos una IA** trabajando en el repo: empezá por
| `apps/sitio/src/config/site.ts` (fuente canónica)  [`../AGENTS.md`](../AGENTS.md), después volvé acá.
| `apps/sitio/src/config/site.ts` (fuente canónica)- **Si sos humano**: empezá por [`../README.md`](../README.md) (onboarding:
| `apps/sitio/src/config/site.ts` (fuente canónica)  instalación, scripts, estructura) y, para las reglas del repo, por
| `apps/sitio/src/config/site.ts` (fuente canónica)  [`../AGENTS.md`](../AGENTS.md) (Quickstart).
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)---
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)## Documentos canónicos
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)| Área              | Documento                                       | Para qué sirve                                                                |
| `apps/sitio/src/config/site.ts` (fuente canónica)| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Orquestación IA   | [`../AGENTS.md`](../AGENTS.md)                  | Contrato AI-neutral: hard rules, quality standards, anti-patterns, commit protocol |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Adapter Claude    | [`../CLAUDE.md`](../CLAUDE.md)                  | Importa `AGENTS.md` con `@` y agrega solo el mapeo de herramientas y los quirks |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Sistema de diseño | [`../DESIGN.md`](../DESIGN.md)                  | Tokens visuales: colores, tipografía, espaciado, componentes, iconografía    |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Commits           | [`COMMITS.md`](COMMITS.md)                      | Conventional Commits + atómicos + ejemplos por categoría                      |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Glosario          | [`GLOSSARY.md`](GLOSSARY.md)                    | Jerga del dominio educativo de ED, vocabulario de UI, frases pilares          |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Mensajes de marca | [`MESSAGING.md`](MESSAGING.md)                  | Copy canónico: tagline, hero, triángulo de pilares, manifiesto, tono de voz   |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Arquitectura de contenidos | [`content/`](content/)                 | Arquitectura editorial por página («Qué hacemos», «Investigación»): secciones, copy propuesto, CTAs, pendientes VALIDAR |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Mapa del sitio    | [`content/site-map-ED.pdf`](content/site-map-ED.pdf) | Árbol de páginas y navegación del sitio (PDF, 7 páginas)                     |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Estilo de código  | [`conventions/CODE-STYLE.md`](conventions/CODE-STYLE.md) | Decisiones de estilo que las tools no enforce-an + índice de configs |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Código IA-friendly| [`AI_GUIDELINES.md`](AI_GUIDELINES.md)          | Reglas detalladas: naming, archivos chicos, TS, Tailwind v4, GSAP            |
| `apps/sitio/src/config/site.ts` (fuente canónica)| ADRs              | [`architecture/adrs/`](architecture/adrs/README.md) | Decisiones arquitectónicas (stack base, backend con Supabase, etc.)   |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Diseño del panel  | [`architecture/specs/2026-09-15-panel-admin-diseno.md`](architecture/specs/2026-09-15-panel-admin-diseno.md) | Panel de administración con Payload sobre Neon: alcance, modelo de contenido, acceso, fases y riesgos |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Monorepo          | [`architecture/specs/2026-09-17-monorepo-apps-diseno.md`](architecture/specs/2026-09-17-monorepo-apps-diseno.md) | El repo pasa a `apps/`: por qué una app y no dos, cómo queda el gate multi-proyecto, qué se muda y en qué orden |
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)---
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)## Empezá por…
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)| Objetivo                                          | Leer en este orden                                                                  |
| `apps/sitio/src/config/site.ts` (fuente canónica)| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Maquetar un componente o sección                  | [`../DESIGN.md`](../DESIGN.md) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md)              |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Escribir copy del sitio                           | [`MESSAGING.md`](MESSAGING.md) → [`GLOSSARY.md`](GLOSSARY.md) → `../AGENTS.md` §5.1 (lenguaje inclusivo) |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Trabajar con animaciones (GSAP / Lenis)           | `../AGENTS.md` §7 → §8 (anti-patterns) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md) §11  |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Hacer commits                                     | [`COMMITS.md`](COMMITS.md) → `../AGENTS.md` §9                                       |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Entender la arquitectura del proyecto             | `../AGENTS.md` §1 + §3 → [`architecture/adrs/0001-stack-base.md`](architecture/adrs/0001-stack-base.md) |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Instalar y correr local                           | [`../README.md`](../README.md) (getting started) → `package.json` scripts (`pnpm dev` / `build` / `start` / `lint` / `typecheck`) |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Entender el backend / persistencia (Supabase)     | `../AGENTS.md` §12 → [`architecture/adrs/0002-adoptar-supabase-persistencia.md`](architecture/adrs/0002-adoptar-supabase-persistencia.md) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md) §12 |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Ponerte al día con el estado del proyecto         | `../AGENTS.md` §13 (Estado del proyecto)                                             |
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)---
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)## Cuándo agregar documentación nueva
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)La regla de oro: **si una decisión o convención no se puede inferir leyendo
| `apps/sitio/src/config/site.ts` (fuente canónica)el código en una sesión futura, va a un `.md`.**
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)| Naturaleza del cambio                              | Va a…                              |
| `apps/sitio/src/config/site.ts` (fuente canónica)| -------------------------------------------------- | ---------------------------------- |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Token visual nuevo, regla de uso de color o tipo   | `../DESIGN.md`                     |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Convención de naming, patrón de código             | `AI_GUIDELINES.md`                 |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Nueva agente / workflow / hard rule                | `../AGENTS.md`                     |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Término nuevo del dominio educativo                | `GLOSSARY.md`                      |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Mensaje canónico, claim, tagline, pilar de marca   | `MESSAGING.md`                     |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Cambio en el formato de commits                    | `COMMITS.md`                       |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Quirk específico de Claude Code                    | `../CLAUDE.md`                     |
| `apps/sitio/src/config/site.ts` (fuente canónica)| Datos institucionales, contacto, redes             | `src/config/site.ts` (fuente canónica)                       |
| `apps/sitio/src/config/site.ts` (fuente canónica)
| `apps/sitio/src/config/site.ts` (fuente canónica)Si una decisión arquitectónica grande aparece (ej: sumar un backend o
| `apps/sitio/src/config/site.ts` (fuente canónica)persistencia, agregar i18n, cambiar de hosting), planteala en conversación
| `apps/sitio/src/config/site.ts` (fuente canónica)con el usuario y dejala registrada como ADR en
| `apps/sitio/src/config/site.ts` (fuente canónica)[`architecture/adrs/`](architecture/adrs/README.md) (guía paso a paso en
| `apps/sitio/src/config/site.ts` (fuente canónica)`../skills/adr-create/SKILL.md`).
