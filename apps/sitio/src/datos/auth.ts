import { crearAuth } from "@ed/auth/servidor";
import { registrarActividad } from "./actividad";
import { almacenDeBloqueos } from "./bloqueos-de-acceso";
import { base } from "./cliente";
import { elegiTuContrasena } from "@/correos/elegi-tu-contrasena";
import { mandarCorreo } from "@/correos/mandar";
import { tuCodigo } from "@/correos/tu-codigo";
import { tuContrasenaCambio } from "@/correos/tu-contrasena-cambio";
import { segundoPlano } from "@/lib/segundo-plano";
import { urlDelSitio } from "@/lib/url-del-sitio";

/**
 * La sesión del admin, ya armada con la base de esta app.
 *
 * `@ed/auth` trae la configuración —qué se permite, cuánto dura, qué campos
 * tiene una cuenta— y nada de ED. Lo de ED se junta acá: el cliente de Prisma,
 * la URL del sitio, cómo sale un correo y dónde se anota entrar, salir y
 * cambiar la contraseña (la tabla `actividad`).
 */

const url = urlDelSitio();

export const auth = crearAuth({
  base,
  secreto: process.env.BETTER_AUTH_SECRET ?? "",
  urlDelSitio: url,
  bloqueos: almacenDeBloqueos,
  registrar: ({ tipo, idDeCuenta }) => registrarActividad({ tipo, quien: idDeCuenta }),
  segundoPlano,
  mandarResetDeContrasena: async ({ para, nombre, enlace, minutosDeVigencia }) => {
    await mandarCorreo({ para, contenido: elegiTuContrasena({ nombre, enlace, minutosDeVigencia }) });
  },
  avisarCambioDeContrasena: async ({ para, nombre, cuando }) => {
    await mandarCorreo({ para, contenido: tuContrasenaCambio({ nombre, cuando, olvideMiContrasena: `${url}/admin/olvide-mi-contrasena` }) });
  },
  // El único correo que se espera: si no salió, la pantalla del código lo
  // dice en vez de fingir (DECISIONS de work/cuentas). Un error de Resend ya
  // rechaza; sin clave en producción, rechaza acá.
  mandarCodigo: async ({ para, nombre, codigo, minutosDeVigencia }) => {
    const contenido = tuCodigo({ nombre, codigo, minutosDeVigencia, olvideMiContrasena: `${url}/admin/olvide-mi-contrasena` });
    if ((await mandarCorreo({ para, contenido })) === "no-salio") throw new Error("El código no salió: falta RESEND_API_KEY.");
  },
});
