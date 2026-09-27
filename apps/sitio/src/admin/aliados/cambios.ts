import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { dondeEstaEnElAliado } from "@/features/aliados/contenido/etiquetas";
import { TAMANOS } from "@/features/aliados/contenido/modelo";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";
import { posicionDelFoco } from "@/lib/contenido/fotos";

// «Qué cambió» de un aliado (`work/casos-aliados-fotos/SPEC.md` §6): lo que
// está en pantalla contra lo publicado, campo por campo. Escrita a mano, como
// la de una novedad. Pura: corre en el navegador.

const texto = (t: string): Legible => (t.trim() ? { tipo: "texto", texto: t } : { tipo: "nada" });

function campos(d: BorradorDeAliado): Array<[string[], Legible]> {
  return [
    [["nombre"], texto(d.nombre)],
    [["logo"], d.logo.src ? { tipo: "foto", src: d.logo.src, alt: d.logo.alt, foco: posicionDelFoco(d.logo.foco) } : { tipo: "nada" }],
    [["tamano"], texto(TAMANOS.find((t) => t.valor === d.tamano)?.etiqueta ?? d.tamano)],
    [["url"], texto(d.url)],
  ];
}

/** Las diferencias entre lo publicado y lo que hay, en el orden del formulario. */
export function cambiosDelAliado(antes: BorradorDeAliado, despues: BorradorDeAliado): Diferencia[] {
  const a = campos(antes);
  const b = campos(despues);
  return a.flatMap(([camino, valor], i): Diferencia[] =>
    JSON.stringify(valor) === JSON.stringify(b[i][1]) ? [] : [{ donde: [dondeEstaEnElAliado(camino)], antes: valor, despues: b[i][1] }],
  );
}
