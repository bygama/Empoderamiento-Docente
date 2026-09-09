import { HeroQuienes } from "@/features/home/components/HeroQuienes";
import { DatosDuros } from "@/features/home/components/DatosDuros";
import { ComoTrabajamos } from "@/features/home/components/ComoTrabajamos";
import { BibliotecaNovedades } from "@/features/home/components/BibliotecaNovedades";

export default function Home() {
  return (
    <main>
      {/* IntroGate removido: se entra directo al Inicio (sin "Comenzá la
          experiencia"). El Hero y el navbar animan en el mount — ver
          intro-signal.ts (entered/revealed = true por defecto). */}
      <HeroQuienes />
      {/* Ancla del scroll-hint del Hero */}
      <div id="contenido" />
      {/* El bloque «Qué hacemos» en texto plano (QueHacemosResumen, 2026-09-08)
          se sacó de la home al día siguiente por decisión de Gastón; el
          componente sigue en features/home por si se reincorpora. */}
      <DatosDuros />
      <ComoTrabajamos />
      <BibliotecaNovedades />
    </main>
  );
}
