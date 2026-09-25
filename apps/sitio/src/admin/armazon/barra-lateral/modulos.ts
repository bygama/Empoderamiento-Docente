import type { ComponentType } from "react";
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
};

export const GRUPOS: readonly (readonly Modulo[])[] = [
  [
    { clave: "inicio", nombre: "Inicio", href: "/admin", Icono: Casa, segmentos: [""] },
    { clave: "mensajes", nombre: "Mensajes", href: "/admin/mensajes", Icono: Bandeja, segmentos: ["mensajes"] },
    { clave: "metricas", nombre: "Métricas", href: "/admin/metricas", Icono: Grafico, segmentos: ["metricas"] },
  ],
  [
    // «paginas» la enciende hasta que Páginas se mude a /admin/contenido/paginas.
    { clave: "contenido", nombre: "Contenido", href: "/admin/contenido", Icono: Documento, segmentos: ["contenido", "paginas"] },
    { clave: "novedades", nombre: "Novedades", href: "/admin/novedades", Icono: Periodico, segmentos: ["novedades"] },
    { clave: "biblioteca", nombre: "Biblioteca", href: "/admin/biblioteca", Icono: BookOpen, segmentos: ["biblioteca"] },
  ],
];

/** Pegado abajo, y solo para quien puede tocar cuentas: a quien edita no le aparece. */
export const CONFIGURACION: readonly Modulo[] = [
  { clave: "cuentas", nombre: "Cuentas", href: "/admin/cuentas", Icono: Users, segmentos: ["cuentas"] },
  { clave: "ajustes", nombre: "Ajustes", href: "/admin/ajustes", Icono: Controles, segmentos: ["ajustes"] },
];

/** El segmento que decide la entrada activa: `/admin/novedades/3` → `novedades`, `/admin` → `""`. */
export function primerSegmento(ruta: string): string {
  return ruta.split("/")[2] ?? "";
}
