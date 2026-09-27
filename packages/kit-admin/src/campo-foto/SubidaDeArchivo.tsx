import { useRef, useState, type TransitionStartFunction } from "react";
import { Boton } from "../Boton";
import type { Cambio } from "../cambio";
import { claseDeBoton } from "../clases";
import type { ValorDeFoto } from "../foto";
import { Subir } from "../iconos";

/**
 * Lo que el control necesita de quien guarda la foto: recibe el archivo y el
 * alt, y contesta dónde quedó o por qué no. Llega por prop: el control no
 * conoce la Server Action de la app.
 */
export type SubirFoto = (datos: FormData) => Promise<{ ok: true; foto: { src: string } } | { ok: false; detalle: string }>;

/** 4194304 → «4». */
const megas = (bytes: number) => String(Math.round((bytes / (1024 * 1024)) * 10) / 10).replace(".", ",");

type Props = {
  nombre: string;
  valor: ValorDeFoto;
  alCambiar: (valor: Cambio<ValorDeFoto>) => void;
  subir: SubirFoto;
  maximoBytes: number;
  pendiente: boolean;
  empezar: TransitionStartFunction;
  avisar: (aviso: string | null) => void;
  /** Lo que se dibuja al lado de «Elegir foto…»: «Elegir una ya subida…», si la app la ofrece. */
  children?: React.ReactNode;
};

/**
 * Subir un archivo nuevo para el campo de foto: el botón que abre el
 * selector del navegador, el tope, y «Subir foto» o «Cancelar» con el archivo
 * elegido. El input nativo queda oculto pero enfocable (Tab llega, Enter abre
 * el selector) y su label hace de botón: así no aparece el «Choose File» del
 * navegador, que no se puede estilar ni traducir.
 */
export function SubidaDeArchivo({ nombre, valor, alCambiar, subir, maximoBytes, pendiente, empezar, avisar, children }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const refArchivo = useRef<HTMLInputElement>(null);
  const idArchivo = `${nombre}-archivo`;

  const alSubir = () => {
    if (!archivo) return;
    if (!valor.alt.trim()) return avisar("Escribí primero el texto alternativo: sin él la foto no se guarda.");
    // Acá y no solo en el servidor: el tope del cuerpo de la acción corta
    // antes de entrar a ella, y ese error no lo contesta nadie en llano.
    if (archivo.size > maximoBytes) return avisar(`La foto pesa más de ${megas(maximoBytes)} MB: achicala antes de subirla.`);
    const datos = new FormData();
    datos.append("archivo", archivo);
    datos.append("alt", valor.alt);
    empezar(async () => {
      try {
        const r = await subir(datos);
        if (!r.ok) return avisar(r.detalle);
        avisar(null);
        setArchivo(null);
        // Foto nueva, foco al centro: el anterior era de otra imagen. Arma el
        // valor contra `actual` (lo más fresco): el alt pudo seguir
        // escribiéndose mientras tanto.
        alCambiar((actual: ValorDeFoto) => ({ ...actual, src: r.foto.src, foco: { x: 0.5, y: 0.5 } }));
      } catch {
        // Sin red, o el servidor cortó el pedido: un aviso, no la pantalla de error de Next.
        avisar("No se pudo subir la foto. Fijate la conexión y probá de nuevo.");
      }
    });
  };

  // Vuelve a antes de elegir: sin archivo y con el input vacío, así se puede re-elegir el mismo.
  const cancelar = () => {
    setArchivo(null);
    avisar(null);
    if (refArchivo.current) refArchivo.current.value = "";
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* `peer` le pasa al label el foco del input. La key lo remonta tras cada subida: limpia la selección. */}
        <input
          key={valor.src}
          ref={refArchivo}
          id={idArchivo}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pendiente}
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="peer sr-only"
        />
        <label
          htmlFor={idArchivo}
          className={`${claseDeBoton("secundario")} cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul-medio peer-disabled:cursor-not-allowed peer-disabled:opacity-60`}
        >
          <Subir size={16} />
          {valor.src ? "Cambiar foto…" : "Elegir foto…"}
        </label>
        {children}
        <span className="text-admin-meta text-gris-texto">jpg, png o webp · hasta {megas(maximoBytes)} MB</span>
      </div>
      {archivo ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="min-w-0 truncate text-admin-meta">{archivo.name}</span>
          <Boton variante="secundario" disabled={pendiente} aria-busy={pendiente || undefined} onClick={alSubir}>
            {pendiente ? "Subiendo…" : "Subir foto"}
          </Boton>
          <Boton variante="terciario" disabled={pendiente} onClick={cancelar}>
            Cancelar
          </Boton>
        </div>
      ) : null}
    </>
  );
}
