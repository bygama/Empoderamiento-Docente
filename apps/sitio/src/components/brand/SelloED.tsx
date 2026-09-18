import Image from "next/image";

/**
 * Sello de firma: el logotipo ACTUAL de ED (logotipo-principal-ed, el mismo
 * del navbar y del pie) en su versión negativa, chico y tenue, en la
 * esquina de los cierres navy de cada página —como quien firma la última
 * hoja—. Gastón (2026-09-18): la marca aparecía poco en el sitio y esta es
 * la manera de sumarla sin repetirla al lado del faro, que ya ES el logo.
 * Decorativo (alt vacío): el nombre de la marca lo dicen navbar y pie. Solo
 * desde md: en celular las esquinas de las tarjetas no tienen aire.
 */
export function SelloED({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/logotipo-principal-ed-negativo.png"
      alt=""
      aria-hidden="true"
      width={395}
      height={433}
      className={`pointer-events-none hidden h-10 w-auto opacity-60 select-none md:block lg:h-12 ${className}`}
    />
  );
}
