"use client";

import { ListaVariable, type Cambio } from "@ed/kit-admin";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { PublicacionEnElFormulario } from "../formulario";
import { publicacionVacia } from "../vacios";
import { PublicacionDeLaEtapa } from "./PublicacionDeLaEtapa";

type Props = {
  /** El camino de la lista en el esquema: `recorrido.etapas.2.publicaciones`. */
  camino: string;
  publicaciones: readonly PublicacionEnElFormulario[];
  alCambiar: (cambio: Cambio<PublicacionEnElFormulario[]>) => void;
  firmados: readonly Firmado[];
  errores: Readonly<Record<string, string>>;
};

/** Las publicaciones de una etapa, en el orden en que se leen (SPEC §5.1 de `work/equipo/`). */
export function PublicacionesDeLaEtapa({ camino, publicaciones, alCambiar, firmados, errores }: Props) {
  const nombreDe = (p: PublicacionEnElFormulario) => (p.origen === "biblioteca" ? (firmados.find((m) => m.id === p.material)?.titulo ?? "") : p.titulo).trim();
  return (
    <ListaVariable<PublicacionEnElFormulario>
      nombre={camino}
      etiqueta="Publicaciones"
      etiquetaItem="Publicación"
      maximo={TOPES.publicaciones}
      ayuda="Las que esta etapa cuenta, de las que firma en la Biblioteca o sin link."
      vacia="Sin publicaciones, la etapa es su título y su texto."
      valor={publicaciones}
      alCambiar={alCambiar}
      itemVacio={publicacionVacia}
      claveDe={(p) => p.clave}
      resumenDe={nombreDe}
      porItem={(i, p, cambiar) => <PublicacionDeLaEtapa camino={`${camino}.${i}`} publicacion={p} cambiar={cambiar} firmados={firmados} errores={errores} />}
    />
  );
}
