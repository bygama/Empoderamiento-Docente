import { SIN_PERMISO, puede } from "@ed/auth";
import { z } from "zod";
import { auth } from "@/datos/auth";
import { TIPOS, TOPES } from "@/features/biblioteca/contenido/modelo";
import { portadaTipografica } from "@/features/biblioteca/portada/generar";

// La portada tipográfica de lo que está en pantalla, para la ficha de un
// material (SPEC §13.2 de `work/biblioteca/`). Verifica la sesión y
// `editarBiblioteca` —una ruta no pasa por el layout ni por la guarda—: sin
// eso, cualquiera generaría imágenes con la marca de ED.

// Lo que no pasa dibuja igual, sin eso: el título puede estar a medio escribir.
const PEDIDO = z.object({
  titulo: z.string().max(TOPES.titulo).catch(""),
  firma: z.string().max(TOPES.firma).catch(""),
  tipo: z.enum(TIPOS).or(z.literal("")).catch(""),
  fuente: z.string().max(TOPES.fuente).catch(""),
  anio: z.string().regex(/^\d{4}$/).or(z.literal("")).catch(""),
});

function texto(estado: number, cuerpo: string): Response {
  return new Response(cuerpo, { status: estado, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function portadaDeLaVistaPrevia(pedido: Request): Promise<Response> {
  const sesion = await auth.api.getSession({ headers: pedido.headers });
  if (!sesion) return texto(401, "Hay que entrar al admin para ver la portada.");
  if (!puede(sesion.user.rol, "editarBiblioteca")) return texto(403, SIN_PERMISO);
  const buscado = new URL(pedido.url).searchParams;
  const leer = (clave: string) => buscado.get(clave) ?? "";
  return portadaTipografica(PEDIDO.parse({ titulo: leer("titulo"), firma: leer("firma"), tipo: leer("tipo"), fuente: leer("fuente"), anio: leer("anio") }));
}
