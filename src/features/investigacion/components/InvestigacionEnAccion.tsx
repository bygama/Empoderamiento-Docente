import { CasosInvestigacion } from "../casos/CasosInvestigacion";

/**
 * Sección 6 — Investigación en acción (`#en-accion`).
 * La experiencia completa (archivo de carpetas → expediente) vive en
 * src/features/investigacion/casos/. Este wrapper mantiene estable el
 * contrato con la página.
 */
export function InvestigacionEnAccion() {
  return <CasosInvestigacion />;
}
