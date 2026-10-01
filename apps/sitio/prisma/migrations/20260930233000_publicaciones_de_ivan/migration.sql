-- Lo que pidió Daniela el 30 de septiembre de 2026 sobre Iván Pérez («26.09.30
-- PAGINA cambios.docx»): que sus publicaciones sobre modelación se vean y que una
-- ocupe el cuarto lugar entre los destacados de la Biblioteca. Las diez ya están
-- en la Biblioteca desde 20260927030549_biblioteca; acá va lo que faltaba.
--
-- 1. El destacado 4 pasa de «¿Qué significados de la derivada…?» a «Modelación
--    matemática escolar de la elipse en contexto astronómico» (RECHIEM 2026), la
--    que su propio perfil marca como destacada. El anterior suelta el lugar y
--    conserva sus textos, como hace el admin.
-- 2. Su perfil (etapa «modelacion») suma las tres publicaciones que firma y no
--    mostraba: la de perspectiva feminista (UCMaule 2025), la de la razón
--    geométrica (Paradigma 2025) y la del cálculo escolar (ALME 2024), en orden
--    cronológico y con el mismo criterio de coautoría que las otras siete.
-- 3. Tres novedades de «Publicaciones» para sus artículos de 2026, con ficha
--    (dos secciones escritas a partir del resumen de cada artículo) y abriendo
--    su material en la Biblioteca.
-- Se puede correr más de una vez: cada paso chequea antes de escribir.

-- ── 1. El cuarto destacado ────────────────────────────────────────────────
UPDATE materiales SET destacado = NULL WHERE destacado = 4 AND id <> 'e2001c90-35a7-4020-a879-ca504c378ab9';

UPDATE materiales
SET destacado = 4,
    rotulo = 'La elipse',
    frase = 'La elipse, aprendida modelando el movimiento de los planetas.',
    detalle = 'Iván Pérez, líder de Modelación y Tecnologías de ED, y Karla Pacheco López diseñan y llevan al aula una situación de aprendizaje que articula la matemática escolar con las leyes de Kepler: las y los estudiantes construyen el significado de la elipse modelando el movimiento planetario.'
WHERE id = 'e2001c90-35a7-4020-a879-ca504c378ab9' AND publicado;

-- ── 2. Las tres publicaciones que faltaban en su perfil ───────────────────
UPDATE equipo SET etapas = (
  SELECT jsonb_agg(
    CASE WHEN e->>'clave' = 'modelacion' THEN jsonb_set(e, '{publicaciones}',
      (SELECT coalesce(jsonb_agg(p ORDER BY o), '[]'::jsonb)
         FROM jsonb_array_elements(coalesce(e->'publicaciones', '[]'::jsonb)) WITH ORDINALITY q(p, o)
        WHERE coalesce(p->>'material', '') NOT IN ('4a740567-3276-47d8-bde3-6032b3fa25be', '03c5be67-b66e-4aae-a604-5a947920f25c', 'f7a5d3cd-5c10-4fb9-b50d-3d4e0c4fa8eb', 'd34e84cc-0530-44a8-ac4b-4d8c1ccb6842'))
      || jsonb_build_array(
           jsonb_build_object('origen', 'biblioteca', 'material', '4a740567-3276-47d8-bde3-6032b3fa25be', 'detalle', 'Con P. Salazar-Cortez · Revista UCMaule', 'conceptos', '[]'::jsonb, 'destacada', false),
           jsonb_build_object('origen', 'biblioteca', 'material', '03c5be67-b66e-4aae-a604-5a947920f25c', 'detalle', 'Con P. Salazar-Cortez · Paradigma', 'conceptos', '[]'::jsonb, 'destacada', false))
      || (SELECT coalesce(jsonb_agg(p ORDER BY o), '[]'::jsonb)
            FROM jsonb_array_elements(coalesce(e->'publicaciones', '[]'::jsonb)) WITH ORDINALITY q(p, o)
           WHERE p->>'material' = 'd34e84cc-0530-44a8-ac4b-4d8c1ccb6842')
      || jsonb_build_array(
           jsonb_build_object('origen', 'biblioteca', 'material', 'f7a5d3cd-5c10-4fb9-b50d-3d4e0c4fa8eb', 'detalle', 'Con P. Salazar-Cortez · Acta Latinoamericana de Matemática Educativa', 'conceptos', '[]'::jsonb, 'destacada', false)))
    ELSE e END ORDER BY ord)
  FROM jsonb_array_elements(etapas) WITH ORDINALITY t(e, ord)
) WHERE slug = 'ivan-perez';

