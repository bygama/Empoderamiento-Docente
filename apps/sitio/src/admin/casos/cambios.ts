import type { BorradorDeCaso } from "@/features/investigacion/contenido/caso";
import { dondeEstaEnElCaso } from "@/features/investigacion/contenido/etiquetas-de-casos";
import { ESTADOS, SUJECIONES } from "@/features/investigacion/contenido/modelo-de-casos";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";
import { posicionDelFoco } from "@/lib/contenido/fotos";

// «Qué cambió» de un caso (`work/casos-aliados-fotos/SPEC.md` §6): lo que está
// en pantalla contra lo publicado, campo por campo, con las etiquetas del
// formulario. Escrita a mano, como la de una novedad (AGENTS.md §12). Pura:
// corre en el navegador.

const texto = (t: string): Legible => (t.trim() ? { tipo: "texto", texto: t } : { tipo: "nada" });
const siNo = (b: boolean): Legible => texto(b ? "Sí" : "No");
const iguales = (a: Legible, b: Legible) => JSON.stringify(a) === JSON.stringify(b);
const etiquetaDe = (lista: ReadonlyArray<{ valor: string; etiqueta: string }>, valor: string) => lista.find((x) => x.valor === valor)?.etiqueta ?? valor;

type Campo = [camino: Array<string | number>, valor: Legible];

/** Los campos sueltos, en el orden del formulario (sin las dos listas). */
function sueltos(d: BorradorDeCaso): Campo[] {
  const f = d.lamina.foto;
  return [
    [["pregunta"], texto(d.pregunta)],
    [["eje"], texto(d.eje)],
    [["indicio"], texto(d.indicio)],
    [["slug"], texto(d.slug ? `/investigacion#${d.slug}` : "")],
    [["periodo"], texto(d.periodo)],
    [["ambito"], texto(d.ambito)],
    [["estado"], texto(etiquetaDe(ESTADOS, d.estado))],
    [["contexto"], texto(d.contexto)],
    [["preguntaInvestigacion"], texto(d.preguntaInvestigacion)],
    [["analisis"], texto(d.analisis)],
    [["aprendizaje"], texto(d.aprendizaje)],
    [["queCambio"], texto(d.queCambio)],
    [["lamina", "foto"], f.src ? { tipo: "foto", src: f.src, alt: f.alt, foco: posicionDelFoco(f.foco) } : { tipo: "nada" }],
    [["lamina", "sujecion"], texto(etiquetaDe(SUJECIONES, d.lamina.sujecion))],
    [["lamina", "rotulo"], texto(d.lamina.rotulo)],
    [["esDemo"], siNo(d.esDemo)],
    [["aclaracion"], texto(d.aclaracion)],
  ];
}

/** Los ítems de una lista, parte por parte: uno que se agrega o se va es «Nada» del otro lado. */
function items(lista: "evidencias" | "produccionRelacionada", d: BorradorDeCaso, cuantos: number): Campo[] {
  return Array.from({ length: cuantos }, (_, i): Campo[] => {
    if (lista === "evidencias") {
      const e = d.evidencias[i];
      return [
        [[lista, i, "titulo"], texto(e?.titulo ?? "")],
        [[lista, i, "descripcion"], texto(e?.descripcion ?? "")],
        [[lista, i, "movible"], e ? siNo(e.movible) : { tipo: "nada" }],
      ];
    }
    const p = d.produccionRelacionada[i];
    return [
      [[lista, i, "titulo"], texto(p?.titulo ?? "")],
      [[lista, i, "href"], texto(p?.href ?? "")],
    ];
  }).flat();
}

function distintos(antes: Campo[], despues: Campo[]): Diferencia[] {
  return antes.flatMap(([camino, valor], i): Diferencia[] =>
    iguales(valor, despues[i][1]) ? [] : [{ donde: dondeEstaEnElCaso(camino).split(" › "), antes: valor, despues: despues[i][1] }],
  );
}

/** Las diferencias entre lo publicado y lo que hay, en el orden del formulario. */
export function cambiosDelCaso(antes: BorradorDeCaso, despues: BorradorDeCaso): Diferencia[] {
  const e = Math.max(antes.evidencias.length, despues.evidencias.length);
  const p = Math.max(antes.produccionRelacionada.length, despues.produccionRelacionada.length);
  return [
    ...distintos(sueltos(antes), sueltos(despues)),
    ...distintos(items("evidencias", antes, e), items("evidencias", despues, e)),
    ...distintos(items("produccionRelacionada", antes, p), items("produccionRelacionada", despues, p)),
  ];
}
