// Vocabulario de la copia diaria de Search Console. Sin dominio de ED: sirve
// para cualquier propiedad de Search Console.

export type DimensionDeBusqueda = "total" | "consulta" | "pagina" | "pais";

/** Un día `YYYY-MM-DD`, como lo cuenta Google: en hora del Pacífico. */
export type Dia = string;

export type Rango = { desde: Dia; hasta: Dia };

export type FilaDeBusqueda = {
  fecha: Dia;
  dimension: DimensionDeBusqueda;
  /** "" en el total · lo que se buscó · la URL · el país en ISO alfa-3, en minúscula. */
  valor: string;
  clics: number;
  impresiones: number;
  /**
   * La posición promedio de Google por sus impresiones. Google promedia por
   * impresión, así que un agregado se lee `Σ sumaDePosiciones / Σ impresiones`.
   */
  sumaDePosiciones: number;
};

export class ErrorDeBusquedas extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeBusquedas";
  }
}
