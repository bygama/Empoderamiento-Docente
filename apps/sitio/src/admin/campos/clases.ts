/**
 * La única caja de texto del admin: la usan el editor y las pantallas de
 * acceso (`armazon/Campos.tsx`, `CampoContrasena`). El borde es `gris-texto`
 * (4,83:1 sobre blanco; un control pide 3:1 y `azul-claro` daba 1,77:1), el
 * foco `azul-medio` y el error `rojo-error` (DESIGN.md §11). Sin margen: lo
 * pone quien la usa.
 */
export const ENTRADA =
  "w-full rounded-lg border border-gris-texto bg-white px-3 py-2 text-admin-cuerpo text-azul-principal outline-none transition-colors focus:border-azul-medio focus:ring-2 focus:ring-azul-medio/30 aria-invalid:border-rojo-error";
