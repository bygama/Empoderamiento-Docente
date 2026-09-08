import type { Metadata } from "next";
import { QueHacemosHero } from "@/features/que-hacemos/components/QueHacemosHero";
import { QueHacemosHeroFaro } from "@/features/que-hacemos/components/QueHacemosHeroFaro";
import { AreasQueHacemos } from "@/features/que-hacemos/components/AreasQueHacemos";
import { NivelesEscala } from "@/features/que-hacemos/components/NivelesEscala";
import { MiradaPasos } from "@/features/que-hacemos/components/MiradaPasos";
import { ConQuienTrabajamos } from "@/features/que-hacemos/components/ConQuienTrabajamos";
import { CierreQueHacemos } from "@/features/que-hacemos/components/CierreQueHacemos";

export const metadata: Metadata = {
  title: "Qué hacemos",
  description:
    "Consultora especializada en la transformación del aprendizaje matemático: investigación, diseño de materiales didácticos, desarrollo profesional docente, acompañamiento, currículo y evaluación.",
};

// Orden nuevo (2026-09-08). Raquel y Daniela dijeron que la web se ve
// espectacular pero no se entiende qué hace ED: había tantas animaciones
// (faro, torre, camino) que el mensaje se perdía. La regla ahora es que el
// texto manda y la animación acompaña: Hero (la frase del cartel visible
// desde el primer segundo + escena del faro) → Áreas (las seis del cartel,
// en texto plano) → Niveles → Cómo trabajamos (los seis verbos de «La
// mirada ED», estáticos) → Con quién → Cierre. La torre de líneas y el
// camino horizontal salen de esta página (los componentes quedan para
// reubicarlos); «Nuestro enfoque» pasó a Quiénes somos, donde es manifiesto
// y no compite con la oferta.
export default function QueHacemosPage() {
  return (
    <main id="contenido" tabIndex={-1}>
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
        {/* Escena del faro por capas de profundidad (cámara scrubbed). Su
            CTA final («Ver las seis áreas») baja a #areas. */}
        <QueHacemosHeroFaro />
      </div>
      <AreasQueHacemos />
      <NivelesEscala />
      <MiradaPasos />
      <ConQuienTrabajamos />
      <CierreQueHacemos />
    </main>
  );
}
