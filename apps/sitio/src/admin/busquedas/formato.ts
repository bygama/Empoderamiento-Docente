import type { FilaDeBusquedas } from "@/datos/consultas/busquedas";
import type { Casi } from "@/lib/busquedas/lecturas";

// Cómo se dicen los números de Búsquedas en la pantalla, en llano.

const numero = new Intl.NumberFormat("es-AR");
const unDecimal = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });

const plural = (n: number, uno: string, varios: string) => `${numero.format(n)} ${n === 1 ? uno : varios}`;

export const posicionLegible = (posicion: number) => unDecimal.format(posicion);

export function diaLegible(dia: string): string {
  return fechaLarga.format(new Date(`${dia}T00:00:00.000Z`));
}

/** «12 clics, 340 impresiones, puesto 9,4». */
export function cifras({ clics, impresiones, posicion }: Pick<FilaDeBusquedas, "clics" | "impresiones" | "posicion">): string {
  const partes = [plural(clics, "clic", "clics"), plural(impresiones, "impresión", "impresiones")];
  if (posicion !== null) partes.push(`puesto ${posicionLegible(posicion)}`);
  return partes.join(", ");
}

/** Por qué una búsqueda está en «Casi nos encuentran», y qué cambiaría. */
export function motivo(casi: Casi): string {
  if (casi.razon === "pocos-clics") {
    const clics = casi.clics === 0 ? "nadie hizo clic" : `tuvo ${plural(casi.clics, "clic", "clics")}`;
    return `Se vio ${plural(casi.impresiones, "vez", "veces")} y ${clics}: el título o la descripción de la página no convencen.`;
  }
  const puesto = Math.round(casi.posicion);
  return puesto <= 10
    ? `Aparece en el puesto ${puesto}, al pie de la primera página: con un empujón sube a donde se mira.`
    : `Aparece en el puesto ${puesto}, en la segunda página: con un empujón entra a la primera.`;
}

/** La ruta de una URL de Google, sin el dominio: `/novedades`. La raíz sola no se entiende: se nombra. */
export function rutaDe(url: string): string {
  try {
    const ruta = decodeURI(new URL(url).pathname);
    return ruta === "/" ? "/ (la portada del sitio)" : ruta;
  } catch {
    return url;
  }
}
