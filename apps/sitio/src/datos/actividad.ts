import { z } from "zod";
import { base } from "./cliente";

/**
 * La actividad del admin: quién hizo qué, sobre qué y cuándo (tabla
 * `actividad`). **La única puerta para escribirla.**
 *
 * No es una Server Action ni vive en `datos/acciones/`, a propósito: si lo
 * fuera, el navegador podría llamarla y anotar lo que quisiera. La llaman las
 * acciones, después de hacer lo suyo, y los ganchos de la sesión
 * (`datos/auth.ts`).
 */

/**
 * Lo que se registra, cerrado: cada módulo suma acá los suyos. Un verbo en
 * pasado sobre quien lo hizo («Ana entró», «Ana cambió su nombre»). De un CV
 * se registra solo que se borró, sin `sobre`.
 */
export const TIPOS_DE_ACTIVIDAD = [
  "entro",
  "salio",
  "cambio-su-contrasena",
  "cambio-su-nombre",
  // Las páginas (work/paginas-inicio/): sobre la página, con su slug.
  "publico-una-pagina",
  "descarto-un-borrador",
  "restauro-una-version",
  // Mensajes (work/mensajes/): de Contacto, con el tema en `sobre`, nunca el
  // nombre ni el texto de quien escribió; de un CV, solo que se borró.
  "tomo-un-mensaje",
  "cerro-un-mensaje",
  "marco-un-mensaje-como-spam",
  "borro-un-mensaje",
  "borro-un-cv",
] as const;
export type TipoDeActividad = (typeof TIPOS_DE_ACTIVIDAD)[number];

const esquema = z.object({
  tipo: z.enum(TIPOS_DE_ACTIVIDAD),
  /** El id de la cuenta que lo hizo. */
  quien: z.string().min(1),
  /** Sobre qué, en llano y como es ahora: «Inicio», «Ana Pérez». */
  sobre: z.string().trim().min(1).max(200).optional(),
  /** El id o el slug de eso, para linkearlo. */
  sobreId: z.string().min(1).max(200).optional(),
});

export type Actividad = z.input<typeof esquema>;

/**
 * Anota algo hecho en el admin. **Nunca frena lo que se registra**: si lo que
 * llega no es válido o la base no contesta, queda en el log y la acción sigue.
 * Perder una fila de la historia es malo; que no se pueda salir del admin
 * porque la tabla no contestó, peor.
 */
export async function registrarActividad(actividad: Actividad): Promise<void> {
  const valida = esquema.safeParse(actividad);
  if (!valida.success) {
    console.error("registrarActividad: no se registró, no es válida:", z.prettifyError(valida.error));
    return;
  }
  const { tipo, quien, sobre, sobreId } = valida.data;
  try {
    await base.actividad.create({ data: { tipo, cuentaId: quien, sobre, sobreId } });
  } catch (e) {
    console.error(`registrarActividad: la base no guardó «${tipo}»:`, e instanceof Error ? e.message : e);
  }
}
