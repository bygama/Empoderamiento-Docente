import localFont from "next/font/local";
import "./respaldos.css";

// Las fuentes que usa solo el layout del sitio, con el mismo criterio que
// `compartidas.ts`: archivos del repo, un peso declarado por archivo variable y
// el respaldo de `respaldos.css`.

export const jetbrainsMono = localFont({
  src: [
    { path: "./jetbrains-mono/jetbrains-mono-latin.woff2", weight: "400" },
    { path: "./jetbrains-mono/jetbrains-mono-latin.woff2", weight: "500" },
    // 600 real para el activo del navbar: sin el archivo, el navegador
    // sintetiza la negrita (mas gorda y borrosa que la de verdad).
    { path: "./jetbrains-mono/jetbrains-mono-latin.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-jetbrains-mono",
  adjustFontFallback: false,
  fallback: ["JetBrains Mono Fallback"],
});

// Manuscrita — SOLO para anotaciones "a mano" dentro de los expedientes de
// Investigación (notas al margen, marcas humanas). No es tipografía de UI.
export const caveat = localFont({
  src: [
    { path: "./caveat/caveat-latin.woff2", weight: "500" },
    { path: "./caveat/caveat-latin.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-caveat",
  adjustFontFallback: false,
  fallback: ["Caveat Fallback"],
});

// Maquina de escribir — SOLO para el texto documental de los expedientes de
// Investigacion (informes mecanografiados del archivo). No es tipografia de UI.
// No es variable: Google sirve un archivo por peso.
export const courierPrime = localFont({
  src: [
    { path: "./courier-prime/courier-prime-latin-400.woff2", weight: "400" },
    { path: "./courier-prime/courier-prime-latin-700.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-courier-prime",
  adjustFontFallback: false,
  fallback: ["Courier Prime Fallback"],
});
