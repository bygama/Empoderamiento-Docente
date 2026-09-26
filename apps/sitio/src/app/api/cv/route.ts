import { recibirCV } from "@/datos/formularios/cv";

// El formulario de /sumate-al-equipo manda acá (work/mensajes/SPEC.md §5.2).
// Con CV_ABIERTO apagado, 404. La ruta solo delega: validar, contar y
// guardar el archivo es de `datos/`.
export async function POST(pedido: Request): Promise<Response> {
  return recibirCV(pedido);
}
