import { segundoFactorObligatorio } from "@ed/auth";
import { Insignia } from "@/admin/armazon/Insignia";
import { FormularioDelSegundoFactor } from "./FormularioDelSegundoFactor";

/**
 * El segundo factor en Mi cuenta (SPEC de work/cuentas §5.5): para dirige y
 * administra es obligatorio y solo se dice; para edita, se prende o se apaga
 * con la contraseña.
 */
export function Seguridad({ rol, activo, correo }: { rol: unknown; activo: boolean; correo: string }) {
  const estado = activo ? <Insignia tono="normal">Activo</Insignia> : <Insignia tono="apagado">Apagado</Insignia>;
  if (segundoFactorObligatorio(rol)) {
    return (
      <div className="space-y-2">
        {estado}
        <p className="max-w-prose text-admin-meta text-gris-texto">
          Es obligatorio para tu rol: cuando entrás desde un dispositivo que no recordaste, te pedimos un código por correo.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {estado}
      <FormularioDelSegundoFactor activo={activo} correo={correo} />
    </div>
  );
}
