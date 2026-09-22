import Link from "next/link";
import { Momento } from "@/admin/armazon/Momento";
import type { FilaDeLista } from "@/datos/consultas/editor-de-paginas";

/** Las siete páginas en el orden del menú, con la marca «sin publicar» y la última publicación (SPEC §2). */
export function ListaDePaginas({ filas }: { filas: FilaDeLista[] }) {
  return (
    <ul className="divide-y divide-azul-claro rounded-xl border border-azul-claro bg-white">
      {filas.map((f) => (
        <li key={f.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-medium">
              {f.nombre} <span className="text-admin-meta text-gris-texto">{f.ruta}</span>
            </p>
            <p className="text-admin-meta text-gris-texto">
              {f.publicadoEn ? (
                <>
                  Publicado el <Momento iso={f.publicadoEn} />
                  {f.publicadoPor ? ` por ${f.publicadoPor}` : ""}
                </>
              ) : (
                "Muestra el contenido inicial del código."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {f.sinPublicar ? <span className="rounded-full bg-azul-claro/40 px-2.5 py-0.5 text-admin-meta font-medium text-azul-principal">Cambios sin publicar</span> : null}
            {f.editable ? (
              <Link href={`/admin/paginas/${f.slug}`} className="rounded-lg border border-azul-claro px-3 py-1.5 text-admin-meta text-azul-medio transition-opacity hover:opacity-80">
                Editar
              </Link>
            ) : (
              <span className="text-admin-meta text-gris-texto">Todavía no se edita desde acá</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
