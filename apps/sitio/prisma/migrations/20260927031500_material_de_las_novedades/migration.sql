-- La publicación de una novedad pasa de texto (el título exacto) a una
-- relación con `materiales` (work/biblioteca/SPEC.md §4.2). El SQL del
-- esquema es el de `prisma migrate diff`: `migrate dev --create-only` no corre
-- sin terminal interactiva cuando la migración borra una columna con datos
-- (DECISIONS de work/biblioteca/). Prisma lo escribe en una sola sentencia
-- (DROP y ADD); acá va partido, con el DROP al final, para mover los datos
-- antes de borrar la columna.

-- AlterTable
ALTER TABLE "novedades" ADD COLUMN     "material_id" TEXT;

-- AddForeignKey
ALTER TABLE "novedades" ADD CONSTRAINT "novedades_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- La columna: el material con ese título exacto (hoy, una sola novedad,
-- `relime-2025`). Si no hubiera ninguno, queda nula: sin botón, como el sitio
-- ya la mostraba cuando el título no coincidía.
UPDATE "novedades" AS n
SET "material_id" = m."id"
FROM "materiales" AS m
WHERE n."publicacion" IS NOT NULL AND m."titulo" = n."publicacion";

-- Los borradores guardados: la clave `publicacion` (un título) pasa a
-- `material` (un id, o nulo).
UPDATE "novedades"
SET "borrador" = ("borrador" - 'publicacion') || jsonb_build_object('material', (SELECT m."id" FROM "materiales" AS m WHERE m."titulo" = "novedades"."borrador" ->> 'publicacion'))
WHERE "borrador" ? 'publicacion';

-- AlterTable
ALTER TABLE "novedades" DROP COLUMN "publicacion";
