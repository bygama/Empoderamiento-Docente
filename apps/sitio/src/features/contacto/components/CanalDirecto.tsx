"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

/**
 * Canal directo de contacto: el mail para copiar de un toque y, cuando el
 * cliente confirme un número, WhatsApp. Acompaña al formulario para quien
 * prefiere escribir por su cuenta: en un celular sin app de correo, un
 * `mailto:` no abre nada, y copiar el mail sí sirve.
 */
export function CanalDirecto({ className }: { className?: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 1800);
    return () => window.clearTimeout(t);
  }, [copiado]);

  const email = siteConfig.contacto.email;
  const whatsapp = siteConfig.contacto.whatsapp;
  const waHref = whatsapp ? `https://wa.me/${whatsapp}` : null;

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles (http, iframe): al menos que lo vea entero.
      window.prompt("Copiá el texto:", texto);
    }
  };

  const chip =
    "border-azul-principal/20 text-azul-principal hover:border-azul-principal inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-white/70 px-3.5 font-sans text-[0.85rem] font-medium transition-colors";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2.5 ${className ?? ""}`}
    >
      <a
        href={`mailto:${email}`}
        className="text-azul-principal hover:text-verde-concepto font-sans text-[0.95rem] font-medium break-all transition-colors"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={() => copiar(email)}
        className={chip}
        aria-live="polite"
      >
        {copiado ? "Copiado" : "Copiar mail"}
      </button>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
        >
          WhatsApp
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
