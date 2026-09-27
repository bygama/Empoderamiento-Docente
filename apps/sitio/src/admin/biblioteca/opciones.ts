import type { Opcion } from "@ed/kit-admin";
import type { Vecinos } from "@/datos/consultas/ficha-de-material";
import { LUGARES_DE_DESTACADO } from "@/features/biblioteca/contenido/modelo";

// Lo que la ficha de un material ofrece elegir que depende de afuera: las
// personas del Equipo y los lugares de los destacados, con quién tiene cada
// uno hoy, y qué pasa si se elige uno ocupado.

/** Un título largo, cortado para ir adentro de una opción. */
const corto = (titulo: string) => (titulo.length > 60 ? `${titulo.slice(0, 57).trimEnd()}…` : titulo);

export function opcionesDeLaFicha(vecinos: Vecinos, id: string | null, destacado: number | null): { personas: Opcion[]; lugares: Opcion[]; ayudaDelLugar: string } {
  const deOtro = (lugar: number) => {
    const quien = vecinos.lugares[lugar];
    return quien && quien.id !== id ? quien : null;
  };
  const lugares = LUGARES_DE_DESTACADO.map((l) => {
    const otro = deOtro(l);
    if (otro) return { valor: String(l), etiqueta: `Lugar ${l} · hoy «${corto(otro.titulo)}»` };
    return { valor: String(l), etiqueta: vecinos.lugares[l] ? `Lugar ${l} · este material` : `Lugar ${l} · libre` };
  });
  const ocupado = destacado === null ? null : deOtro(destacado);
  const ayudaDelLugar = ocupado
    ? `Hoy el lugar ${destacado} es de «${ocupado.titulo}». Al publicar este, aquel deja de ser destacado: hay uno por lugar.`
    : "Los cuatro abren la Biblioteca y se ven en el Inicio. Hay uno por lugar.";
  return { personas: vecinos.personas.map((p) => ({ valor: p.clave, etiqueta: p.nombre })), lugares, ayudaDelLugar };
}
