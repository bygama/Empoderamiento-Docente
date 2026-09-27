-- CreateTable
CREATE TABLE "datos_del_sitio" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "correo" TEXT NOT NULL,
    "whatsapp" TEXT,
    "calle" TEXT NOT NULL,
    "complemento" TEXT,
    "ciudad" TEXT NOT NULL,
    "region" TEXT,
    "pais" TEXT NOT NULL,
    "paises" TEXT[],
    "instagram" TEXT,
    "facebook" TEXT,
    "linkedin" TEXT,
    "cambiado_en" TIMESTAMP(3),
    "cambiado_por" TEXT,

    CONSTRAINT "datos_del_sitio_pkey" PRIMARY KEY ("id")
);

-- Lo que sigue se sumó a mano a lo que generó `migrate dev --create-only`,
-- antes de la primera aplicación (AGENTS.md §12, work/ajustes/SPEC.md §3).
--
-- Una fila sola, siempre: los datos del sitio son uno. Prisma no escribe
-- CHECK, así que va acá; `migrate diff` no lo ve como drift.
ALTER TABLE "datos_del_sitio" ADD CONSTRAINT "datos_del_sitio_una_sola_fila" CHECK ("id" = 1);

-- Los datos de hoy, los que estaban en `config/site.ts`: así producción los
-- tiene en el primer deploy, sin que nadie los cargue. `cambiado_en` queda en
-- null: «como los cargó la migración».
INSERT INTO "datos_del_sitio" ("id", "correo", "whatsapp", "calle", "complemento", "ciudad", "region", "pais", "paises", "instagram", "facebook", "linkedin")
VALUES (
    1,
    'contacto@empoderamientodocente.org',
    NULL,
    'Avenida Irarrázaval 2821',
    'Torre B, Oficina 527',
    'Santiago',
    'Región Metropolitana',
    'Chile',
    ARRAY['Chile', 'México', 'Argentina', 'Colombia', 'Brasil'],
    'https://www.instagram.com/empoderamientodocente/',
    'https://www.facebook.com/profile.php?id=100068726124781',
    NULL
);
