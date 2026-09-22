import { Aviso } from "@/admin/armazon/Campos";
import { estadoDeMetricas, tarjetas } from "@/datos/consultas/metricas";
import { ActualizarAhora } from "./ActualizarAhora";
import { Estado } from "./Estado";
import { Tarjeta } from "./Tarjeta";

const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });
// Sin `timeZoneName`: Intl no lo admite junto con `dateStyle`/`timeStyle`
// (tira TypeError). El «UTC» de la cabecera se agrega a mano en el texto.
const horaCorta = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

/** Cuánta gente entra al sitio y qué páginas mira: la primera sección de la portada. */
export async function PanelMetricas() {
  const estado = await estadoDeMetricas();
  const hora = estado.ultima ? horaCorta.format(estado.ultima.corridaEn) : null;
  const cabecera = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 id="metricas" className="font-display text-admin-seccion font-bold">Cuánta gente entra al sitio</h2>
        <p className="text-admin-meta text-gris-texto">
          {estado.hastaDia
            ? `Datos hasta el ${fechaLarga.format(new Date(`${estado.hastaDia}T00:00:00.000Z`))} (días en hora universal).`
            : "Todavía sin datos."}
          {estado.ultima ? (estado.ultima.ok ? ` Actualizado el ${hora} UTC.` : ` Último intento el ${hora} UTC.`) : ""}
        </p>
      </div>
      <ActualizarAhora />
    </div>
  );

  // Un solo cuerpo según el estado, para que el aviso de fallo (abajo) se vea
  // siempre que exista, sin importar si además falta el token o no hay datos.
  let cuerpo: React.ReactNode;
  if (!estado.hayVariables) {
    cuerpo = (
      <Estado titulo="Faltan las variables de Vercel" texto="Sin el token y el ID del proyecto no hay nada que copiar. Están explicadas en el README, sección «Variables de entorno»." />
    );
  } else if (!estado.hastaDia) {
    cuerpo = (
      <Estado titulo="El sitio empieza a contar cuando se publica" texto="La primera copia llega al día siguiente del primer deploy. Si ya pasó un día, tocá «Actualizar ahora»." />
    );
  } else {
    const cards = await tarjetas();
    cuerpo =
      cards.length === 0 ? (
        <Estado titulo="Las tarjetas llegan con la próxima copia" texto="Hay días copiados pero todavía ninguna ventana de 7 o 30 días. Tocá «Actualizar ahora» o esperá la próxima corrida." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.flatMap((t) => [
            <Tarjeta key={`v${t.dias}`} etiqueta={`Visitantes, últimos ${t.dias} días`} valor={t.visitantes} variacion={t.variacionVisitantes} />,
            <Tarjeta key={`p${t.dias}`} etiqueta={`Vistas, últimos ${t.dias} días`} valor={t.vistas} variacion={t.variacionVistas} />,
          ])}
        </div>
      );
  }

  return (
    <section aria-labelledby="metricas" className="space-y-4">
      {cabecera}
      {estado.ultima && !estado.ultima.ok ? <Aviso tono="error">La última actualización falló: {estado.ultima.detalle}</Aviso> : null}
      {cuerpo}
    </section>
  );
}
