// El resaltado de un texto editable (SPEC §2.1 de `work/paginas-inicio/`): lo
// resaltado va entre dobles asteriscos, como en WhatsApp —«Somos **una
// idea**»—, y no es HTML ni un tipo de campo propio: es un `parrafo` o un
// `textoCorto` con un `.refine()` de la sección que exige las marcas cerradas.
// Sin dominio de ED; lo leen las secciones del sitio para armar sus fragmentos.

export type Fragmento = { texto: string; resaltado: boolean };

const MARCA = "**";

export const RESALTADO_SIN_CERRAR = "Falta cerrar un resaltado: lo resaltado va entre dos pares de asteriscos, **así**.";

/** El mensaje cuando una sección pide una cantidad justa de partes resaltadas. */
export function resaltadoExacto(cantidad: number): string {
  const cuantas = cantidad === 1 ? "una sola parte resaltada" : `${cantidad} partes resaltadas`;
  return `Tiene que haber ${cuantas}, entre dobles asteriscos: **así**.`;
}

/**
 * «Somos **una idea** hecha acción» → «Somos » · «una idea» (resaltado) ·
 * « hecha acción». Los espacios fuera de las marcas quedan tal cual. Una marca
 * sin cerrar se lee como texto, con sus asteriscos: el esquema no la deja
 * guardar, pero un documento viejo no rompe la página.
 */
export function fragmentos(texto: string): Fragmento[] {
  const partes = texto.split(MARCA);
  // Un número par de partes quiere decir una marca de más: la última va como texto.
  if (partes.length % 2 === 0) {
    const sinCerrar = partes.pop() ?? "";
    partes[partes.length - 1] += `${MARCA}${sinCerrar}`;
  }
  return partes.map((parte, i) => ({ texto: parte, resaltado: i % 2 === 1 })).filter((f) => f.texto !== "");
}

/** Cuántas partes resaltadas hay, o `null` si alguna marca quedó sin cerrar o vacía (`****`). */
function cuantosResaltados(texto: string): number | null {
  const partes = texto.split(MARCA);
  if (partes.length % 2 === 0) return null;
  const resaltadas = partes.filter((_, i) => i % 2 === 1);
  return resaltadas.some((p) => p.trim() === "") ? null : resaltadas.length;
}

/** Las marcas están cerradas y, si se pide, hay exactamente esa cantidad de partes resaltadas. */
export function resaltadoValido(texto: string, { exactamente }: { exactamente?: number } = {}): boolean {
  const cuantos = cuantosResaltados(texto);
  if (cuantos === null) return false;
  return exactamente === undefined || cuantos === exactamente;
}

/** Cada renglón con algo escrito es un párrafo: los renglones vacíos no cuentan. */
export function parrafos(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((renglon) => renglon.trim())
    .filter((renglon) => renglon !== "");
}
