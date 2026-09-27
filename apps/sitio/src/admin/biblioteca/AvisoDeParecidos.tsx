import Link from "next/link";
import { Enlace } from "@/components/ui/icons";
import type { Vecino } from "@/datos/biblioteca/contra-la-biblioteca";

// El estilo de «Sección compartida» (DESIGN.md §11): una línea en meta
// `azul-principal` con el ícono en `azul-medio` y el link subrayado siempre.
const LINK =
  "rounded-sm font-medium text-azul-medio underline underline-offset-2 hover:text-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/**
 * «Se parece a…» (SPEC §7 de `work/biblioteca/`): un material con un título
 * parecido ya está en la Biblioteca, con el link para abrirlo. Es un aviso,
 * no un freno —dos capítulos distintos pueden llamarse casi igual—, así que
 * no va en rojo ni frena nada; se anuncia cuando aparece.
 */
export function AvisoDeParecidos({ parecidos }: { parecidos: readonly Vecino[] }) {
  if (!parecidos.length) return null;
  return (
    <p role="status" className="flex items-start gap-2 text-admin-meta text-azul-principal">
      <Enlace size={16} className="mt-0.5 shrink-0 text-azul-medio" />
      <span>
        {parecidos.length === 1 ? "Ya hay un material con un título parecido: " : "Ya hay materiales con títulos parecidos: "}
        {parecidos.map((p, i) => (
          <span key={p.id}>
            {i > 0 ? ", " : null}
            <Link href={`/admin/biblioteca/${p.id}`} className={LINK} target="_blank" rel="noreferrer">
              «{p.titulo}»<span className="sr-only"> (se abre en otra pestaña)</span>
            </Link>
          </span>
        ))}
        . Fijate que no sea el mismo antes de publicarlo.
      </span>
    </p>
  );
}
