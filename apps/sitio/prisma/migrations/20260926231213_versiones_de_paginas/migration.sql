-- CreateTable
CREATE TABLE "versiones_de_paginas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "documento" JSONB NOT NULL,
    "publicadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicadoPor" TEXT NOT NULL,

    CONSTRAINT "versiones_de_paginas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "versiones_de_paginas_slug_publicadoEn_idx" ON "versiones_de_paginas"("slug", "publicadoEn" DESC);

-- AddForeignKey
ALTER TABLE "versiones_de_paginas" ADD CONSTRAINT "versiones_de_paginas_slug_fkey" FOREIGN KEY ("slug") REFERENCES "paginas"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
