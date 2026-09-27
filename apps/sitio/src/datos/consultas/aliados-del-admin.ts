import type { Aliado as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { esquemaAliado, esquemaBorradorDeAliado, type Aliado, type BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { estaAutorizado, loQueSeAutoriza } from "@/features/aliados/contenido/autorizacion";
import { comoDocumento } from "@/lib/contenido/documento";
import { publicadoDeAliado } from "./aliados";

// Lo que leen la lista y la ficha de Aliados en el admin
// (`work/casos-aliados-fotos/SPEC.md` §7.2). Las fechas viajan como ISO.

export type EstadoDelAliado = { publicado: boolean; publicadoEn: string | null; publicadoPor: string | null; borradorEn: string | null; borradorPor: string | null };

/** La marca, con el logo, el nombre y el alt que se autorizaron (nulos sin la marca). */
export type Autorizacion = { autorizado: boolean; nota: string; en: string | null; por: string | null; logo: string | null; nombre: string | null; alt: string | null };

/** `autorizado`: si la marca vale para lo que se edita, no solo si está puesta. */
export type FilaDeAliado = { id: string; nombre: string; logo: string; tamano: string; estado: EstadoDelAliado; autorizado: boolean };

const texto = (v: unknown) => (typeof v === "string" ? v : "");

const estadoDe = (f: Fila): EstadoDelAliado => ({
  publicado: f.publicado,
  publicadoEn: f.publicadoEn?.toISOString() ?? null,
  publicadoPor: f.publicadoPor,
  borradorEn: f.borradorEn?.toISOString() ?? null,
  borradorPor: f.borradorPor,
});

/** Los aliados en el orden de la tira, con el nombre y el logo de lo que se edita (el borrador, si hay). */
export async function listaDeAliados(): Promise<FilaDeAliado[]> {
  const filas = await base.aliado.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }] });
  return filas.map((f) => {
    const d = comoDocumento(f.borrador ?? publicadoDeAliado(f));
    const logo = comoDocumento(d.logo);
    // Con otro logo, otro nombre u otro alt que los autorizados, cuenta como sin autorizar: no se puede publicar así.
    const aAutorizar = loQueSeAutoriza(f.borrador, publicadoDeAliado(f));
    const autorizado = aAutorizar ? estaAutorizado(aAutorizar, f) : false;
    return { id: f.id, nombre: texto(d.nombre).trim(), logo: texto(logo.src), tamano: texto(d.tamano), estado: estadoDe(f), autorizado };
  });
}

export type FichaDeAliado = {
  id: string;
  /** Lo que se edita: el borrador, o lo publicado si no hay borrador. */
  documento: BorradorDeAliado;
  /** Lo que está en las columnas, o `null` si nunca se publicó. */
  publicado: Aliado | null;
  estado: EstadoDelAliado;
  autorizacion: Autorizacion;
};

/** Un aliado recién empezado: el tamaño más común y lo demás vacío. */
export function aliadoVacio(): BorradorDeAliado {
  return { nombre: "", logo: { src: "", alt: "", foco: { x: 0.5, y: 0.5 } }, tamano: "chico", url: "" };
}

export async function fichaDeAliado(id: string): Promise<FichaDeAliado | null> {
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return null;
  const publicado = fila.publicadoEn ? esquemaAliado.safeParse(publicadoDeAliado(fila)) : null;
  const documento = esquemaBorradorDeAliado.safeParse(fila.borrador ?? publicadoDeAliado(fila));
  if (!documento.success) console.warn(`El aliado ${id} tiene un borrador que no pasa su esquema; se abre vacío.`);
  return {
    id,
    documento: documento.success ? documento.data : aliadoVacio(),
    publicado: publicado?.success ? publicado.data : null,
    estado: estadoDe(fila),
    autorizacion: {
      autorizado: fila.autorizado,
      nota: fila.autorizacion ?? "",
      en: fila.autorizadoEn?.toISOString() ?? null,
      por: fila.autorizadoPor,
      logo: fila.autorizadoLogo,
      nombre: fila.autorizadoNombre,
      alt: fila.autorizadoAlt,
    },
  };
}
