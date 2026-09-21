-- CreateTable
CREATE TABLE "paginas" (
    "slug" TEXT NOT NULL,
    "publicado" JSONB,
    "publicadoEn" TIMESTAMP(3),
    "publicadoPor" TEXT,
    "borrador" JSONB,
    "borradorEn" TIMESTAMP(3),
    "borradorPor" TEXT,

    CONSTRAINT "paginas_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "ancho" INTEGER NOT NULL,
    "alto" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "subidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subidaPor" TEXT NOT NULL,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);
