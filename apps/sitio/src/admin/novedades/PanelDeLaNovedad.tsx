"use client";

import { Boton, CampoFoto, resolverCambio, type Cambio } from "@ed/kit-admin";
import { AlCompartir, EnGoogle } from "@/admin/armazon/ComoSeVe";
import { siteConfig } from "@/config/site";
import { subirFoto } from "@/datos/acciones/fotos";
import type { Vecinas } from "@/datos/consultas/ficha-de-novedad";
import { fotoVacia } from "@/features/novedades/contenido/modelo";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import type { NovedadEnElFormulario } from "./formulario";
import { SeVeEn } from "./SeVeEn";
import { useImagenGenerada } from "./useImagenGenerada";

type Props = {
  form: NovedadEnElFormulario;
  cambiarImagen: (cambio: Cambio<NovedadEnElFormulario["imagenParaRedes"]>) => void;
  /** El error del último guardado en la imagen para redes, si hay. */
  error?: string;
  id: string | null;
  vecinas: Vecinas;
  /** Lo que está en el sitio, o nada si no está publicada: «Ver en el sitio» lleva ahí. */
  enElSitio: BorradorDeNovedad | null;
};

/**
 * El panel de la ficha (SPEC §6.2 de `work/novedades-y-kit/`): cómo se ve en
 * Google y al compartir, en vivo con lo que está en pantalla; la imagen para
 * redes, la generada o una propia; y dónde se ve en el sitio. Al lado del
 * formulario desde `lg`, abajo en el celular.
 */
export function PanelDeLaNovedad({ form, cambiarImagen, error, id, vecinas, enElSitio }: Props) {
  const generada = useImagenGenerada({ titulo: form.titulo, categoria: form.categoria, fecha: form.fecha });
  const url = new URL(`/novedades/${form.slug || "…"}`, siteConfig.url);
  const propia = form.imagenParaRedes;
  let dice = "La generada, con el título, la categoría y la fecha.";
  if (propia?.src) dice = `Imagen propia: ${propia.alt || "sin texto alternativo todavía"}.`;
  else if (propia) dice = "Todavía sin archivo: mientras, va la generada.";

  return (
    <aside aria-label="La novedad en el sitio" className="space-y-10">
      <section aria-labelledby="panel-como-se-ve" className="space-y-5">
        <h2 id="panel-como-se-ve" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
          Cómo se ve
        </h2>
        {/* El título de la pestaña lleva el nombre del sitio (el template del layout); al compartir, va solo. */}
        <EnGoogle url={url} titulo={[form.titulo.trim(), siteConfig.name].filter(Boolean).join(" | ")} descripcion={form.bajada} />
        <AlCompartir
          url={url}
          titulo={form.titulo}
          descripcion={form.bajada}
          imagen={propia?.src || generada}
          sinOptimizar={!propia?.src}
          dice={dice}
          sizes="(min-width: 1024px) 352px, 100vw"
        />
        {/* Un solo botón que cambia de nombre: el foco se queda en él, en vez de caer al vacío cuando se va. El `-ml-4` alinea su texto con el borde de las figuras. */}
        <Boton variante="terciario" className="-ml-4" onClick={() => cambiarImagen(propia ? null : fotoVacia())}>
          {propia ? "Volver a la generada" : "Usar otra"}
        </Boton>
        {propia ? (
          <CampoFoto
            nombre="imagenParaRedes"
            etiqueta="Imagen para redes"
            ayuda="Reemplaza a la generada al compartir el link. Las redes la recortan a 1200 × 630 desde el centro."
            valor={propia}
            alCambiar={(v) => cambiarImagen((actual) => resolverCambio(v, actual ?? fotoVacia()))}
            subir={subirFoto}
            maximoBytes={MAXIMO_BYTES}
            error={error}
          />
        ) : null}
      </section>
      <SeVeEn form={form} id={id} vecinas={vecinas} enElSitio={enElSitio} />
    </aside>
  );
}
