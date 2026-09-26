import { siteConfig } from "@/config/site";
import { armarCorreo, type Contenido } from "./plantilla";

// En hora universal y dicho así, como el panel de métricas: quien lee puede
// estar en Chile, en México o en Argentina, y el servidor no sabe dónde.
const dia = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const hora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });

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
      `La contraseña de tu cuenta en el admin del sitio de ${siteConfig.name} cambió el ${dia.format(cuando)} a las ${hora.format(cuando)}, hora universal.`,
      "Cerramos todas las sesiones que estaban abiertas con tu cuenta: para volver a entrar hace falta la contraseña nueva.",
    ],
    despues: [
      "Si fuiste vos, no tenés que hacer nada.",
      `Si no fuiste vos, elegí otra ya mismo desde ${olvideMiContrasena} y avisale a quien administra el sitio.`,
    ],
  });
}
