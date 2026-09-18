import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { es } from "@payloadcms/translations/languages/es";
import sharp from "sharp";
import { Fotos } from "@/cms/colecciones/fotos";
import { Usuarios } from "@/cms/colecciones/usuarios";
import { urlDeLaBase } from "@/cms/base";
import { urlDelSitio } from "@/cms/url";
import { exigirVariablesEnVercel } from "@/cms/entorno";

exigirVariablesEnVercel();

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Sin clave de Resend (local, previews sin dominio) los correos se imprimen
// en la consola del server; con clave salen de verdad.
const correo = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress: "panel@empoderamientodocente.org",
      defaultFromName: "Panel de Empoderamiento Docente",
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined;

export default buildConfig({
  serverURL: urlDelSitio(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Panel ED" },
    dateFormat: "dd/MM/yyyy HH:mm",
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: "es" },
  collections: [Usuarios, Fotos],
  upload: { limits: { fileSize: 8 * 1024 * 1024 } },
  db: postgresAdapter({
    pool: { connectionString: urlDeLaBase() },
    migrationDir: path.resolve(dirname, "cms/migraciones"),
  }),
  email: correo,
  sharp,
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { fotos: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
});
