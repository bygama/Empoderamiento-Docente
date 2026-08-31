// Forma de una consulta del formulario de contacto.
//
// Vive acá, y no dentro del endpoint, porque lo usan los dos lados: el
// componente valida antes de disparar el fetch (para no hacer viajar
// basura) y el endpoint vuelve a validar al recibir (porque cualquiera
// puede postear a mano, sin pasar por el formulario). Misma fuente de
// verdad, cero chance de que se desincronicen.

import { z } from "zod";

export const contactoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Contanos cómo te llamás.")
    .max(120, "El nombre es demasiado largo."),

  email: z
    .email("Revisá el correo, parece que le falta algo.")
    .max(200, "El correo es demasiado largo."),

  // Institución y país son opcionales: mucha gente escribe a título
  // personal y frenar el envío por eso sería perder la consulta.
  institucion: z.string().trim().max(160, "Nombre demasiado largo.").optional(),
  pais: z.string().trim().max(80).optional(),

  mensaje: z
    .string()
    .trim()
    .min(10, "Escribinos un poco más para poder ayudarte.")
    .max(4000, "El mensaje es muy largo. Contanos lo esencial y seguimos por correo."),

  // El tema que la persona eligió en la pantalla anterior. Viaja para que
  // el asunto del correo llegue ya clasificado a la casilla de ED.
  tema: z.string().trim().max(120).optional(),

  // Trampa para bots (honeypot). El campo va oculto por CSS, así que una
  // persona real nunca lo llena; un bot que completa todo lo que encuentra,
  // sí.
  //
  // Ojo con "arreglar" esto poniéndole .max(0): el schema tiene que dejarlo
  // pasar con cualquier valor a propósito. Si la validación lo rechazara acá,
  // la respuesta de error le diría al bot exactamente qué campo lo delató y
  // le alcanzaría con dejar de completarlo. Quien decide qué hacer es el
  // endpoint, y lo hace en silencio.
  website: z.string().max(200).optional(),
});

export type ContactoInput = z.infer<typeof contactoSchema>;
