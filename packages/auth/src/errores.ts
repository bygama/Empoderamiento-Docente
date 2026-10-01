/**
 * Los códigos de error propios que contesta la API de la sesión, para que el
 * formulario que los recibe los reconozca sin comparar mensajes. Viven aparte
 * porque los lee el navegador, que no puede cargar la config del servidor.
 */

/** Se pidió un código del segundo factor y el correo no salió: la pantalla lo dice en vez de fingir. */
export const CODIGO_NO_SALIO = "CODIGO_NO_SALIO";

/** Apagar el segundo factor de un rol que lo tiene obligatorio. */
export const SEGUNDO_FACTOR_OBLIGATORIO = "SEGUNDO_FACTOR_OBLIGATORIO";

/** La contraseña dio bien, pero la cuenta está suspendida y no abre sesión. */
export const CUENTA_SUSPENDIDA = "CUENTA_SUSPENDIDA";

/**
 * La contraseña que se quiso elegir aparece en filtraciones de otros sitios
 * (filtradas.ts). Es el mismo código que usa el plugin haveIBeenPwned de
 * better-auth, por si algún día se vuelve a él.
 */
export const CONTRASENA_FILTRADA = "PASSWORD_COMPROMISED";

/** No se pudo preguntar si la contraseña está filtrada: no se guardó, y hay que probar de nuevo. */
export const CONTRASENA_SIN_REVISAR = "CONTRASENA_SIN_REVISAR";
