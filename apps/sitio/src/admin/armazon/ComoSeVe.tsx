import Image, { type StaticImageData } from "next/image";
import { LARGO_DE_BUSCADOR, recortarComoBuscador } from "@/lib/contenido/buscador";

// Las dos figuras de «Cómo se ve» (DESIGN.md §11, vista previa de buscador y
// redes): en Google y al compartir el link. Las usan la pestaña SEO de una
// página y el panel de una novedad, cada una con su dirección y su imagen.

const CAJA = "mt-2 rounded-xl border border-azul-claro/60";

/** Cómo se ve en Google: el dominio y el camino, y el título y la descripción cortados donde corta el buscador, con «…». */
export function EnGoogle({ url, titulo, descripcion }: { url: URL; titulo: string; descripcion: string }) {
  // El camino como lo muestra el buscador: legible, no codificado («…», no «%E2%80%A6»).
  const ruta = decodeURI(url.pathname);
  const camino = ruta === "/" ? "" : ` › ${ruta.slice(1).replaceAll("/", " › ")}`;
  return (
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
  );
}

type PropsAlCompartir = {
  url: URL;
  titulo: string;
  descripcion: string;
  imagen: string | StaticImageData;
  /** Qué imagen es, escrito: la figura es ilustración y la imagen va con alt vacío. */
  dice: string;
  /** Una imagen que el admin genera con la sesión: el optimizador de Next la pediría sin la cookie. */
  sinOptimizar?: boolean;
  /** El ancho en que se dibuja, para el `sizes` de la imagen. */
  sizes: string;
};

/** Cómo se ve al compartir el link: la imagen en 1200 × 630, recortada desde el centro como la recortan las redes. */
export function AlCompartir({ url, titulo, descripcion, imagen, dice, sinOptimizar, sizes }: PropsAlCompartir) {
  return (
    <figure>
      <figcaption className="text-admin-meta font-medium">Al compartir el link</figcaption>
      <div className={`${CAJA} overflow-hidden`}>
        <div className="relative aspect-40/21 bg-gris-fondo">
          <Image src={imagen} alt="" fill sizes={sizes} unoptimized={sinOptimizar} className="object-cover" />
        </div>
        <div className="border-t border-azul-claro/60 p-4">
          <p className="text-admin-meta text-gris-texto">{url.host}</p>
          <p className="mt-1 font-medium">{titulo}</p>
          <p className="mt-1 line-clamp-2 text-admin-meta text-gris-texto">{descripcion}</p>
        </div>
      </div>
      <p className="mt-2 text-admin-meta text-gris-texto">{dice}</p>
    </figure>
  );
}
