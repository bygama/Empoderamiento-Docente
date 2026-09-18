// Niveles en los que intervenimos — las ondas expansivas de Qué hacemos.
//
// Los 4 niveles de impacto del modelo conceptual + la red regional. El orden va
// de lo micro a lo macro: es el guion de la animación de anillos.
//
// Armados desde el brief y el modelo conceptual: PENDIENTES de validación fina
// con el cliente.
//
// Este archivo se llamaba `secciones.ts` y traía también los tambores de la
// torre, los diferenciales del enfoque y los pasos del camino de trabajo. Las
// tres escenas que los consumían se borraron el 2026-09-18 (ninguna ruta las
// renderizaba desde julio y septiembre); quedó esta, y el archivo toma su
// nombre. El contenido vive en el historial si hace falta volver a buscarlo.
export const NIVELES = [
  { k: "Docentes", d: "Confianza y decisiones didácticas fundamentadas." },
  { k: "Estudiantes", d: "Pensamiento matemático y uso funcional del saber." },
  { k: "Escuelas", d: "Prácticas innovadoras y cultura de mejora continua." },
  { k: "Sistemas educativos", d: "Políticas y decisiones basadas en evidencia." },
  {
    k: "Redes en cinco países",
    d: "Comunidades e instituciones de América Latina.",
  },
] as const;
