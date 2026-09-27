"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso, Campo } from "@/admin/armazon/Campos";
import { cambiarElCorreo } from "@/datos/acciones/cuentas";

/**
 * Cambiar el correo con que entra una cuenta: le cierra las sesiones (si es la
 * propia, las otras) y avisa a las dos direcciones. No pregunta antes: se
 * deshace cambiándolo de nuevo (DESIGN.md §11 pide confirmar lo que no vuelve).
 */
export function FormularioDelCorreo({ idDeCuenta, correo }: { idDeCuenta: string; correo: string }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const idDelAviso = useId();

  async function cambiar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevo = String(new FormData(evento.currentTarget).get("correo") ?? "");
    setGuardando(true);
    const r = await cambiarElCorreo(idDeCuenta, nuevo);
    setGuardando(false);
    setResultado(r);
    if (r.ok) router.refresh();
  }

  const rechazado = resultado !== null && !resultado.ok;
  return (
    <form onSubmit={cambiar} className="max-w-md space-y-3">
      <Campo
        key={correo}
        etiqueta="Correo"
        name="correo"
        type="email"
        defaultValue={correo}
        required
        maxLength={254}
        autoComplete="off"
        aria-invalid={rechazado || undefined}
        aria-describedby={rechazado ? idDelAviso : undefined}
      />
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} id={idDelAviso}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Cambiando…" : "Cambiar el correo"}
      </Boton>
    </form>
  );
}
