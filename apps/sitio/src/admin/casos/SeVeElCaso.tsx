import { BotonEnlace } from "@ed/kit-admin";
import { ArrowUpRight } from "@/components/ui/icons";
import { CASO_DE_CADA_LINEA, type IdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";

type Props = { id: IdDeCaso; numero: string; slug: string; slugPublicado: string };

/**
 * «Se ve en» de un caso (DESIGN.md §11, «Ficha de una entidad»): solo lo que
 * existe. La pila de Investigación, con su link directo, y las líneas cuyo
 * «Ver en acción» lo abre. Las fichas propias de cada caso son de la fase 4
 * (SPEC padre §10) y no se listan.
 */
export function SeVeElCaso({ id, numero, slug, slugPublicado }: Props) {
  const lineas = CASO_DE_CADA_LINEA.filter((c) => c === id).length;
  const lugares = [
    { lugar: "Investigación", detalle: `En la pila de casos, la carpeta ${numero} de dos. Su link directo: /investigacion#${slug || "…"}` },
    ...(lineas
      ? [{ lugar: "Líneas de investigación", detalle: `«Ver en acción» de ${lineas === 1 ? "una línea lo abre" : `${lineas} líneas lo abre`}.` }]
      : []),
  ];
  return (
    <section aria-labelledby="panel-se-ve-en" className="space-y-4">
      <h2 id="panel-se-ve-en" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Se ve en
      </h2>
      <ul className="divide-y divide-azul-claro/60">
        {lugares.map(({ lugar, detalle }) => (
          <li key={lugar} className="py-2 first:pt-0">
            <p className="text-admin-meta font-medium">{lugar}</p>
            <p className="text-admin-meta break-words text-gris-texto">{detalle}</p>
          </li>
        ))}
      </ul>
      <BotonEnlace variante="terciario" href={`/investigacion#${slugPublicado}`} target="_blank" rel="noreferrer" className="-ml-4">
        Ver en el sitio
        <ArrowUpRight size={16} className="shrink-0" />
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </BotonEnlace>
    </section>
  );
}
