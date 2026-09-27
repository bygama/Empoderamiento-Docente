import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// «Investigación en acción»: el archivo de expedientes. Las carpetas son los
// casos, una entidad con su propio módulo (lane 9 del mapa del admin): de la
// sección, acá solo su título (SPEC §2).

export const esquemaEnAccion = z.object({
  titulo: textoCorto({
    maximo: 30,
    etiqueta: "Título",
    ayuda: "Llega grande al centro y se achica hasta su esquina antes de la pila. Las carpetas son los casos, que se cargan aparte.",
  }),
});

export type EnAccion = z.infer<typeof esquemaEnAccion>;

/** El contenido de hoy, tal cual está en el sitio. */
export const enAccionInicial: EnAccion = { titulo: "Casos de investigación" };
