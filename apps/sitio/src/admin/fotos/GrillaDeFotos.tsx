import Link from "next/link";
import type { TarjetaDeFoto } from "@/datos/consultas/fotos";
import { cuantosUsos } from "./formato";
import { MiniaturaDeFoto } from "./MiniaturaDeFoto";

/**
 * La grilla de la biblioteca (DESIGN.md §11, «Grilla de fotos»): dos
 * columnas, tres desde `sm`, cuatro desde `lg`. Cada tarjeta entera es el
 * link a su ficha, como una del índice: el nombre es el texto alternativo
 * (o «Sin texto alternativo», que es lo que falta), y cuántos usos tiene va
 * como descripción. La miniatura es decorativa: el alt ya está escrito.
 */
export function GrillaDeFotos({ fotos }: { fotos: readonly TarjetaDeFoto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {fotos.map((f) => (
        <li
          key={f.id}
          className="relative flex flex-col gap-3 rounded-xl border border-azul-claro/60 bg-white p-3 transition-colors hover:border-azul-medio has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-azul-medio"
        >
          <MiniaturaDeFoto src={f.src} tipo={f.tipo} sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw" />
          <Link
            href={`/admin/contenido/fotos/${f.id}`}
            aria-describedby={`foto-${f.id}-usos`}
            className={`line-clamp-3 text-admin-meta break-words focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl ${f.alt ? "" : "font-medium"}`}
          >
            {f.alt || "Sin texto alternativo"}
          </Link>
          <p id={`foto-${f.id}-usos`} className="mt-auto text-admin-meta text-gris-texto">
            {cuantosUsos(f.usos)}
          </p>
        </li>
      ))}
    </ul>
  );
}
