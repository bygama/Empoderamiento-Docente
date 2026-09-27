import type { PrismaClient } from "@/../prisma/generado/client";
import { siteConfig } from "@/config/site";
import { base as baseDeLaApp } from "@/datos/cliente";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";
import { clienteDeInspeccionDesdeEntorno, SIN_CONEXION } from "@/lib/busquedas/entorno";
import type { ClienteDeInspeccion } from "@/lib/busquedas/inspeccion";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";

// Si cada ruta del sitemap está en Google (work/ajustes/SPEC.md §5.3), como
// tarea del cron diario (ADR-0011): la API de inspección tiene cuota, y el
// admin nunca la lee en el render. Deja una fila por ruta en
// `indexacion_de_urls` y borra las de las rutas que ya no están.

/** Cuántas por corrida: la cuota es de 2000 por día y hoy el sitio tiene 9 rutas. */
export const MAXIMO_POR_CORRIDA = 20;

/** Pasado esto no se empieza otra: la tarea tiene 50 segundos, y lo revisado queda guardado. */
export const FRENO_MS = 35_000;

const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function revisarIndexacion({
  cliente,
  base,
  rutas,
  sitio = siteConfig.url,
  reloj = Date.now,
}: {
  cliente: ClienteDeInspeccion;
  base: PrismaClient;
  rutas: readonly string[];
  /** El dominio de las URLs que se inspeccionan: el real, el de la propiedad. */
  sitio?: string;
  reloj?: () => number;
}): Promise<ResultadoDeTarea> {
  await base.indexacionDeUrl.deleteMany({ where: { ruta: { notIn: [...rutas] } } });
  const revisadas = new Map((await base.indexacionDeUrl.findMany({ select: { ruta: true, revisadaEn: true } })).map((r) => [r.ruta, r.revisadaEn.getTime()]));
  // Las nunca revisadas primero, después las de revisión más vieja.
  const turno = [...rutas].sort((a, b) => (revisadas.get(a) ?? -1) - (revisadas.get(b) ?? -1)).slice(0, MAXIMO_POR_CORRIDA);
  const empezo = reloj();
  let hechas = 0;
  let enGoogle = 0;
  // De a una: la cuota por minuto es de Google, y el orden es el de la prioridad.
  for (const ruta of turno) {
    if (reloj() - empezo > FRENO_MS) break;
    try {
      const inspeccion = await cliente.inspeccionar(new URL(ruta, sitio).toString());
      const fila = { ...inspeccion, revisadaEn: new Date() };
      await base.indexacionDeUrl.upsert({ where: { ruta }, create: { ruta, ...fila }, update: fila });
      hechas += 1;
      if (inspeccion.veredicto === "PASS") enGoogle += 1;
    } catch (e) {
      return { ok: false, detalle: `Se revisaron ${hechas} de ${rutas.length} URLs y se cortó: ${mensajeDe(e)}` };
    }
  }
  const quedan = rutas.length - hechas;
  const resto = quedan ? `; las otras ${quedan}, en la próxima corrida` : "";
  return { ok: true, detalle: `Se revisaron ${hechas} de ${rutas.length} URLs: ${enGoogle} en Google${resto}.` };
}

/** Arma el cliente con las variables de Search Console. Sin ellas, la corrida sale fallida y no toca la API. */
export async function revisarIndexacionDesdeEntorno(): Promise<ResultadoDeTarea> {
  const cliente = clienteDeInspeccionDesdeEntorno();
  if (!cliente) return { ok: false, detalle: SIN_CONEXION };
  return revisarIndexacion({ cliente, base: baseDeLaApp, rutas: await rutasDelSitio() });
}

export const indexacionDeGoogle: Tarea = { clave: "indexacion-de-google", nombre: "Indexación en Google", correr: () => revisarIndexacionDesdeEntorno() };
