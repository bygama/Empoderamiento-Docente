import { Aviso } from "@/admin/armazon/Campos";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { ActualizarAhora } from "@/admin/metricas/ActualizarAhora";
import { actualizarBusquedasAhora } from "@/datos/acciones/actualizar-busquedas";
import { DIAS_DEL_PERIODO, estadoDeBusquedas, resumenDeBusquedas } from "@/datos/consultas/busquedas";
import { ConDatos } from "./ConDatos";
import { diaLegible } from "./formato";

// Sin `timeZoneName`: Intl no lo admite junto con `dateStyle`/`timeStyle`. El
// «UTC» se agrega a mano, como en el Resumen.
const horaCorta = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

// Los pasos para conectar, cada uno diciendo quién lo hace. Los mismos que el
// README, «Search Console».
const PASOS = [
  "Verificá el dominio en Search Console con la cuenta de Google de ED: se hace una vez, con un registro TXT en el DNS.",
  "Pedile a quien desarrolla el sitio una cuenta de servicio de Google Cloud con la API de Search Console: te va a pasar un correo que termina en .iam.gserviceaccount.com.",
  "En Search Console › Configuración › Usuarios y permisos, agregá ese correo con el permiso «Restringido»: solo puede leer.",
  "Quien desarrolla carga las tres variables en Vercel. La primera copia llega esa noche, o antes con «Actualizar ahora».",
];

/**
 * Qué buscó la gente en Google para llegar al sitio (SPEC §4). Lee solo de la
 * base: la copia la hace una tarea del cron diario. `puedeConectar` decide qué
 * ve quien entra sin conexión: los pasos, o que todavía no está conectado.
 */
export async function PanelBusquedas({ puedeConectar }: { puedeConectar: boolean }) {
  const estado = await estadoDeBusquedas();
  const resumen = estado.conectado && estado.hastaDia ? await resumenDeBusquedas(estado.hastaDia) : null;
  const hora = estado.ultima ? horaCorta.format(estado.ultima.corridaEn) : null;

  let cuerpo: React.ReactNode;
  if (!estado.conectado) {
    cuerpo = puedeConectar ? (
      <EstadoVacio titulo="Conectá Search Console" texto="Así vas a ver qué busca la gente en Google para llegar al sitio. Son cuatro pasos, una sola vez:" pasos={PASOS} />
    ) : (
      <EstadoVacio titulo="Todavía no está conectado" texto="Quien administra el sitio conecta Search Console desde acá. Mientras, el Resumen muestra las visitas." />
    );
  } else if (!resumen) {
    cuerpo = <EstadoVacio titulo="Los datos llegan con la primera copia" texto="Se copian una vez por día: la primera llega esta noche, o antes con «Actualizar ahora»." />;
  } else if (resumen.impresiones === 0) {
    cuerpo = <EstadoVacio titulo={`Todavía no aparecemos en Google en estos ${DIAS_DEL_PERIODO} días`} texto="Cuando el sitio salga en una búsqueda, acá vas a ver cuál fue y en qué puesto." />;
  } else {
    cuerpo = <ConDatos resumen={resumen} />;
  }

  return (
    <section aria-labelledby="busquedas" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="busquedas" className="font-display text-admin-seccion font-bold">
            Cómo nos encuentran en Google
          </h2>
          <p className="max-w-prose text-admin-meta text-gris-texto">
            {resumen ? `Últimos ${DIAS_DEL_PERIODO} días con datos: del ${diaLegible(resumen.desde)} al ${diaLegible(resumen.hasta)}. ` : ""}
            Google manda los datos con 2 o 3 días de atraso, y cuenta los días en hora del Pacífico.
            {estado.conectado && estado.ultima ? (estado.ultima.ok ? ` Actualizado el ${hora} UTC.` : ` Último intento el ${hora} UTC.`) : ""}
          </p>
        </div>
        <ActualizarAhora accion={actualizarBusquedasAhora} />
      </div>
      {/* Sin conexión, la última corrida siempre dice eso mismo: el estado vacío ya lo explica. */}
      {estado.conectado && estado.ultima && !estado.ultima.ok ? <Aviso tono="error">La última actualización falló: {estado.ultima.detalle}</Aviso> : null}
      {cuerpo}
    </section>
  );
}
