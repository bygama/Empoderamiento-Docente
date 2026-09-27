-- CreateTable
CREATE TABLE "plazos_de_retencion" (
    "id" TEXT NOT NULL,
    "que" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "puesto_por" TEXT,

    CONSTRAINT "plazos_de_retencion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plazos_de_retencion_que_desde_idx" ON "plazos_de_retencion"("que", "desde");

-- Lo que sigue se sumó a mano a lo que generó `migrate dev --create-only`,
-- antes de la primera aplicación (AGENTS.md §12, work/ajustes/SPEC.md §4).
--
-- Los tres plazos que estaban en `config/privacidad.ts` (ADR-0012), vigentes
-- desde siempre: el 1 de enero de 1970 es anterior a todo lo que llegó por los
-- formularios. Sin quién los puso: vinieron de fábrica.
INSERT INTO "plazos_de_retencion" ("id", "que", "valor", "desde") VALUES
    (gen_random_uuid()::text, 'cv', 12, '1970-01-01 00:00:00'),
    (gen_random_uuid()::text, 'contacto', 24, '1970-01-01 00:00:00'),
    (gen_random_uuid()::text, 'spam', 30, '1970-01-01 00:00:00');
