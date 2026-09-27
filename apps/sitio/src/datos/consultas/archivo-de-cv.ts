import { SIN_PERMISO, puede } from "@ed/auth";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { almacenDeCV } from "@/datos/formularios/cv";

// **La única salida del archivo de un CV** (work/mensajes/SPEC.md §3): el
// almacén es privado y ningún CV tiene URL pública. Esto verifica la sesión y
// `verCV` —una ruta no pasa por el layout ni por la guarda— y recién ahí
// manda el archivo, para bajar y sin guardarse en ningún caché.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// El proxy pone lo mismo en todo /admin y es el que gana (lib/seguridad/cabeceras.ts);
// va también acá por si esta ruta alguna vez no pasa por él.
const SIN_CACHE = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" };

function texto(estado: number, cuerpo: string): Response {
  return new Response(cuerpo, { status: estado, headers: { ...SIN_CACHE, "Content-Type": "text/plain; charset=utf-8" } });
}

/** «CV de Ana Pérez.pdf», con un nombre simple para los navegadores que no leen `filename*`. */
function disposicion(nombre: string): string {
  return `attachment; filename="CV.pdf"; filename*=UTF-8''${encodeURIComponent(`CV de ${nombre}.pdf`)}`;
}

export async function descargarCV(pedido: Request, id: string): Promise<Response> {
  const sesion = await auth.api.getSession({ headers: pedido.headers });
  if (!sesion) return texto(401, "Hay que entrar al admin para bajar un CV.");
  if (!puede(sesion.user.rol, "verCV")) return texto(403, SIN_PERMISO);
  if (!UUID.test(id)) return texto(404, "Ese CV no está.");
  const fila = await base.mensaje.findFirst({ where: { id, bandeja: "cv" }, select: { nombre: true, archivo: true } });
  const archivo = fila?.archivo ? await almacenDeCV().leer(fila.archivo) : null;
  if (!fila || !archivo) return texto(404, "Ese CV no está: puede que se haya borrado.");
  return new Response(archivo.stream, {
    headers: {
      ...SIN_CACHE,
      "Content-Type": "application/pdf",
      "Content-Length": String(archivo.bytes),
      "Content-Disposition": disposicion(fila.nombre),
    },
  });
}
