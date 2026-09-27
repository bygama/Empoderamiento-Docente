import type { z } from "zod";
import { catalogoInicial, esquemaCatalogo } from "@/features/biblioteca/contenido/catalogo";
import { cierreDeBibliotecaInicial, esquemaCierreDeBiblioteca } from "@/features/biblioteca/contenido/cierre";
import { destacadosInicial, esquemaDestacados } from "@/features/biblioteca/contenido/destacados";
import { esquemaHeroBiblioteca, heroBibliotecaInicial } from "@/features/biblioteca/contenido/hero";
import { esquemaPuente, puenteInicial } from "@/features/biblioteca/contenido/puente";
import { seoBibliotecaInicial } from "@/features/biblioteca/contenido/seo";
import { aperturaInicial, esquemaApertura } from "@/features/contacto/contenido/apertura";
import { cierreDeContactoInicial, esquemaCierreDeContacto } from "@/features/contacto/contenido/cierre";
import { seoContactoInicial } from "@/features/contacto/contenido/seo";
import { esquemaTitular, titularInicial } from "@/features/contacto/contenido/titular";
import { areasInicial, esquemaAreas } from "@/features/home/contenido/areas";
import { bibliotecaYNovedadesInicial, esquemaBibliotecaYNovedades } from "@/features/home/contenido/biblioteca-y-novedades";
import { comoTrabajamosInicial, esquemaComoTrabajamos } from "@/features/home/contenido/como-trabajamos";
import { enNumerosInicial, esquemaEnNumeros } from "@/features/home/contenido/en-numeros";
import { esquemaHero, heroInicial } from "@/features/home/contenido/hero";
import { esquemaMision, misionInicial } from "@/features/home/contenido/mision";
import { esquemaQuienesSomos, quienesSomosInicial } from "@/features/home/contenido/quienes-somos";
import { seoInicial } from "@/features/home/contenido/seo";
import { cicloInicial, esquemaCiclo } from "@/features/investigacion/contenido/ciclo";
import { cierreDeInvestigacionInicial, esquemaCierreDeInvestigacion } from "@/features/investigacion/contenido/cierre";
import { enAccionInicial, esquemaEnAccion } from "@/features/investigacion/contenido/en-accion";
import { esquemaHeroInvestigacion, heroInvestigacionInicial } from "@/features/investigacion/contenido/hero";
import { esquemaLineas, lineasInicial } from "@/features/investigacion/contenido/lineas";
import { seoInvestigacionInicial } from "@/features/investigacion/contenido/seo";
import { cierreDeNovedadesInicial, esquemaCierreDeNovedades } from "@/features/novedades/contenido/cierre";
import { destacadasDeNovedadesInicial, esquemaDestacadasDeNovedades } from "@/features/novedades/contenido/destacadas";
import { esquemaHeroDeNovedades, heroDeNovedadesInicial } from "@/features/novedades/contenido/hero";
import { esquemaLanzamientosDeNovedades, lanzamientosDeNovedadesInicial } from "@/features/novedades/contenido/lanzamientos";
import { esquemaMovimientoDeNovedades, movimientoDeNovedadesInicial } from "@/features/novedades/contenido/movimiento";
import { seoDeNovedadesInicial } from "@/features/novedades/contenido/seo";
import { esquemaUltimasDeNovedades, ultimasDeNovedadesInicial } from "@/features/novedades/contenido/ultimas";
import { areasInicial as areasDeQueHacemos, esquemaAreas as esquemaAreasDeQueHacemos } from "@/features/que-hacemos/contenido/areas";
import { cierreInicial as cierreDeQueHacemos, esquemaCierre as esquemaCierreDeQueHacemos } from "@/features/que-hacemos/contenido/cierre";
import { esquemaFaro, faroInicial } from "@/features/que-hacemos/contenido/faro";
import { esquemaHero as esquemaHeroDeQueHacemos, heroInicial as heroDeQueHacemos } from "@/features/que-hacemos/contenido/hero";
import { esquemaNiveles, nivelesInicial } from "@/features/que-hacemos/contenido/niveles";
import { esquemaProyectos, proyectosInicial } from "@/features/que-hacemos/contenido/proyectos";
import { seoQueHacemosInicial } from "@/features/que-hacemos/contenido/seo";
import { esquemaHero as esquemaHeroDeQuienesSomos, heroInicial as heroDeQuienesSomos } from "@/features/quienes-somos/contenido/hero";
import { equipoInicial, esquemaEquipo } from "@/features/quienes-somos/contenido/equipo";
import { esquemaMirada, miradaInicial } from "@/features/quienes-somos/contenido/mirada";
import { esquemaOrigen, origenInicial } from "@/features/quienes-somos/contenido/origen";
import { seoQuienesSomosInicial } from "@/features/quienes-somos/contenido/seo";
import {
  comoTrabajamosInicial as comoTrabajamosDeQueHacemos,
  esquemaComoTrabajamos as esquemaComoTrabajamosDeQueHacemos,
} from "@/features/que-hacemos/contenido/como-trabajamos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";
import type { Seo } from "@/lib/contenido/seo";

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
      // La frase en verde de cada paso es la idea del verbo de Qué hacemos: se edita allá.
      comoTrabajamos: {
        nombre: "Cómo trabajamos",
        esquema: esquemaComoTrabajamos,
        inicial: comoTrabajamosInicial,
        usa: { pagina: "que-hacemos", seccion: "comoTrabajamos", que: "Las frases en verde de los pasos" },
      },
      // Las siete áreas son las de Qué hacemos: acá se editan el título, la bajada y el enlace.
      areas: {
        nombre: "Áreas de especialización",
        esquema: esquemaAreas,
        inicial: areasInicial,
        usa: { pagina: "que-hacemos", seccion: "areas", que: "Las siete áreas" },
      },
      bibliotecaYNovedades: { nombre: "Biblioteca y Novedades", esquema: esquemaBibliotecaYNovedades, inicial: bibliotecaYNovedadesInicial },
    },
    // El SEO de hoy (SPEC §6 de work/paginas-inicio/): con esto la página tiene pestaña SEO.
    seo: seoInicial,
  },
  "que-hacemos": {
    ruta: "/que-hacemos",
    nombre: "Qué hacemos",
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHeroDeQueHacemos, inicial: heroDeQueHacemos },
      faro: { nombre: "Escena del faro", esquema: esquemaFaro, inicial: faroInicial },
      comoTrabajamos: { nombre: "Cómo trabajamos", esquema: esquemaComoTrabajamosDeQueHacemos, inicial: comoTrabajamosDeQueHacemos },
      areas: { nombre: "Áreas de especialización", esquema: esquemaAreasDeQueHacemos, inicial: areasDeQueHacemos },
      niveles: { nombre: "Niveles", esquema: esquemaNiveles, inicial: nivelesInicial },
      proyectos: { nombre: "Proyectos y aplicaciones", esquema: esquemaProyectos, inicial: proyectosInicial },
      cierre: { nombre: "Cierre", esquema: esquemaCierreDeQueHacemos, inicial: cierreDeQueHacemos },
    },
    seo: seoQueHacemosInicial,
  },
  "quienes-somos": {
    ruta: "/quienes-somos",
    nombre: "Quiénes somos",
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHeroDeQuienesSomos, inicial: heroDeQuienesSomos },
      origen: { nombre: "Origen, sentido y evolución", esquema: esquemaOrigen, inicial: origenInicial },
      mirada: { nombre: "Nuestra mirada", esquema: esquemaMirada, inicial: miradaInicial },
      equipo: { nombre: "Quiénes sostienen ED", esquema: esquemaEquipo, inicial: equipoInicial },
    },
    seo: seoQuienesSomosInicial,
  },
  investigacion: {
    ruta: "/investigacion",
    nombre: "Investigación",
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHeroInvestigacion, inicial: heroInvestigacionInicial },
      lineas: { nombre: "Líneas de investigación", esquema: esquemaLineas, inicial: lineasInicial },
      ciclo: { nombre: "Ciclo de investigación aplicada", esquema: esquemaCiclo, inicial: cicloInicial },
      enAccion: { nombre: "Investigación en acción", esquema: esquemaEnAccion, inicial: enAccionInicial },
      cierre: { nombre: "Cierre", esquema: esquemaCierreDeInvestigacion, inicial: cierreDeInvestigacionInicial },
    },
    seo: seoInvestigacionInicial,
  },
  biblioteca: {
    ruta: "/biblioteca",
    nombre: "Biblioteca",
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHeroBiblioteca, inicial: heroBibliotecaInicial },
      destacados: { nombre: "Material destacado", esquema: esquemaDestacados, inicial: destacadosInicial },
      catalogo: { nombre: "Catálogo", esquema: esquemaCatalogo, inicial: catalogoInicial },
      puente: { nombre: "Puente a Investigación", esquema: esquemaPuente, inicial: puenteInicial },
      cierre: { nombre: "Cierre", esquema: esquemaCierreDeBiblioteca, inicial: cierreDeBibliotecaInicial },
    },
    seo: seoBibliotecaInicial,
  },
  novedades: {
    ruta: "/novedades",
    nombre: "Novedades",
    // Los textos propios de la página (work/novedades-y-kit/SPEC.md §8); las novedades mismas son una tabla, con su módulo.
    secciones: {
      hero: { nombre: "Hero", esquema: esquemaHeroDeNovedades, inicial: heroDeNovedadesInicial },
      destacadas: { nombre: "Destacadas", esquema: esquemaDestacadasDeNovedades, inicial: destacadasDeNovedadesInicial },
      ultimas: { nombre: "Lo último", esquema: esquemaUltimasDeNovedades, inicial: ultimasDeNovedadesInicial },
      movimiento: { nombre: "ED en movimiento", esquema: esquemaMovimientoDeNovedades, inicial: movimientoDeNovedadesInicial },
      lanzamientos: { nombre: "Recién salido", esquema: esquemaLanzamientosDeNovedades, inicial: lanzamientosDeNovedadesInicial },
      cierre: { nombre: "Cierre", esquema: esquemaCierreDeNovedades, inicial: cierreDeNovedadesInicial },
    },
    seo: seoDeNovedadesInicial,
  },
  contacto: {
    ruta: "/contacto",
    nombre: "Contacto",
    secciones: {
      titular: { nombre: "Titular", esquema: esquemaTitular, inicial: titularInicial },
      apertura: { nombre: "Apertura", esquema: esquemaApertura, inicial: aperturaInicial },
      cierre: { nombre: "Cierre", esquema: esquemaCierreDeContacto, inicial: cierreDeContactoInicial },
    },
    seo: seoContactoInicial,
  },
} satisfies RegistroDePaginas;

export type Slug = keyof typeof PAGINAS;

// Object.keys devuelve string[]: el `as` recupera las claves literales del registro, que son exactamente esas.
export const SLUGS = Object.keys(PAGINAS) as Slug[];

export function esSlug(valor: string): valor is Slug {
  return SLUGS.some((slug) => slug === valor);
}

type Secciones<S extends Slug> = (typeof PAGINAS)[S]["secciones"];

/** Si la página tiene SEO, su contenido lo trae bajo `seo`. */
type SeoDe<S extends Slug> = (typeof PAGINAS)[S] extends { seo: Seo } ? { seo: Seo } : unknown;

/** El contenido tipado de una página: `ContenidoDe<"inicio">` es `{ hero: Hero; …; seo: Seo }`. */
export type ContenidoDe<S extends Slug> = {
  [K in keyof Secciones<S>]: Secciones<S>[K] extends { esquema: infer E extends z.ZodType } ? z.output<E> : never;
} & SeoDe<S>;
