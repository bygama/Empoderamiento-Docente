import { MESES_DE_GUARDA } from "@/config/privacidad";

/**
 * Lo que queda en el lugar del formulario cuando el CV llegó. El título toma
 * el foco al aparecer: el botón que se apretó ya no existe, y así quien usa
 * lector de pantalla escucha que salió bien.
 */
export function ConfirmacionCV() {
  return (
    <div className="border-azul-claro/50 rounded-3xl border bg-white/80 p-6 text-center backdrop-blur-sm md:p-10">
      <h2 ref={(titulo) => titulo?.focus()} tabIndex={-1} className="font-display text-h2 text-azul-principal font-bold tracking-[-0.01em] focus:outline-none">
        Recibimos tu CV.
      </h2>
      <p className="text-gris-texto mx-auto mt-4 max-w-[48ch] font-sans text-[0.98rem] leading-relaxed">
        Gracias por querer sumarte. Lo vamos a leer y, si hay una propuesta para vos, te escribimos a tu correo. Lo
        guardamos {MESES_DE_GUARDA.cv} meses y después lo borramos.
      </p>
    </div>
  );
}
