/*
  Warnings:

  - You are about to drop the `metricas_sincronizaciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateTable
CREATE TABLE "busquedas_diarias" (
    "fecha" DATE NOT NULL,
    "dimension" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "clics" INTEGER NOT NULL,
    "impresiones" INTEGER NOT NULL,
    "sumaDePosiciones" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "busquedas_diarias_pkey" PRIMARY KEY ("fecha","dimension","valor")
);

-- CreateTable
CREATE TABLE "corridas_de_tareas" (
    "id" SERIAL NOT NULL,
    "tarea" TEXT NOT NULL,
    "corridaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ok" BOOLEAN NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "corridas_de_tareas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "corridas_de_tareas_tarea_corridaEn_idx" ON "corridas_de_tareas"("tarea", "corridaEn");

-- Movimiento de datos, sumado a mano antes de la primera aplicación de esta
-- migración (work/busquedas-de-google/DECISIONS.md, §9.1 del SPEC; ADR-0011).
-- Prisma genera el DROP de abajo pero no mueve datos: sin este INSERT, el
-- historial de la copia de Vercel se perdería con la tabla. Cada fila pasa a
-- ser una corrida de la tarea `metricas-de-vercel`, con su hora, su resultado
-- y su detalle; el rango de días, que la tabla común no tiene como columnas,
-- se suma al final del detalle. El DROP, que Prisma escribió arriba de todo,
-- se bajó hasta acá para que corra después de la copia.
INSERT INTO "corridas_de_tareas" ("tarea", "corridaEn", "ok", "detalle")
SELECT
    'metricas-de-vercel',
    "corridaEn",
    "ok",
    "detalle" || ' (del ' || to_char("desde", 'YYYY-MM-DD') || ' al ' || to_char("hasta", 'YYYY-MM-DD') || ')'
FROM "metricas_sincronizaciones"
ORDER BY "id";

-- DropTable
DROP TABLE "metricas_sincronizaciones";
