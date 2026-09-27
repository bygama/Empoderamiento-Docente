import { nombreDe } from "@/datos/acciones/equipo-en-base";
import { nivelEnLaLista } from "@/datos/acciones/mover-equipo";
import { base } from "@/datos/cliente";
import { comoDocumento } from "@/lib/contenido/documento";
import { publicadoDe } from "./equipo";

// Lo que el resto del admin lee del Equipo (SPEC §7 y §10 de `work/equipo/`):
// la lista, qué perfiles de la actividad siguen existiendo, para linkearlos,
// y la persona que «Agregar en Biblioteca» trae elegida como autora.

/** La autora que llega de su perfil: su id, el nombre corto (para reconocerla entre los autores) y el completo (para firmar). */
export type PersonaParaAutoria = { id: string; nombre: string; nombreCompleto: string };

export async function personaParaAutoria(id: string): Promise<PersonaParaAutoria | null> {
  const fila = await base.persona.findUnique({ where: { id }, select: { id: true, nombre: true, nombreCompleto: true, borrador: true } });
  if (!fila) return null;
  const delBorrador = comoDocumento(comoDocumento(fila.borrador).recorrido).nombreCompleto;
  const nombre = nombreDe(fila);
  const completo = fila.nombreCompleto ?? (typeof delBorrador === "string" && delBorrador.trim() ? delBorrador.trim() : nombre);
  return { id: fila.id, nombre, nombreCompleto: completo };
}

/** De esos ids, los que siguen siendo un perfil (uno borrado no tiene ficha adonde llevar). */
export async function perfilesQueExisten(ids: readonly string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const filas = await base.persona.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return new Set(filas.map((f) => f.id));
}

/** Una fila de la lista del Equipo: lo que se edita (el borrador, si hay), dónde está en el orden y su estado. */
export type FilaDePerfil = {
  id: string;
  nombre: string;
  rol: string;
  pais: string;
  /** El nivel donde se ordena: el publicado, o el del borrador si nunca se publicó; `null` si todavía no tiene. */
  nivel: number | null;
  /** La foto de la tarjeta para la miniatura, o `null` sin foto (o con «Sin foto»). */
  foto: { src: string; foco: { x: number; y: number } } | null;
  estado: { publicado: boolean; publicadoEn: string | null; borradorEn: string | null };
};

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** La foto de un documento, si tiene una y la tarjeta la muestra. */
function fotoDeLaFila(d: Record<string, unknown>): FilaDePerfil["foto"] {
  if (d.sinFoto === true) return null;
  const foto = comoDocumento(d.foto);
  const foco = comoDocumento(foto.foco);
  const src = texto(foto.src);
  if (!src) return null;
  return { src, foco: { x: typeof foco.x === "number" ? foco.x : 0.5, y: typeof foco.y === "number" ? foco.y : 0.5 } };
}

/** Los perfiles en el orden del sitio (cada nivel lo agrupa la lista). */
export async function listaDelEquipo(): Promise<FilaDePerfil[]> {
  const filas = await base.persona.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }] });
  return filas.map((f) => {
    const d = comoDocumento(f.borrador ?? publicadoDe(f));
    return {
      id: f.id,
      nombre: nombreDe(f),
      rol: texto(d.rol),
      pais: texto(d.pais),
      nivel: nivelEnLaLista(f),
      foto: fotoDeLaFila(d),
      estado: { publicado: f.publicado, publicadoEn: f.publicadoEn?.toISOString() ?? null, borradorEn: f.borradorEn?.toISOString() ?? null },
    };
  });
}
