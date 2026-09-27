"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import { guardarMisAvisos } from "@/datos/acciones/avisos";

/**
 * Un correo por cada mensaje nuevo, bandeja por bandeja (SPEC de
 * work/mensajes/ §9): una casilla por cada bandeja que tu rol ve, activadas
 * de fábrica. Cada fila entera es la etiqueta, así se marca tocando el texto.
 */
export function FormularioDeAvisos({ avisos }: { avisos: ReadonlyArray<{ bandeja: Bandeja; activo: boolean }> }) {
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
          {avisos.map(({ bandeja, activo }) => (
            <label key={bandeja} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" name="activas" value={bandeja} defaultChecked={activo} className="size-4 shrink-0 accent-azul-principal" />
              {bandeja === "cv" ? "CV nuevo" : `mensaje nuevo de ${BANDEJAS[bandeja].nombre}`}
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
