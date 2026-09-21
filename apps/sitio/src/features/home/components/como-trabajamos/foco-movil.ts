import { resolverFoto, type ValorFoto } from "@/lib/contenido/fotos";

// Hacia dónde se recorta cada foto en celular, donde va apaisada: casi todas
// son verticales y lo que importa no está en el centro. Va por foto y no por
// paso: si desde el admin se carga otra, esa usa su propio foco.
const FOCO_MOVIL: Readonly<Record<string, string>> = {
  "/fotos/grupos-conversan.webp": "50% 50%",
  "/fotos/conferencia-problematizacion.webp": "50% 81%",
  "/fotos/pizarra-reparto-justo.webp": "40% 50%",
  "/fotos/formadora-acompana-grupo.webp": "50% 62%",
  "/fotos/producciones-geometricas.webp": "50% 15%",
};

/** El object-position de la foto de un paso en celular. */
export function focoMovil(foto: ValorFoto): string {
  return FOCO_MOVIL[foto.src] ?? resolverFoto(foto).objectPosition;
}
