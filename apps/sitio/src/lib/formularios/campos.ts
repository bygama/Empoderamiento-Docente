import { z } from "zod";

// Un formulario descripto como una lista de campos: de la misma lista salen
// los controles, el esquema que valida el envío y lo que se guarda. No sabe de
// ED: la lista la escribe quien la usa (`config/cv.ts`).

export type TipoDeCampo = "texto" | "correo" | "opcion" | "parrafo";

export type CampoDeFormulario = {
  /** El `name` del control y la clave en lo que llega. */
  clave: string;
  /** Cómo se rotula, y cómo se lee después en lo guardado. */
  etiqueta: string;
  tipo: TipoDeCampo;
  obligatorio: boolean;
  /** El máximo de caracteres. Sin él: 200, o 5000 en un párrafo. */
  largo?: number;
  /** Las opciones de un campo `opcion`, en el orden en que se muestran. */
  opciones?: readonly string[];
  /** El `autocomplete` del control. */
  autocompletar?: string;
};

const LARGO_POR_DEFECTO = 200;
const LARGO_DE_PARRAFO = 5000;
const LARGO_DE_CORREO = 254;

function largoDe(campo: CampoDeFormulario): number {
  if (campo.largo) return campo.largo;
  if (campo.tipo === "correo") return LARGO_DE_CORREO;
  return campo.tipo === "parrafo" ? LARGO_DE_PARRAFO : LARGO_POR_DEFECTO;
}

function esquemaDelCampo(campo: CampoDeFormulario): z.ZodType<string> {
  const { etiqueta, obligatorio, tipo } = campo;
  if (tipo === "opcion") {
    const opciones = z.enum(campo.opciones ?? [], { error: `Elegí una opción de «${etiqueta}».` });
    return obligatorio ? opciones : z.union([z.literal(""), opciones]);
  }
  const largo = largoDe(campo);
  const texto = z.string().trim().max(largo, `«${etiqueta}» puede tener hasta ${largo} caracteres.`);
  const lleno = obligatorio ? texto.min(1, `Completá «${etiqueta}».`) : texto;
  if (tipo !== "correo") return lleno;
  const correo = z.email({ error: `Revisá «${etiqueta}»: no parece un correo.` });
  return lleno.pipe(obligatorio ? correo : z.union([z.literal(""), correo]));
}

/** El esquema de lo que llega: un string por campo, sin espacios de más, y nada que la lista no nombre. */
export function esquemaDe(campos: readonly CampoDeFormulario[]) {
  return z.object(Object.fromEntries(campos.map((c) => [c.clave, esquemaDelCampo(c)])));
}

/**
 * Lo que llegó, leído de un `FormData` o de un objeto: un string por campo de
 * la lista, y "" si no vino. Así el esquema recibe siempre la misma forma.
 */
export function valoresDe(campos: readonly CampoDeFormulario[], entrada: FormData | Record<string, unknown>): Record<string, unknown> {
  const leer = (clave: string) => (entrada instanceof FormData ? entrada.get(clave) : entrada[clave]);
  return Object.fromEntries(campos.map((c) => [c.clave, leer(c.clave) ?? ""]));
}

export type Dato = { etiqueta: string; valor: string };

/**
 * Lo que se guarda aparte de las columnas propias, en el orden de la lista y
 * con la etiqueta de hoy: así lo guardado se sigue leyendo aunque la lista
 * cambie. Los campos vacíos no se guardan.
 */
export function datosDe(campos: readonly CampoDeFormulario[], valores: Record<string, string>, columnas: readonly string[]): Dato[] {
  const propias = new Set(columnas);
  return campos
    .filter((c) => !propias.has(c.clave) && valores[c.clave])
    .map((c) => ({ etiqueta: c.etiqueta, valor: valores[c.clave] }));
}
