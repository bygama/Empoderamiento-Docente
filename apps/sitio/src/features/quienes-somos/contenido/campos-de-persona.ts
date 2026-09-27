import { z } from "zod";
import { esValido, LARGO_MAXIMO } from "@ed/db/slug";
import { linea } from "@/features/biblioteca/contenido/campos-del-material";
import { esSrcDeFoto } from "@/lib/contenido/fotos";
import { TOPES } from "./modelo-del-equipo";

// Los campos de una persona que no son texto llano (SPEC §4.1 de
// `work/equipo/`): la URL, una foto con su foco y una lista de renglones.
// Cada constructor recibe `publicar`: `true` exige lo que el sitio necesita;
// `false` deja todo vacío, que es lo que puede tener un borrador. Los textos
// de una línea son los de la Biblioteca (`linea`, `opcional`, `deLaLista`).

export function slugDe(publicar: boolean) {
  return z
    .string()
    .trim()
    .max(LARGO_MAXIMO, `Como mucho ${LARGO_MAXIMO} caracteres.`)
    .refine((s) => !publicar || s !== "", "Falta la URL del perfil.")
    .refine((s) => s === "" || esValido(s), "La URL va en minúsculas y sin acentos ni espacios: letras, números y guiones.");
}

/** Una foto del contenido: el archivo, el alt y el foco. En un borrador, puede no haber archivo todavía. */
export function fotoDe(publicar: boolean) {
  return z.object({
    src: z
      .string()
      .trim()
      .refine((s) => !publicar || s !== "", "Falta la foto.")
      .refine((s) => s === "" || esSrcDeFoto(s), "La foto tiene que estar en /equipo/, en /fotos/, en /api/fotos/ o en el Blob del sitio."),
    alt: linea(TOPES.alt, publicar, "Falta el texto alternativo: qué se ve en la foto."),
    foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
  });
}

/** Renglones de una lista (la formación, los territorios, los conceptos): cada uno con su tope, ninguno vacío al publicar. */
export function renglones(maximo: number, cuantos: number, publicar: boolean, queEs: string) {
  return z.array(linea(maximo, publicar, `Hay un renglón vacío en ${queEs}: escribilo o quitalo.`)).max(cuantos, `Como mucho ${cuantos} en ${queEs}.`);
}

/** La clave fija de una etapa o de una categoría: no se edita, y la lista no la repite. */
export const clave = z.string().trim().min(1, "Falta la clave.").max(60, "Como mucho 60 caracteres.");

/** Que ninguna clave se repita en una lista: el índice del recorrido y las etapas se enlazan por ella. */
export function sinRepetir<T>(lista: readonly T[], de: (item: T) => string): boolean {
  const vistas = lista.map(de).filter((c) => c !== "");
  return new Set(vistas).size === vistas.length;
}
