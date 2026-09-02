# Documentación — Empoderamiento Docente

Índice de la documentación auxiliar del proyecto.

- **Si sos una IA** trabajando en el repo: empezá por
  [`../AGENTS.md`](../AGENTS.md), después volvé acá.
- **Si sos humano**: empezá por [`../README.md`](../README.md) (onboarding:
  instalación, scripts, estructura) y, para las reglas del repo, por
  [`../AGENTS.md`](../AGENTS.md) (Quickstart).

---

## Documentos canónicos

| Área              | Documento                                       | Para qué sirve                                                                |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Orquestación IA   | [`../AGENTS.md`](../AGENTS.md)                  | Contrato AI-neutral: hard rules, quality standards, anti-patterns, commit protocol |
| Adapter Claude    | [`../CLAUDE.md`](../CLAUDE.md)                  | Mapeo de conceptos de `AGENTS.md` a herramientas concretas de Claude Code     |
| Sistema de diseño | [`../DESIGN.md`](../DESIGN.md)                  | Tokens visuales: colores, tipografía, espaciado, componentes, iconografía    |
| Adapter Codex     | [`../CODEX.md`](../CODEX.md)                    | Mapeo de `AGENTS.md` a OpenAI Codex CLI                                       |
| Adapter Gemini    | [`../GEMINI.md`](../GEMINI.md)                  | Mapeo de `AGENTS.md` a Gemini CLI / Code Assist                              |
| Commits           | [`COMMITS.md`](COMMITS.md)                      | Conventional Commits + atómicos + ejemplos por categoría                      |
| Glosario          | [`GLOSSARY.md`](GLOSSARY.md)                    | Jerga del dominio educativo de ED, vocabulario de UI, frases pilares          |
| Mensajes de marca | [`MESSAGING.md`](MESSAGING.md)                  | Copy canónico: tagline, hero, triángulo de pilares, manifiesto, tono de voz   |
| Arquitectura de contenidos | [`content/`](content/)                 | Arquitectura editorial por página («Qué hacemos», «Investigación»): secciones, copy propuesto, CTAs, pendientes VALIDAR |
| Estilo de código  | [`conventions/CODE-STYLE.md`](conventions/CODE-STYLE.md) | Decisiones de estilo que las tools no enforce-an + índice de configs |
| Código IA-friendly| [`AI_GUIDELINES.md`](AI_GUIDELINES.md)          | Reglas detalladas: naming, archivos chicos, TS, Tailwind v4, GSAP            |
| ADRs              | [`architecture/adrs/`](architecture/adrs/README.md) | Decisiones arquitectónicas (stack base, backend con Supabase, etc.)   |

---

## Empezá por…

| Objetivo                                          | Leer en este orden                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Maquetar un componente o sección                  | [`../DESIGN.md`](../DESIGN.md) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md)              |
| Escribir copy del sitio                           | [`MESSAGING.md`](MESSAGING.md) → [`GLOSSARY.md`](GLOSSARY.md) → `../AGENTS.md` §5.1 (lenguaje inclusivo) |
| Trabajar con animaciones (GSAP / Lenis)           | `../AGENTS.md` §7 → §8 (anti-patterns) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md) §11  |
| Hacer commits                                     | [`COMMITS.md`](COMMITS.md) → `../AGENTS.md` §9                                       |
| Entender la arquitectura del proyecto             | `../AGENTS.md` §1 + §3 → [`architecture/adrs/0001-stack-base.md`](architecture/adrs/0001-stack-base.md) |
| Instalar y correr local                           | [`../README.md`](../README.md) (getting started) → `package.json` scripts (`pnpm dev` / `build` / `start` / `lint` / `typecheck`) |
| Entender el backend / persistencia (Supabase)     | `../AGENTS.md` §12 → [`architecture/adrs/0002-adoptar-supabase-persistencia.md`](architecture/adrs/0002-adoptar-supabase-persistencia.md) → [`AI_GUIDELINES.md`](AI_GUIDELINES.md) §12 |
| Ponerte al día con el estado del proyecto         | `../AGENTS.md` §13 (Estado del proyecto)                                             |

---

## Cuándo agregar documentación nueva

La regla de oro: **si una decisión o convención no se puede inferir leyendo
el código en una sesión futura, va a un `.md`.**

| Naturaleza del cambio                              | Va a…                              |
| -------------------------------------------------- | ---------------------------------- |
| Token visual nuevo, regla de uso de color o tipo   | `../DESIGN.md`                     |
| Convención de naming, patrón de código             | `AI_GUIDELINES.md`                 |
| Nueva agente / workflow / hard rule                | `../AGENTS.md`                     |
| Término nuevo del dominio educativo                | `GLOSSARY.md`                      |
| Mensaje canónico, claim, tagline, pilar de marca   | `MESSAGING.md`                     |
| Cambio en el formato de commits                    | `COMMITS.md`                       |
| Quirk específico de Claude Code                    | `../CLAUDE.md`                     |
| Datos institucionales, contacto, redes             | `src/config/site.ts` (fuente canónica)                       |

Si una decisión arquitectónica grande aparece (ej: sumar un backend o
persistencia, agregar i18n, cambiar de hosting), planteala en conversación
con el usuario y dejala registrada como ADR en
[`architecture/adrs/`](architecture/adrs/README.md) (guía paso a paso en
`../skills/adr-create/SKILL.md`).
