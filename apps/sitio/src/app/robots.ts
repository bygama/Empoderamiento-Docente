import type { MetadataRoute } from "next";

// El admin y su API no se indexan; el sitio, todo. Las tres rutas siguen
// listadas aunque hoy ninguna exista: `/admin` vuelve en la fase 1,
// `/vista-previa` en la 2 y `/api` en la 4 con los formularios de contacto y
// de CV (ADR-0005). Sacarlas para reponerlas sería churn.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
