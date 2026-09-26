-- AlterTable
ALTER TABLE "user" ADD COLUMN     "invitacion_vence" TIMESTAMP(3),
ADD COLUMN     "suspendida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");

-- CreateIndex
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lo que sigue se sumó a mano antes de la primera aplicación (AGENTS.md §12,
-- work/cuentas/SPEC.md §5.3 y §5.4): Prisma no escribe CHECK ni SQL de datos.
--
-- 1. Quien ya dirige o administra pasa a entrar con código, y sus sesiones
--    abiertas se cierran: una sesión abierta sin código no sobrevive al
--    cambio de regla. A la próxima pantalla del admin vuelve a «Entrar».
UPDATE "user" SET "twoFactorEnabled" = true WHERE "rol" IN ('dirige', 'administra');
DELETE FROM "session" WHERE "userId" IN (SELECT "id" FROM "user" WHERE "rol" IN ('dirige', 'administra'));

-- 2. Y desde acá lo garantiza la base: dirige y administra, siempre con el
--    segundo factor. Repite la lista de `segundoFactorObligatorio`
--    (packages/auth/src/permisos.ts). `migrate diff` no ve los CHECK, así que
--    una migración futura no lo borra.
ALTER TABLE "user" ADD CONSTRAINT "user_segundo_factor_obligatorio" CHECK ("rol" NOT IN ('dirige', 'administra') OR "twoFactorEnabled");
