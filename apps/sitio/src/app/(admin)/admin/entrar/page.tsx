import { Suspense } from "react";
import { Pantalla } from "@/admin/armazon/Pantalla";
import { FormularioEntrar } from "./FormularioEntrar";

export default function Entrar() {
  return (
    <Pantalla titulo="Entrar al admin" bajada="El contenido del sitio se edita desde acá.">
      {/* useSearchParams necesita un límite de Suspense para no forzar a toda
          la página a renderizarse en el cliente. */}
      <Suspense>
        <FormularioEntrar />
      </Suspense>
    </Pantalla>
  );
}
