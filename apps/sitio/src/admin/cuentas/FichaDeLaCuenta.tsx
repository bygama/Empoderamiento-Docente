import { ROL_AL_DEJAR_LA_DIRECCION } from "@ed/auth";
import { Aviso } from "@/admin/armazon/Campos";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Momento } from "@/admin/armazon/Momento";
import { EstadoDeLaCuenta } from "./EstadoDeLaCuenta";
import {
  ApartadoDeDatos,
  ApartadoDeLaDireccion,
  ApartadoDeSesiones,
  ApartadoDelEstado,
  ApartadoDelRol,
  ApartadoDelSegundoFactor,
  type DeLaFicha,
} from "./ficha/Apartados";
import { VOLVER_A_CUENTAS } from "./pantallas";

type Props = DeLaFicha & {
  correoPropio: string;
  /** Lo que dejó Invitar al llegar acá. */
  aviso: React.ReactNode;
};

/**
 * Una cuenta (SPEC de work/cuentas §4.3): «← Cuentas», sus datos y un
 * apartado por cosa que se le puede hacer (ficha/Apartados.tsx), cada uno
 * solo si `queSePuede` lo deja o si hay algo que mostrar. Sin primario: los
 * apartados son independientes, como en Mi cuenta.
 */
export function FichaDeLaCuenta({ cuenta, se, esLaPropia, correoPropio, aviso }: Props) {
  const deLaFicha = { cuenta, se, esLaPropia };
  return (
    <>
      <Encabezado
        volver={VOLVER_A_CUENTAS}
        titulo={cuenta.nombre}
        estado={<EstadoDeLaCuenta estado={cuenta.estado} invitacionVencida={cuenta.invitacionVencida} />}
        detalle={
          <>
            <span className="break-all">{cuenta.correo}</span>
            <span>{cuenta.ultimoAcceso ? <>Entró <Momento iso={cuenta.ultimoAcceso} relativo /></> : "Nunca entró"}</span>
          </>
        }
        avisos={aviso}
      />
      <div>
        <ApartadoDeDatos {...deLaFicha} />
        <ApartadoDelRol {...deLaFicha} />
        <ApartadoDelEstado {...deLaFicha} />
        <ApartadoDelSegundoFactor {...deLaFicha} />
        <ApartadoDeSesiones {...deLaFicha} />
        <ApartadoDeLaDireccion {...deLaFicha} correoPropio={correoPropio} />
      </div>
    </>
  );
}

/** El aviso de haberle pasado la dirección: el apartado que la pasó ya no está. */
export function AvisoDeDireccion({ nombre }: { nombre: string }) {
  return (
    <Aviso tono="bien">
      Listo: ahora dirige {nombre}, y vos pasaste a {ROL_AL_DEJAR_LA_DIRECCION}.
    </Aviso>
  );
}

/** El aviso que deja Invitar al llevar a la cuenta nueva, según si el correo salió. */
export function AvisoDeInvitacion({ salio, correo, vence }: { salio: boolean; correo: string; vence: string | null }) {
  return salio ? (
    <Aviso tono="bien">
      Le mandamos la invitación a {correo}.{" "}
      {vence ? (
        <>
          Vence el <Momento iso={vence} />.
        </>
      ) : null}
    </Aviso>
  ) : (
    <Aviso tono="error">La cuenta quedó creada, pero la invitación no salió: el envío de correos no está andando. Reenviala cuando ande.</Aviso>
  );
}
