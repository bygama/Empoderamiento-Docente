import { ROL_DE_LA_DIRECCION } from "@ed/auth";
import { base } from "./cliente";

/**
 * Quién dirige, y cómo se nombra a la primera persona que dirige cuando ya
 * tiene cuenta (el caso de producción). Lo usan los comandos de `scripts/`;
 * pasarle la dirección a otra persona es de Cuentas (lane 3b).
 */

export type ResultadoDeNombrar = { ok: true; nombre: string } | { ok: false; motivo: string };

/** El código con que Postgres, por Prisma, dice que un índice único chocó. */
function chocoUnIndiceUnico(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function quienDirige(): Promise<{ nombre: string; correo: string } | null> {
  const fila = await base.user.findFirst({ where: { rol: ROL_DE_LA_DIRECCION }, select: { name: true, email: true } });
  return fila && { nombre: fila.name, correo: fila.email };
}

/**
 * Pasa a dirige la cuenta de `correo`. Se niega, en llano y sin tirar, si el
 * correo no tiene cuenta o si ya hay alguien que dirige: la dirección no se
 * pisa, se pasa, y eso pide a quien dirige hoy.
 */
export async function nombrarDireccion(correo: string): Promise<ResultadoDeNombrar> {
  // better-auth guarda los correos en minúscula.
  const cuenta = await base.user.findUnique({ where: { email: correo.trim().toLowerCase() } });
  if (!cuenta) return { ok: false, motivo: `No hay ninguna cuenta con ${correo}. Para dar una de alta, crear-cuenta.` };
  const ya = await quienDirige();
  if (ya) return { ok: false, motivo: `Ya dirige ${ya.nombre} (${ya.correo}). La dirección se pasa desde Cuentas.` };
  try {
    await base.user.update({ where: { id: cuenta.id }, data: { rol: ROL_DE_LA_DIRECCION } });
  } catch (error) {
    // Entre la pregunta y el cambio alguien nombró a otra persona: lo frenó el índice.
    if (chocoUnIndiceUnico(error)) return { ok: false, motivo: "Recién se nombró a otra persona para dirigir. La dirección se pasa desde Cuentas." };
    throw error;
  }
  return { ok: true, nombre: cuenta.name };
}
