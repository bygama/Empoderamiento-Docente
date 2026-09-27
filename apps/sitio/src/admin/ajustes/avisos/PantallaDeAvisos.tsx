import { quienPuede } from "@ed/auth";
import { Apartado } from "@/admin/armazon/Apartado";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { AVISOS } from "@/config/avisos";
import type { AvisoConCuentas } from "@/datos/avisos";
import { VOLVER_A_AJUSTES } from "../pantallas";
import { QuienRecibe } from "./QuienRecibe";

/**
 * Ajustes › Avisos (work/ajustes/SPEC.md §2.4): un apartado por aviso del
 * registro (`config/avisos.ts`), con las cuentas que lo pueden recibir. Es la
 * misma preferencia que cada persona elige en Mi cuenta › Avisos, vista desde
 * las cuentas. Un aviso nuevo del registro aparece acá solo.
 */
export function PantallaDeAvisos({ avisos }: { avisos: readonly AvisoConCuentas[] }) {
  return (
    <>
      <Encabezado
        volver={VOLVER_A_AJUSTES}
        titulo="Avisos"
        detalle="Quién recibe un correo con cada cosa nueva. Es lo mismo que cada persona elige en Mi cuenta › Avisos."
      />
      <div>
        {avisos.map(({ aviso, cuentas }) => {
          const { nombre, cada, capacidad } = AVISOS[aviso];
          return (
            <Apartado
              key={aviso}
              id={aviso}
              titulo={nombre}
              descripcion={`Lo pueden recibir las cuentas de ${quienPuede(capacidad)}. El correo no trae lo que escribieron: se lee en el admin.`}
            >
              <QuienRecibe aviso={aviso} nombre={nombre} cada={cada} cuentas={cuentas} />
            </Apartado>
          );
        })}
      </div>
    </>
  );
}
