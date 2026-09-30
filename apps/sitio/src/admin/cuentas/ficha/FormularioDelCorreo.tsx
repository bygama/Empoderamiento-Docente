"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Boton, CampoContrasena, CampoSimple } from "@ed/kit-admin";
import { cambiarElCorreo } from "@/datos/acciones/cuentas";
import type { Resultado } from "@/datos/sobre-cuentas";

/**
 * Cambiar el correo con que entra una cuenta: le cierra las sesiones (si es la
 * propia, las otras) y avisa a las dos direcciones. Pide tu contraseña, como
 * pasar la dirección: el correo es lo que recupera una cuenta. No pregunta
 * antes: se deshace cambiándolo de nuevo (DESIGN.md §11 pide confirmar lo que
 * no vuelve).
 */
export function FormularioDelCorreo({ idDeCuenta, correo, correoPropio }: { idDeCuenta: string; correo: string; correoPropio: string }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [guardando, setGuardando] = useState(false);
  const idDelAviso = useId();

  async function cambiar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setGuardando(true);
    const r = await cambiarElCorreo(idDeCuenta, String(datos.get("correo") ?? ""), String(datos.get("contrasena") ?? ""));
    setGuardando(false);
    setResultado(r);
    if (r.ok) router.refresh();
  }

  const rechazado = resultado !== null && !resultado.ok;
  const porLaContrasena = rechazado && resultado.campo === "contrasena";
  return (
    <form onSubmit={cambiar} className="max-w-md space-y-3">
      <CampoSimple
        key={correo}
        etiqueta="Correo"
        name="correo"
        type="email"
        defaultValue={correo}
        required
        maxLength={254}
        autoComplete="off"
        aria-invalid={(rechazado && !porLaContrasena) || undefined}
        aria-describedby={rechazado && !porLaContrasena ? idDelAviso : undefined}
      />
      {/* Para que el gestor de contraseñas complete la tuya, no la de esta cuenta. */}
      <input type="text" name="usuario" autoComplete="username" value={correoPropio} readOnly hidden />
      <CampoContrasena etiqueta="Tu contraseña" name="contrasena" autoComplete="current-password" invalido={porLaContrasena} idDelError={idDelAviso} />
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
