"use client";

import { ListaVariable, TextoCorto, type Cambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { RamaEnElFormulario } from "../formulario";
import { ramaVacia } from "../vacios";

type Props = {
  /** El camino de la lista en el esquema: `recorrido.etapas.2.ramas`. */
  camino: string;
  ramas: readonly RamaEnElFormulario[];
  alCambiar: (cambio: Cambio<RamaEnElFormulario[]>) => void;
  errores: Readonly<Record<string, string>>;
};

/** Las estancias de una etapa en «Ficha»: al costado del panel, cada una con su lugar, su período y qué hizo ahí. */
export function RamasDeLaEtapa({ camino, ramas, alCambiar, errores }: Props) {
  return (
    <ListaVariable<RamaEnElFormulario>
      nombre={camino}
      etiqueta="Estancias"
      etiquetaItem="Estancia"
      maximo={TOPES.ramas}
      vacia="Sin estancias, el panel va solo."
      valor={ramas}
      alCambiar={alCambiar}
      itemVacio={ramaVacia}
      claveDe={(r) => r.clave}
      resumenDe={(r) => r.lugar.trim()}
      porItem={(i, r, cambiar) => (
        <div className="space-y-5">
          <div className="@container">
            <div className="grid items-start gap-5 @xl:grid-cols-2">
              <TextoCorto nombre={`${camino}.${i}.lugar`} etiqueta="Lugar" ayuda="El país o la institución." maximo={TOPES.lugarDeRama} valor={r.lugar} alCambiar={(lugar) => cambiar((a) => ({ ...a, lugar }))} error={errorDe(errores, `${camino}.${i}.lugar`)} />
              <TextoCorto nombre={`${camino}.${i}.periodo`} etiqueta="Período" ayuda="Opcional." maximo={TOPES.periodoDeRama} valor={r.periodo} alCambiar={(periodo) => cambiar((a) => ({ ...a, periodo }))} error={errorDe(errores, `${camino}.${i}.periodo`)} />
            </div>
          </div>
          <TextoCorto nombre={`${camino}.${i}.detalle`} etiqueta="Qué hizo ahí" maximo={TOPES.detalleDeRama} valor={r.detalle} alCambiar={(detalle) => cambiar((a) => ({ ...a, detalle }))} error={errorDe(errores, `${camino}.${i}.detalle`)} />
        </div>
      )}
    />
  );
}
