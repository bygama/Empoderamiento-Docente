import { z } from "zod";
import { esSrcDeFoto } from "@/lib/contenido/fotos";
import { TAMANOS, TOPES } from "./modelo";

// Qué es un aliado (`work/casos-aliados-fotos/SPEC.md` §5), en dos esquemas
// con los mismos campos y los mismos topes, como una novedad (ADR-0014):
// `esquemaAliado` es lo que el sitio necesita, completo, y se valida al
// publicar y otra vez al leer; `esquemaBorradorDeAliado` deja todo vacío. La
// autorización no está acá: no es contenido, es un hecho sobre ED, y se marca
// aparte (§5.1).

const SIN_SALTOS = /^[^\r\n]*$/;

function linea(maximo: number, publicar: boolean) {
  const texto = z.string().trim().max(maximo, `Como mucho ${maximo} caracteres.`).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos.");
  return publicar ? texto.min(1, "Este texto no puede quedar vacío.") : texto;
}

/** Una dirección completa y segura, o nada: sin URL, el logo no es un link. */
function esUrlDelAliado(url: string): boolean {
  return url === "" || (url.startsWith("https://") && URL.canParse(url));
}

function esquemaDe(publicar: boolean) {
  return z.object({
    /** Cómo lo llaman el admin y la actividad: «UCSH». */
    nombre: linea(TOPES.nombre, publicar),
    /** El logo, una foto de Fotos. Su alt es lo que lee un lector de pantalla en la tira. */
    logo: z.object({
      src: z
        .string()
        .trim()
        .refine((s) => !publicar || s !== "", "Falta el logo.")
        .refine((s) => s === "" || esSrcDeFoto(s), "El logo tiene que ser una foto de Fotos."),
      alt: linea(TOPES.alt, publicar),
      foco: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
    }),
    tamano: z.enum(TAMANOS.map((t) => t.valor), { error: "Elegí un tamaño de la lista." }),
    url: z.string().trim().max(TOPES.url, `Como mucho ${TOPES.url} caracteres.`).refine(esUrlDelAliado, "Una dirección completa, que empiece con https://."),
  });
}

/** Lo que el sitio necesita, completo: se valida al publicar y al leer. */
export const esquemaAliado = esquemaDe(true);

/** Lo mismo, pero todo puede estar vacío: se valida al guardar un borrador. */
export const esquemaBorradorDeAliado = esquemaDe(false);

export type Aliado = z.output<typeof esquemaAliado>;
export type BorradorDeAliado = z.output<typeof esquemaBorradorDeAliado>;
