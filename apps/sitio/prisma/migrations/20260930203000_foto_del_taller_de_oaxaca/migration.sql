-- La foto del taller de Oaxaca que mandó Daniela el 30 de septiembre de 2026
-- («26.09.30 PAGINA cambios.docx», para la tarjeta «Oaxaca: una transformación
-- colectiva» de Novedades). Entra a public/fotos/ con el repositorio y acá
-- queda registrada como las demás de esa carpeta; si ya estaba, no se toca.
INSERT INTO "fotos" ("id", "url", "alt", "ancho", "alto", "bytes", "tipo", "subidaPor") VALUES
  (gen_random_uuid()::text, '/fotos/oaxaca-taller-grupo.webp', 'El grupo del taller de Oaxaca posa al cierre de un encuentro', 1350, 1007, 128494, 'image/webp', NULL)
ON CONFLICT ("url") DO NOTHING;
