-- CreateTable
CREATE TABLE "novedades" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "titulo" TEXT,
    "bajada" TEXT,
    "fecha" TEXT,
    "categoria" TEXT,
    "imagen" JSONB,
    "cuerpo" JSONB,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "publicacion" TEXT,
    "imagen_para_redes" JSONB,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "publicada_en" TIMESTAMP(3),
    "publicada_por" TEXT,
    "borrador" JSONB,
    "borrador_en" TIMESTAMP(3),
    "borrador_por" TEXT,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creada_por" TEXT,

    CONSTRAINT "novedades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "novedades_slug_key" ON "novedades"("slug");

-- La destacada es una sola (work/novedades-y-kit/SPEC.md §4.1). Prisma no
-- escribe índices parciales sin un preview feature, así que este SQL se sumó a
-- mano a la migración de `migrate dev --create-only`, antes de aplicarla,
-- como `user_una_sola_dirige`. `migrate diff` no lo ve como drift. Frena
-- también dos publicaciones a la vez, que un chequeo previo no ve.
CREATE UNIQUE INDEX "novedades_una_sola_destacada" ON "novedades"("destacada") WHERE "destacada";

-- Las nueve novedades de hoy (SPEC §4.3), para que producción las tenga en el
-- primer deploy: el SQL lo generó un script desde
-- `features/novedades/data/novedades.ts`, validando cada fila con
-- `esquemaNovedad`, y ese archivo se borra en el mismo PR. Entran publicadas
-- y sin `publicada_por`: las cargó la migración, no una persona. El id del
-- data.ts pasa a ser el slug; el texto alternativo de cada imagen, que no
-- existía (el sitio las dibuja con alt vacío), es el que esa foto ya tenía en
-- el repo o uno escrito mirándola; el foco, al centro, y el cuerpo sin las
-- anclas, que salen del título al leerlo.
INSERT INTO "novedades" ("id", "slug", "titulo", "bajada", "fecha", "categoria", "imagen", "cuerpo", "destacada", "publicacion", "publicada", "publicada_en") VALUES
  (gen_random_uuid()::text, 'unesco-montevideo', 'UNESCO Montevideo se suma a las alianzas de ED', 'La Oficina Regional de UNESCO en Montevideo autorizó el uso de su logo en los materiales de difusión de la colaboración con Empoderamiento Docente. Ya acompaña a Techint, Bloom, la UCSH y Science Up en nuestra tira de aliados.', '2026-08-26', 'alianzas', '{"src":"/novedades/alianza-unesco.webp","alt":"Logo de UNESCO en blanco sobre el azul de Empoderamiento Docente","foco":{"x":0.5,"y":0.5}}'::jsonb, '[{"titulo":"Qué dice la carta","parrafos":["El 26 de agosto de 2026 la Oficina Regional de UNESCO en Montevideo autorizó por carta a Empoderamiento Docente a usar su logo en los materiales informativos y de difusión vinculados a esta colaboración."]},{"titulo":"Dónde se ve","parrafos":["Desde entonces el logo acompaña a los de Techint, Bloom, la Universidad Católica Silva Henríquez y Science Up en la tira de aliados del sitio. Solo publicamos los logos con autorización expresa de cada organización."]}]'::jsonb, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'pedagogia-y-saberes-2026', 'Educación matemática y ciudadanía, en Pedagogía y Saberes', 'Paola Balda, con Elizabeth Torres-Puentes y Claudia Salazar-Amaya, publica un artículo de reflexión sobre subjetividad, creatividad y ética como categorías que configuran las prácticas educativas con las matemáticas.', '2026-07', 'publicaciones', '{"src":"/fotos/aula-consigna-proyectada.webp","alt":"Docentes en un aula resuelven una consigna proyectada en la pizarra","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'numeros-circulos-matematicos', 'Círculos matemáticos con estudiantes de Argentina y Colombia', 'Paola Balda y Romina Busain describen en la revista Números la experiencia de dos grupos resolviendo problemas con la metodología de los círculos matemáticos: un estudio de casos con registros en video.', '2026-02', 'publicaciones', '{"src":"/fotos/estudiantes-desde-arriba.webp","alt":"Estudiantes escriben sobre hojas alrededor de una mesa, vistos desde arriba","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'rmf-sistema-solar', 'Un taller sobre el Sistema Solar para chicas y chicos de 8 a 13 años', 'Luis Cabrera firma, en la Revista Mexicana de Física E, el diseño y la evaluación de un taller semanal con historietas, modelos de bajo costo y juegos de mesa. En más del 90 % de las sesiones, más de la mitad del grupo alcanzó los aprendizajes esperados.', '2026-01', 'publicaciones', '{"src":"/fotos/materiales-sobre-la-mesa.webp","alt":"Estudiantes trabajan con papeles de colores sobre una mesa","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'somidem-formacion-2026', 'Judith Hernández coedita un libro sobre formación de profesores de matemáticas', 'Editado por SOMIDEM junto a David Páez y Lilia Aké: cómo llevar las investigaciones en Educación Matemática a la formación inicial y continua del profesorado.', '2026', 'publicaciones', '{"src":"/fotos/exposicion-salon.webp","alt":"Una formadora expone ante docentes sentados en mesas redondas","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'relime-2025', 'Resignificar el saber matemático escolar: nuevo artículo en RELIME', 'Daniela Reyes-Gasperini y Karla Gómez Osalde publican en la Revista Latinoamericana de Investigación en Matemática Educativa cómo se resignifica el conocimiento matemático escolar dentro de un programa de desarrollo profesional docente.', '2025-12', 'publicaciones', '{"src":"/quienes-somos/origen-03-pregunta.webp","alt":"Exposición ante la comunidad educativa en un auditorio","foco":{"x":0.5,"y":0.5}}'::jsonb, '[{"titulo":"Qué estudia","parrafos":["El artículo sigue a docentes en servicio durante un programa de desarrollo profesional orientado al empoderamiento docente, y mira qué pasa con el conocimiento matemático escolar cuando se lo pone en discusión. Las dos autoras firman con filiación Empoderamiento Docente: es la investigación más reciente del equipo.","El análisis se apoya en dos episodios, uno de pensamiento algebraico y otro de pensamiento geométrico, tomados del trabajo con el grupo."]},{"titulo":"Qué encuentra","parrafos":["La resignificación aparece como un proceso cíclico, colectivo y progresivo: no ocurre de una vez ni en soledad, y se vuelve parte constitutiva de la profesión docente en matemáticas. Es la idea que sostiene cómo trabajamos: el cambio de relación con la matemática escolar se construye con otras y otros, en el tiempo."]},{"titulo":"Dónde leerlo","parrafos":["Es de acceso abierto en RELIME y está en nuestra Biblioteca, entre los destacados."]}]'::jsonb, true, 'Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente', true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'bolema-2025', 'Problematizar la matemática escolar, en Bolema', 'Mayra Báez, Rebeca Flores-García y Daniela Reyes-Gasperini argumentan cómo la problematización de la matemática escolar contribuye al desarrollo profesional docente, con dos episodios analizados con el modelo reflexivo de la matemática escolar.', '2025', 'publicaciones', '{"src":"/fotos/formadora-explica.webp","alt":"Una formadora explica frente a un grupo","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'aiem-derivada-2025', 'Los criterios de la derivada desde la variación, en AIEM', 'José David Zaldívar, Luis Cabrera y Alma Jiménez proponen situaciones donde el cambio y la variación son el objeto de estudio, para darle significado a los criterios de la derivada más allá de su aplicación algorítmica.', '2025-05', 'publicaciones', '{"src":"/fotos/que-cambia-como-cambia.webp","alt":"Una formadora presenta una lámina sobre qué cambia y cómo cambia","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'somidem-rubrica-2024', 'Una rúbrica para evaluar el pensamiento y lenguaje variacional', 'Luis Cabrera presenta, en un capítulo editado por SOMIDEM, un esquema y una rúbrica analítica validada por expertos para promover y evaluar el desarrollo del pensamiento y lenguaje variacional.', '2024', 'publicaciones', '{"src":"/fotos/pizarra-reparto-justo.webp","alt":"Pizarra con los casos de un problema de reparto durante la etapa de diseño","foco":{"x":0.5,"y":0.5}}'::jsonb, NULL, false, NULL, true, CURRENT_TIMESTAMP);
