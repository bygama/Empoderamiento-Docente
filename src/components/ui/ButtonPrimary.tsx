import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type Props = {
  href: string;
  children: ReactNode;
  /** Mostrar la flecha animada a la derecha del texto. Default true. */
  withArrow?: boolean;
};

/**
 * CTA primario. Único naranja por viewport (DESIGN.md §1 reglas duras).
 * Sutil micro-shift de la flecha al hover refuerza la dirección del clic.
 */
export function ButtonPrimary({ href, children, withArrow = true }: Props) {
  return (
    <Link
      href={href}
      className="group bg-naranja-accion hover:bg-naranja-accion/90 hover:shadow-naranja-accion/30 focus-visible:outline-naranja-accion inline-flex items-center gap-2 rounded-lg px-6 py-3 font-sans text-[0.95rem] font-medium text-white transition-[background-color,box-shadow] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowUpRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </Link>
  );
}
