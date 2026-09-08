import { ArrowUpRight } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { PaisDropdown } from "../PaisDropdown";
import { INPUT_BASE, LABEL_BASE } from "./estilos";

/**
 * Panel claro de campos: emerge del navy del rail (sin borde izquierdo en
 * desktop, sin borde superior en mobile). Cada campo es un [data-campo] para
 * la cascada; la CTA de envío es el único naranja en pantalla.
 */
export function CamposContacto() {
  return (
    <div className="border-azul-claro/50 grid content-center gap-x-8 gap-y-6 rounded-b-3xl border border-t-0 bg-white/80 p-6 backdrop-blur-sm md:grid-cols-2 md:p-8 lg:rounded-r-3xl lg:rounded-bl-none lg:border-t lg:border-l-0">
      <div data-campo>
        <label htmlFor="ct-nombre" className={LABEL_BASE}>
          Nombre y apellido *
        </label>
        <input id="ct-nombre" name="nombre" required autoComplete="name" className={INPUT_BASE} />
      </div>
      <div data-campo>
        <label htmlFor="ct-email" className={LABEL_BASE}>
          Email *
        </label>
        <input id="ct-email" name="email" type="email" required autoComplete="email" className={INPUT_BASE} />
      </div>
      <div data-campo>
        <label htmlFor="ct-institucion" className={LABEL_BASE}>
          Institución u organización
        </label>
        <input id="ct-institucion" name="institucion" autoComplete="organization" className={INPUT_BASE} />
      </div>
      <div data-campo>
        <label htmlFor="ct-pais" className={LABEL_BASE}>
          País
        </label>
        {/* Dropdown propio (no <select> nativo): comparte la caja de los
            demás campos y despliega un menú accesible con teclado. */}
        <PaisDropdown id="ct-pais" name="pais" options={[...siteConfig.paises, "Otro"]} />
      </div>
      <div data-campo className="md:col-span-2">
        <label htmlFor="ct-mensaje" className={LABEL_BASE}>
          Mensaje *
        </label>
        <textarea
          id="ct-mensaje"
          name="mensaje"
          required
          rows={3}
          placeholder="Contanos qué tenés en mente…"
          className={`${INPUT_BASE} resize-none`}
        />
      </div>

      {/* CTA primaria, centrada al pie del panel. */}
      <div data-campo className="mt-1 flex justify-center pt-1 md:col-span-2">
        {/* Espejo de ButtonPrimary como <button> de submit (el componente
            solo acepta href). Único naranja en pantalla. */}
        <button
          type="submit"
          className="group bg-naranja-accion hover:bg-naranja-accion/90 hover:shadow-naranja-accion/30 focus-visible:outline-naranja-accion inline-flex items-center gap-2 rounded-lg px-6 py-3 font-sans text-[0.95rem] font-medium text-white transition-[background-color,box-shadow] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span>Enviar consulta</span>
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </div>
  );
}
