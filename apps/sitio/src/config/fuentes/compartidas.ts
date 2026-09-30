import localFont from "next/font/local";
import "./respaldos.css";

// Las fuentes del sitio salen de archivos del repo, con su licencia (OFL) al
// lado de cada una, para que el build no dependa de Google: cuando `next/font`
// las bajaba de Google Fonts, Turbopack pedía cada archivo en cada build sin
// reintentar, y en el VPS se cayeron así 2 de 5 builds (AGENTS.md §7). Son los
// mismos bytes que se servían entonces: el subset latin de cada familia, bajado
// de la API CSS2 de Google Fonts el 2026-09-30.
//
// Todo lo demás copia lo que generaba la carga desde Google, para que nada se
// vea distinto:
// - Un archivo variable se declara una vez por peso, como lo declara Google:
//   el navegador elige entre esos pesos y no interpola los de en medio.
// - Sin `unicode-range`: el archivo latin trae unos glifos más (Ă, los acentos
//   combinables) que Google servía desde otro subset de la misma familia, y el
//   rango latin los mandaría al respaldo.
// - El respaldo mientras carga, en `respaldos.css`.
//
// `next/font` solo acepta literales, por eso cada ruta va escrita entera.
// Inter y Manrope las usan el layout del sitio y el del admin; las otras tres,
// solo el del sitio, y viven en `del-sitio.ts` para que cada layout importe
// solo las que usa.

export const inter = localFont({
  src: [
    { path: "./inter/inter-latin.woff2", weight: "400" },
    { path: "./inter/inter-latin.woff2", weight: "500" },
    // 600 real para el activo del navbar: sin el archivo, el navegador
    // sintetiza la negrita (mas gorda y borrosa que la de verdad).
    { path: "./inter/inter-latin.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: false,
  fallback: ["Inter Fallback"],
});

export const manrope = localFont({
  src: [
    { path: "./manrope/manrope-latin.woff2", weight: "500" },
    { path: "./manrope/manrope-latin.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-manrope",
  adjustFontFallback: false,
  fallback: ["Manrope Fallback"],
});
