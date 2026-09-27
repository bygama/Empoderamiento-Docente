import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { fechaUTC, variacion } from "@/lib/metricas/periodos";
import { semanaAntesDe } from "./numeros-del-resumen";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
// Los números leen la copia solo con las variables de Vercel; acá no se llama a la API.
process.env.VERCEL_TOKEN ||= "de-prueba";
process.env.VERCEL_ANALYTICS_PROJECT_ID ||= "de-prueba";

// Una semana de 1997, lejos de los días que siembran los demás tests: del
// lunes 3 al domingo 9 de marzo, que es la que cuenta el resumen del lunes 10.
// La anterior va del 24 de febrero al 2 de marzo.
const SEMANA = semanaAntesDe("1997-03-10");
const EN_1997 = { gte: fechaUTC("1997-01-01"), lte: fechaUTC("1997-12-31") };
const CLAVE = "prueba-del-resumen-semanal";

async function limpiar() {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.contador.deleteMany({ where: { clave: CLAVE } });
  await base.metricaVentana.deleteMany({ where: { fechaFin: EN_1997 } });
  await base.metricaDiaria.deleteMany({ where: { fecha: EN_1997 } });
  await base.busquedaDiaria.deleteMany({ where: { fecha: EN_1997 } });
}
before(limpiar);
after(limpiar);

test("la semana del resumen es de lunes a domingo, la anterior al lunes que sale", () => {
  assert.deepEqual(SEMANA, { desde: "1997-03-03", hasta: "1997-03-09" });
});

test("cada número cuenta de lunes a domingo, contra la semana anterior: el lunes en que sale no entra", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { numerosDelResumen, paginaMasVista } = await import("./numeros-del-resumen");
  const contador = (fecha: string, evento: string, cuenta: number) => ({ fecha: fechaUTC(fecha), evento, canal: "", clave: CLAVE, cuenta });
  await base.contador.createMany({
    data: [
      contador("1997-03-02", "contacto-envio", 2), // el domingo de la anterior
      contador("1997-03-03", "contacto-envio", 1),
      contador("1997-03-09", "contacto-envio", 4),
      contador("1997-03-10", "contacto-envio", 50), // el lunes en que sale: no
      contador("1997-03-05", "material-consultado", 3),
    ],
  });
  const ventana = (fin: string, vistas: number, visitantes: number) => ({ fechaFin: fechaUTC(fin), dias: 7, vistas, visitantes });
  await base.metricaVentana.createMany({ data: [ventana("1997-03-02", 50, 20), ventana("1997-03-09", 70, 30), ventana("1997-03-10", 999, 999)] });
  const pagina = (fecha: string, valor: string, vistas: number) => ({ fecha: fechaUTC(fecha), dimension: "pagina", valor, vistas, visitantes: 1 });
  await base.metricaDiaria.createMany({ data: [pagina("1997-03-04", "/la-de-la-semana", 40), pagina("1997-03-10", "/la-del-lunes", 500)] });
  const busqueda = (fecha: string, clics: number) => ({ fecha: fechaUTC(fecha), dimension: "total", valor: "", clics, impresiones: 10, sumaDePosiciones: 10 });
  await base.busquedaDiaria.createMany({ data: [busqueda("1997-02-26", 5), busqueda("1997-03-09", 8), busqueda("1997-03-10", 90)] });

  const cvPedidos: string[][] = [];
  const contarCV = async (desde: Date, hasta: Date) => (cvPedidos.push([desde.toISOString(), hasta.toISOString()]), cvPedidos.length === 1 ? 3 : 1);
  const conectado = (hastaDia: string) => async () => ({ conectado: true, hastaDia, ultima: null });

  const numeros = await numerosDelResumen("administra", SEMANA, { contarCV, estadoDeGoogle: conectado("1997-03-10") });
  assert.deepEqual(numeros, [
    { etiqueta: "Visitantes", valor: 30, variacion: variacion(30, 20) },
    { etiqueta: "Vistas", valor: 70, variacion: variacion(70, 50) },
    { etiqueta: "Clics desde Google", valor: 8, variacion: variacion(8, 5) },
    { etiqueta: "Contactos enviados", valor: 5, variacion: variacion(5, 2) },
    { etiqueta: "CV recibidos", valor: 3, variacion: variacion(3, 1) },
    { etiqueta: "Materiales consultados", valor: 3, variacion: "sin datos previos" },
  ]);
  // Los CV, del lunes a las 0 al lunes siguiente a las 0, y la semana anterior igual.
  assert.deepEqual(cvPedidos, [
    ["1997-03-03T00:00:00.000Z", "1997-03-10T00:00:00.000Z"],
    ["1997-02-24T00:00:00.000Z", "1997-03-03T00:00:00.000Z"],
  ]);
  assert.deepEqual(await paginaMasVista(SEMANA), { nombre: "/la-de-la-semana", vistas: 40 });

  // Si Search Console todavía no llegó al domingo, no hay número y se dice por qué; quien edita no recibe los CV.
  const deQuienEdita = await numerosDelResumen("edita", SEMANA, { contarCV, estadoDeGoogle: conectado("1997-03-07") });
  assert.deepEqual(
    deQuienEdita.map((n) => [n.etiqueta, n.valor, n.nota]),
    [
      ["Visitantes", 30, undefined],
      ["Vistas", 70, undefined],
      ["Clics desde Google", null, "Google los da con 2 o 3 días de atraso: todavía no llegó el domingo"],
      ["Contactos enviados", 5, undefined],
      ["Materiales consultados", 3, undefined],
    ],
  );
  assert.equal(cvPedidos.length, 2);
});
