// La cifra de «En números» como se escribe en el admin. Aparte del esquema a
// propósito: la lee también `DatosDuros`, que es un componente del navegador,
// y el esquema trae Zod, que no tiene que viajar en el JS del sitio.

// Un número entero, con puntos de miles o sin ellos, y lo que vaya antes o
// después: «+15», «+14.000», «500», «90%».
const CIFRA = /^(\D*)(\d[\d.]*)(\D*)$/;

/** «+14.000» → `{ prefijo: "+", valor: 14000, sufijo: "" }`, o `null` si no hay un número entero. */
export function partirCifra(cifra: string): { prefijo: string; valor: number; sufijo: string } | null {
  const partes = CIFRA.exec(cifra.trim());
  if (!partes) return null;
  const [, prefijo = "", numero = "", sufijo = ""] = partes;
  if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(numero)) return null;
  return { prefijo, valor: Number(numero.replaceAll(".", "")), sufijo };
}
