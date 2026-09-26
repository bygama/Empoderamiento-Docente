import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cvAbierto } from "@/config/cv";
import { SumateAlEquipo } from "@/features/cv/components/SumateAlEquipo";

export const metadata: Metadata = {
  title: "Sumate al equipo",
  description: "Si sos profesional de la educación y querés trabajar con Empoderamiento Docente, dejanos tu CV.",
};

/**
 * La entrada pública del CV. **Apagada hasta `CV_ABIERTO=si`**: ED todavía
 * tiene que confirmar qué datos pide y publicar la política de privacidad
 * (work/mensajes/SPEC.md §5.2). Apagada da 404 y ningún link del sitio lleva
 * acá.
 */
export default function SumateAlEquipoPage() {
  if (!cvAbierto()) notFound();
  return (
    <main id="contenido" tabIndex={-1}>
      <SumateAlEquipo />
    </main>
  );
}
