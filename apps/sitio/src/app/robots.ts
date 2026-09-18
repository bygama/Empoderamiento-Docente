import type { MetadataRoute } from "next";

// El admin y su API no se indexan; el sitio, todo. Las tres rutas siguen
// listadas aunque hoy no existan: vuelven con las fases 1 y 2 del ADR-0005, y
// sacarlas para reponerlas sería churn.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
