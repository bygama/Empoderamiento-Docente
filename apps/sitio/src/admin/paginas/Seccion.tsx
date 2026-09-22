import { Campo } from "@/admin/campos/Campo";
import { ChevronDown } from "@/components/ui/icons";
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
 * Sin caja: el título con un divisor, y el contenido en dos columnas cuando
 * hay lugar (SPEC §5 de `work/editor-sin-pared/`).
 * El `id` es el destino de los links de la sidebar (`#seccion-<clave>`), y el
 * `scroll-margin` deja el bloque a la vista debajo del encabezado del editor:
 * en escritorio está pegado arriba (81 px, 129 con un aviso); en el celular
 * hace scroll con la página y las acciones van abajo, así que alcanza con un
 * respiro.
 */
export function Seccion({ clave, nombre, descripcion, valor, alCambiar }: Props) {
  return (
    <details id={`seccion-${clave}`} open className="group/seccion scroll-mt-4 lg:scroll-mt-28">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio [&::-webkit-details-marker]:hidden">
        <ChevronDown size={20} className="shrink-0 -rotate-90 motion-safe:transition-transform group-open/seccion:rotate-0" />
        {nombre}
      </summary>
      {/* El `@container` es lo que mide la raíz para decidir si va en dos columnas. */}
      <div className="@container pt-5">
        <Campo raiz columnas nombre={clave} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />
      </div>
    </details>
  );
}
