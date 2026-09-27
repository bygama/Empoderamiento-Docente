"use client";

import { useRef } from "react";
import { Casilla, Parrafo, TextoCorto } from "@ed/kit-admin";
import { Bloque } from "@/admin/biblioteca/Bloque";
import { errorDe } from "@/admin/campos/errores";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { CambiarRecorrido, PropsDeBloque } from "./bloques";
import { CategoriasDelRecorrido } from "./CategoriasDelRecorrido";
import type { RecorridoEnElFormulario } from "./formulario";
import { recorridoVacioEnElFormulario } from "./vacios";

type Props = PropsDeBloque & { cambiarRecorrido: CambiarRecorrido };

/**
 * El recorrido de un perfil (SPEC §7.2 de `work/equipo/`): si lo tiene, y lo
 * que lo presenta —quién es, de dónde, el titular, la bajada, la formación y
 * las categorías—. Sacar la marca no borra nada hasta guardar: volver a
 * marcarla trae lo que había.
 */
export function BloqueDelRecorrido({ form, cambiar, errores, cambiarRecorrido }: Props) {
  // El último recorrido que hubo en pantalla: se lee solo en el clic de la casilla.
  const anterior = useRef<RecorridoEnElFormulario | null>(form.recorrido);
  const r = form.recorrido;
  const error = (camino: string) => errorDe(errores, `recorrido.${camino}`);
  const alMarcar = (tiene: boolean) => {
    if (!tiene) anterior.current = form.recorrido;
    cambiar("recorrido", tiene ? (anterior.current ?? recorridoVacioEnElFormulario()) : null);
  };
  return (
    <Bloque id="bloque-recorrido" titulo="El recorrido">
      <Casilla
        nombre="recorrido"
        etiqueta="Tiene recorrido"
        ayuda="Con recorrido, su tarjeta abre la historia en etapas. Sin él, el perfil básico: la foto, el nombre, el rol y el país."
        valor={r !== null}
        alCambiar={alMarcar}
        error={r === null ? errorDe(errores, "recorrido") : undefined}
      />
      {r ? (
        <>
          <div className="@container">
            <div className="grid items-start gap-5 @xl:grid-cols-2">
              <TextoCorto nombre="recorrido.nombreCompleto" etiqueta="Nombre completo" ayuda="El de la tarjeta puede ser corto; este va entero." maximo={TOPES.nombreCompleto} valor={r.nombreCompleto} alCambiar={(v) => cambiarRecorrido("nombreCompleto", v)} error={error("nombreCompleto")} />
              <TextoCorto nombre="recorrido.rolCompleto" etiqueta="Rol completo" maximo={TOPES.rolCompleto} valor={r.rolCompleto} alCambiar={(v) => cambiarRecorrido("rolCompleto", v)} error={error("rolCompleto")} />
              <TextoCorto nombre="recorrido.lugar" etiqueta="Dónde vive" ayuda="La ciudad y el país." maximo={TOPES.lugar} valor={r.lugar} alCambiar={(v) => cambiarRecorrido("lugar", v)} error={error("lugar")} />
              <TextoCorto nombre="recorrido.origen" etiqueta="De dónde es" ayuda="Solo si es otro lugar." maximo={TOPES.lugar} valor={r.origen} alCambiar={(v) => cambiarRecorrido("origen", v)} error={error("origen")} />
            </div>
          </div>
          <TextoCorto nombre="recorrido.titular" etiqueta="Titular" ayuda="La frase grande que abre el recorrido. Cada punto la parte en un renglón." maximo={TOPES.titular} valor={r.titular} alCambiar={(v) => cambiarRecorrido("titular", v)} error={error("titular")} />
          <Parrafo nombre="recorrido.intro" etiqueta="Bajada" ayuda="Quién es, en dos o tres frases, debajo del titular." maximo={TOPES.intro} valor={r.intro} alCambiar={(v) => cambiarRecorrido("intro", v)} error={error("intro")} />
          <Parrafo
            nombre="recorrido.formacion"
            etiqueta="Formación"
            ayuda={`Un título por renglón, hasta ${TOPES.formacion}.`}
            maximo={TOPES.formacion * (TOPES.unaFormacion + 1)}
            valor={r.formacion}
            alCambiar={(v) => cambiarRecorrido("formacion", v)}
            error={error("formacion")}
          />
          <CategoriasDelRecorrido recorrido={r} cambiar={cambiarRecorrido} errores={errores} />
        </>
      ) : null}
    </Bloque>
  );
}
