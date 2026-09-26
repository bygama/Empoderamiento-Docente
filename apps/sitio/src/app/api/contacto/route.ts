import { recibirContacto } from "@/datos/formularios/contacto";

// El formulario de Contacto del sitio manda acá (work/mensajes/SPEC.md §5.1).
// La ruta solo delega: validar, contar y guardar es de `datos/`.
export async function POST(pedido: Request): Promise<Response> {
  return recibirContacto(pedido);
}
