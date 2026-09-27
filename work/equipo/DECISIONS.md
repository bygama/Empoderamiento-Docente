# DECISIONS — Equipo

- 2026-09-27 — **SPEC aprobado por el padre, con un cambio y dos
  precisiones.** A, B, C, D, E, F, G, I, K, L, M, O y P tal cual; las tablas
  (`equipo`, `autorias.persona` → `persona_id` con FK `ON DELETE SET NULL`,
  las 5 filas de `materiales` y las 15 de `fotos` después de la lane 9) y
  cero dependencias, aprobadas.
  - **J cambia: sin arrastre.** Solo «Subir» y «Bajar», como Aliados en la
    lane 9 (`ListaDeAliados.tsx` + `moverAliado({ id, hacia })`: un paso por
    clic, en el momento, el foco sigue al elemento y el cambio se anuncia en
    un `role="status"`). Dos interacciones distintas para lo mismo es drift,
    y el arrastre nativo no anda en pantallas táctiles. La acción copia esa
    forma: `moverPersona({ id, hacia })`, un paso dentro del nivel, en una
    transacción; sin la lista entera ni el chequeo «el equipo cambió».
    Equipo es el segundo consumidor: al rebasear sobre la 9, el patrón sube
    a DESIGN.md §11 como «Lista que se ordena» (una regla que no nombra ruta)
    y la entrada de Aliados apunta a él; si lo compartido en código queda
    duplicado, se extrae a `admin/armazon/`.
  - **H, precisión:** los 2 títulos que la Biblioteca tiene más cortos que el
    perfil (uno de Iván Pérez, el de Andrea Vergara) se miran en la fuente
    del material; si la fuente da el título entero, la migración de `equipo`
    lo corrige en `materiales` con su línea acá; si da el corto, queda.
  - **N, precisión:** vincular por nombre normaliza mayúsculas y tildes y
    compara palabra por palabra, no por subcadena, con un test.
  - **Nota del padre, no bloquea:** los ~110 KB del recorrido en el payload
    del HTML van a «Abierto» para la fase 4 (cargar el perfil al abrirlo).
  - **Orden:** la lane 9 se mergea primero; fotos y la lista que se ordena la
    esperan, y si no llegó, se anota y se sigue con otro paso.
- 2026-09-27 — **La actividad de mover se llama `movio-un-perfil`** (consecuencia
  de J): con un paso por clic, lo que se anota es a quién se movió («Ana movió
  a Iván Pérez en el orden del equipo»), no el nivel entero. Va al Inicio,
  como aprobó L.

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
