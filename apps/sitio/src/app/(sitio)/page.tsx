import { HeroQuienes } from "@/features/home/components/HeroQuienes";
import { DatosDuros } from "@/features/home/components/DatosDuros";
import { ComoTrabajamos } from "@/features/home/components/ComoTrabajamos";
import { LineasAccion } from "@/features/home/components/LineasAccion";
import { BibliotecaNovedades } from "@/features/home/components/BibliotecaNovedades";

export default function Home() {
  return (
    <main>
      {/* Se entra directo al Inicio: el portón «Comenzá la experiencia»
          (IntroGate) salió del render el 2026-06-24 y su código se borró el
          2026-09-18. El Hero y el navbar animan en el mount — ver
          intro-signal.ts, que responde «ya entramos» siempre. */}
      <HeroQuienes />
      {/* Ancla del scroll-hint del Hero */}
      <div id="contenido" />
      {/* Acá hubo un bloque «Qué hacemos» en texto plano (QueHacemosResumen):
          entró el 2026-09-08 y Gastón lo sacó al día siguiente. Su código se
          borró el 2026-09-18; está en el historial si vuelve a hacer falta. */}
      <DatosDuros />
      <ComoTrabajamos />
      {/* Áreas de especialización (el abanico de siete cartas). Había salido
          de la home junto con la llegada del bloque plano y vuelve a su lugar
          original, después de «Cómo trabajamos» (2026-09-09). */}
      <LineasAccion />
      <BibliotecaNovedades />
    </main>
  );
}
