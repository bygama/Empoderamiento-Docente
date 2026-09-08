// Configuración institucional canónica.
//
// Cualquier dato que aparezca en más de un componente (mail, dirección,
// dirección de ED, nombre de marca, países donde opera) vive acá. Nunca
// hardcodear estos valores en JSX ni en metadata — importar de
// '@/config/site'.
//
// Reglas relacionadas:
// - AGENTS.md §5.3 (datos institucionales centralizados)
// - AGENTS.md §5.4 (logos de aliados — no se publican sin autorización)
// - docs/GLOSSARY.md (Raquel Ayala — rol exacto pendiente)

export const siteConfig = {
  name: "Empoderamiento Docente",
  shortName: "ED",
  url: "https://empoderamientodocente.org",
  // La frase del cartel oficial (2026) más las seis áreas: es lo que ve
  // Google y lo que se comparte.
  description:
    "Consultora especializada en la transformación del aprendizaje matemático. Investigación, diseño de materiales didácticos, desarrollo profesional docente, acompañamiento, currículo y evaluación, en Chile, México, Argentina, Colombia y Brasil.",

  contacto: {
    email: "contacto@empoderamientodocente.org",
    // Número de WhatsApp en formato internacional sin signos (ej. 56912345678).
    // Sin número no se muestra ningún botón: no inventar (pendiente de Raquel).
    whatsapp: undefined as string | undefined,
    direccion: {
      calle: "Avenida Irarrázaval 2821",
      complemento: "Torre B, Oficina 527",
      ciudad: "Santiago",
      region: "Región Metropolitana",
      pais: "Chile",
      lineas: [
        "Avenida Irarrázaval 2821",
        "Torre B, Oficina 527",
        "Santiago, Región Metropolitana",
        "Chile",
      ],
    },
  },

  paises: ["Chile", "México", "Argentina", "Colombia", "Brasil"],

  // Personas destacadas en el sitio. El rol exacto de Raquel Ayala y su
  // vínculo con ED están pendientes de confirmar con el cliente — antes
  // de redactar copy que mencione el cargo, consultar (docs/GLOSSARY.md).
  direccion: {
    fundadora: {
      nombre: "Daniela Reyes-Gasperini",
      titulo: "Doctora en Matemática Educativa",
    },
    referente: {
      nombre: "Raquel Ayala",
      // titulo, rol y vínculo — pendiente de definir con el cliente.
    },
  },

  // Redes sociales — pendientes de confirmar con el cliente. Dejar el
  // bloque vacío hasta tener los handles oficiales. No inventar URLs.
  // El render condicional de ComunidadRedes y Footer las muestra cuando
  // se llenen.
  redes: {} as {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  },

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
