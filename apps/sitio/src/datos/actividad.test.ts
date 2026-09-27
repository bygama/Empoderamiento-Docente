import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: la validación, la clave foránea con RESTRICT y que
// registrar no tire nunca solo se ven con la tabla de verdad.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];

async function crearCuenta(): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: "Prueba", email: `prueba-${id}@ed.test` } });
  return id;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: { in: creadas } } });
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("registra quién, qué, sobre qué y cuándo", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { registrarActividad } = await import("./actividad");
  const quien = await crearCuenta();
  await registrarActividad({ tipo: "cambio-su-nombre", quien, sobre: "  Ana María  " });
  const filas = await base.actividad.findMany({ where: { cuentaId: quien } });
  assert.equal(filas.length, 1);
  assert.equal(filas[0]?.tipo, "cambio-su-nombre");
  assert.equal(filas[0]?.sobre, "Ana María");
  assert.ok(filas[0] && Date.now() - filas[0].en.getTime() < 60_000);
});

test("entrar, salir y lo que alguien cambia de su cuenta lo ven solo quienes usan Cuentas", async () => {
  const { tiposQueVe } = await import("./actividad");
  const deLasCuentas = ["entro", "salio", "cambio-su-contrasena", "cambio-su-nombre"];
  for (const rol of ["dirige", "administra"]) {
    assert.deepEqual(
      tiposQueVe(rol).filter((t) => deLasCuentas.includes(t)),
      deLasCuentas,
      rol,
    );
  }
  assert.deepEqual(tiposQueVe("edita").filter((t) => deLasCuentas.includes(t)), []);
  // Lo de las páginas es contenido: lo ven los tres roles.
  for (const rol of ["dirige", "administra", "edita"]) {
    for (const tipo of ["publico-una-pagina", "descarto-un-borrador", "restauro-una-version"] as const) {
      assert.ok(tiposQueVe(rol).includes(tipo), `${rol} ve ${tipo}`);
    }
  }
  // Lo de Contacto lo ven los tres; que se borró un CV, solo quienes ven los CV.
  const deContacto = ["tomo-un-mensaje", "cerro-un-mensaje", "marco-un-mensaje-como-spam", "borro-un-mensaje"] as const;
  for (const tipo of deContacto) assert.ok(tiposQueVe("edita").includes(tipo), `edita ve ${tipo}`);
  assert.ok(!tiposQueVe("edita").includes("borro-un-cv"));
  assert.ok(tiposQueVe("administra").includes("borro-un-cv"));
  assert.deepEqual(tiposQueVe("inventado"), []);
  assert.deepEqual(tiposQueVe(undefined), []);
});

test("un tipo que no está en la lista no se guarda, y no tira", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { registrarActividad } = await import("./actividad");
  const quien = await crearCuenta();
  await registrarActividad({ tipo: "borro-todo" as never, quien });
  assert.equal(await base.actividad.count({ where: { cuentaId: quien } }), 0);
});

test("si la base no la guarda, registrar no tira", sinBase, async () => {
  const { registrarActividad } = await import("./actividad");
  // Una cuenta que no existe: la clave foránea la rechaza.
  await assert.doesNotReject(registrarActividad({ tipo: "entro", quien: randomUUID() }));
});

test("una cuenta con actividad no se puede borrar", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { registrarActividad } = await import("./actividad");
  const quien = await crearCuenta();
  await registrarActividad({ tipo: "entro", quien });
  await assert.rejects(base.user.delete({ where: { id: quien } }));
  assert.ok(await base.user.findUnique({ where: { id: quien } }));
});
