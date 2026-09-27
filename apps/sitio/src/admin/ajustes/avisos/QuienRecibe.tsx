"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import type { ClaveDeAviso } from "@/config/avisos";
import { guardarQuienRecibe } from "@/datos/acciones/avisos";

type Cuenta = { id: string; nombre: string; correo: string; activo: boolean };

type Props = { aviso: ClaveDeAviso; nombre: string; cada: string; cuentas: readonly Cuenta[] };

/**
 * Quién recibe un aviso (DESIGN.md §11, «Casilla», cuando las casillas son lo
 * que se elige): una fila de 44 px por cuenta, con su nombre y su correo, y un
 * botón secundario, porque cada aviso se guarda por su cuenta y ninguno es el
 * primario de la pantalla. Guardar sin nadie marcado vale, y el aviso lo dice.
 */
export function QuienRecibe({ aviso, nombre, cada, cuentas }: Props) {
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const elegidas = new FormData(evento.currentTarget).getAll("cuentas").map(String);
    setGuardando(true);
    setResultado(await guardarQuienRecibe({ aviso, cuentas: elegidas }));
    setGuardando(false);
  }

  if (!cuentas.length) return <p className="text-admin-meta text-gris-texto">Ninguna cuenta lo puede recibir todavía.</p>;

  return (
    <form onSubmit={guardar} className="max-w-md space-y-3">
      <fieldset>
        <legend className="text-admin-meta font-medium">Reciben un correo con cada {cada}</legend>
        <div className="mt-1">
          {cuentas.map((c) => (
            <label key={c.id} className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
              <input type="checkbox" name="cuentas" value={c.id} defaultChecked={c.activo} className="size-4 shrink-0 accent-azul-principal" />
              <span className="min-w-0">
                {/* La coma es para el lector: sin ella, el nombre de la casilla junta el nombre con el correo. */}
                {c.nombre}
                <span className="sr-only">,</span> <span className="text-admin-meta break-all text-gris-texto">{c.correo}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {resultado ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Guardando…" : `Guardar quién recibe los de ${nombre}`}
      </Boton>
    </form>
  );
}
