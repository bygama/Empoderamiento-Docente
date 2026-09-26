import { siteConfig } from "@/config/site";
import { armarCorreo, duracion, type Contenido } from "./plantilla";

/**
 * «Elegí tu contraseña»: el enlace para elegirla. Lo manda «Olvidé mi
 * contraseña», y la invitación de una cuenta nueva usa el mismo correo con
 * otra vigencia (72 h).
 */
export function elegiTuContrasena({
  nombre,
  enlace,
  minutosDeVigencia,
}: {
  nombre?: string;
  enlace: string;
  minutosDeVigencia: number;
}): Contenido {
  return armarCorreo({
    asunto: "Elegí tu contraseña",
    nombre,
    antes: [`Para elegir la contraseña de tu cuenta en el admin del sitio de ${siteConfig.name}, entrá a este enlace.`],
    boton: { texto: "Elegir mi contraseña", enlace },
    despues: [
      `El enlace vence en ${duracion(minutosDeVigencia)} y sirve una sola vez.`,
      "Si no lo pediste, ignorá este correo: tu contraseña sigue igual.",
    ],
  });
}
