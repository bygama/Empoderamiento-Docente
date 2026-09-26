/**
 * «daniela@gmail.com» → «d•••@gmail.com»: para decir adónde se mandó algo sin
 * escribir el correo entero, que viaja en la URL de la pantalla del código.
 * Si no parece un correo, «tu correo».
 */
export function enmascararCorreo(correo: string): string {
  const limpio = correo.trim();
  const arroba = limpio.lastIndexOf("@");
  if (arroba < 1 || arroba === limpio.length - 1) return "tu correo";
  return `${limpio[0]}•••${limpio.slice(arroba)}`;
}
