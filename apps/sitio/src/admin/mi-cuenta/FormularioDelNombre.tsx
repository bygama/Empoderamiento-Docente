"use client";

import { useId, useState, type FormEvent } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { Campo } from "@/admin/armazon/Campos";
import { cambiarMiNombre } from "@/datos/acciones/mi-cuenta";

/**
 * El nombre, que es lo que figura en lo que cada persona publica. Va por
 * `onSubmit` y no por `action`: una acción de formulario vacía los campos al
 * terminar, y ante un rechazo hay que poder corregir lo que se escribió, no
 * volver a empezar.
 */
export function FormularioDelNombre({ nombre }: { nombre: string }) {
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const idDelAviso = useId();

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const escrito = String(new FormData(evento.currentTarget).get("nombre") ?? "");
    setGuardando(true);
    setResultado(await cambiarMiNombre(escrito));
    setGuardando(false);
  }

  const rechazado = resultado !== null && !resultado.ok;
  return (
    <form onSubmit={guardar} className="max-w-md space-y-3">
      {/* La `key` lo vuelve a armar con el nombre guardado, que llega limpio («Ana  María » → «Ana María»). */}
      <Campo
        key={nombre}
        etiqueta="Nombre"
        name="nombre"
        defaultValue={nombre}
        required
        maxLength={80}
        autoComplete="name"
        aria-invalid={rechazado || undefined}
        aria-describedby={rechazado ? idDelAviso : undefined}
      />
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} id={idDelAviso}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Guardando…" : "Guardar el nombre"}
      </Boton>
    </form>
  );
}
