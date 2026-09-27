import { BotonEnlace } from "@/admin/armazon/Boton";
import { ArrowUpRight } from "@/components/ui/icons";
import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { altoDe } from "@/features/aliados/contenido/modelo";
import { LogoEnLaTira } from "./LogoEnLaTira";

type Props = { form: BorradorDeAliado; autorizado: boolean; enElSitio: boolean };

/** Dónde está la tira, con el renglón de cada una. */
const LUGARES = [
  { lugar: "El pie de todas las páginas", detalle: "En la tira de aliados, al final." },
  { lugar: "Inicio", detalle: "Debajo de «En números»." },
  { lugar: "Qué hacemos", detalle: "En «Nos acompañan», al cierre de «Cómo trabajamos»." },
];

/**
 * El panel de la ficha de un aliado (DESIGN.md §11, «Ficha de una entidad»):
 * «Cómo se ve», el logo en la tira con lo que hay en pantalla, y «Se ve en».
 * Sin la autorización no se ve en ningún lado, y lo dice antes que nada.
 */
export function PanelDelAliado({ form, autorizado, enElSitio }: Props) {
  let aviso: string | null = null;
  if (!autorizado) aviso = "En ningún lado: sin la autorización de este logo y este nombre, no se publica.";
  else if (!enElSitio) aviso = "Todavía no está en el sitio. Al publicarlo, va a estar en:";
  return (
    <aside aria-label="El aliado en el sitio" className="space-y-10">
      <section aria-labelledby="panel-como-se-ve" className="space-y-4">
        <h2 id="panel-como-se-ve" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
          Cómo se ve
        </h2>
        <LogoEnLaTira src={form.logo.src} alt={form.logo.alt} alto={altoDe(form.tamano).inicio} className="px-6 py-5" />
        <p className="text-admin-meta text-gris-texto">Así, en blanco sobre el azul, a la altura de la tira del Inicio.</p>
      </section>
      <section aria-labelledby="panel-se-ve-en" className="space-y-4">
        <h2 id="panel-se-ve-en" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
          Se ve en
        </h2>
        {aviso ? <p className="text-admin-meta text-gris-texto">{aviso}</p> : null}
        {autorizado ? (
          <ul className="divide-y divide-azul-claro/60">
            {LUGARES.map(({ lugar, detalle }) => (
              <li key={lugar} className="py-2 first:pt-0">
                <p className="text-admin-meta font-medium">{lugar}</p>
                <p className="text-admin-meta text-gris-texto">{detalle}</p>
              </li>
            ))}
          </ul>
        ) : null}
        {enElSitio && autorizado ? (
          <BotonEnlace variante="terciario" href="/" target="_blank" rel="noreferrer" className="-ml-4">
            Ver en el sitio
            <ArrowUpRight size={16} className="shrink-0" />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </BotonEnlace>
        ) : null}
      </section>
    </aside>
  );
}
