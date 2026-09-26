-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "bandeja" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'nuevo',
    "estado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recibido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "pais" TEXT,
    "tema" TEXT,
    "mensaje" TEXT,
    "datos" JSONB NOT NULL DEFAULT '[]',
    "tomado_por_id" TEXT,
    "archivo" TEXT,
    "archivo_bytes" INTEGER,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limites_por_ip" (
    "clave" TEXT NOT NULL,
    "envios" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "limites_por_ip_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "avisos" (
    "cuenta_id" TEXT NOT NULL,
    "aviso" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("cuenta_id","aviso")
);

-- CreateIndex
CREATE INDEX "mensajes_bandeja_estado_recibido_en_idx" ON "mensajes"("bandeja", "estado", "recibido_en");

-- CreateIndex
CREATE INDEX "mensajes_estado_estado_en_idx" ON "mensajes"("estado", "estado_en");

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_tomado_por_id_fkey" FOREIGN KEY ("tomado_por_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
