import path from "node:path";

import type { NextConfig } from "next";

import { hostDelBlob } from "./src/lib/contenido/host-del-blob";

const raizDelWorkspace = path.join(__dirname, "..", "..");

// Las fotos que sube el admin, cuando hay token de Blob: solo las del store
// propio y su carpeta. Sin token van a disco y las sirve /api/fotos/<id>, del
// mismo origen, así que no entra ninguna imagen remota.
const hostDeFotos = hostDelBlob(process.env.BLOB_READ_WRITE_TOKEN);

const nextConfig: NextConfig = {
  // Fuera de Vercel, el build deja un servidor que corre solo
  // (`.next/standalone`): es lo que copia la imagen `app` del VPS (ADR-0018).
  // En Vercel no hace falta, y Vercel arma su propia salida.
  output: process.env.VERCEL ? undefined : "standalone",
  // El standalone sigue los imports desde la raíz del workspace, la misma que
  // Turbopack: los packages de `packages/` están ahí, no en apps/sitio.
  outputFileTracingRoot: raizDelWorkspace,
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
    root: raizDelWorkspace,
  },
  images: {
    remotePatterns: hostDeFotos ? [{ protocol: "https", hostname: hostDeFotos, pathname: "/fotos/**" }] : [],
  },
  experimental: {
    // Las fotos suben por una Server Action y Next capa el cuerpo en 1 MB
    // por defecto. 5 MB = los 4 MB del tope de la foto (lib/contenido/fotos.ts)
    // más el margen del multipart. Más que eso no tiene sentido: la foto no
    // pasa de 4 MB, y en Vercel el cuerpo de una función se corta en 4,5 MB
    // (en el VPS no hay ese corte). Este corte pasa ANTES de entrar a la
    // acción, por eso el navegador chequea el tamaño antes de mandar.
    serverActions: { bodySizeLimit: "5mb" },
  },
  async redirects() {
    return [
      // La sección vive en "/quienes-somos"; el slug viejo redirige al nuevo
      // para no romper links existentes a "/que-es-ed".
      { source: "/que-es-ed", destination: "/quienes-somos", permanent: false },
      // Páginas pasó a ser una pestaña de Contenido (work/patrones-del-admin/).
      // 308: un marcador o un link viejo al editor sigue llegando.
      { source: "/admin/paginas", destination: "/admin/contenido/paginas", permanent: true },
      { source: "/admin/paginas/:slug", destination: "/admin/contenido/paginas/:slug", permanent: true },
      // La URL conocida para cambiar la contraseña (W3C, «A Well-Known URL for
      // Changing Passwords»): los gestores de contraseñas llevan acá. La
      // única ruta en inglés del admin.
      { source: "/.well-known/change-password", destination: "/admin/mi-cuenta#contrasena", permanent: true },
    ];
  },
};

export default nextConfig;
