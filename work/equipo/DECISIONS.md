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
- 2026-09-27 — **Los datos de los 5 materiales nuevos** (paso 2), bajados de
  Crossref una vez al escribir la migración: la tortilla va con el tema
  **Pensamiento variacional** y no «Ciudadanía y justicia social» (su
  resumen dice «en el marco del pensamiento variacional»; el SPEC §5.3 lo
  dejaba «a confirmar con el resumen») y con el año **2024** (el del DOI y el
  del perfil; Crossref da 2025-11 como fecha de publicación del número); la
  *Secuencia de aprendizaje lúdica* queda para «Docentes», como proponía el
  SPEC (Crossref no trae resumen). Los nombres de ED, como en las demás
  autorías («Gabriela Buendía Abalos», «Luis Alberto López Acosta»).
- 2026-09-27 — **El título de Viète y Descartes es el de su fuente** (paso 2,
  la regla de H): Crossref da «Emergencia de las ecuaciones paramétricas en
  Viète y Descartes: elementos para repensar la actividad analítica-algebraica»
  y el perfil decía hasta «Descartes». El material entra con el entero, así
  que la tarjeta de Luis López suma una diferencia a las de §8.2 (16 títulos,
  no 15).
- 2026-09-27 — **Los dos títulos cortos se corrigen** (paso 2, precisión H):
  Crossref da el entero en los dos (Iván Pérez, `10.61174/recacym.v21i2.235`;
  Andrea Vergara, `10.21703/rexe.v24i56.3302`). La migración corrige el título
  y la cita. Su **portada estática** (`/biblioteca/portadas/44-…` y `57-…`)
  tenía el título corto dibujado: queda nula y el sitio muestra la tipográfica
  generada, igual a las demás (propuesta G de la 8a); los dos `.webp` quedan
  sin uso en el repo. Consecuencia en el admin: esos dos y los 5 nuevos llevan
  la insignia «Sin portada» (es lo que la insignia dice: sin una propia), y
  los 5 nuevos, «Datos incompletos» hasta que ED escriba su descripción.
- 2026-09-27 — **Visto al pasar, sin tocar:** *Producción de fórmulas* (Luis
  López) es un capítulo del Tomo I de *Matemática en Red*, que tiene su PDF
  público en la página de la colección. El SPEC aprobado lo deja «sin link»
  (el perfil de hoy no lo tiene): sumarle el link, y pasarlo a la
  Biblioteca, es de ED.
- 2026-09-27 — **Lo que se ve distinto, medido** (paso 3, el script de las 78
  tarjetas contra `data/equipo.ts`): **14 títulos** (no 15 ni 16: los dos que
  la Biblioteca tenía cortos ya no difieren, porque se corrigieron ahí; el
  de Viète suma uno), **2 rótulos** (el CIAEM de Karla Gómez, «Libro» →
  «Artículo»; *Matemática en Red*, «Colección» → «Materiales») y **2
  detalles**: el destacado de Gedisa de Daniela Reyes (previsto) y, **uno que
  el SPEC §8.2 no listaba**, *Problematizar la matemática escolar* de Daniela
  Reyes, que hoy no tiene línea y pasa a decir «Bolema», su fuente, por la
  regla G (el detalle vacío lee la fuente). Se deja así: todas las demás
  tarjetas de la Biblioteca llevan su fuente, y un «sin línea» sería un
  estado más para una sola tarjeta. Nada más cambia: el orden, las 15
  tarjetas del equipo, las fotos, los recorridos y los años, links y
  conceptos de las 78.
- 2026-09-27 — **`ImpulsanEd` y `PersonCard` reciben el tipo del sitio con
  un alias** (`PersonaDelSitio as Persona`, paso 3): los componentes no
  cambian de contrato más que en la foto (`persona.foto`, nula si la persona
  pidió no publicarla) y el nivel (`rotuloDelNivel`); `Persona` a secas es
  ahora el documento de la base. La Dirección general se dibuja solo si hay
  una publicada.
- 2026-09-27 — **La figura lineal lee el alt de su foto** (paso 3):
  `datos-figura.ts` pasa `alt` (el de la foto de la figura, o el nombre
  completo) en vez de `fullName`, así el alt que se edita en la ficha es el
  que se ve. La migración lo cargó con el nombre completo: el HTML del perfil
  es el mismo.
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
