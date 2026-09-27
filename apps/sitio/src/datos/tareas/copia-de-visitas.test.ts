import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { diaISO, fechaUTC } from "@/lib/metricas/periodos";
import type { ClienteDeAnaliticas } from "@/lib/metricas/cliente";
import type { FiltroDePais } from "@/lib/metricas/tipos";
import { crearClienteDeAnaliticas } from "@/lib/metricas/vercel";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const HOY = new Date("2001-01-11T12:00:00.000Z");

// Las filas que escriben estos tests, y ninguna más: los días que copian (con
// la marca de agua que siembra el del 400) y el fin de cada ventana que
// guardan. Otros archivos siembran en otros años y corren a la vez: borrar
// por rango se llevaba sus filas.
const DIAS_QUE_ESCRIBEN = ["2001-01-10", "2001-09-10", "2001-11-09", "2001-11-10"].map(fechaUTC);
const FINES_DE_VENTANA = ["2001-01-03", "2001-01-10", "2001-09-03", "2001-09-10", "2001-11-03", "2001-11-10"].map(fechaUTC);

const clienteFalso: ClienteDeAnaliticas = {
  async porDia(rango, dimension) {
    if (dimension !== "total") return [];
    return [{ fecha: rango.hasta, dimension, valor: "", agrupado: false, vistas: 10, visitantes: 8 }];
  },
  async ventana() {
    return { vistas: 30, visitantes: 20 };
  },
};

const clienteRoto: ClienteDeAnaliticas = {
  async porDia() {
    throw new Error("Vercel respondió 401: el token no sirve o venció.");
  },
  async ventana() {
    throw new Error("no debería llegar acá");
  },
};

test("correr dos veces deja las mismas filas y dice qué días copió", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./copia-de-visitas");
  // minimoDias en las dos corridas: si la base ya tiene una fila `total` real
  // (mucho más nueva que 2001), rangoFaltante da null y sin esto el test
  // dependería de qué haya sincronizado el cron antes. Con minimoDias el
  // rango de los últimos días queda forzado pase lo que pase.
  const r1 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY, minimoDias: 3 });
  const r2 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY, minimoDias: 3 });
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  assert.equal(r2.detalle, "Del 2001-01-08 al 2001-01-10: 3 días, 1 filas, 3 ventanas.");
  const filas = await base.metricaDiaria.count({ where: { fecha: { gte: fechaUTC("2000-12-01"), lte: fechaUTC("2001-01-10") } } });
  assert.equal(filas, 1);
  // Solo las que entran en el mes del plan: la de 7, la de 7 anterior y la de 30.
  const ventanas = await base.metricaVentana.findMany({ where: { fechaFin: { gte: fechaUTC("2000-10-01"), lte: fechaUTC("2001-01-10") } }, orderBy: [{ fechaFin: "asc" }, { dias: "asc" }] });
  assert.deepEqual(
    ventanas.map((v) => [diaISO(v.fechaFin), v.dias]),
    [
      ["2001-01-03", 7],
      ["2001-01-10", 7],
      ["2001-01-10", 30],
    ],
  );
});

test("la hora y el cruce por país se guardan con su propia dimensión", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./copia-de-visitas");
  const filtros: FiltroDePais[] = [];
  const cliente: ClienteDeAnaliticas = {
    async porDia(rango, dimension, filtro) {
      if (filtro) filtros.push(filtro);
      const fila = { fecha: rango.hasta, dimension, agrupado: false, vistas: 2, visitantes: 2 };
      if (dimension === "hora") return [{ ...fila, valor: "13" }];
      if (dimension === "pagina" && filtro && "pais" in filtro && filtro.pais === "MX") return [{ ...fila, valor: "/que-hacemos" }];
      if (dimension === "total") return [{ ...fila, valor: "" }];
      return [];
    },
    async ventana() {
      return { vistas: 2, visitantes: 2 };
    },
  };
  const r = await sincronizarMetricas({ cliente, base, hoy: new Date("2001-09-11T12:00:00.000Z"), minimoDias: 1 });
  assert.equal(r.ok, true);
  const guardadas = await base.metricaDiaria.findMany({ where: { fecha: fechaUTC("2001-09-10") }, orderBy: { dimension: "asc" } });
  assert.deepEqual(
    guardadas.map((f) => [f.dimension, f.valor]),
    [
      ["hora", "13"],
      ["pagina-mx", "/que-hacemos"],
      ["total", ""],
    ],
  );
  assert.deepEqual(filtros, [{ pais: "CL" }, { pais: "MX" }, { pais: "AR" }, { fueraDe: ["CL", "MX", "AR"] }]);
});

