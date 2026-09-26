// Un PDF se reconoce por sus bytes, no por su nombre ni por el tipo que dice
// el navegador: los dos los elige quien manda. Todo PDF empieza por «%PDF-».
const FIRMA = [0x25, 0x50, 0x44, 0x46, 0x2d];

export function esPdf(bytes: Uint8Array): boolean {
  return bytes.length > FIRMA.length && FIRMA.every((b, i) => bytes[i] === b);
}
