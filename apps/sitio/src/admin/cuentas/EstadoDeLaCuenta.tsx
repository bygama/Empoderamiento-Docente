import type { EstadoDeCuenta } from "@ed/auth";
import { Insignia } from "@/admin/armazon/Insignia";

/**
 * La insignia del estado de una cuenta (SPEC de work/cuentas §2): activa es
 * el estado estable; una invitación pendiente todavía no empezó, salvo que
 * haya vencido, que pide reenviarla; y suspendida no pide nada.
 */
export function EstadoDeLaCuenta({ estado, invitacionVencida }: { estado: EstadoDeCuenta; invitacionVencida: boolean }) {
  if (estado === "activa") return <Insignia tono="normal">Activa</Insignia>;
  if (estado === "suspendida") return <Insignia tono="apagado">Suspendida</Insignia>;
  return invitacionVencida ? <Insignia tono="fuerte">Invitación vencida</Insignia> : <Insignia tono="apagado">Invitación pendiente</Insignia>;
}
