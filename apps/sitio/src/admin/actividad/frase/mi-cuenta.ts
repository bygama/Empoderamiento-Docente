import type { Frases } from "./comun";

export const DE_MI_CUENTA = {
  "cambio-su-contrasena": ({ quien }) => `${quien} cambió su contraseña`,
  "cambio-su-nombre": ({ quien }) => `${quien} cambió su nombre`,
  "activo-el-segundo-factor": ({ quien }) => `${quien} activó su segundo factor`,
  "desactivo-el-segundo-factor": ({ quien }) => `${quien} desactivó su segundo factor`,
} satisfies Frases;
