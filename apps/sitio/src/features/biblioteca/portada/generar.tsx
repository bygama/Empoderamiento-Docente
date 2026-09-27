import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Tipo } from "../contenido/modelo";

// La portada tipográfica de un material sin portada propia (SPEC §13.2 de
// `work/biblioteca/`): la misma pieza que las 57 de `public/biblioteca/portadas`
// —900 × 900, el color de su tipo, «TIPO · FUENTE · AÑO», el título, quién
// firma y «Empoderamiento Docente»—, dibujada con `next/og` y la Manrope que ya
// usa la imagen para redes de las novedades. La usan la ruta del sitio y la
// vista previa de la ficha.

export const TAMANO_DE_PORTADA = { width: 900, height: 900 };

type Colores = { fondo: string; raya: string; arriba: string; titulo: string; firma: string; marca: string; puntos: string };

const AZUL = "#1f2d4d";
const VERDE = "#1f9a78";
const AZUL_CLARO = "#a9c5e8";
const BLANCO_SUAVE = "rgba(255,255,255,0.72)";
const sobreOscuro = (fondo: string, raya: string, marca = raya): Colores => ({ fondo, raya, arriba: BLANCO_SUAVE, titulo: "#ffffff", firma: BLANCO_SUAVE, marca, puntos: "rgba(255,255,255,0.10)" });
const sobreClaro = (fondo: string, raya: string, marca = raya): Colores => ({ fondo, raya, arriba: "#3d4a63", titulo: AZUL, firma: "#3d4a63", marca, puntos: "rgba(31,45,77,0.10)" });

/** El color de cada tipo, como las portadas de hoy. */
const COLORES: Record<Tipo, Colores> = {
  Artículos: sobreOscuro(AZUL, VERDE),
  "Capítulos de libro": sobreOscuro("#4a6fa5", AZUL_CLARO),
  Libros: sobreOscuro(VERDE, AZUL_CLARO),
  Tesis: sobreOscuro("#14203a", VERDE),
  "Actas de congreso": sobreClaro("#f2f4f7", VERDE),
  Divulgación: sobreOscuro("#177b60", AZUL_CLARO),
  Materiales: sobreClaro(AZUL_CLARO, AZUL, AZUL),
};

/** Cómo se nombra el tipo arriba, en singular. */
const EN_SINGULAR: Record<Tipo, string> = {
  Artículos: "Artículo",
  "Capítulos de libro": "Capítulo",
  Libros: "Libro",
  Tesis: "Tesis",
  "Actas de congreso": "Actas",
  Divulgación: "Divulgación",
  Materiales: "Materiales",
};

let fuente: Promise<Buffer> | undefined;

/** Manrope, leída una vez por proceso, desde la raíz de la app (lo que sigue el trazado de archivos de Next). */
function cargarFuente() {
  fuente ??= readFile(path.join(process.cwd(), "src/features/novedades/imagen-para-redes/manrope-latin-700-normal.woff"));
  return fuente;
}

/** Más largo el título, más chica la letra: hasta 200 caracteres entran. */
function tamanoDelTitulo(titulo: string): number {
  if (titulo.length <= 40) return 56;
  if (titulo.length <= 80) return 46;
  if (titulo.length <= 130) return 38;
  return 31;
}

export type DatosDeLaPortada = { titulo: string; firma: string; tipo: Tipo | ""; fuente: string; anio: string };

export async function portadaTipografica({ titulo, firma, tipo, fuente: dondeSeLee, anio }: DatosDeLaPortada): Promise<ImageResponse> {
  const c = COLORES[tipo || "Artículos"];
  const texto = titulo.trim() || "Todavía sin título";
  const arriba = [tipo ? EN_SINGULAR[tipo] : "", dondeSeLee.trim(), anio].filter(Boolean).join("  ·  ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 143px",
          backgroundColor: c.fondo,
          backgroundImage: `radial-gradient(circle, ${c.puntos} 1.5px, transparent 1.6px)`,
          backgroundSize: "45px 45px",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", width: 48, height: 3, backgroundColor: c.raya }} />
        <div style={{ display: "flex", marginTop: 28, fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: c.arriba }}>{arriba}</div>
        <div style={{ display: "flex", marginTop: 44, fontSize: tamanoDelTitulo(texto), lineHeight: 1.15, color: c.titulo, maxWidth: 614 }}>{texto}</div>
        {firma.trim() ? <div style={{ display: "flex", marginTop: 44, fontSize: 20, lineHeight: 1.4, color: c.firma, maxWidth: 614 }}>{firma}</div> : null}
        <div style={{ display: "flex", marginTop: 40, fontSize: 17, letterSpacing: 2.5, textTransform: "uppercase", color: c.marca }}>Empoderamiento Docente</div>
      </div>
    ),
    { ...TAMANO_DE_PORTADA, fonts: [{ name: "Manrope", data: await cargarFuente(), weight: 700, style: "normal" }] },
  );
}
