import type { ProfileStage } from "@/features/quienes-somos/data/equipo";

/** Acentos de marca por familia temática. Clases LITERALES (Tailwind las escanea). */
export const ACCENT: Record<
  ProfileStage["color"],
  { text: string; bg: string; border: string; soft: string; ring: string; glow: string; hex: string }
> = {
  verde: {
    text: "text-verde-concepto-texto",
    bg: "bg-verde-concepto",
    border: "border-verde-concepto",
    soft: "bg-verde-concepto/10",
    ring: "ring-verde-concepto/30",
    glow: "shadow-[0_0_0_6px_rgb(31_154_120/0.14)]",
    hex: "#1f9a78",
  },
  azul: {
    text: "text-azul-medio",
    bg: "bg-azul-medio",
    border: "border-azul-medio",
    soft: "bg-azul-medio/10",
    ring: "ring-azul-medio/30",
    glow: "shadow-[0_0_0_6px_rgb(74_111_165/0.14)]",
    hex: "#4a6fa5",
  },
  naranja: {
    text: "text-naranja-accion-texto",
    bg: "bg-naranja-accion",
    border: "border-naranja-accion",
    soft: "bg-naranja-accion/10",
    ring: "ring-naranja-accion/30",
    glow: "shadow-[0_0_0_6px_rgb(224_122_47/0.14)]",
    hex: "#e07a2f",
  },
};
