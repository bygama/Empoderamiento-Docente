import { siteConfig } from "@/config/site";
import { armarCorreo, duracion, type Contenido } from "./plantilla";

/**
 * «Tu código para entrar»: el segundo factor. Llega después de poner bien la
 * contraseña, así que si no lo pidió la persona dueña de la cuenta, alguien
 * más tiene su contraseña, y el correo dice qué hacer.
 */
export function tuCodigo({
  nombre,
  codigo,
  minutosDeVigencia,
  olvideMiContrasena,
}: {
  nombre?: string;
  codigo: string;
  minutosDeVigencia: number;
  olvideMiContrasena: string;
}): Contenido {
  return armarCorreo({
    asunto: "Tu código para entrar",
    nombre,
    antes: [`Este es tu código para entrar al admin del sitio de ${siteConfig.name}:`],
    destacado: codigo,
    despues: [
      `Vence en ${duracion(minutosDeVigencia)} y sirve una sola vez.`,
      `Si no estabas entrando, alguien tiene tu contraseña: elegí otra ya mismo desde ${olvideMiContrasena} y avisale a quien administra el sitio.`,
    ],
  });
}
