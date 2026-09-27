-- Las fotos del Equipo que viven en public/equipo/ entran a la biblioteca de
-- Fotos (work/equipo/SPEC.md §9, la regla de work/casos-aliados-fotos/ §3.1):
-- las 15 que usan los perfiles, en la tarjeta y en la figura del recorrido.
-- Cada una conserva su ruta de public/ como `url`. Los dos recortes de Daniela
-- Reyes (daniela-reyes-cutout.png y .webp) no entran: ningún perfil los usa, y
-- una foto entra con el alt de su primer uso.
--
-- De qué salió y cómo se generó: un script que no se commitea leyó los usos de
-- la tabla equipo (la foto de la tarjeta de cada perfil, en el orden de la
-- página), midió cada archivo con sharp (ancho, alto, formato) y su peso en
-- disco, y tomó como alt el de la tarjeta, que es el nombre de la persona.
-- `subidaPor` nulo: llegaron con el sitio, no las subió nadie. `ON CONFLICT`
-- por si una base ya tiene una fila con esa url.
INSERT INTO "fotos" ("id", "url", "alt", "ancho", "alto", "bytes", "tipo", "subidaPor") VALUES
  (gen_random_uuid()::text, '/equipo/daniela-reyes.jpg', 'Daniela Reyes', 1200, 1600, 199024, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/karla-gomez.jpg', 'Karla Gómez', 581, 1032, 72322, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/raquel-ayala.jpg', 'Raquel Ayala', 1600, 1068, 156403, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/ivan-perez.jpg', 'Iván Pérez', 1200, 1600, 163763, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/judith-hernandez.jpg', 'Judith Hernández', 1456, 1600, 433087, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/gabriela-buendia.jpg', 'Gabriela Buendía', 640, 640, 55609, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/marcela-cano.jpg', 'Marcela Cano', 720, 1280, 95922, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/luis-lopez.jpg', 'Luis López', 814, 1080, 82712, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/andrea-vergara.jpg', 'Andrea Vergara', 1600, 959, 349687, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/wendolyne-rios.jpg', 'Wendolyne Ríos', 1920, 2560, 1173875, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/pedro-vidal-szabo.jpg', 'Pedro Vidal-Szabó', 2395, 3600, 1747234, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/paola-balda.jpg', 'Paola Balda', 486, 524, 34819, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/darly-ku-euan.jpg', 'Darly Ku-Euan', 1280, 960, 141594, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/luis-cabrera.jpg', 'Luis Cabrera Chim', 960, 1280, 44090, 'image/jpeg', NULL),
  (gen_random_uuid()::text, '/equipo/eduardo-briceno.jpg', 'Eduardo Briceño', 852, 1280, 47417, 'image/jpeg', NULL)
ON CONFLICT ("url") DO NOTHING;
