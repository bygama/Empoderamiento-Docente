import Image from "next/image";

/** Un png o un SVG puede tener transparencia: casi siempre es un logo, y va entero. */
const puedeSerUnLogo = (tipo: string) => tipo === "image/png" || tipo === "image/svg+xml";

/**
 * Una foto de la biblioteca en una caja 4/3 sobre `gris-fondo` (DESIGN.md
 * §11, «Grilla de fotos»): recortada al centro si es una foto, entera si
 * puede ser un logo. Es decorativa (alt vacío): lo que es va escrito al lado.
 * Un SVG va sin optimizar, como en la tira de aliados.
 */
export function MiniaturaDeFoto({ src, tipo, sizes, className = "" }: { src: string; tipo: string; sizes: string; className?: string }) {
  return (
    <div className={`relative aspect-4/3 overflow-hidden rounded-lg bg-gris-fondo ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        unoptimized={tipo === "image/svg+xml"}
        className={puedeSerUnLogo(tipo) ? "object-contain p-4" : "object-cover"}
      />
    </div>
  );
}
