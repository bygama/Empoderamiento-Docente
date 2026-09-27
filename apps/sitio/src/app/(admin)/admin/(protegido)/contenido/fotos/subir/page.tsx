import type { Metadata } from "next";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { SubirALaBiblioteca } from "@/admin/fotos/SubirALaBiblioteca";

export const metadata: Metadata = { title: "Subir una foto" };

// La subida corre en la función de esta página: una foto de 4 MB a Blob puede tardar más que el default.
export const maxDuration = 60;

// Subir una foto a la biblioteca, sin usarla todavía (SPEC §7.3). Como
// «Nueva novedad», una pantalla propia: la grilla queda como está.
export default function SubirFoto() {
  return (
    <div className="space-y-8">
      <Encabezado
        volver={{ href: "/admin/contenido/fotos", etiqueta: "Fotos" }}
        titulo="Subir una foto"
        detalle="Queda en la biblioteca, lista para elegir desde el campo de foto de cualquier formulario."
      />
      <SubirALaBiblioteca />
    </div>
  );
}
