import { SubrayadoMarcador } from "../Garabatos";
import { ROTULO_SECCION } from "../tintes";

/**
 * Rótulo de sección del expediente: mono + MARCADOR (como si alguien
 * hubiera resaltado la sección al leer el archivo) + regla que respira.
 * Colores parametrizados: sobre la hoja blanca o sobre el cartón tintado.
 */
export function RotuloExpediente({
  children,
  texto = "text-gris-texto",
  marcador = "text-verde-concepto/60",
  regla = "border-azul-principal/10",
}: {
  children: string;
  texto?: string;
  marcador?: string;
  regla?: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <h4 className={`${texto} ${ROTULO_SECCION} relative whitespace-nowrap`}>
        <SubrayadoMarcador
          aria-hidden="true"
          className={`absolute -bottom-2 left-0 h-2.5 w-full ${marcador}`}
        />
        {children}
      </h4>
      <span aria-hidden="true" className={`flex-1 border-t ${regla}`} />
    </div>
  );
}
