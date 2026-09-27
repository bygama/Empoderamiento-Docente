import { z } from "zod";
import { foto, grupo, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";

// La apertura de Contacto: la columna de identidad al lado del selector de
// temas —la frase pilar y el equipo— y la línea que lleva al mail directo.
// Los temas no son de acá: el envío guarda su título en cada mensaje
// (DECISIONS de work/paginas-investigacion-y-resto/). Las caras del equipo y el
// «+8» son de la entidad Equipo.

export const esquemaApertura = z.object({
  frase: textoCorto({
    maximo: 80,
    etiqueta: "Frase",
    ayuda: "Una de las frases pilares de ED: se usa tal cual. La parte entre **dobles asteriscos** va en verde. Solo en pantallas anchas.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  equipo: grupo(
    {
      foto: foto({ etiqueta: "Foto" }),
      titulo: textoCorto({ maximo: 30, etiqueta: "Título", ayuda: "En verde, en el cartel sobre la foto." }),
      bajada: textoCorto({ maximo: 40, etiqueta: "Bajada", ayuda: "En un renglón, debajo del título." }),
      enCelular: textoCorto({
        maximo: 60,
        etiqueta: "En el celular",
        ayuda: "En el celular no va la foto: van las caras del equipo con este texto al lado.",
      }),
    },
    { etiqueta: "El equipo", ayuda: "La foto con su cartel, en pantallas anchas: la prueba de que del otro lado hay personas." },
  ),
  escribirDirecto: textoCorto({ maximo: 40, etiqueta: "Escribir directo", ayuda: "Al pie de los temas, arriba del mail." }),
});

export type Apertura = z.infer<typeof esquemaApertura>;

/** El contenido de hoy, tal cual está en el sitio. */
export const aperturaInicial: Apertura = {
  frase: "**Comunidad docente** en torno a la Matemática Educativa.",
  equipo: {
    foto: fotoDeRuta("/fotos/docentes-mesa-redonda.webp", "Docentes conversan alrededor de una mesa de trabajo"),
    titulo: "Del otro lado, personas",
    bajada: "Investigan y enseñan matemáticas",
    enCelular: "Del otro lado, personas que investigan y enseñan.",
  },
  escribirDirecto: "¿Preferís escribir directo?",
};
