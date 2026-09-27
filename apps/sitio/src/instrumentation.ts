import { urlDesviada } from "@/lib/correo/resend";

/**
 * Lo que corre una vez, al arrancar el servidor. Hoy, un solo aviso: si los
 * correos no van a Resend (`RESEND_API_URL`, solo para la prueba local de la
 * imagen de producción), que se lea en el log desde el primer segundo, y no
 * recién cuando alguien no recibe su código.
 */
export function register(): void {
  const url = urlDesviada(process.env.RESEND_API_URL);
  if (url) console.warn(`[correo] Los correos van a ${url}, no a Resend: RESEND_API_URL es solo para la prueba local (compose.prueba.yaml).`);
}
