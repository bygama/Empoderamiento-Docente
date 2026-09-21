"use client";

import { fechaYHora, haceCuanto } from "@/lib/contenido/tiempo";

/**
 * Una fecha en la zona de quien mira: absoluta («21/9 a las 14:05») o
 * relativa («hace 3 minutos», como pide el SPEC §2 para el borrador). El
 * servidor la renderiza con su reloj y su zona (UTC en Vercel) y el navegador
 * la corrige al hidratar: `suppressHydrationWarning` existe para esto y solo
 * cubre este elemento. La relativa se recalcula en cada render, o sea cada
 * vez que el estado del editor cambia.
 *
 * Si `iso` no describe una fecha válida, no se muestra nada: formatear una
 * fecha inválida con `Intl.DateTimeFormat` tira `RangeError`, y ese error se
 * llevaría puesto el editor entero en vez de mostrar un campo vacío.
 */
export function Momento({ iso, relativo = false }: { iso: string; relativo?: boolean }) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {relativo ? haceCuanto(fecha) : fechaYHora(iso)}
    </time>
  );
}
