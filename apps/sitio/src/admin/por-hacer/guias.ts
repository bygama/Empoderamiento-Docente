// Lo que va a tener cada módulo del admin que todavía no existe, sacado del
// mapa del admin aprobado el 2026-09-23. Cada entrada del menú lleva a su
// guía hasta que el módulo se construye: ese día su entrada sale de acá y la
// ruta pasa a ser la pantalla de verdad. Cuando no quede ninguna, esta
// carpeta se borra.

export type Pantalla = {
  nombre: string;
  ruta: string;
  que: string;
  /** Si ya existe en otro lado, adónde está hoy. */
  hoy?: { href: string; etiqueta: string };
};

export type Guia = { nombre: string; para: string; pantallas: readonly Pantalla[] };

const GUIAS: Record<string, Guia> = {};

/** La guía de un módulo, o `undefined` si esa clave no es un módulo por hacer. */
export function guiaDe(modulo: string): Guia | undefined {
  return Object.hasOwn(GUIAS, modulo) ? GUIAS[modulo] : undefined;
}
