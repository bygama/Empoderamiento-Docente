import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { etiquetaDeCategoria, fechaCorta } from "../contenido/modelo";
import { TAMANO } from "./tamano";

// La imagen para redes de una novedad (SPEC §6.3 de `work/novedades-y-kit/`):
// 1200 × 630, el título en Manrope sobre el azul de la marca, con la
// categoría, la fecha y el logo. La usan la ficha del sitio (su `og:image`,
// cuando no tiene una propia) y la vista previa del admin.
//
// Manrope va como archivo al lado (OFL.txt, la licencia): `next/og` no lee las
// fuentes de `next/font`. Los dos archivos se leen desde la raíz de la app con
// `process.cwd()`, la forma que el trazado de archivos de Next sigue.

const AZUL = "#1f2d4d";
const AZUL_CLARO = "#a9c5e8";
const VERDE = "#1f9a78";

let recursos: Promise<{ fuente: Buffer; logo: string }> | undefined;

/** La fuente y el logo, leídos una vez por proceso. */
function cargarRecursos() {
  recursos ??= Promise.all([
    readFile(path.join(process.cwd(), "src/features/novedades/imagen-para-redes/manrope-latin-700-normal.woff")),
    readFile(path.join(process.cwd(), "public/brand/logo-ed-negativo.png")),
  ]).then(([fuente, logo]) => ({ fuente, logo: `data:image/png;base64,${logo.toString("base64")}` }));
  return recursos;
}

/** Más largo el título, más chica la letra: hasta 100 caracteres entran en tres renglones. */
function tamanoDelTitulo(titulo: string): number {
  if (titulo.length <= 40) return 76;
  if (titulo.length <= 70) return 64;
  return 52;
}

export async function imagenParaRedes({ titulo, categoria, fecha }: { titulo: string; categoria: string; fecha: string }): Promise<ImageResponse> {
  const { fuente, logo } = await cargarRecursos();
  const texto = titulo.trim() || "Todavía sin título";
  const meta = [etiquetaDeCategoria(categoria), fecha ? fechaCorta(fecha) : ""].filter(Boolean).join("  ·  ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: AZUL,
          fontFamily: "Manrope",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: AZUL_CLARO }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: VERDE }} />
          {meta}
        </div>
        <div style={{ display: "flex", fontSize: tamanoDelTitulo(texto), lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 1040 }}>{texto}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* El logo (1252 × 608) a 230 de ancho, como fondo: Satori no tiene next/image, y un <img> suelto lo frena el lint. */}
          <div style={{ width: 230, height: 112, backgroundImage: `url(${logo})`, backgroundSize: "230px 112px" }} />
          <div style={{ display: "flex", fontSize: 24, color: AZUL_CLARO }}>{new URL(siteConfig.url).host}</div>
        </div>
      </div>
    ),
    { ...TAMANO, fonts: [{ name: "Manrope", data: fuente, weight: 700, style: "normal" }] },
  );
}
