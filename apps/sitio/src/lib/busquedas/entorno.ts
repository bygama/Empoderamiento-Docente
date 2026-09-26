import { crearClienteDeBusquedas, type ClienteDeBusquedas } from "./search-console";

// La cuenta de servicio solo lee Search Console, pero su clave es un secreto:
// solo del lado del servidor, nunca con NEXT_PUBLIC_ (README, «Variables de
// entorno»).

/**
 * Lo que dice una corrida sin las variables. Una sola frase, compartida: la
 * pantalla la reconoce para no mostrar como error el fallo de antes de conectar.
 */
export const SIN_CONEXION = "Search Console no está conectado: faltan las variables (README).";

export function hayVariablesDeBusquedas(): boolean {
  return Boolean(process.env.SEARCH_CONSOLE_CLIENT_EMAIL && process.env.SEARCH_CONSOLE_PRIVATE_KEY && process.env.SEARCH_CONSOLE_SITE_URL);
}

export function clienteDeBusquedasDesdeEntorno(): ClienteDeBusquedas | null {
  if (!hayVariablesDeBusquedas()) return null;
  return crearClienteDeBusquedas({
    correo: process.env.SEARCH_CONSOLE_CLIENT_EMAIL!,
    clave: process.env.SEARCH_CONSOLE_PRIVATE_KEY!,
    propiedad: process.env.SEARCH_CONSOLE_SITE_URL!,
  });
}
