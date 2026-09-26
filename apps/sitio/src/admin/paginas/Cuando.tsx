import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDePagina } from "@/datos/consultas/editor-de-paginas";

/**
 * Quién tocó la página por última vez y cuándo, con las fechas en la zona de
 * quien mira. La dicen igual el encabezado del editor y la lista de Páginas.
 */
export function Cuando({ estado }: { estado: EstadoDePagina }) {
  if (estado.borradorEn) {
    return (
      <span>
        Borrador guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}.
      </span>
    );
  }
  if (estado.publicadoEn) {
    return (
      <span>
        Publicada el <Momento iso={estado.publicadoEn} />
        {estado.publicadoPor ? ` por ${estado.publicadoPor}` : ""}.
      </span>
    );
  }
  return <span>El sitio muestra el contenido inicial del código.</span>;
}
