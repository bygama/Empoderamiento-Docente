import { Momento } from "@/admin/armazon/Momento";
import type { Autorizacion } from "@/datos/consultas/aliados-del-admin";
import { altoDe } from "@/features/aliados/contenido/modelo";
import { LogoEnLaTira } from "../LogoEnLaTira";

type PropsDelLogo = { titulo: string; src: string; nombre: string; alt: string; tamano: string };

/**
 * Un logo como en la tira, con su nombre y su texto: lo que se autorizó o lo
 * que se va a autorizar. El texto va escrito (el logo, decorativo): es lo que
 * leen un lector de pantalla y un buscador, y la marca lo ata también.
 */
export function LogoYNombre({ titulo, src, nombre, alt, tamano }: PropsDelLogo) {
  return (
    <figure className="space-y-2">
      <figcaption className="text-admin-meta font-medium">{titulo}</figcaption>
      <LogoEnLaTira src={src} alt="" alto={altoDe(tamano).inicio} />
      <p className="text-admin-cuerpo">«{nombre}»</p>
      <p className="text-admin-meta text-gris-texto">Texto del logo: «{alt}»</p>
    </figure>
  );
}

/** Lo que se autorizó, si hay marca: el logo, el nombre y el texto que vio quien autorizó. */
export function LoQueSeAutorizo({ autorizacion, tamano }: { autorizacion: Autorizacion; tamano: string }) {
  const { autorizado, logo, nombre, alt } = autorizacion;
  if (!autorizado || !logo || !nombre || alt === null) return null;
  return <LogoYNombre titulo="Se autorizó" src={logo} nombre={nombre} alt={alt} tamano={tamano} />;
}

/** Quién la cambió y cuándo, o que llegó así con el sitio. */
export function Cuando({ a }: { a: Autorizacion }) {
  if (!a.en) return null;
  if (!a.por) return <p className="text-admin-meta text-gris-texto">Llegó autorizado con el sitio.</p>;
  return (
    <p className="text-admin-meta text-gris-texto">
      {a.autorizado ? "Marcado" : "Quitado"} por {a.por}, <Momento iso={a.en} relativo />.
    </p>
  );
}
