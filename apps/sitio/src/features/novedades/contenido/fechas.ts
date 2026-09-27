// Las fechas de las novedades, que van como texto con la precisión que da la
// fuente (`2026-08-26`, `2026-07`, `2026`). Sin librerías de fechas: lo leen
// el servidor y el navegador.

/**
 * El orden de las novedades: la más nueva primero. Las fechas van como texto
 * (`2026-08-26`, `2026-07`, `2026`) y se comparan como texto, así una fecha
 * con menos precisión queda después de las más precisas del mismo período:
 * «2025» después de «2025-05» (SPEC §7.2). Para `Array.sort`.
 */
export function compararFechas(a: string, b: string): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

// Fecha → "15 jul 2026", "jul 2026" o "2026", según la precisión que trae. Sin
// librerías de fechas ni el locale del navegador, que rompería la hidratación.
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** La fecha como la muestra el sitio: «15 jul 2026», «jul 2026» o «2026». */
export function fechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!mes) return `${anio}`;
  return dia ? `${dia} ${MESES[mes - 1]} ${anio}` : `${MESES[mes - 1]} ${anio}`;
}
