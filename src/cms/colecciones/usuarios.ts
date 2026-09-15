import type { CollectionConfig } from "payload";

// Quiénes entran al panel. Esta versión solo alcanza para que Payload
// arranque; los roles, permisos y correos llegan en el paso siguiente.
export const Usuarios: CollectionConfig = {
  slug: "usuarios",
  labels: { singular: "Usuario", plural: "Usuarios" },
  auth: true,
  admin: { useAsTitle: "nombre" },
  fields: [{ name: "nombre", type: "text", label: "Nombre", required: true }],
};
