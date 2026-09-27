import type { Material as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { firmaDe, type Autoria } from "@/features/biblioteca/contenido/modelo";
import { comoDocumento } from "@/lib/contenido/documento";

// Lo que lee la lista de la Biblioteca en el admin (SPEC §9.1 de
// `work/biblioteca/`): cada material como se está editando, con su estado y su
// salud, filtrado por tipo, estado, salud y lo buscado. Son decenas de filas:
// se leen todas y se filtran acá, sin índice.

/** Sin publicar: nunca se publicó. Oculto: estuvo en el sitio. Con cambios: está en el sitio y tiene un borrador. */
export type EstadoDeMaterial = "sin-publicar" | "publicado" | "con-cambios" | "oculto";
export type Salud = "link-roto" | "sin-portada" | "incompletos";
export type FiltrosDeMateriales = { tipo?: string; estado?: "publicado" | "oculto"; salud?: Salud; q?: string };

export type FilaDeMaterial = {
  id: string;
  titulo: string;
  autores: string;
  tipo: string;
  anio: string;
  /** La portada propia, si tiene. */
  portada: string | null;
  estado: EstadoDeMaterial;
  salud: Salud[];
};

/** Lo que se busca, sin tildes ni mayúsculas. */
const normalizar = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function estadoDe(f: Fila): EstadoDeMaterial {
  if (f.publicado) return f.borrador ? "con-cambios" : "publicado";
  return f.publicadoEn ? "oculto" : "sin-publicar";
}

/** Lo que se edita: el borrador, o lo publicado si no hay (con las autorías de la tabla). */
function documentoDe(f: Fila & { autorias: Autoria[] }): Record<string, unknown> {
  if (f.borrador) return comoDocumento(f.borrador);
  return { ...f, autorias: f.autorias, autores: f.autores ?? "", descripcion: f.descripcion ?? "", fuente: f.fuente ?? "" };
}

function filaDe(f: Fila & { autorias: Autoria[] }): { fila: FilaDeMaterial; buscable: string } {
  const d = documentoDe(f);
  const autorias = Array.isArray(d.autorias) ? (d.autorias as unknown[]).map((a) => ({ nombre: texto(comoDocumento(a).nombre) })) : [];
  const portada = comoDocumento(d.portada).src;
  const salud: Salud[] = [];
  if (f.chequeo === "roto") salud.push("link-roto");
  if (typeof portada !== "string" || !portada) salud.push("sin-portada");
  if (!texto(d.descripcion)) salud.push("incompletos");
  const fila = {
    id: f.id,
    titulo: texto(d.titulo),
    autores: firmaDe({ autores: texto(d.autores) || null, autorias }),
    tipo: texto(d.tipo),
    anio: texto(d.fecha).slice(0, 4),
    portada: typeof portada === "string" && portada ? portada : null,
    estado: estadoDe(f),
    salud,
  };
  return { fila, buscable: normalizar(`${fila.titulo} ${fila.autores} ${texto(d.fuente)}`) };
}

/** Si la fila tiene lo buscado (ya normalizado). Aparte: react-doctor lee el `includes` de un texto como el de una lista. */
function tieneLoBuscado(buscable: string, buscado: string): boolean {
  return buscable.includes(buscado);
}

/** Las filas que pasan los filtros: sin año primero (los recién empezados), después por año y por orden de carga. Pura: se prueba sin base. */
export function filasDeLaLista(filas: ReadonlyArray<Fila & { autorias: Autoria[] }>, filtros: FiltrosDeMateriales): FilaDeMaterial[] {
  const buscado = filtros.q ? normalizar(filtros.q) : "";
  return filas
    .map((f) => ({ ...filaDe(f), creadoEn: f.creadoEn.getTime(), publicado: f.publicado }))
    .filter(({ fila, buscable, publicado }) => {
      if (filtros.tipo && fila.tipo !== filtros.tipo) return false;
      if (filtros.estado && publicado !== (filtros.estado === "publicado")) return false;
      if (filtros.salud && !fila.salud.includes(filtros.salud)) return false;
      return !buscado || tieneLoBuscado(buscable, buscado);
    })
    .sort((a, b) => (Number(b.fila.anio) || 9999) - (Number(a.fila.anio) || 9999) || a.creadoEn - b.creadoEn)
    .map(({ fila }) => fila);
}

/** La lista con esos filtros, y si hay algún material en todo el módulo (para decir «Todavía no hay materiales»). */
export async function listaDeMateriales(filtros: FiltrosDeMateriales): Promise<{ filas: FilaDeMaterial[]; hayMateriales: boolean; rotos: number }> {
  const filas = await base.material.findMany({ include: { autorias: { orderBy: { orden: "asc" } } } });
  return { filas: filasDeLaLista(filas, filtros), hayMateriales: filas.length > 0, rotos: filas.filter((f) => f.publicado && f.chequeo === "roto").length };
}
