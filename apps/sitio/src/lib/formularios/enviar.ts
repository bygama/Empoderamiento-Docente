// Lo que contesta un formulario público y cómo se le manda, del lado del
// navegador. La misma forma para todos: `{ ok: true }` o `{ ok: false, error }`
// con el problema en llano, listo para mostrar. No sabe de ED.

export type Respuesta = { ok: true } | { ok: false; error: string };

function esRespuesta(valor: unknown): valor is Respuesta {
  if (!valor || typeof valor !== "object") return false;
  const { ok, error } = valor as { ok?: unknown; error?: unknown };
  return ok === true || (ok === false && typeof error === "string");
}

/**
 * Manda el formulario y devuelve lo que contestó. Si no hubo respuesta (sin
 * conexión) o no se entendió, devuelve `sinRespuesta`: quien lo muestra dice
 * qué hacer en ese caso.
 */
export async function enviarFormulario(url: string, cuerpo: FormData | object, sinRespuesta: string): Promise<Respuesta> {
  try {
    const esFormData = cuerpo instanceof FormData;
    const r = await fetch(url, {
      method: "POST",
      headers: esFormData ? undefined : { "Content-Type": "application/json" },
      body: esFormData ? cuerpo : JSON.stringify(cuerpo),
    });
    const respuesta: unknown = await r.json();
    return esRespuesta(respuesta) ? respuesta : { ok: false, error: sinRespuesta };
  } catch {
    return { ok: false, error: sinRespuesta };
  }
}
