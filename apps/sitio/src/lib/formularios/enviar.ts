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
 * Un 4xx o 5xx del formulario trae el problema en llano, `{ ok: false, error }`,
 * y se muestra. Uno que no es suyo (el 413 de Vercel, una página de error) no
 * tiene esa forma: ahí va `sinRespuesta`.
 */
async function problemaDe(r: Response, sinRespuesta: string): Promise<Respuesta> {
  const cuerpo: unknown = await r.json().catch(() => null);
  return esRespuesta(cuerpo) && !cuerpo.ok ? cuerpo : { ok: false, error: sinRespuesta };
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
    if (!r.ok) return problemaDe(r, sinRespuesta);
    const respuesta: unknown = await r.json().catch(() => null);
    return esRespuesta(respuesta) ? respuesta : { ok: false, error: sinRespuesta };
  } catch {
    return { ok: false, error: sinRespuesta };
  }
}
