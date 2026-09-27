import { nombreDe } from "@/datos/acciones/equipo-en-base";
import { base } from "@/datos/cliente";
import { anioDe } from "@/features/biblioteca/contenido/modelo";
import { NUMEROS_DE_NIVEL, type Nivel } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import { esquemaBorrador, esquemaPersona, type BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";
import { publicadoDe } from "./equipo";

// Lo que lee la ficha de un perfil del Equipo en el admin (SPEC §7.2 de
// `work/equipo/`): lo que se edita, lo publicado para «Qué cambió», su estado,
// lo que firma en la Biblioteca y quién ocupa los niveles con lugares
// contados. Las fechas viajan como ISO.

export type EstadoDeLaFicha = {
  publicado: boolean;
  publicadoEn: string | null;
  publicadoPor: string | null;
  borradorEn: string | null;
  borradorPor: string | null;
};

export type FichaDePersona = {
  id: string;
  /** Lo que se edita: el borrador, o lo publicado si no hay borrador. */
  documento: BorradorDePersona;
  /** Lo que está en las columnas, o `null` si nunca se publicó. */
  publicado: BorradorDePersona | null;
  estado: EstadoDeLaFicha;
};

/** Un material que la persona firma: lo que se puede sumar a una etapa. `publicado`: si el sitio lo muestra. */
export type Firmado = { id: string; titulo: string; anio: string; publicado: boolean };

/** Lo que la ficha necesita de afuera del perfil: lo que firma y quiénes están publicados en cada nivel. */
export type VecinosDePersona = { firmados: Firmado[]; porNivel: Record<Nivel, string[]> };

export async function fichaDePersona(id: string): Promise<FichaDePersona | null> {
  const fila = await base.persona.findUnique({ where: { id } });
  if (!fila) return null;
  const publicado = fila.publicadoEn ? esquemaPersona.safeParse(publicadoDe(fila)) : null;
  const documento = esquemaBorrador.safeParse(fila.borrador ?? publicadoDe(fila));
  if (!documento.success) console.warn(`El perfil ${id} tiene un borrador que no pasa su esquema; se abre vacío.`);
  return {
    id,
    documento: documento.success ? documento.data : { ...personaVacia(), nombre: nombreDe(fila) },
    publicado: publicado?.success ? publicado.data : null,
    estado: {
      publicado: fila.publicado,
      publicadoEn: fila.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila.publicadoPor,
      borradorEn: fila.borradorEn?.toISOString() ?? null,
      borradorPor: fila.borradorPor,
    },
  };
}

/** Lo que firma la persona (ninguno si todavía no existe) y los publicados de cada nivel, sin ella. */
export async function vecinosDePersona(id: string | null): Promise<VecinosDePersona> {
  const [autorias, publicadas] = await Promise.all([
    id ? base.autoria.findMany({ where: { personaId: id }, select: { material: { select: { id: true, titulo: true, fecha: true, publicado: true } } } }) : [],
    base.persona.findMany({ where: { publicado: true, id: id ? { not: id } : undefined }, orderBy: { orden: "asc" }, select: { nivel: true, nombre: true, borrador: true } }),
  ]);
  const firmados = autorias
    .map(({ material: m }) => ({ id: m.id, titulo: m.titulo ?? "Sin título", anio: m.fecha ? String(anioDe(m.fecha)) : "", publicado: m.publicado }))
    .sort((a, b) => b.anio.localeCompare(a.anio) || a.titulo.localeCompare(b.titulo, "es"));
  // El `as`: `fromEntries` pierde el tipo de las claves, que son exactamente los cuatro niveles.
  const porNivel = Object.fromEntries(NUMEROS_DE_NIVEL.map((n) => [n, publicadas.filter((p) => p.nivel === n).map(nombreDe)])) as Record<Nivel, string[]>;
  return { firmados, porNivel };
}
