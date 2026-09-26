import { PANTALLAS_DE_CONTENIDO } from "@/admin/contenido/pantallas";
import type { Guia, Pantalla } from "./guias";

// Lo que va a tener cada pestaña de Contenido que todavía no existe, sacado
// del SPEC padre §5.3 (`work/mapa-del-admin/`). La lane que construye una
// pestaña borra su entrada; el nombre y qué es salen de `pantallas.ts`, como
// la pestaña y la tarjeta.

const PANTALLAS: Record<string, readonly Pantalla[]> = {
  casos: [
    { nombre: "Lista de casos", ruta: "/admin/contenido/casos", que: "Los cuatro casos con su número, su pregunta, su eje y su estado." },
    { nombre: "Ficha de un caso", ruta: "/admin/contenido/casos/[id]", que: "Pregunta, eje, indicio, ficha técnica, contexto, evidencias y análisis, con borrador, vista previa y publicar." },
  ],
  equipo: [
    { nombre: "Lista del equipo", ruta: "/admin/contenido/equipo", que: "Los 15 perfiles con su foto, su nombre y su rol, en el orden que se arrastre." },
    { nombre: "Ficha de un perfil", ruta: "/admin/contenido/equipo/[id]", que: "Nombre, rol, lugar y etapas con sus hitos. Las publicaciones salen de la Biblioteca." },
  ],
  aliados: [
    { nombre: "Lista de aliados", ruta: "/admin/contenido/aliados", que: "Cada logo con su nombre, si está autorizado y si está publicado." },
    { nombre: "Ficha de un aliado", ruta: "/admin/contenido/aliados/[id]", que: "Nombre, logo y URL. La marca «Autorizado» la ponen quien dirige o quien administra." },
  ],
  fotos: [
    { nombre: "Todas las fotos", ruta: "/admin/contenido/fotos", que: "La grilla, con los filtros Todas, Sin texto alternativo y Sin usar." },
    { nombre: "Ficha de una foto", ruta: "/admin/contenido/fotos/[id]", que: "El texto alternativo, el tamaño, quién la subió y dónde se usa. Se borra solo si no se usa." },
  ],
};

/** La guía de una pestaña de Contenido por hacer, o `undefined` si esa clave no es una. */
export function guiaDeContenido(clave: string): Guia | undefined {
  const pantalla = PANTALLAS_DE_CONTENIDO.find((p) => p.clave === clave);
  if (!pantalla || !Object.hasOwn(PANTALLAS, clave)) return undefined;
  return { nombre: pantalla.nombre, para: pantalla.que, pantallas: PANTALLAS[clave] };
}