test("si la API falla, la corrida sale fallida y no se copia nada", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./copia-de-visitas");
  // minimoDias por la misma razón que arriba: sin esto, una marca de agua
  // real y lejana haría "Nada nuevo" antes de llamar a la API rota, y el
  // error nunca se vería.
  const r = await sincronizarMetricas({ cliente: clienteRoto, base, hoy: new Date("2001-02-11T12:00:00.000Z"), minimoDias: 1 });
  assert.equal(r.ok, false);
  assert.match(r.detalle, /401/);
  const filas = await base.metricaDiaria.count({ where: { fecha: { gte: fechaUTC("2001-01-11"), lte: fechaUTC("2001-02-10") } } });
  assert.equal(filas, 0);
  const ventanas = await base.metricaVentana.count({ where: { fechaFin: { gte: fechaUTC("2001-01-11"), lte: fechaUTC("2001-02-10") } } });
  assert.equal(ventanas, 0);
});

test("una ventana que Vercel rechaza (400) no voltea la copia: va al detalle y la marca avanza igual", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./copia-de-visitas");
  const hoy = new Date("2001-11-11T12:00:00.000Z");
  const pedidas: string[] = [];
  // Respuestas grabadas con la forma de la API: el total del día, y un 400 para la ventana de 30 días.
  const cliente = crearClienteDeAnaliticas({
    token: "x",
    proyecto: "prj_x",
    fetchImpl: async (entrada) => {
      const url = new URL(String(entrada));
      const since = url.searchParams.get("since") ?? "";
      if (url.pathname.endsWith("/visits/count")) {
        pedidas.push(since);
        if (since === "2001-10-12") return new Response("rango fuera de la ventana de reporte", { status: 400 });
        return Response.json({ data: { pageviews: 9, visitors: 5 } });
      }
      const soloDia = url.searchParams.getAll("by").join(",") === "day";
      return Response.json({ data: soloDia ? [{ timestamp: "2001-11-10T00:00:00.000Z", pageviews: 9, visitors: 5 }] : [] });
    },
  });
  // La marca de agua es la del test, no la que haya dejado la base: con ella en el 9, se copia solo el 10
  // (una marca más nueva, de otro test o de datos reales, da lo mismo por `minimoDias`).
  const marca = { fecha: fechaUTC("2001-11-09"), dimension: "total", valor: "", agrupado: false };
  await base.metricaDiaria.upsert({ where: { fecha_dimension_valor_agrupado: marca }, create: { ...marca, vistas: 1, visitantes: 1 }, update: {} });
  const r = await sincronizarMetricas({ cliente, base, hoy, minimoDias: 1 });
  assert.equal(r.ok, true);
  assert.equal(r.detalle, "Del 2001-11-10 al 2001-11-10: 1 días, 1 filas, 2 ventanas. No se pudo: la de 30 días hasta el 2001-11-10 (Vercel respondió 400.).");
  // Nunca pidió más atrás que el mes del plan.
  assert.deepEqual(pedidas.sort(), ["2001-10-12", "2001-10-28", "2001-11-04"]);
  assert.equal(await base.metricaDiaria.count({ where: { fecha: fechaUTC("2001-11-10"), dimension: "total" } }), 1);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.metricaDiaria.deleteMany({ where: { fecha: { in: DIAS_QUE_ESCRIBEN } } });
  await base.metricaVentana.deleteMany({ where: { fechaFin: { in: FINES_DE_VENTANA } } });
  await base.$disconnect();
});
