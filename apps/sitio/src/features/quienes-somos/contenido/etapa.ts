import { z } from "zod";
import { SIN_SALTOS, linea, opcional } from "@/features/biblioteca/contenido/campos-del-material";
import { TIPOS } from "@/features/biblioteca/contenido/modelo";
import { clave, deLista, renglones, sinRepetir } from "./campos-de-persona";
import { COLORES, COMPOSICIONES, TOPES } from "./modelo-del-equipo";

// Una etapa del recorrido (SPEC §4.1.1 de `work/equipo/`) y lo que cuelga de
// ella: los hitos, las ramas (estancias), los territorios y las
// publicaciones. Qué usa cada composición lo dice el formulario; lo que una
// composición no usa se guarda igual y el sitio no lo lee.

const unaLinea = (maximo: number) => opcional(maximo).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.");

function hitoDe(publicar: boolean) {
  return z.object({
    periodo: unaLinea(TOPES.periodo),
    titulo: linea(TOPES.tituloDeHito, publicar, "Falta el título del hito."),
    detalle: unaLinea(TOPES.detalleDeHito),
    /** Se destaca por sobre el resto (en `hitos` y en `sintesis`). */
    principal: z.boolean(),
  });
}

function ramaDe(publicar: boolean) {
  return z.object({
    periodo: unaLinea(TOPES.periodoDeRama),
    lugar: linea(TOPES.lugarDeRama, publicar, "Falta el lugar de la estancia."),
    detalle: linea(TOPES.detalleDeRama, publicar, "Falta qué hizo ahí."),
  });
}

/**
 * Una publicación de la etapa (SPEC §5.1): un material de la Biblioteca que la
 * persona firma —su título, año, tipo y link salen de ahí, y que exista y lo
 * firme lo chequea `datos/`— o una pieza sin link, que la Biblioteca no
 * guarda y se escribe acá una sola vez. El detalle y los conceptos son del
 * perfil; el detalle vacío, en una de la Biblioteca, lee su fuente.
 */
function publicacionDe<P extends boolean>(publicar: P) {
  const delPerfil = {
    detalle: unaLinea(TOPES.detalleDePublicacion),
    conceptos: renglones(TOPES.concepto, TOPES.conceptos, publicar, "los conceptos"),
    destacada: z.boolean(),
  };
  const material = z.uuid({ error: "Elegí un material de la Biblioteca." });
  return z.discriminatedUnion("origen", [
    z.object({ origen: z.literal("biblioteca"), material: publicar ? material : z.union([material, z.literal("")]), ...delPerfil }),
    z.object({
      origen: z.literal("sin-link"),
      titulo: linea(TOPES.tituloDePublicacion, publicar, "Falta el título."),
      tipo: deLista(TIPOS, publicar, "Elegí un tipo de la lista."),
      // Texto y no número: hay períodos, como «2015 – 2017».
      anio: linea(TOPES.anioDePublicacion, publicar, "Falta el año."),
      ...delPerfil,
    }),
  ]);
}

/** El material de una publicación de la Biblioteca; `""` en una sin link (no se compara). */
const materialDe = (p: { origen: string; material?: string }) => (p.origen === "biblioteca" ? (p.material ?? "") : "");

export function etapaDe<P extends boolean>(publicar: P) {
  return z.object({
    clave,
    // La clave de una categoría del recorrido; que esté la chequea el recorrido al publicar.
    categoria: z.string().trim().max(60),
    volanta: linea(TOPES.volanta, publicar, "Falta la volanta de la etapa."),
    color: deLista(COLORES, publicar, "Elegí el color de la etapa."),
    periodo: unaLinea(TOPES.periodo),
    composicion: deLista(COMPOSICIONES, publicar, "Elegí cómo se arma la etapa."),
    titulo: linea(TOPES.tituloDeEtapa, publicar, "Falta el título de la etapa."),
    texto: opcional(TOPES.textoDeEtapa).refine((t) => !publicar || t !== "", "Falta el texto de la etapa."),
    cita: opcional(TOPES.cita),
    hitos: z.array(hitoDe(publicar)).max(TOPES.hitos, `Como mucho ${TOPES.hitos} hitos por etapa.`),
    ramas: z.array(ramaDe(publicar)).max(TOPES.ramas, `Como mucho ${TOPES.ramas} estancias por etapa.`),
    territorios: renglones(TOPES.territorio, TOPES.territorios, publicar, "los territorios"),
    publicaciones: z
      .array(publicacionDe(publicar))
      .max(TOPES.publicaciones, `Como mucho ${TOPES.publicaciones} publicaciones por etapa.`)
      .refine((p) => p.filter((x) => x.destacada).length <= 1, "Una sola publicación destacada por etapa.")
      .refine((p) => sinRepetir(p, materialDe), "Ese material ya está en esta etapa."),
  });
}
