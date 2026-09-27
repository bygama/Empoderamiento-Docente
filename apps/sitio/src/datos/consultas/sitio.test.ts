import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { DatosDelSitio as Fila } from "@/../prisma/generado/client";
import { DATOS_INICIALES } from "@/config/datos-del-sitio";
import { leerDatosDelSitio } from "./sitio";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// Las ramas de la lectura con `consultar` inyectado, sin base, y una contra la
// base local: la fila que cargó la migración es igual a los datos iniciales.

const FILA: Fila = {
  id: 1,
  correo: "otro@empoderamientodocente.org",
  whatsapp: "56912345678",
  calle: "Calle 1",
  complemento: null,
  ciudad: "Ciudad",
  region: null,
  pais: "Chile",
  paises: ["Chile", "Perú"],
  instagram: null,
  facebook: null,
  linkedin: "https://www.linkedin.com/company/ed/",
  cambiadoEn: new Date(),
  cambiadoPor: "Ana",
};

/** Corre `hacer` con DATABASE_URL (o sin) y la fase de Next que diga, y deja el entorno como estaba. */
async function conEntorno<T>(entorno: { url?: string; fase?: string }, hacer: () => Promise<T>): Promise<T> {
  const antes = { url: process.env.DATABASE_URL, fase: process.env.NEXT_PHASE };
  const poner = (clave: "DATABASE_URL" | "NEXT_PHASE", valor?: string) => (valor === undefined ? delete process.env[clave] : (process.env[clave] = valor));
  poner("DATABASE_URL", entorno.url);
  poner("NEXT_PHASE", entorno.fase);
  try {
    return await hacer();
  } finally {
    poner("DATABASE_URL", antes.url);
    poner("NEXT_PHASE", antes.fase);
  }
}

test("sin DATABASE_URL, los datos iniciales sin consultar", async () => {
  let consulto = false;
  const datos = await conEntorno({}, () =>
    leerDatosDelSitio(async () => {
      consulto = true;
      return FILA;
    }),
  );
  assert.equal(consulto, false);
  assert.deepEqual(datos, DATOS_INICIALES);
});

test("con base, la fila con la forma del sitio", async () => {
  const datos = await conEntorno({ url: "postgres://falsa" }, () => leerDatosDelSitio(async () => FILA));
  assert.equal(datos.correo, FILA.correo);
  assert.deepEqual(datos.paises, ["Chile", "Perú"]);
  assert.deepEqual(datos.redes, { instagram: null, facebook: null, linkedin: FILA.linkedin });
  assert.deepEqual(datos.direccion, { calle: "Calle 1", complemento: null, ciudad: "Ciudad", region: null, pais: "Chile" });
});

test("sin fila o con una fila que no pasa el esquema, los datos iniciales", async () => {
  assert.deepEqual(await conEntorno({ url: "postgres://falsa" }, () => leerDatosDelSitio(async () => null)), DATOS_INICIALES);
  const rota = { ...FILA, correo: "no es un correo" };
  assert.deepEqual(await conEntorno({ url: "postgres://falsa" }, () => leerDatosDelSitio(async () => rota)), DATOS_INICIALES);
});

test("una consulta que tira: en una visita, los datos iniciales; en el build, el error", async () => {
  const tira = async (): Promise<Fila | null> => {
    throw new Error("Neon no contesta");
  };
  assert.deepEqual(await conEntorno({ url: "postgres://falsa" }, () => leerDatosDelSitio(tira)), DATOS_INICIALES);
  await assert.rejects(conEntorno({ url: "postgres://falsa", fase: "phase-production-build" }, () => leerDatosDelSitio(tira)), /Neon no contesta/);
});

test("la fila que cargó la migración es igual a los datos iniciales", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const fila = await base.datosDelSitio.findUnique({ where: { id: 1 } });
  assert.ok(fila, "no hay fila en datos_del_sitio: falta aplicar la migración");
  // Si Ajustes ya la cambió en esta base, no es la de la migración: no hay qué comparar.
  if (fila.cambiadoEn) return;
  assert.deepEqual(await leerDatosDelSitio(), DATOS_INICIALES);
});
