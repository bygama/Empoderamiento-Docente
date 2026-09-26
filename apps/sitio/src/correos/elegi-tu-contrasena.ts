import { siteConfig } from "@/config/site";
import { armarCorreo, duracion, type Contenido } from "./plantilla";

/**
 * «Elegí tu contraseña»: el enlace para elegirla. Lo manda «Olvidé mi
 * contraseña», y la invitación de una cuenta nueva usa el mismo correo, con
 * otra vigencia (72 h) y diciendo quién invita y con qué rol: a quien no pidió
 * nada, «si no lo pediste» no le explica por qué le llegó.
 */
export function elegiTuContrasena({
  nombre,
  enlace,
  minutosDeVigencia,
  invitacion,
}: {
  nombre?: string;
  enlace: string;
  minutosDeVigencia: number;
  invitacion?: { quienInvita: string; rol: string };
}): Contenido {
  const sitio = `admin del sitio de ${siteConfig.name}`;
  return armarCorreo({
    asunto: "Elegí tu contraseña",
    nombre,
    antes: [
      invitacion
        ? `${invitacion.quienInvita} te invitó al ${sitio}, con el rol «${invitacion.rol}». Para entrar, elegí tu contraseña en este enlace.`
        : `Para elegir la contraseña de tu cuenta en el ${sitio}, entrá a este enlace.`,
    ],
    boton: { texto: "Elegir mi contraseña", enlace },
    despues: [
      `El enlace vence en ${duracion(minutosDeVigencia)} y sirve una sola vez.`,
      invitacion ? "Si no esperabas esta invitación, ignorá este correo." : "Si no lo pediste, ignorá este correo: tu contraseña sigue igual.",
    ],
  });
}
