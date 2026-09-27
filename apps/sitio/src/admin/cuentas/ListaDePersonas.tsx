import { BotonEnlace } from "@ed/kit-admin";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { CuentaEnLista } from "@/datos/consultas/cuentas";
import { EstadoDeLaCuenta } from "./EstadoDeLaCuenta";

/**
 * Las personas con cuenta (SPEC de work/cuentas §4.1): nombre y rol, correo y
 * último acceso, la insignia del estado y el link a su cuenta. Nunca está
 * vacía: quien mira es una fila.
 */
export function ListaDePersonas({ cuentas, idPropia }: { cuentas: CuentaEnLista[]; idPropia: string }) {
  return (
    <section aria-labelledby="personas" className="space-y-4">
      <h2 id="personas" className="font-display text-admin-seccion font-bold">
        Personas
      </h2>
      <Lista>
        {cuentas.map((c) => (
          <Fila
            key={c.id}
            principal={
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span>{c.nombre}</span>
                <span className="text-admin-meta font-normal text-gris-texto">{c.rol ?? "sin rol"}</span>
                {c.id === idPropia ? <span className="text-admin-meta font-normal text-gris-texto">(tu cuenta)</span> : null}
              </span>
            }
            detalle={
              <span className="flex flex-wrap gap-x-3">
                <span className="break-all">{c.correo}</span>
                <span>
                  {c.ultimoAcceso ? (
                    <>
                      Entró <Momento iso={c.ultimoAcceso} relativo />
                    </>
                  ) : (
                    "Nunca entró"
                  )}
                </span>
              </span>
            }
            insignias={<EstadoDeLaCuenta estado={c.estado} invitacionVencida={c.invitacionVencida} />}
            accion={
              <BotonEnlace variante="secundario" href={`/admin/cuentas/${c.id}`} aria-label={`Ver la cuenta de ${c.nombre}`}>
                Ver
              </BotonEnlace>
            }
          />
        ))}
      </Lista>
    </section>
  );
}
