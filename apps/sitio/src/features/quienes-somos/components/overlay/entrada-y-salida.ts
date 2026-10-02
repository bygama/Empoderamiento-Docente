import { abrirLineal, cerrarLineal } from "./apertura-lineal";
import { abrirOverlay } from "./apertura-overlay";
import { cerrarOverlay, type RefsOverlay } from "./coreografia-overlay";

type Piezas = {
  /** El perfil lineal con motion (bajo `lg`): tiene su propia entrada y salida. */
  lineal: boolean;
  root: HTMLDialogElement | null;
  originEl: HTMLElement | null;
  reduced: boolean;
  immersive: boolean;
  refs: RefsOverlay;
};

/** La entrada que le toca al perfil; devuelve su limpieza. */
export function entrarAlPerfil({ lineal, fotoViaja, ...p }: Piezas & { fotoViaja: boolean }) {
  return lineal ? abrirLineal(p) : abrirOverlay({ ...p, fotoViaja });
}

/** La salida que le toca; llama a `alTerminar` cuando el diálogo ya cerró. */
export function salirDelPerfil({ lineal, alTerminar, ...p }: Piezas & { alTerminar: () => void }) {
  if (lineal) cerrarLineal({ ...p, alTerminar });
  else cerrarOverlay({ ...p, alTerminar });
}
