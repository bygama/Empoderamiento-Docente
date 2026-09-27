"use client";

import { Casilla, ListaVariable, TextoCorto, type Cambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { HitoEnElFormulario } from "../formulario";
import { hitoVacio } from "../vacios";

type Props = {
  /** El camino de la lista en el esquema: `recorrido.etapas.2.hitos`. */
  camino: string;
  hitos: readonly HitoEnElFormulario[];
  alCambiar: (cambio: Cambio<HitoEnElFormulario[]>) => void;
  /** En «Hitos» y «Síntesis», uno o dos se destacan como principales. */
  conPrincipal: boolean;
  errores: Readonly<Record<string, string>>;
};

/** Los hitos de una etapa: un cargo, una tesis, un título. Cada uno con su período, su título y un detalle. */
export function HitosDeLaEtapa({ camino, hitos, alCambiar, conPrincipal, errores }: Props) {
  return (
    <ListaVariable<HitoEnElFormulario>
      nombre={camino}
      etiqueta="Hitos"
      etiquetaItem="Hito"
      maximo={TOPES.hitos}
      ayuda={conPrincipal ? "Marcá como principales uno o dos: van con aire; el resto, en renglones." : undefined}
      vacia="Sin hitos, la etapa es su título y su texto."
      valor={hitos}
      alCambiar={alCambiar}
      itemVacio={hitoVacio}
      claveDe={(h) => h.clave}
      resumenDe={(h) => h.titulo.trim()}
      porItem={(i, h, cambiar) => (
        <div className="space-y-5">
          <div className="@container">
            <div className="grid items-start gap-5 @xl:grid-cols-[12rem_minmax(0,1fr)]">
              <TextoCorto nombre={`${camino}.${i}.periodo`} etiqueta="Período" ayuda="Opcional: «2012 – 2016»." maximo={TOPES.periodo} valor={h.periodo} alCambiar={(periodo) => cambiar((a) => ({ ...a, periodo }))} error={errorDe(errores, `${camino}.${i}.periodo`)} />
              <TextoCorto nombre={`${camino}.${i}.titulo`} etiqueta="Título" maximo={TOPES.tituloDeHito} valor={h.titulo} alCambiar={(titulo) => cambiar((a) => ({ ...a, titulo }))} error={errorDe(errores, `${camino}.${i}.titulo`)} />
            </div>
          </div>
          <TextoCorto nombre={`${camino}.${i}.detalle`} etiqueta="Detalle" ayuda="Opcional: dónde, o una aclaración." maximo={TOPES.detalleDeHito} valor={h.detalle} alCambiar={(detalle) => cambiar((a) => ({ ...a, detalle }))} error={errorDe(errores, `${camino}.${i}.detalle`)} />
          {conPrincipal ? (
            <Casilla nombre={`${camino}.${i}.principal`} etiqueta="Principal" ayuda="Se destaca por sobre los demás." valor={h.principal} alCambiar={(principal) => cambiar((a) => ({ ...a, principal }))} error={errorDe(errores, `${camino}.${i}.principal`)} />
          ) : null}
        </div>
      )}
    />
  );
}
