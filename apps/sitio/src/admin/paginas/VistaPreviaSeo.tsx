import { AlCompartir, EnGoogle } from "@/admin/armazon/ComoSeVe";
// La imagen que el sitio manda cuando la página no tiene una propia: la misma
// que Next sirve como `opengraph-image`. Se importa el archivo, no se copia.
import imagenDelSitio from "@/app/(sitio)/opengraph-image.png";
import { siteConfig } from "@/config/site";

type Leido = { titulo: string; descripcion: string; imagen: { src: string; alt: string } | null };

/** El SEO que hay en pantalla, leído con cuidado: puede estar a medio escribir. */
function leer(valor: unknown): Leido {
  const seo = (typeof valor === "object" && valor !== null ? valor : {}) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v : "");
  const imagen = seo.imagenParaRedes as { src?: unknown; alt?: unknown } | null | undefined;
  return {
    titulo: texto(seo.titulo),
    descripcion: texto(seo.descripcion),
    imagen: imagen && texto(imagen.src) ? { src: texto(imagen.src), alt: texto(imagen.alt) } : null,
  };
}

/**
 * Cómo se ve la página en Google y al compartir el link (SPEC §6 de
 * `work/paginas-inicio/`), en vivo con lo que está en el formulario. Google
 * corta donde corta, con «…»: la vista previa también. Las redes recortan la
 * imagen a 1200 × 630 desde el centro. Todo es ilustración: la imagen va con
 * alt vacío y lo que dice va escrito debajo.
 */
export function VistaPreviaSeo({ valor, ruta }: { valor: unknown; ruta: string }) {
  const { titulo, descripcion, imagen } = leer(valor);
  const url = new URL(ruta, siteConfig.url);
  return (
    <section aria-labelledby="vista-previa-seo" className="space-y-4">
      <h2 id="vista-previa-seo" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Cómo se ve
      </h2>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <EnGoogle url={url} titulo={titulo} descripcion={descripcion} />
        <AlCompartir
          url={url}
          titulo={titulo}
          descripcion={descripcion}
          imagen={imagen?.src ?? imagenDelSitio}
          dice={imagen ? `Imagen propia: ${imagen.alt || "sin texto alternativo todavía"}.` : "Sin imagen propia: va la del sitio."}
          sizes="(min-width: 1024px) 480px, 100vw"
        />
      </div>
    </section>
  );
}
