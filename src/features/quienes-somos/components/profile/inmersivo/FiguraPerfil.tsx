import type { Ref } from "react";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { leerDatosFigura, type Figura } from "./figura-perfil/datos-figura";
import { FiguraLineal } from "./figura-perfil/FiguraLineal";
import { FiguraCierre } from "./figura-perfil/FiguraCierre";
import { FiguraFija } from "./figura-perfil/FiguraFija";

type Props = {
  profile: Profile;
  /** Tratamiento de la fotografía (ver `Profile.figura`). */
  figura: Figura;
  /**
   * Dónde aparece: la capa FIJA de la apertura (con `data-portrait-outer` y
   * `data-portrait-mover`, que la coreografía y el overlay leen), el CIERRE
   * (reaparece integrada a la convergencia) o el encabezado de la rama LINEAL.
   */
  modo: "fija" | "cierre" | "lineal";
  refOuter?: Ref<HTMLDivElement>;
  refMover?: Ref<HTMLDivElement>;
  refCierre?: Ref<HTMLDivElement>;
  /** Solo en `fija`: el camino se recalcula cuando la figura ya midió. */
  onCargar?: () => void;
};

/**
 * Las tres apariciones de la figura. Con recorte va parada sobre el borde
 * inferior y sin rectángulo; con foto normal va enmarcada y flotando (una
 * foto rectangular "apoyada en el piso" se lee como un error de recorte).
 * Sin foto (`figura: "sin"`) no renderiza nada.
 *
 * El marco recorta con `object-cover` sobre una caja de proporción fija, así
 * que va con `fill`; el recorte manda el alto por CSS y deja el ancho en
 * `auto`, así que necesita las medidas reales del archivo (`cutoutSize`).
 *
 * Acá solo queda el reparto por `modo`: cada aparición vive en
 * `figura-perfil/`. Estaban las tres en esta función y react-doctor la marcó
 * por complejidad (17 ciclomática, 27 cognitiva) cuando el marco apaisado
 * sumó su tercera dimensión de casos; son ramas independientes —nunca se
 * renderizan juntas— así que se separan sin compartir estado.
 */
export function FiguraPerfil({ profile, figura, modo, refOuter, refMover, refCierre, onCargar }: Props) {
  const datos = leerDatosFigura(profile, figura);
  if (!datos) return null;

  if (modo === "lineal") return <FiguraLineal datos={datos} figura={figura} />;

  if (modo === "cierre") {
    return <FiguraCierre datos={datos} figura={figura} refCierre={refCierre} />;
  }

  return (
    <FiguraFija
      datos={datos}
      figura={figura}
      refOuter={refOuter}
      refMover={refMover}
      onCargar={onCargar}
    />
  );
}
