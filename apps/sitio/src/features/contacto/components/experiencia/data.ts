import { Compass, Lightbulb, School, TrendingUp, Users } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

export const TEMAS = [
  {
    key: "formacion",
    titulo: "Formación y acompañamiento",
    detalle: "Trayectos, asesorías y trabajo con escuelas.",
    Icon: Users,
  },
  {
    key: "investigacion",
    titulo: "Investigación",
    detalle: "Líneas de estudio y colaboración académica.",
    Icon: Lightbulb,
  },
  {
    key: "alianzas",
    titulo: "Alianzas institucionales",
    detalle: "Convenios con organizaciones y gobiernos.",
    Icon: School,
  },
  {
    key: "prensa",
    titulo: "Prensa y difusión",
    detalle: "Entrevistas, notas y comunicación.",
    Icon: TrendingUp,
  },
  {
    key: "otra",
    titulo: "Otra consulta",
    detalle: "Todo lo que no entra en las anteriores.",
    Icon: Compass,
  },
] as const;

export type Tema = (typeof TEMAS)[number];
export type TemaKey = Tema["key"];
export type Vista = "hero" | "apertura" | "formulario" | "cierre";

// "Del otro lado hay personas": caras REALES del equipo (mismas fotos que la
// página de equipo), no un claim abstracto. Cuatro alcanzan para la fila de
// avatares del cartel; el resto lo dice el "+8".
export const EQUIPO_FOTOS = [
  "/equipo/gabriela-buendia.jpg",
  "/equipo/ivan-perez.jpg",
  "/equipo/daniela-reyes.jpg",
  "/equipo/karla-gomez.jpg",
];
export const EQUIPO_RESTO = 8;

// Un solo titular para toda la experiencia: nace gigante en el hero y aterriza
// como encabezado del selector. No hay un segundo titular.
export const TITULO = "Hablemos.";

// Segunda puerta del contacto: sumarse al equipo. Sin upload (todavía no hay
// backend), el mailto precarga asunto y un cuerpo-plantilla que recuerda
// adjuntar el CV.
export const MAILTO_CV = `mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent(
  "[CV] Quiero sumarme al equipo",
)}&body=${encodeURIComponent(
  "Hola, me gustaría sumarme a Empoderamiento Docente.\n\n(Acordate de adjuntar tu CV.)\n\nNombre:\nÁrea (docencia / investigación / otra):\nPor qué me interesa:\n",
)}`;
