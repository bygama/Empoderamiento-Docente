import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Raíz explícita del proyecto: en un git worktree conviven dos
  // pnpm-workspace.yaml (repo y worktree) y Turbopack puede elegir el
  // equivocado — con raíz errada, el dev server responde 404 a todo.
  turbopack: {
    root: __dirname,
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
