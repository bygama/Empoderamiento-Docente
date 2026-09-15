import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { conSesion, publico } from "@/cms/acceso";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Todas las imágenes del sitio (spec §5.1). Sin token de Blob se guardan en
// ./fotos-local (git-ignorado); con token, el plugin las manda a Vercel Blob
// y apaga el disco. Los tamaños los genera sharp al subir.
export const Fotos: CollectionConfig = {
  slug: "fotos",
  labels: { singular: "Foto", plural: "Fotos" },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "updatedAt"],
    group: "Contenido",
    description:
      "Las imágenes del sitio. El texto alternativo es obligatorio: lo leen los lectores de pantalla y los buscadores.",
  },
  access: { read: publico, create: conSesion, update: conSesion, delete: conSesion },
  upload: {
    staticDir: path.resolve(dirname, "../../../fotos-local"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
    focalPoint: true,
    crop: true,
    adminThumbnail: "miniatura",
    imageSizes: [
      { name: "miniatura", width: 400 },
      { name: "chica", width: 640 },
      { name: "media", width: 1280 },
      { name: "grande", width: 1920 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texto alternativo",
      required: true,
      maxLength: 200,
      admin: {
        description:
          "Qué se ve, en una frase. Ejemplo: «Docentes trabajando en grupo durante un taller de ED».",
      },
    },
  ],
};
