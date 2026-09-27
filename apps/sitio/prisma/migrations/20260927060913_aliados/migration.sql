-- CreateTable
CREATE TABLE "aliados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT,
    "logo" JSONB,
    "tamano" TEXT,
    "url" TEXT,
    "orden" INTEGER NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "publicado_en" TIMESTAMP(3),
    "publicado_por" TEXT,
    "borrador" JSONB,
    "borrador_en" TIMESTAMP(3),
    "borrador_por" TEXT,
    "autorizado" BOOLEAN NOT NULL DEFAULT false,
    "autorizacion" TEXT,
    "autorizado_logo" TEXT,
    "autorizado_nombre" TEXT,
    "autorizado_en" TIMESTAMP(3),
    "autorizado_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT,

    CONSTRAINT "aliados_pkey" PRIMARY KEY ("id")
);

-- Los cinco aliados de hoy (work/casos-aliados-fotos/SPEC.md §5): los logos
-- de la carpeta «LOGOS ALIANZAS» de ED, que AGENTS.md §5.4 da por
-- autorizados. Entran publicados y autorizados, sin `publicado_por` ni
-- `autorizado_por`: los cargó la migración, no una persona. La nota de cada
-- uno dice dónde consta, como docs/content/aliados-fuentes-drive.md, y la de
-- Techint repite lo que ese documento deja pendiente.
--
-- La marca queda atada a lo que se autorizó (ronda de arreglos 1, DECISIONS):
-- `autorizado_logo` y `autorizado_nombre` son el logo y el nombre de cada
-- uno, los mismos que se publican. Con otro logo u otro nombre, publicar se
-- niega y el sitio no lo muestra.
--
-- El CREATE TABLE de arriba lo escribió `prisma migrate dev --create-only`
-- desde el esquema (aliados.prisma); esta carga, a mano, en el mismo archivo
-- antes de su primera aplicación (ADR-0011). Esta migración reemplaza a
-- 20260927032338_aliados, que nunca llegó a main: se regeneró con las dos
-- columnas nuevas en vez de sumar una segunda.
--
-- De qué salió y cómo se generó (resguardo 3 del padre, DECISIONS): un
-- script que no se commitea leyó config/aliados.ts, que se borra en el mismo
-- PR, y validó cada fila con `esquemaAliado`: el logo es la foto de
-- public/aliados/ que la migración fotos_de_public ya cargó, con su alt de
-- hoy; el tamaño sale del alto de cada uno (h-8/h-7 chico, h-11/h-10
-- mediano, h-12/h-11 grande); el orden, el de la lista (UNESCO primero,
-- pedido por ED); el nombre es el corto; sin URL, como hoy.
INSERT INTO "aliados" ("id", "nombre", "logo", "tamano", "url", "orden", "publicado", "publicado_en", "autorizado", "autorizacion", "autorizado_logo", "autorizado_nombre", "autorizado_en") VALUES
  (gen_random_uuid()::text, 'UNESCO', '{"src":"/aliados/unesco.png","alt":"UNESCO","foco":{"x":0.5,"y":0.5}}'::jsonb, 'chico', NULL, 1, true, CURRENT_TIMESTAMP, true, 'Carta de la Oficina Regional de UNESCO en Montevideo, 26 de agosto de 2026, en la carpeta «LOGOS ALIANZAS» de ED en Drive (docs/content/aliados-fuentes-drive.md).', '/aliados/unesco.png', 'UNESCO', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Techint', '{"src":"/aliados/techint.svg","alt":"Techint","foco":{"x":0.5,"y":0.5}}'::jsonb, 'grande', NULL, 2, true, CURRENT_TIMESTAMP, true, 'Carpeta «LOGOS ALIANZAS» de ED en Drive (docs/content/aliados-fuentes-drive.md): el archivo lo subió ED el 5 de agosto de 2026. La hoja ALIANZAS ED todavía dice «logo solicitado»: confirmar con Raquel.', '/aliados/techint.svg', 'Techint', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Bloom', '{"src":"/aliados/bloom.png","alt":"Bloom","foco":{"x":0.5,"y":0.5}}'::jsonb, 'chico', NULL, 3, true, CURRENT_TIMESTAMP, true, 'Carpeta «LOGOS ALIANZAS» de ED en Drive (docs/content/aliados-fuentes-drive.md); la hoja ALIANZAS ED dice «logo enviado/subido».', '/aliados/bloom.png', 'Bloom', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'UCSH', '{"src":"/aliados/ucsh.png","alt":"Universidad Católica Silva Henríquez","foco":{"x":0.5,"y":0.5}}'::jsonb, 'grande', NULL, 4, true, CURRENT_TIMESTAMP, true, 'Carpeta «LOGOS ALIANZAS» de ED en Drive (docs/content/aliados-fuentes-drive.md); la hoja ALIANZAS ED dice «logo enviado/subido».', '/aliados/ucsh.png', 'UCSH', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Science Up', '{"src":"/aliados/science-up.png","alt":"Science Up — Consorcio Ciencia 2030 PUCV, USACH, UCN","foco":{"x":0.5,"y":0.5}}'::jsonb, 'mediano', NULL, 5, true, CURRENT_TIMESTAMP, true, 'Carpeta «LOGOS ALIANZAS» de ED en Drive (docs/content/aliados-fuentes-drive.md); la hoja ALIANZAS ED dice «logo enviado/subido».', '/aliados/science-up.png', 'Science Up', CURRENT_TIMESTAMP);
