"use client";

import { useId, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "@/components/ui/icons";

/** Con menos que esto la descripción entra en sus tres renglones: no hay nada que desplegar. */
const LARGO_QUE_SE_CORTA = 180;

type TextoPlegableProps = {
  descripcion: string;
  detalle: string;
  /** Lo fuerza cerrado: en la baraja, el artículo que no está a la vista no ocupa su alto abierto. */
  plegado?: boolean;
  /** Las clases de cada párrafo (el tamaño y el ancho cambian entre la baraja y la banda). */
  claseParrafo: string;
};

/**
 * El texto de un destacado, plegado (pedido de Gastón): tres renglones de la
 * descripción y «Leer más», que muestra la descripción entera y el detalle.
 * Entero, cada artículo era un bloque largo y desparejo que deformaba la
 * sección. El texto sigue en la página, solo no se muestra de entrada.
 *
 * No se anima el alto (solo transform y opacity): lo que se suma aparece con
 * el fundido corto de `filtros-abre`. Como el artículo cambia de alto, se
 * vuelven a medir los ScrollTrigger: los de esta sección (el pin y los
 * barridos se apoyan en dónde está cada artículo) y los de las que siguen.
 */
export function TextoPlegable({ descripcion, detalle, plegado = false, claseParrafo }: TextoPlegableProps) {
  const [pedido, setPedido] = useState(false);
  const idDetalle = useId();
  const abierto = pedido && !plegado;
  const hayMas = Boolean(detalle) || descripcion.length > LARGO_QUE_SE_CORTA;

  const alternar = () => {
    setPedido(!abierto);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <>
      <p className={`${claseParrafo} ${abierto || !hayMas ? "" : "line-clamp-3"}`}>{descripcion}</p>
      {abierto && detalle ? (
        <p id={idDetalle} className={`${claseParrafo} mt-4 motion-safe:animate-[filtros-abre_0.28s_ease-out]`}>
          {detalle}
        </p>
      ) : null}
      {hayMas ? (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={abierto && detalle ? idDetalle : undefined}
          onClick={alternar}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start font-sans text-[0.92rem] font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
        >
          {abierto ? "Leer menos" : "Leer más"}
          <ChevronDown size={16} className={`transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </>
  );
}
