import { siteConfig } from "@/config/site";
import { armarCorreo, enHoraUniversal, type Contenido } from "./plantilla";

/**
 * «Tu contraseña cambió»: el aviso que sale cada vez que alguien elige una
 * contraseña nueva. Si no fue la persona dueña de la cuenta, este correo es
 * cómo se entera, así que dice qué hacer.
 */
export function tuContrasenaCambio({
  nombre,
  cuando,
  olvideMiContrasena,
}: {
  nombre?: string;
  cuando: Date;
  olvideMiContrasena: string;
}): Contenido {
  return armarCorreo({
    asunto: "Tu contraseña cambió",
    nombre,
    antes: [
      `La contraseña de tu cuenta en el admin del sitio de ${siteConfig.name} cambió ${enHoraUniversal(cuando)}.`,
      "Cerramos todas las sesiones que estaban abiertas con tu cuenta: para volver a entrar hace falta la contraseña nueva.",
    ],
    despues: [
      "Si fuiste vos, no tenés que hacer nada.",
      `Si no fuiste vos, elegí otra ya mismo desde ${olvideMiContrasena} y avisale a quien administra el sitio.`,
    ],
  });
}
