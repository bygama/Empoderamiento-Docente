"use client";

import { Parrafo, Seleccion, TextoCorto, type Opcion } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { LUGARES_DE_DESTACADO, TOPES } from "@/features/biblioteca/contenido/modelo";
import { Bloque, type PropsDeBloque } from "./Bloque";

/**
 * Si el material es uno de los cuatro de «Material destacado» (SPEC §3 de
 * `work/biblioteca/`), en qué lugar, y los tres textos que lo presentan: el
 * rótulo del índice, la frase y el detalle. Un material por lugar: la ayuda
 * dice quién lo tiene hoy y qué pasa al publicar.
 */
export function DestacadoDelMaterial({ form, cambiar, errores, lugares, ayudaDelLugar }: PropsDeBloque & { lugares: readonly Opcion[]; ayudaDelLugar: string }) {
  const error = (camino: string) => errorDe(errores, camino);
  return (
    <Bloque id="bloque-destacado" titulo="Destacado">
      <Seleccion
        nombre="destacado"
        etiqueta="Lugar entre los destacados"
        ayuda={ayudaDelLugar}
        opciones={[{ valor: "", etiqueta: "No es destacado" }, ...lugares]}
        sinElegir="Elegí un lugar"
        valor={form.destacado === null ? "" : String(form.destacado)}
        alCambiar={(v) => cambiar("destacado", LUGARES_DE_DESTACADO.find((l) => String(l) === v) ?? null)}
        error={error("destacado")}
      />
      {form.destacado === null ? null : (
        <>
          <TextoCorto nombre="rotulo" etiqueta="Rótulo" ayuda="En el índice de los destacados, en mayúsculas: «RELIME 2025»." maximo={TOPES.rotulo} valor={form.rotulo} alCambiar={(v) => cambiar("rotulo", v)} error={error("rotulo")} />
          <TextoCorto nombre="frase" etiqueta="Frase" ayuda="Debajo del título, en verde: de qué va, en una línea." maximo={TOPES.frase} valor={form.frase} alCambiar={(v) => cambiar("frase", v)} error={error("frase")} />
          <Parrafo nombre="detalle" etiqueta="Detalle" ayuda="Un párrafo que amplía la descripción: por qué lo elige el equipo." maximo={TOPES.detalle} valor={form.detalle} alCambiar={(v) => cambiar("detalle", v)} error={error("detalle")} />
        </>
      )}
    </Bloque>
  );
}
