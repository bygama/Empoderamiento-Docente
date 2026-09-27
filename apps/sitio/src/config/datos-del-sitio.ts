import { z } from "zod";

// Los datos institucionales que se editan en Ajustes › Datos del sitio
// (work/ajustes/SPEC.md §2.2 y §3): viven en la tabla `datos_del_sitio` y el
// sitio los lee por `datos/consultas/sitio.ts`. Acá están su forma, el esquema
// que los valida al guardar y al leer, y los valores iniciales.

/** Una URL `https` de esa red (o de un subdominio suyo, como `www.`). */
function esUrlDe(valor: string, dominio: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && (url.hostname === dominio || url.hostname.endsWith(`.${dominio}`));
  } catch {
    return false;
  }
}

/** Un texto que puede faltar: vacío o null, queda null. */
const opcional = (largo: number, nombre: string) =>
  z
    .string()
    .trim()
    .max(largo, `«${nombre}» puede tener hasta ${largo} caracteres.`)
    .nullable()
    .transform((v) => v || null);

const obligatorio = (largo: number, nombre: string) =>
  z.string().trim().min(1, `Completá «${nombre}».`).max(largo, `«${nombre}» puede tener hasta ${largo} caracteres.`);

const red = (dominio: string, nombre: string) =>
  opcional(300, nombre).refine((v) => v === null || esUrlDe(v, dominio), `La URL de ${nombre} tiene que empezar con https:// y ser de ${dominio}.`);

/** El número de WhatsApp: se aceptan espacios, guiones, paréntesis y el «+», y se guardan solo los dígitos. */
const whatsapp = z
  .string()
  .nullable()
  .transform((v) => (v ?? "").replace(/[\s()+-]/g, "") || null)
  .refine((v) => v === null || /^\d{8,15}$/.test(v), "El WhatsApp va con el código de país y solo números: 56912345678.");

const pais = z.string().trim().min(2, "Cada país tiene que tener al menos 2 letras.").max(40, "Cada país puede tener hasta 40 caracteres.");

export const esquemaDeDatosDelSitio = z.object({
  correo: z.string().trim().pipe(z.email({ error: "Revisá el correo: no parece un correo." })),
  whatsapp,
  direccion: z.object({
    calle: obligatorio(120, "Calle y número"),
    complemento: opcional(120, "Piso u oficina"),
    ciudad: obligatorio(80, "Ciudad"),
    region: opcional(80, "Región"),
    pais: obligatorio(60, "País"),
  }),
  paises: z
    .array(pais)
    .min(1, "Poné al menos un país.")
    .max(10, "Pueden ser hasta 10 países.")
    .refine((lista) => new Set(lista.map((p) => p.toLocaleLowerCase("es"))).size === lista.length, "Hay un país repetido."),
  redes: z.object({
    instagram: red("instagram.com", "Instagram"),
    facebook: red("facebook.com", "Facebook"),
    linkedin: red("linkedin.com", "LinkedIn"),
  }),
});

export type DatosDelSitio = z.output<typeof esquemaDeDatosDelSitio>;
export type Redes = DatosDelSitio["redes"];
export type DireccionDelSitio = DatosDelSitio["direccion"];
/** Lo que usa Contacto: el correo, el WhatsApp, la oficina y los países del formulario. */
export type ContactoDelSitio = Pick<DatosDelSitio, "correo" | "whatsapp" | "direccion" | "paises">;

/**
 * Los datos con que arrancó la tabla (la migración `datos_del_sitio` cargó
 * estos mismos). **Son el respaldo, no la fuente:** los usa
 * `datos/consultas/sitio.ts` solo cuando no hay base (un build sin
 * `DATABASE_URL`) o la consulta tira en una visita. Nada del sitio los
 * importa directo: lo que se muestra sale de `datosDelSitio()`.
 */
export const DATOS_INICIALES: DatosDelSitio = {
  correo: "contacto@empoderamientodocente.org",
  whatsapp: null,
  direccion: {
    calle: "Avenida Irarrázaval 2821",
    complemento: "Torre B, Oficina 527",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    pais: "Chile",
  },
  paises: ["Chile", "México", "Argentina", "Colombia", "Brasil"],
  redes: {
    instagram: "https://www.instagram.com/empoderamientodocente/",
    facebook: "https://www.facebook.com/profile.php?id=100068726124781",
    linkedin: null,
  },
};
