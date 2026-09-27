import { Boton } from "@/admin/armazon/Boton";
import { ArrowUpRight } from "@/components/ui/icons";
import type { Pendiente } from "./useGuardarNovedad";

type Props = {
  pendiente: Pendiente;
  /** Sobre el encabezado navy (cambios sin guardar). */
  azul: boolean;
  alGuardar: () => void;
  alVerBorrador?: () => void;
  alPublicar?: () => void;
};

/**
 * Guardar borrador, Vista previa y Publicar, el único primario (DESIGN.md
 * §11, «Botones»). Mientras una corre, las demás esperan, y la que corre lo
 * dice. En el celular «Guardar borrador» dice «Guardar»: la barra de abajo no
 * tiene lugar; el lector lee el nombre entero.
 */
export function AccionesDeLaFicha({ pendiente, azul, alGuardar, alVerBorrador, alPublicar }: Props) {
  const corriendo = pendiente !== null;
  return (
    <>
      <Boton variante="secundario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "guardar" || undefined} onClick={alGuardar}>
        {pendiente === "guardar" ? (
          "Guardando…"
        ) : (
          // Un solo hijo: en el `inline-flex` del botón, dos serían dos piezas separadas por el `gap`.
          <span>
            Guardar<span className="max-lg:sr-only"> borrador</span>
          </span>
        )}
      </Boton>
      {alVerBorrador ? (
        <Boton variante="secundario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "vista-previa" || undefined} onClick={alVerBorrador}>
          {pendiente === "vista-previa" ? "Abriendo…" : "Vista previa"}
          <ArrowUpRight size={16} />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </Boton>
      ) : null}
      {/* El único naranja de la pantalla: es la acción (DESIGN.md §1, regla 2). */}
      {alPublicar ? (
        <Boton variante="primario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "publicar" || undefined} onClick={alPublicar}>
          {pendiente === "publicar" ? "Publicando…" : "Publicar"}
        </Boton>
      ) : null}
    </>
  );
}
