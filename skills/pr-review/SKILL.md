---
name: pr-review
description: Revisar un PR de Empoderamiento Docente en 4 fases — git state fresco, contexto, verificaciones mecánicas, análisis cualitativo, y dejar un comentario consolidado vía gh.
---

# Skill — Review de PR

## Cuándo usar

- El usuario pide "revisá el PR #N" o "review PR ###".
- Se completa una serie de commits y querés un audit antes de mergear.
- Antes de pedir aprobación humana, para que el comentario consolidado le
  ahorre tiempo al reviewer.

## Cuándo NO usar

- PR ajeno de otro repo (esta skill asume convenciones de
  Empoderamiento-Docente).
- PRs draft sin commits significativos.
- Cuando lo que se necesita es solo verificar una regla puntual (en ese
  caso correr `pnpm lint` / `pnpm typecheck` o un grep específico).

## Pre-requisitos

- `gh` autenticado (`gh auth status`).
- Estar en una working copy limpia (`git status` sin cambios pendientes).
- Conocer el número del PR (`#N`).

---

## Fase 0 — Git state fresco

**No saltarse este paso.** Los reviews que parten de un main desactualizado
generan falsos positivos.

```bash
# Volver a main y traer el estado del remote
git checkout main
git fetch origin --prune
git status   # debe estar limpio
git rev-parse HEAD          # debe coincidir con origin/main
git rev-parse origin/main
```

Si HEAD local difiere de `origin/main`, **parar y resolverlo antes** (rebase
o pull). Un review hecho contra main desactualizado puede sugerir cambios
que ya están aplicados upstream.

---

## Fase 1 — Setup y contexto

### 1.1 Cargar metadata del PR

```bash
gh pr view <N> --json number,title,body,author,baseRefName,headRefName,mergeable,state,labels,reviewDecision,additions,deletions,changedFiles
```

Anotar mentalmente:

- **Título** — ¿sigue Conventional Commits + español?
- **Author** — ¿es alguien del equipo? Self-PR vs PR de fuera tiene
  matices distintos.
- **baseRefName / headRefName** — confirmar base = `main`.
- **changedFiles / additions / deletions** — más de 400 líneas es banderín
  amarillo (debería partirse).
- **labels** — `chore`, `feat`, `docs`, etc., deben matchear el commit
  principal.

### 1.2 Listar commits del PR

```bash
gh pr view <N> --json commits --jq '.commits[] | "\(.oid[0:7]) \(.messageHeadline)"'
```

Verificar:

- Cada header sigue `<tipo>(<scope>): <descripción>`.
- Tipos del enum (ver `docs/COMMITS.md` §2).
- Sin commits "wip", "asdf", "cambios".
- Si hay muchos commits "fix typo" o "review fixes" → flag para squash o
  partir el PR.

### 1.3 Checkout del PR para inspección local

```bash
gh pr checkout <N>
```

> Nota: después de revisar y antes de crear cualquier rama nueva, volver
> a `main` (`git checkout main`) o vas a derivar de un PR ajeno sin
> querer.

### 1.4 Leer la descripción del PR

No hay plantilla de PR en `.github/` por ahora. Igual la descripción
debería traer, en español, al menos: **Resumen**, **Cambios principales**,
**Verificación local** (`pnpm lint` / `typecheck` / `build`) y
**Compliance** con las hard rules (`AGENTS.md` §5).

Anotar si falta alguna de esas secciones **críticas** (Resumen,
Verificación local, Compliance).

---

## Fase 2 — Verificaciones mecánicas

Estas son binarias: pasa o no pasa.

### 2.1 Higiene del repo (chequeo manual)

No hay un `pnpm doctor` por ahora; chequear a mano:

- No hay `.env*` real trackeado (riesgo de leak) — solo `apps/sitio/.env.example` si
  existiera.
- No hay secretos / credenciales literales en `apps/sitio/src/`.
- Los adapters CLAUDE/CODEX/GEMINI referencian `AGENTS.md`.
- La rama deriva del tip de `origin/main`.
- `pnpm-lock.yaml` presente y coherente con `package.json`.

Warning (no falla, pero anotar):

- Patterns de lenguaje no inclusivo en `apps/sitio/src/`.

### 2.2 Lint + typecheck + build

```bash
pnpm lint
pnpm typecheck
pnpm build        # next build
```

Si CI ya está corriendo en el PR, mirar el resultado en `gh pr checks <N>`
en lugar de re-correr todo.

### 2.3 Grep por reglas hard de AGENTS.md §5

