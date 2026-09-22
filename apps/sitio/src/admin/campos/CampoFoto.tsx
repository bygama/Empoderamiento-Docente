"use client";

import Image from "next/image";
import { useState, useTransition, type KeyboardEvent, type MouseEvent } from "react";
import { Aviso } from "@/admin/armazon/Campos";
import { MAXIMO_BYTES, posicionDelFoco, type ValorFoto } from "@/lib/contenido/fotos";
import type { Cambio } from "./cambio";
import { BOTON_SECUNDARIO, ENTRADA } from "./clases";

/**
 * Lo que el control necesita de quien guarda la foto: recibe el archivo y el
 * alt, y contesta dónde quedó o por qué no. Llega por prop para que el control
 * no conozca la Server Action de la app y pueda mudarse al kit.
 */
export type SubirFoto = (datos: FormData) => Promise<{ ok: true; foto: { src: string } } | { ok: false; detalle: string }>;

type Props = {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  valor: ValorFoto;
  alCambiar: (valor: Cambio<ValorFoto>) => void;
  subir: SubirFoto;
};

// Cuánto mueve cada pulsación de flecha, en fracción de la caja (0..1): un
// paso fino y uno grande con Shift, como un slider de dos ejes.
const PASO_FOCO = 0.05;
const PASO_FOCO_GRANDE = 0.25;

/**
 * Una foto del contenido: la miniatura recortada alrededor del foco, el texto
 * alternativo (obligatorio) y la subida de un archivo nuevo (SPEC §2 y §4.4).
 * El foco se elige con un clic sobre la miniatura, o con las flechas del
 * teclado (Shift para el paso grande). El marco es 4/3 y no el de cada
 * tarjeta: las once tienen once relaciones de aspecto y el campo es uno solo
 * (DECISIONS, 8); el recorte real se ve en la vista previa.
 */
