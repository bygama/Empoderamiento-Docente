import type { ComponentType } from "react";
import type { Capacidad } from "@ed/auth";
import { Bandeja, BookOpen, Casa, Controles, Documento, Grafico, Periodico, Users, type IconProps } from "@/components/ui/icons";

// Las entradas de la sidebar, en grupos separados por un divisor: lo que se
// mira todos los días (qué hay pendiente, qué llegó, cómo va el sitio) y lo
// que se publica. Lo que se configura una vez va aparte, pegado abajo. Un
// solo nivel: lo que hay adentro de cada módulo va en pestañas, no acá.

export type Modulo = {
  clave: string;
  nombre: string;
  href: string;
  Icono: ComponentType<IconProps>;
  /** Los primeros segmentos después de `/admin` que la encienden. */
  segmentos: readonly string[];
  /**
   * Lo que hay que poder para verlo en la sidebar, y lo que pide la guarda del
   * módulo (`Guarda.tsx`; `guarda.test.ts` los cruza). Sin capacidad, lo ve
   * toda sesión: hoy, solo el Inicio.
   */
  capacidad?: Capacidad;
  /**
   * Lo que se crea en este módulo, como acceso rápido en el Inicio («Nueva
   * novedad»): lo ve quien tiene la capacidad del módulo. El módulo lo suma
   * en su línea cuando existe su pantalla: hoy, Novedades y Biblioteca.
   */
  accesoRapido?: { etiqueta: string; href: string };
};

export const GRUPOS: readonly (readonly Modulo[])[] = [
  [
    { clave: "inicio", nombre: "Inicio", href: "/admin", Icono: Casa, segmentos: [""] },
    { clave: "mensajes", nombre: "Mensajes", href: "/admin/mensajes", Icono: Bandeja, segmentos: ["mensajes"], capacidad: "verContacto" },
    { clave: "metricas", nombre: "Métricas", href: "/admin/metricas", Icono: Grafico, segmentos: ["metricas"], capacidad: "verMetricas" },
  ],
  [
    { clave: "contenido", nombre: "Contenido", href: "/admin/contenido", Icono: Documento, segmentos: ["contenido"], capacidad: "editarContenido" },
    {
      clave: "novedades",
      nombre: "Novedades",
      href: "/admin/novedades",
      Icono: Periodico,
      segmentos: ["novedades"],
      capacidad: "editarNovedades",
      accesoRapido: { etiqueta: "Nueva novedad", href: "/admin/novedades/nueva" },
    },
    {
      clave: "biblioteca",
      nombre: "Biblioteca",
      href: "/admin/biblioteca",
      Icono: BookOpen,
      segmentos: ["biblioteca"],
      capacidad: "editarBiblioteca",
      accesoRapido: { etiqueta: "Agregar material", href: "/admin/biblioteca/nuevo" },
    },
  ],
];

/** Pegado abajo: lo que se configura una vez. A quien edita no le aparece (sus capacidades lo dicen). */
export const CONFIGURACION: readonly Modulo[] = [
  { clave: "cuentas", nombre: "Cuentas", href: "/admin/cuentas", Icono: Users, segmentos: ["cuentas"], capacidad: "usarCuentas" },
  { clave: "ajustes", nombre: "Ajustes", href: "/admin/ajustes", Icono: Controles, segmentos: ["ajustes"], capacidad: "usarAjustes" },
];

/** Todos los módulos, en el orden de la sidebar. */
export const MODULOS: readonly Modulo[] = [...GRUPOS.flat(), ...CONFIGURACION];

/** El módulo de una clave, o `undefined`. */
export function moduloDe(clave: string): Modulo | undefined {
  return MODULOS.find((m) => m.clave === clave);
}

/** El segmento que decide la entrada activa: `/admin/novedades/3` → `novedades`, `/admin` → `""`. */
export function primerSegmento(ruta: string): string {
  return ruta.split("/")[2] ?? "";
}
