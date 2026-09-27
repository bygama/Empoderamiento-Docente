import { EstadoVacio } from "@ed/kit-admin";
import { DIAS_DEL_PERIODO, type EstadoDeBusquedas, type ResumenDeBusquedas } from "@/datos/consultas/busquedas";
import { ConDatos } from "./ConDatos";

// Los pasos para conectar, cada uno diciendo quién lo hace. Los mismos que el
// README, «Las métricas y lo programado».
const PASOS = [
  "Verificá el dominio en Search Console con la cuenta de Google de ED: se hace una vez, con un registro TXT en el DNS.",
  "Pedile a quien desarrolla el sitio una cuenta de servicio de Google Cloud con la API de Search Console: te va a pasar un correo que termina en .iam.gserviceaccount.com.",
  "En Search Console › Configuración › Usuarios y permisos, agregá ese correo con el permiso «Restringido»: solo puede leer.",
  "Quien desarrolla carga las tres variables en el servidor. La primera copia llega esa noche, o antes con «Actualizar ahora».",
];

function SinConectar({ puedeConectar }: { puedeConectar: boolean }) {
  return puedeConectar ? (
    <EstadoVacio titulo="Conectá Search Console" texto="Así vas a ver qué busca la gente en Google para llegar al sitio. Son cuatro pasos, una sola vez:" pasos={PASOS} />
  ) : (
    <EstadoVacio titulo="Todavía no está conectado" texto="Quien administra el sitio conecta Search Console desde acá. Mientras, el Resumen muestra las visitas." />
  );
}

/**
 * Lo que muestra Búsquedas según el estado (SPEC §4.2): sin conectar, los
 * pasos o que todavía no está; conectado sin días, que llegan con la primera
 * copia; sin impresiones, que todavía no aparecemos; y si no, los datos.
 */
export function CuerpoDeBusquedas({ estado, resumen, puedeConectar }: { estado: EstadoDeBusquedas; resumen: ResumenDeBusquedas | null; puedeConectar: boolean }) {
  if (!estado.conectado) return <SinConectar puedeConectar={puedeConectar} />;
  if (!resumen) {
    return <EstadoVacio titulo="Los datos llegan con la primera copia" texto="Se copian una vez por día: la primera llega esta noche, o antes con «Actualizar ahora»." />;
  }
  if (resumen.impresiones === 0) {
    return <EstadoVacio titulo={`Todavía no aparecemos en Google en estos ${DIAS_DEL_PERIODO} días`} texto="Cuando el sitio salga en una búsqueda, acá vas a ver cuál fue y en qué puesto." />;
  }
  return <ConDatos resumen={resumen} />;
}
