import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ResolvingMetadata } from "next";
import { PAGINAS } from "@/contenido/paginas";
import { metadataDeSeo, type Seo } from "@/lib/contenido/seo";
import { openGraphDeLaPagina } from "./metadata";

// Una página hija con SEO propio pierde la imagen del sitio al compartirse si
// su `openGraph` no la hereda del layout: el de la página reemplaza el del
// layout entero, y Next deriva la tarjeta de X (twitter:image) del
// `openGraph` que queda (DECISIONS de work/paginas-investigacion-y-resto/).
// Pasó al sumar el SEO de Investigación y lo mostró comparar-render; esto es
// lo que hace que no vuelva sin depender de acordarse.

const IMAGEN_DEL_SITIO = { url: "https://empoderamientodocente.org/opengraph-image.png", width: 1200, height: 630, alt: "La del sitio" };

/** Lo que Next le pasa a `generateMetadata`: la metadata ya resuelta del layout. */
function padreConImagen(): ResolvingMetadata {
  // El `as` recorta el tipo: la función solo lee `openGraph.images` de lo resuelto.
  return Promise.resolve({ openGraph: { images: [IMAGEN_DEL_SITIO] } }) as unknown as ResolvingMetadata;
}

const SEO: Seo = { titulo: "Una página | Empoderamiento Docente", descripcion: "Lo que dice Google.", imagenParaRedes: null };

test("sin imagen propia, la página hereda la del sitio en Open Graph", async () => {
  const { openGraph } = metadataDeSeo(SEO, await openGraphDeLaPagina(padreConImagen()));
  assert.deepEqual(openGraph?.images, [IMAGEN_DEL_SITIO]);
  assert.equal(openGraph?.title, SEO.titulo);
});

test("con imagen propia, esa va en lugar de la del sitio", async () => {
  const propia = { src: "/fotos/una.webp", alt: "Una foto", foco: { x: 0.5, y: 0.5 } };
  const { openGraph } = metadataDeSeo({ ...SEO, imagenParaRedes: propia }, await openGraphDeLaPagina(padreConImagen()));
  assert.deepEqual(openGraph?.images, [{ url: propia.src, alt: propia.alt }]);
});

test("cada página hija con SEO arma su metadata heredando la imagen del layout", () => {
  const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../app/(sitio)");
  for (const pagina of Object.values(PAGINAS)) {
    if (!("seo" in pagina) || pagina.ruta === "/") continue;
    const fuente = readFileSync(path.join(app, pagina.ruta, "page.tsx"), "utf8");
    assert.match(fuente, /metadataDeSeo\([^)]*openGraphDeLaPagina\(padre\)/, `${pagina.ruta}: usá openGraphDeLaPagina(padre) o pierde la imagen al compartirse`);
  }
});
