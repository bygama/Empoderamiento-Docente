import type { z } from "zod";
import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { dondeEsta } from "@/features/quienes-somos/contenido/etiquetas-de-persona";
import type { Persona } from "@/features/quienes-somos/contenido/persona";
import { comoDocumento } from "@/lib/contenido/documento";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import type { Fallo } from "./choque";

// Lo que comparten las escrituras de un perfil del Equipo (editar-equipo.ts y
// publicar-equipo.ts, SPEC §6.1 de `work/equipo/`): los errores en el campo,
// la URL ocupada, cómo se llama en llano y el pasaje a columnas.

/** Un perfil que no pasa su esquema: un error por campo, con el camino del formulario y las etiquetas. */
export function problemasDePersona(error: z.ZodError): Fallo {
  const porCamino = new Map<string, ErrorDeCampo>();
  for (const i of error.issues) {
    const camino = i.path.map(String).join(".");
    if (!porCamino.has(camino)) porCamino.set(camino, { camino, donde: dondeEsta(i.path), mensaje: i.message });
  }
  const errores = [...porCamino.values()];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

/** Un solo campo que no pasa, dicho igual que los del esquema. */
export function falloEnCampo(camino: string, mensaje: string): Fallo {
  const errores = [{ camino, donde: dondeEsta(camino.split(".")), mensaje }];
  return { ok: false, detalle: resumenDeErrores(errores), errores };
}

type ConNombre = { nombre: string | null; borrador: Prisma.JsonValue };

/** Cómo se llama un perfil en llano, para la actividad y los avisos: su nombre publicado, el del borrador o «Sin nombre». */
export function nombreDe(fila: ConNombre): string {
  const delBorrador = comoDocumento(fila.borrador).nombre;
  return fila.nombre || (typeof delBorrador === "string" && delBorrador.trim()) || "Sin nombre";
}

/**
 * El nombre de otro perfil que ya usa esa URL, publicado o en su borrador, o
 * `null` si está libre. La base garantiza el publicado con el índice único;
 * esto avisa antes, en el campo, y también ve los borradores.
 */
export async function slugOcupado(base: PrismaClient | Prisma.TransactionClient, slug: string, menos: string | null): Promise<string | null> {
  const otra = await base.persona.findFirst({
    where: { id: menos ? { not: menos } : undefined, OR: [{ slug }, { borrador: { path: ["slug"], equals: slug } }] },
    select: { nombre: true, borrador: true },
  });
  return otra ? nombreDe(otra) : null;
}

/** El aviso de una URL que ya tiene otro perfil, en su campo. */
export const slugRepetido = (nombre: string) => falloEnCampo("slug", `Esa URL ya la usa el perfil de ${nombre}.`);

/**
 * Un perfil válido, listo para sus columnas. Sin recorrido, las del
 * recorrido van nulas todas juntas; con «Sin foto», la foto no se publica.
 * Los `as` valen porque cada valor salió de Zod: es JSON válido.
 */
export function columnasDe(p: Persona) {
  const r = p.recorrido;
  const json = (v: unknown) => (v === null || v === undefined ? Prisma.DbNull : (v as Prisma.InputJsonValue));
  return {
    slug: p.slug,
    nombre: p.nombre,
    rol: p.rol,
    pais: p.pais,
    nivel: p.nivel,
    foto: json(p.sinFoto ? null : p.foto),
    sinFoto: p.sinFoto,
    acercamiento: p.acercamiento,
    nombreCompleto: r?.nombreCompleto ?? null,
    rolCompleto: r?.rolCompleto ?? null,
    lugar: r?.lugar ?? null,
    origen: r?.origen || null,
    titular: r?.titular ?? null,
    intro: r?.intro ?? null,
    formacion: json(r?.formacion),
    categorias: json(r?.categorias),
    figura: json(r?.figura),
    etapas: json(r?.etapas),
    cierreTitulo: r?.cierre.titulo ?? null,
    cierreTexto: r?.cierre.texto ?? null,
    cierreTexto2: r?.cierre.textoDos || null,
  };
}
