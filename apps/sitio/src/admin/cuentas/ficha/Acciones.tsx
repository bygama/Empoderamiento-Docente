import { esUnaSola, type LoQueSePuede } from "@ed/auth";
import { cancelarInvitacion, reenviarInvitacion } from "@/datos/acciones/invitaciones";
import { borrarCuenta, reactivar, suspender } from "@/datos/acciones/estado-de-cuentas";
import type { FichaDeCuenta } from "@/datos/consultas/cuentas";
import { CUENTAS } from "../pantallas";
import { BotonDeAccion } from "./BotonDeAccion";

type Props = { cuenta: FichaDeCuenta & { rol: NonNullable<FichaDeCuenta["rol"]> }; se: LoQueSePuede };

/**
 * Suspender o reactivar, y borrar si nunca hizo nada. Suspender y reactivar
 * comparten `key`: son el mismo botón que cambia, y su aviso sobrevive al
 * redibujo. No preguntan: se deshacen una con la otra. Borrar sí, porque no
 * vuelve. Si no se puede nada, se dice por qué.
 */
export function AccionesDeEstado({ cuenta, se }: Props) {
  if (!se.suspender && !se.reactivar && !se.borrar) {
    return (
      <p className="max-w-prose text-admin-meta text-gris-texto">
        {esUnaSola(cuenta.rol)
          ? "La cuenta de quien dirige no se suspende ni se borra: se pasa la dirección."
          : "Tu propia cuenta no se suspende ni se borra desde acá."}
      </p>
    );
  }
  return (
    <div className="space-y-6">
      {se.suspender ? (
        <BotonDeAccion
          key="estado"
          accion={suspender}
          idDeCuenta={cuenta.id}
          texto="Suspender"
          enCurso="Suspendiendo…"
        />
      ) : null}
      {se.reactivar ? <BotonDeAccion key="estado" accion={reactivar} idDeCuenta={cuenta.id} texto="Reactivar" enCurso="Reactivando…" /> : null}
      {/* Se ofrece solo si no hizo nada; igual lo decide la base (la clave foránea de la actividad). */}
      {se.borrar && !cuenta.tieneActividad ? (
        <BotonDeAccion
          accion={borrarCuenta}
          idDeCuenta={cuenta.id}
          texto="Borrar la cuenta"
          enCurso="Borrando…"
          variante="destructivo"
          confirmar={{ pregunta: `¿Borrar la cuenta de ${cuenta.nombre}? No se puede deshacer.`, boton: "Sí, borrar" }}
          irA={CUENTAS.href}
        />
      ) : null}
    </div>
  );
}

/** Reenviar la invitación o cancelarla, que borra la cuenta que nunca entró. */
export function AccionesDeInvitacion({ cuenta, se }: Props) {
  return (
    <div className="space-y-6">
      {se.reenviarLaInvitacion ? (
        <BotonDeAccion
          accion={reenviarInvitacion}
          idDeCuenta={cuenta.id}
          texto={cuenta.invitacionVence ? "Reenviar la invitación" : "Mandar la invitación"}
          enCurso="Mandando…"
        />
      ) : null}
      {se.cancelarLaInvitacion ? (
        <BotonDeAccion
          accion={cancelarInvitacion}
          idDeCuenta={cuenta.id}
          texto="Cancelar la invitación"
          enCurso="Cancelando…"
          variante="destructivo"
          confirmar={{ pregunta: `¿Cancelar la invitación de ${cuenta.nombre}? Se borra su cuenta y el enlace deja de servir.`, boton: "Sí, cancelarla" }}
          irA={CUENTAS.href}
        />
      ) : null}
    </div>
  );
}
