import type { Metadata } from "next";
import { cvAbierto } from "@/config/cv";
import { contenidoDe } from "@/datos/consultas/paginas";
import { ContactoExperiencia } from "@/features/contacto/components/ContactoExperiencia";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Iniciá una conversación con Empoderamiento Docente: consultas profesionales, propuestas de formación, investigación y alianzas institucionales.",
};

/**
 * Contacto NO es una página de scroll: es una experiencia de UNA pantalla
 * donde los estados del recorrido del sitemap (apertura → formulario →
 * cierre) se transforman uno en otro. Los canales secundarios viven en la
 * barra fija de abajo. Todo dentro de ContactoExperiencia. «Sumate al equipo»
 * lleva a /sumate-al-equipo solo con el CV encendido; si no, al correo.
 */
export default async function ContactoPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const { titular, apertura } = await contenidoDe("contacto");
  return (
    <main id="contenido" tabIndex={-1}>
      <ContactoExperiencia cvAbierto={cvAbierto()} titular={titular} apertura={apertura} />
    </main>
  );
}
