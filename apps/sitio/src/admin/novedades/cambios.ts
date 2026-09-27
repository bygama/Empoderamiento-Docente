import { dondeEsta } from "@/features/novedades/contenido/etiquetas";
import { fechaCorta } from "@/features/novedades/contenido/fechas";
import { etiquetaDeCategoria } from "@/features/novedades/contenido/modelo";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";
import { posicionDelFoco, type ValorFoto } from "@/lib/contenido/fotos";

// «Qué cambió» de una novedad (SPEC §5.5 de `work/novedades-y-kit/`): lo que
// está en pantalla contra lo publicado, campo por campo, con las etiquetas del
// formulario. Escrita a mano, porque una entidad no se describe con el
// esquema de las páginas (AGENTS.md §12). Pura: corre en el navegador.

const texto = (t: string): Legible => (t.trim() ? { tipo: "texto", texto: t } : { tipo: "nada" });
const foto = (f: ValorFoto | null): Legible => (f?.src ? { tipo: "foto", src: f.src, alt: f.alt, foco: posicionDelFoco(f.foco) } : { tipo: "nada" });
const iguales = (a: Legible, b: Legible) => JSON.stringify(a) === JSON.stringify(b);

type Campo = [camino: string[], valor: Legible];

/** Los campos de arriba del formulario, como se leen: el camino (para la etiqueta) y su valor legible. */
function deArriba(d: BorradorDeNovedad): Campo[] {
  return [
    [["titulo"], texto(d.titulo)],
    [["bajada"], texto(d.bajada)],
    [["fecha"], texto(d.fecha ? fechaCorta(d.fecha) : "")],
    [["categoria"], texto(etiquetaDeCategoria(d.categoria))],
    [["destacada"], texto(d.destacada ? "Sí" : "No")],
    [["imagen"], foto(d.imagen)],
  ];
}

/** Los de abajo, después del cuerpo: los enlaces y la imagen para redes. */
function deAbajo(d: BorradorDeNovedad): Campo[] {
  return [
    [["publicacion"], texto(d.publicacion ?? "")],
    [["slug"], texto(d.slug ? `/novedades/${d.slug}` : "")],
    [["imagenParaRedes"], foto(d.imagenParaRedes)],
  ];
}

/** Los campos que no son iguales, con su etiqueta. */
function distintos(antes: Campo[], despues: Campo[]): Diferencia[] {
  return antes.flatMap(([camino, valor], i): Diferencia[] => (iguales(valor, despues[i][1]) ? [] : [{ donde: [dondeEsta(camino)], antes: valor, despues: despues[i][1] }]));
}

/** Las secciones del cuerpo, cada una con su título y su texto: una que se agrega o se va es «Nada» del otro lado. */
function cuerpo(antes: BorradorDeNovedad, despues: BorradorDeNovedad): Diferencia[] {
  const cuantas = Math.max(antes.cuerpo.length, despues.cuerpo.length);
  return Array.from({ length: cuantas }, (_, i) =>
    (["titulo", "parrafos"] as const).flatMap((parte): Diferencia[] => {
      const leer = (d: BorradorDeNovedad) => {
        const s = d.cuerpo[i];
        return texto(s ? (parte === "titulo" ? s.titulo : s.parrafos.join("\n")) : "");
      };
      const a = leer(antes);
      const b = leer(despues);
      return iguales(a, b) ? [] : [{ donde: dondeEsta(["cuerpo", i, parte]).split(" › "), antes: a, despues: b }];
    }),
  ).flat();
}

/** Las diferencias entre lo publicado y lo que hay, en el orden del formulario. */
export function cambiosDeNovedad(antes: BorradorDeNovedad, despues: BorradorDeNovedad): Diferencia[] {
  return [...distintos(deArriba(antes), deArriba(despues)), ...cuerpo(antes, despues), ...distintos(deAbajo(antes), deAbajo(despues))];
}
