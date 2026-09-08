import type { Tinte } from "./anatomia";

type Props = {
  tinte: Tinte;
  esUltima: boolean;
  /** Redondeo de la base, decidido por el padre (ver CarpetaCaso). */
  baseRedondeada: string;
};

/**
 * Lomo trasero (apenas más oscuro: profundidad del objeto). Su borde de
 * arriba NO se mueve nunca — es lo que fija el objeto en la pila; si se
 * levantara, la carpeta parecería desplegar algo hacia arriba en vez de
 * abrirse. Lo que hace en hover es estirarse hacia abajo lo mismo que cae
 * la tapa, para que la tapa no le sobresalga por el pie: en las carpetas
 * cubiertas no se notaría, pero en la última asomaría media luna de un
 * tono más claro que el lomo.
 */
export function LomoCarpeta({ tinte, esUltima, baseRedondeada }: Props) {
  return (
    <span
      data-carpeta-back
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 bottom-0 rounded-t-2xl transition-[bottom] duration-[380ms] ease-out motion-safe:group-hover:-bottom-3 ${tinte.carpeta} ${tinte.grano} ${baseRedondeada}`}
    >
      <span
        data-carpeta-back-sombra
        className={`absolute inset-0 rounded-t-2xl bg-[rgb(10_16_30/0.22)] ${baseRedondeada}`}
      />
      {/* Faldón: la carpeta sigue 20px por debajo de donde termina.
          No se ve nunca de frente —la carpeta siguiente lo tapa— pero
          rellena las dos esquinas que la curva de esa carpeta deja
          descubiertas. La pila solapa 2px y ese radio mide 16, así que
          por el hueco se veía esta carpeta cortada en seco y, más
          abajo, el fondo: eso era la punta. Ahora el color llega hasta
          donde la siguiente ya tiene el ancho completo — 16px le
          alcanzaban justo, y con 20 quedan 4 de colchón para los
          subpíxeles y para los tres grosores de tapa.
          Va colgado del lomo (`top-full`) para acompañarlo cuando se
          estira en hover, y con el mismo 12% de sombra con el que
          cierra la tapa, para que el empalme no cambie de tono. */}
      {!esUltima && (
        <span
          data-carpeta-faldon
          className={`absolute inset-x-0 top-full hidden h-5 md:block ${tinte.carpeta}`}
        >
          <span className="absolute inset-0 bg-[rgb(10_16_30/0.12)]" />
        </span>
      )}
    </span>
  );
}
