import type { PrismaClient } from "@/../prisma/generado/client";
import { comoDocumento } from "@/lib/contenido/documento";
import type { Fallo } from "./choque";
import { nombreDe } from "./equipo-en-base";
import { LISTAS, moverEnLaLista } from "./lista-ordenada";

// El orden del Equipo (SPEC §6.2 de `work/equipo/`): un paso por clic, dentro
// de su nivel, como el orden de los aliados en la tira. No va al borrador: es
// del equipo, no de una persona, y cambia el sitio en el momento. El Equipo es
// una sola lista con su candado (lista-ordenada.ts): un perfil cambia de grupo
// al publicarse en otro nivel, y un candado por nivel pediría dos a la vez.

export type Hacia = "antes" | "despues";

const NO_EXISTE: Fallo = { ok: false, detalle: "Ese perfil ya no existe: lo borraron desde que abriste la lista." };

/** El nivel donde la lista muestra a una persona: el publicado o, si nunca se publicó, el de su borrador. */
export function nivelEnLaLista(fila: { nivel: number | null; borrador: unknown }): number | null {
  if (fila.nivel !== null) return fila.nivel;
  const delBorrador = comoDocumento(fila.borrador).nivel;
  return typeof delBorrador === "number" ? delBorrador : null;
}

/**
 * Sube o baja un lugar dentro de su nivel, cambiándolo con el de al lado. En
 * una punta, no hace nada. Dice a quién movió, para la actividad.
 */
export async function moverPersonaEnBase(base: PrismaClient, { id, hacia }: { id: string; hacia: Hacia }): Promise<{ ok: true; movio: boolean; nombre: string } | Fallo> {
  let nombre = "";
  const movio = await moverEnLaLista(base, {
    lista: LISTAS.equipo,
    id,
    hacia,
    async ordenDe(tx) {
      const todas = await tx.persona.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true, nivel: true, borrador: true, nombre: true } });
      const esta = todas.find((f) => f.id === id);
      if (!esta) return [];
      nombre = nombreDe(esta);
      const nivel = nivelEnLaLista(esta);
      return todas.filter((f) => nivelEnLaLista(f) === nivel).map((f) => f.id);
    },
    // `updateMany`: una fila que se borró sin pasar por el candado (la limpieza de un test) se saltea en vez de tirar.
    async renumerar(tx, ids) {
      for (const [k, idDe] of ids.entries()) await tx.persona.updateMany({ where: { id: idDe }, data: { orden: k } });
    },
  });
  return movio === undefined ? NO_EXISTE : { ok: true, movio, nombre };
}
