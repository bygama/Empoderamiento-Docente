-- CreateTable
CREATE TABLE "bloqueos_de_acceso" (
    "clave" TEXT NOT NULL,
    "fallos" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,
    "bloqueos" INTEGER NOT NULL,
    "hasta" TIMESTAMP(3),

    CONSTRAINT "bloqueos_de_acceso_pkey" PRIMARY KEY ("clave")
);
