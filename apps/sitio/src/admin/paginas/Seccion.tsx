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

/** Un bloque plegable por sección, con el nombre que tiene en el sitio (SPEC §2). */
export function Seccion({ clave, nombre, descripcion, valor, alCambiar }: Props) {
  return (
    <details open className="rounded-xl border border-azul-claro bg-white">
      <summary className="cursor-pointer px-5 py-3 font-[family-name:var(--font-manrope)] text-lg font-bold">{nombre}</summary>
      <div className="space-y-5 border-t border-azul-claro px-5 py-5">
        <Campo raiz nombre={clave} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />
      </div>
    </details>
  );
}
