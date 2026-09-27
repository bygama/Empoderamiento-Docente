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

const GUIAS: Record<string, Guia> = {
  biblioteca: {
    nombre: "Biblioteca",
    para: "Los 63 materiales, que llevan a la revista o a la editorial.",
    pantallas: [
      { nombre: "Lista de materiales", ruta: "/admin/biblioteca", que: "Buscador, filtros por tipo y por estado, consultas del mes y links rotos." },
      { nombre: "Agregar material", ruta: "/admin/biblioteca/nuevo", que: "Se pega un DOI, un ISBN o un link y el formulario se completa solo." },
      { nombre: "Ficha de un material", ruta: "/admin/biblioteca/[id]", que: "Autores vinculados al Equipo, cita APA y el último chequeo del link." },
    ],
  },
};

/** La guía de un módulo, o `undefined` si esa clave no es un módulo por hacer. */
export function guiaDe(modulo: string): Guia | undefined {
  return Object.hasOwn(GUIAS, modulo) ? GUIAS[modulo] : undefined;
}
