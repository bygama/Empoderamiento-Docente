import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { HOME_LINK } from "@/config/nav";
import { BotonCerrar } from "./BotonCerrar";

// La caja de la píldora del Header —margen de 1rem, borde de 1px, `px-4 py-3`,
// logo `h-11`—, copiada con sus mismas utilidades. Si cambia la píldora, cambia
// acá. La comparten la barra y el hueco que la barra deja en el contenido.
const MARGEN = "p-4";
const CAJA = "flex items-center justify-between border border-transparent px-4 py-3";

/**
 * Barra superior del panel: logo en negativo (→ Inicio) y el cierre. Es la
 * capa QUIETA de la cortina (`useMenuAnimado` la contra-desplaza): no viaja
 * con el contenido, se queda clavada sobre la píldora de la página y el filo
 * de la cortina la va destapando. Como copia la caja de la píldora, cada pieza
 * cae sobre su par —logo sobre logo, botón sobre botón— y lo que se ve es el
 * mismo logo y las mismas rayas pasando de azul a blanco, no dos barras.
 *
 * El degradé de fondo es para cuando el contenido scrollea por debajo.
 */
export function BarraMenu({
  closeRef,
  onCerrar,
}: {
  closeRef: RefObject<HTMLButtonElement | null>;
  onCerrar: () => void;
}) {
  return (
    <div
      data-mnav-fijo
      className={`from-azul-principal via-azul-principal/90 absolute inset-x-0 top-0 z-10 bg-gradient-to-b to-transparent ${MARGEN}`}
    >
      <div className={CAJA}>
        <Link
          href={HOME_LINK.href}
          aria-label="Empoderamiento Docente — Inicio"
          onClick={onCerrar}
          className="inline-flex items-center"
        >
          <Image
            src="/brand/logotipo-principal-ed-negativo.png"
            alt="Empoderamiento Docente"
            width={425}
            height={467}
            unoptimized
            className="h-11 w-auto"
          />
        </Link>
        <BotonCerrar closeRef={closeRef} onCerrar={onCerrar} />
      </div>
    </div>
  );
}

/** El alto de la barra, en blanco: va primero en el contenido para que nada
 *  arranque debajo de ella. */
export function HuecoBarra() {
  return (
    <div aria-hidden="true" className={`shrink-0 ${MARGEN}`}>
      <div className={CAJA}>
        <div className="h-11" />
      </div>
    </div>
  );
}
