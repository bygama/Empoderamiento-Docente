-- CreateTable
CREATE TABLE "contadores" (
    "fecha" DATE NOT NULL,
    "evento" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "clave" TEXT NOT NULL DEFAULT '',
    "cuenta" INTEGER NOT NULL,

    CONSTRAINT "contadores_pkey" PRIMARY KEY ("fecha","evento","canal","clave")
);

-- CreateTable
CREATE TABLE "enlaces" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" TEXT NOT NULL,

    CONSTRAINT "enlaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "texto" TEXT NOT NULL,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creada_por" TEXT NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enlaces_codigo_key" ON "enlaces"("codigo");

-- CreateIndex
CREATE INDEX "marcas_fecha_idx" ON "marcas"("fecha");
