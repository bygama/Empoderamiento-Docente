import { SIN_PERMISO, puede } from "@ed/auth";
import { z } from "zod";
import { auth } from "@/datos/auth";
import { CATEGORIAS } from "@/features/novedades/contenido/modelo";
import { esquemaBorrador } from "@/features/novedades/contenido/novedad";
import { imagenParaRedes } from "@/features/novedades/imagen-para-redes/generar";

// La imagen para redes de lo que está en pantalla, para la vista previa de la
// ficha de una novedad (SPEC §6.3 de `work/novedades-y-kit/`). Verifica la
// sesión y `editarNovedades` —una ruta no pasa por el layout ni por la
// guarda—: sin eso, cualquiera generaría imágenes con la marca de ED.

// Lo de la dirección, con los campos del esquema del borrador. Lo que no pasa
// dibuja igual, sin eso: el título puede estar a medio escribir.
const PEDIDO = z.object({
  titulo: esquemaBorrador.shape.titulo.catch(""),
  categoria: esquemaBorrador.shape.categoria.catch(CATEGORIAS[0].clave),
  fecha: esquemaBorrador.shape.fecha.catch(""),
});

function texto(estado: number, cuerpo: string): Response {
  return new Response(cuerpo, { status: estado, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function imagenDeLaVistaPrevia(pedido: Request): Promise<Response> {
  const sesion = await auth.api.getSession({ headers: pedido.headers });
  if (!sesion) return texto(401, "Hay que entrar al admin para ver la vista previa.");
  if (!puede(sesion.user.rol, "editarNovedades")) return texto(403, SIN_PERMISO);
  const buscado = new URL(pedido.url).searchParams;
  const datos = PEDIDO.parse({ titulo: buscado.get("titulo") ?? "", categoria: buscado.get("categoria") ?? "", fecha: buscado.get("fecha") ?? "" });
  return imagenParaRedes(datos);
}
