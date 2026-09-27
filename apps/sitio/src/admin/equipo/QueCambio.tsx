import { QueCambioPlegado } from "@/admin/armazon/QueCambioPlegado";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
import { cambiosDelPerfil } from "./cambios";

/**
 * «Qué cambió» de un perfil (DESIGN.md §11): lo que hay en pantalla contra lo
 * publicado, en vivo. Un perfil que nunca se publicó no lo lleva: se publica
 * entero. Los materiales se leen por su título.
 */
export function QueCambio({ publicado, actual, firmados }: { publicado: BorradorDePersona | null; actual: BorradorDePersona; firmados: readonly Firmado[] }) {
  if (!publicado) return null;
  return <QueCambioPlegado cambios={cambiosDelPerfil(publicado, actual, (id) => firmados.find((m) => m.id === id)?.titulo ?? "Un material que ya no firma")} />;
}
