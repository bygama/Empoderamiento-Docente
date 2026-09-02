import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Raíz explícita del proyecto: en un git worktree conviven dos
  // pnpm-workspace.yaml (repo y worktree) y Turbopack puede elegir el
  // equivocado — con raíz errada, el dev server responde 404 a todo.
  turbopack: {
    root: __dirname,
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
