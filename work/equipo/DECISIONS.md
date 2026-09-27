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
- 2026-09-27 — **El encabezado de la ficha sube al armazón** (paso 9, lo pidió
  react-doctor: `duplicate-jsx-subtree` entre el de un material y el de un
  perfil). `admin/armazon/EncabezadoDeFicha.tsx` lleva el título, la
  insignia, «Cambios sin guardar» y cuándo y quién; cada ficha le pasa su
  insignia y sus acciones. La del material queda igual (el mismo JSX, ahora
  en una pieza). Es la generalización que la 8a hizo con
  `QueCambioPlegado`; la de Novedades, en femenino, no se tocó.
- 2026-09-27 — **La ficha de un material acepta un aviso inicial** (paso 10):
  `avisoInicial` en `FichaDeMaterial` y `useGuardarMaterial`, para decir al
  abrir que la persona que llegó del perfil no está entre los autores que
  trajo el DOI. Va con el tono de error: es algo para resolver.
- 2026-09-27 — **Las listas de textos cortos van en renglones** (paso 7): la
  formación, los territorios y los conceptos son un `Parrafo`, un ítem por
  renglón, como los párrafos de una novedad, y no una lista variable
  anidada más; los hitos, las estancias y las publicaciones, que tienen
  varios campos, sí son listas variables (DESIGN.md §11).
- 2026-09-27 — **La URL de un perfil sigue al nombre** (lo mostró la prueba en
  el navegador): el SPEC §6.3 no decía de dónde sale la de un perfil nuevo, y
  sin esto no se publicaba sin escribirla a mano. Se copia la regla de la
  ficha de una novedad (sigue al título hasta que alguien la escribe o se
  publica), con su ayuda «Así queda: /quienes-somos?persona=…». Publicado,
  la ayuda nombra el link viejo que se pierde al cambiarla.
- 2026-09-27 — **La migración del equipo se renombró, no se regeneró** (nota
  del padre: «si la generaste antes de este rebase, volvé a generarla sobre
  el main nuevo; no la edites a mano»). Su esquema toca solo `equipo` y
  `autorias`, que la lane 9 no tocó; su contenido quedó igual (solo cambió el
  nombre de la carpeta, a `20260927073013_equipo`, para que vaya después de
  `aliados`). La prueba de que regenerarla daría lo mismo: las 27 migraciones
  aplicadas desde cero en una base vacía (`ed_equipo_orden`,
  `ed_equipo_tests`) y `migrate diff` contra el esquema, vacío.
  `prisma migrate reset` sobre `ed_equipo` no se usó: Prisma lo frena para un
  agente sin el consentimiento del usuario; se actualizó el nombre en su
  `_prisma_migrations` y `migrate:deploy` aplicó las de la 9.
- 2026-09-27 — **La rama se re-pusheó con `--force-with-lease`** después del
  rebase sobre la lane 9: es la rama de esta lane, sin PR todavía, y el rebase
  lo pidió el padre al aprobar el SPEC.
- 2026-09-27 — **Los dos recortes de Daniela Reyes no entran a Fotos** (paso
  12): `daniela-reyes-cutout.png` y `.webp` no los usa ningún perfil (el
  `data.ts` viejo decía que quedaban «por si se retoma»), y una foto entra con
  el alt de su primer uso. Entran las 15 `.jpg`, con el alt de la tarjeta (el
  nombre). Es la regla de `fotos_de_public` de la lane 9.
- 2026-09-27 — **Equipo en el registro de usos, en el orden de Contenido**
  (paso 12): entre Casos y Aliados, como sus pestañas. Cada uso lleva al
  bloque de la ficha (`#bloque-tarjeta`, `#bloque-figura`), y la foto de la
  tarjeta de un perfil con «Sin foto» cuenta como sin publicar: está guardada,
  pero el sitio no la muestra.
- 2026-09-27 — **«Elegir de Fotos» se llama «Elegir una ya subida…»**: es el
  rótulo del botón del kit (`CampoFoto`), el mismo en todas las fichas. El
  error de una foto que no es de Fotos dice «La foto tiene que ser una foto de
  Fotos.», como en Casos y Aliados; el viejo nombraba carpetas que ya no son
  las únicas.
- 2026-09-27 — **El intercambio de mover, una función pura en `lib/orden.ts`**
  (`unPasoMovido`): era `tiraMovida` de la lane 9 y el Equipo tenía su copia.
  Con eso, el test de mover del Equipo prueba lo puro (el intercambio y a qué
  nivel va cada perfil) y contra la base solo el perfil que no existe: medido
  en la tabla, el grupo «Sin nivel» lo comparte con los borradores de
  `editar-equipo.test.ts`, que corre a la vez. Por la misma razón, publicar
  mide «último en su nivel» contra los perfiles que no son de prueba (el test
  del registro de fotos suma uno al nivel 4 en el medio).
- 2026-09-27 — **«Lista que se ordena» es una sección de DESIGN.md §11, al lado de
  «Lista»** (paso 11): el padre pidió subirla a «§11 Global › Patrones», pero
  §11 no tiene ese bloque: sus patrones son sus secciones `###`, cada una una
  regla que no nombra ruta. Va con su variante agrupada, y la entrada de
  Aliados en «Ficha de una entidad» apunta a ella.
- 2026-09-27 — **La lista del Equipo lleva la insignia solo si pide atención**
  (paso 11): «Sin publicar», «Cambios sin publicar» y «Despublicado», como
  pedía el SPEC §7.1 y como la lista de la Biblioteca; la de Aliados muestra
  también «Publicado», porque al lado va la de la autorización.
- 2026-09-27 — **Visto al pasar, sin tocar:** `docs/AI_GUIDELINES.md` §2
  («Dónde va un archivo de datos») da de ejemplo `quienes-somos/data/equipo.ts`,
  que esta lane borra; el único `data/` de contenido que queda es
  `investigacion/data/casos.ts`, y la lane 9 también lo borra. La regla
  quedó sin ejemplo porque el contenido pasó a la base: reescribirla es
  de quien cierre el mapa del admin.
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
