# DECISIONS — Páginas: Investigación, Biblioteca y Contacto

Append-only: fecha — decisión — por qué.

---

- 2026-09-26 — **SPEC aprobado tal cual por el padre** (orca ask, «SPEC
  aprobado tal cual. Escribí el PLAN (y commiteá el SPEC)»), con seis puntos
  aprobados de forma explícita:
  1. **`og:title` y `og:description` propios** de Investigación y Biblioteca
     (hoy heredan los del sitio desde el layout): una mejora de SEO y la única
     diferencia de render esperada. El diff de comparar-render que la muestra
     queda en PROGRESS, en esos dos commits.
  2. **Los textos de los botones se editan; los destinos no.** El caso que
     abre cada línea va por posición, en código: la estructura no se edita
     (spec del admin §1).
  3. **El catálogo edita solo su aviso sin resultados**; filtros,
     placeholders, grupos, contadores y «Ver N más» son interfaz y quedan en
     código. `MaterialesListado`, `LineasInvestigacion`,
     `CierreInvestigacion` y `PuenteInvestigacion` se parten, cada uno en su
     commit, antes de su sección.
  4. **Las cuatro fotos del puente siguen con `alt=""`** (decorativas) y el
     campo pide el alt igual, con su ayuda: el criterio del collage del hero
     de la 4a.
  5. **AGENTS.md §6 y §13** se actualizan; **DESIGN.md no se toca** (no hay
     UI nueva del admin).
  6. **Contacto solo si la lane 7 está en `main` al rebasear.**
