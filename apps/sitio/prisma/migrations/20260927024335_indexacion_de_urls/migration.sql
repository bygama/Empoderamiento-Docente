-- CreateTable
CREATE TABLE "indexacion_de_urls" (
    "ruta" TEXT NOT NULL,
    "veredicto" TEXT NOT NULL,
    "cobertura" TEXT NOT NULL,
    "ultimo_rastreo" TIMESTAMP(3),
    "revisada_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexacion_de_urls_pkey" PRIMARY KEY ("ruta")
);
