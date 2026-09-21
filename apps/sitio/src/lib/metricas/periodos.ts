import type { Dia, Rango } from "./tipos";

// Todo en UTC: es como la API agrupa los días. En los husos horarios al
// oeste de UTC el corte del día cae a la tarde o a la noche; en un número
// mensual no se nota y el panel lo dice en la cabecera.

const MS_POR_DIA = 86_400_000;
export const MAXIMO_DIAS_POR_CORRIDA = 31;

export function diaISO(fecha: Date): Dia {
  return fecha.toISOString().slice(0, 10);
}

/** La fecha a medianoche UTC: lo que se guarda en las columnas `@db.Date`. */
export function fechaUTC(dia: Dia): Date {
  return new Date(`${dia}T00:00:00.000Z`);
}

export function sumarDias(dia: Dia, n: number): Dia {
  return diaISO(new Date(fechaUTC(dia).getTime() + n * MS_POR_DIA));
}

export function ayerUTC(hoy: Date): Dia {
  return sumarDias(diaISO(hoy), -1);
}

/**
 * Qué días faltan copiar: del siguiente al último guardado (o hace 30 días si
 * no hay nada) hasta ayer. Hoy no: el día está incompleto. Nunca más de 31
 * días por corrida, para que una función no se quede sin tiempo.
 */
export function rangoFaltante({ ultimoGuardado, hoy }: { ultimoGuardado: Dia | null; hoy: Date }): Rango | null {
  const hasta = ayerUTC(hoy);
  const desdeDeseado = ultimoGuardado ? sumarDias(ultimoGuardado, 1) : sumarDias(hasta, -29);
  if (desdeDeseado > hasta) return null;
  const desdeMinimo = sumarDias(hasta, -(MAXIMO_DIAS_POR_CORRIDA - 1));
  return { desde: desdeDeseado < desdeMinimo ? desdeMinimo : desdeDeseado, hasta };
}

/** Las ventanas que muestran las tarjetas, y las anteriores para comparar. */
export function ventanasDe(fechaFin: Dia): Array<{ fechaFin: Dia; dias: 7 | 30; desde: Dia }> {
  const ventana = (fin: Dia, dias: 7 | 30) => ({ fechaFin: fin, dias, desde: sumarDias(fin, -(dias - 1)) });
  return [ventana(fechaFin, 7), ventana(fechaFin, 30), ventana(sumarDias(fechaFin, -7), 7), ventana(sumarDias(fechaFin, -30), 30)];
}

/** «+12 %», «−3 %», «igual» o «sin datos previos»: como lo diría una persona. */
export function variacion(actual: number, anterior: number | null): string {
  if (anterior === null || anterior === 0) return "sin datos previos";
  const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
  if (porcentaje === 0) return "igual";
  return `${porcentaje > 0 ? "+" : "−"}${Math.abs(porcentaje)} %`;
}
