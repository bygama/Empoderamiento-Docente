import type { Metadata } from "next";
import { OPEN_GRAPH_COMUN } from "@/config/metadata";
import { destacadosDelSitio } from "@/datos/consultas/materiales";
import { novedadesDelSitio } from "@/datos/consultas/novedades";
import { contenidoDe } from "@/datos/consultas/paginas";
import { HeroQuienes } from "@/features/home/components/HeroQuienes";
import { DatosDuros } from "@/features/home/components/DatosDuros";
import { ComoTrabajamos } from "@/features/home/components/ComoTrabajamos";
import { LineasAccion } from "@/features/home/components/LineasAccion";
import { BibliotecaNovedades } from "@/features/home/components/BibliotecaNovedades";
import { areasDeInicio, ideasDelMetodo } from "@/features/home/contenido/compartido";
import { NOVEDADES_EN_EL_INICIO } from "@/features/novedades/contenido/modelo";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del admin.
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await contenidoDe("inicio");
  return metadataDeSeo(seo, OPEN_GRAPH_COMUN);
}

export default async function Home() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  // Lo compartido vive en Qué hacemos (su publicado, o su borrador en vista previa).
  const [{ hero, quienesSomos, mision, enNumeros, comoTrabajamos, areas, bibliotecaYNovedades }, queHacemos, novedades, destacados] = await Promise.all([
    contenidoDe("inicio"),
    contenidoDe("que-hacemos"),
    novedadesDelSitio(),
    destacadosDelSitio(),
  ]);
  return (
    <main>
      {/* Se entra directo al Inicio: el portón «Comenzá la experiencia»
          (IntroGate) salió del render el 2026-06-24 y su código se borró el
          2026-09-18. El Hero y el navbar animan en el mount — ver
          intro-signal.ts, que responde «ya entramos» siempre. */}
      <HeroQuienes hero={hero} quienesSomos={quienesSomos} mision={mision} />
      {/* Ancla del scroll-hint del Hero */}
      <div id="contenido" />
      {/* Acá hubo un bloque «Qué hacemos» en texto plano (QueHacemosResumen):
          entró el 2026-09-08 y Gastón lo sacó al día siguiente. Su código se
          borró el 2026-09-18; está en el historial si vuelve a hacer falta. */}
      <DatosDuros contenido={enNumeros} />
      <ComoTrabajamos contenido={comoTrabajamos} frases={ideasDelMetodo(queHacemos.comoTrabajamos, comoTrabajamos.pasos.length)} />
      {/* Áreas de especialización (el abanico de siete cartas). Había salido
          de la home junto con la llegada del bloque plano y vuelve a su lugar
          original, después de «Cómo trabajamos» (2026-09-09). */}
      <LineasAccion contenido={areas} areas={areasDeInicio(queHacemos.areas)} />
      {/* Las cuatro novedades más nuevas (la lista ya viene en orden) y los destacados de la Biblioteca. */}
      <BibliotecaNovedades
        contenido={bibliotecaYNovedades}
        ultimasNovedades={novedades.slice(0, NOVEDADES_EN_EL_INICIO)}
        destacados={destacados.map((d) => d.material)}
      />
    </main>
  );
}
