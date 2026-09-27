import type { Capacidad } from "@ed/auth";
import { clicsDeGoogle, visitantes, type LecturaDeLaSemana } from "./lecturas-de-la-semana";
import { enOrden, leerAisladas, visiblesPara } from "./registro";

// «Esta semana» en el Inicio: cada número, los últimos 7 días con datos de su
// fuente contra los 7 anteriores. Lo que todavía no existe o no tiene datos
// se dibuja «—»: un cero es un cero solo si la fuente existe y contó cero.

/** Los números, en el orden en que se ven. Un módulo que llega conecta el suyo en `NUMEROS`. */
export const CLAVES_DE_NUMEROS = ["visitantes", "clics-de-google", "cv-recibidos", "materiales-consultados"] as const;
export type ClaveDeNumero = (typeof CLAVES_DE_NUMEROS)[number];

type DefinicionDeNumero = { etiqueta: string; capacidad: Capacidad; leer: () => Promise<LecturaDeLaSemana> };

/** Hasta que llegue su módulo: «—», nunca un cero. */
const todaviaNo = async (): Promise<LecturaDeLaSemana> => null;

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
  /** `null`: sin datos, por el motivo de `nota` si lo hay. */
  valor: number | null;
  variacion?: string;
  /** Lo que va abajo en lugar de la comparación: por qué no hay número, o que no se pudo leer. */
  nota?: string;
};

/** Los números de la semana que ese rol puede ver: a quien edita no le aparecen los CV. */
export async function numerosPara(rol: unknown): Promise<NumeroDeLaSemana[]> {
  const leidos = await leerAisladas(visiblesPara(enOrden(NUMEROS), rol), (n) => n.leer());
  return leidos.map(({ entrada: n, ...lectura }) => {
    const comun = { clave: n.clave, etiqueta: n.etiqueta };
    if ("fallo" in lectura) return { ...comun, valor: null, nota: "No se pudo leer" };
    const leido = lectura.valor;
    if (leido === null) return { ...comun, valor: null };
    if ("motivo" in leido) return { ...comun, valor: null, nota: leido.motivo };
    return { ...comun, valor: leido.valor, variacion: leido.variacion };
  });
}
