import { tituloDe } from "@/datos/acciones/materiales-en-base";
import { base } from "@/datos/cliente";
import { esquemaBorrador, esquemaMaterial, type BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { borradorVacio, LUGARES_DE_DESTACADO } from "@/features/biblioteca/contenido/modelo";
import { comoDocumento } from "@/lib/contenido/documento";
import { publicadoDe } from "./materiales";

// Lo que lee la ficha de un material en el admin (SPEC §9.2 de
// `work/biblioteca/`): lo que se edita, lo publicado para «Qué cambió», el
// último chequeo del link, las novedades que lo abren y quién ocupa cada
// lugar de los destacados. Las fechas viajan como ISO.

export type EstadoDeLaFicha = {
  publicado: boolean;
  publicadoEn: string | null;
  publicadoPor: string | null;
  borradorEn: string | null;
  borradorPor: string | null;
};

export type ChequeoDelLink = { en: string; resultado: string; detalle: string | null } | null;

export type FichaDeMaterial = {
  id: string;
  /** Lo que se edita: el borrador, o lo publicado si no hay borrador. */
  documento: BorradorDeMaterial;
  /** Lo que está en las columnas, o `null` si nunca se publicó. */
  publicado: BorradorDeMaterial | null;
  estado: EstadoDeLaFicha;
  chequeo: ChequeoDelLink;
  /** Las novedades que lo abren al final de su ficha. */
  novedades: Array<{ slug: string; titulo: string }>;
};

/** Lo que la ficha necesita de afuera del material: quién ocupa cada lugar de los destacados, y las personas del Equipo. */
export type Vecinos = { lugares: Record<number, { id: string; titulo: string } | null>; personas: Array<{ clave: string; nombre: string }> };

export async function fichaDeMaterial(id: string): Promise<FichaDeMaterial | null> {
  const fila = await base.material.findUnique({ where: { id }, include: { autorias: true } });
  if (!fila) return null;
  const publicado = fila.publicadoEn ? esquemaMaterial.safeParse(publicadoDe(fila)) : null;
  const documento = esquemaBorrador.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!documento.success) console.warn(`El material ${id} tiene un borrador que no pasa su esquema; se abre vacío.`);
  const novedades = await base.novedad.findMany({ where: { materialId: id, slug: { not: null } }, select: { slug: true, titulo: true, borrador: true } });
  return {
    id,
    documento: documento.success ? documento.data : { ...borradorVacio(), titulo: tituloDe(fila) },
    publicado: publicado?.success ? publicado.data : null,
    estado: {
      publicado: fila.publicado,
      publicadoEn: fila.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila.publicadoPor,
      borradorEn: fila.borradorEn?.toISOString() ?? null,
      borradorPor: fila.borradorPor,
    },
    chequeo: fila.chequeoEn && fila.chequeo ? { en: fila.chequeoEn.toISOString(), resultado: fila.chequeo, detalle: fila.chequeoDetalle } : null,
    novedades: novedades.flatMap((n) => (n.slug ? [{ slug: n.slug, titulo: tituloDe(n) }] : [])),
  };
}

export async function vecinosDeMaterial(): Promise<Vecinos> {
  const ocupados = await base.material.findMany({ where: { destacado: { not: null }, publicado: true }, select: { id: true, destacado: true, titulo: true, borrador: true } });
  const lugares = Object.fromEntries(
    LUGARES_DE_DESTACADO.map((l) => {
      const quien = ocupados.find((o) => o.destacado === l);
      return [l, quien ? { id: quien.id, titulo: tituloDe(quien) } : null];
    }),
  );
  return { lugares, personas: await personasDelEquipo() };
}

/** Las personas del Equipo para vincular una autoría, en el orden del sitio: las que nunca se publicaron también, porque firmar es un hecho y no depende del perfil. */
async function personasDelEquipo(): Promise<Vecinos["personas"]> {
  const filas = await base.persona.findMany({ orderBy: [{ nivel: "asc" }, { orden: "asc" }, { creadoEn: "asc" }], select: { id: true, nombre: true, borrador: true } });
  return filas.map((p) => ({ clave: p.id, nombre: p.nombre ?? nombreDelBorrador(p.borrador) }));
}

function nombreDelBorrador(borrador: unknown): string {
  const nombre = comoDocumento(borrador).nombre;
  return typeof nombre === "string" && nombre.trim() ? nombre.trim() : "Sin nombre";
}
