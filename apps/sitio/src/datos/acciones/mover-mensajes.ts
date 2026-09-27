import type { Bandeja, EstadoDeMensaje } from "@/config/mensajes";
import type { AlmacenPrivado } from "@/lib/formularios/almacen-privado";
import { registrarActividad, type TipoDeActividad } from "@/datos/actividad";
import { base } from "@/datos/cliente";

// Lo que hace cada acción de la ficha en la base (work/mensajes/SPEC.md §6),
// sin la sesión, para probarlo contra el Postgres local. Las Server Actions
// de mensajes.ts verifican la sesión y la capacidad, y llaman acá. Se anota
// en la actividad: de Contacto con el tema, nunca con el nombre ni el texto
// de quien escribió; de un CV, solo que se borró.

export type Resultado = { ok: boolean; detalle: string };

type Cual = { bandeja: Bandeja; id: string };

const NO_ESTA = "Ese mensaje ya no está: puede que alguien lo haya borrado.";

/** Adónde va cada acción, y desde qué estados se puede. */
export const MOVIMIENTOS = {
  tomar: { a: "en-curso", desde: ["nuevo", "en-curso", "cerrado", "spam"], tipo: "tomo-un-mensaje" },
  cerrar: { a: "cerrado", desde: ["nuevo", "en-curso"], tipo: "cerro-un-mensaje" },
  spam: { a: "spam", desde: ["nuevo", "en-curso", "cerrado"], tipo: "marco-un-mensaje-como-spam" },
} as const satisfies Record<string, { a: EstadoDeMensaje; desde: readonly EstadoDeMensaje[]; tipo: TipoDeActividad }>;

/**
 * Cambia el estado si el actual lo permite y lo anota. Filtra por id **y**
 * bandeja: una bandeja mentida no encuentra la fila. Tomar deja a `quien`
 * como quien lo tiene.
 */
export async function moverMensaje(quien: string, { bandeja, id }: Cual, movimiento: keyof typeof MOVIMIENTOS): Promise<Resultado> {
  const { a, desde, tipo } = MOVIMIENTOS[movimiento];
  const actual = await base.mensaje.findFirst({ where: { id, bandeja }, select: { estado: true, tema: true } });
  if (!actual) return { ok: false, detalle: NO_ESTA };
  if (!(desde as readonly string[]).includes(actual.estado)) return { ok: false, detalle: "Ese mensaje cambió mientras lo mirabas: recargá la página." };
  await base.mensaje.update({
    where: { id },
    data: { estado: a, estadoEn: new Date(), ...(movimiento === "tomar" ? { tomadoPorId: quien } : {}) },
  });
  if (bandeja === "contacto") await registrarActividad({ tipo, quien, sobre: actual.tema ?? "Contacto", sobreId: id });
  return { ok: true, detalle: "Listo." };
}

/**
 * «Borrar ahora»: lo que atiende el pedido de quien quiere que borren sus
 * datos. El archivo de un CV se va primero; si no se puede, tira y la fila
 * queda, para no dejar un archivo que nadie encuentra.
 */
export async function borrarMensajeEnBase(quien: string, { bandeja, id }: Cual, almacen: () => AlmacenPrivado): Promise<Resultado> {
  const actual = await base.mensaje.findFirst({ where: { id, bandeja }, select: { archivo: true, tema: true } });
  if (!actual) return { ok: false, detalle: NO_ESTA };
  if (actual.archivo) await almacen().borrar(actual.archivo);
  await base.mensaje.delete({ where: { id } });
  await registrarActividad(
    bandeja === "cv" ? { tipo: "borro-un-cv", quien } : { tipo: "borro-un-mensaje", quien, sobre: actual.tema ?? "Contacto" },
  );
  return { ok: true, detalle: "Se borró para siempre." };
}
