import type { Access, FieldAccess, PayloadRequest } from "payload";

// Dos roles y nada más (spec §6): administrador (todo, incluidos usuarios) y
// editor (contenido). Se lee del JWT (saveToJWT en el campo rol), sin ir a
// la base en cada chequeo.
type Rol = "administrador" | "editor";

function rolDe(req: PayloadRequest): Rol | undefined {
  const usuario = req.user as { rol?: Rol } | null;
  return usuario?.rol;
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
