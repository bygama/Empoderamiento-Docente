import type { Metadata } from "next";
import { notFound } from "next/navigation";

// El título lo pone la página y no `not-found.tsx`, donde Next no lo aplica.
export const metadata: Metadata = { title: "No encontrada" };

// La 404 del admin vive dentro del route group `(protegido)`, así que no es la
// global de Next (con dos layouts raíz no hay una): cualquier URL bajo /admin
// sin ruta cae acá y sigue hasta `not-found.tsx`, con el armazón. Y como el
// layout protegido corre antes, sin sesión esto no se llega a ver: redirige a
// entrar, y una URL inventada no le cuenta nada del admin a quien no entró.
export default function RutaInexistente() {
  notFound();
}
