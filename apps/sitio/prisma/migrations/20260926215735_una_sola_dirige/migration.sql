-- Dirige es una, siempre (work/roles-y-actividad/SPEC.md §2). Prisma no
-- escribe índices parciales sin un preview feature, así que este SQL se sumó
-- a mano a la migración vacía de `migrate dev --create-only`, antes de
-- aplicarla. `migrate diff` no lo ve como drift: una migración futura no lo
-- borra. Frena también dos altas a la vez, que un chequeo previo no ve.
CREATE UNIQUE INDEX "user_una_sola_dirige" ON "user"("rol") WHERE "rol" = 'dirige';
