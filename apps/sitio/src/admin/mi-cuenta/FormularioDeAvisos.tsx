"use client";

import { useState, type FormEvent } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { AVISOS, type ClaveDeAviso } from "@/config/avisos";
import { guardarMisAvisos } from "@/datos/acciones/avisos";

/**
 * Un correo por cada aviso del registro que tu rol puede recibir
 * (`config/avisos.ts`; SPEC de work/mensajes/ §9): una casilla por aviso,
 * activadas de fábrica. Es la misma preferencia que Ajustes › Avisos. Cada fila entera es la etiqueta, así se marca tocando el texto.
 */
export function FormularioDeAvisos({
  avisos,
  notas = {},
}: {
  avisos: ReadonlyArray<{ aviso: ClaveDeAviso; activo: boolean }>;
  /** Lo que conviene saber de un aviso, debajo de su casilla: cuándo empieza el resumen semanal. */
  notas?: Partial<Record<ClaveDeAviso, string>>;
}) {
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const activas = new FormData(evento.currentTarget).getAll("activas").map(String);
    setGuardando(true);
    setResultado(await guardarMisAvisos(activas));
    setGuardando(false);
  }

  return (
    <form onSubmit={guardar} className="max-w-md space-y-3">
      <fieldset>
        <legend className="text-admin-meta font-medium">Mandame un correo con cada</legend>
        <div className="mt-1">
          {avisos.map(({ aviso, activo }) => (
            <div key={aviso}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="activas"
                  value={aviso}
                  defaultChecked={activo}
                  aria-describedby={notas[aviso] ? `aviso-${aviso}-nota` : undefined}
                  className="size-4 shrink-0 accent-azul-principal"
                />
                {AVISOS[aviso].cada}
              </label>
              {notas[aviso] ? (
                <p id={`aviso-${aviso}-nota`} className="-mt-1 pb-2 pl-7 text-admin-meta text-gris-texto">
                  {notas[aviso]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>
      {resultado ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Guardando…" : "Guardar los avisos"}
      </Boton>
    </form>
  );
}
