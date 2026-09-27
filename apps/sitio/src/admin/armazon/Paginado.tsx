import { BotonEnlace } from "@ed/kit-admin";

/**
 * Las páginas de una lista larga, paginada en el servidor (DESIGN.md §11,
 * «Paginado»): «Más nuevas», dónde estás y «Más viejas», porque las listas
 * largas del admin van de la más nueva a la más vieja. Son links: cada página
 * tiene su URL, con los filtros que tenga (`hrefDe`). Con una sola página no
 * se dibuja. No sabe de ED.
 */
export function Paginado({
  etiqueta,
  pagina,
  paginas,
  hrefDe,
}: {
  /** Para el `nav`: «Páginas de la actividad». */
  etiqueta: string;
  pagina: number;
  paginas: number;
  hrefDe: (pagina: number) => string;
}) {
  if (paginas <= 1) return null;
  return (
    <nav aria-label={etiqueta} className="flex flex-wrap items-center justify-between gap-3">
      {pagina > 1 ? (
        <BotonEnlace variante="secundario" href={hrefDe(pagina - 1)}>
          Más nuevas
        </BotonEnlace>
      ) : (
        <span aria-hidden="true" />
      )}
      <p className="text-admin-meta text-gris-texto">
        Página {pagina} de {paginas}
      </p>
      {pagina < paginas ? (
        <BotonEnlace variante="secundario" href={hrefDe(pagina + 1)}>
          Más viejas
        </BotonEnlace>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
