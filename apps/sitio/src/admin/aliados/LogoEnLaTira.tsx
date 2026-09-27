import Image from "next/image";

/**
 * Un logo como se ve en la tira del sitio (DESIGN.md §11, «Logo de aliado»):
 * en blanco sobre `azul-principal`, con el mismo filtro que la tira, a la
 * altura de su tamaño. Así un logo blanco se ve (sobre blanco desaparecería)
 * y quien edita ve lo que va a publicar. La caja no se estira: el ancho lo da
 * el logo.
 */
export function LogoEnLaTira({ src, alt, alto, className = "" }: { src: string; alt: string; alto: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-azul-principal px-3 py-2 dark:bg-gris-fondo ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={240}
          height={96}
          unoptimized={src.endsWith(".svg")}
          className={`${alto} w-auto max-w-40 object-contain opacity-90 [filter:brightness(0)_invert(1)]`}
        />
      ) : (
        // En el oscuro `azul-claro` es oscuro: ahí el texto va en `azul-principal`, que se invierte a claro.
        <span className={`${alto} inline-flex items-center text-admin-meta text-azul-claro dark:text-azul-principal`}>Sin logo</span>
      )}
    </span>
  );
}
