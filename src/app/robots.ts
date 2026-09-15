import type { MetadataRoute } from "next";

// El panel y su API no se indexan (spec §6). El sitio, todo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/vista-previa"] }],
  };
}
