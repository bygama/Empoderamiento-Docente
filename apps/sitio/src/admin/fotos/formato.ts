// Cómo se dicen los datos de una foto en su ficha: el peso y el tipo, en llano.

const KB = 1024;

/** 145346 → «142 KB»; 1_300_000 → «1,2 MB». */
export function peso(bytes: number): string {
  if (bytes < KB * KB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  return `${(bytes / (KB * KB)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
}

const TIPOS: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/svg+xml": "svg" };

/** «image/webp» → «webp». */
export function tipo(mime: string): string {
  return TIPOS[mime] ?? mime;
}

/** «En 3 lugares», «En un lugar», «Sin usar». */
export function cuantosUsos(usos: number): string {
  if (usos === 0) return "Sin usar";
  return usos === 1 ? "En un lugar" : `En ${usos} lugares`;
}

/** El título de la ficha: el alt, cortado en una palabra si es largo; o lo que falta. */
export function tituloDeLaFoto(alt: string, maximo = 80): string {
  if (!alt) return "Foto sin texto alternativo";
  if (alt.length <= maximo) return alt;
  const corte = alt.slice(0, maximo);
  return `${corte.slice(0, corte.lastIndexOf(" ") > 0 ? corte.lastIndexOf(" ") : maximo)}…`;
}
