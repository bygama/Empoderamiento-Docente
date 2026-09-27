import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import { seBorraEl } from "@/config/privacidad";
import { cvQueSeBorranPronto, filaDeCvNuevos, filaDeCvQueSeBorran, filaDeMensajesSinLeer } from "./de-los-mensajes";
import { PENDIENTES } from "./pendientes";
import { enOrden, visiblesPara } from "./registro";

// Las filas que Mensajes le suma al Inicio: cómo se dicen, quién las ve y la
// cuenta de los CV que se borran pronto, que es la única con fechas.
cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

test("cada fila de Mensajes aparece cuando hay algo y no cuando no hay", () => {
  assert.equal(filaDeCvNuevos(0), null);
  assert.deepEqual(filaDeCvNuevos(1), { titulo: "1 CV nuevo", detalle: "Nadie lo tomó todavía." });
  assert.equal(filaDeCvNuevos(3)?.titulo, "3 CV nuevos");
  assert.equal(filaDeMensajesSinLeer(0), null);
  assert.equal(filaDeMensajesSinLeer(2)?.titulo, "2 mensajes de contacto sin leer");
  assert.equal(filaDeCvQueSeBorran(0), null);
  assert.equal(filaDeCvQueSeBorran(1)?.titulo, "1 CV se borra en 7 días");
});

test("quien edita ve los mensajes de contacto sin leer, pero ninguna fila de CV", () => {
  const claves = (rol: string) => visiblesPara(enOrden(PENDIENTES), rol).map((p) => p.clave);
  assert.ok(claves("edita").includes("mensajes-sin-leer"));
  assert.ok(!claves("edita").includes("cv-nuevos"));
  assert.ok(!claves("edita").includes("cv-que-se-borran"));
  for (const rol of ["dirige", "administra"]) {
    assert.ok(claves(rol).includes("cv-nuevos") && claves(rol).includes("cv-que-se-borran"), rol);
  }
});

test("los CV que se borran en 7 días son los de seBorraEl, también el spam", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  // En 1990: ningún otro test usa esas fechas, así la cuenta es solo de estas filas.
  const hoy = new Date("1990-01-01T12:00:00.000Z");
  const correo = `prueba-${randomUUID()}@ed.test`;
  const fila = (bandeja: string, recibidoEn: string, estado = "nuevo", estadoEn = recibidoEn) => ({
    bandeja,
    nombre: "Prueba",
    correo,
    estado,
    recibidoEn: new Date(recibidoEn),
    estadoEn: new Date(estadoEn),
  });
  const filas = [
    fila("cv", "1989-01-03T00:00:00.000Z"), // se borra el 3/1/1990: sí
    fila("cv", "1989-03-01T00:00:00.000Z"), // el 1/3/1990: no
    fila("cv", "1989-11-01T00:00:00.000Z", "spam", "1989-12-05T00:00:00.000Z"), // spam, el 4/1/1990: sí
    fila("contacto", "1987-01-01T00:00:00.000Z"), // de Contacto: no cuenta
  ];
  try {
    await base.mensaje.createMany({ data: filas });
    assert.equal(await cvQueSeBorranPronto(hoy), 2);
    const limite = new Date(hoy.getTime() + 7 * 86_400_000);
    const segunLaFicha = filas.filter((f) => f.bandeja === "cv" && seBorraEl({ ...f, bandeja: "cv", estado: f.estado as "nuevo" | "spam" }) <= limite);
    assert.equal(segunLaFicha.length, 2);
  } finally {
    await base.mensaje.deleteMany({ where: { correo } });
    await base.$disconnect();
  }
});
