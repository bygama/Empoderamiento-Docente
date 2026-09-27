import Image from "next/image";
import type { AliadoDelSitio } from "@/features/aliados/contenido/modelo";

/**
 * Un logo de la tira de aliados, el mismo en el pie, el Inicio y Qué hacemos.
 * El alto lo manda la clase de quien lo usa (el tamaño del aliado, y cómo se
 * pinta en cada tira) y el ancho va `auto`: las medidas de la foto solo
 * reservan la proporción. Un SVG va sin optimizar: el optimizador de Next no
 * procesa SVG salvo que se le baje la guardia, y un logo vectorial no lo
 * necesita. Con URL, el logo es un link a su sitio, en otra pestaña, como
 * las redes del pie; su nombre es el alt del logo.
 */
export function LogoDeAliado({ aliado, className }: { aliado: AliadoDelSitio; className: string }) {
  const logo = (
    <Image
      src={aliado.src}
      alt={aliado.alt}
      width={aliado.ancho}
      height={aliado.alto}
      unoptimized={aliado.vectorial}
      draggable={false}
      className={className}
    />
  );
  if (!aliado.url) return logo;
  return (
    <a
      href={aliado.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:outline-verde-concepto inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {logo}
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}
