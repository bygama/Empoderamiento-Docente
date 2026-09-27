import { baseDeLosLinks, destinosPosibles, enlacesConCifras } from "@/datos/consultas/enlaces";
import { CrearEnlace } from "./enlaces/CrearEnlace";
import { ListaDeEnlaces } from "./enlaces/ListaDeEnlaces";
import { Bloque } from "./Seccion";

/**
 * Métricas › Links para compartir (SPEC de work/metricas-completas/ §6.4):
 * crear un link corto propio arriba y la lista abajo. El clic se cuenta en
 * el servidor, sin cookies; las visitas, con el `utm_campaign` que agrega la
 * redirección.
 */
export async function Enlaces() {
  const [enlaces, destinos] = await Promise.all([enlacesConCifras(), destinosPosibles()]);
  return (
    <div className="space-y-10">
      <Bloque id="crear" titulo="Crear un link" explicacion="Elegí la página, dónde lo vas a compartir y un nombre: sale un link corto que cuenta cuánta gente llega por ahí.">
        <CrearEnlace destinos={destinos} base={baseDeLosLinks()} />
      </Bloque>
      <Bloque id="links" titulo="Tus links" explicacion="Clics: las veces que se abrió el link. Visitas: las que contó la analítica al llegar. CV: los que se mandaron desde ahí.">
        <ListaDeEnlaces enlaces={enlaces} />
        <p className="max-w-prose text-admin-meta text-gris-texto">
          Un CV cuenta para un link cuando se manda en la misma visita en que se llegó por él. Si la persona se va y vuelve por otro lado, el CV cuenta en
          su canal, pero no en el link: saberlo pediría guardar algo en su navegador, y no guardamos nada.
        </p>
      </Bloque>
    </div>
  );
}
