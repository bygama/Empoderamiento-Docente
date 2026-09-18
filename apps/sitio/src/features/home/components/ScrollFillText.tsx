/**
 * Texto que se "rellena" palabra por palabra con el scroll (estilo blueprint):
 * cada palabra es un <span data-qs-word> que HeroQuienes enciende de gris tenue
 * al color final. Las palabras marcadas como `accent` se resaltan en AZUL de
 * marca; el resto se completa en VERDE. Sin animación (reduced-motion) quedan en
 * su color final por CSS (verde base / azul los acentos). [[ed-copy-oficial]]
 *
 * `paragraphs` es una lista de párrafos (cada uno una lista de segmentos): el
 * cuerpo verbatim se puede dividir en varios <p> sin romper el fill ni el
 * barrido — el wrapper conserva `data-qs-fill` (lo mide HeroQuienes para igualar
 * el alto de las dos capas) y las palabras siguen siendo [data-qs-word].
 */
import type { CSSProperties } from "react";

export type FillSeg = { t: string; accent?: boolean };

function Words({ segments, pi }: { segments: FillSeg[]; pi: number }) {
  const words: { w: string; accent?: boolean }[] = [];
  segments.forEach((s) =>
    s.t
      .trim()
      .split(/\s+/)
      .forEach((w) => words.push({ w, accent: s.accent })),
  );

  return (
    <>
      {words.map((it, i) => (
        <span
          key={`${pi}-${i}`}
          data-qs-word
          {...(it.accent ? { "data-accent": "" } : {})}
          className={it.accent ? "text-azul-principal" : undefined}
        >
          {it.w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function ScrollFillText({
  paragraphs,
  className,
  style,
}: {
  paragraphs: FillSeg[][];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div data-qs-fill className={className} style={style}>
      {paragraphs.map((segments, pi) => (
        <p key={pi} className={pi > 0 ? "mt-[0.85em]" : undefined}>
          <Words segments={segments} pi={pi} />
        </p>
      ))}
    </div>
  );
}
