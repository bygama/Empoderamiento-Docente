// Vocabulario de la copia diaria. Sin dominio de ED: sirve para cualquier
// sitio medido con Web Analytics.
export type Dimension = "total" | "pagina" | "pais" | "referido" | "dispositivo";

export const DIMENSIONES: readonly Dimension[] = ["total", "pagina", "pais", "referido", "dispositivo"];

/** Un día `YYYY-MM-DD`, siempre UTC, como agrupa la API. */
export type Dia = string;

export type Rango = { desde: Dia; hasta: Dia };

export type FilaDiaria = {
  fecha: Dia;
  dimension: Dimension;
  valor: string; // "" en total y en la fila «el resto»
  agrupado: boolean;
  vistas: number;
  visitantes: number;
};

export type Ventana = { fechaFin: Dia; dias: 7 | 30; vistas: number; visitantes: number };