```bash
# §5.1 lenguaje inclusivo — busca patterns prohibidos en TODO el diff
gh pr diff <N> | grep -niE '\balumn[oa]s?\b|\blos profesores\b|\blos docentes\b|\blos maestros\b'

# §5.2 tokens vs hardcodes — busca colores hardcodeados en archivos modificados
gh pr view <N> --json files --jq '.files[].path' \
  | grep -E '\.(tsx|ts|css)$' \
  | xargs -I{} grep -niE 'bg-\[#|text-\[#|border-\[#|#[0-9a-fA-F]{3,8}\b' {} 2>/dev/null

# §5.3 datos institucionales — buscan strings que deberían vivir en site.ts
gh pr diff <N> | grep -niE 'empoderamientodocente\.org|@empoderamientodocente|Irarrázaval'

# §5.4 logos de aliados (advertencia)
gh pr diff <N> | grep -niE '(oei|sep|ceneval|techint|ministerio.*educaci)'
```

Cada match es un **punto a citar verbatim** en el comentario, no
parafrasearlo.

### 2.4 Tamaño y forma del diff

```bash
gh pr view <N> --json additions,deletions,changedFiles --jq '.'
```

Heuristics:

- `> 400` additions excluyendo lockfile → flag de "partir el PR".
- `> 10` files cambiados sin un denominador común → flag de "scope amplio".
- Lockfile cambió pero `package.json` no → flag (regenerá el lockfile
  contra la versión del package.json del PR).

---

## Fase 3 — Análisis cualitativo

Acá es donde el review aporta más valor sobre lo que las tools ya
verificaron.

### 3.1 Compliance arquitectónico

- ¿Server Components por default? ¿`"use client"` justificado?
- ¿Imports usan `@/`?
- ¿Componente reutilizable en `apps/sitio/src/components/`? ¿Sección del home en
  `apps/sitio/src/features/home/components/`? ¿Página nueva en `apps/sitio/src/app/`?
- ¿Datos institucionales centralizados en `apps/sitio/src/config/` (site.ts / nav.ts),
  no hardcodeados en JSX?
- (No hay backend ni DB: si el PR introduce entrada de datos, validar los
  bordes con Zod y abrir un ADR antes de sumar persistencia.)

### 3.2 Coherencia con DESIGN.md

- ¿Usa tokens (`bg-azul-principal`) o hardcodes (`bg-[#1F2A44]`)?
- ¿Naranja se usa solo para CTAs?
- ¿Verde y naranja no compiten en el mismo bloque?
- ¿Tipografía Manrope para títulos, Inter para cuerpo?

### 3.3 Coherencia con copy

- ¿Lenguaje inclusivo en todo el copy nuevo (visible)?
- ¿Mensajes pilares (AGENTS.md §5.5) se reusan verbatim, no se
  parafrasean?
- ¿Términos del dominio (GLOSSARY.md) usados con consistencia (no
  "alumnos", sí "estudiantes"; "profesionales de la educación")?
- ¿Siglas presentadas en primera mención?

### 3.4 Quality Standards (AGENTS.md §6)

- ¿Imágenes con `alt`?
- ¿`prefers-reduced-motion` respetado en animaciones nuevas?
- ¿`next/image` con width/height?
- ¿`<title>` y `<meta description>` únicos por página?

### 3.5 Antipatrones (AGENTS.md §8)

Buscar específicamente:

- `any` sin justificación.
- Rutas relativas largas (`../../../`).
- Comentarios que describen el "qué" en vez del "por qué".
- TODOs sin contexto.
- Archivos > 300 líneas.
- `useEffect` sin cleanup.
- GSAP `scrub: true` (debería ser ≥ 0.5).
- `markers: true` en producción.

### 3.6 Cross-referencias obligatorias

Esto es lo que sube la calidad del review más fuerte. Verificar:

- **Claims del PR description vs archivos reales.** Si la descripción
  dice "agregué la sección X al home", buscar que el componente exista
  (p. ej. en `apps/sitio/src/features/home/components/`) y esté montado.
- **Doc ↔ código.** Si el PR cambia un token visual, ¿se actualizó
  `DESIGN.md`? Si suma un término nuevo del dominio, ¿se sumó a
  `GLOSSARY.md`? Si es decisión arquitectónica grande, ¿hay ADR?
- **Valores duplicados.** Si el mail institucional o la dirección
  aparece en JSX, debería estar en `apps/sitio/src/config/site.ts`.
- **Cierre de reviews previas.** Si hay comentarios de reviews
  anteriores (en la misma PR), confirmar que se atendieron — no
  asumir "ya está, lo arreglaron".

### 3.7 Verbatim sobre paráfrasis

Cuando reportes un hallazgo, **citar el bloque exacto**:

> ❌ Mal:
> "Hay un color hardcodeado en el componente del header."
>
> ✅ Bien:
> En `apps/sitio/src/components/Header.tsx:23` se usa `bg-[#1F2A44]` directo en
> lugar del token `bg-azul-principal` definido en `DESIGN.md`.

Esto evita que el autor del PR tenga que adivinar dónde está el
problema.

---

## Fase 4 — Output

### 4.1 Estructura del comentario

Un único `gh pr comment` con:

