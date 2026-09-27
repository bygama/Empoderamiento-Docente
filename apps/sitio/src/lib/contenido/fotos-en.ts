// Las fotos adentro de un JSON cualquiera —un documento de página, una
// columna, un borrador— sin saber de qué es: una foto es todo objeto con
// `src` y `alt` de texto, que es la forma de `ValorFoto` en todo el
// contenido. Lo usa el registro de usos de Fotos (`datos/fotos/`) para
// encontrar dónde está cada una y para cambiar su archivo en todos lados.

/** Por dónde se llega a un valor: claves de objeto e índices de lista. */
export type Camino = Array<string | number>;

export type FotoEncontrada = { camino: Camino; src: string; alt: string };

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esFoto(valor: Record<string, unknown>): valor is Record<string, unknown> & { src: string; alt: string } {
  return typeof valor.src === "string" && typeof valor.alt === "string";
}

/** Cada foto con archivo del valor, con su camino, en el orden del documento. Adentro de una foto no se busca otra. */
export function fotosEn(valor: unknown, camino: Camino = []): FotoEncontrada[] {
  if (Array.isArray(valor)) return valor.flatMap((item, i) => fotosEn(item, [...camino, i]));
  if (!esObjeto(valor)) return [];
  if (esFoto(valor)) return valor.src ? [{ camino, src: valor.src, alt: valor.alt }] : [];
  return Object.entries(valor).flatMap(([clave, v]) => fotosEn(v, [...camino, clave]));
}

/**
 * El valor con cada foto de `vieja` apuntando a `nueva`, y si cambió algo.
 * No toca el resto de la foto (el alt y el foco van con cada uso) ni el
 * valor original: devuelve una copia donde hubo cambios.
 */
export function cambiarFoto(valor: unknown, vieja: string, nueva: string): { valor: unknown; cambio: boolean } {
  if (Array.isArray(valor)) {
    const items = valor.map((item) => cambiarFoto(item, vieja, nueva));
    return items.some((i) => i.cambio) ? { valor: items.map((i) => i.valor), cambio: true } : { valor, cambio: false };
  }
  if (!esObjeto(valor)) return { valor, cambio: false };
  if (esFoto(valor)) return valor.src === vieja ? { valor: { ...valor, src: nueva }, cambio: true } : { valor, cambio: false };
  const entradas = Object.entries(valor).map(([clave, v]) => [clave, cambiarFoto(v, vieja, nueva)] as const);
  if (!entradas.some(([, r]) => r.cambio)) return { valor, cambio: false };
  return { valor: Object.fromEntries(entradas.map(([clave, r]) => [clave, r.valor])), cambio: true };
}
