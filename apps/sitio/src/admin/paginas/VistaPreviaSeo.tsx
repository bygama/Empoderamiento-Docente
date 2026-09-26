import Image from "next/image";
// La imagen que el sitio manda cuando la página no tiene una propia: la misma
// que Next sirve como `opengraph-image`. Se importa el archivo, no se copia.
import imagenDelSitio from "@/app/(sitio)/opengraph-image.png";
import { siteConfig } from "@/config/site";
import { LARGO_DE_BUSCADOR, recortarComoBuscador } from "@/lib/contenido/buscador";

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

const CAJA = "mt-2 rounded-xl border border-azul-claro/60";

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
  const camino = url.pathname === "/" ? "" : ` › ${url.pathname.slice(1).replaceAll("/", " › ")}`;
  return (
    <section aria-labelledby="vista-previa-seo" className="space-y-4">
      <h2 id="vista-previa-seo" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Cómo se ve
      </h2>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <figure>
          <figcaption className="text-admin-meta font-medium">En Google</figcaption>
          <div className={`${CAJA} p-4`}>
            <p className="text-admin-meta text-gris-texto">
              {url.host}
              {camino}
            </p>
            {/* El título como link de un resultado: `azul-medio` (5,11:1), sin ser un link. */}
            <p className="mt-1 font-display text-admin-seccion text-azul-medio">{recortarComoBuscador(titulo, LARGO_DE_BUSCADOR.titulo)}</p>
            <p className="mt-1 text-admin-meta text-gris-texto">{recortarComoBuscador(descripcion, LARGO_DE_BUSCADOR.descripcion)}</p>
          </div>
        </figure>
        <figure>
          <figcaption className="text-admin-meta font-medium">Al compartir el link</figcaption>
          <div className={`${CAJA} overflow-hidden`}>
            <div className="relative aspect-40/21 bg-gris-fondo">
              <Image src={imagen?.src ?? imagenDelSitio} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            </div>
            <div className="border-t border-azul-claro/60 p-4">
              <p className="text-admin-meta text-gris-texto">{url.host}</p>
              <p className="mt-1 font-medium">{titulo}</p>
              <p className="mt-1 line-clamp-2 text-admin-meta text-gris-texto">{descripcion}</p>
            </div>
          </div>
          <p className="mt-2 text-admin-meta text-gris-texto">{imagen ? `Imagen propia: ${imagen.alt || "sin texto alternativo todavía"}.` : "Sin imagen propia: va la del sitio."}</p>
        </figure>
      </div>
    </section>
  );
}
