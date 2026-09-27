import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import { enlace } from "./comunes";

// «Áreas de especialización» de Inicio: el abanico de siete cartas. Acá vive
// lo propio de Inicio —el título, la bajada y el enlace—; las siete áreas
// son las de Qué hacemos, la única fuente, y se editan allá: esta sección
// las usa (`usa` en contenido/paginas.ts; SPEC §2 de
// work/paginas-que-hacemos-y-quienes-somos/). El número y el ícono de cada
// carta salen de su lugar en la lista: son estructura, no copy.

export const esquemaAreas = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  bajada: textoCorto({ maximo: 150, etiqueta: "Bajada" }),
  enlace: enlace({ maximo: 40, ayuda: "Aparece cuando termina de salir la última carta." }),
});

export type Areas = z.infer<typeof esquemaAreas>;

/** El contenido de hoy, tal cual está en el sitio. */
export const areasInicial: Areas = {
  titulo: "Áreas de especialización",
  bajada: "Los ámbitos desde los cuales diseñamos soluciones educativas fundamentadas en la investigación y construidas para cada realidad.",
  // Salida → Investigación, que es el archivo de casos: las áreas puestas en
  // práctica. El copy lo dice, si no el salto no se entendía (Gastón, 2026-09-11).
  enlace: { texto: "Mirá los casos donde lo aplicamos", ruta: "/investigacion" },
};
