import type { z } from "zod";
import { areasInicial, esquemaAreas } from "@/features/home/contenido/areas";
import { comoTrabajamosInicial, esquemaComoTrabajamos } from "@/features/home/contenido/como-trabajamos";
import { enNumerosInicial, esquemaEnNumeros } from "@/features/home/contenido/en-numeros";
import { esquemaHero, heroInicial } from "@/features/home/contenido/hero";
import { esquemaMision, misionInicial } from "@/features/home/contenido/mision";
import { esquemaQuienesSomos, quienesSomosInicial } from "@/features/home/contenido/quienes-somos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

// Qué secciones tiene cada página y en qué orden (SPEC §4.1). Es lo que el
// admin recorre para armar la pantalla y lo que datos/ usa para validar.
// Sumar una sección al admin es escribir su esquema en
// features/<pagina>/contenido/ y anotarla acá. Las siete páginas están desde
// ya, en el orden del menú; las que no tienen secciones aparecen en la lista
// del admin como «todavía no se edita».

export const PAGINAS = {
  inicio: {
    ruta: "/",
    nombre: "Inicio",
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHero, inicial: heroInicial },
      quienesSomos: { nombre: "¿Quiénes somos?", esquema: esquemaQuienesSomos, inicial: quienesSomosInicial },
      mision: { nombre: "Misión", esquema: esquemaMision, inicial: misionInicial },
      enNumeros: { nombre: "En números", esquema: esquemaEnNumeros, inicial: enNumerosInicial },
      comoTrabajamos: { nombre: "Cómo trabajamos", esquema: esquemaComoTrabajamos, inicial: comoTrabajamosInicial },
      areas: { nombre: "Áreas de especialización", esquema: esquemaAreas, inicial: areasInicial },
    },
  },
  "que-hacemos": { ruta: "/que-hacemos", nombre: "Qué hacemos", secciones: {} },
  "quienes-somos": { ruta: "/quienes-somos", nombre: "Quiénes somos", secciones: {} },
  investigacion: { ruta: "/investigacion", nombre: "Investigación", secciones: {} },
  biblioteca: { ruta: "/biblioteca", nombre: "Biblioteca", secciones: {} },
  novedades: { ruta: "/novedades", nombre: "Novedades", secciones: {} },
  contacto: { ruta: "/contacto", nombre: "Contacto", secciones: {} },
} satisfies RegistroDePaginas;

export type Slug = keyof typeof PAGINAS;

// Object.keys devuelve string[]: el `as` recupera las claves literales del registro, que son exactamente esas.
export const SLUGS = Object.keys(PAGINAS) as Slug[];

export function esSlug(valor: string): valor is Slug {
  return SLUGS.some((slug) => slug === valor);
}

type Secciones<S extends Slug> = (typeof PAGINAS)[S]["secciones"];

/** El contenido tipado de una página: `ContenidoDe<"inicio">` es `{ hero: Hero }`. */
export type ContenidoDe<S extends Slug> = {
  [K in keyof Secciones<S>]: Secciones<S>[K] extends { esquema: infer E extends z.ZodType } ? z.output<E> : never;
};
