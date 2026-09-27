// Para los tests del tope de los formularios: un pedido chunked, sin
// `Content-Length`, que entrega `partes` pedazos de 16 KB solo cuando se los
// piden, y cuenta cuántos le pidieron. Así un test prueba que el tope corta
// sin leer el cuerpo entero.

export const PEDAZO = 16 * 1024;

export function pedidoChunked(partes: number, url = "http://localhost/api/prueba", cabeceras: Record<string, string> = {}) {
  const contador = { pedidos: 0 };
  const cuerpo = new ReadableStream<Uint8Array>({
    pull(controlador) {
      if (contador.pedidos === partes) return controlador.close();
      contador.pedidos++;
      controlador.enqueue(new Uint8Array(PEDAZO).fill(0x61));
    },
  });
  // `duplex` lo pide Node para un cuerpo que es un stream; los tipos del DOM no lo traen.
  const pedido = new Request(url, { method: "POST", body: cuerpo, headers: cabeceras, duplex: "half" } as RequestInit);
  return { pedido, contador };
}
