// El estado de cada tarjeta del índice de Contenido (SPEC §7.5 de
// `work/casos-aliados-fotos/`): la cuenta y, si hay, lo que pide atención.
// Sin pendientes, solo la cuenta. Puras: se prueban sin base.

const cuenta = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** «4 casos · 1 con cambios sin publicar», o «4 casos». */
export function resumenDeCasos(filas: ReadonlyArray<{ estado: { borradorEn: string | null } }>): string {
  const total = cuenta(filas.length, "caso", "casos");
  const conCambios = filas.filter((f) => f.estado.borradorEn).length;
  return conCambios ? `${total} · ${conCambios} con cambios sin publicar` : total;
}

/** «5 aliados · 1 sin autorizar», o «5 aliados». */
export function resumenDeAliados(filas: ReadonlyArray<{ autorizado: boolean }>): string {
  const total = cuenta(filas.length, "aliado", "aliados");
  const sinAutorizar = filas.filter((f) => !f.autorizado).length;
  return sinAutorizar ? `${total} · ${sinAutorizar} sin autorizar` : total;
}

/** «47 fotos · 2 sin texto alternativo», o «47 fotos». */
export function resumenDeFotos({ total, sinAlt }: { total: number; sinAlt: number }): string {
  const todas = cuenta(total, "foto", "fotos");
  return sinAlt ? `${todas} · ${sinAlt} sin texto alternativo` : todas;
}
