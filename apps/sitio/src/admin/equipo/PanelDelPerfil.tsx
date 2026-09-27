import { BotonEnlace } from "@/admin/armazon/Boton";
import { ArrowUpRight } from "@/components/ui/icons";
import { rotuloDelNivel, type Nivel } from "@/features/quienes-somos/contenido/modelo-del-equipo";

type Props = {
  nivel: Nivel | null;
  /** Si tiene recorrido: su tarjeta abre el perfil inmersivo, si no, el básico. */
  conRecorrido: boolean;
  /** El slug publicado, si el sitio lo muestra: «Ver en el sitio» abre su perfil. */
  slugPublicado: string | null;
};

/**
 * El panel de la ficha de un perfil (SPEC §7.2 de `work/equipo/`): dónde se
 * ve en el sitio. Al lado del formulario desde `xl`, abajo en pantallas más
 * chicas (DESIGN.md §11, «Ficha de una entidad»).
 */
export function PanelDelPerfil({ nivel, conRecorrido, slugPublicado }: Props) {
  const lugares = [
    { lugar: "Quiénes somos › Quiénes sostienen ED", detalle: nivel === null ? "Su tarjeta, en su nivel, cuando lo tenga." : `Su tarjeta, en «${rotuloDelNivel(nivel)}».` },
    {
      lugar: "Su perfil",
      detalle: `${conRecorrido ? "El recorrido, con sus etapas y sus publicaciones" : "La foto, el nombre, el rol y el país"}: se abre al tocar su tarjeta, y con su link desde afuera.`,
    },
  ];
  return (
    <aside aria-label="El perfil en el sitio" className="space-y-4">
      <h2 id="panel-se-ve-en" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Se ve en
      </h2>
      {slugPublicado ? null : <p className="text-admin-meta text-gris-texto">Todavía no está en el sitio. Al publicarlo, va a estar en:</p>}
      <ul className="divide-y divide-azul-claro/60">
        {lugares.map(({ lugar, detalle }) => (
          <li key={lugar} className="py-2 first:pt-0">
            <p className="text-admin-meta font-medium">{lugar}</p>
            <p className="text-admin-meta break-words text-gris-texto">{detalle}</p>
          </li>
        ))}
      </ul>
      {slugPublicado ? (
        <BotonEnlace variante="terciario" href={`/quienes-somos?persona=${encodeURIComponent(slugPublicado)}`} target="_blank" rel="noreferrer" className="-ml-4">
          Ver en el sitio
          <ArrowUpRight size={16} className="shrink-0" />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </BotonEnlace>
      ) : null}
    </aside>
  );
}
