import type { Metadata } from "next";
import { Pantalla } from "@/admin/armazon/Pantalla";
import { FormularioOlvide } from "./FormularioOlvide";

export const metadata: Metadata = { title: "Olvidé mi contraseña · Admin ED" };

export default function OlvideMiContrasena() {
  return (
    <Pantalla
      titulo="Elegir una contraseña nueva"
      bajada="Te mandamos un correo con un enlace. Dura una hora."
    >
      <FormularioOlvide />
    </Pantalla>
  );
}
