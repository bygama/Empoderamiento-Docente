import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import type { DatosDelSitio } from "@/config/datos-del-sitio";

// Lo que hace en la base la acción de Ajustes › Datos del sitio: la fila
// única, con quién y cuándo. Con el cliente inyectado, para probarlo contra el
// Postgres local adentro de una transacción que no queda.

type Cliente = PrismaClient | Prisma.TransactionClient;

/** Las columnas de `datos_del_sitio` para esos datos, ya validados. */
function columnasDe({ correo, whatsapp, direccion, paises, redes }: DatosDelSitio) {
  return { correo, whatsapp, ...direccion, paises, ...redes };
}

/** Escribe la fila única (la crea si falta) y devuelve cuándo quedó. */
export async function guardarDatosDelSitioEnBase(base: Cliente, datos: DatosDelSitio, quien: string): Promise<Date> {
  const cambio = { ...columnasDe(datos), cambiadoEn: new Date(), cambiadoPor: quien };
  const { cambiadoEn } = await base.datosDelSitio.upsert({ where: { id: 1 }, create: { id: 1, ...cambio }, update: cambio, select: { cambiadoEn: true } });
  return cambiadoEn ?? cambio.cambiadoEn;
}
