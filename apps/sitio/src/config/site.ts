// Lo de la marca: el nombre, la URL, la descripción y las frases pilares.
// Nunca hardcodear estos valores en JSX ni en metadata — importar de
// '@/config/site'.
//
// Los datos de contacto (correo, WhatsApp, dirección, países y redes) ya no
// viven acá: se editan en Ajustes › Datos del sitio, están en la tabla
// `datos_del_sitio` y el sitio los lee por `datosDelSitio()`
// (`datos/consultas/sitio.ts`), que los pasa por props.
//
// Reglas relacionadas:
// - AGENTS.md §5.3 (datos institucionales centralizados)
// - AGENTS.md §5.4 (logos de aliados — no se publican sin autorización)

export const siteConfig = {
  name: "Empoderamiento Docente",
  shortName: "ED",
  url: "https://empoderamientodocente.org",
  // La frase del cartel oficial (2026) más las seis áreas: es lo que ve
  // Google y lo que se comparte.
  description:
    "Consultora especializada en la transformación del aprendizaje matemático. Investigación, diseño de materiales didácticos, desarrollo profesional docente, acompañamiento, currículo y evaluación, en Chile, México, Argentina, Colombia y Brasil.",

  // Frases pilares que el sitio reusa verbatim (AGENTS.md §5.5).
  // No parafrasear sin chequear con docs/GLOSSARY.md.
  mensajesPilares: [
    "Generar escenarios de aprendizaje",
    "Potenciamos fortalezas, fortalecemos potencialidades",
    "Comunidad docente en torno a la Matemática Educativa",
    "Transformar la relación con las matemáticas es ampliar posibilidades",
    "Las matemáticas no son solo calcular",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
