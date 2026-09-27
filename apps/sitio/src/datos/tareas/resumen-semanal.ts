import { ZONA_HORARIA } from "@/config/metricas";
import { mandarCorreo } from "@/correos/mandar";
import { resumenSemanal, type NumeroDelResumen } from "@/correos/resumen-semanal";
import { destinatariosDe, type DestinatarioConRol } from "@/datos/avisos";
import { base } from "@/datos/cliente";
import { ayerUTC, fechaUTC } from "@/lib/metricas/periodos";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { copiaDeVisitas } from "./copia-de-visitas";
import { numerosDelResumen, paginaMasVista, semanaAntesDe, type Semana } from "./numeros-del-resumen";

// El resumen semanal por correo (SPEC de work/metricas-completas/ §8): una
// tarea del cron diario (ADR-0011) que actúa solo cuando en Chile es lunes, a
// quien lo activó, y recién con un mes de datos.

/** Cuántos días de copia hacen falta para el primer resumen: cuatro semanas. */
export const DIAS_PARA_EMPEZAR = 28;

const EN_LA_ZONA = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });

/** El día en la hora de ED («2026-09-28») y si es lunes. */
export function enLaZona(hoy: Date): { dia: string; lunes: boolean } {
  const p = Object.fromEntries(EN_LA_ZONA.formatToParts(hoy).map((x) => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, lunes: p.weekday === "Mon" };
}

/** Cuántos días de copia faltan para el primer resumen: 0 si ya hay un mes. */
export async function diasQueFaltan(hoy: Date = new Date()): Promise<number> {
  const primera = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "asc" }, select: { fecha: true } });
  if (!primera) return DIAS_PARA_EMPEZAR;
  const hay = Math.round((fechaUTC(ayerUTC(hoy)).getTime() - primera.fecha.getTime()) / 86_400_000) + 1;
  return Math.max(0, DIAS_PARA_EMPEZAR - hay);
}

const dia = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });

/** «del 21 al 27 de septiembre»: la semana que cuentan los números. */
function nombreDe(semana: Semana): string {
  const [desde, hasta] = [semana.desde, semana.hasta].map((d) => dia.format(fechaUTC(d)));
  const [diaDesde, mesDesde] = desde.split(" de ");
  return mesDesde === hasta.split(" de ")[1] ? `del ${diaDesde} al ${hasta}` : `del ${desde} al ${hasta}`;
}

type Dependencias = {
  hoy?: Date;
  mandar?: typeof mandarCorreo;
  destinatarios?: () => Promise<DestinatarioConRol[]>;
  faltan?: (hoy: Date) => Promise<number>;
  numeros?: (rol: unknown, semana: Semana) => Promise<NumeroDelResumen[]>;
  pagina?: (semana: Semana) => Promise<{ nombre: string; vistas: number } | null>;
};

export async function mandarResumenSemanal({
  hoy = new Date(),
  mandar = mandarCorreo,
  destinatarios = () => destinatariosDe("resumen-semanal"),
  faltan = diasQueFaltan,
  numeros = numerosDelResumen,
  pagina = paginaMasVista,
}: Dependencias = {}): Promise<ResultadoDeTarea> {
  const { dia: lunes, lunes: esLunes } = enLaZona(hoy);
  if (!esLunes) return { ok: true, detalle: "Hoy no es lunes: el resumen sale los lunes." };
  const falta = await faltan(hoy);
  if (falta > 0) return { ok: true, detalle: `Todavía no hay un mes de datos (faltan ${falta} días): no se mandó.` };
  const personas = await destinatarios();
  if (!personas.length) return { ok: true, detalle: "Nadie tiene activado el resumen semanal." };
  // La semana sale del lunes de Chile, y todos los números cuentan esa: de lunes a domingo.
  const semana = semanaAntesDe(lunes);
  const masVista = await pagina(semana);
  const enlace = `${urlDelSitio()}/admin/metricas?periodo=7`;
  // Un correo por persona, con los números de su rol; uno que no sale no frena a los demás.
  const envios = await Promise.allSettled(
    personas.map(async (p) => {
      const contenido = resumenSemanal({ nombre: p.nombre, semana: nombreDe(semana), numeros: await numeros(p.rol, semana), paginaMasVista: masVista, enlace });
      // La clave es la persona y el lunes: una segunda corrida el mismo día no lo manda otra vez.
      if ((await mandar({ para: p.correo, contenido, idempotencia: `resumen-semanal:${lunes}:${p.id}` })) === "no-salio") throw new Error("no salió");
    }),
  );
  const salieron = envios.filter((e) => e.status === "fulfilled").length;
  return { ok: salieron === personas.length, detalle: `Salió a ${salieron} de ${personas.length} ${personas.length === 1 ? "persona" : "personas"}.` };
}

// Lee la ventana de 7 días que termina el domingo, y esa la escribe la copia de las visitas de la misma corrida: la espera.
export const resumenSemanalDeMetricas: Tarea = {
  clave: "resumen-semanal",
  nombre: "Resumen semanal por correo",
  correr: () => mandarResumenSemanal(),
  despuesDe: copiaDeVisitas.clave,
};
