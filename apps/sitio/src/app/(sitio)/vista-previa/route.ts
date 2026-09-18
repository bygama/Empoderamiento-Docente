import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Solo rutas del propio sitio. Se parsea como lo haría un navegador (que
// trata "\" igual que "/") y se redirige a la ruta normalizada, nunca al
// texto crudo: así no hay forma de mandar a alguien afuera del sitio.
const BASE_FICTICIA = "http://vista-previa.local";

function rutaDelSitio(cruda: string): string | null {
  if (!cruda.startsWith("/")) return null;
  let url: URL;
  try {
    url = new URL(cruda, BASE_FICTICIA);
  } catch {
    return null;
  }
  if (url.origin !== BASE_FICTICIA) return null;
  const normalizada = `${url.pathname}${url.search}${url.hash}`;
  // Un "/a/..//evil" resuelve con el origen intacto pero deja el pathname en
  // "//evil", que suelto en un Location vuelve a ser una URL externa: la ruta
  // reconstruida tiene que pasar el mismo chequeo por sí sola.
  if (normalizada.startsWith("//") || new URL(normalizada, BASE_FICTICIA).origin !== BASE_FICTICIA) {
    return null;
  }
  return normalizada;
}

// El botón «Vista previa» del panel abre la página real acá: con el secreto
// y una sesión del panel, se prende el modo borrador (Next deja de servir la
// versión estática) y se redirige a la ruta pedida. Sin las dos cosas, nada.
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const ruta = rutaDelSitio(searchParams.get("ruta") ?? "");
  const secreto = searchParams.get("secreto");

  if (!process.env.VISTA_PREVIA_SECRET || secreto !== process.env.VISTA_PREVIA_SECRET) {
    return new Response("Vista previa no autorizada", { status: 403 });
  }
  if (!ruta) {
    return new Response("La ruta tiene que ser relativa al sitio", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const borrador = await draftMode();
  if (!user) {
    borrador.disable();
    return new Response("Hay que estar en el panel para ver la vista previa", { status: 403 });
  }

  borrador.enable();
  redirect(ruta);
}
