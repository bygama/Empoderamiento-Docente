import { z } from "zod";

/**
 * Lo que llega de un formulario del admin y se valida igual en más de una
 * acción: un nombre, un correo, el id de una cuenta. Acá y no en cada archivo
 * de acciones, que solo pueden exportar funciones.
 */

export const esquemaDelNombre = z
  .string()
  .transform((nombre) => nombre.replace(/\s+/g, " ").trim())
  .pipe(z.string().min(1, "Falta el nombre.").max(80, "El nombre puede tener hasta 80 caracteres."));

// better-auth guarda los correos en minúscula: se comparan igual.
export const esquemaDelCorreo = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Ese correo no parece un correo.").max(254, "Ese correo es demasiado largo."));

export const esquemaDelId = z.string().min(1).max(100);
