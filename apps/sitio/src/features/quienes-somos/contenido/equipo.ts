import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";

// «Quiénes sostienen ED» de Quiénes somos: solo los textos propios de la
// sección. Las personas —nombre, rol, país, foto, nivel, orden y perfil— son
// el equipo, una entidad con su propio módulo: la tabla `equipo`, que se edita
// en Contenido › Equipo (work/equipo/).

const nivelConTitulo = (etiqueta: string) =>
  grupo(
    {
      volanta: textoCorto({ maximo: 30, etiqueta: "Volanta", ayuda: "Qué hace el grupo, arriba y en mayúsculas." }),
      titulo: textoCorto({ maximo: 50, etiqueta: "Título", ayuda: "Quiénes son: «Quienes lideran…»." }),
    },
    { etiqueta },
  );

export const esquemaEquipo = z.object({
  volanta: textoCorto({
    maximo: 30,
    etiqueta: "Volanta",
    ayuda: "El nombre de la sección. Hoy dice lo mismo que el botón del hero y que el menú: si la cambiás, revisá el botón.",
  }),
  titulo: textoCorto({ maximo: 40, etiqueta: "Título", ayuda: "Lo que va entre **dobles asteriscos** va en verde." }).refine(
    (texto) => resaltadoValido(texto, { exactamente: 1 }),
    resaltadoExacto(1),
  ),
  bajada: textoCorto({ maximo: 140, etiqueta: "Bajada" }),
  niveles: grupo(
    {
      direccionGeneral: textoCorto({ maximo: 30, etiqueta: "Dirección general", ayuda: "Arriba de la tarjeta del centro." }),
      direccion: textoCorto({ maximo: 30, etiqueta: "Dirección", ayuda: "Arriba de las tres tarjetas de la Dirección, debajo de la del centro." }),
      lideres: nivelConTitulo("Líderes de áreas y proyectos"),
      facilitacion: nivelConTitulo("Facilitación y materiales"),
    },
    {
      etiqueta: "Rótulos de los niveles",
      ayuda: "Solo los rótulos: quién va en cada nivel, su foto y su perfil se editan con el equipo, no acá.",
    },
  ),
});

export type EquipoDeQuienesSomos = z.infer<typeof esquemaEquipo>;

/** El contenido de hoy, tal cual está en el sitio. */
export const equipoInicial: EquipoDeQuienesSomos = {
  volanta: "Quiénes sostienen ED",
  titulo: "La red tiene **nombres**.",
  bajada: "Una red de especialistas, trayectorias y experiencias que hace posible el trabajo de ED.",
  niveles: {
    direccionGeneral: "Dirección general",
    direccion: "Dirección",
    lideres: { volanta: "Áreas y proyectos", titulo: "Quienes lideran áreas y proyectos" },
    facilitacion: { volanta: "Facilitación y materiales", titulo: "Quienes facilitan y diseñan" },
  },
};
