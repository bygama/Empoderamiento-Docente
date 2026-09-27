import { BotonEnlace } from "@/admin/armazon/Boton";
import { ArrowUpRight } from "@/components/ui/icons";
import type { Vecinas } from "@/datos/consultas/ficha-de-novedad";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import type { NovedadEnElFormulario } from "./formulario";
import { dondeSeVe } from "./se-ve-en";

type Props = {
  form: NovedadEnElFormulario;
  id: string | null;
  vecinas: Vecinas;
  /** Lo que está en el sitio, o nada si no está publicada. */
  enElSitio: BorradorDeNovedad | null;
};

/**
 * «Se ve en»: dónde está la novedad en el sitio con lo que hay en pantalla
 * (`se-ve-en.ts`), y «Ver en el sitio» si está publicada, a su ficha o, si no
 * tiene, a Novedades.
 */
export function SeVeEn({ form, id, vecinas, enElSitio }: Props) {
  const lugares = dondeSeVe({ id, slug: form.slug, fecha: form.fecha, destacada: form.destacada, conCuerpo: form.cuerpo.length > 0 }, vecinas);
  const enlace = enElSitio && enElSitio.cuerpo.length > 0 ? `/novedades/${enElSitio.slug}` : "/novedades";
  return (
    <section aria-labelledby="panel-se-ve-en" className="space-y-4">
      <h2 id="panel-se-ve-en" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Se ve en
      </h2>
      {enElSitio ? null : <p className="text-admin-meta text-gris-texto">Todavía no está en el sitio. Al publicarla, va a estar en:</p>}
      <ul className="divide-y divide-azul-claro/60">
        {lugares.map(({ lugar, detalle }) => (
          <li key={lugar} className="py-2 first:pt-0">
            <p className="text-admin-meta font-medium">{lugar}</p>
            <p className="text-admin-meta break-words text-gris-texto">{detalle}</p>
          </li>
        ))}
      </ul>
      {enElSitio ? (
        <BotonEnlace variante="terciario" href={enlace} target="_blank" rel="noreferrer" className="-ml-4">
          Ver en el sitio
          <ArrowUpRight size={16} className="shrink-0" />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </BotonEnlace>
      ) : null}
    </section>
  );
}
