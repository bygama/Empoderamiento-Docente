import { Momento } from "@/admin/armazon/Momento";
import type { Autorizacion } from "@/datos/consultas/aliados-del-admin";
import { altoDe } from "@/features/aliados/contenido/modelo";
import { LogoEnLaTira } from "../LogoEnLaTira";

/** Un logo como en la tira, con su nombre: lo que se autorizó o lo que se va a autorizar. */
export function LogoYNombre({ titulo, src, nombre, tamano }: { titulo: string; src: string; nombre: string; tamano: string }) {
  return (
    <figure className="space-y-2">
      <figcaption className="text-admin-meta font-medium">{titulo}</figcaption>
      <LogoEnLaTira src={src} alt="" alto={altoDe(tamano).inicio} />
      <p className="text-admin-cuerpo">«{nombre}»</p>
    </figure>
  );
}

/** Lo que se autorizó, si hay marca: el logo y el nombre que vio quien autorizó. */
export function LoQueSeAutorizo({ autorizacion, tamano }: { autorizacion: Autorizacion; tamano: string }) {
  if (!autorizacion.autorizado || !autorizacion.logo || !autorizacion.nombre) return null;
  return <LogoYNombre titulo="Se autorizó" src={autorizacion.logo} nombre={autorizacion.nombre} tamano={tamano} />;
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
