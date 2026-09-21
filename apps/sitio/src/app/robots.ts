import type { MetadataRoute } from "next";
import { esUnPreviewDeVercel } from "@/lib/dominio";

// El admin y su API no se indexan; el sitio, todo. Las tres rutas siguen
// listadas aunque hoy ninguna exista: `/admin` vuelve en la fase 1,
// `/vista-previa` en la 2 y `/api` en la 4 con los formularios de contacto y
// de CV (ADR-0005). Sacarlas para reponerlas sería churn.
//
// Los previews de Vercel se cierran enteros: son URLs públicas con los
// mismos canonicals que apuntan al dominio real, y Google los indexaría con
// canonicals ajenos. Producción no cambia (work/primer-deploy).
export default function robots(): MetadataRoute.Robots {
  if (esUnPreviewDeVercel(process.env.VERCEL_ENV)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
