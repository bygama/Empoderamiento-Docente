"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ROL_AL_DEJAR_LA_DIRECCION } from "@ed/auth";
import { Boton } from "@/admin/armazon/Boton";
import { CampoContrasena } from "@/admin/armazon/CampoContrasena";
import { Aviso } from "@/admin/armazon/Campos";
import { pasarLaDireccion } from "@/datos/acciones/direccion";

/**
 * Pasarle la dirección a otra persona: pide otra vez la contraseña de quien
 * dirige y pregunta antes, porque no se deshace sola (la devuelve la otra
 * persona, si quiere).
 */
export function FormularioDeLaDireccion({ idDeCuenta, nombre, correoPropio }: { idDeCuenta: string; nombre: string; correoPropio: string }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [pasando, setPasando] = useState(false);
  const idDelAviso = useId();

  async function pasar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const contrasena = String(new FormData(evento.currentTarget).get("contrasena") ?? "");
    if (!window.confirm(`¿Pasarle la dirección a ${nombre}? Vos quedás con el rol ${ROL_AL_DEJAR_LA_DIRECCION}, y solo ${nombre} te la puede devolver.`)) return;
    setPasando(true);
    const r = await pasarLaDireccion(idDeCuenta, contrasena);
    setPasando(false);
    setResultado(r);
    if (r.ok) router.refresh();
  }

  const rechazado = resultado !== null && !resultado.ok;
  return (
    <form onSubmit={pasar} className="max-w-md space-y-4">
      <input type="text" name="usuario" autoComplete="username" value={correoPropio} readOnly hidden />
      <CampoContrasena etiqueta="Tu contraseña" name="contrasena" autoComplete="current-password" invalido={rechazado} idDelError={idDelAviso} />
      {resultado ? (
        <Aviso tono={resultado.ok ? "bien" : "error"} id={idDelAviso}>
          {resultado.detalle}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={pasando} aria-busy={pasando || undefined}>
        {pasando ? "Pasando…" : `Pasarle la dirección a ${nombre}`}
      </Boton>
    </form>
  );
}
