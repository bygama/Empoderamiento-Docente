import { HeroQuienes } from "@/features/home/components/HeroQuienes";
import { QueHacemosResumen } from "@/features/home/components/QueHacemosResumen";
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
      {/* Qué hace ED, en texto plano y antes de cualquier escena larga
          (2026-09-08). Reemplaza al abanico de siete líneas (LineasAccion)
          que estaba después de «Cómo trabajamos». */}
      <QueHacemosResumen />
      <DatosDuros />
      <ComoTrabajamos />
      <BibliotecaNovedades />
    </main>
  );
}
