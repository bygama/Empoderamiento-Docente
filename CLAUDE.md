# CLAUDE.md — Adapter para Claude Code

> **Esto no es un contrato: es un puntero.** Las reglas del repo viven en
> [`AGENTS.md`](AGENTS.md) y valen igual con cualquier herramienta. Acá solo
> está lo que es propio de Claude Code y no se puede decir de forma neutral.
>
> Si buscás una regla y no está acá, está en `AGENTS.md`. Si una regla está en
> los dos lados, la de `AGENTS.md` es la que manda y la de acá sobra: borrala.

---

## Antes de responder

1. **[`AGENTS.md`](AGENTS.md)** — contrato del sistema: reglas duras, el gate
   de §5.8, quality standards, commit protocol, qué pide confirmación humana.
2. **[`DESIGN.md`](DESIGN.md)** — tokens visuales, si vas a tocar UI.
3. **[`docs/GLOSSARY.md`](docs/GLOSSARY.md)** — si vas a tocar copy.
4. **[`docs/COMMITS.md`](docs/COMMITS.md)** — si la tarea termina en commits.

Si hay un hook `SessionStart` que auto-inyecta `AGENTS.md`, el paso 1 ya está
cubierto.

---

## Mapeo de conceptos `AGENTS.md` → Claude Code

Lo único que este archivo aporta: cómo se llama en Claude Code cada cosa que
`AGENTS.md` nombra de forma neutral.

| Concepto (AGENTS.md)              | Herramienta Claude                    |
| --------------------------------- | ------------------------------------- |
| Spawn agent / delegar             | `Agent(subagent_type=<rol>)`          |
| Workflow / patrón de orquestación | `Skill(<nombre>)`, o prompt manual    |
| Lectura de archivo                | `Read`                                |
| Búsqueda por nombre               | `Glob`                                |
| Búsqueda por contenido            | `Grep`                                |
| Edición de archivo existente      | `Edit`                                |
| Creación / overwrite              | `Write`                               |
| Shell                             | `Bash` (PowerShell en Windows)        |
| Trackeo de tareas largas          | `TaskCreate` / `TaskUpdate`           |
| Búsqueda exploratoria amplia      | `Agent(subagent_type=Explore)`        |

**Sub-agentes:** no hay roster fijo. Cuando la tarea cumple los criterios de
delegación de `AGENTS.md` §4, elegí el `subagent_type` que corresponda —
`general-purpose` para lo multi-archivo, `Explore` para búsqueda read-only,
`Plan` para diseñar antes de codear. Briefá al sub-agente de forma
auto-contenida y verificá su resultado leyendo los archivos, no el resumen.

Si algún día se materializan sub-agentes propios del proyecto en
`.claude/agents/<nombre>.md`, listalos acá.

---

## Quirks de esta herramienta

- **Idioma con el usuario:** español rioplatense. Los artefactos técnicos
  (código, comentarios, commits, docs) en el idioma que fija `AGENTS.md`.
- **OS:** depende del developer. En Windows el shell por defecto es
  **PowerShell** (`$null`, no `/dev/null`; `$env:VAR`, no `$VAR`; backtick para
  continuar línea). `Bash` está disponible para scripts POSIX.
- **Paths:** absolutos y adaptados al OS de cada uno. Nunca hardcodear la ruta
  de una máquina en código ni en docs.
- **El repo es CRLF.** Un reemplazo multilínea con `perl`/`node` falla en
  silencio si no normalizás: leé, pasá a `\n`, editá y devolvé a `\r\n`.
- **Memoria persistente** (local por developer, **no se commitea**):
  - macOS / Linux: `~/.claude/projects/<repo-path-codificado>/memory/`
  - Windows: `%USERPROFILE%\.claude\projects\<repo-path-codificado>\memory\`

  Donde `<repo-path-codificado>` es la ruta absoluta del repo con `:` y
  separadores reemplazados por `--`. Al iniciar sesión, leer su `MEMORY.md`.
- **`/ultrareview`** para review multi-agente cuando hay PR.

---

## Config del proyecto

Cuando se cree, va en `.claude/`: `agents/` (un `.md` por sub-agente con
frontmatter YAML), `commands/` (slash-commands del proyecto) y `settings.json`
(permisos, hooks, env vars).
