import { PUEDE, QUE_PERMITE, ROLES, puede, type Capacidad } from "@ed/auth";
import { Check } from "@/components/ui/icons";

const CAPACIDADES = Object.keys(PUEDE) as Capacidad[];

/**
 * Qué puede cada rol, capacidad por capacidad: la tabla de permisos
 * (DESIGN.md §11, «Tabla»). **Se arma recorriendo `PUEDE` y `QUE_PERMITE`**
 * de `permisos.ts`, así que no se puede desfasar de lo que el servidor
 * verifica. El ✓ se lee «Sí» y la raya, «No».
 */
export function TablaDePermisos() {
  return (
    <div className="overflow-x-auto rounded-xl border border-azul-claro/60">
      <table className="w-full min-w-lg text-left text-admin-meta">
        <caption className="sr-only">Qué puede cada rol, capacidad por capacidad</caption>
        <thead>
          <tr className="border-b border-azul-claro/60">
            <th scope="col" className="px-4 py-3 font-medium">
              Puede
            </th>
            {ROLES.map((rol) => (
              <th key={rol} scope="col" className="w-28 px-4 py-3 text-center font-medium capitalize">
                {rol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-azul-claro/60">
          {CAPACIDADES.map((capacidad) => (
            <tr key={capacidad}>
              <th scope="row" className="px-4 py-3 font-normal">
                {QUE_PERMITE[capacidad]}
              </th>
              {ROLES.map((rol) => (
                <td key={rol} className="px-4 py-3 text-center">
                  {puede(rol, capacidad) ? (
                    <>
                      <Check size={16} aria-hidden="true" className="inline-block" />
                      <span className="sr-only">Sí</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="text-gris-texto">
                        —
                      </span>
                      <span className="sr-only">No</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
