// Lo de un aliado que no necesita Zod (`work/casos-aliados-fotos/SPEC.md` §5):
// los tamaños de la tira y los topes. Aparte de aliado.ts (los esquemas)
// porque lo leen los componentes del sitio y el formulario del admin, y Zod
// no tiene que viajar con ellos.

/**
 * Cuánto alto le da la tira a un logo para que pese lo mismo que los demás:
 * una marca vertical (Techint) o un lockup con texto chico en dos líneas
 * (UCSH) necesita más alto que un wordmark de una línea (UNESCO, Bloom). La
 * tira del Inicio tiene el renglón un poco más alto que la del pie y la de
 * Qué hacemos, por eso van dos clases. Cerrada: sumar un tamaño es un cambio
 * de código, porque el diseño los conoce.
 */
export const TAMANOS = [
  { valor: "chico", etiqueta: "Chico", ayuda: "un wordmark de una línea", inicio: "h-8", pie: "h-7" },
  { valor: "mediano", etiqueta: "Mediano", ayuda: "un lockup ancho, con texto chico", inicio: "h-11", pie: "h-10" },
  { valor: "grande", etiqueta: "Grande", ayuda: "una marca vertical o en dos líneas", inicio: "h-12", pie: "h-11" },
] as const;

export type Tamano = (typeof TAMANOS)[number]["valor"];

/** Las clases de alto de un tamaño; uno que no es de la lista (un dato viejo) va como chico. */
export function altoDe(tamano: string): { inicio: string; pie: string } {
  const t = TAMANOS.find((x) => x.valor === tamano) ?? TAMANOS[0];
  return { inicio: t.inicio, pie: t.pie };
}

export const TOPES = { nombre: 60, alt: 200, url: 300, autorizacion: 300 } as const;
