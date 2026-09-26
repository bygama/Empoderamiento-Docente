import { segundoFactorObligatorio, type Rol } from "@ed/auth";
import type { Prisma } from "@/../prisma/generado/client";
import { base } from "./cliente";

/**
 * Le pone un rol a una cuenta, con lo que ese rol trae. Si el rol pide
 * segundo factor y la cuenta no lo tenía, se lo prende en la misma escritura
 * (el CHECK `user_segundo_factor_obligatorio` no deja otra) y **le cierra las
 * sesiones**: se abrieron sin código, y una sesión así no sobrevive al cambio
 * de regla (SPEC de `work/cuentas/` §5.4). Bajar de rol no lo apaga.
 *
 * Es el único camino para cambiar un rol: lo usan los comandos de `scripts/`
 * y Cuentas. Recibe una transacción cuando el cambio es parte de otro (pasar
 * la dirección baja a una persona y sube a otra).
 */
export async function ponerRol(
  idDeCuenta: string,
  rol: Rol,
  cliente: Prisma.TransactionClient = base,
): Promise<{ cerroSesiones: boolean }> {
  const { twoFactorEnabled } = await cliente.user.findUniqueOrThrow({ where: { id: idDeCuenta }, select: { twoFactorEnabled: true } });
  const prende = segundoFactorObligatorio(rol) && !twoFactorEnabled;
  await cliente.user.update({ where: { id: idDeCuenta }, data: prende ? { rol, twoFactorEnabled: true } : { rol } });
  if (prende) await cliente.session.deleteMany({ where: { userId: idDeCuenta } });
  return { cerroSesiones: prende };
}
