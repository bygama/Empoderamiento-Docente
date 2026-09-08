/**
 * Síntesis + puente hacia la red: la frase final sobre una niebla marfil
 * (MOMENTO B) y el párrafo que enlaza con «La red tiene nombres».
 */
export function SintesisMirada({ live }: { live: boolean }) {
  return (
    <div
      data-sintesis
      className={
        "flex flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 " +
        (live ? "h-full" : "h-auto py-24")
      }
    >
      {/* Niebla marfil del MOMENTO B: campo de foco detrás del texto
          (el sistema y las ramas quedan alrededor, no encima). */}
      <span
        data-sintesis-fog
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-0 motion-reduce:hidden" +
          (live ? "" : " hidden")
        }
        style={{
          background:
            "radial-gradient(ellipse 58% 52% at 50% 48%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.78) 46%, rgba(255,255,255,0) 74%)",
        }}
      />
      <p
        data-sintesis-frase
        className="font-display text-azul-principal relative max-w-[24ch] text-balance font-bold tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.8rem, 1rem + 2.4vw, 3rem)", lineHeight: 1.16 }}
      >
        Pensamiento matemático, saber y transformación forman{" "}
        <span className="text-verde-concepto">una misma mirada</span>.
      </p>
      <p
        data-puente
        className="text-azul-principal/80 relative mt-7 max-w-[40ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.1rem]"
      >
        Se sostiene en una red de especialistas, trayectorias y
        experiencias diversas.
      </p>
    </div>
  );
}
