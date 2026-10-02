-- «Quiénes sostienen ED» en filas de cuatro: lo pidió Daniela Reyes al revisar
-- el sitio (30 de septiembre de 2026) y Facundo lo cerró el 1 de octubre. La
-- primera fila son las direcciones y el resto del equipo va junto, sin
-- distinguir entre áreas, con el orden, los roles y los nombres que ella
-- escribió, tal cual. Va por migración y no por el admin porque el admin de
-- producción todavía no se puede usar (falta el correo del segundo factor);
-- así llega a todos los entornos con el próximo deploy.
--
-- El sitio ordena por nivel y después por `orden`, así que las filas salen de
-- acá. La primera son las cuatro direcciones: la Dirección general y las tres
-- de la Dirección, que pasa a tener tres lugares (modelo-del-equipo.ts);
-- Wendolyne Ríos sube del nivel 4 al 2, entre Karla Gómez y Raquel Ayala.
-- Después siguen los seis del nivel 3 y los cinco del nivel 4, cada uno en el
-- lugar que le dio Daniela. Dos nombres cambian como ella los escribió:
-- «Daniela Reyes Gasperini» y «Luis Cabrera». Eduardo firma «Briceño» en sus
-- publicaciones; ella escribió «Briseño» y el nombre queda como está.
--
-- El rol completo, el que el perfil muestra debajo del nombre, queda igual al
-- de la tarjeta: si no, el perfil seguiría diciendo «Líder de proyecto» o
-- «Facilitadora» y volvería a separar a la gente en grupos. Solo en quien
-- tiene recorrido: sin él (Marcela Cano) el rol completo no se usa. El rol de
-- Gabriela Buendía tiene 63 caracteres y el tope del rol pasa de 60 a 70 en el
-- mismo cambio: con 60, el sitio no la mostraba.
--
-- Son valores fijos por URL: correrla de nuevo deja todo igual.

UPDATE equipo AS e
SET nivel = v.nivel,
    orden = v.orden,
    nombre = v.nombre,
    rol = v.rol,
    rol_completo = CASE WHEN e.titular IS NULL THEN e.rol_completo ELSE v.rol END
FROM (VALUES
  -- Fila 1: las direcciones.
  ('daniela-reyes',     1, 0, 'Daniela Reyes Gasperini', 'Directora General'),
  ('karla-gomez',       2, 0, 'Karla Gómez',             'Directora Académica'),
  ('wendolyne-rios',    2, 1, 'Wendolyne Ríos',          'Directora de Gestión Educativa'),
  ('raquel-ayala',      2, 2, 'Raquel Ayala',            'Directora de Gestión Institucional'),
  -- Fila 2.
  ('ivan-perez',        3, 0, 'Iván Pérez',              'Modelación y tecnologías'),
  ('gabriela-buendia',  3, 1, 'Gabriela Buendía',        'Visualización y construcción social del conocimiento matemático'),
  ('andrea-vergara',    3, 2, 'Andrea Vergara',          'Pensamiento estocástico'),
  ('luis-lopez',        3, 3, 'Luis López',              'Pensamiento aritmético y algebraico'),
  -- Fila 3.
  ('marcela-cano',      3, 4, 'Marcela Cano',            'Evaluación'),
  ('judith-hernandez',  3, 5, 'Judith Hernández',        'Currículo'),
  ('paola-balda',       4, 0, 'Paola Balda',             'Pensamiento proporcional'),
  ('pedro-vidal-szabo', 4, 1, 'Pedro Vidal-Szabó',       'Pensamiento estocástico'),
  -- Fila 4.
  ('luis-cabrera',      4, 2, 'Luis Cabrera',            'Pensamiento variacional'),
  ('darly-ku-euan',     4, 3, 'Darly Ku-Euan',           'Pensamiento aritmético'),
  ('eduardo-briceno',   4, 4, 'Eduardo Briceño',         'Pensamiento variacional')
) AS v (slug, nivel, orden, nombre, rol)
WHERE e.slug = v.slug;
