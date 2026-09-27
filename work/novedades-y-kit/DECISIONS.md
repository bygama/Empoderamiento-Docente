# DECISIONS — Novedades y el kit del admin

- 2026-09-26 — **SPEC aprobado por el padre con las seis propuestas.** La
  tabla `novedades` y el modelo de entidad (lo publicado en columnas, el
  borrador en un `jsonb` que puede estar incompleto, dos esquemas Zod para
  guardar y para publicar): aprobados. Es el modelo que copian las entidades
  que siguen, y **el ADR lo escribe con ese nivel de detalle**.
- 2026-09-26 — **A) `Boton`, `claseDeBoton` y `Aviso` pasan al kit y
  `admin/armazon/` los re-exporta.** El padre lo registra como un puente: se
  borra en la mudanza mecánica de `armazon/` al kit, cuando no haya lanes en
  vuelo. **Cada re-export lleva un comentario de una línea que lo dice** («se
  va con la mudanza de armazon al kit»), para que nadie le sume cosas.
- 2026-09-26 — **B) `publicacion` queda como columna de texto**, editada con
  un `Seleccion` de los títulos del catálogo, hasta la lane 8, que la pasa a
  una relación con materiales (queda en PROGRESS, «Abierto»).
- 2026-09-26 — **C) «Descartar cambios»** en una publicada con borrador:
  aprobado.
- 2026-09-26 — **D) Pestañas Publicadas · Borradores**, con Publicadas de
  entrada: aprobado.
- 2026-09-26 — **E) «Se ve en» dice Inicio si está entre las cuatro más
  nuevas:** aprobado; es lo que el sitio hace de verdad.
- 2026-09-26 — **F) Manrope `.woff` (OFL) en el repo** para la imagen de
  `next/og`, **con la licencia OFL al lado del archivo**.
- 2026-09-26 — **El único cambio visible del sitio** (en la página 2 del
  listado, «Problematizar la matemática escolar», 2025, pasa después de «Los
  criterios de la derivada», 2025-05, por el orden por fecha): aprobado, y va
  en PROGRESS con el diff de `scripts/comparar-render.mjs`.
