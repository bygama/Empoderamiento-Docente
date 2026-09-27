import { Boton } from "./Boton";
import { FlechaAfuera } from "./iconos";

type Props = {
  /** Lo que corre en la ficha, o nada: «guardar», «vista-previa» o «publicar» se dicen en su botón; lo demás solo los deja esperando. */
  pendiente: string | null;
  /** Sobre el encabezado navy (cambios sin guardar). */
  azul: boolean;
  alGuardar: () => void;
  alVerBorrador?: () => void;
  alPublicar?: () => void;
};

/**
 * Guardar borrador, Vista previa y Publicar, el único primario (DESIGN.md
 * §11, «Botones» y «Ficha de una entidad»): las acciones del encabezado de la
 * ficha de una cosa que se publica, con su borrador y lo publicado. Mientras una corre, las demás esperan, y la que corre lo dice. En
 * el celular «Guardar borrador» dice «Guardar»: la barra de abajo no tiene
 * lugar; el lector lee el nombre entero.
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
          <FlechaAfuera size={16} />
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
