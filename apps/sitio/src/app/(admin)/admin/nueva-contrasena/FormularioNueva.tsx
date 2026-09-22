"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LARGO_MINIMO_CONTRASENA } from "@ed/auth";
import { authCliente } from "@/admin/auth-cliente";
import { CampoContrasena } from "@/admin/armazon/CampoContrasena";
import { Aviso, Boton } from "@/admin/armazon/Campos";

/** Qué campo rechazó el formulario, para marcarlo con `aria-invalid`. */
type Rechazado = "contrasena" | "repetida" | null;

export function FormularioNueva() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [rechazado, setRechazado] = useState<Rechazado>(null);
  const [enviando, setEnviando] = useState(false);
  // El campo rechazado apunta al aviso que explica por qué (`aria-describedby`).
  const idDelError = useId();

  function rechazar(campo: Rechazado, mensaje: string) {
    setRechazado(campo);
    setError(mensaje);
  }

  async function guardar(datos: FormData) {
    const nueva = String(datos.get("contrasena") ?? "");
    // `minLength` ya lo frena en el navegador; esto cubre al que lo saltea.
    if (nueva.length < LARGO_MINIMO_CONTRASENA) {
      rechazar("contrasena", `La contraseña tiene que tener ${LARGO_MINIMO_CONTRASENA} caracteres o más.`);
      return;
    }
    if (nueva !== String(datos.get("repetida") ?? "")) {
      rechazar("repetida", "Las dos contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    setError(null);
    setRechazado(null);
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
      <CampoContrasena
        etiqueta="Contraseña nueva"
        name="contrasena"
        autoComplete="new-password"
        minLength={LARGO_MINIMO_CONTRASENA}
        ayuda="Doce caracteres o más."
        autoFocus
        invalido={rechazado === "contrasena"}
        idDelError={idDelError}
      />
      <CampoContrasena
        etiqueta="Repetila"
        name="repetida"
        autoComplete="new-password"
        minLength={LARGO_MINIMO_CONTRASENA}
        invalido={rechazado === "repetida"}
        idDelError={idDelError}
      />
      {error ? (
        <Aviso tono="error" id={idDelError}>
          {error}
        </Aviso>
      ) : null}
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar"}
      </Boton>
    </form>
  );
}
