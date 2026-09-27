import type { ReactNode } from "react";
import { Aviso } from "./Aviso";

/** El aviso de la última acción. `choque`: otra persona guardó mientras tanto, y el aviso ofrece recargar. */
export type AvisoDelEditor = { ok: boolean; detalle: ReactNode; choque?: true };

/**
 * El aviso de la última acción de un editor (una página, una novedad), con
 * «Recargar» adentro cuando otra persona guardó mientras tanto (DESIGN.md §11,
 * «Avisos»).
 */
export function AvisoDeLaAccion({ aviso, alCerrar, alRecargar }: { aviso: AvisoDelEditor | null; alCerrar: () => void; alRecargar: () => void }) {
  if (!aviso) return null;
  return (
    <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={alCerrar} accion={aviso.choque ? { etiqueta: "Recargar", alHacer: alRecargar } : undefined}>
      {aviso.detalle}
    </Aviso>
  );
}
