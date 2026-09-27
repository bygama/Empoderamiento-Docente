import type { Cambio } from "@ed/kit-admin";
import type { CasoEnElFormulario } from "../formulario";

/** Lo que recibe cada bloque del formulario de un caso: lo que está en pantalla, cómo cambiarlo y el error de cada campo. */
export type PropsDeBloque = {
  form: CasoEnElFormulario;
  cambiar: <K extends keyof CasoEnElFormulario>(campo: K, cambio: Cambio<CasoEnElFormulario[K]>) => void;
  /** El error del último guardado en ese camino («evidencias.1.titulo»), si hay. */
  error: (camino: string) => string | undefined;
};
