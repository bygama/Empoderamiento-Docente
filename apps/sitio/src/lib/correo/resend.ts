// Cliente de la API de correos de Resend, por `fetch` y sin su paquete: una
// sola llamada no justifica una dependencia. No sabe nada de ED: recibe la
// clave y el correo ya armado, y devuelve el id que le da Resend.
export const URL_DE_RESEND = "https://api.resend.com/emails";

/**
 * La URL a la que van los correos si no es la de Resend, o `null`. Otra URL
 * sirve solo para probar la imagen de producción con un Resend falso
 * (`compose.prueba.yaml`); quien la deje puesta tiene que enterarse.
 */
export function urlDesviada(url: string | undefined): string | null {
  return url && url !== URL_DE_RESEND ? url : null;
}

export type Correo = {
  de: string;
  para: string;
  asunto: string;
  html: string;
  texto: string;
  /**
   * La `Idempotency-Key`: el mismo valor para el mismo correo lógico. Si el
   * primer intento llegó a Resend pero la respuesta se perdió, el reintento
   * no manda un segundo correo.
   */
  idempotencia: string;
};

export class ErrorDeCorreo extends Error {
  constructor(
    /** El estado HTTP de Resend, o null si no hubo respuesta. */
    readonly estado: number | null,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeCorreo";
  }
}

export type ClienteDeCorreo = { mandar(correo: Correo): Promise<{ id: string }> };

/**
 * Lo que dijo Resend, sin nada de lo que le mandamos: el cuerpo lleva el
 * enlace de la contraseña, y un error termina en los logs.
 */
async function motivo(respuesta: Response): Promise<string> {
  const cuerpo = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
  const detalle = typeof cuerpo?.message === "string" ? `: ${cuerpo.message.slice(0, 200)}` : "";
  return `Resend respondió ${respuesta.status}${detalle}`;
}

export function crearClienteDeResend({
  clave,
  url = URL_DE_RESEND,
  fetchImpl = fetch,
  espera = 10_000,
}: {
  clave: string;
  /** Adónde se manda; la de Resend salvo en una prueba (`urlDesviada`). */
  url?: string;
  fetchImpl?: typeof fetch;
  /** Cuánto se espera cada intento, en milisegundos. */
  espera?: number;
}): ClienteDeCorreo {
  async function intentar(correo: Correo): Promise<Response | Error> {
    try {
      return await fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clave}`,
          "Content-Type": "application/json",
          "Idempotency-Key": correo.idempotencia,
        },
        body: JSON.stringify({ from: correo.de, to: [correo.para], subject: correo.asunto, html: correo.html, text: correo.texto }),
        signal: AbortSignal.timeout(espera),
      });
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }

  return {
    // Un reintento, y solo cuando no se sabe si el correo salió: sin
    // respuesta (timeout o red) o con un 5xx. Un 4xx es un pedido mal armado
    // o un límite, y repetirlo daría lo mismo.
    async mandar(correo) {
      for (let intento = 1; ; intento++) {
        const r = await intentar(correo);
        const ultimo = intento === 2;
        if (r instanceof Response) {
          if (r.ok) return { id: String(((await r.json()) as { id?: unknown }).id ?? "") };
          if (r.status < 500 || ultimo) throw new ErrorDeCorreo(r.status, await motivo(r));
        } else if (ultimo) {
          const sinRespuesta = r.name === "TimeoutError" ? `Resend no contestó en ${espera / 1000} s` : "No se pudo llegar a Resend";
          throw new ErrorDeCorreo(null, sinRespuesta);
        }
      }
    },
  };
}
