import type { Opcion } from "@ed/kit-admin";
import { QueCambioPlegado } from "@/admin/armazon/QueCambioPlegado";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { cambiosDeMaterial } from "./cambios";

/**
 * «Qué cambió» de un material (DESIGN.md §11): lo que hay en pantalla contra
 * lo publicado, en vivo. Un material que nunca se publicó no lo lleva: se
 * publica entero. Las personas del Equipo se leen por su nombre.
 */
export function QueCambio({ publicado, actual, personas }: { publicado: BorradorDeMaterial | null; actual: BorradorDeMaterial; personas: readonly Opcion[] }) {
  if (!publicado) return null;
  return <QueCambioPlegado cambios={cambiosDeMaterial(publicado, actual, (clave) => personas.find((p) => p.valor === clave)?.etiqueta ?? clave)} />;
}
