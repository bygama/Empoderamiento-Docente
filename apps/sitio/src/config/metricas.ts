// Lo de ED en Métricas (work/metricas-completas/SPEC.md): los países que van
// siempre arriba, la hora en que se leen los días y las horas, los eventos
// que cuenta el sitio, dónde se comparte un link y cuánto dato hace falta
// para dibujar cada bloque. Lo que no sabe de ED vive en `lib/metricas/`.

/** Los países que van siempre arriba en Origen, en este orden: ISO alfa-2, como los da Vercel. */
export const PAISES_FIJOS = ["CL", "MX", "AR"] as const;
export type PaisFijo = (typeof PAISES_FIJOS)[number];

/**
 * La hora de ED, que tiene su dirección en Santiago: la usa la grilla de la
 * mejor hora para publicar y el resumen semanal para saber que es lunes. Una
 * sola constante, y la pantalla dice `NOMBRE_DE_LA_ZONA` donde muestra horas.
 */
export const ZONA_HORARIA = "America/Santiago";
export const NOMBRE_DE_LA_ZONA = "hora de Chile";

type DefinicionDeEvento = {
  /** Cómo se lee en el admin. */
  nombre: string;
  /** Si se guarda por dónde llegó la persona (el canal): el camino del CV y los contactos. */
  conCanal: boolean;
  /** Si lo puede contar el sitio por `POST /api/contar`. El clic de un link lo cuenta solo `/l/`. */
  publico: boolean;
};

/**
 * Los eventos que cuenta el sitio, cerrados: son raros a propósito, nunca
 * cada visita (eso lo cuenta Vercel). Se guardan como sumas por día en
 * `contadores`, sin nada de la persona.
 */
export const EVENTOS = {
  "cv-vio": { nombre: "Vio la página", conCanal: true, publico: true },
  "cv-empezo": { nombre: "Empezó el formulario", conCanal: true, publico: true },
  "cv-envio": { nombre: "Lo envió", conCanal: true, publico: true },
  "contacto-envio": { nombre: "Contactos enviados", conCanal: true, publico: true },
  "material-consultado": { nombre: "Materiales consultados", conCanal: false, publico: true },
  "enlace-clic": { nombre: "Clics en un link", conCanal: false, publico: false },
} as const satisfies Record<string, DefinicionDeEvento>;
export type Evento = keyof typeof EVENTOS;

export function esEventoPublico(valor: unknown): valor is Evento {
  return typeof valor === "string" && Object.hasOwn(EVENTOS, valor) && EVENTOS[valor as Evento].publico;
}

/** Dónde se comparte un link: su `utm_source` y cómo se lee. */
export const CANALES_DE_ENLACE = {
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  mail: "Mail",
  otro: "Otro",
} as const;
export type CanalDeEnlace = keyof typeof CANALES_DE_ENLACE;

export function esCanalDeEnlace(valor: unknown): valor is CanalDeEnlace {
  return typeof valor === "string" && Object.hasOwn(CANALES_DE_ENLACE, valor);
}

/**
 * Cuánto dato hace falta para dibujar cada bloque. Por debajo, el bloque dice
 * «Todavía no hay datos suficientes» en vez de un gráfico que engaña.
 */
export const MINIMOS = {
  /** Días con datos en el período, para la curva. */
  curva: 3,
  /** Visitas (o vistas) del período, para una lista: canales, países, referidos, dispositivos, páginas. */
  lista: 20,
  /** Vistas del período, para el cruce de página por país. */
  cruce: 20,
  /** Visitas del período, para la grilla de la mejor hora. */
  mejorHora: 200,
  /** «Vio la página» del período, para el camino del CV. */
  caminoDelCV: 10,
} as const;

/** Por debajo de esto, una cifra de Origen no se muestra: podría señalar a alguien. */
export const MENOS_DE = 3;

/** Hasta cuánto puede decir una marca de la curva: entra al lado de una fecha, en una línea. */
export const LARGO_DE_UNA_MARCA = 80;
