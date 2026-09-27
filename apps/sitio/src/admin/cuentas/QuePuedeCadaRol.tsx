import { QUE_PUEDE, ROLES } from "@ed/auth";
import { Desplegable } from "@/admin/armazon/Lista";
import { TablaDePermisos } from "./TablaDePermisos";

/**
 * «Qué puede cada rol», arriba de Personas (SPEC de work/cuentas §4.1): la
 * frase de cada rol a la vista y la tabla entera plegada, porque se consulta
 * una vez y después estorba. Las dos cosas salen de `permisos.ts`.
 */
export function QuePuedeCadaRol() {
  return (
    <section aria-labelledby="que-puede-cada-rol" className="space-y-4">
      <h2 id="que-puede-cada-rol" className="font-display text-admin-seccion font-bold">
        Qué puede cada rol
      </h2>
      <dl className="space-y-3">
        {ROLES.map((rol) => (
          <div key={rol} className="sm:flex sm:gap-8">
            <dt className="font-medium capitalize sm:w-32 sm:shrink-0">{rol}</dt>
            <dd className="max-w-prose text-admin-meta text-gris-texto">{QUE_PUEDE[rol]}</dd>
          </div>
        ))}
      </dl>
      <Desplegable resumen="Ver qué puede cada rol, capacidad por capacidad">
        <div className="pt-3">
          <TablaDePermisos />
        </div>
      </Desplegable>
    </section>
  );
}
