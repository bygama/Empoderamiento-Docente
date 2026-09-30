-- Correcciones del Equipo que pidieron las propias personas al revisar
-- «Quiénes somos» (mails que Raquel Ayala reenvió entre el 23 y el 28 de
-- septiembre de 2026). Van por migración y no por el admin porque el admin de
-- producción todavía no se puede usar (falta el correo del segundo factor);
-- así llegan a todos los entornos con el próximo deploy. Los textos son los
-- de cada persona, tal cual los escribió.
--
-- Karla Gómez Osalde: la frase de la tarjeta; el texto de la etapa «geometria»;
-- un solo criterio para nombrar coautores en sus publicaciones («Con …», en el
-- orden de la autoría, y después la fuente); el libro de texto del que fue
-- coautora, como publicación sin link en su etapa «uady» (la Biblioteca pide
-- un formato y un link, y un libro impreso no los tiene); y su foto de julio de
-- 2026, que reemplaza a la de marzo en public/equipo/karla-gomez.jpg (la fila
-- de `fotos` toma las medidas nuevas y el foco baja al rostro).
-- Gabriela Buendía: ya no es editora responsable de la revista IIME sino
-- editora asociada.
-- Paola Balda: su descripción, con las palabras que mandó.
-- Luis López: «Costa Rica - México» como país (trabaja en Costa Rica, es
-- mexicano) y las revistas de las que es revisor, como un hito más de su
-- etapa actual.

-- ── Karla Gómez Osalde ─────────────────────────────────────────────────────
UPDATE equipo
SET intro = 'Profesora de matemáticas y doctora en Matemática Educativa. Trabaja sobre el desarrollo del pensamiento geométrico y el diseño de tareas que invitan al diálogo sobre la matemática escolar. Desde la Dirección Académica de ED tiene a su cargo los materiales que median el aprendizaje.',
    foto = jsonb_set(foto, '{foco}', '{"x": 0.5, "y": 0.38}'::jsonb),
    figura = jsonb_set(figura, '{foto,foco}', '{"x": 0.5, "y": 0.38}'::jsonb)
WHERE slug = 'karla-gomez';

UPDATE fotos SET ancho = 729, alto = 1200, bytes = 113538 WHERE url = '/equipo/karla-gomez.jpg';

UPDATE equipo SET etapas = (
  SELECT jsonb_agg(
    CASE e->>'clave'
      WHEN 'geometria' THEN jsonb_set(
        jsonb_set(e, '{texto}', to_jsonb('Su investigación estudia el desarrollo del pensamiento geométrico y el diseño de tareas que promueven formas compartidas de comunicar la matemática escolar: no la geometría como un catálogo de figuras, sino como un conocimiento que se construye conversando y experimentando.'::text)),
        '{publicaciones}',
        (SELECT jsonb_agg(jsonb_set(p, '{detalle}', to_jsonb(
          CASE p->>'material'
            WHEN 'c189d22b-472c-47e4-9fd1-c109cf64a529' THEN 'Con Daniela Reyes-Gasperini · Revista Latinoamericana de Investigación en Matemática Educativa'
            WHEN '4ea0b4a5-6468-4630-b5d5-7fdf2f6704de' THEN 'Con Eddie Aparicio, Landy Sosa y Guadalupe Cabañas-Sánchez · Universal Journal of Educational Research'
            WHEN '071d4634-8c1b-4423-81be-51561480638d' THEN 'Con Landy Sosa · Capítulo — Prospecção de Problemas e Soluções nas Ciências Matemáticas 3 · Atena Editora'
            WHEN 'e677f12b-4a52-4562-91c0-9e3d6847476a' THEN 'Con Leslie Torres · Capítulo — Educación Matemática en las Américas 2019 · CIAEM'
            WHEN '07ae0b6b-a6a5-49c4-8a63-6ecc68c6137a' THEN 'Con E. Johanna Mendoza-Higuera, Francisco Cordero y Miguel Solís · Bolema'
            ELSE p->>'detalle'
          END::text)) ORDER BY o)
         FROM jsonb_array_elements(e->'publicaciones') WITH ORDINALITY q(p, o))
      )
      WHEN 'uady' THEN jsonb_set(e, '{publicaciones}',
        (SELECT coalesce(jsonb_agg(p ORDER BY o), '[]'::jsonb)
           FROM jsonb_array_elements(coalesce(e->'publicaciones', '[]'::jsonb)) WITH ORDINALITY q(p, o)
          WHERE p->>'titulo' IS DISTINCT FROM 'Libro de Matemáticas. Tercer año de secundaria'
            AND p->>'material' IS DISTINCT FROM '14188fd0-748f-40a1-a2c6-2d0224a7c3e4')
        || jsonb_build_array(jsonb_build_object(
          'origen', 'sin-link',
          'titulo', 'Libro de Matemáticas. Tercer año de secundaria',
          'tipo', 'Materiales',
          'anio', '2017',
          'detalle', 'Coautora · Secretaría de Educación del Estado de Yucatán y Universidad Autónoma de Yucatán – Facultad de Matemáticas',
          'conceptos', '[]'::jsonb,
          'destacada', false)))
      ELSE e
    END ORDER BY ord)
  FROM jsonb_array_elements(etapas) WITH ORDINALITY t(e, ord)
) WHERE slug = 'karla-gomez';

-- ── Gabriela Buendía ───────────────────────────────────────────────────────
UPDATE equipo SET etapas = (
  SELECT jsonb_agg(
    CASE WHEN e->>'clave' = 'convergencia'
      THEN jsonb_set(e, '{texto}', to_jsonb(replace(e->>'texto', 'Es editora responsable de la revista', 'Es editora asociada de la revista')))
      ELSE e
    END ORDER BY ord)
  FROM jsonb_array_elements(etapas) WITH ORDINALITY t(e, ord)
) WHERE slug = 'gabriela-buendia';

-- ── Paola Balda ────────────────────────────────────────────────────────────
UPDATE equipo
SET intro = 'Licenciada en Matemáticas, Magister en Docencia de las Matemáticas y Doctora en Educación, con tesis laureada sobre epistemología de usos de lo proporcional. Da clases en una escuela pública de Soacha-Colombia desde hace más de dos décadas y desde hace 9 años trabaja en la formación de profesores de matemáticas en una universidad pública de Bogotá. Lidera eventos extracurriculares como festivales matemáticos y jornadas de formación Steam para niñas y jóvenes.'
WHERE slug = 'paola-balda';

-- ── Luis López ─────────────────────────────────────────────────────────────
UPDATE equipo SET pais = 'Costa Rica - México' WHERE slug = 'luis-lopez';

UPDATE equipo SET etapas = (
  SELECT jsonb_agg(
    CASE WHEN e->>'clave' = 'convergencia'
      THEN jsonb_set(e, '{hitos}',
        (SELECT coalesce(jsonb_agg(h ORDER BY o), '[]'::jsonb)
           FROM jsonb_array_elements(coalesce(e->'hitos', '[]'::jsonb)) WITH ORDINALITY q(h, o)
          WHERE h->>'titulo' IS DISTINCT FROM 'Revisor de revistas')
        || jsonb_build_array(jsonb_build_object(
        'titulo', 'Revisor de revistas',
        'detalle', 'Relime · Educación Matemática · IE-Rediech · Revista Educación · Cuadernos de Investigación y Formación en Educación Matemática',
        'periodo', '',
        'principal', false)))
      ELSE e
    END ORDER BY ord)
  FROM jsonb_array_elements(etapas) WITH ORDINALITY t(e, ord)
) WHERE slug = 'luis-lopez';
