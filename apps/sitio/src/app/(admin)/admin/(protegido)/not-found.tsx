import { BotonEnlace, Encabezado } from "@ed/kit-admin";

/**
 * La 404 del admin, con su armazón, al lado de «Sin permiso». Sin ella, una
 * URL mal escrita mostraba la pantalla gris de Next en inglés, sin sidebar.
 * Dice qué pasó y lleva al Inicio; sin primario, porque acá no hay nada que
 * hacer: lo que existe está en el menú.
 */
export default function NoEncontrada() {
  return (
    <Encabezado
      titulo="Esta dirección no está en el admin"
      detalle="Puede que el link esté mal escrito o que la sección haya cambiado de lugar. Lo que existe está en el menú."
      acciones={
        <BotonEnlace variante="secundario" href="/admin">
          Ir al Inicio
        </BotonEnlace>
      }
    />
  );
}
