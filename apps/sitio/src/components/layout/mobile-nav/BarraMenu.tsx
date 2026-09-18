import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { HOME_LINK } from "@/config/nav";
import { X } from "@/components/ui/icons";

/** Barra superior del panel: logo (→ Inicio) + cerrar. */
export function BarraMenu({
  closeRef,
  onCerrar,
}: {
  closeRef: RefObject<HTMLButtonElement | null>;
  onCerrar: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <Link
        href={HOME_LINK.href}
        aria-label="Empoderamiento Docente — Inicio"
        onClick={onCerrar}
        className="inline-flex items-center"
      >
        <Image
          src="/brand/logotipo-principal-ed.png"
          alt="Empoderamiento Docente"
          width={425}
          height={467}
          unoptimized
          className="h-10 w-auto"
        />
      </Link>
      <button
        ref={closeRef}
        type="button"
        aria-label="Cerrar menú"
        onClick={onCerrar}
        className="text-azul-principal hover:bg-azul-principal/5 inline-flex items-center justify-center rounded-xl p-2 transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
}
