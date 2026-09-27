import type { PrismaClient } from "@/../prisma/generado/client";
import { doiOcupado, tituloDe } from "@/datos/acciones/materiales-en-base";
import { sonParecidos } from "@/features/biblioteca/contenido/parecidos";
import type { Autoria } from "@/features/biblioteca/contenido/modelo";
import { siteConfig } from "@/config/site";
import { datosDelSitio } from "@/datos/consultas/sitio";

// Lo que se encontró afuera, mirado contra lo que ya hay (SPEC §7 y §8 de
// `work/biblioteca/`): si el DOI ya está, qué títulos se parecen, y qué
// autores ya son personas del Equipo en otros materiales.

/**
 * Cómo se presenta el servidor al pedir afuera: el sitio y su correo, el de
 * Ajustes › Datos del sitio. Crossref y OpenAlex lo piden para su «polite pool».
 */
export async function presentacion(): Promise<{ agente: string; contacto: string }> {
  const { correo } = await datosDelSitio();
  return { agente: `EmpoderamientoDocente/1.0 (+${siteConfig.url}; mailto:${correo})`, contacto: correo };
}

export type Vecino = { id: string; titulo: string };

/** Un nombre para comparar: sin tildes, guiones ni mayúsculas («Gómez-Osalde» es «gomez osalde»). */
const clave = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

/** Los materiales cuyo título se parece (hasta tres), publicados o en borrador. */
export async function parecidosA(base: PrismaClient, titulo: string, menos: string | null = null): Promise<Vecino[]> {
  if (!titulo.trim()) return [];
  const filas = await base.material.findMany({ select: { id: true, titulo: true, borrador: true } });
  return filas
    .filter((f) => f.id !== menos)
    .map((f) => ({ id: f.id, titulo: tituloDe(f) }))
    .filter((f) => sonParecidos(f.titulo, titulo))
    .slice(0, 3);
}

/**
 * Las autorías con la persona del Equipo que ya tiene ese nombre en otro
 * material publicado: una sugerencia, que la ficha deja cambiar.
 */
export async function conPersonas(base: PrismaClient, autorias: readonly Autoria[]): Promise<Autoria[]> {
  const conocidas = await base.autoria.findMany({ where: { persona: { not: null } }, select: { nombre: true, persona: true }, distinct: ["nombre"] });
  const porNombre = new Map(conocidas.map((a) => [clave(a.nombre), a.persona]));
  return autorias.map((a) => ({ ...a, persona: a.persona ?? porNombre.get(clave(a.nombre)) ?? null }));
}

/** El material que ya tiene ese DOI, o `null`. */
export async function yaEsta(base: PrismaClient, doi: string | undefined): Promise<Vecino | null> {
  return doi ? doiOcupado(base, doi, null) : null;
}
