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

/**
 * Cuántas por corrida: la cuota es de 2000 por día y 600 por minuto, y hoy el
 * sitio tiene 9 rutas. Van todas a la vez: cada pedido tiene su tiempo máximo
 * (20 s), así la corrida entra en sus 50.
 */
export const MAXIMO_POR_CORRIDA = 20;

const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function revisarIndexacion({
  cliente,
  base,
  rutas,
  sitio = siteConfig.url,
}: {
  cliente: ClienteDeInspeccion;
  base: PrismaClient;
  rutas: readonly string[];
  /** El dominio de las URLs que se inspeccionan: el real, el de la propiedad. */
  sitio?: string;
}): Promise<ResultadoDeTarea> {
  await base.indexacionDeUrl.deleteMany({ where: { ruta: { notIn: [...rutas] } } });
  const revisadas = new Map((await base.indexacionDeUrl.findMany({ select: { ruta: true, revisadaEn: true } })).map((r) => [r.ruta, r.revisadaEn.getTime()]));
  // Las nunca revisadas primero, después las de revisión más vieja.
  const turno = [...rutas].sort((a, b) => (revisadas.get(a) ?? -1) - (revisadas.get(b) ?? -1)).slice(0, MAXIMO_POR_CORRIDA);
  // Aisladas: una que falla no se lleva a las otras, y lo revisado queda guardado.
  const lecturas = await Promise.allSettled(turno.map(async (ruta) => ({ ruta, ...(await cliente.inspeccionar(new URL(ruta, sitio).toString())) })));
  const hechas = lecturas.flatMap((l) => (l.status === "fulfilled" ? [l.value] : []));
  const revisadaEn = new Date();
  await base.$transaction(
    hechas.map(({ ruta, ...inspeccion }) => base.indexacionDeUrl.upsert({ where: { ruta }, create: { ruta, ...inspeccion, revisadaEn }, update: { ...inspeccion, revisadaEn } })),
  );
  const enGoogle = hechas.filter((h) => h.veredicto === "PASS").length;
  const fallos = lecturas.flatMap((l) => (l.status === "rejected" ? [l.reason] : []));
  if (fallos.length) {
    return { ok: false, detalle: `Se revisaron ${hechas.length} de ${rutas.length} URLs; ${fallos.length} no se pudieron revisar: ${mensajeDe(fallos[0])}` };
  }
  const quedan = rutas.length - hechas.length;
  const resto = quedan ? `; las otras ${quedan}, en la próxima corrida` : "";
  return { ok: true, detalle: `Se revisaron ${hechas.length} de ${rutas.length} URLs: ${enGoogle} en Google${resto}.` };
}

/** Arma el cliente con las variables de Search Console. Sin ellas, la corrida sale fallida y no toca la API. */
export async function revisarIndexacionDesdeEntorno(): Promise<ResultadoDeTarea> {
  const cliente = clienteDeInspeccionDesdeEntorno();
  if (!cliente) return { ok: false, detalle: SIN_CONEXION };
  return revisarIndexacion({ cliente, base: baseDeLaApp, rutas: await rutasDelSitio() });
}

export const indexacionDeGoogle: Tarea = { clave: "indexacion-de-google", nombre: "Indexación en Google", correr: () => revisarIndexacionDesdeEntorno() };
