import type { Ref } from "react";
import { ID_FINAL } from "./estilos";

type Props = {
  nombrePila: string;
  apellido: string;
  role: string;
  refIdentity: Ref<HTMLDivElement>;
  refLine1: Ref<HTMLSpanElement>;
  refLine2: Ref<HTMLSpanElement>;
  refRole: Ref<HTMLSpanElement>;
};

/**
 * IDENTIDAD (capa fija): el nombre que VIAJA del hero a la columna. Es el h2
 * real (siempre en el árbol de accesibilidad). Arranca en su pose final (la
 * de la columna); la coreografía lo lleva a la del hero y lo trae de vuelta.
 */
export function IdentidadFija({ nombrePila, apellido, role, refIdentity, refLine1, refLine2, refRole }: Props) {
  return (
    <div
      ref={refIdentity}
      data-identity
      className="pointer-events-none fixed top-[5rem] z-[7] hidden lg:block"
      style={{ left: "max(1.25rem, calc((100vw - 1440px)/2 + 1.5rem))" }}
    >
      <h2 className="font-display text-azul-principal font-bold tracking-[-0.02em]">
        <span ref={refLine1} className="block" style={{ fontSize: ID_FINAL.line1, lineHeight: 1.06 }}>
          {nombrePila}
        </span>
        <span ref={refLine2} className="block" style={{ fontSize: ID_FINAL.line2, lineHeight: 1.06 }}>
          {apellido}
        </span>
      </h2>
      <span
        ref={refRole}
        className="text-verde-concepto-texto block font-mono font-semibold tracking-[0.2em] uppercase"
        style={{ fontSize: ID_FINAL.role, marginTop: ID_FINAL.roleGap }}
      >
        {role}
      </span>
    </div>
  );
}
