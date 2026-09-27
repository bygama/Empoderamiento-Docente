import type { Metadata, ResolvingMetadata } from "next";
import { cvAbierto } from "@/config/cv";
import { openGraphDeLaPagina } from "@/config/metadata";
import { contenidoDe } from "@/datos/consultas/paginas";
import { datosDelSitio } from "@/datos/consultas/sitio";
import { ContactoExperiencia } from "@/features/contacto/components/ContactoExperiencia";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del admin.
// Sin imagen propia, la del sitio, que se hereda del layout.
export async function generateMetadata(_: unknown, padre: ResolvingMetadata): Promise<Metadata> {
  const { seo } = await contenidoDe("contacto");
  return metadataDeSeo(seo, await openGraphDeLaPagina(padre));
}

/**
 * Contacto NO es una página de scroll: es una experiencia de UNA pantalla
 * donde los estados del recorrido del sitemap (apertura → formulario →
 * cierre) se transforman uno en otro. Los canales secundarios viven en la
 * barra fija de abajo. Todo dentro de ContactoExperiencia. «Sumate al equipo»
 * lleva a /sumate-al-equipo solo con el CV encendido; si no, al correo. El
 * correo, el WhatsApp, la oficina y los países salen de Ajustes › Datos del
 * sitio.
 */
export default async function ContactoPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const [{ titular, apertura, cierre }, { correo, whatsapp, direccion, paises }] = await Promise.all([contenidoDe("contacto"), datosDelSitio()]);
  return (
    <main id="contenido" tabIndex={-1}>
      <ContactoExperiencia
        cvAbierto={cvAbierto()}
        titular={titular}
        apertura={apertura}
        cierre={cierre}
        contacto={{ correo, whatsapp, direccion, paises }}
      />
    </main>
  );
}
