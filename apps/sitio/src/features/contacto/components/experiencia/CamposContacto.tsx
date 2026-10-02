import { ArrowUpRight } from "@/components/ui/icons";
import { aLos } from "@/config/privacidad";
import type { Envio } from "./contexto";
import { PaisDropdown } from "../PaisDropdown";
import { INPUT_BASE, LABEL_BASE } from "./estilos";

/**
 * Panel claro de campos: emerge del navy del rail (sin borde izquierdo en
 * desktop, sin borde superior en mobile). Cada campo es un [data-campo] para
 * la cascada; la CTA de envío es el único naranja en pantalla. Mientras el
 * mensaje viaja, la CTA dice «Enviando…»; si no salió, el error va arriba de
 * ella, en `rojo-error` (6,57:1), y se anuncia en el acto. El correo y los
 * países salen de Ajustes › Datos del sitio (los mismos que acepta
 * /api/contacto), y el plazo de la línea de privacidad, de Ajustes ›
 * Privacidad: el mismo que usa el borrado.
 */
export function CamposContacto({ envio, correo, paises, mesesDeGuarda }: { envio: Envio; correo: string; paises: readonly string[]; mesesDeGuarda: number }) {
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
      {/* La cascada deja un transform en cada campo, y con él un contexto de
          apilamiento: sin subir este, la lista abierta queda pintada debajo
          de los campos que siguen. */}
      <div data-campo className="relative has-[[aria-expanded=true]]:z-30">
        <label htmlFor="ct-pais" className={LABEL_BASE}>
          País
        </label>
        {/* El dropdown propio en todos los tamaños: el menú del sistema desentona con el formulario. */}
        <PaisDropdown id="ct-pais" name="pais" options={[...paises, "Otro"]} />
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

      {/* El campo trampa: fuera de la vista, del lector y del tabulador. Una
          persona lo deja vacío; un bot que completa todo, no. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="ct-web">No completes este campo</label>
        <input id="ct-web" name="web" tabIndex={-1} autoComplete="off" />
      </div>

      {envio.error ? (
        <p role="alert" className="text-rojo-error text-center font-sans text-[0.9rem] leading-relaxed md:col-span-2">
          {envio.error}
        </p>
      ) : null}

      {/* CTA primaria, centrada al pie del panel. */}
      <div data-campo className="mt-1 flex justify-center pt-1 md:col-span-2">
        {/* Espejo de ButtonPrimary como <button> de submit (el componente
            solo acepta href). Único naranja en pantalla. */}
        <button
          type="submit"
          disabled={envio.enviando}
          aria-busy={envio.enviando || undefined}
          className="group bg-naranja-accion hover:bg-naranja-accion/90 hover:shadow-naranja-accion/30 focus-visible:outline-naranja-accion inline-flex items-center gap-2 rounded-lg px-6 py-3 font-sans text-[0.95rem] font-medium text-white transition-[background-color,box-shadow] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 aria-busy:cursor-wait"
        >
          <span>{envio.enviando ? "Enviando…" : "Enviar consulta"}</span>
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>

      {/* Qué se hace con los datos y cuándo se borran, en llano. */}
      <p data-campo className="text-gris-texto text-center font-sans text-[0.8rem] leading-relaxed md:col-span-2">
        Usamos tus datos solo para responderte, y los borramos {aLos("contacto", mesesDeGuarda)}. Si querés que los
        borremos antes, escribinos a{" "}
        <a href={`mailto:${correo}`} className="text-azul-principal underline underline-offset-2">
          {correo}
        </a>
        .
      </p>
    </div>
  );
}
