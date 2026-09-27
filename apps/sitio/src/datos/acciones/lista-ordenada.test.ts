import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { Prisma } from "@/../prisma/generado/client";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";
import { limpiarEquipo } from "./equipo-de-prueba";

// Mover a la vez en una lista ordenada contra el Postgres local: la
// reproducción de la revisión r1 de `work/equipo/`, achicada. Sin el candado
// de la lista, dos «Subir» a la vez leían el mismo orden viejo: Postgres cortaba
// a uno por deadlock o el segundo pisaba el paso del primero. El test arma su
// propia lista (cinco perfiles sin nivel, con su orden) y mide solo contra ella:
// los archivos de tests corren a la vez y otros suman perfiles en el medio.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const PREFIJO = "prueba-lista-ordenada";

async function modulos() {
  const { base } = await import("@/datos/cliente");
  return { base, ...(await import("./editar-equipo")), ...(await import("./lista-ordenada")) };
}

before(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});
after(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});

/** La lista de prueba: solo sus filas, en su orden. */
const ordenDe = (ids: readonly string[]) => async (tx: Prisma.TransactionClient) =>
  (await tx.persona.findMany({ where: { id: { in: [...ids] } }, orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true } })).map((f) => f.id);

async function renumerar(tx: Prisma.TransactionClient, ids: readonly string[]) {
  for (const [k, id] of ids.entries()) await tx.persona.updateMany({ where: { id }, data: { orden: k } });
}

test("cuatro «Subir» a la vez y un borrado: ni un deadlock, ni un paso perdido", sinBase, async () => {
  const { base, crearPersonaEnBase, borrarPersonaEnBase, moverEnLaLista, LISTAS } = await modulos();
  // Varias rondas: sin el candado, casi todas caen; con él, ninguna.
  for (let ronda = 0; ronda < 5; ronda++) {
    const creadas = [];
    for (const [k, letra] of ["a", "b", "c", "d", "e"].entries()) {
      const r = await crearPersonaEnBase(base, { contenido: { ...personaVacia(), slug: `${PREFIJO}-${ronda}-${letra}`, nombre: `Prueba ${letra}` }, quien: "Ana" });
      if (!r.ok) return assert.fail(r.detalle);
      await base.persona.update({ where: { id: r.id }, data: { orden: k } });
      creadas.push(r);
    }
    const [a, b, c, d, e] = creadas.map((r) => r.id);
    const subirE = () => moverEnLaLista(base, { lista: LISTAS.equipo, id: e, hacia: "antes", ordenDe: ordenDe([a, b, c, d, e]), renumerar });
    const resultados = await Promise.allSettled([subirE(), subirE(), subirE(), subirE(), borrarPersonaEnBase(base, { id: b, borradorEnVisto: creadas[1].borradorEn })]);
    const fallas = resultados.flatMap((r) => (r.status === "rejected" ? [String(r.reason).slice(0, 200)] : []));
    assert.deepEqual(fallas, [], `ronda ${ronda}`);
    // Cuatro pasos para arriba desde el último, con uno menos en la lista: llega primero en cualquier orden en que corran.
    assert.deepEqual(await ordenDe([a, b, c, d, e])(base), [e, a, c, d], `ronda ${ronda}`);
  }
});
