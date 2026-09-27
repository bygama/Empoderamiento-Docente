"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { AVISOS, type ClaveDeAviso } from "@/config/avisos";
import { guardarMisAvisos } from "@/datos/acciones/avisos";

/**
 * Un correo por cada aviso del registro que tu rol puede recibir
 * (`config/avisos.ts`; SPEC de work/mensajes/ §9): una casilla por aviso,
 * activadas de fábrica. Es la misma preferencia que Ajustes › Avisos. Cada fila entera es la etiqueta, así se marca tocando el texto.
 */
export function FormularioDeAvisos({ avisos }: { avisos: ReadonlyArray<{ aviso: ClaveDeAviso; activo: boolean }> }) {
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
            <label key={aviso} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" name="activas" value={aviso} defaultChecked={activo} className="size-4 shrink-0 accent-azul-principal" />
              {AVISOS[aviso].cada}
            </label>
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
