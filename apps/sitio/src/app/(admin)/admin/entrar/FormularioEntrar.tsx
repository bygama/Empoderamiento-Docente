"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { Aviso, Boton, Campo } from "@/admin/armazon/Campos";

/**
 * Entra al admin.
 *
 * Va por HTTP contra `/api/auth`, no por una Server Action: el rate limit por
 * IP vive en ese handler y una llamada desde el servidor lo saltearía.
 */
export function FormularioEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(datos: FormData) {
    setEnviando(true);
    setError(null);
    const { error: fallo } = await authCliente.signIn.email({
      email: String(datos.get("email") ?? ""),
      password: String(datos.get("contrasena") ?? ""),
    });
    if (fallo) {
      // Un solo mensaje para «no existe» y para «contraseña mala»: distinguir
      // los dos le confirma a quien prueba cuáles correos existen.
      setError(
        fallo.status === 429
          ? "Demasiados intentos. Esperá un minuto y probá de nuevo."
          : "El correo o la contraseña no coinciden.",
      );
      setEnviando(false);
      return;
    }
    // Solo rutas del propio admin: un `volver` absoluto sería un redirect
    // abierto, y llega por la URL, así que no se confía en él.
    const volver = parametros.get("volver");
    router.push(volver?.startsWith("/admin") && !volver.startsWith("//") ? volver : "/admin");
    router.refresh();
  }

  return (
    <form action={entrar} className="space-y-4">
      <Campo etiqueta="Correo" name="email" type="email" required autoComplete="email" autoFocus />
      <Campo
        etiqueta="Contraseña"
        name="contrasena"
        type="password"
        required
        autoComplete="current-password"
      />
      {error ? <Aviso tono="error">{error}</Aviso> : null}
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Boton>
      <p className="text-center text-sm">
        <Link className="text-azul-medio underline" href="/admin/olvide-mi-contrasena">
          Olvidé mi contraseña
        </Link>
      </p>
    </form>
  );
}
