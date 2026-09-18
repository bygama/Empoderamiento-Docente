import { notFound } from "next/navigation";

// Con el panel adentro de la app hay dos layouts raíz, y Next ya no tiene
// una 404 global: cualquier URL sin ruta cae acá y sigue a la 404 del sitio.
export default function RutaInexistente() {
  notFound();
}
