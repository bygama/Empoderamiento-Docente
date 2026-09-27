// El cuerpo de un pedido a un formulario público, leído con un tope propio.
// No sabe de ED.

/**
 * El cuerpo, cortado apenas pasa `maximo`: el resto no se lee. **No le cree a
 * `Content-Length`**: si la cabecera ya dice que se pasa, frena antes de leer,
 * pero un cuerpo chunked no la trae y quien manda la puede mentir, y `json()`
 * o `formData()` sin tope leen lo que venga. En Vercel la plataforma corta en
 * 4,5 MB, pero la regla no puede depender de dónde corre. `null` si se pasó.
 */
export async function leerConTope(pedido: Request, maximo: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (Number(pedido.headers.get("content-length")) > maximo) return null;
  if (!pedido.body) return new Uint8Array();
  let leidos = 0;
  let pasado = false;
  // Al fallar el tope, `pipeThrough` cancela la fuente: lo que falta ni se pide.
  const tope = new TransformStream<Uint8Array, Uint8Array>({
    transform(parte, controlador) {
      leidos += parte.byteLength;
      if (leidos <= maximo) return controlador.enqueue(parte);
      pasado = true;
      controlador.error(new Error(`El cuerpo pasa los ${maximo} bytes.`));
    },
  });
  try {
    return new Uint8Array(await new Response(pedido.body.pipeThrough(tope)).arrayBuffer());
  } catch (e) {
    if (pasado) return null;
    throw e;
  }
}

/** Los bytes como JSON, o `null` si no lo son. */
export function comoJson(bytes: Uint8Array): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/** Los bytes como el `FormData` de un multipart con ese `Content-Type`, o `null` si no lo son. */
export async function comoFormData(bytes: Uint8Array<ArrayBuffer>, tipo: string | null): Promise<FormData | null> {
  return new Response(bytes, { headers: { "Content-Type": tipo ?? "" } }).formData().catch(() => null);
}
