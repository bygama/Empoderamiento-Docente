import type { PrismaClient } from "@/../prisma/generado/client";
import { comoDocumento } from "@/lib/contenido/documento";
import type { Fallo } from "./choque";
import { nombreDe } from "./equipo-en-base";

// El orden del Equipo (SPEC §6.2 de `work/equipo/`): un paso por clic, dentro
// de su nivel, como el orden de los aliados en la tira. No va al borrador: es
// del equipo, no de una persona, y cambia el sitio en el momento.

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
  const todas = await base.persona.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true, nivel: true, borrador: true, nombre: true } });
  const esta = todas.find((f) => f.id === id);
  if (!esta) return NO_EXISTE;
  const nivel = nivelEnLaLista(esta);
  const filas = todas.filter((f) => nivelEnLaLista(f) === nivel);
  const i = filas.indexOf(esta);
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (j < 0 || j >= filas.length) return { ok: true, movio: false, nombre: nombreDe(esta) };
  // Se renumera el nivel entero en su orden nuevo: así un orden repetido de antes no deja dos en el mismo lugar.
  // `updateMany` y no `update`: si alguien borró un perfil entre la lectura y esto, se saltea en vez de tirar.
  const nuevo = filas.map((f) => f.id);
  [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
  await base.$transaction(nuevo.map((idDe, k) => base.persona.updateMany({ where: { id: idDe }, data: { orden: k } })));
  return { ok: true, movio: true, nombre: nombreDe(esta) };
}
