"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { Aviso, Boton, Campo } from "@/admin/armazon/Campos";

const LARGO_MINIMO = 12;

export function FormularioNueva() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar(datos: FormData) {
    const nueva = String(datos.get("contrasena") ?? "");
    if (nueva.length < LARGO_MINIMO) {
      setError(`La contraseña tiene que tener ${LARGO_MINIMO} caracteres o más.`);
      return;
    }
    if (nueva !== String(datos.get("repetida") ?? "")) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    setError(null);
    const { error: fallo } = await authCliente.resetPassword({ newPassword: nueva, token });
    setEnviando(false);
    if (fallo) {
      setError("Ese enlace ya no sirve. Pedí uno nuevo desde «Olvidé mi contraseña».");
      return;
    }
    router.push("/admin/entrar");
  }

  if (!token) {
    return (
      <Aviso tono="error">
        Falta el enlace del correo. Entrá desde el que te llegó, o pedí uno nuevo.
      </Aviso>
    );
  }

  return (
    <form action={guardar} className="space-y-4">
      <Campo
        etiqueta="Contraseña nueva"
        name="contrasena"
        type="password"
        required
        autoComplete="new-password"
        autoFocus
      />
      <Campo
        etiqueta="Repetila"
        name="repetida"
        type="password"
        required
        autoComplete="new-password"
      />
      {error ? <Aviso tono="error">{error}</Aviso> : null}
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar"}
      </Boton>
    </form>
  );
}
