import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import type { EstadoDeMetricas } from "@/datos/consultas/metricas";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";

/**
 * Lo que ve una pantalla que lee la copia de Vercel cuando todavía no hay
 * ninguna: faltan las variables, o todavía no corrió. `null` si hay datos.
 * Lo usan Resumen y Origen, con las mismas palabras que el Inicio.
 */
export function SinCopia({ estado }: { estado: Pick<EstadoDeMetricas, "hayVariables" | "hastaDia"> }) {
  if (!estado.hayVariables) {
    return (
      <EstadoVacio
        titulo={SIN_VARIABLES_DE_METRICAS}
        texto="Sin el token y el ID del proyecto no hay nada que copiar. Están explicadas en el README, sección «Variables de entorno»."
      />
    );
  }
  if (!estado.hastaDia) {
    return (
      <EstadoVacio
        titulo="El sitio empieza a contar cuando se publica"
        texto="La primera copia llega al día siguiente del primer deploy. Si ya pasó un día, tocá «Actualizar ahora» en el Resumen."
      />
    );
  }
  return null;
}
