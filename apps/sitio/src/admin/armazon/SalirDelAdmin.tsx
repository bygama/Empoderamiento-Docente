"use client";

import { useRouter } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { Salir } from "@/components/ui/icons";
import { apagarVistaPrevia } from "@/datos/acciones/salir-de-vista-previa";

/** Cierra la sesión. El aspecto lo pone quien lo usa: hoy, una opción del menú de la cuenta. */
export function SalirDelAdmin({ className }: { className: string }) {
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
      className={className}
    >
      <Salir size={18} className="shrink-0" />
      Salir
    </button>
  );
}
