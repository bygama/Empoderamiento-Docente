import type { Bandeja } from "@/config/mensajes";
import { siteConfig } from "@/config/site";

// Cómo se dicen en la ficha el peso de un archivo y el asunto de la respuesta.

const NUMERO = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

/** «193 bytes», «48 KB», «1,2 MB». */
export function peso(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${NUMERO.format(bytes / (1024 * 1024))} MB`;
}

/** El `mailto:` de «Responder»: la dirección y el asunto; el texto lo escribe cada persona en su programa de correo. */
export function mailtoDeRespuesta(bandeja: Bandeja, correo: string, tema: string | null): string {
  const asunto = bandeja === "cv" ? `Tu CV en ${siteConfig.name}` : tema ? `Tu consulta sobre ${tema}` : `Tu consulta a ${siteConfig.name}`;
  return `mailto:${correo}?subject=${encodeURIComponent(asunto)}`;
}
