"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QUE_PUEDE, ROLES_QUE_SE_ASIGNAN, ROL_POR_DEFECTO } from "@ed/auth";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso, Campo } from "@/admin/armazon/Campos";
import { invitar } from "@/datos/acciones/invitaciones";

/**
 * Invitar a alguien (SPEC de work/cuentas §4.2): correo, nombre y rol. Va por
 * `onSubmit` y no por `action`, como el nombre de Mi cuenta: ante un rechazo
 * («ya hay una cuenta con ese correo») se corrige lo escrito, no se empieza de
 * nuevo. Al terminar lleva a la cuenta nueva, que dice si el correo salió.
 */
export function FormularioDeInvitacion() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [mandando, setMandando] = useState(false);
  const idDelError = useId();

  async function mandar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setMandando(true);
    setError(null);
    const resultado = await invitar({ correo: String(datos.get("correo") ?? ""), nombre: String(datos.get("nombre") ?? ""), rol: String(datos.get("rol") ?? "") });
    if (!resultado.ok || !resultado.id) {
      setError(resultado.detalle);
      setMandando(false);
      return;
    }
    router.push(`/admin/cuentas/${resultado.id}?invitacion=${resultado.correoSalio ? "salio" : "no-salio"}`);
  }

  return (
    <form onSubmit={mandar} className="max-w-md space-y-6">
      <Campo etiqueta="Correo" name="correo" type="email" required maxLength={254} autoComplete="off" />
      <Campo etiqueta="Nombre" name="nombre" required maxLength={80} autoComplete="off" />
      <fieldset>
        <legend className="text-admin-meta font-medium">Rol</legend>
        <div className="mt-2 space-y-3">
          {ROLES_QUE_SE_ASIGNAN.map((rol) => (
            <label key={rol} className="flex gap-3">
              <input
                type="radio"
                name="rol"
                value={rol}
                required
                defaultChecked={rol === ROL_POR_DEFECTO}
                className="mt-1 size-4 shrink-0 accent-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
              />
              <span>
                <span className="font-medium capitalize">{rol}</span>
                <span className="mt-0.5 block text-admin-meta text-gris-texto">{QUE_PUEDE[rol]}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-admin-meta text-gris-texto">Dirige no se invita: quien dirige le pasa la dirección a otra persona, desde su cuenta.</p>
      </fieldset>
      {error ? (
        <Aviso tono="error" id={idDelError}>
          {error}
        </Aviso>
      ) : null}
      <Boton variante="primario" type="submit" disabled={mandando} aria-busy={mandando || undefined}>
        {mandando ? "Mandando…" : "Mandar la invitación"}
      </Boton>
    </form>
  );
}
