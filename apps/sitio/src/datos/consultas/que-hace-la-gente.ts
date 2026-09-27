import type { Evento } from "@/config/metricas";
import { sumasDe, type SumaDeContador } from "@/datos/contadores";
import { CANALES, type Canal } from "@/lib/metricas/canales";
import { diaISO, sumarDias, variacion, type Periodo } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";

// Lo que lee Métricas › Qué hace la gente (SPEC de work/metricas-completas/
// §6.3): los contadores propios, que cuentan en el momento. El período
// termina hoy, como los CV del Inicio: un cero es un cero.

const PASOS_DEL_CV = ["cv-vio", "cv-empezo", "cv-envio"] as const satisfies readonly Evento[];

export type PasosDelCV = Record<(typeof PASOS_DEL_CV)[number], number>;

export type QueHaceLaGente = {
  desde: Dia;
  hasta: Dia;
  /** El camino del CV por canal, en el orden de `CANALES`, y el total. */
  cv: { porCanal: Array<{ canal: Canal } & PasosDelCV>; total: PasosDelCV };
  contactos: { total: number; variacion: string; porCanal: Array<{ canal: Canal; cuenta: number }> };
};

const suma = (sumas: readonly SumaDeContador[], evento: Evento, canal?: Canal) =>
  sumas.filter((s) => s.evento === evento && (canal === undefined || s.canal === canal)).reduce((t, s) => t + s.cuenta, 0);

const pasos = (sumas: readonly SumaDeContador[], canal?: Canal): PasosDelCV => ({
  "cv-vio": suma(sumas, "cv-vio", canal),
  "cv-empezo": suma(sumas, "cv-empezo", canal),
  "cv-envio": suma(sumas, "cv-envio", canal),
});

export async function queHaceLaGente(periodo: Periodo, hoy: Date = new Date()): Promise<QueHaceLaGente> {
  const hasta = diaISO(hoy);
  const desde = sumarDias(hasta, -(periodo - 1));
  const eventos: Evento[] = [...PASOS_DEL_CV, "contacto-envio"];
  // El período y el anterior no dependen uno del otro: van juntos.
  const [actual, anterior] = await Promise.all([
    sumasDe({ eventos, desde, hasta }),
    sumasDe({ eventos: ["contacto-envio"], desde: sumarDias(desde, -periodo), hasta: sumarDias(desde, -1) }),
  ]);
  const contactos = suma(actual, "contacto-envio");
  return {
    desde,
    hasta,
    cv: { porCanal: CANALES.map((canal) => ({ canal, ...pasos(actual, canal) })), total: pasos(actual) },
    contactos: {
      total: contactos,
      variacion: variacion(contactos, suma(anterior, "contacto-envio")),
      porCanal: CANALES.map((canal) => ({ canal, cuenta: suma(actual, "contacto-envio", canal) })),
    },
  };
}
