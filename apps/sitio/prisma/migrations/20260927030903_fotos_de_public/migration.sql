/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `fotos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "fotos" ALTER COLUMN "subidaPor" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fotos_url_key" ON "fotos"("url");

-- Las fotos del contenido que viven en public/ entran a la biblioteca
-- (work/casos-aliados-fotos/SPEC.md §3.1): las de public/fotos/ menos
-- auditorio-panoramica.webp (es del diseño del pie, no contenido), la de
-- public/novedades/, las tres láminas de public/investigacion/ y los cinco
-- logos de public/aliados/. Cada una conserva su ruta de public/ como `url`.
--
-- De qué salió y cómo se generó (resguardo 3 del padre, DECISIONS): un
-- script que no se commitea recorrió esas carpetas, midió cada archivo con
-- sharp (ancho, alto, formato) y su peso en disco, y tomó como alt el de su
-- primer uso, en este orden: el contenido inicial de las siete páginas en el
-- orden del menú (sección por sección, y el SEO), las nueve novedades de la
-- migración `novedades` de la más nueva a la más vieja, las láminas de
-- features/investigacion/data/casos.ts y los logos de config/aliados.ts. Las
-- 47 tienen al menos un uso, así que ninguna entra sin alt. `subidaPor` nulo:
-- llegaron con el sitio, no las subió nadie. `ON CONFLICT` por si una base ya
-- tiene una fila con esa url (no debería: las subidas son /api/fotos/ o Blob).
INSERT INTO "fotos" ("id", "url", "alt", "ancho", "alto", "bytes", "tipo", "subidaPor") VALUES
  (gen_random_uuid()::text, '/fotos/aula-consigna-proyectada.webp', 'Docentes en un aula resuelven una consigna proyectada en la pizarra', 1600, 1197, 145346, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/cierre-encuentro-grupo.webp', 'Docentes posan juntos en un aula al cierre de un encuentro', 1600, 1200, 224954, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/comparar-tareas-ronda.webp', 'Docentes en ronda comparan dos tareas', 1600, 900, 138700, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/conferencia-problematizacion.webp', 'Exposición sobre la problematización de la matemática escolar — etapa de investigación', 1200, 1600, 130070, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/contexto-significacion.webp', 'Una formadora presenta un cuadro sobre contextos de significación', 1600, 1200, 152600, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/cubos-dos-manos.webp', 'Dos cubos de papel armados, uno en cada mano', 1201, 1600, 43596, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/cubos-mano.webp', 'Cubos de papel armados en la palma de una mano', 1201, 1600, 53260, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/docentes-encuentro-formacion.webp', 'Docentes participando de una propuesta de Empoderamiento Docente', 1599, 1066, 54898, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/docentes-mesa-redonda.webp', 'Docentes conversan alrededor de una mesa de trabajo', 1600, 900, 127998, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/docentes-trabajan-aula.webp', 'Docentes resuelven una tarea en un aula', 1600, 1197, 192120, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/encuentro-institucional.webp', 'Docentes e instituciones reunidas en un encuentro en México', 1600, 1200, 211348, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/encuentro-mesas-rojas.webp', 'Encuentro de formación docente con mesas de trabajo', 1600, 1200, 290492, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/equipo-docente-escuela.webp', 'Un equipo docente reunido frente a la pizarra de su escuela', 1600, 1200, 235058, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/estudiantes-desde-arriba.webp', 'Estudiantes escriben sobre hojas alrededor de una mesa, vistos desde arriba', 900, 1600, 181950, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/exposicion-grafica.webp', 'Una formadora señala una gráfica durante una clase', 1200, 1600, 126566, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/exposicion-salon.webp', 'Una formadora expone ante docentes sentados en mesas redondas', 1600, 900, 88808, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-acompana-grupo.webp', 'Una formadora acompaña a un grupo mientras trabaja — etapa de implementación', 1200, 1600, 120606, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-explica.webp', 'Una formadora explica frente a un grupo', 1600, 1200, 55680, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-guia-taller.webp', 'Una formadora guía a docentes durante un taller', 1600, 1200, 131248, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-mesas-redondas.webp', 'Una formadora conversa con docentes sentados en mesas redondas', 1599, 1066, 58286, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-recorre-aula.webp', 'Una formadora recorre el aula y acompaña a docentes que resuelven una actividad', 1600, 1200, 133128, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadora-sentada-grupo.webp', 'Una formadora trabaja sentada junto a un grupo', 1200, 1600, 176958, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/formadoras-pizarra-umce.webp', 'Tres formadoras junto a la pizarra de una sesión en la Universidad Metropolitana de Ciencias de la Educación', 1600, 1200, 280148, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/globos-medicion.webp', 'Docentes miden alturas con globos durante un taller', 900, 1600, 61190, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/graficas-de-datos.webp', 'Una formadora explica gráficas de datos proyectadas en una pantalla', 720, 1280, 43684, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/grupo-al-aire-libre.webp', 'Un grupo de docentes posa al aire libre, en una terraza', 1600, 900, 159834, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/grupo-en-ronda.webp', 'Un grupo discute una tarea sentado en ronda', 1200, 1600, 105444, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/grupos-conversan.webp', 'Grupos conversan sentados en ronda — etapa de diálogo', 1200, 1600, 116864, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/materiales-sobre-la-mesa.webp', 'Estudiantes trabajan con papeles de colores sobre una mesa', 1200, 1600, 155328, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/mesa-con-materiales.webp', 'Docentes trabajan con materiales alrededor de una mesa', 1600, 900, 122522, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/origen-02-inflexion.webp', 'Encuentro de formación docente frente a la pizarra', 1200, 1600, 196270, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/origen-03-pregunta.webp', 'Exposición ante la comunidad educativa en un auditorio', 1400, 1867, 119464, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/pizarra-reparto-justo.webp', 'Pizarra con los casos de un problema de reparto — etapa de diseño', 1599, 899, 73904, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/pizarra-umce.webp', 'Tres formadoras junto a la pizarra de una sesión en la Universidad Metropolitana de Ciencias de la Educación', 1600, 1200, 281450, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/planilla-proyectada.webp', 'Docentes trabajan en una mesa frente a una planilla proyectada', 1600, 902, 111664, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/producciones-geometricas.webp', 'Producciones de estudiantes expuestas para analizarlas — etapa de evaluación', 1600, 1200, 181224, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/que-cambia-como-cambia.webp', 'Una formadora presenta una lámina sobre qué cambia y cómo cambia', 1600, 1200, 128874, 'image/webp', NULL),
  (gen_random_uuid()::text, '/fotos/salon-mesas-redondas.webp', 'Docentes trabajan en mesas redondas en un salón de encuentros', 1599, 1066, 121578, 'image/webp', NULL),
  (gen_random_uuid()::text, '/novedades/alianza-unesco.webp', 'Logo de UNESCO en blanco sobre el azul de Empoderamiento Docente', 1600, 1000, 11906, 'image/webp', NULL),
  (gen_random_uuid()::text, '/investigacion/caso-01-lamina.webp', 'Ilustración de un equipo docente analizando una tarea de geometría alrededor de una mesa de trabajo', 1600, 1200, 279748, 'image/webp', NULL),
  (gen_random_uuid()::text, '/investigacion/caso-02-lamina.webp', 'Ilustración de una planilla de evaluación integral anotada a mano, con gráficos, notas y una lapicera', 1600, 1200, 139268, 'image/webp', NULL),
  (gen_random_uuid()::text, '/investigacion/caso-03-lamina.webp', 'Ilustración de una carpeta de anillas con esquemas de geometría y una docente pensando en conexiones', 1600, 1200, 171530, 'image/webp', NULL),
  (gen_random_uuid()::text, '/aliados/bloom.png', 'Bloom', 896, 264, 8164, 'image/png', NULL),
  (gen_random_uuid()::text, '/aliados/science-up.png', 'Science Up — Consorcio Ciencia 2030 PUCV, USACH, UCN', 1668, 428, 70677, 'image/png', NULL),
  (gen_random_uuid()::text, '/aliados/techint.svg', 'Techint', 147, 195, 3683, 'image/svg+xml', NULL),
  (gen_random_uuid()::text, '/aliados/ucsh.png', 'Universidad Católica Silva Henríquez', 923, 400, 52550, 'image/png', NULL),
  (gen_random_uuid()::text, '/aliados/unesco.png', 'UNESCO', 1250, 265, 25138, 'image/png', NULL)
ON CONFLICT ("url") DO NOTHING;

-- `origen-03-pregunta.webp` estaba dos veces, idéntica byte a byte (SHA-256
-- A56CAE…60DE): en public/fotos/ para Quiénes somos y en public/quienes-somos/
-- para la novedad `relime-2025` (SPEC §3.5). Todo lo que apuntaba a la de
-- quienes-somos/ pasa a la de fotos/, y ese archivo se borra en el mismo
-- commit. Se reemplaza el texto entre comillas en cada documento: en las
-- novedades (columnas y borrador) y, por las dudas, en las páginas y sus
-- versiones, aunque hoy ninguna lo usa.
UPDATE "novedades" SET "imagen" = replace("imagen"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "imagen"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';
UPDATE "novedades" SET "imagen_para_redes" = replace("imagen_para_redes"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "imagen_para_redes"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';
UPDATE "novedades" SET "borrador" = replace("borrador"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "borrador"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';
UPDATE "paginas" SET "publicado" = replace("publicado"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "publicado"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';
UPDATE "paginas" SET "borrador" = replace("borrador"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "borrador"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';
UPDATE "versiones_de_paginas" SET "documento" = replace("documento"::text, '"/quienes-somos/origen-03-pregunta.webp"', '"/fotos/origen-03-pregunta.webp"')::jsonb WHERE "documento"::text LIKE '%/quienes-somos/origen-03-pregunta.webp%';