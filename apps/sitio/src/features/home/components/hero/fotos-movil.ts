import type { Hero } from "@/features/home/contenido/hero";
import type { ValorFoto } from "@/lib/contenido/fotos";
import type { HuecoMovil } from "./geometria-hero";

/** Una foto del hero en celular: su tamaño (estructura) y lo que se edita (foto y cartel). */
export type FotoMovil = {
  w: number;
  ar: number;
  foto: ValorFoto;
  cartel: { titulo: string; descripcion: string } | null;
};

/** Las fotos de una banda, con los huecos de `geometria-hero.ts` y el contenido del admin. */
export function fotosDeBanda(huecos: readonly HuecoMovil[], contenido: Pick<Hero, "tarjetas" | "tarjetasCelular">): FotoMovil[] {
  return huecos.flatMap((h) => {
    const tarjeta = contenido.tarjetasCelular[h.celular];
    if (!tarjeta) return [];
    const cartel = h.cartelDe === undefined ? null : (contenido.tarjetas[h.cartelDe]?.cartel ?? null);
    return [{ w: h.w, ar: h.ar, foto: tarjeta.foto, cartel }];
  });
}
