import type { Prisma, PrismaClient } from "@/../prisma/generado/client";
import { NIVELES, type Nivel } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { Fallo } from "./choque";
import { falloEnCampo, nombreDe } from "./equipo-en-base";

// Lo que un perfil no puede saber solo, porque depende de otras filas (SPEC
// §5.1 y §4.1 de `work/equipo/`): que cada publicación de la Biblioteca exista
// y la persona la firme, y que su nivel tenga lugar.

const EN_LISTA = new Intl.ListFormat("es", { type: "conjunction" });

type ConPublicaciones = { recorrido: { etapas: ReadonlyArray<{ publicaciones: ReadonlyArray<{ origen: string; material?: string }> }> } | null };

/**
 * La primera publicación de la Biblioteca que ya no está o que la persona no
 * firma (sus autorías publicadas): el campo lo dice. `null` si están todas.
 * Un perfil que todavía no existe no firma nada.
 */
export async function publicacionQueNoFirma(base: PrismaClient, personaId: string | null, p: ConPublicaciones): Promise<Fallo | null> {
  const refs = (p.recorrido?.etapas ?? []).flatMap((e, i) =>
    e.publicaciones.flatMap((pub, j) => (pub.origen === "biblioteca" && pub.material ? [{ i, j, material: pub.material }] : [])),
  );
  if (!refs.length) return null;
  const ids = refs.map((r) => r.material);
  const [firmados, existen] = await Promise.all([
    personaId ? base.autoria.findMany({ where: { personaId, materialId: { in: ids } }, select: { materialId: true } }) : [],
    base.material.findMany({ where: { id: { in: ids } }, select: { id: true } }),
  ]);
  const firma = new Set(firmados.map((a) => a.materialId));
  const mal = refs.find((r) => !firma.has(r.material));
  if (!mal) return null;
  const camino = `recorrido.etapas.${mal.i}.publicaciones.${mal.j}.material`;
  return existen.some((m) => m.id === mal.material)
    ? falloEnCampo(camino, "Esta persona no firma ese material en la Biblioteca: elegí uno de los suyos, o sumala como autora allá.")
    : falloEnCampo(camino, "Ese material ya no está en la Biblioteca: elegí otro, o quitalo.");
}

/**
 * Si el nivel no tiene lugar para una persona publicada más: el masthead
 * tiene uno al centro (la Dirección general) y dos a los costados (la
 * Dirección). La Dirección general la garantiza además un índice único; esto
 * lo dice antes, con los nombres.
 */
export async function nivelSinLugar(base: PrismaClient | Prisma.TransactionClient, id: string, nivel: Nivel): Promise<Fallo | null> {
  const { rotulo, lugares } = NIVELES[nivel - 1];
  if (lugares === null) return null;
  const otras = await base.persona.findMany({ where: { nivel, publicado: true, id: { not: id } }, select: { nombre: true, borrador: true } });
  if (otras.length < lugares) return null;
  const quienes = EN_LISTA.format(otras.map(nombreDe));
  const cuantas = lugares === 1 ? "una sola persona" : `${lugares} personas`;
  return falloEnCampo("nivel", `${rotulo} lleva ${cuantas} en el sitio, y hoy ${otras.length === 1 ? "es" : "son"} ${quienes}. Cambiá el nivel o despublicá ${otras.length === 1 ? "ese perfil" : "uno de esos perfiles"} primero.`);
}
