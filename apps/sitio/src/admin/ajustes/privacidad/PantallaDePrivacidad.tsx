import { Apartado } from "@/admin/armazon/Apartado";
import { Encabezado } from "@/admin/armazon/Encabezado";
import type { Plazo } from "@/config/privacidad";
import type { PlazoParaEditar } from "@/datos/privacidad";
import { VOLVER_A_AJUSTES } from "../pantallas";
import { FormularioDePlazos } from "./FormularioDePlazos";

const DIA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });

/** Desde cuándo rige un plazo, en una frase: «Rige desde el 27/9/2026, lo puso Ana.» */
function rigeDesde({ desde, puestoPor }: PlazoParaEditar): string {
  if (!desde) return "Es el de siempre.";
  return `Rige desde el ${DIA.format(desde)}${puestoPor ? `, lo puso ${puestoPor}` : ""}.`;
}

/**
 * Ajustes › Privacidad (work/ajustes/SPEC.md §2.5): los plazos de retención y
 * la política de privacidad del sitio, que todavía no está. La regla del
 * menor va dicha en llano, en la consecuencia del apartado (ADR-0014).
 */
export function PantallaDePrivacidad({ plazos }: { plazos: Record<Plazo, PlazoParaEditar> }) {
  const rige = { cv: rigeDesde(plazos.cv), contacto: rigeDesde(plazos.contacto), spam: rigeDesde(plazos.spam) };
  return (
    <>
      <Encabezado volver={VOLVER_A_AJUSTES} titulo="Privacidad" detalle="Cuánto se guarda lo que llega por los formularios del sitio, y después se borra solo." />
      <div>
        <Apartado
          id="plazos"
          titulo="Plazos de retención"
          descripcion="Los formularios del sitio le prometen a quien escribe cuándo se borra lo suyo. Alargar un plazo vale para lo que llegue desde ahora: lo que ya llegó se borra cuando se le prometió. Acortarlo vale para todo."
        >
          <FormularioDePlazos inicial={{ cv: plazos.cv.valor, contacto: plazos.contacto.valor, spam: plazos.spam.valor }} rige={rige} />
        </Apartado>
        <Apartado id="politica" titulo="Política de privacidad" descripcion="El texto que explica qué se hace con los datos de quien escribe.">
          <p className="max-w-prose">
            El sitio todavía no tiene una política de privacidad publicada. El texto es de ED, con asesoría: cuando exista, va a estar linkeada
            acá.
          </p>
        </Apartado>
      </div>
    </>
  );
}
