-- CreateTable
CREATE TABLE "actividad" (
    "id" TEXT NOT NULL,
    "cuenta_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "sobre" TEXT,
    "sobre_id" TEXT,
    "en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actividad_en_idx" ON "actividad"("en");

-- CreateIndex
CREATE INDEX "actividad_cuenta_id_en_idx" ON "actividad"("cuenta_id", "en");

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
