import { dondeEsta } from "@/features/quienes-somos/contenido/etiquetas-de-persona";
import { rotuloDelNivel } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";
import { posicionDelFoco } from "@/lib/contenido/fotos";

// «Qué cambió» de un perfil del Equipo (DESIGN.md §11): lo que está en
// pantalla contra lo publicado, campo por campo y, en el recorrido, etapa por
// etapa, con las etiquetas del formulario. Escrita a mano, como la de un
// material (AGENTS.md §12). Pura: corre en el navegador.

type Recorrido = NonNullable<BorradorDePersona["recorrido"]>;
type Etapa = Recorrido["etapas"][number];
type Foto = { src: string; alt: string; foco: { x: number; y: number } } | null;

/** Cómo se llama un material de la Biblioteca por su id. */
export type NombreDeMaterial = (id: string) => string;

const texto = (t: string): Legible => (t.trim() ? { tipo: "texto", texto: t } : { tipo: "nada" });
const lineas = (l: readonly string[]) => texto(l.join("\n"));
const foto = (f: Foto): Legible => (f?.src ? { tipo: "foto", src: f.src, alt: f.alt, foco: posicionDelFoco(f.foco) } : { tipo: "nada" });
const iguales = (a: Legible, b: Legible) => JSON.stringify(a) === JSON.stringify(b);

function deLaEtapa(e: Etapa | undefined, i: number, categorias: Recorrido["categorias"], material: NombreDeMaterial): Array<[PropertyKey[], Legible]> {
  const en = (campo: string): PropertyKey[] => ["recorrido", "etapas", i, campo];
  const publicacion = (p: Etapa["publicaciones"][number]) =>
    `${p.origen === "biblioteca" ? (p.material ? material(p.material) : "Sin elegir") : `${p.titulo} (sin link)`}${p.destacada ? " · destacada" : ""}${p.detalle ? ` — ${p.detalle}` : ""}`;
  return [
    [en("volanta"), texto(e?.volanta ?? "")],
    [en("periodo"), texto(e?.periodo ?? "")],
    [en("titulo"), texto(e?.titulo ?? "")],
    [en("texto"), texto(e?.texto ?? "")],
    [en("composicion"), texto(e?.composicion ?? "")],
    [en("color"), texto(e?.color ?? "")],
    [en("categoria"), texto(categorias.find((c) => c.clave === e?.categoria)?.etiqueta ?? e?.categoria ?? "")],
    [en("cita"), texto(e?.cita ?? "")],
    [en("hitos"), lineas((e?.hitos ?? []).map((h) => [h.periodo, h.titulo, h.detalle].filter(Boolean).join(" · ") + (h.principal ? " (principal)" : "")))],
    [en("ramas"), lineas((e?.ramas ?? []).map((r) => [r.periodo, r.lugar, r.detalle].filter(Boolean).join(" · ")))],
    [en("territorios"), lineas(e?.territorios ?? [])],
    [en("publicaciones"), lineas((e?.publicaciones ?? []).map(publicacion))],
  ];
}

function delRecorrido(r: Recorrido | null, cuantasEtapas: number, material: NombreDeMaterial): Array<[PropertyKey[], Legible]> {
  const en = (campo: string): PropertyKey[] => ["recorrido", campo];
  const figura = r ? (r.figura.tipo === "sin" ? texto("Sin foto") : foto(r.figura.foto)) : { tipo: "nada" as const };
  return [
    [["recorrido"], texto(r ? "Tiene recorrido" : "Solo el perfil básico")],
    [en("nombreCompleto"), texto(r?.nombreCompleto ?? "")],
    [en("rolCompleto"), texto(r?.rolCompleto ?? "")],
    [en("lugar"), texto(r?.lugar ?? "")],
    [en("origen"), texto(r?.origen ?? "")],
    [en("titular"), texto(r?.titular ?? "")],
    [en("intro"), texto(r?.intro ?? "")],
    [en("formacion"), lineas(r?.formacion ?? [])],
    [en("categorias"), lineas((r?.categorias ?? []).map((c) => `${c.etiqueta} · ${c.color || "sin color"}`))],
    [en("figura"), figura],
    ...Array.from({ length: cuantasEtapas }, (_, i) => deLaEtapa(r?.etapas[i], i, r?.categorias ?? [], material)).flat(),
    [en("cierre"), texto(r ? [r.cierre.titulo, r.cierre.texto, r.cierre.textoDos].filter(Boolean).join("\n") : "")],
  ];
}

function campos(d: BorradorDePersona, cuantasEtapas: number, material: NombreDeMaterial): Array<[PropertyKey[], Legible]> {
  return [
    [["nombre"], texto(d.nombre)],
    [["rol"], texto(d.rol)],
    [["pais"], texto(d.pais)],
    [["nivel"], texto(d.nivel === null ? "" : rotuloDelNivel(d.nivel))],
    [["foto"], d.sinFoto ? texto("Sin foto") : foto(d.foto)],
    [["acercamiento"], texto(String(d.acercamiento).replace(".", ","))],
    [["slug"], texto(d.slug)],
    ...delRecorrido(d.recorrido, cuantasEtapas, material),
  ];
}

/** Las diferencias entre lo publicado y lo que hay, en el orden del formulario. */
export function cambiosDelPerfil(antes: BorradorDePersona, despues: BorradorDePersona, material: NombreDeMaterial = (id) => id): Diferencia[] {
  const cuantasEtapas = Math.max(antes.recorrido?.etapas.length ?? 0, despues.recorrido?.etapas.length ?? 0);
  const a = campos(antes, cuantasEtapas, material);
  const b = campos(despues, cuantasEtapas, material);
  return a.flatMap(([camino, valor], i): Diferencia[] => (iguales(valor, b[i][1]) ? [] : [{ donde: [dondeEsta(camino)], antes: valor, despues: b[i][1] }]));
}
