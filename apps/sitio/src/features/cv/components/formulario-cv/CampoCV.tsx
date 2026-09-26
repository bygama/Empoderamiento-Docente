import type { CampoDeFormulario } from "@/lib/formularios/campos";
import { PaisDropdown } from "@/features/contacto/components/PaisDropdown";
import { INPUT_BASE, LABEL_BASE } from "@/features/contacto/components/experiencia/estilos";

/**
 * Un campo del formulario de CV, dibujado desde su descripción en
 * `config/cv.ts` con los mismos controles que el formulario de Contacto: las
 * cajas de `INPUT_BASE`, la etiqueta mono de `LABEL_BASE` y el desplegable
 * propio para las opciones. El párrafo ocupa las dos columnas.
 */
export function CampoCV({ campo }: { campo: CampoDeFormulario }) {
  const id = `cv-${campo.clave}`;
  const etiqueta = `${campo.etiqueta}${campo.obligatorio ? " *" : ""}`;
  return (
    <div className={campo.tipo === "parrafo" ? "md:col-span-2" : undefined}>
      <label htmlFor={id} className={LABEL_BASE}>
        {etiqueta}
      </label>
      {campo.tipo === "opcion" ? (
        <PaisDropdown id={id} name={campo.clave} options={campo.opciones ?? []} etiqueta={campo.etiqueta} />
      ) : campo.tipo === "parrafo" ? (
        <textarea id={id} name={campo.clave} required={campo.obligatorio} maxLength={campo.largo} rows={4} className={`${INPUT_BASE} resize-none`} />
      ) : (
        <input
          id={id}
          name={campo.clave}
          type={campo.tipo === "correo" ? "email" : "text"}
          required={campo.obligatorio}
          maxLength={campo.largo}
          autoComplete={campo.autocompletar}
          className={INPUT_BASE}
        />
      )}
    </div>
  );
}
