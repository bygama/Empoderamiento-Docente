import { armarCorreo, type Contenido } from "./plantilla";

/** Un número del resumen: `null` sin datos, con su nota si se sabe por qué. */
export type NumeroDelResumen = { etiqueta: string; valor: number | null; variacion?: string; nota?: string };

const numero = new Intl.NumberFormat("es-AR");

/** «Visitantes: 412 (+12 % contra la semana anterior)». */
function renglon({ etiqueta, valor, variacion, nota }: NumeroDelResumen): string {
  if (valor === null) return `${etiqueta}: — (${nota ?? "todavía no hay datos"})`;
  const contra = !variacion || variacion === "sin datos previos" ? "sin datos de la semana anterior" : variacion === "igual" ? "igual que la semana anterior" : `${variacion} contra la semana anterior`;
  return `${etiqueta}: ${numero.format(valor)} (${contra})`;
}

/**
 * El resumen semanal de las métricas (SPEC de work/metricas-completas/ §8):
 * unos pocos números de la semana contra la anterior, la página más vista y
 * el link a Métricas. Solo sumas: nada de ninguna persona. Quien lo arma ya
 * filtró los números por el rol de quien lo recibe.
 */
export function resumenSemanal({
  nombre,
  semana,
  numeros,
  paginaMasVista,
  enlace,
}: {
  nombre?: string;
  /** «del 21 al 27 de septiembre». */
  semana: string;
  numeros: readonly NumeroDelResumen[];
  paginaMasVista: { nombre: string; vistas: number } | null;
  enlace: string;
}): Contenido {
  return armarCorreo({
    asunto: `El sitio en la semana ${semana}`,
    nombre,
    antes: [
      `Así le fue al sitio en la semana ${semana}:`,
      ...numeros.map(renglon),
      ...(paginaMasVista ? [`La página más vista fue ${paginaMasVista.nombre}, con ${numero.format(paginaMasVista.vistas)} vistas.`] : []),
    ],
    boton: { texto: "Ver las métricas", enlace },
    despues: ["Te llega porque activaste el resumen semanal. Lo apagás en Mi cuenta, en «Avisos»."],
  });
}
