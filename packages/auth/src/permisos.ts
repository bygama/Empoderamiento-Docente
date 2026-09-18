/**
 * Quién puede qué. Dos roles y nada más.
 *
 * Los dos publican: no hay paso de aprobación, porque ED son tres personas y
 * una cola de revisión entre ellas sería ceremonia sin lector. Lo único que
 * distingue a quien administra es dar de alta y de baja cuentas.
 */

export const ROLES = ["administra", "edita"] as const;
export type Rol = (typeof ROLES)[number];

/** El rol que recibe una cuenta nueva si nadie dice otra cosa. */
export const ROL_POR_DEFECTO: Rol = "edita";

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}

/**
 * Las capacidades, nombradas. Se chequea contra esto y nunca contra el string
 * del rol: el día que aparezca un tercer rol, cambia este archivo y nada más.
 */
export const PUEDE = {
  /** Crear, editar, publicar y borrar contenido. */
  tocarContenido: (rol: Rol) => rol === "administra" || rol === "edita",
  /** Dar de alta y de baja cuentas, y cambiarles el rol. */
  tocarCuentas: (rol: Rol) => rol === "administra",
} as const;

/**
 * Qué le sale a quien no tiene permiso. Un mensaje, no un detalle: decir «esa
 * cuenta no existe» o «no sos administrador» le confirma cosas a quien está
 * probando.
 */
export const SIN_PERMISO = "No tenés permiso para hacer eso.";
