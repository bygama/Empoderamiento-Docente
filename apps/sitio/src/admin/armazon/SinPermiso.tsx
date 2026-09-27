import { QUE_PUEDE, esRol, quienPuede, type Capacidad } from "@ed/auth";
import { BotonEnlace } from "@ed/kit-admin";
import { Encabezado } from "./Encabezado";

/**
 * Lo que ve quien entra por URL a una sección que su rol no usa (DESIGN.md
 * §11, «Sin permiso»). La sidebar ya no se la muestra; esto es para el link
 * viejo o la URL tipeada. Dice de quién es la sección y qué hace tu rol, y
 * lleva al Inicio. Sin primario: acá no hay nada que hacer.
 */
export function SinPermiso({ capacidad, rol }: { capacidad: Capacidad; rol: unknown }) {
  return (
    <Encabezado
      titulo={`Esta sección es de ${quienPuede(capacidad)}`}
      detalle={esRol(rol) ? `Tu rol es ${rol}. ${QUE_PUEDE[rol]}` : null}
      acciones={
        <BotonEnlace variante="secundario" href="/admin">
          Ir al Inicio
        </BotonEnlace>
      }
    />
  );
}
