import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { posicionDelFoco } from "@/lib/contenido/fotos";
import { rotuloDePublicacion } from "./modelo-del-equipo";
import type { Etapa, Persona, PublicacionDeEtapa, Recorrido } from "./persona";
import type { PersonaDelSitio, Profile, ProfilePublication, ProfileStage } from "./perfil-del-sitio";

// Una persona válida, lista para mostrarse (SPEC §5.1 y §8.1 de
// `work/equipo/`): la tarjeta con su foto encuadrada y el recorrido con sus
// publicaciones resueltas. Una publicación de la Biblioteca sale del material
// —título, año, tipo y link— solo si el sitio lo muestra y la persona lo
// firma: por eso llega el mapa de lo que firma, ya filtrado. Lo usa la
// consulta del sitio; aparte para probarlo sin base.

/** Lo que el sitio muestra de la Biblioteca y esta persona firma, por id. */
export type Firmados = ReadonlyMap<string, MaterialDelSitio>;

/** Un texto vacío es «no tiene»: el componente no dibuja nada. */
const oNada = (texto: string) => texto || undefined;

function publicacionDelSitio(p: PublicacionDeEtapa, firmados: Firmados): ProfilePublication | null {
  const delPerfil = { concepts: p.conceptos.length ? p.conceptos : undefined, featured: p.destacada || undefined };
  if (p.origen === "sin-link") return { year: p.anio, kind: rotuloDePublicacion(p.tipo), title: p.titulo, meta: oNada(p.detalle), ...delPerfil };
  const m = firmados.get(p.material);
  // Un material del sitio siempre tiene tipo (lo exige su esquema); el `""` solo sale del tipo de su borrador.
  if (!m || m.tipo === "") return null;
  // El detalle vacío lee la fuente del material, como la firma y la cita de la Biblioteca.
  return { year: String(m.anio), kind: rotuloDePublicacion(m.tipo), title: m.titulo, meta: p.detalle || m.fuente, url: m.url, ...delPerfil };
}

function etapaDelSitio(e: Etapa, n: number, firmados: Firmados): ProfileStage {
  const publicaciones = e.publicaciones.flatMap((p) => publicacionDelSitio(p, firmados) ?? []);
  return {
    id: e.clave,
    n,
    categoryId: e.categoria,
    eyebrow: e.volanta,
    color: e.color,
    period: oNada(e.periodo),
    title: e.titulo,
    body: e.texto,
    variant: e.composicion,
    quote: oNada(e.cita),
    milestones: e.hitos.length ? e.hitos.map((h) => ({ period: oNada(h.periodo), title: h.titulo, detail: oNada(h.detalle), primary: h.principal || undefined })) : undefined,
    branches: e.ramas.length ? e.ramas.map((r) => ({ period: oNada(r.periodo), place: r.lugar, detail: r.detalle })) : undefined,
    tags: e.territorios.length ? e.territorios : undefined,
    publications: publicaciones.length ? publicaciones : undefined,
  };
}

function perfilDelSitio(r: Recorrido, firmados: Firmados): Profile {
  const foto = r.figura.tipo === "sin" ? null : r.figura.foto;
  return {
    fullName: r.nombreCompleto,
    role: r.rolCompleto,
    location: r.lugar,
    origin: oNada(r.origen),
    figura: r.figura.tipo,
    cutout: foto?.src,
    cutoutAlt: foto?.alt,
    cutoutPosition: foto ? posicionDelFoco(foto.foco) : undefined,
    marcoApaisado: r.figura.apaisado || undefined,
    headline: r.titular,
    intro: r.intro,
    formation: r.formacion,
    categories: r.categorias.map((c) => ({ id: c.clave, label: c.etiqueta, color: c.color })),
    stages: r.etapas.map((e, i) => etapaDelSitio(e, i + 1, firmados)),
    closing: { title: r.cierre.titulo, body: r.cierre.texto, body2: oNada(r.cierre.textoDos) },
  };
}

/** Una persona válida, como la reciben los componentes del equipo. */
export function personaDelSitio(p: Persona, firmados: Firmados): PersonaDelSitio {
  return {
    key: p.slug,
    nombre: p.nombre,
    rol: p.rol,
    pais: p.pais,
    tier: p.nivel,
    foto: p.sinFoto || !p.foto ? null : { src: p.foto.src, alt: p.foto.alt, posicion: posicionDelFoco(p.foto.foco) },
    imageZoom: p.acercamiento,
    profile: p.recorrido ? perfilDelSitio(p.recorrido, firmados) : undefined,
  };
}
