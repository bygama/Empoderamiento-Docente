# DECISIONS — Equipo

- 2026-09-27 — **La cuenta de las publicaciones** (SPEC §3 y §5.3), con un
  script que carga `features/quienes-somos/data/equipo.ts` y lo cruza con los
  57 materiales de `ed_equipo` por título normalizado, por link y por prefijo
  (no se commitea). Las etapas tienen **78 tarjetas** de publicación en 18
  etapas: **70 publicaciones distintas**, de las que **51 están en la
  Biblioteca** (59 tarjetas) y **19 no** (5 con link, 14 sin link). Las 59
  referencias apuntan a materiales donde esa persona ya figura en
  `autorias`. Contra el material, con los cuatro rótulos de §5.2: 15 títulos
  distintos, 0 años, 0 links, 1 rótulo; 7 detalles son exactamente la fuente.
  El SPEC padre decía «33 de 36»: contaba otra cosa (probablemente las
  `pubs` de la persona, que el sitio no muestra).
- 2026-09-27 — **El ancla de la lane 9 no está en `main`**: su rama
  (`origin/mateo/casos-aliados-fotos`) va por el paso 13 de 20, sin la lista
  de Aliados todavía. El SPEC toma de su SPEC aprobado lo que esta lane
  consume (el registro de usos, `url` única en `fotos`, «Subir» y «Bajar») y
  deja la dependencia escrita (§6.2 y §9).
