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
- 2026-09-26 — **El panel va al lado del formulario desde `xl`, no desde
  `lg`** (SPEC §6.2). El contenido del admin mide 976 px a 1568 de ancho
  (formulario 576 · 48 · panel 352); en `lg`, con la sidebar, quedan unos
  700 y el formulario bajaría a unos 300. Por debajo de `xl` el panel va
  entre el formulario y «Qué cambió».
- 2026-09-26 — **«Qué cambió» queda debajo del formulario y no en el panel**
  (el SPEC §6.2 lo listaba en el panel): su «Antes» y «Ahora» van uno al lado
  del otro desde `md` (DESIGN.md §11) y en 22 rem no entran. Plegado, como
  estaba.
- 2026-09-26 — **«Se ve en» usa las reglas del sitio enteras**: además de la
  lista, su ficha y las cuatro del Inicio (propuesta E), dice si va en la tapa
  como la destacada, por ser la más nueva sin destacada, o como la segunda
  nota. Es lo que `NovedadDestacada` elige, y `se-ve-en.ts` lo prueba.
- 2026-09-26 — **La lógica de `/admin/novedades/imagen-para-redes` vive en
  `datos/consultas/imagen-para-redes.ts`**, como la descarga de un CV: la
  ruta solo la llama (`app/` son rutas). Lo que llega en la dirección pasa
  por los campos de `esquemaBorrador` con `.catch`: un título a medio
  escribir dibuja igual.
- 2026-09-26 — **Revisión de cierre r1** (Opus 5.5, medium, sobre `4ada3bc`):
  PASS con 0 Critical, 0 Important, 4 Minor y dos notas fuera de su lente,
  según el padre. Probó la migración fila por fila, la destacada única, el kit
  sin ED, el render, el RSS, la imagen para redes y el 308.
- 2026-09-26 — **Minor 1, ratificado por el padre (desvío del SPEC §6.1):**
  «Nueva novedad» va solo en el encabezado cuando hay alguna novedad; el
  estado vacío de una pestaña con la otra llena, o de una búsqueda, no la
  repite. El SPEC la ponía también ahí («con la misma acción»), y eran dos
  primarios en la pantalla: DESIGN.md §11 pide uno. Sin ninguna novedad, el
  primario va en el estado vacío y no en el encabezado.
- 2026-09-26 — **Minor 2, ratificado por el padre (desvío del SPEC §6.2):**
  Despublicar, Descartar cambios y Borrar van en «Deshacer o sacar del sitio»,
  al pie de la ficha, y no en el encabezado. Lo destructivo queda lejos del
  primario (Publicar), cada acción dice qué pasa antes de tocarla, y se usan
  poco.
- 2026-09-26 — **Los arreglos 3 a 6 de la revisión:** (3) publicar distingue
  el índice único que saltó por su nombre, que el adaptador de Postgres trae
  en `meta.driverAdapterError.cause.constraint.index` (visto con Prisma
  7.10): la URL dice de quién es y si está publicada o despublicada («la
  conserva para volver al sitio»), en el campo URL; la destacada, en el suyo;
  otro error sube. Vive en `datos/acciones/indices-de-novedades.ts`, porque
  `publicar-novedades.ts` pasaba las 100 líneas. (4) El `guid` del RSS es
  `urn:uuid:<id>`: la novedad del sitio (`NovedadDelSitio`) lleva el id de
  su fila, que viaja también en el payload de los componentes del sitio (nueve
  uuid, ningún texto visible). (5) Despublicar suelta la destacada del
  borrador solo si la novedad era la destacada. (6) El pendiente del Inicio
  nombra la novedad por el título de su borrador (`tituloDelBorrador`); los
  demás usos de `tituloDe` siguen con el publicado primero.
- 2026-09-26 — **Rebase sobre `5737390`** (Cuentas, y Qué hacemos y Quiénes
  somos): los conflictos se resolvieron sumando los dos lados (los imports de
  `Seccion.tsx`, `page.tsx` del Inicio, `contenido/paginas.ts`, los
  registros de actividad, el índice de ADRs, §11, AGENTS.md y el README).
  `FormularioDelRol` de Cuentas importaba `ENTRADA` de `admin/campos/clases`,
  que se mudó al kit: sigue el import en el commit del kit, y el arreglo
  aparte del buscador quedó vacío y se cayó. El registro nuevo de Cuentas
  (`admin/cuentas/actividad/modulos.ts`) suma el módulo «Novedades» para sus
  cuatro tipos, sin link a la ficha: una novedad se borra, como un mensaje.
  `openGraphDeLaPagina` quedó una sola: las dos lanes la escribieron igual.
