import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { nivelEnLaLista } from "./mover-equipo";

// Mover dentro del nivel. El intercambio es `unPasoMovido` (lib/orden.ts),
// puro y con su test; acá, a qué grupo va cada perfil, que también es puro.
// Contra la base, solo lo que no depende de las demás filas: los archivos de
// tests corren a la vez y otros suman perfiles al mismo grupo en el medio, así
// que un intercambio medido en la tabla puede caer con una fila ajena.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

test("se ordena en el nivel publicado; si nunca se publicó, en el de su borrador; sin ninguno, sin nivel", () => {
  assert.equal(nivelEnLaLista({ nivel: 3, borrador: { nivel: 4 } }), 3);
  assert.equal(nivelEnLaLista({ nivel: null, borrador: { nivel: 4 } }), 4);
  assert.equal(nivelEnLaLista({ nivel: null, borrador: { nivel: null } }), null);
  assert.equal(nivelEnLaLista({ nivel: null, borrador: null }), null);
});

test("un perfil que ya no existe no se mueve y lo dice", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { moverPersonaEnBase } = await import("./mover-equipo");
  const r = await moverPersonaEnBase(base, { id: "b0f1a5e2-0000-4000-8000-0000000000ff", hacia: "antes" });
  assert.match(!r.ok ? r.detalle : "", /ya no existe/);
});
