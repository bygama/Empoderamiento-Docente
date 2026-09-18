"use client";

import { useRouter } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";

export function SalirDelAdmin() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
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
