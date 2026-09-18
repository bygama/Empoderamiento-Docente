import { Pantalla } from "@/admin/armazon/Pantalla";
import { FormularioOlvide } from "./FormularioOlvide";

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
