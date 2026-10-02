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
 * El cupo de los niveles: cuántos lugares tiene cada uno y quiénes los ocupan.
 * El del sitio son los lugares de `NIVELES` entre todos los perfiles
 * publicados; un test inyecta otro para medir sobre sus propias filas, sin
 * tocar las de la carga.
 */
export type Cupo = {
  /** Los lugares del nivel; `null` es sin tope. */
  lugares: (nivel: Nivel) => number | null;
  /** Si un perfil publicado del nivel ocupa uno de sus lugares, por su URL. */
  ocupa: (slug: string | null) => boolean;
};

export const CUPO_DEL_SITIO: Cupo = { lugares: (nivel) => NIVELES[nivel - 1].lugares, ocupa: () => true };

/**
 * Si el nivel no tiene lugar para una persona publicada más: el masthead
 * tiene una al centro (la Dirección general) y tres debajo (la Dirección).
 * La Dirección general la garantiza además un índice único; esto lo dice
 * antes, con los nombres.
 */
export async function nivelSinLugar(base: PrismaClient | Prisma.TransactionClient, id: string, nivel: Nivel, cupo: Cupo = CUPO_DEL_SITIO): Promise<Fallo | null> {
  const lugares = cupo.lugares(nivel);
  if (lugares === null) return null;
  const { rotulo } = NIVELES[nivel - 1];
  // En el orden del sitio: sin `orderBy`, Postgres devuelve las filas como
  // quedaron en disco y el aviso nombraba a la gente en cualquier orden.
  const publicadas = await base.persona.findMany({ where: { nivel, publicado: true, id: { not: id } }, select: { slug: true, nombre: true, borrador: true }, orderBy: { orden: "asc" } });
  const otras = publicadas.filter((o) => cupo.ocupa(o.slug));
  if (otras.length < lugares) return null;
  const quienes = EN_LISTA.format(otras.map(nombreDe));
  const cuantas = lugares === 1 ? "una sola persona" : `${lugares} personas`;
  return falloEnCampo("nivel", `${rotulo} lleva ${cuantas} en el sitio, y hoy ${otras.length === 1 ? "es" : "son"} ${quienes}. Cambiá el nivel o despublicá ${otras.length === 1 ? "ese perfil" : "uno de esos perfiles"} primero.`);
}
