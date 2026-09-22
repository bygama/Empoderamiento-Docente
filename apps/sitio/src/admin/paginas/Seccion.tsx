import { Campo } from "@/admin/campos/Campo";
import type { Cambio } from "@/admin/campos/cambio";
import type { Descripcion } from "@/lib/contenido/descripcion";

type Props = {
  clave: string;
  nombre: string;
  descripcion: Descripcion;
  valor: unknown;
  alCambiar: (valor: Cambio<unknown>) => void;
};

/**
 * Un bloque plegable por sección, con el nombre que tiene en el sitio (SPEC §2).
 * El `id` es el destino de los links de la sidebar (`#seccion-<clave>`), y el
 * `scroll-margin` deja el bloque a la vista debajo de la barra de acciones,
 * que es `sticky`: en el celular la barra ocupa dos renglones (159 px medidos
 * a 390 px), en escritorio uno (88 px).
 */
export function Seccion({ clave, nombre, descripcion, valor, alCambiar }: Props) {
  return (
    <details id={`seccion-${clave}`} open className="scroll-mt-44 rounded-xl border border-azul-claro bg-white lg:scroll-mt-28">
      <summary className="cursor-pointer px-5 py-3 font-[family-name:var(--font-manrope)] text-lg font-bold">{nombre}</summary>
      <div className="space-y-5 border-t border-azul-claro px-5 py-5">
        <Campo raiz nombre={clave} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />
      </div>
    </details>
  );
}
