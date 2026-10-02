-- Los casos que quedan en Investigación. Daniela pidió el 30 de septiembre de
-- 2026 («26.09.30 PAGINA cambios.docx», punto 44 de
-- docs/content/cambios-dani-2026-09-30.md) eliminar el 02, «¿Cómo cambia la
-- relación de una docente con el saber que enseña, ciclo tras ciclo?», y el
-- 03, «¿Qué nos dice una evaluación más allá del puntaje?». Quedan el 01
-- (Oaxaca) y el que era el 04, que pasa a ser el Nº 02 para que la pila no
-- quede con un hueco. Su id sigue siendo `caso-04`: es el de la fila y el de
-- su ficha en el admin (CASOS_FIJOS, en
-- features/investigacion/contenido/modelo-de-casos.ts). Va por migración
-- porque un caso no se borra desde el admin.
--
-- Ninguna tabla tiene una clave foránea hacia `casos`. Lo que los nombra por
-- texto quedó así:
-- - `redirecciones`: publicar un caso con otra URL deja un 308 hacia su ficha
--   (/investigacion/casos/<slug>), que para estos dos no va a existir. Se
--   borran los que llevan a ellos, antes que sus filas, que son de donde sale
--   la URL. Los que alguien cargó a mano en Ajustes no se tocan.
-- - `actividad`: lo que se anotó de ellos queda como está. Cuentas › Actividad
--   ya no lo lleva a su ficha (admin/cuentas/actividad/modulos/casos.ts).
-- - `fotos`: sus láminas siguen en Fotos, sin uso, como cualquier foto que se
--   deja de usar. Los archivos son de public/ y quedan.
--
-- Se puede correr más de una vez: después de la primera, cada paso no
-- encuentra nada que cambiar.

-- ── 1. Los 308 que llevaban a sus fichas ──────────────────────────────────
DELETE FROM "redirecciones"
WHERE NOT "a_mano"
  AND "hacia" IN (SELECT '/investigacion/casos/' || "slug" FROM "casos" WHERE "id" IN ('caso-02', 'caso-03'));

-- ── 2. Los dos casos ───────────────────────────────────────────────────────
-- Antes que el número: el 02 tiene que quedar libre por el índice único.
DELETE FROM "casos" WHERE "id" IN ('caso-02', 'caso-03');

-- ── 3. El que era el 04 pasa a ser el 02 ───────────────────────────────────
UPDATE "casos" SET "numero" = '02' WHERE "id" = 'caso-04' AND "numero" = '04';

-- Su lámina lleva el número en el rótulo («LÁMINA 04 · MAPA DE
-- PROGRESIONES»): en el expediente Nº 02 tiene que decir 02. En lo publicado
-- y en el borrador, si lo hay; un rótulo que alguien cambió por otra cosa no
-- se toca.
UPDATE "casos"
SET "lamina" = jsonb_set("lamina", '{rotulo}', to_jsonb(regexp_replace("lamina"->>'rotulo', '^LÁMINA 04', 'LÁMINA 02')))
WHERE "id" = 'caso-04' AND "lamina"->>'rotulo' LIKE 'LÁMINA 04%';

UPDATE "casos"
SET "borrador" = jsonb_set("borrador", '{lamina,rotulo}', to_jsonb(regexp_replace("borrador"->'lamina'->>'rotulo', '^LÁMINA 04', 'LÁMINA 02')))
WHERE "id" = 'caso-04' AND "borrador"->'lamina'->>'rotulo' LIKE 'LÁMINA 04%';
