import Link from "next/link";
import { QUE_PUEDE, ROL_AL_DEJAR_LA_DIRECCION, segundoFactorObligatorio, type LoQueSePuede, type Rol } from "@ed/auth";
import { Apartado, Insignia } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import { ListaDeSesiones } from "@/admin/mi-cuenta/Sesiones";
import { cerrarSusSesiones } from "@/datos/acciones/cuentas";
import type { FichaDeCuenta } from "@/datos/consultas/cuentas";
import { AccionesDeEstado, AccionesDeInvitacion } from "./Acciones";
import { BotonDeAccion } from "./BotonDeAccion";
import { FormularioDeLaDireccion } from "./FormularioDeLaDireccion";
import { FormularioDelCorreo } from "./FormularioDelCorreo";
import { FormularioDelRol } from "./FormularioDelRol";

// Los apartados de la ficha de una cuenta (FichaDeLaCuenta.tsx), uno por
// cosa que se le puede hacer. Cada uno dice en su frase qué pasa si se toca.

export type DeLaFicha = { cuenta: FichaDeCuenta & { rol: Rol }; se: LoQueSePuede; esLaPropia: boolean };

export function ApartadoDeDatos({ cuenta, se, esLaPropia, correoPropio }: DeLaFicha & { correoPropio: string }) {
  return (
    <Apartado
      id="datos"
      titulo="Datos"
      descripcion="El correo es con el que entra y adonde le llega el código. Cambiarlo pide tu contraseña; se le cierran las sesiones y avisamos a las dos direcciones."
    >
      {esLaPropia ? (
        <p className="mb-4 max-w-prose text-admin-meta text-gris-texto">
          Es tu cuenta: tu nombre, tu contraseña y tus sesiones se cambian desde{" "}
          <Link href="/admin/mi-cuenta" className="rounded-sm text-azul-medio underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio">
            Mi cuenta
          </Link>
          .
        </p>
      ) : null}
      {se.cambiarElCorreo ? (
        <FormularioDelCorreo idDeCuenta={cuenta.id} correo={cuenta.correo} correoPropio={correoPropio} />
      ) : (
        <p className="break-all">{cuenta.correo}</p>
      )}
    </Apartado>
  );
}

export function ApartadoDelRol({ cuenta, se, correoPropio }: DeLaFicha & { correoPropio: string }) {
  return (
    <Apartado id="rol" titulo="Rol" descripcion="Qué puede hacer en el admin. Si el rol nuevo pide el segundo factor y no lo tenía, se le cierran las sesiones.">
      <p className="font-medium capitalize">{cuenta.rol}</p>
      <p className="mt-1 mb-4 max-w-prose text-admin-meta text-gris-texto">{QUE_PUEDE[cuenta.rol]}</p>
      {se.cambiarElRol ? <FormularioDelRol idDeCuenta={cuenta.id} rol={cuenta.rol} correoPropio={correoPropio} /> : null}
    </Apartado>
  );
}

/** Mientras está pendiente, su invitación; después, su estado. */
export function ApartadoDelEstado({ cuenta, se }: DeLaFicha) {
  if (cuenta.estado !== "pendiente") {
    return (
      <Apartado id="estado" titulo="Estado" descripcion="Suspendida ya no entra, pero su nombre queda en lo que hizo. Borrar se puede solo si nunca hizo nada.">
        <AccionesDeEstado cuenta={cuenta} se={se} />
      </Apartado>
    );
  }
  const vence = cuenta.invitacionVence;
  return (
    <Apartado id="invitacion" titulo="Invitación" descripcion="Todavía no eligió su contraseña. Reenviarla manda un enlace nuevo y el anterior deja de servir.">
      <p className="mb-4 text-admin-meta">
        {vence ? (
          <>
            {cuenta.invitacionVencida ? "Venció el " : "Vence el "}
            <Momento iso={vence} />.
          </>
        ) : (
          "Todavía no se le mandó ninguna invitación."
        )}
      </p>
      <AccionesDeInvitacion cuenta={cuenta} se={se} />
    </Apartado>
  );
}

export function ApartadoDelSegundoFactor({ cuenta }: DeLaFicha) {
  return (
    <Apartado id="segundo-factor" titulo="Segundo factor" descripcion="Un código por correo al entrar. Lo activa o lo desactiva cada persona en Mi cuenta.">
      {cuenta.segundoFactor ? <Insignia tono="normal">Activo</Insignia> : <Insignia tono="apagado">Apagado</Insignia>}
      {segundoFactorObligatorio(cuenta.rol) ? <p className="mt-2 text-admin-meta text-gris-texto">Es obligatorio para su rol.</p> : null}
    </Apartado>
  );
}

/** Solo si está activa: una pendiente nunca entró y una suspendida no tiene sesiones. */
export function ApartadoDeSesiones({ cuenta, se }: DeLaFicha) {
  if (cuenta.estado !== "activa") return null;
  return (
    <Apartado id="sesiones" titulo="Sesiones" descripcion="Dónde tiene el admin abierto. Al cerrarlas, para volver tiene que entrar de nuevo en todos lados.">
      {cuenta.sesiones.length ? (
        <div className="space-y-4">
          <ListaDeSesiones sesiones={cuenta.sesiones} />
          {se.cerrarSusSesiones ? (
            <BotonDeAccion
              accion={cerrarSusSesiones}
              idDeCuenta={cuenta.id}
              texto="Cerrar sus sesiones"
              enCurso="Cerrando…"
            />
          ) : null}
        </div>
      ) : (
        <p className="text-admin-meta text-gris-texto">No tiene el admin abierto en ningún lado.</p>
      )}
    </Apartado>
  );
}

export function ApartadoDeLaDireccion({ cuenta, se, correoPropio }: DeLaFicha & { correoPropio: string }) {
  if (!se.pasarleLaDireccion) return null;
  return (
    <Apartado
      id="direccion"
      titulo="La dirección"
      descripcion={`Quien dirige es una sola persona. Al pasársela, vos quedás con el rol ${ROL_AL_DEJAR_LA_DIRECCION}, y solo esa persona te la puede devolver.`}
    >
      <FormularioDeLaDireccion idDeCuenta={cuenta.id} nombre={cuenta.nombre} correoPropio={correoPropio} />
    </Apartado>
  );
}
