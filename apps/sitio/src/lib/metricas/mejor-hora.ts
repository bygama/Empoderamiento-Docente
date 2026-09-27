// «Mejor hora para publicar»: las visitas por hora de la copia (el día y la
// hora en UTC) llevadas a una zona horaria y sumadas por día de la semana y
// hora. Pura y sin ED: la zona la pasa quien llama.

export const DIAS_DE_LA_SEMANA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;

/** «los martes»: el día de la semana en plural, como se dice una costumbre. */
const LOS: readonly string[] = ["los lunes", "los martes", "los miércoles", "los jueves", "los viernes", "los sábados", "los domingos"];

const ABREVIADO_A_INDICE: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export type FilaPorHora = { fecha: string; valor: string; visitantes: number };

/**
 * Una grilla de 7 × 24 (de lunes a domingo, de 0 a 23) en la hora de `zona`.
 * Cada fila de la copia es un día UTC y su hora UTC; `Intl` la pasa a la
 * zona con su horario de verano de esa fecha.
 */
export function grillaDeHoras(filas: readonly FilaPorHora[], zona: string): number[][] {
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: zona, weekday: "short", hour: "2-digit", hourCycle: "h23" });
  const grilla = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const f of filas) {
    if (!/^\d{2}$/.test(f.valor)) continue;
    const instante = new Date(`${f.fecha}T${f.valor}:00:00.000Z`);
    if (Number.isNaN(instante.getTime())) continue;
    const p = Object.fromEntries(partes.formatToParts(instante).map((x) => [x.type, x.value]));
    const dia = ABREVIADO_A_INDICE[p.weekday];
    const hora = Number(p.hour) % 24;
    if (dia !== undefined) grilla[dia][hora] += f.visitantes;
  }
  return grilla;
}

export type Franja = { dia: number; hora: number; visitas: number };

/** Las `n` franjas con más visitas, de más a menos; en un empate, la que viene antes en la semana. */
export function mejoresFranjas(grilla: readonly (readonly number[])[], n = 3): Franja[] {
  return grilla
    .flatMap((horas, dia) => horas.map((visitas, hora) => ({ dia, hora, visitas })))
    .filter((f) => f.visitas > 0)
    .sort((a, b) => b.visitas - a.visitas || a.dia - b.dia || a.hora - b.hora)
    .slice(0, n);
}

/** «los martes de 10 a 11». */
export function franjaEnPalabras({ dia, hora }: Pick<Franja, "dia" | "hora">): string {
  return `${LOS[dia]} de ${hora} a ${hora + 1}`;
}

/** «los martes de 10 a 11, los miércoles de 10 a 11 y los lunes de 18 a 19». */
export function franjasEnPalabras(franjas: readonly Franja[]): string {
  const dichas = franjas.map(franjaEnPalabras);
  return dichas.length > 1 ? `${dichas.slice(0, -1).join(", ")} y ${dichas[dichas.length - 1]}` : (dichas[0] ?? "");
}
