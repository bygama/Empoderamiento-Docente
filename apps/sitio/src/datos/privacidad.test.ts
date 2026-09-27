import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { armarPlazos, leerPlazos } from "./privacidad";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// Las filas de `plazos_de_retencion` pasadas a la forma de la política, y la
// lectura con respaldo, sin base y contra la base local.

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

test("las filas quedan en historial, del más viejo al más nuevo, y el spam es el último", () => {
  const plazos = armarPlazos([
    { que: "cv", valor: 6, desde: d("2026-06-01") },
    { que: "cv", valor: 12, desde: d("1970-01-01") },
    { que: "spam", valor: 30, desde: d("1970-01-01") },
    { que: "spam", valor: 15, desde: d("2026-06-01") },
    { que: "contacto", valor: 0, desde: d("2026-06-01") },
    { que: "otra-cosa", valor: 5, desde: d("2026-06-01") },
  ]);
  assert.deepEqual(plazos.cv.map((t) => t.valor), [12, 6]);
  assert.equal(plazos.spam, 15);
  // Un cero no rige: Contacto se queda con el de antes.
  assert.deepEqual(plazos.contacto, [{ desde: new Date(0), valor: 24 }]);
});

test("sin DATABASE_URL o si la consulta tira, los de antes", async () => {
  const antes = process.env.DATABASE_URL;
  try {
    delete process.env.DATABASE_URL;
    assert.deepEqual(await leerPlazos(async () => [{ que: "cv", valor: 3, desde: d("2026-01-01") }]), armarPlazos([]));
    process.env.DATABASE_URL = "postgres://falsa";
    assert.deepEqual(
      await leerPlazos(async () => {
        throw new Error("Neon no contesta");
      }),
      armarPlazos([]),
    );
  } finally {
    if (antes === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = antes;
  }
});

test("la base arranca con los tres plazos de antes, vigentes desde siempre", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("./cliente");
  const iniciales = await base.plazoDeRetencion.findMany({ where: { desde: new Date(0) }, orderBy: { que: "asc" }, select: { que: true, valor: true } });
  assert.deepEqual(iniciales, [
    { que: "contacto", valor: 24 },
    { que: "cv", valor: 12 },
    { que: "spam", valor: 30 },
  ]);
});

/** Corre `hacer` en una transacción que se descarta al final: la base queda como estaba. */
async function sinQueQuede(hacer: (tx: import("@/../prisma/generado/client").Prisma.TransactionClient) => Promise<void>) {
  const { base } = await import("./cliente");
  const DESCARTAR = new Error("descartar");
  await assert.rejects(
    base.$transaction(async (tx) => {
      await hacer(tx);
      throw DESCARTAR;
    }),
    (e) => e === DESCARTAR,
  );
}

test("poner plazos deja una fila por cada uno que cambió, desde ahora", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { ponerPlazos } = await import("./acciones/editar-plazos");
  await sinQueQuede(async (tx) => {
    const antes = await tx.plazoDeRetencion.count();
    const cambios = await ponerPlazos(tx, { cv: 6, contacto: 24, spam: 30 }, "Prueba");
    assert.deepEqual(cambios, [{ que: "cv", antes: 12, ahora: 6 }]);
    assert.equal(await tx.plazoDeRetencion.count(), antes + 1);
    assert.deepEqual(await ponerPlazos(tx, { cv: 6, contacto: 24, spam: 30 }, "Prueba"), [], "sin cambios, ninguna fila");
  });
});

test("acortar cuenta lo que borraría de más; alargar, nada", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { cuantoSeBorraria } = await import("./acciones/editar-plazos");
  const hoy = new Date("2026-09-27T12:00:00.000Z");
  const correo = `prueba-plazos-${Date.now()}@ed.test`;
  await sinQueQuede(async (tx) => {
    await tx.mensaje.createMany({
      data: [
        { bandeja: "cv", nombre: "Prueba", correo, recibidoEn: d("2026-01-15") },
        { bandeja: "contacto", nombre: "Prueba", correo, recibidoEn: d("2025-12-01") },
      ],
    });
    // La base de la lane puede tener mensajes suyos: se cuenta la diferencia contra no cambiar nada.
    const base = await cuantoSeBorraria(tx, { cv: 12, contacto: 24, spam: 30 }, hoy);
    assert.deepEqual(base, { contacto: 0, cv: 0 });
    const acortado = await cuantoSeBorraria(tx, { cv: 6, contacto: 9, spam: 30 }, hoy);
    assert.ok(acortado.cv >= 1 && acortado.contacto >= 1, JSON.stringify(acortado));
    assert.deepEqual(await cuantoSeBorraria(tx, { cv: 24, contacto: 36, spam: 90 }, hoy), { contacto: 0, cv: 0 });
  });
});
