import { PLAN_DE_VERCEL } from "@/config/metricas";
import { base } from "@/datos/cliente";
import { hayVariablesDeMetricas, SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { nombresDeRutas } from "./nombres-de-rutas";
import { rutasDelSitio } from "./rutas-del-sitio";

// Lo que lee Métricas › Links para compartir (SPEC de work/metricas-completas/
// §6.4): los links con sus cifras de todo el tiempo, y las páginas a las que
// puede llevar uno nuevo.

export type EnlaceConCifras = {
  id: string;
  codigo: string;
  /** El link entero, para copiar: https://…/l/<codigo>. */
  link: string;
  nombre: string;
  destino: string;
  destinoNombre: string | null;
  canal: string;
  creadoEn: string;
  creadoPor: string;
  /** Los de `/l/`, contados en el servidor. */
  clics: number;
  /** Las visitas que Vercel contó con su `utm_campaign`; `null` cuando no se miden (`sinVisitasPorque`). */
  visitas: number | null;
  /** Los CV que se mandaron en la carga en que se llegó por el link. */
  cv: number;
};

/** Cada link, del más nuevo al más viejo, con sus clics, visitas y CV. */
export async function enlacesConCifras(): Promise<EnlaceConCifras[]> {
  const enlaces = await base.enlace.findMany({ orderBy: { creadoEn: "desc" } });
  if (!enlaces.length) return [];
  const ids = enlaces.map((e) => e.id);
  // Cuatro lecturas que no dependen una de la otra: van juntas.
  const [clics, cv, visitas, nombres] = await Promise.all([
    base.contador.groupBy({ by: ["clave"], where: { evento: "enlace-clic", clave: { in: ids } }, _sum: { cuenta: true } }),
    base.contador.groupBy({ by: ["clave"], where: { evento: "cv-envio", clave: { in: ids } }, _sum: { cuenta: true } }),
    base.metricaDiaria.groupBy({ by: ["valor"], where: { dimension: "campana", agrupado: false, valor: { in: enlaces.map((e) => e.codigo) } }, _sum: { visitantes: true } }),
    nombresDeRutas(enlaces.map((e) => e.destino)),
  ]);
  const de = <T extends { _sum: Record<string, number | null> }>(filas: T[], clave: (f: T) => string, id: string, campo: string) =>
    filas.find((f) => clave(f) === id)?._sum[campo] ?? 0;
  const conVercel = sinVisitasPorque() === null;
  return enlaces.map((e) => ({
    id: e.id,
    codigo: e.codigo,
    link: `${urlDelSitio()}/l/${e.codigo}`,
    nombre: e.nombre,
    destino: e.destino,
    destinoNombre: nombres.get(e.destino) ?? null,
    canal: e.canal,
    creadoEn: e.creadoEn.toISOString(),
    creadoPor: e.creadoPor,
    clics: de(clics, (f) => f.clave, e.id, "cuenta"),
    visitas: conVercel ? de(visitas, (f) => f.valor, e.codigo, "visitantes") : null,
    cv: de(cv, (f) => f.clave, e.id, "cuenta"),
  }));
}

/**
 * Por qué los links no traen visitas, o `null` si las traen. La pantalla lo
 * dice una vez, arriba de la lista, y no en cada fila. En Hobby, Vercel no
 * cuenta por UTM: prenderlas es cambiar `PLAN_DE_VERCEL` si ED cambia de plan.
 */
export function sinVisitasPorque(): string | null {
  if (!PLAN_DE_VERCEL.utm) return "Vercel no da de dónde vienen las visitas en el plan gratuito: acá se ven los clics y los CV.";
  if (!hayVariablesDeMetricas()) return `${SIN_VARIABLES_DE_METRICAS}: por ahora, acá se ven los clics y los CV.`;
  return null;
}

/** Las páginas a las que puede llevar un link: las que el sitio muestra hoy, por su nombre. */
export async function destinosPosibles(): Promise<Array<{ valor: string; etiqueta: string }>> {
  const rutas = await rutasDelSitio();
  const nombres = await nombresDeRutas(rutas);
  return rutas.map((ruta) => ({ valor: ruta, etiqueta: nombres.get(ruta) ?? ruta }));
}

/** El comienzo de un link corto, para mostrar cómo va a quedar: https://…/l/ */
export function baseDeLosLinks(): string {
  return `${urlDelSitio()}/l/`;
}
