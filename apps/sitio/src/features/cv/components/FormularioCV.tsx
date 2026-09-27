"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { CV_PESA_DE_MAS, MAXIMO_DEL_CV } from "@/config/cv";
import { MESES_DE_GUARDA } from "@/config/privacidad";
import { siteConfig } from "@/config/site";
import { INPUT_BASE, LABEL_BASE } from "@/features/contacto/components/experiencia/estilos";
import type { CampoDeFormulario } from "@/lib/formularios/campos";
import { enviarFormulario } from "@/lib/formularios/enviar";
import { CampoCV } from "./formulario-cv/CampoCV";
import { ConfirmacionCV } from "./formulario-cv/ConfirmacionCV";

const SIN_RESPUESTA = `No pudimos enviar tu CV. Revisá tu conexión y probá de nuevo, o escribinos a ${siteConfig.contacto.email}.`;
const MEGAS = MAXIMO_DEL_CV / (1024 * 1024);

/**
 * El formulario de CV (work/mensajes/SPEC.md §5.2), con la forma de enviar de
 * Contacto: viaja por `fetch` a /api/cv y la respuesta dice si salió o qué
 * pasó. Los campos llegan de la página (`camposDelCV`, con los países de la
 * base: los mismos que acepta /api/cv); el archivo, el campo trampa, el error
 * y la línea de privacidad son fijos. El peso se chequea antes de mandar:
 * pasado el tope, Vercel corta el pedido sin una respuesta legible.
 */
export function FormularioCV({ campos }: { campos: readonly CampoDeFormulario[] }) {
  const [envio, setEnvio] = useState<{ enviando: boolean; error: string | null }>({ enviando: false, error: null });
  const [listo, setListo] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const archivo = datos.get("archivo");
    if (archivo instanceof File && archivo.size > MAXIMO_DEL_CV) {
      setEnvio({ enviando: false, error: CV_PESA_DE_MAS });
      return;
    }
    setEnvio({ enviando: true, error: null });
    const respuesta = await enviarFormulario("/api/cv", datos, SIN_RESPUESTA);
    setEnvio({ enviando: false, error: respuesta.ok ? null : respuesta.error });
    if (respuesta.ok) setListo(true);
  }

  if (listo) return <ConfirmacionCV />;

  return (
    <form
      onSubmit={(e) => void enviar(e)}
      className="border-azul-claro/50 grid gap-x-8 gap-y-6 rounded-3xl border bg-white/80 p-6 backdrop-blur-sm md:grid-cols-2 md:p-8"
    >
      {campos.map((campo) => (
        <CampoCV key={campo.clave} campo={campo} />
      ))}

      <div className="md:col-span-2">
        <label htmlFor="cv-archivo" className={LABEL_BASE}>
          Tu CV, en PDF (hasta {MEGAS} MB) *
        </label>
        <input
          id="cv-archivo"
          name="archivo"
          type="file"
          accept="application/pdf,.pdf"
          required
          className={`${INPUT_BASE} file:bg-azul-principal/5 file:text-azul-principal file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:font-sans file:font-medium`}
        />
      </div>

      {/* El campo trampa, como en Contacto: fuera de la vista, del lector y del tabulador. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="cv-web">No completes este campo</label>
        <input id="cv-web" name="web" tabIndex={-1} autoComplete="off" />
      </div>

      {envio.error ? (
        <p role="alert" className="text-rojo-error text-center font-sans text-[0.9rem] leading-relaxed md:col-span-2">
          {envio.error}
        </p>
      ) : null}

      <div className="mt-1 flex justify-center pt-1 md:col-span-2">
        {/* El mismo CTA que «Enviar consulta»: el único naranja de la pantalla. */}
        <button
          type="submit"
          disabled={envio.enviando}
          aria-busy={envio.enviando || undefined}
          className="group bg-naranja-accion hover:bg-naranja-accion/90 hover:shadow-naranja-accion/30 focus-visible:outline-naranja-accion inline-flex items-center gap-2 rounded-lg px-6 py-3 font-sans text-[0.95rem] font-medium text-white transition-[background-color,box-shadow] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 aria-busy:cursor-wait"
        >
          <span>{envio.enviando ? "Enviando…" : "Enviar mi CV"}</span>
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      <p className="text-gris-texto text-center font-sans text-[0.8rem] leading-relaxed md:col-span-2">
        Tu CV lo ven solo quienes dirigen y administran ED. Lo guardamos {MESES_DE_GUARDA.cv} meses y después lo
        borramos, con el archivo. Si querés que lo borremos antes, escribinos a{" "}
        <a href={`mailto:${siteConfig.contacto.email}`} className="text-azul-principal underline underline-offset-2">
          {siteConfig.contacto.email}
        </a>
        .
      </p>
    </form>
  );
}
