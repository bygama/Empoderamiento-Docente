import type { PrismaClient } from "@/../prisma/generado/client";
import type { Pedir } from "@/datos/biblioteca/buscar-datos";
import { chequearLink, type Chequeo } from "@/datos/biblioteca/chequear-link";
import { presentacion } from "@/datos/biblioteca/contra-la-biblioteca";
import { base } from "@/datos/cliente";
import { pedirProtegido } from "@/lib/red/pedido-protegido";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";

// La salud de los links de la Biblioteca (SPEC §10 de `work/biblioteca/`):
// una tarea del cron diario que chequea los materiales publicados cuyo último
// chequeo tiene más de una semana. Cada link se chequea una vez por semana,
// el día que le toca, y la carga se reparte entre los días: la tarea tiene
// 50 segundos (ADR-0011) y no puede ir a buscar los 57 juntos.

export const DIAS_ENTRE_CHEQUEOS = 7;
/** Cuántos por corrida, de a cuántos a la vez, y hasta cuándo se empieza otra tanda. */
export const POR_CORRIDA = 15;
export const A_LA_VEZ = 5;
export const SIN_EMPEZAR_DESPUES_MS = 35_000;

type Vencido = { id: string; titulo: string | null; url: string | null; doi: string | null };

/** «Se chequearon 12 links: 11 bien, 1 roto («Título»).» Pura: se prueba sin base. */
export function resumenDeLaCorrida(hechos: ReadonlyArray<{ titulo: string | null; chequeo: Chequeo }>): string {
  if (hechos.length === 0) return `No había links para chequear: todos se chequearon hace menos de ${DIAS_ENTRE_CHEQUEOS} días.`;
  const cuantos = (r: Chequeo["chequeo"]) => hechos.filter((h) => h.chequeo.chequeo === r).length;
  const rotos = hechos.filter((h) => h.chequeo.chequeo === "roto").map((h) => `«${h.titulo ?? "Sin título"}»`);
  const partes = [`${cuantos("bien")} bien`, rotos.length ? `${rotos.length} ${rotos.length === 1 ? "roto" : "rotos"} (${rotos.join(", ")})` : "", cuantos("sin-respuesta") ? `${cuantos("sin-respuesta")} sin respuesta` : "", cuantos("sin-chequear") ? `${cuantos("sin-chequear")} sin chequear` : ""];
  return `Se ${hechos.length === 1 ? "chequeó 1 link" : `chequearon ${hechos.length} links`}: ${partes.filter(Boolean).join(", ")}.`;
}

/** Chequea lo vencido, de a `A_LA_VEZ`, y guarda cada resultado en su material. */
export async function chequearLinks({ db = base, pedir, ahora = new Date() }: { db?: PrismaClient; pedir: Pedir; ahora?: Date }): Promise<ResultadoDeTarea> {
  const limite = new Date(ahora.getTime() - DIAS_ENTRE_CHEQUEOS * 24 * 60 * 60 * 1000);
  const vencidos: Vencido[] = await db.material.findMany({
    where: { publicado: true, OR: [{ chequeoEn: null }, { chequeoEn: { lt: limite } }] },
    orderBy: [{ chequeoEn: { sort: "asc", nulls: "first" } }, { creadoEn: "asc" }],
    take: POR_CORRIDA,
    select: { id: true, titulo: true, url: true, doi: true },
  });
  const empezo = Date.now();
  const hechos: Array<{ titulo: string | null; chequeo: Chequeo }> = [];
  for (let i = 0; i < vencidos.length && Date.now() - empezo < SIN_EMPEZAR_DESPUES_MS; i += A_LA_VEZ) {
    const tanda = vencidos.slice(i, i + A_LA_VEZ);
    const chequeos = await Promise.all(tanda.map((m) => chequearLink(m, pedir)));
    await Promise.all(tanda.map((m, j) => db.material.update({ where: { id: m.id }, data: { chequeoEn: new Date(), chequeo: chequeos[j].chequeo, chequeoDetalle: chequeos[j].detalle } })));
    tanda.forEach((m, j) => hechos.push({ titulo: m.titulo, chequeo: chequeos[j] }));
  }
  return { ok: true, detalle: resumenDeLaCorrida(hechos) };
}

export const saludDeLinks: Tarea = {
  clave: "salud-de-links",
  nombre: "Salud de los links de la Biblioteca",
  correr: async () => {
    const { agente } = await presentacion();
    return chequearLinks({ pedir: (url, o) => pedirProtegido(url, { ...o, agente }) });
  },
};
