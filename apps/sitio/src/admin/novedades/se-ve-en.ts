import type { Vecinas } from "@/datos/consultas/ficha-de-novedad";
import { compararFechas } from "@/features/novedades/contenido/fechas";
import { NOVEDADES_EN_EL_INICIO } from "@/features/novedades/contenido/modelo";

// «Se ve en» (SPEC §6.2 de `work/novedades-y-kit/`, propuesta E): dónde está
// la novedad en el sitio, con las reglas que usa el sitio para elegir. La tapa
// de Novedades es la destacada (o la más nueva) y, al lado, la más nueva que
// no es la tapa; el Inicio, las cuatro más nuevas. Todas van en la lista.

export type Lugar = { lugar: string; detalle: string };

/** La novedad como está en pantalla. */
type Esta = { id: string | null; slug: string; fecha: string; destacada: boolean; conCuerpo: boolean };

/** Dónde se ve, con lo que está en pantalla y las demás publicadas. Pura: se prueba sin base. */
export function dondeSeVe(esta: Esta, vecinas: Vecinas): Lugar[] {
  const yo = { id: esta.id ?? "", slug: esta.slug, fecha: esta.fecha };
  // El orden del sitio: la más nueva primero y, a igual fecha, por slug.
  const todas = [...vecinas.publicadas.filter((v) => v.id !== esta.id), yo].sort((a, b) => compararFechas(a.fecha, b.fecha) || a.slug.localeCompare(b.slug));
  const otraDestacada = vecinas.destacada && vecinas.destacada.id !== esta.id ? todas.find((v) => v.id === vecinas.destacada?.id) : undefined;
  // Marcarla destacada desmarca la otra al publicar: la tapa pasa a ser esta.
  const tapa = esta.destacada ? yo : (otraDestacada ?? todas[0]);
  const alLado = todas.find((v) => v !== tapa);

  let enNovedades = "En la lista.";
  if (tapa === yo) enNovedades = esta.destacada ? "En la tapa, como la destacada, y en la lista." : "En la tapa, por ser la más nueva, y en la lista.";
  else if (alLado === yo) enNovedades = "En la tapa, como la segunda nota, y en la lista.";

  return [
    { lugar: "Novedades", detalle: enNovedades },
    esta.conCuerpo
      ? { lugar: "Su ficha", detalle: `/novedades/${esta.slug || "…"}` }
      : { lugar: "Sin ficha", detalle: "No tiene cuerpo: se ve solo en Novedades, y no tiene un link propio para compartir." },
    ...(todas.indexOf(yo) < NOVEDADES_EN_EL_INICIO ? [{ lugar: "Inicio", detalle: `Entre las ${NOVEDADES_EN_EL_INICIO} más nuevas.` }] : []),
  ];
}
