import type { EnAccion } from "@/features/investigacion/contenido/en-accion";
import { CasosInvestigacion } from "../casos/CasosInvestigacion";
import type { CasoInvestigacion } from "../casos/tipos";

/**
 * Sección 6 — Investigación en acción (`#en-accion`).
 * La experiencia completa (archivo de carpetas → expediente) vive en
 * src/features/investigacion/casos/. Este wrapper mantiene estable el
 * contrato con la página: recibe los textos propios de la sección (de
 * `features/investigacion/contenido/en-accion.ts` o de la base) y los casos,
 * que son una entidad de la base.
 */
export function InvestigacionEnAccion({ contenido, casos }: { contenido: EnAccion; casos: readonly CasoInvestigacion[] }) {
  return <CasosInvestigacion titulo={contenido.titulo} casos={casos} />;
}
