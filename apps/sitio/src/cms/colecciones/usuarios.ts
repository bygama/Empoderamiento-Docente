import type { CollectionConfig } from "payload";
import { propioOAdministrador, soloAdministrador, soloAdministradorCampo } from "@/cms/acceso";
import { correoDeContrasena } from "@/cms/correos";
import { urlDelSitio } from "@/cms/url";

const UNA_HORA = 60 * 60 * 1000;
const QUINCE_MINUTOS = 15 * 60 * 1000;

// Quiénes entran al panel. No hay registro público: da de alta un
// administrador, y cada persona elige su contraseña por «olvidé mi
// contraseña» (spec §6).
export const Usuarios: CollectionConfig = {
  slug: "usuarios",
  labels: { singular: "Cuenta", plural: "Cuentas" },
  admin: {
    useAsTitle: "nombre",
    defaultColumns: ["nombre", "email", "rol"],
    group: "Panel",
    description: "Quiénes pueden entrar al panel. Las altas y bajas las hace quien administra.",
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: QUINCE_MINUTOS,
    forgotPassword: {
      expiration: UNA_HORA,
      generateEmailSubject: () => "Elegí una contraseña nueva para el panel de ED",
      // Payload pasa los argumentos como opcionales: se leen con cuidado.
      generateEmailHTML: (args) =>
        correoDeContrasena({
          enlace: `${urlDelSitio()}/admin/reset/${args?.token ?? ""}`,
          nombre: args?.user?.nombre,
        }),
    },
  },
  access: {
    create: soloAdministrador,
    read: propioOAdministrador,
    update: propioOAdministrador,
    delete: soloAdministrador,
  },
  fields: [
    { name: "nombre", type: "text", label: "Nombre", required: true },
    {
      name: "rol",
      type: "select",
      label: "Rol",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      options: [
        { label: "Administra (también da de alta usuarios)", value: "administrador" },
        { label: "Edita y publica contenido", value: "editor" },
      ],
      access: { update: soloAdministradorCampo },
      admin: { description: "Quien edita también publica: no hay paso de aprobación." },
    },
  ],
};
