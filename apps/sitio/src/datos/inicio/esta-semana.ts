import type { Capacidad } from "@ed/auth";
import { estadoDeBusquedas, totalDeBusquedas } from "@/datos/consultas/busquedas";
import { tarjetaDe } from "@/datos/consultas/metricas";
import { sumarDias, variacion } from "@/lib/metricas/periodos";
import { enOrden, leerAisladas, visiblesPara } from "./registro";

// «Esta semana» en el Inicio: cada número, los últimos 7 días con datos de su
// fuente contra los 7 anteriores. Lo que todavía no existe o no tiene datos
// vuelve `null` y se dibuja «—»: un cero es un cero solo si la fuente existe y
// contó cero.

/** Los números, en el orden en que se ven. Un módulo que llega conecta el suyo en `NUMEROS`. */
export const CLAVES_DE_NUMEROS = ["visitantes", "clics-de-google", "cv-recibidos", "materiales-consultados"] as const;
export type ClaveDeNumero = (typeof CLAVES_DE_NUMEROS)[number];

/** Un número de la semana y cómo le fue contra la anterior («+12 %», «igual»…). */
export type DeLaSemana = { valor: number; variacion: string };

type DefinicionDeNumero = { etiqueta: string; capacidad: Capacidad; leer: () => Promise<DeLaSemana | null> };

const DIAS = 7;

/** La ventana de 7 días de la copia de Vercel: el mismo número que Métricas › Resumen. */
async function visitantes(): Promise<DeLaSemana | null> {
  const ventana = await tarjetaDe(DIAS);
  return ventana ? { valor: ventana.visitantes, variacion: ventana.variacionVisitantes } : null;
}

/** Los 7 días que terminan en el último copiado de Search Console, que llega con 2 o 3 días de atraso. */
async function clicsDeGoogle(): Promise<DeLaSemana | null> {
  const { hastaDia } = await estadoDeBusquedas();
  if (!hastaDia) return null;
  const desde = sumarDias(hastaDia, -(DIAS - 1));
  const hastaAnterior = sumarDias(desde, -1);
  const [actual, anterior] = await Promise.all([totalDeBusquedas(desde, hastaDia), totalDeBusquedas(sumarDias(hastaAnterior, -(DIAS - 1)), hastaAnterior)]);
  const clics = actual?.clics ?? 0;
  return { valor: clics, variacion: variacion(clics, anterior ? anterior.clics : null) };
}

/** Hasta que llegue su módulo: «—», nunca un cero. */
const todaviaNo = async (): Promise<DeLaSemana | null> => null;

const NUMEROS: Record<ClaveDeNumero, DefinicionDeNumero> = {
  visitantes: { etiqueta: "Visitantes", capacidad: "verMetricas", leer: visitantes },
  "clics-de-google": { etiqueta: "Clics desde Google", capacidad: "verMetricas", leer: clicsDeGoogle },
  // Lo conecta la lane 7, mensajes, con los CV que lleguen por el formulario.
  "cv-recibidos": { etiqueta: "CV recibidos", capacidad: "verCV", leer: todaviaNo },
  // Lo conecta la lane 11, metricas-completas, con los contadores de Acciones.
  "materiales-consultados": { etiqueta: "Materiales consultados", capacidad: "verMetricas", leer: todaviaNo },
};

export type NumeroDeLaSemana = {
  clave: ClaveDeNumero;
  etiqueta: string;
  /** `null`: todavía no hay datos, o no se pudo leer (`fallo`). */
  valor: number | null;
  variacion?: string;
  fallo: boolean;
};

/** Los números de la semana que ese rol puede ver: a quien edita no le aparecen los CV. */
export async function numerosPara(rol: unknown): Promise<NumeroDeLaSemana[]> {
  const leidos = await leerAisladas(visiblesPara(enOrden(NUMEROS), rol), (n) => n.leer());
  return leidos.map(({ entrada: n, ...lectura }) => {
    const comun = { clave: n.clave, etiqueta: n.etiqueta };
    if ("fallo" in lectura) return { ...comun, valor: null, fallo: true };
    return { ...comun, valor: lectura.valor?.valor ?? null, variacion: lectura.valor?.variacion, fallo: false };
  });
}
