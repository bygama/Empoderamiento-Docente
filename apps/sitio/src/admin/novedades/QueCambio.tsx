import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { ListaDeDiferencias } from "@/admin/armazon/ListaDeDiferencias";
import { ChevronDown } from "@/components/ui/icons";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import { cambiosDeNovedad } from "./cambios";

/**
 * «Qué cambió» (DESIGN.md §11): lo que hay en pantalla contra lo publicado,
 * en vivo —incluye lo que todavía no se guardó, que es lo que «Publicar» va a
 * publicar—. Plegado, con la cuenta a la vista. Una novedad que nunca se
 * publicó no lo lleva: se publica entera.
 */
export function QueCambio({ publicado, actual }: { publicado: BorradorDeNovedad | null; actual: BorradorDeNovedad }) {
  if (!publicado) return null;
  const cambios = cambiosDeNovedad(publicado, actual);
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
