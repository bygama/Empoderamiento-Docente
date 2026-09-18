import path from "node:path";

import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Raíz explícita del workspace, dos niveles arriba: ahí viven el lockfile y
  // el pnpm-workspace.yaml, y desde ahí se resuelven por symlink al store de
  // pnpm tanto `next` como `payload`. Sin esto Turbopack toma apps/sitio como
  // raíz, deja afuera todo lo que está por encima —"files outside of the
  // workspace root are not compiled"— y el build muere con «Could not find
  // the Next.js package».
  //
  // Va relativo a __dirname a propósito: en un git worktree conviven dos
  // workspaces, y así cada uno se queda con el suyo. Con la raíz equivocada,
  // el dev server responde 404 a todo.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  images: {
    // Las fotos del panel viven en Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      // La sección vive en "/quienes-somos"; el slug viejo redirige al nuevo
      // para no romper links existentes a "/que-es-ed".
      { source: "/que-es-ed", destination: "/quienes-somos", permanent: false },
    ];
  },
};

// Payload es ESM puro y Next compila este archivo a CommonJS: funciona porque
// Node 22.12+ puede hacer require() de un módulo ESM. Si alguna vez falla con
// «require() of ES Module not supported», renombrar a next.config.mjs.
export default withPayload(nextConfig);
