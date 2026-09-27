import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import { PLAZOS, bordeDelSpam, vigente, type Plazo, type Plazos, type PlazosDeGuarda } from "@/config/privacidad";
import type { Bandeja } from "@/config/mensajes";
import { armarPlazos, llegoVencido } from "@/datos/privacidad";

// Lo que hacen en la base las acciones de Ajustes › Privacidad (work/ajustes/
// SPEC.md §2.5 y §4): un plazo nuevo es una fila nueva, que rige desde ahora,
// y nunca se edita una vieja. Con el cliente inyectado, para probarlo contra
// el Postgres local adentro de una transacción que no queda.

type Cliente = PrismaClient | Prisma.TransactionClient;

export type Cambio = { que: Plazo; antes: number; ahora: number };

const leer = async (base: Cliente) => armarPlazos(await base.plazoDeRetencion.findMany({ select: { que: true, valor: true, desde: true } }));

const deHoy = (plazos: PlazosDeGuarda): Plazos => ({ cv: vigente(plazos.cv), contacto: vigente(plazos.contacto), spam: plazos.spam });

/** Los plazos como quedarían si los nuevos rigieran desde `desde`. */
function conLosNuevos(plazos: PlazosDeGuarda, nuevos: Plazos, desde: Date): PlazosDeGuarda {
  const sumar = (b: Bandeja) => (nuevos[b] === vigente(plazos[b]) ? plazos[b] : [...plazos[b], { desde, valor: nuevos[b] }]);
  return { cv: sumar("cv"), contacto: sumar("contacto"), spam: nuevos.spam };
}

/** Lo que de una bandeja estaría vencido hoy con esos plazos: lo que llegó y pasó su plazo, y el spam viejo. */
const vencido = (plazos: PlazosDeGuarda, bandeja: Bandeja, hoy: Date) => ({
  OR: [...llegoVencido(plazos[bandeja], hoy).OR, { estado: "spam", estadoEn: { lt: bordeDelSpam(plazos.spam, hoy) } }],
});

/**
 * Cuánto borraría de más la próxima limpieza si rigieran los nuevos: lo que
 * con ellos está vencido y con los de hoy no. Para preguntar antes de guardar.
 */
export async function cuantoSeBorraria(base: Cliente, nuevos: Plazos, hoy: Date = new Date()): Promise<Record<Bandeja, number>> {
  const actuales = await leer(base);
  const despues = conLosNuevos(actuales, nuevos, hoy);
  const contar = (bandeja: Bandeja) =>
    base.mensaje.count({ where: { bandeja, AND: [vencido(despues, bandeja, hoy), { NOT: vencido(actuales, bandeja, hoy) }] } });
  const [contacto, cv] = await Promise.all([contar("contacto"), contar("cv")]);
  return { contacto, cv };
}

/** Deja una fila nueva por cada plazo que cambió, desde ahora, y dice qué cambió. */
export async function ponerPlazos(base: Cliente, nuevos: Plazos, quien: string, desde: Date = new Date()): Promise<Cambio[]> {
  const hoy = deHoy(await leer(base));
  const cambios = PLAZOS.filter((que) => nuevos[que] !== hoy[que]).map((que) => ({ que, antes: hoy[que], ahora: nuevos[que] }));
  if (cambios.length) {
    await base.plazoDeRetencion.createMany({ data: cambios.map(({ que, ahora }) => ({ que, valor: ahora, desde, puestoPor: quien })) });
  }
  return cambios;
}
