/**
 * Adónde ir después de entrar. Solo rutas del propio admin: un `volver`
 * absoluto sería un redirect abierto, y llega por la URL, así que no se confía
 * en él. Tampoco a «entrar» mismo (ni al código), que con sesión mandaría acá
 * otra vez. Lo usan los dos pasos de entrar: la contraseña y el código.
 */
export function destinoSeguro(volver: string | null): string {
  const delAdmin = volver !== null && (volver === "/admin" || volver.startsWith("/admin/")) && !volver.startsWith("//");
  return delAdmin && !volver.startsWith("/admin/entrar") ? volver : "/admin";
}