```markdown
# Review #<N>

**Resumen ejecutivo:** ✅ aprobable / ⚠️ ajustes menores / ❌ bloqueos

## Mecánicas

- Higiene del repo (§2.1): ✅ / ❌ (detalle)
- `pnpm lint`: ✅ / ❌
- `pnpm typecheck`: ✅ / ❌
- `pnpm build`: ✅ / ❌
- CI: ✅ verde / ❌ jobs fallaron

## Compliance (AGENTS.md §5)

| Regla                          | Estado | Notas                          |
| ------------------------------ | ------ | ------------------------------ |
| §5.1 Lenguaje inclusivo        | ✅/⚠️/❌ | (citar matches si los hay)    |
| §5.2 Tokens vs hardcodes       | ✅/⚠️/❌ |                                |
| §5.3 Datos institucionales     | ✅/⚠️/❌ |                                |
| §5.4 Logos de aliados          | ✅/⚠️/❌ |                                |
| §5.5 Mensajes pilares          | ✅/⚠️/❌ |                                |
| §9 Commits atómicos / formato  | ✅/⚠️/❌ |                                |

## Hallazgos cualitativos

### 🔴 Bloqueantes
- (citar archivo:línea + cita verbatim + qué corregir)

### 🟡 Sugerencias
- …

### 🟢 Cosas que están bien
- …

## Cross-refs verificadas
- (lista de claims del PR contra archivos / docs / lugares donde
  el valor también vive)

## Recomendación
- ✅ Aprobar
- ⚠️ Aprobar con sugerencias (ajustes menores opcionales)
- 🔴 Pedir cambios (listar bloqueantes arriba)
```

### 4.2 Publicar el comentario

```bash
# Borrador local primero (NUNCA pegar directo a gh sin re-leer)
cat > /tmp/review-<N>.md <<'EOF'
<contenido>
EOF

# Re-leer
cat /tmp/review-<N>.md

# Publicar (requiere OK humano por AGENTS.md §5.6 si es la primera vez
# de la sesión que dejás un comentario)
gh pr comment <N> --body-file /tmp/review-<N>.md
```

### 4.3 No aprobar ni rechazar formalmente

Esta skill **no usa `gh pr review --approve|--request-changes`**. La
aprobación formal es del humano (AGENTS.md §5.6 — acciones visibles fuera
del repo local). El comentario consolidado es input para que el reviewer
humano decida.

---

## Caso especial: self-review

Si vos sos el autor del PR (`gh pr view <N> --json author --jq .author.login`
coincide con el operador actual):

- **No te aprobes a vos mismo en el mismo contexto.** Eso es self-approval
  y viola la separación de pasadas (CLAUDE.md global recuerda: "writer
  pass crea, reviewer pass evalúa en otra lane").
- **Delegar Fase 3 a un sub-agente nuevo** con sesión limpia y prompt
  self-contained. El sub-agente no asume contexto previo.
- **Banner obligatorio** al inicio del comentario:

  > ⚠️ **Self-review.** Este audit fue producido por la misma IA que
  > escribió el PR (o por una IA delegada en sesión separada). Pasada
  > de aprobación humana sigue requerida.

---

## Caso especial: higiene post-checkout

Después de `gh pr checkout <N>`, **siempre** volver a `main` antes de
crear cualquier branch nueva:

```bash
git checkout main
git pull --ff-only origin main
# AHORA SÍ: git checkout -b feat/<nueva-cosa>
```

Sin este paso, terminás derivando una rama nueva del PR ajeno y al
mergear el original te quedan los commits del otro en tu rama.

---

## Checklist antes de cerrar la review

- [ ] Fase 0 ejecutada (git state fresco).
- [ ] PR description leída (Resumen, Verificación local, Compliance).
- [ ] Higiene del repo (§2.1) chequeada.
- [ ] `pnpm lint` + `pnpm typecheck` corridos.
- [ ] `pnpm build` corrido (o CI verificado).
- [ ] Grep por las 4 hard rules ejecutado y resultados verificados.
- [ ] Hallazgos citan archivo:línea + bloque verbatim.
- [ ] Cross-refs verificadas (claims vs archivos, doc vs código,
  duplicados).
- [ ] Comentario consolidado en un único `gh pr comment`.
- [ ] NO se aprobó/rechazó formalmente (humano decide).
- [ ] Vuelto a `main` antes de tocar otras ramas.

---

## Referencias

- [AGENTS.md](../../AGENTS.md) — fuente de verdad de hard rules.
- [docs/AI_GUIDELINES.md](../../docs/AI_GUIDELINES.md) — 18 reglas de
  código IA-friendly.
- [docs/COMMITS.md](../../docs/COMMITS.md) — convención de commits.
- [docs/GLOSSARY.md](../../docs/GLOSSARY.md) — términos del dominio.
- [DESIGN.md](../../DESIGN.md) — tokens visuales.
