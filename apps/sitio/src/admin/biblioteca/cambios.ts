import { dondeEsta } from "@/features/biblioteca/contenido/etiquetas";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { fechaDelSitio, firmaDe } from "@/features/biblioteca/contenido/modelo";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";
import { posicionDelFoco } from "@/lib/contenido/fotos";

// «Qué cambió» de un material (DESIGN.md §11): lo que está en pantalla contra
// lo publicado, campo por campo, con las etiquetas del formulario. Escrita a
// mano, como la de una novedad (AGENTS.md §12). Pura: corre en el navegador.

const texto = (t: string): Legible => (t.trim() ? { tipo: "texto", texto: t } : { tipo: "nada" });
const iguales = (a: Legible, b: Legible) => JSON.stringify(a) === JSON.stringify(b);

/** Cada campo, como se lee: el camino (para la etiqueta) y su valor legible. `persona` es cómo se llama cada clave del Equipo. */
function campos(d: BorradorDeMaterial, persona: (clave: string) => string): Array<[string, Legible]> {
  const autores = d.autorias.map((a) => (a.persona ? `${a.nombre} (${persona(a.persona)})` : a.nombre)).join("\n");
  const portada: Legible = d.portada?.src ? { tipo: "foto", src: d.portada.src, alt: d.portada.alt, foco: posicionDelFoco(d.portada.foco) } : texto(d.portada ? "" : "La generada");
  return [
    ["titulo", texto(d.titulo)],
    ["descripcion", texto(d.descripcion)],
    ["tipo", texto(d.tipo)],
    ["tema", texto(d.tema)],
    ["publico", texto(d.publico)],
    ["fecha", texto(d.fecha ? fechaDelSitio(d.fecha) : "")],
    ["formato", texto(d.formato)],
    ["paginas", texto(d.paginas === null ? "" : String(d.paginas))],
    ["autorias", texto(autores)],
    ["autores", texto(d.autores ? d.autores : firmaDe({ autores: null, autorias: d.autorias }))],
    ["url", texto(d.url)],
    ["fuente", texto(d.fuente)],
    ["doi", texto(d.doi)],
    ["portada", portada],
    ["cita", texto(d.cita || "La generada")],
    ["destacado", texto(d.destacado === null ? "No" : `Lugar ${d.destacado}`)],
    ["rotulo", texto(d.rotulo)],
    ["frase", texto(d.frase)],
    ["detalle", texto(d.detalle)],
  ];
}

/** Las diferencias entre lo publicado y lo que hay, en el orden del formulario. */
export function cambiosDeMaterial(antes: BorradorDeMaterial, despues: BorradorDeMaterial, persona: (clave: string) => string = (clave) => clave): Diferencia[] {
  const a = campos(antes, persona);
  const b = campos(despues, persona);
  return a.flatMap(([camino, valor], i): Diferencia[] => (iguales(valor, b[i][1]) ? [] : [{ donde: [dondeEsta([camino])], antes: valor, despues: b[i][1] }]));
}
