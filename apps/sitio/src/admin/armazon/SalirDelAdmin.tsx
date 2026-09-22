"use client";

import { useRouter } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { apagarVistaPrevia } from "@/datos/acciones/salir-de-vista-previa";

export function SalirDelAdmin() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        // Antes de cerrar la sesión: la cookie de la vista previa no vence
        // sola, y sin esto quien sale seguiría viendo borradores en el sitio.
        await apagarVistaPrevia();
        await authCliente.signOut();
        router.push("/admin/entrar");
        router.refresh();
      }}
      className="rounded-lg border border-azul-claro px-3 py-1.5 text-sm transition-colors hover:bg-azul-claro/20"
    >
      Salir
    </button>
  );
}
