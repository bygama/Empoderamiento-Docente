"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ROLES_QUE_SE_ASIGNAN, darloPideContrasena, seAsigna, type Rol } from "@ed/auth";
import { Aviso, Boton, CampoContrasena, ENTRADA } from "@ed/kit-admin";
import { cambiarElRol } from "@/datos/acciones/cuentas";
import type { Resultado } from "@/datos/sobre-cuentas";

/**
 * Cambiar el rol de otra cuenta, entre los que se asignan: dirige no, que se
 * pasa. Dar uno que maneja las cuentas pide tu contraseña, como pasar la
 * dirección: el campo aparece al elegirlo.
 */
export function FormularioDelRol({ idDeCuenta, rol, correoPropio }: { idDeCuenta: string; rol: Rol; correoPropio: string }) {
  const router = useRouter();
  // Lo que se eligió en el selector; `null` mientras no se tocó (queda el rol que tiene).
  const [elegido, setElegido] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [guardando, setGuardando] = useState(false);
  const id = useId();
  const idDelAviso = useId();

  async function cambiar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setGuardando(true);
    const r = await cambiarElRol(idDeCuenta, String(datos.get("rol") ?? ""), String(datos.get("contrasena") ?? ""));
    setGuardando(false);
    setResultado(r);
    if (r.ok) router.refresh();
  }

  const pideContrasena = elegido !== null && elegido !== rol && seAsigna(elegido) && darloPideContrasena(elegido);
  return (
    <form onSubmit={cambiar} className="max-w-md space-y-3">
      <label htmlFor={id} className="text-admin-meta font-medium">
        Rol
      </label>
      <select id={id} name="rol" defaultValue={rol} onChange={(e) => setElegido(e.currentTarget.value)} className={`${ENTRADA} capitalize`}>
        {ROLES_QUE_SE_ASIGNAN.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {pideContrasena ? (
        <>
          <input type="text" name="usuario" autoComplete="username" value={correoPropio} readOnly hidden />
          <CampoContrasena
            etiqueta="Tu contraseña"
            name="contrasena"
            autoComplete="current-password"
            ayuda={`Para darle el rol ${elegido}, que maneja las cuentas.`}
            invalido={resultado?.campo === "contrasena"}
            idDelError={idDelAviso}
          />
        </>
      ) : null}
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} id={idDelAviso}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={guardando} aria-busy={guardando || undefined}>
        {guardando ? "Cambiando…" : "Cambiar el rol"}
      </Boton>
    </form>
  );
}
