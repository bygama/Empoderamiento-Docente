import type { Metadata } from "next";
import { connection } from "next/server";
import "../globals.css";
import { inter, manrope } from "@/config/fuentes/compartidas";

// El layout raíz del admin. Es el SEGUNDO layout raíz de la app —el otro es el
// del sitio—, y por eso `app/(sitio)/[...resto]` sigue existiendo: con dos
// raíces, Next no tiene una 404 global.

export const metadata: Metadata = {
  // Cada pantalla da solo su nombre y el template le suma el admin: «Páginas ·
  // Admin ED». Vale para las de acceso y para las protegidas (DESIGN.md §11).
  title: { template: "%s · Admin ED", default: "Admin ED" },
  // Cinturón y tiradores: el `X-Robots-Tag` del proxy es el que manda,
  // pero esto cubre el caso de que alguien sirva el HTML por otro camino.
  robots: { index: false, follow: false },
};

/**
 * **Todo el admin se renderiza en cada pedido**, también entrar, olvidé y
 * nueva contraseña, que no leen nada y Next prerenderizaría. La CSP del admin
 * lleva un nonce distinto en cada respuesta (proxy.ts), y una página
 * prerenderizada tiene sus scripts escritos de antes, sin ese nonce: la CSP
 * los bloquearía y la pantalla no hidrataría.
 */
export default async function LayoutDelAdmin({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full bg-gris-fondo text-azul-principal antialiased">{children}</body>
    </html>
  );
}
