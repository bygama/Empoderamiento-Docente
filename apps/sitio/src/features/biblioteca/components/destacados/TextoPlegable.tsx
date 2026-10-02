"use client";

import { useId, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "@/components/ui/icons";

/** Cuántos renglones se ven plegado, y desde qué largo la descripción no entra en ellos. */
const CORTES = {
  3: { clase: "line-clamp-3", largo: 180 },
  2: { clase: "line-clamp-2", largo: 140 },
} as const;

type TextoPlegableProps = {
  descripcion: string;
  /** El segundo párrafo, que solo se ve desplegado (los destacados lo tienen; una fila del catálogo, no). */
  detalle?: string;
  /** Los renglones que se ven plegado: tres en un destacado, dos en una fila del catálogo. */
  renglones?: 2 | 3;
  /** El color del botón: blanco sobre la banda azul, azul sobre el blanco del catálogo. */
  sobreClaro?: boolean;
  /** Lo fuerza cerrado: en la baraja, el artículo que no está a la vista no ocupa su alto abierto. */
  plegado?: boolean;
  /** Las clases de cada párrafo (el tamaño y el ancho cambian entre la baraja y la banda). */
  claseParrafo: string;
};

/**
 * El texto de un material, plegado (pedido de Gastón): los primeros renglones
 * de la descripción y «Leer más», que la muestra entera y, en un destacado,
 * suma el detalle. Entero, cada artículo era un bloque largo y desparejo que
 * deformaba la sección, y el catálogo, un rollo. El texto sigue en la
 * página, solo no se muestra de entrada.
 *
 * No se anima el alto (solo transform y opacity): lo que se suma aparece con
 * el fundido corto de `filtros-abre`. Como el artículo cambia de alto, se
 * vuelven a medir los ScrollTrigger: los de esta sección (el pin y los
 * barridos se apoyan en dónde está cada artículo) y los de las que siguen.
 */
export function TextoPlegable({ descripcion, detalle = "", renglones = 3, sobreClaro = false, plegado = false, claseParrafo }: TextoPlegableProps) {
  const [pedido, setPedido] = useState(false);
  const idDetalle = useId();
  const abierto = pedido && !plegado;
  const corte = CORTES[renglones];
  const hayMas = Boolean(detalle) || descripcion.length > corte.largo;

  const alternar = () => {
    setPedido(!abierto);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <>
      <p className={`${claseParrafo} ${abierto || !hayMas ? "" : corte.clase}`}>{descripcion}</p>
      {abierto && detalle ? (
        <p id={idDetalle} className={`${claseParrafo} mt-4 motion-safe:animate-[filtros-abre_0.28s_ease-out]`}>
          {detalle}
        </p>
      ) : null}
      {hayMas ? <BotonLeerMas abierto={abierto} controla={abierto && detalle ? idDetalle : undefined} sobreClaro={sobreClaro} onAlternar={alternar} /> : null}
    </>
  );
}

const SOBRE_AZUL = "mt-3 text-white decoration-white/40 hover:decoration-white";
const SOBRE_BLANCO = "mt-1 text-azul-principal decoration-azul-principal/40 hover:decoration-azul-principal";

function BotonLeerMas({ abierto, controla, sobreClaro, onAlternar }: { abierto: boolean; controla: string | undefined; sobreClaro: boolean; onAlternar: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={abierto}
      aria-controls={controla}
      onClick={onAlternar}
      className={`inline-flex min-h-11 items-center gap-1.5 self-start font-sans text-[0.92rem] font-medium underline underline-offset-4 transition-colors ${sobreClaro ? SOBRE_BLANCO : SOBRE_AZUL}`}
    >
      {abierto ? "Leer menos" : "Leer más"}
      <ChevronDown size={16} className={`transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
    </button>
  );
}
