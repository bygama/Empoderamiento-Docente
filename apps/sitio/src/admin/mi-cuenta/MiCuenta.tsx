import { QUE_PUEDE, esRol, esUnaSola, quienPuede } from "@ed/auth";
import { Apartado } from "@/admin/armazon/Apartado";
import { Encabezado } from "@/admin/armazon/Encabezado";
import type { Bandeja } from "@/config/mensajes";
import type { SesionAbierta } from "@/datos/consultas/mi-cuenta";
import { FormularioDeAvisos } from "./FormularioDeAvisos";
import { FormularioDeLaContrasena } from "./FormularioDeLaContrasena";
import { FormularioDelNombre } from "./FormularioDelNombre";
import { Seguridad } from "./Seguridad";
import { Sesiones } from "./Sesiones";

type Props = {
  nombre: string;
  correo: string;
  rol: unknown;
  /** Si entra con código por correo. */
  segundoFactor: boolean;
  sesiones: SesionAbierta[];
  idDeEstaSesion: string;
  /** Un aviso por bandeja que su rol ve (`datos/avisos.ts`). */
  avisos: ReadonlyArray<{ bandeja: Bandeja; activo: boolean }>;
};

/**
 * Mi cuenta (SPEC de work/roles-y-actividad §5): lo que cada persona toca de
 * sí misma. Tres formularios que no dependen uno del otro, así que ninguno es
 * el primario de la pantalla: todos los botones son secundarios. Avisos
 * llegó con Mensajes y Seguridad, con el segundo factor.
 */
export function MiCuenta({ nombre, correo, rol, segundoFactor, sesiones, idDeEstaSesion, avisos }: Props) {
  // La cuenta de quien dirige no la toca nadie más: ni su rol ni su correo.
  const dirige = esRol(rol) && esUnaSola(rol);
  const quienLaCambia = dirige ? "La dirección no se cambia: se pasa a otra persona, desde Cuentas." : `Lo cambia ${quienPuede("usarCuentas")}, desde Cuentas.`;
  return (
    <>
      <Encabezado titulo="Mi cuenta" detalle="Tus datos, tu contraseña, dónde tenés el admin abierto y qué correos te llegan." />
      <div>
        <Apartado id="perfil" titulo="Perfil" descripcion="Tu nombre es el que figura en lo que publicás.">
          <div className="space-y-6">
            <FormularioDelNombre nombre={nombre} />
            <div>
              <p className="text-admin-meta font-medium">Correo</p>
              <p className="mt-1 break-all">{correo}</p>
              <p className="mt-1 text-admin-meta text-gris-texto">
                {dirige ? "Si cambió tu correo, se cambia desde Cuentas." : `Si cambió tu correo, pedíselo a ${quienPuede("usarCuentas")}.`}
              </p>
            </div>
          </div>
        </Apartado>
        <Apartado id="contrasena" titulo="Contraseña" descripcion="Al cambiarla se cierran tus otras sesiones y te llega un correo que lo avisa.">
          <FormularioDeLaContrasena correo={correo} />
        </Apartado>
        <Apartado id="rol" titulo="Tu rol" descripcion={quienLaCambia}>
          {esRol(rol) ? (
            <>
              <p className="font-medium capitalize">{rol}</p>
              <p className="mt-1 max-w-prose text-admin-meta text-gris-texto">{QUE_PUEDE[rol]}</p>
            </>
          ) : (
            <p className="text-admin-meta text-gris-texto">Tu cuenta no tiene un rol. Pedíselo a {quienPuede("usarCuentas")}.</p>
          )}
        </Apartado>
        <Apartado id="seguridad" titulo="Seguridad" descripcion="El segundo factor: además de la contraseña, un código que te llega por correo al entrar.">
          <Seguridad rol={rol} activo={segundoFactor} correo={correo} />
        </Apartado>
        <Apartado id="sesiones" titulo="Sesiones" descripcion="Dónde tenés el admin abierto. La ubicación es aproximada: sale de la conexión.">
          <Sesiones sesiones={sesiones} idDeEstaSesion={idDeEstaSesion} />
        </Apartado>
        {avisos.length ? (
          <Apartado
            id="avisos"
            titulo="Avisos"
            descripcion="Te llega un correo con cada mensaje nuevo de las bandejas que marques. No trae lo que escribieron: lo leés en el admin."
          >
            <FormularioDeAvisos avisos={avisos} />
          </Apartado>
        ) : null}
      </div>
    </>
  );
}
