import type { ComponentType } from "react";
import {
  BookOpen,
  Compass,
  Lightbulb,
  School,
  Target,
  TrendingUp,
  Users,
  type IconProps,
} from "@/components/ui/icons";

export type Area = {
  n: string;
  titulo: string;
  frase: string;
  /** El copy tal cual, con la idea clave aparte para ir en negrita. */
  detalle: { antes: string; clave: string; despues: string };
  Icon: ComponentType<IconProps>;
};

// Las 7 áreas de especialización de ED. Copy oficial del cliente
// [[ed-copy-oficial]]: `frase` = la línea destacada (verde); `detalle` = la
// descripción. Frases sin punto final (queda más limpio en la carta); los
// párrafos descriptivos sí lo llevan. En cada detalle va en negrita UNA sola
// idea: la que distingue al área (Gastón, 2026-09-14). Si se cambia el copy,
// que la clave siga siendo una frase del texto, no una palabra suelta.
export const AREAS: readonly Area[] = [
  {
    n: "01",
    titulo: "Desarrollo profesional docente",
    frase: "La experiencia como fuente de reflexión",
    detalle: {
      antes: "Impulsamos procesos de desarrollo profesional con ",
      clave: "sustento vivencial y acompañamiento",
      despues:
        " que fortalecen la práctica, promueven la reflexión y resignifican las matemáticas.",
    },
    Icon: Users,
  },
  {
    n: "02",
    titulo: "Materiales para la resignificación de las matemáticas",
    frase: "Cada tarea puede transformar la relación con las matemáticas",
    detalle: {
      antes:
        "Diseñamos materiales que median la relación entre docentes, matemáticas y aprendizaje, generando ",
      clave: "rupturas productivas",
      despues: " que invitan a explorar, argumentar y resignificar.",
    },
    Icon: Lightbulb,
  },
  {
    n: "03",
    titulo: "Currículo y arquitectura pedagógica",
    frase: "La coherencia hace posible el aprendizaje",
    detalle: {
      antes: "Diseñamos arquitecturas curriculares que articulan ",
      clave: "conocimiento, progresión y sentido",
      despues: " para orientar trayectorias de aprendizaje.",
    },
    Icon: Compass,
  },
  {
    n: "04",
    titulo: "Evaluación para la mejora educativa",
    frase: "Comprender permite decidir",
    detalle: {
      antes: "Desarrollamos sistemas de evaluación que generan ",
      clave: "evidencia situada",
      despues:
        " para comprender los aprendizajes y orientar decisiones educativas.",
    },
    Icon: TrendingUp,
  },
  {
    n: "05",
    titulo: "Investigación en Matemática Educativa",
    frase: "La práctica produce conocimiento",
    detalle: {
      antes: "Investigamos ",
      clave: "las prácticas educativas",
      despues:
        " para producir conocimiento, compartirlo con la comunidad científica y seguir enriqueciendo el campo de la Matemática Educativa.",
    },
    Icon: BookOpen,
  },
  {
    n: "06",
    titulo: "Fortalecimiento institucional",
    frase: "La continuidad hace posible las transformaciones",
    detalle: {
      antes: "Fortalecemos ",
      clave: "capacidades institucionales",
      despues:
        " mediante el diseño de políticas, estrategias y procesos que favorecen transformaciones coherentes, sostenibles y perdurables.",
    },
    Icon: School,
  },
  {
    n: "07",
    titulo: "Transformación de sistemas educativos",
    frase: "La articulación hace posible las transformaciones sistémicas",
    detalle: {
      antes: "Integramos ",
      clave: "todas las dimensiones del cambio educativo",
      despues:
        " para construir soluciones coherentes, sostenibles y pertinentes para cada realidad.",
    },
    Icon: Target,
  },
];
