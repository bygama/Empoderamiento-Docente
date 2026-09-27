import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";

// Un perfil del Equipo como lo edita su formulario, y de vuelta a documento
// (SPEC §7.2 de `work/equipo/`). Tres diferencias: cada ítem de una lista
// lleva una clave estable (para mover y quitar sin que el contenido salte de
// lugar; las etapas y las categorías ya la tienen); las listas de textos
// cortos —la formación, los territorios, los conceptos— van en un solo campo,
// un renglón por ítem, como los párrafos de una novedad; y el acercamiento va
// como texto, que es lo que se escribe.

export { mismoDocumento } from "@/admin/novedades/formulario";

type Recorrido = NonNullable<BorradorDePersona["recorrido"]>;
type Etapa = Recorrido["etapas"][number];
type Publicacion = Etapa["publicaciones"][number];

type ConClave<T> = T & { clave: string };
/** Una publicación con sus conceptos en renglones. Distributivo: cada origen conserva sus campos. */
type ConConceptosEnTexto<T> = T extends unknown ? Omit<T, "conceptos"> & { conceptos: string } : never;

export type PublicacionEnElFormulario = ConClave<ConConceptosEnTexto<Publicacion>>;
export type HitoEnElFormulario = ConClave<Etapa["hitos"][number]>;
export type RamaEnElFormulario = ConClave<Etapa["ramas"][number]>;
export type EtapaEnElFormulario = Omit<Etapa, "hitos" | "ramas" | "territorios" | "publicaciones"> & {
  hitos: HitoEnElFormulario[];
  ramas: RamaEnElFormulario[];
  territorios: string;
  publicaciones: PublicacionEnElFormulario[];
};
export type RecorridoEnElFormulario = Omit<Recorrido, "formacion" | "etapas"> & { formacion: string; etapas: EtapaEnElFormulario[] };
type Foto = NonNullable<BorradorDePersona["foto"]>;
export type PersonaEnElFormulario = Omit<BorradorDePersona, "foto" | "acercamiento" | "recorrido"> & {
  /** Siempre un valor del campo: sin archivo es «todavía no se eligió», y se guarda nula. */
  foto: Foto;
  acercamiento: string;
  recorrido: RecorridoEnElFormulario | null;
};

const SIN_FOTO: Foto = { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };

/** Los renglones con texto de un campo, sin los vacíos. */
export function renglonesDe(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean);
}

/** El acercamiento como se escribe: con coma, como se lee en castellano. */
const acercamientoEnTexto = (n: number) => String(n).replace(".", ",");

// Las claves de lo que ya estaba son su posición: así el servidor y el navegador dibujan lo mismo.
function etapaAFormulario(e: Etapa): EtapaEnElFormulario {
  return {
    ...e,
    hitos: e.hitos.map((h, i) => ({ ...h, clave: `h${i}` })),
    ramas: e.ramas.map((r, i) => ({ ...r, clave: `r${i}` })),
    territorios: e.territorios.join("\n"),
    publicaciones: e.publicaciones.map((p, i) => ({ ...p, conceptos: p.conceptos.join("\n"), clave: `p${i}` })),
  };
}

export function aFormulario(documento: BorradorDePersona): PersonaEnElFormulario {
  const r = documento.recorrido;
  return {
    ...documento,
    foto: documento.foto ?? { ...SIN_FOTO },
    acercamiento: acercamientoEnTexto(documento.acercamiento),
    recorrido: r ? { ...r, formacion: r.formacion.join("\n"), etapas: r.etapas.map(etapaAFormulario) } : null,
  };
}

// De vuelta a documento, campo por campo: la clave del formulario no se guarda.

/** Según su origen: cada uno conserva lo suyo. */
function publicacionADocumento(p: PublicacionEnElFormulario): Publicacion {
  const delPerfil = { detalle: p.detalle, conceptos: renglonesDe(p.conceptos), destacada: p.destacada };
  return p.origen === "biblioteca" ? { origen: "biblioteca", material: p.material, ...delPerfil } : { origen: "sin-link", titulo: p.titulo, tipo: p.tipo, anio: p.anio, ...delPerfil };
}

function etapaADocumento(e: EtapaEnElFormulario): Etapa {
  return {
    ...e,
    hitos: e.hitos.map(({ periodo, titulo, detalle, principal }) => ({ periodo, titulo, detalle, principal })),
    ramas: e.ramas.map(({ periodo, lugar, detalle }) => ({ periodo, lugar, detalle })),
    territorios: renglonesDe(e.territorios),
    publicaciones: e.publicaciones.map(publicacionADocumento),
  };
}

/** El documento que se guarda. Un acercamiento que no es un número llega así al esquema, que lo dice en su campo. */
export function aDocumento({ foto, acercamiento, recorrido: r, ...resto }: PersonaEnElFormulario): BorradorDePersona {
  return {
    ...resto,
    foto: foto.src || foto.alt ? foto : null,
    acercamiento: Number(acercamiento.trim().replace(",", ".") || "1"),
    recorrido: r ? { ...r, formacion: renglonesDe(r.formacion), etapas: r.etapas.map(etapaADocumento) } : null,
  };
}
