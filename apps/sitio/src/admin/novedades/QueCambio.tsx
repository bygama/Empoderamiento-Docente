import type { Opcion } from "@ed/kit-admin";
import { QueCambioPlegado } from "@/admin/armazon/QueCambioPlegado";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import { cambiosDeNovedad } from "./cambios";

/**
 * «Qué cambió» (DESIGN.md §11): lo que hay en pantalla contra lo publicado,
 * en vivo —incluye lo que todavía no se guardó, que es lo que «Publicar» va a
 * publicar—. Una novedad que nunca se publicó no lo lleva: se publica entera.
 * El material se lee por su título, de las mismas opciones del formulario.
 */
export function QueCambio({ publicado, actual, materiales }: { publicado: BorradorDeNovedad | null; actual: BorradorDeNovedad; materiales: readonly Opcion[] }) {
  if (!publicado) return null;
  return <QueCambioPlegado cambios={cambiosDeNovedad(publicado, actual, (id) => materiales.find((m) => m.valor === id)?.etiqueta ?? "Un material que ya no está")} />;
}
