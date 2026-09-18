import { notFound } from "next/navigation";

// La 404 del sitio vive dentro del route group `(sitio)`, así que no es la
// global de Next: cualquier URL sin ruta cae acá y sigue hasta ella.
export default function RutaInexistente() {
  notFound();
}
