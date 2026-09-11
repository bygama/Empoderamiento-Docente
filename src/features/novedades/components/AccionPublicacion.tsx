import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { accionDe, MATERIALES } from "@/features/biblioteca/data/materiales";

/**
 * Cierre de una ficha que habla de una publicación: el botón que abre el
 * archivo donde está publicado («Leer en RELIME», como en la Biblioteca) y
 * el link a la Biblioteca. Si el título no matchea el catálogo (typo al
 * editar la data), no se muestra nada.
 */
export function AccionPublicacion({ titulo }: { titulo: string }) {
  const material = MATERIALES.find((m) => m.titulo === titulo);
  if (!material) return null;
  const externa = !material.url.startsWith("/");
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
      <a
        href={material.url}
        target={externa ? "_blank" : undefined}
        rel={externa ? "noopener noreferrer" : undefined}
        className="group border-azul-principal/25 text-azul-principal hover:bg-azul-principal focus-visible:outline-verde-concepto inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-sans text-[0.95rem] font-medium transition-[background-color,color] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {accionDe(material)}
        <ArrowUpRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
      <Link
        href="/biblioteca#destacados"
        className="group text-azul-principal inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium"
      >
        Verla en la Biblioteca
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
