import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Raíz explícita del workspace, dos niveles arriba: ahí viven el lockfile y
  // el pnpm-workspace.yaml, y desde ahí se resuelve `next` por symlink al
  // store de pnpm. Sin esto Turbopack toma apps/sitio como raíz, deja afuera
  // todo lo que está por encima —"files outside of the workspace root are not
  // compiled"— y el build muere con «Could not find the Next.js package».
  //
  // Va relativo a __dirname a propósito: en un git worktree conviven dos
  // workspaces, y así cada uno se queda con el suyo. Con la raíz equivocada,
  // el dev server responde 404 a todo.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  images: {
    // Las fotos que sube el admin viven en Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Las fotos suben por una Server Action y Next capa el cuerpo en 1 MB
    // por defecto. 5 MB = los 4 MB del tope de la foto (lib/contenido/fotos.ts)
    // más el margen del multipart. Más que eso no tiene sentido: Vercel corta
    // el cuerpo de una función en 4,5 MB. Este corte pasa ANTES de entrar a la
    // acción, por eso el navegador chequea el tamaño antes de mandar.
    serverActions: { bodySizeLimit: "5mb" },
  },
  async redirects() {
    return [
      // La sección vive en "/quienes-somos"; el slug viejo redirige al nuevo
      // para no romper links existentes a "/que-es-ed".
      { source: "/que-es-ed", destination: "/quienes-somos", permanent: false },
    ];
  },
};

export default nextConfig;
