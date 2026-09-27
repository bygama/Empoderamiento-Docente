import { siteConfig } from "@/config/site";
import { citaApa } from "./cita";
import type { DestacadoDelSitio, Material, MaterialDelSitio } from "./material";
import { anioDe, fechaDelSitio, firmaDe } from "./modelo";

// Un material válido, listo para mostrarse (SPEC §13 de `work/biblioteca/`):
// la firma y la cita armadas, la fecha como se lee y la portada resuelta. Lo
// usa la consulta del sitio; aparte para probarlo sin base.

const CENTRO = { x: 0.5, y: 0.5 };

/** La portada tipográfica generada de un material sin portada propia (la ruta del sitio). */
export function portadaGenerada(id: string): string {
  return `/biblioteca/portada/${id}`;
}

/** Un link de la cita tiene que servir afuera del sitio: un PDF propio lleva el dominio. */
function linkDeLaCita(url: string): string {
  return url.startsWith("/") ? new URL(url, siteConfig.url).toString() : url;
}

export function materialDelSitio(m: Material, id: string): MaterialDelSitio {
  return {
    id,
    titulo: m.titulo,
    autores: firmaDe({ autores: m.autores || null, autorias: m.autorias }),
    descripcion: m.descripcion,
    tipo: m.tipo,
    tema: m.tema,
    publico: m.publico,
    anio: anioDe(m.fecha),
    fecha: fechaDelSitio(m.fecha),
    formato: m.formato,
    paginas: m.paginas,
    portada: m.portada ? { src: m.portada.src, foco: m.portada.foco } : { src: portadaGenerada(id), foco: CENTRO },
    url: m.url,
    fuente: m.fuente,
    cita: m.cita || citaApa({ autores: m.autorias, fecha: m.fecha, titulo: m.titulo, fuente: m.fuente, doi: m.doi, url: linkDeLaCita(m.url) }),
  };
}

/** Los destacados, en su lugar (1 a 4), uno por lugar. */
export function destacadosDe(materiales: ReadonlyArray<{ id: string; material: Material }>): DestacadoDelSitio[] {
  const porLugar = new Map<number, DestacadoDelSitio>();
  for (const { id, material: m } of materiales) {
    if (m.destacado === null || porLugar.has(m.destacado)) continue;
    porLugar.set(m.destacado, { material: materialDelSitio(m, id), rotulo: m.rotulo, frase: m.frase, detalle: m.detalle });
  }
  return [...porLugar.entries()].sort(([a], [b]) => a - b).map(([, d]) => d);
}
