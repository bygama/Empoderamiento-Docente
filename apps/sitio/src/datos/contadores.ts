import { EVENTOS, type Evento } from "@/config/metricas";
import type { Canal } from "@/lib/metricas/canales";
import { diaISO, fechaUTC } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";
import { base } from "./cliente";

/**
 * Lo que cuenta el sitio mismo (tabla `contadores`, ADR-0017): un evento raro
 * sumado por día, por canal y por clave. **La única puerta para escribirla.**
 * Nada de la persona: ni IP, ni navegador, ni la hora; el día es UTC.
 */

/** El canal de un evento que lo lleva; `""` en los que no (`EVENTOS[…].conCanal`). */
export type CanalGuardado = Canal | "";

/**
 * Suma uno a ese evento en el día de `ahora`. **Atómico, a propósito:** un
 * solo `INSERT … ON CONFLICT DO UPDATE`; con leer y escribir sueltos, dos a la
 * vez leerían el mismo número y uno se perdería. Un evento sin canal guarda
 * `""` aunque le llegue uno.
 */
export async function sumarContador({
  evento,
  canal = "",
  clave = "",
  ahora = new Date(),
}: {
  evento: Evento;
  canal?: CanalGuardado;
  clave?: string;
  ahora?: Date;
}): Promise<void> {
  const guardado = EVENTOS[evento].conCanal ? canal : "";
  await base.$executeRaw`
    INSERT INTO contadores (fecha, evento, canal, clave, cuenta) VALUES (${diaISO(ahora)}::date, ${evento}, ${guardado}, ${clave}, 1)
    ON CONFLICT (fecha, evento, canal, clave) DO UPDATE SET cuenta = contadores.cuenta + 1`;
}

export type SumaDeContador = { evento: Evento; canal: string; clave: string; cuenta: number };

/** Cuánto sumó cada evento, canal y clave entre `desde` y `hasta`, los dos incluidos. */
export async function sumasDe({ eventos, desde, hasta }: { eventos: readonly Evento[]; desde: Dia; hasta: Dia }): Promise<SumaDeContador[]> {
  const filas = await base.contador.groupBy({
    by: ["evento", "canal", "clave"],
    where: { evento: { in: [...eventos] }, fecha: { gte: fechaUTC(desde), lte: fechaUTC(hasta) } },
    _sum: { cuenta: true },
  });
  return filas.map((f) => ({ evento: f.evento as Evento, canal: f.canal, clave: f.clave, cuenta: f._sum.cuenta ?? 0 }));
}

/** El total de un evento entre dos días, sumando todos sus canales y claves. */
export function totalDe(sumas: readonly SumaDeContador[], evento: Evento, clave?: string): number {
  return sumas.filter((s) => s.evento === evento && (clave === undefined || s.clave === clave)).reduce((total, s) => total + s.cuenta, 0);
}
