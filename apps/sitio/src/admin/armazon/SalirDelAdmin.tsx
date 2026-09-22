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
        // En un `finally`: si apagarla falla, salir del admin sale igual.
        try {
          await apagarVistaPrevia();
        } finally {
          await authCliente.signOut();
          router.push("/admin/entrar");
          router.refresh();
        }
      }}
      className="rounded-lg border border-azul-claro/60 px-3 py-1.5 text-admin-meta text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-claro"
    >
      Salir
    </button>
  );
}