export function CampoFoto({ nombre, etiqueta, ayuda, valor, alCambiar, subir }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();
  const idArchivo = `${nombre}-archivo`;

  const elegirFoco = (e: MouseEvent<HTMLButtonElement>) => {
    // Enter o espacio disparan un click con clientX/clientY en 0 (detail 0):
    // restado contra la caja da negativo, y el clamp lo llevaría a la
    // esquina superior izquierda. Comprobado en un navegador real (Chromium,
    // evento isTrusted), no es un supuesto. Por eso ese click se ignora acá
    // y el teclado mueve el foco por su lado, con moverFoco.
    if (e.detail === 0) return;
    const caja = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width));
    const y = Math.min(1, Math.max(0, (e.clientY - caja.top) / caja.height));
    const foco = { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) };
    // Updater, no un valor plano: si esto corre justo después de que una
    // subida resuelva pero antes de que React confirme ese cambio, un valor
    // plano armado contra el `valor` de este render pisaría el `src` nuevo.
    alCambiar((actual: ValorFoto) => ({ ...actual, foco }));
  };

  // Con el teclado: las flechas mueven el foco de a un paso (Shift, uno grande).
  const moverFoco = (e: KeyboardEvent<HTMLButtonElement>) => {
    const paso = e.shiftKey ? PASO_FOCO_GRANDE : PASO_FOCO;
    const dx = e.key === "ArrowLeft" ? -paso : e.key === "ArrowRight" ? paso : 0;
    const dy = e.key === "ArrowUp" ? -paso : e.key === "ArrowDown" ? paso : 0;
    if (dx === 0 && dy === 0) return;
    e.preventDefault();
    const x = Math.min(1, Math.max(0, valor.foco.x + dx));
    const y = Math.min(1, Math.max(0, valor.foco.y + dy));
    const foco = { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) };
    alCambiar((actual: ValorFoto) => ({ ...actual, foco }));
  };

  const alSubir = () => {
    if (!archivo) return;
    if (!valor.alt.trim()) {
      setAviso("Escribí primero el texto alternativo: sin él la foto no se guarda.");
      return;
    }
    // Acá y no solo en el servidor: el tope del cuerpo de la acción corta
    // antes de entrar a ella, y ese error no lo contesta nadie en llano.
    if (archivo.size > MAXIMO_BYTES) {
      setAviso("La foto pesa más de 4 MB: achicala antes de subirla.");
      return;
    }
    const datos = new FormData();
    datos.append("archivo", archivo);
    datos.append("alt", valor.alt);
    empezar(async () => {
      try {
        const r = await subir(datos);
        if (!r.ok) {
          setAviso(r.detalle);
          return;
        }
        setAviso(null);
        setArchivo(null);
        // Foto nueva, foco al centro: el anterior era de otra imagen. Arma
        // el valor contra `actual` (lo más fresco), no contra el `valor` que
        // tenía este render cuando arrancó la subida: el alt pudo seguir
        // escribiéndose mientras tanto.
        alCambiar((actual: ValorFoto) => ({ ...actual, src: r.foto.src, foco: { x: 0.5, y: 0.5 } }));
      } catch {
        // Sin red, o el servidor cortó el pedido: un aviso, no la pantalla de error de Next.
        setAviso("No se pudo subir la foto. Fijate la conexión y probá de nuevo.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{etiqueta}</p>
      {valor.src ? (
        <>
          <button
            type="button"
            onClick={elegirFoco}
            onKeyDown={moverFoco}
            disabled={pendiente}
            aria-label="Punto de foco: tocá la miniatura o usá las flechas"
            className="relative block aspect-[4/3] w-full max-w-xs cursor-crosshair overflow-hidden rounded-lg border border-azul-claro disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image src={valor.src} alt={valor.alt} fill sizes="320px" className="object-cover" style={{ objectPosition: posicionDelFoco(valor.foco) }} />
            <span
              aria-hidden="true"
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-verde-concepto shadow"
              style={{ left: `${valor.foco.x * 100}%`, top: `${valor.foco.y * 100}%` }}
            />
          </button>
          {/* Nada que ver, todo que oír: anuncia dónde quedó el foco después de moverlo, con mouse o teclado. */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">{`Foco en ${posicionDelFoco(valor.foco)}`}</span>
          <p className="text-xs text-gris-texto">
            Tocá la miniatura donde está lo importante, o usá las flechas del teclado. Cada marco del sitio recorta alrededor de ese punto.
          </p>
        </>
      ) : (
        <p className="text-sm text-gris-texto">Sin foto todavía.</p>
      )}
      <label className="block">
        <span className="text-sm font-medium">Texto alternativo (obligatorio)</span>
        <input
          type="text"
          value={valor.alt}
          maxLength={200}
          disabled={pendiente}
          onChange={(e) => {
            const alt = e.target.value;
            // Updater, no un valor plano: mismo motivo que el foco y la
            // subida de más arriba — si esto corre después de que algo
            // asíncrono resuelva pero antes de que React confirme, un valor
            // plano pisaría lo que se haya tocado en otro campo mientras tanto.
            alCambiar((actual: ValorFoto) => ({ ...actual, alt }));
          }}
          className={`mt-1 ${ENTRADA}`}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={idArchivo} className="sr-only">
          Archivo de la foto
        </label>
        {/* La key remonta el input tras cada subida: limpia su selección y deja re-elegir el mismo archivo. */}
        <input
          key={valor.src}
          id={idArchivo}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button type="button" disabled={!archivo || pendiente} onClick={alSubir} className={BOTON_SECUNDARIO}>
          {pendiente ? "Subiendo…" : "Subir foto"}
        </button>
      </div>
      <p className="text-xs text-gris-texto">jpg, png o webp de hasta 4 MB.{ayuda ? ` ${ayuda}` : ""}</p>
      {aviso ? <Aviso tono="error">{aviso}</Aviso> : null}
    </div>
  );
}
