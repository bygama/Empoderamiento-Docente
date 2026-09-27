import { BotonEnlace } from "@/admin/armazon/Boton";
import { Momento } from "@/admin/armazon/Momento";
import { ArrowUpRight } from "@/components/ui/icons";
import type { ChequeoDelLink } from "@/datos/consultas/ficha-de-material";
import type { MaterialEnElFormulario } from "./formulario";

type Props = {
  form: MaterialEnElFormulario;
  chequeo: ChequeoDelLink;
  /** Si el sitio lo muestra: «Ver en el sitio» lleva al catálogo. */
  publicado: boolean;
  /** El link y el DOI de lo publicado: si cambiaron en pantalla, el chequeo de arriba es del viejo. */
  linkPublicado: { url: string; doi: string } | null;
  novedades: ReadonlyArray<{ slug: string; titulo: string }>;
};

const RESULTADO: Record<string, string> = { bien: "Anda", roto: "Roto", "sin-respuesta": "Sin respuesta", "sin-chequear": "No se chequea" };

function Titulo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
      {children}
    </h2>
  );
}

/**
 * El panel de la ficha de un material (SPEC §9.2 de `work/biblioteca/`): la
 * salud del link —el último chequeo, su resultado y qué pasó— y dónde se ve
 * en el sitio. Al lado del formulario desde `xl`, abajo en pantallas más
 * chicas (DESIGN.md §11, «Ficha de una entidad»).
 */
export function PanelDelMaterial({ form, chequeo, publicado, linkPublicado, novedades }: Props) {
  const otroLink = linkPublicado !== null && (linkPublicado.url !== form.url || linkPublicado.doi !== form.doi);
  const lugares = [
    { lugar: "Biblioteca › Catálogo", detalle: "En la lista, por año, con los filtros de tipo, público y año." },
    ...(form.destacado === null
      ? []
      : [
          { lugar: "Biblioteca › Material destacado", detalle: `En el lugar ${form.destacado} de los cuatro.` },
          { lugar: "Inicio", detalle: "Con los destacados de la Biblioteca, al lado de las novedades." },
        ]),
    ...novedades.map((n) => ({ lugar: `Novedades › «${n.titulo}»`, detalle: "Termina con el botón que lo abre, mientras esté publicado." })),
  ];
  return (
    <aside aria-label="El material en el sitio" className="space-y-10">
      <section aria-labelledby="panel-salud" className="space-y-3">
        <Titulo id="panel-salud">Salud del link</Titulo>
        {chequeo ? (
          <dl className="space-y-1 text-admin-meta">
            <div className="flex gap-2">
              <dt className="text-gris-texto">Resultado:</dt>
              <dd className="font-medium">{RESULTADO[chequeo.resultado] ?? chequeo.resultado}</dd>
            </div>
            {chequeo.detalle ? (
              <div>
                <dt className="sr-only">Qué pasó:</dt>
                <dd className="text-gris-texto">{chequeo.detalle}</dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="text-gris-texto">Último chequeo:</dt>
              <dd>
                <Momento iso={chequeo.en} relativo />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-admin-meta text-gris-texto">Todavía no se chequeó.</p>
        )}
        <p className="text-admin-meta text-gris-texto">
          {otroLink
            ? "Cambiaste el link: el chequeo de arriba es del anterior. El nuevo se chequea el día después de publicarlo."
            : "Se chequea una vez por semana: los DOI en doi.org, los demás en su página. Solo un link que ya no está cuenta como roto."}
        </p>
      </section>
      <section aria-labelledby="panel-se-ve-en" className="space-y-4">
        <Titulo id="panel-se-ve-en">Se ve en</Titulo>
        {publicado ? null : <p className="text-admin-meta text-gris-texto">Todavía no está en el sitio. Al publicarlo, va a estar en:</p>}
        <ul className="divide-y divide-azul-claro/60">
          {lugares.map(({ lugar, detalle }) => (
            <li key={lugar} className="py-2 first:pt-0">
              <p className="text-admin-meta font-medium">{lugar}</p>
              <p className="text-admin-meta break-words text-gris-texto">{detalle}</p>
            </li>
          ))}
        </ul>
        {publicado ? (
          <BotonEnlace variante="terciario" href="/biblioteca#materiales" target="_blank" rel="noreferrer" className="-ml-4">
            Ver en el sitio
            <ArrowUpRight size={16} className="shrink-0" />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </BotonEnlace>
        ) : null}
      </section>
    </aside>
  );
}
