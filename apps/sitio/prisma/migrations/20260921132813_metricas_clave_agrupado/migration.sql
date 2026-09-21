/*
  Warnings:

  - The primary key for the `metricas_diarias` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "metricas_diarias" DROP CONSTRAINT "metricas_diarias_pkey",
ADD CONSTRAINT "metricas_diarias_pkey" PRIMARY KEY ("fecha", "dimension", "valor", "agrupado");
