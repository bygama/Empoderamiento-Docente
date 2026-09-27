"use client";

import { Parrafo, resolverCambio, Seleccion, TextoCorto, type Cambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import { COMPOSICIONES, TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import { colorDe, OPCIONES_DE_COLOR } from "./colores";
import { COMPOSICION, usoDe } from "./etapa-del-recorrido/composiciones";
import { HitosDeLaEtapa } from "./etapa-del-recorrido/HitosDeLaEtapa";
import { PublicacionesDeLaEtapa } from "./etapa-del-recorrido/PublicacionesDeLaEtapa";
import { RamasDeLaEtapa } from "./etapa-del-recorrido/RamasDeLaEtapa";
import type { EtapaEnElFormulario, RecorridoEnElFormulario } from "./formulario";

type Props = {
  i: number;
  etapa: EtapaEnElFormulario;
  cambiar: (cambio: Cambio<EtapaEnElFormulario>) => void;
  categorias: RecorridoEnElFormulario["categorias"];
  firmados: readonly Firmado[];
  errores: Readonly<Record<string, string>>;
};

const OPCIONES_DE_COMPOSICION = COMPOSICIONES.map((c) => ({ valor: c, etiqueta: COMPOSICION[c].etiqueta }));

/**
 * Una etapa del recorrido (SPEC §4.1.1 de `work/equipo/`): lo común —volanta,
 * período, título, texto, composición, color y categoría— y lo que su
 * composición usa. Sus controles se llaman como en el esquema
 * (`recorrido.etapas.2.titulo`), así el error del guardado cae en su lugar.
 */
export function EtapaDelRecorrido({ i, etapa: e, cambiar, categorias, firmados, errores }: Props) {
  const camino = `recorrido.etapas.${i}`;
  const error = (campo: string) => errorDe(errores, `${camino}.${campo}`);
  const texto = (campo: "volanta" | "periodo" | "titulo" | "texto" | "cita" | "territorios") => (valor: string) => cambiar((a) => ({ ...a, [campo]: valor }));
  const lista = <K extends "hitos" | "ramas" | "publicaciones">(campo: K) => (cambio: Cambio<EtapaEnElFormulario[K]>) => cambiar((a) => ({ ...a, [campo]: resolverCambio(cambio, a[campo]) }));
  const uso = usoDe(e.composicion);
  return (
    <div className="space-y-5">
      <div className="@container">
        <div className="grid items-start gap-5 @xl:grid-cols-2">
          <TextoCorto nombre={`${camino}.volanta`} etiqueta="Volanta" ayuda="Arriba del título, en mayúsculas." maximo={TOPES.volanta} valor={e.volanta} alCambiar={texto("volanta")} error={error("volanta")} />
          <TextoCorto nombre={`${camino}.periodo`} etiqueta="Período" ayuda="Opcional: «2009 – 2016», «actualidad»." maximo={TOPES.periodo} valor={e.periodo} alCambiar={texto("periodo")} error={error("periodo")} />
        </div>
      </div>
      <TextoCorto nombre={`${camino}.titulo`} etiqueta="Título" maximo={TOPES.tituloDeEtapa} valor={e.titulo} alCambiar={texto("titulo")} error={error("titulo")} />
      <Parrafo nombre={`${camino}.texto`} etiqueta="Texto" maximo={TOPES.textoDeEtapa} valor={e.texto} alCambiar={texto("texto")} error={error("texto")} />
      <Seleccion
        nombre={`${camino}.composicion`}
        etiqueta="Composición"
        ayuda="Cómo se arma la etapa en el recorrido; debajo aparece lo que usa. Cambiarla no borra nada."
        opciones={OPCIONES_DE_COMPOSICION}
        sinElegir="Elegí cómo se arma"
        valor={e.composicion}
        alCambiar={(v) => cambiar((a) => ({ ...a, composicion: COMPOSICIONES.find((c) => c === v) ?? "" }))}
        error={error("composicion")}
      />
      <div className="@container">
        <div className="grid items-start gap-5 @xl:grid-cols-2">
          <Seleccion nombre={`${camino}.color`} etiqueta="Color" opciones={OPCIONES_DE_COLOR} sinElegir="Elegí un color" valor={e.color} alCambiar={(v) => cambiar((a) => ({ ...a, color: colorDe(v) }))} error={error("color")} />
          <Seleccion
            nombre={`${camino}.categoria`}
            etiqueta="Categoría"
            ayuda="La del índice que se enciende al leer la etapa."
            opciones={categorias.map((c) => ({ valor: c.clave, etiqueta: c.etiqueta.trim() || "Sin nombre" }))}
            sinElegir="Elegí una categoría"
            valor={e.categoria}
            alCambiar={(categoria) => cambiar((a) => ({ ...a, categoria }))}
            error={error("categoria")}
          />
        </div>
      </div>
      {uso?.cita ? <Parrafo nombre={`${camino}.cita`} etiqueta="Cita" ayuda="Una frase real, destacada: el título de una tesis, algo que dijo." maximo={TOPES.cita} valor={e.cita} alCambiar={texto("cita")} error={error("cita")} /> : null}
      {uso?.hitos ? <HitosDeLaEtapa camino={`${camino}.hitos`} hitos={e.hitos} alCambiar={lista("hitos")} conPrincipal={uso.hitos === "con-principal"} errores={errores} /> : null}
      {uso?.ramas ? <RamasDeLaEtapa camino={`${camino}.ramas`} ramas={e.ramas} alCambiar={lista("ramas")} errores={errores} /> : null}
      {uso?.territorios ? (
        <Parrafo nombre={`${camino}.territorios`} etiqueta="Territorios" ayuda={`Uno por renglón, hasta ${TOPES.territorios}.`} maximo={TOPES.territorios * (TOPES.territorio + 1)} valor={e.territorios} alCambiar={texto("territorios")} error={error("territorios")} />
      ) : null}
      {uso?.publicaciones ? <PublicacionesDeLaEtapa camino={`${camino}.publicaciones`} publicaciones={e.publicaciones} alCambiar={lista("publicaciones")} firmados={firmados} errores={errores} /> : null}
    </div>
  );
}
