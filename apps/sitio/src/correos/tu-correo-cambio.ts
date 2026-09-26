import { siteConfig } from "@/config/site";
import { armarCorreo, enHoraUniversal, type Contenido } from "./plantilla";

/**
 * «El correo de tu cuenta del admin cambió»: sale a la dirección vieja y a la
 * nueva cuando alguien lo cambia desde Cuentas (DECISIONS de work/cuentas).
 * La vieja es la que se entera si no lo pidió la persona dueña de la cuenta;
 * la nueva, que desde ahora entra con ella.
 */
export function tuCorreoCambio({
  nombre,
  anterior,
  nuevo,
  cuando,
}: {
  nombre?: string;
  anterior: string;
  nuevo: string;
  cuando: Date;
}): Contenido {
  return armarCorreo({
    asunto: "El correo de tu cuenta del admin cambió",
    nombre,
    antes: [
      `El correo de tu cuenta en el admin del sitio de ${siteConfig.name} cambió ${enHoraUniversal(cuando)}: era ${anterior} y ahora es ${nuevo}.`,
      `Cerramos las sesiones que estaban abiertas con tu cuenta: para volver a entrar, usá ${nuevo}.`,
    ],
    despues: ["Si lo pediste, no tenés que hacer nada.", "Si no lo pediste, avisale ya mismo a quien administra el sitio."],
  });
}