-- ── 3. Tres novedades de Publicaciones ────────────────────────────────────
INSERT INTO novedades ("id", "slug", "titulo", "bajada", "fecha", "categoria", "imagen", "cuerpo", "destacada", "material_id", "publicada", "publicada_en", "creada_en")
SELECT gen_random_uuid()::text, v.slug, v.titulo, v.bajada, v.fecha, 'publicaciones', v.imagen::jsonb, v.cuerpo::jsonb, false, v.material_id, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + v.desfase
FROM (VALUES
  ('rechiem-2026-elipse', 'La elipse desde las leyes de Kepler, en RECHIEM', 'Iván Pérez, con Karla Pacheco López, publica el diseño y la implementación de una situación de aprendizaje que enseña la elipse desde el movimiento de los planetas: las y los estudiantes construyen su significado modelando fenómenos astronómicos.', '2026-04', '{"src":"/fotos/globos-medicion.webp","alt":"Docentes miden alturas con globos durante un taller","foco":{"x":0.5,"y":0.5}}', '[{"titulo": "Qué estudia", "parrafos": ["El artículo presenta el diseño y la implementación de una situación de aprendizaje para enseñar la elipse desde un enfoque interdisciplinario: la matemática escolar se articula con fenómenos astronómicos fundamentados en las leyes de Kepler. Las y los estudiantes construyen el significado de la elipse modelando el movimiento de los planetas, en lugar de recibirla como una definición cerrada."]}, {"titulo": "Dónde se publicó", "parrafos": ["Karla Pacheco López e Iván Pérez Vera lo publican en la Revista Chilena de Educación Matemática (RECHIEM), volumen 18, número 1, de abril de 2026. Es de acceso abierto, con licencia Creative Commons."]}]', 'e2001c90-35a7-4020-a879-ca504c378ab9', interval '0 milliseconds'),
  ('cuadernos-2026-consumo-sostenible', 'Modelar el consumo sostenible, en Cuadernos de Investigación', 'Iván Pérez, con Santiago Giovanetti, Susana Riquelme y Roberto Vilches, analiza las estrategias que despliegan las y los estudiantes en una experiencia de modelación matemática sobre consumo y producción sostenibles, con el razonamiento proporcional en el centro.', '2026-02', '{"src":"/fotos/mesa-con-materiales.webp","alt":"Docentes trabajan con materiales alrededor de una mesa","foco":{"x":0.5,"y":0.5}}', '[{"titulo": "Qué estudia", "parrafos": ["La investigación analiza las estrategias de resolución que desarrollan las y los estudiantes durante una experiencia de modelación matemática orientada al consumo y la producción sostenibles, el Objetivo de Desarrollo Sostenible 12. Con un enfoque sociocultural y una metodología cualitativa, muestra cómo el razonamiento proporcional organiza esas estrategias."]}, {"titulo": "Dónde se publicó", "parrafos": ["Santiago Giovanetti, Susana Riquelme, Roberto Vilches e Iván Pérez Vera lo publican en Cuadernos de Investigación y Formación en Educación Matemática, volumen 19, número 1, de febrero de 2026, de la Universidad de Costa Rica."]}]', 'ac49f77f-d035-4a6c-993f-a6bdfecb431a', interval '1 milliseconds'),
  ('iime-2026-derivada-variacional', 'Pensamiento variacional para enseñar la derivada, en IIME', 'Iván Pérez, con Anaís Espinoza-Salomón, Rodrigo Jorquera-Soto y Thiare Osorio-Gómez, presenta una situación de aprendizaje para la derivada en secundaria: del enfriamiento de la silicona a la variación instantánea, por fases, desde el pensamiento y lenguaje variacional.', '2026', '{"src":"/fotos/graficas-de-datos.webp","alt":"Una formadora explica gráficas de datos proyectadas en una pantalla","foco":{"x":0.5,"y":0.5}}', '[{"titulo": "Qué estudia", "parrafos": ["Una experiencia sobre la derivada en secundaria, abordada desde el análisis del cambio y la variación con el enfoque del Pensamiento y Lenguaje Variacional y fases de aprendizaje estructuradas. El estudio de caso sigue a cuatro estudiantes que trabajan con el enfriamiento de la silicona: identifican magnitudes, comparan cambios y se aproximan a la derivada como variación instantánea."]}, {"titulo": "Dónde se publicó", "parrafos": ["Anaís Espinoza-Salomón, Rodrigo Jorquera-Soto, Thiare Osorio-Gómez e Iván Pérez Vera lo publican en Investigación e Innovación en Matemática Educativa (IIME), volumen 11, de 2026."]}]', '77e33cff-b8a7-4e00-a434-520435e54a7d', interval '2 milliseconds')
) AS v(slug, titulo, bajada, fecha, imagen, cuerpo, material_id, desfase)
WHERE NOT EXISTS (SELECT 1 FROM novedades n WHERE n.slug = v.slug);
