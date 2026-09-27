import { puede } from "@ed/auth";
import type { Evento } from "@/config/metricas";
import type { NumeroDelResumen } from "@/correos/resumen-semanal";
import { base } from "@/datos/cliente";
import { sumasDe, totalDe } from "@/datos/contadores";
import { nombresDeRutas } from "@/datos/consultas/nombres-de-rutas";
import { cvRecibidos } from "@/datos/inicio/de-los-mensajes";
import { sumarPorValor } from "@/lib/metricas/agregar";
import { hayVariablesDeMetricas, SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { fechaUTC, sumarDias, variacion } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";

// Los números del resumen semanal (SPEC de work/metricas-completas/ §8).
// **Todos cuentan la misma semana**, de lunes a domingo —los siete días antes
// del lunes de Chile en que sale—, cada fuente en sus días UTC como el resto
// de Métricas, contra la semana anterior. Quien edita no recibe los CV. Los
// clics de Google no van: Search Console llega con 2 o 3 días de atraso, y el
// lunes a la madrugada la semana cerrada casi nunca los tiene.

export type Semana = { desde: Dia; hasta: Dia };

/** Los siete días de lunes a domingo que terminan el día antes de `lunes`. */
export function semanaAntesDe(lunes: Dia): Semana {
  return { desde: sumarDias(lunes, -7), hasta: sumarDias(lunes, -1) };
}

const anterior = (s: Semana): Semana => ({ desde: sumarDias(s.desde, -7), hasta: sumarDias(s.hasta, -7) });
const contra = (etiqueta: string, actual: number, previo: number | null): NumeroDelResumen => ({ etiqueta, valor: actual, variacion: variacion(actual, previo) });
const sinNumero = (etiquetas: string[], nota: string): NumeroDelResumen[] => etiquetas.map((etiqueta) => ({ etiqueta, valor: null, nota }));

/** Visitantes y vistas de la ventana de 7 días que termina el domingo, contra la del domingo anterior. */
async function deLasVisitas(semana: Semana): Promise<NumeroDelResumen[]> {
  if (!hayVariablesDeMetricas()) return sinNumero(["Visitantes", "Vistas"], SIN_VARIABLES_DE_METRICAS);
  const ventana = (fin: Dia) => base.metricaVentana.findUnique({ where: { fechaFin_dias: { fechaFin: fechaUTC(fin), dias: 7 } } });
  const [esta, previa] = await Promise.all([ventana(semana.hasta), ventana(anterior(semana).hasta)]);
  if (!esta) return sinNumero(["Visitantes", "Vistas"], "La copia de las visitas todavía no llegó al domingo");
  return [contra("Visitantes", esta.visitantes, previa?.visitantes ?? null), contra("Vistas", esta.vistas, previa?.vistas ?? null)];
}

async function deUnContador(evento: Evento, etiqueta: string, semana: Semana): Promise<NumeroDelResumen> {
  const [esta, antes] = await Promise.all([sumasDe({ eventos: [evento], ...semana }), sumasDe({ eventos: [evento], ...anterior(semana) })]);
  return contra(etiqueta, totalDe(esta, evento), totalDe(antes, evento));
}

/** Los CV que llegaron entre el lunes a las 0 y el lunes siguiente a las 0, en UTC, como los demás días. */
async function deLosCV(semana: Semana, contar: typeof cvRecibidos): Promise<NumeroDelResumen> {
  const entre = (s: Semana) => [fechaUTC(s.desde), fechaUTC(sumarDias(s.hasta, 1))] as const;
  const [esta, antes] = await Promise.all([contar(...entre(semana)), contar(...entre(anterior(semana)))]);
  return contra("CV recibidos", esta, antes);
}

/**
 * Los números para ese rol y esa semana, en el orden del correo. Cómo contar
 * los CV se puede pasar, para probarlo sin depender de los mensajes de la base.
 */
export async function numerosDelResumen(rol: unknown, semana: Semana, { contarCV = cvRecibidos }: { contarCV?: typeof cvRecibidos } = {}): Promise<NumeroDelResumen[]> {
  const [vercel, contactos, cv, materiales] = await Promise.all([
    deLasVisitas(semana),
    deUnContador("contacto-envio", "Contactos enviados", semana),
    puede(rol, "verCV") ? deLosCV(semana, contarCV) : Promise.resolve(null),
    deUnContador("material-consultado", "Materiales consultados", semana),
  ]);
  return [...vercel, contactos, ...(cv ? [cv] : []), materiales];
}

/** La página más vista de la semana, con su nombre; `null` sin datos. */
export async function paginaMasVista(semana: Semana): Promise<{ nombre: string; vistas: number } | null> {
  const filas = await base.metricaDiaria.findMany({
    where: { dimension: "pagina", fecha: { gte: fechaUTC(semana.desde), lte: fechaUTC(semana.hasta) } },
    select: { valor: true, agrupado: true, vistas: true, visitantes: true },
  });
  const [primera] = sumarPorValor(filas, "vistas").valores;
  if (!primera) return null;
  const nombres = await nombresDeRutas([primera.valor]);
  return { nombre: nombres.get(primera.valor) ?? primera.valor, vistas: primera.total };
}
