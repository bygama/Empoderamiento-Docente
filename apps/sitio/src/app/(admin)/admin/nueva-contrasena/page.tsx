import type { Metadata } from "next";
import { Suspense } from "react";
import { Pantalla } from "@/admin/armazon/Pantalla";
import { FormularioNueva } from "./FormularioNueva";

export const metadata: Metadata = { title: "Nueva contraseña · Admin ED" };

export default function NuevaContrasena() {
  return (
    <Pantalla titulo="Elegí tu contraseña" bajada="Es la que vas a usar para entrar al admin.">
      <Suspense>
        <FormularioNueva />
      </Suspense>
    </Pantalla>
  );
}
