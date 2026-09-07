/**
 * Grid de puntos del manual §6, blanco tenue sobre el campo navy que va de la
 * carta (`#sentido`) a las carpetas de líneas (`#lineas`). Paso de 44px y
 * punto de 1px: más fino y abierto que `.pattern-dots-inverse`, para que no
 * compita con las fichas y las hojas que van encima.
 *
 * El campo cruza dos secciones y las filas tienen que seguir sin salto: la
 * carta ancla su grid al borde INFERIOR de su caja y las carpetas al SUPERIOR
 * de la suya, así la última fila de una y la primera de la otra quedan a un
 * paso exacto mida lo que mida la caja de la carta (100svh pinneada o el alto
 * que tome en flujo). Las columnas coinciden porque las dos cajas ocupan todo
 * el ancho.
 */
export function PuntosCampo({ anclaje }: { anclaje: "arriba" | "abajo" }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.13]"
      style={{
        backgroundImage: "radial-gradient(white 1px, transparent 1.5px)",
        backgroundSize: "44px 44px",
        backgroundPosition: anclaje === "abajo" ? "22px 100%" : "22px 0",
      }}
    />
  );
}
