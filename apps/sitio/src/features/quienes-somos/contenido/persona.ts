import { z } from "zod";
import { SIN_SALTOS, linea, opcional } from "@/features/biblioteca/contenido/campos-del-material";
import { clave, deLista, exigido, fotoDe, renglones, sinRepetir, slugDe } from "./campos-de-persona";
import { etapaDe } from "./etapa";
import { ACERCAMIENTO, COLORES, FIGURAS, NUMEROS_DE_NIVEL, TOPES } from "./modelo-del-equipo";

// Qué es una persona del Equipo (SPEC §4 y §5 de `work/equipo/`), en dos
// esquemas con los mismos campos y los mismos topes, como una novedad
// (ADR-0014). `esquemaPersona` es lo que el sitio necesita, completo: se
// valida al publicar y otra vez al leer. `esquemaBorrador` deja todo vacío,
// porque un perfil recién empezado no tiene nada: guardar no frena por lo que
// falta, frena por lo que está mal. Una etapa, en etapa.ts.

const requerido = (maximo: number, publicar: boolean, falta: string) => opcional(maximo).refine((t) => !publicar || t !== "", falta);

function recorridoDe<P extends boolean>(publicar: P) {
  return z
    .object({
      nombreCompleto: linea(TOPES.nombreCompleto, publicar, "Falta el nombre completo."),
      rolCompleto: linea(TOPES.rolCompleto, publicar, "Falta el rol completo."),
      lugar: linea(TOPES.lugar, publicar, "Falta dónde vive."),
      origen: opcional(TOPES.lugar).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos."),
      titular: linea(TOPES.titular, publicar, "Falta el titular del recorrido."),
      intro: requerido(TOPES.intro, publicar, "Falta la bajada del recorrido."),
      formacion: renglones(TOPES.unaFormacion, TOPES.formacion, publicar, "la formación"),
      categorias: z
        .array(z.object({ clave, etiqueta: linea(TOPES.categoria, publicar, "Falta el nombre de la categoría."), color: deLista(COLORES, publicar, "Elegí el color de la categoría.") }))
        .max(TOPES.categorias, `Como mucho ${TOPES.categorias} categorías.`)
        .refine((c) => !publicar || c.length > 0, "Falta al menos una categoría: cada etapa se ordena en una.")
        .refine((c) => sinRepetir(c, (x) => x.clave), "Dos categorías tienen la misma clave."),
      figura: z
        .object({ tipo: z.enum(FIGURAS, { error: "Elegí cómo va la foto del recorrido." }), foto: fotoDe(publicar).nullable(), apaisado: z.boolean() })
        .refine((f) => !publicar || f.tipo === "sin" || f.foto !== null, { path: ["foto"], message: "Falta la foto de la figura, o elegí «Sin foto»." }),
      etapas: z
        .array(etapaDe(publicar))
        .max(TOPES.etapas, `Como mucho ${TOPES.etapas} etapas.`)
        .refine((e) => !publicar || e.length > 0, "Falta al menos una etapa.")
        .refine((e) => sinRepetir(e, (x) => x.clave), "Dos etapas tienen la misma clave."),
      cierre: z.object({
        titulo: linea(TOPES.cierreTitulo, publicar, "Falta el título del cierre."),
        texto: requerido(TOPES.cierreTexto, publicar, "Falta el texto del cierre."),
        textoDos: opcional(TOPES.cierreTextoDos),
      }),
    })
    .superRefine((r, ctx) => {
      // Cada etapa se ordena en una categoría del recorrido: el índice vivo se enciende por ella.
      if (!publicar) return;
      const claves = new Set(r.categorias.map((c) => c.clave));
      r.etapas.forEach((e, i) => {
        if (!claves.has(e.categoria)) ctx.addIssue({ code: "custom", path: ["etapas", i, "categoria"], message: "Elegí una de las categorías del recorrido." });
      });
    });
}

function esquemaDe<P extends boolean>(publicar: P) {
  return z
    .object({
      slug: slugDe(publicar),
      nombre: linea(TOPES.nombre, publicar, "Falta el nombre."),
      rol: linea(TOPES.rol, publicar, "Falta el rol."),
      pais: linea(TOPES.pais, publicar, "Falta el país."),
      nivel: exigido(z.literal(NUMEROS_DE_NIVEL, { error: "Elegí el nivel." }), publicar),
      foto: fotoDe(publicar).nullable(),
      // La persona pidió no publicar su foto: la tarjeta va tipográfica.
      sinFoto: z.boolean(),
      acercamiento: z
        .number({ error: "El acercamiento es un número." })
        .min(ACERCAMIENTO.minimo, `Como poco ${ACERCAMIENTO.minimo}: la foto tal cual.`)
        .max(ACERCAMIENTO.maximo, `Como mucho ${ACERCAMIENTO.maximo}.`),
      // Sin recorrido, el perfil es el básico: foto, nombre, rol y país.
      recorrido: recorridoDe(publicar).nullable(),
    })
    .refine((p) => !publicar || p.sinFoto || p.foto !== null, { path: ["foto"], message: "Falta la foto de la tarjeta, o marcá «Sin foto»." });
}

/** Lo que el sitio necesita, completo: se valida al publicar y al leer. */
export const esquemaPersona = esquemaDe(true);

/** Lo mismo, pero todo puede estar vacío: se valida al guardar un borrador. */
export const esquemaBorrador = esquemaDe(false);

export type Persona = z.output<typeof esquemaPersona>;
export type BorradorDePersona = z.output<typeof esquemaBorrador>;
export type Recorrido = NonNullable<Persona["recorrido"]>;
export type Etapa = Recorrido["etapas"][number];
export type PublicacionDeEtapa = Etapa["publicaciones"][number];
