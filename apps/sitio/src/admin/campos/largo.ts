import type { Recomendado } from "@/lib/contenido/descripcion";

// El largo de un texto contra su tope duro (`maxLength`) y, si lo tiene,
// contra su largo recomendado. Lo comparten `TextoCorto` y `Parrafo`.

export type Largo = {
  /** Por encima del tope: solo con un valor guardado antes de bajar el máximo, porque el control no deja escribir de más. Es un aviso de un dato viejo, no el límite. */
  excedido: boolean;
  /** Al tope o más: lo normal al escribir (`maxLength` no deja pasarse). Pinta el contador y dispara el anuncio. */
  alTope: boolean;
  /** Pasado lo recomendado (el largo de Google): un aviso, no un error. */
  pasado: boolean;
  /** El contador se ve desde el 80 % del máximo —antes es ruido— o siempre si hay un recomendado; para el lector de pantalla está siempre. */
  visible: boolean;
  /** Contra qué se cuenta: lo recomendado si lo hay, el tope si no. */
  contra: number;
};

export function estadoDelLargo(largo: number, maximo: number, recomendado?: Recomendado): Largo {
  return {
    excedido: largo > maximo,
    alTope: largo >= maximo,
    pasado: recomendado !== undefined && largo > recomendado.largo,
    visible: recomendado !== undefined || largo >= maximo * 0.8,
    contra: recomendado?.largo ?? maximo,
  };
}

/** Lo que describe al campo, en el orden en que se lee: la ayuda, el contador, el aviso de largo y el error. */
export function idsQueDescriben(nombre: string, { ayuda, largo, error }: { ayuda?: string; largo: Largo; error?: string }): string {
  return [ayuda ? `${nombre}-ayuda` : "", `${nombre}-contador`, largo.pasado ? `${nombre}-recomendado` : "", error ? `${nombre}-error` : ""]
    .filter(Boolean)
    .join(" ");
}
