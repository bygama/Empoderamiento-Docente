-- CreateTable
CREATE TABLE "metricas_diarias" (
    "fecha" DATE NOT NULL,
    "dimension" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "agrupado" BOOLEAN NOT NULL DEFAULT false,
    "vistas" INTEGER NOT NULL,
    "visitantes" INTEGER NOT NULL,

    CONSTRAINT "metricas_diarias_pkey" PRIMARY KEY ("fecha","dimension","valor")
);

-- CreateTable
CREATE TABLE "metricas_ventanas" (
    "fechaFin" DATE NOT NULL,
    "dias" INTEGER NOT NULL,
    "vistas" INTEGER NOT NULL,
    "visitantes" INTEGER NOT NULL,

    CONSTRAINT "metricas_ventanas_pkey" PRIMARY KEY ("fechaFin","dias")
);

-- CreateTable
CREATE TABLE "metricas_sincronizaciones" (
    "id" SERIAL NOT NULL,
    "corridaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desde" DATE NOT NULL,
    "hasta" DATE NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "metricas_sincronizaciones_pkey" PRIMARY KEY ("id")
);
