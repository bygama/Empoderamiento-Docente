# DECISIONS — Páginas: Inicio completo y la base de la edición

Append-only: fecha — decisión — por qué.

---

- 2026-09-26 — **El resaltado no es un séptimo tipo de campo.** Es un
  `parrafo`/`textoCorto` con un `.refine()` de la sección, y
  `lib/contenido/resaltado.ts` lo convierte en fragmentos. Zod 4.5.4 hereda la
  metadata del registro a través de los refinamientos (probado), así que el
  formulario sale igual y los seis tipos de AGENTS.md §12 no cambian. El brief
  pedía preguntar antes de sumar un séptimo; así no hace falta.
- 2026-09-26 — **Los 19 alts del hero se leen** (SPEC §8): se saca el
  `aria-hidden` de los dos campos de tarjetas. No pedirlos exigía un modo
  «decorativa» en `foto()`, que es abrir el tipo que AGENTS.md §12 cierra.
