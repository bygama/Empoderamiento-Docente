"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ROLES_QUE_SE_ASIGNAN, type Rol } from "@ed/auth";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { ENTRADA } from "@/admin/campos/clases";
import { cambiarElRol } from "@/datos/acciones/cuentas";

/** Cambiar el rol de otra cuenta, entre los que se asignan: dirige no, que se pasa. */
export function FormularioDelRol({ idDeCuenta, rol }: { idDeCuenta: string; rol: Rol }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const id = useId();

  async function cambiar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevo = String(new FormData(evento.currentTarget).get("rol") ?? "");
    setGuardando(true);
    const r = await cambiarElRol(idDeCuenta, nuevo);
    setGuardando(false);
    setResultado(r);
    if (r.ok) router.refresh();
  }

  return (
    <form onSubmit={cambiar} className="max-w-md space-y-3">
      <label htmlFor={id} className="text-admin-meta font-medium">
        Rol
      </label>
      <select id={id} name="rol" defaultValue={rol} className={`${ENTRADA} capitalize`}>
        {ROLES_QUE_SE_ASIGNAN.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {resultado ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Cambiando…" : "Cambiar el rol"}
      </Boton>
    </form>
  );
}
