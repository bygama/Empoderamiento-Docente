// Una fecha con la precisión que da la fuente: el día (`2026-08-26`), el mes
// (`2026-07`) o solo el año (`2026`). Una revista dice el mes; un libro, el
// año. `Fecha` la edita en tres partes y esto las arma y las desarma. Sin
// validar: si el año está a medio escribir, el texto lo refleja, y quien
// guarda decide si pasa.

export type PartesDeFecha = { anio: string; mes: string; dia: string };

/** Los meses, en el orden del año, para el selector. */
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"] as const;

/** `"2026-07"` → `{ anio: "2026", mes: "07", dia: "" }`. Lo que no tiene la forma se lee como vacío. */
export function partesDeFecha(texto: string): PartesDeFecha {
  const [anio = "", mes = "", dia = ""] = texto.split("-");
  return { anio, mes, dia };
}

/** Las partes, de vuelta a texto: sin año no hay fecha, y sin mes no hay día. */
export function fechaDePartes({ anio, mes, dia }: PartesDeFecha): string {
  if (!anio) return "";
  if (!mes) return anio;
  return dia ? `${anio}-${mes}-${dia}` : `${anio}-${mes}`;
}

/** Cuántos días tiene ese mes (`"02"`) de ese año; 31 si el año o el mes todavía no son un número. */
export function diasDelMes(anio: string, mes: string): number {
  const a = Number(anio);
  const m = Number(mes);
  if (!/^\d{4}$/.test(anio) || !Number.isInteger(m) || m < 1 || m > 12) return 31;
  // El día 0 del mes siguiente es el último de este.
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

/** Dos dígitos: `3` → `"03"`. */
export const dosDigitos = (n: number) => String(n).padStart(2, "0");
