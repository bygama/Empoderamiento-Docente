"use client";

import { usePathname } from "next/navigation";

/** La ruta en la que está la persona, para que «Volver al sitio publicado» la deje en la misma página. */
export function RutaActual() {
  return <input type="hidden" name="ruta" value={usePathname()} />;
}
