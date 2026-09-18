// La superficie pública de @ed/auth.
//
// Regla del paquete, igual que en @ed/db: **nada de dominio de ED adentro.**
// No importa el cliente generado de Prisma ni sabe qué tablas de contenido
// existen; recibe la base ya construida (AGENTS.md §3, la primera frontera).

export { crearAuth } from "./config";
export { hayCookieDeSesion } from "./guarda";
export type { Auth, OpcionesDeAuth } from "./config";
export { ROLES, ROL_POR_DEFECTO, PUEDE, SIN_PERMISO, esRol } from "./permisos";
export type { Rol } from "./permisos";
