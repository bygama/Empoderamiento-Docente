import type { Metadata } from "next";
import { QueHacemosHero } from "@/features/que-hacemos/components/QueHacemosHero";
import { QueHacemosHeroFaro } from "@/features/que-hacemos/components/QueHacemosHeroFaro";
import { EnfoqueTransformacion } from "@/features/que-hacemos/components/EnfoqueTransformacion";
import { CaminoDeTrabajo } from "@/features/que-hacemos/components/CaminoDeTrabajo";
import { TorreLineas } from "@/features/que-hacemos/components/TorreLineas";
import { NivelesEscala } from "@/features/que-hacemos/components/NivelesEscala";
import { ProyectosAplicaciones } from "@/features/que-hacemos/components/ProyectosAplicaciones";
import { CierreQueHacemos } from "@/features/que-hacemos/components/CierreQueHacemos";

export const metadata: Metadata = {
  title: "Qué hacemos",
  description:
    "Cómo trabaja Empoderamiento Docente: enfoque, camino de trabajo, líneas de acción, niveles de intervención y proyectos que transforman la matemática escolar.",
};

// Sitemap pág. 02 con un desvío pedido por el cliente: el recorrido (la
// torre de líneas) va INMEDIATAMENTE después del hero — el botón "Entrar" y
// el scroll natural caen ahí. El resto conserva el orden del sitemap:
// Enfoque → Cómo trabajamos → Niveles → Proyectos → Cierre.
export default function QueHacemosPage() {
  return (
    <main>
      {/* FONDO COMPARTIDO: el hero y la escena del faro son dos cielos
          nocturnos seguidos; con un fondo cada uno siempre quedaba una línea
          horizontal en la junta (igualar los colores no alcanza: el SVG del
          faro pinta su propio cielo y la cámara lo escala, así que el tono
          que asoma arriba cambia). Acá el degradado es UNO SOLO y lo pintan
          las dos: reproduce el cielo del hero en sus primeros 100svh y
          después sostiene el color de la noche. Ambas secciones van
          transparentes encima. */}
      <div
        className="relative"
        style={{
          background:
            // MONÓTONO: oscurece siempre, sin picos. Antes subía de tono
            // hasta azul-principal a los 72svh y recaía a la noche a los
            // 100svh; ese "sube y baja" se leía como una banda clara con un
            // borde marcado en el medio del cielo. Venía de imitar el
            // resplandor de horizonte que tenía el hero, que ya no existe.
            "linear-gradient(180deg, color-mix(in srgb, var(--color-azul-principal) 82%, #04060c) 0, color-mix(in srgb, var(--color-azul-principal) 62%, #04060c) 52svh, color-mix(in srgb, var(--color-azul-principal) 45%, black) 100svh)",
        }}
      >
        <QueHacemosHero />
        {/* Escena del faro por capas de profundidad (cámara scrubbed): entra
            justo antes del recorrido, como antesala de la torre. */}
        <QueHacemosHeroFaro />
      </div>
      {/* Ancla del CTA final del faro («Ver líneas de acción» → #lineas):
          el wrapper no altera el layout de la torre. */}
      <div id="lineas" className="scroll-mt-28">
        <TorreLineas />
      </div>
      <EnfoqueTransformacion />
      <CaminoDeTrabajo />
      <NivelesEscala />
      <ProyectosAplicaciones />
      <CierreQueHacemos />
    </main>
  );
}
