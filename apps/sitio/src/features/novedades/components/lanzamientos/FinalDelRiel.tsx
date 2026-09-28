import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import type { LanzamientosDeNovedades } from "@/features/novedades/contenido/lanzamientos";

/** La tarjeta que cierra el riel: el CTA a la Biblioteca. */
export function FinalDelRiel({ final }: { final: LanzamientosDeNovedades["final"] }) {
  return (
    <Link
      href="/biblioteca"
      className="group border-azul-principal/15 hover:border-verde-concepto/50 flex aspect-[3/4] w-[60vw] shrink-0 flex-col items-start justify-end rounded-2xl border bg-white p-6 transition-colors max-md:snap-start sm:w-[32vw] lg:w-[17rem]"
    >
      <span className="bg-verde-concepto/10 text-verde-concepto-texto mb-4 flex h-11 w-11 items-center justify-center rounded-xl">
        <ArrowUpRight size={22} />
      </span>
      <h3 className="font-display text-azul-principal text-[1.2rem] leading-snug font-bold">{final.titulo}</h3>
      <p className="text-gris-texto mt-2 font-sans text-[0.9rem] leading-relaxed">{final.texto}</p>
    </Link>
  );
}
