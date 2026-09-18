import type { Access, FieldAccess, PayloadRequest } from "payload";

// Dos roles y nada más (spec §6): administrador (todo, incluidos usuarios) y
// editor (contenido). Se lee del JWT (saveToJWT en el campo rol), sin ir a
// la base en cada chequeo. El tipo de "rol" sale de Usuario (payload-types.ts),
// generado por Payload: no hace falta nombrarlo acá.
function rolDe(req: PayloadRequest) {
  return req.user?.rol ?? undefined;
}

export const soloAdministrador: Access = ({ req }) => rolDe(req) === "administrador";

export const soloAdministradorCampo: FieldAccess = ({ req }) => rolDe(req) === "administrador";

export const conSesion: Access = ({ req }) => Boolean(req.user);

export const publico: Access = () => true;

// Cada quien ve y edita su propio usuario; quien administra, todos.
export const propioOAdministrador: Access = ({ req }) => {
  if (!req.user) return false;
  if (rolDe(req) === "administrador") return true;
  return { id: { equals: req.user.id } };
};
