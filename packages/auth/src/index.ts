// La superficie pública de @ed/auth.
//
// Regla del paquete, igual que en @ed/db: **nada de dominio de ED adentro.**
// No importa el cliente generado de Prisma ni sabe qué tablas de contenido
// existen; recibe la base ya construida (AGENTS.md §3, la primera frontera).
//
// Lo que arma la sesión vive en `@ed/auth/servidor`: esto lo importan también
// el navegador y el proxy, que no pueden cargar un módulo nativo.

export { hayCookieDeSesion } from "./guarda";
export { crearClienteDeAuth } from "./cliente";
export type { ClienteDeAuth } from "./cliente";
export {
  ROLES,
  ROL_POR_DEFECTO,
  ROL_DE_LA_DIRECCION,
  PUEDE,
  QUE_PUEDE,
  QUE_PERMITE,
  SIN_PERMISO,
  esRol,
  esUnaSola,
  puede,
  quienPuede,
  segundoFactorObligatorio,
  LARGO_MINIMO_CONTRASENA,
} from "./permisos";
export type { Capacidad, Rol } from "./permisos";
export { queSePuede } from "./cuentas";
export type { CuentaObjetivo, EstadoDeCuenta, LoQueSePuede } from "./cuentas";
