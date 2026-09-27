import type { Cambio } from "@ed/kit-admin";
import type { MaterialEnElFormulario, Origen } from "./formulario";

/** Cambiar un campo del formulario de un material. */
export type Cambiar = <K extends keyof MaterialEnElFormulario>(campo: K, cambio: Cambio<MaterialEnElFormulario[K]>) => void;

/** Lo que recibe cada bloque del formulario: lo que hay, cómo cambiarlo, los errores del guardado y de dónde vino cada dato. */
export type PropsDeBloque = {
  form: MaterialEnElFormulario;
  cambiar: Cambiar;
  errores: Readonly<Record<string, string>>;
  origen: Origen;
};

/** Un bloque del formulario: su título con el divisor de las secciones del editor, y los campos debajo (DESIGN.md §11, «Ficha de una entidad»). */
export function Bloque({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-5">
      <h2 id={id} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
