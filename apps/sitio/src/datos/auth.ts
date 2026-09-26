import { crearAuth } from "@ed/auth/servidor";
import { registrarActividad } from "./actividad";
import { almacenDeBloqueos } from "./bloqueos-de-acceso";
import { base } from "./cliente";
import { elegiTuContrasena } from "@/correos/elegi-tu-contrasena";
import { mandarCorreo } from "@/correos/mandar";
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
  mandarResetDeContrasena: ({ para, nombre, enlace, minutosDeVigencia }) =>
    mandarCorreo({ para, contenido: elegiTuContrasena({ nombre, enlace, minutosDeVigencia }) }),
  avisarCambioDeContrasena: ({ para, nombre, cuando }) =>
    mandarCorreo({ para, contenido: tuContrasenaCambio({ nombre, cuando, olvideMiContrasena: `${url}/admin/olvide-mi-contrasena` }) }),
});
