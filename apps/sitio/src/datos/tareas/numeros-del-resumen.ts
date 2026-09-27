import type { NumeroDelResumen } from "@/correos/resumen-semanal";
import { sumasDe, totalDe } from "@/datos/contadores";
import { estadoDeMetricas, tarjetaDe } from "@/datos/consultas/metricas";
import { nombresDeRutas } from "@/datos/consultas/nombres-de-rutas";
import { base } from "@/datos/cliente";
import { numerosPara, type NumeroDeLaSemana } from "@/datos/inicio/esta-semana";
import { SIN_SEARCH_CONSOLE } from "@/datos/inicio/lecturas-de-la-semana";
import { sumarPorValor } from "@/lib/metricas/agregar";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { diaISO, fechaUTC, sumarDias, variacion } from "@/lib/metricas/periodos";

// Los números del resumen semanal (SPEC de work/metricas-completas/ §8): los
// de «Esta semana» del Inicio, con el mismo corte por rol (quien edita no
// recibe los CV), más las vistas y los contactos enviados.

const SEMANA = 7;

/** Las vistas de la ventana de 7 días de la copia, contra la anterior; sin las variables, lo dice como los visitantes. */
async function vistas(): Promise<NumeroDelResumen> {
  const [estado, ventana] = await Promise.all([estadoDeMetricas(), tarjetaDe(SEMANA)]);
  if (!estado.hayVariables) return { etiqueta: "Vistas", valor: null, nota: SIN_VARIABLES_DE_METRICAS };
  return { etiqueta: "Vistas", valor: ventana?.vistas ?? null, variacion: ventana?.variacionVistas };
}

/** Los contactos de los últimos 7 días, contra los 7 anteriores: los contadores cuentan en el momento. */
async function contactos(hoy: Date): Promise<NumeroDelResumen> {
  const hasta = diaISO(hoy);
  const desde = sumarDias(hasta, -(SEMANA - 1));
  const [actual, anterior] = await Promise.all([
    sumasDe({ eventos: ["contacto-envio"], desde, hasta }),
    sumasDe({ eventos: ["contacto-envio"], desde: sumarDias(desde, -SEMANA), hasta: sumarDias(desde, -1) }),
  ]);
  const valor = totalDe(actual, "contacto-envio");
  return { etiqueta: "Contactos enviados", valor, variacion: variacion(valor, totalDe(anterior, "contacto-envio")) };
}

const delInicio = (n: NumeroDeLaSemana | undefined): NumeroDelResumen | null => (n ? { etiqueta: n.etiqueta, valor: n.valor, variacion: n.variacion, nota: n.nota } : null);

/**
 * Los números para ese rol, en el orden del correo. Lo que no tiene datos y
 * no dice por qué (un contador que todavía no cuenta) no va, y los clics
 * de Google tampoco mientras Search Console no esté conectado.
 */
export async function numerosDelResumen(rol: unknown, hoy: Date = new Date()): Promise<NumeroDelResumen[]> {
  const [inicio, deVistas, deContactos] = await Promise.all([numerosPara(rol), vistas(), contactos(hoy)]);
  const de = (clave: NumeroDeLaSemana["clave"]) => delInicio(inicio.find((n) => n.clave === clave));
  const todos = [de("visitantes"), deVistas, de("clics-de-google"), deContactos, de("cv-recibidos"), de("materiales-consultados")];
  return todos.filter((n): n is NumeroDelResumen => n !== null && (n.valor !== null || (n.nota !== undefined && n.nota !== SIN_SEARCH_CONSOLE)));
}

/** La página más vista de los últimos 7 días copiados, con su nombre; `null` sin datos. */
export async function paginaMasVista(): Promise<{ nombre: string; vistas: number } | null> {
  const ultima = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" }, select: { fecha: true } });
  if (!ultima) return null;
  const hasta = diaISO(ultima.fecha);
  const filas = await base.metricaDiaria.findMany({
    where: { dimension: "pagina", fecha: { gte: fechaUTC(sumarDias(hasta, -(SEMANA - 1))), lte: fechaUTC(hasta) } },
    select: { valor: true, agrupado: true, vistas: true, visitantes: true },
  });
  const [primera] = sumarPorValor(filas, "vistas").valores;
  if (!primera) return null;
  const nombres = await nombresDeRutas([primera.valor]);
  return { nombre: nombres.get(primera.valor) ?? primera.valor, vistas: primera.total };
}
