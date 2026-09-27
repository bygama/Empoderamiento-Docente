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
- 2026-09-26 — **El validador de fotos acepta también `public/novedades/` y
  `public/quienes-somos/`** (`lib/contenido/fotos.ts`, `CARPETAS_DE_FOTOS`).
  Dos de las nueve imágenes de hoy viven ahí (el logo de UNESCO y la foto de
  la destacada), y moverlas a `public/fotos/` cambiaba el HTML del sitio (y la
  de Quiénes somos la usa también su página). Una lista y no «cualquier
  carpeta»: `public/` tiene también logos y PDF. Los frenos contra el path
  traversal son los mismos, con su test. Hoy la 4b y la 4c no tocan esa
  línea (visto en sus worktrees); si alguna necesita `public/investigacion/`,
  la suma a la lista.
- 2026-09-26 — **Los esquemas y lo que no necesita Zod, en dos archivos**
  (`features/novedades/contenido/novedad.ts` y `modelo.ts`). El PLAN los
  ponía juntos; separados, las categorías, los topes y el orden llegan a los
  componentes del navegador sin Zod (como `lib/contenido/buscador.ts` con el
  SEO). Por lo mismo, `@ed/db` publica `slug.ts` en un subpath: su índice
  arrastra el adaptador de Postgres.
- 2026-09-26 — **Las fechas de la tabla son `TIMESTAMP(3)`, como las de las
  demás tablas**, y no `timestamptz` como decía el SPEC §4: lo que manda es
  que el esquema sea uno solo.
- 2026-09-27 — **El padre (mensaje del 2026-09-27): `main` trae de la lane 7
  `Buscador`, `Volver`, `Filtro`, `Confirmacion`, la casilla, el número de la
  sidebar y de las pestañas, y la tabla `avisos`.** Al rebasear se consumen y
  no quedan dos; si una no alcanza, se extiende en su archivo y en §11. Rebasé
  sobre `490547f` después del paso 7: `Buscador` importaba `ENTRADA` de
  `admin/campos/clases`, que esta lane mudó al kit, y sigue el import
  (`2876603`). **La casilla de `main` es una regla de §11, no un componente**
  (la nativa, `accent-azul-principal`, 16 px, la etiqueta la envuelve, meta
  medium cuando prende un campo): la `Casilla` del kit es esa misma regla hecha
  componente, así que no hay dos versiones; §11 pasa a nombrarla. Las
  pantallas de Novedades usan `Buscador`, `Volver` y `Confirmacion` de `main`.
