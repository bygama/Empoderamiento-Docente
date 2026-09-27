import { EstadoVacio } from "@ed/kit-admin";
import { ChevronDown } from "@/components/ui/icons";
import type { Diferencia } from "@/lib/contenido/comparar";
import { ListaDeDiferencias } from "./ListaDeDiferencias";

/**
 * «Qué cambió» en la ficha de una entidad (DESIGN.md §11): plegado debajo del
 * formulario, con el título de sección y la cuenta a la vista, y adentro la
 * lista de diferencias o, sin ninguna, que es igual a lo publicado. Quien lo
 * usa arma las diferencias de su entidad. No sabe de ED.
 */
export function QueCambioPlegado({ cambios }: { cambios: readonly Diferencia[] }) {
  const cuantos = cambios.length === 1 ? "un campo" : `${cambios.length} campos`;
  return (
    <details className="group/cambios">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio [&::-webkit-details-marker]:hidden">
        <ChevronDown size={20} className="shrink-0 -rotate-90 motion-safe:transition-transform group-open/cambios:rotate-0" />
        Qué cambió
        <span className="font-sans text-admin-meta font-normal text-gris-texto">{cambios.length ? `· ${cuantos} contra lo publicado` : "· nada"}</span>
      </summary>
      <div className="pt-2">
        {cambios.length ? (
          <ListaDeDiferencias diferencias={cambios} />
        ) : (
          <EstadoVacio titulo="Es igual a lo publicado" texto="Lo que cambies se compara acá con lo que está en el sitio, campo por campo." />
        )}
      </div>
    </details>
  );
}
