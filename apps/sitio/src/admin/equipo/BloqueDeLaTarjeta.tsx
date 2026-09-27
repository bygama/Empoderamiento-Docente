"use client";

import { LARGO_MAXIMO } from "@ed/db/slug";
import { CampoFoto, Casilla, Seleccion, TextoCorto } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import { errorDe } from "@/admin/campos/errores";
import { fotosParaElegir, subirFoto } from "@/datos/acciones/fotos";
import { ACERCAMIENTO, NIVELES, NUMEROS_DE_NIVEL, TOPES, type Nivel } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import type { PropsDeBloque } from "./bloques";

const EN_LISTA = new Intl.ListFormat("es", { type: "conjunction" });

/** Cómo se lee un nivel en su lista: con cuántos lugares tiene y quién los ocupa hoy. */
function opcionDe(nivel: Nivel, ocupan: readonly string[]) {
  const { rotulo, lugares } = NIVELES[nivel - 1];
  if (lugares === null) return { valor: String(nivel), etiqueta: rotulo };
  const cuantos = lugares === 1 ? "una persona" : `${lugares} personas`;
  return { valor: String(nivel), etiqueta: `${rotulo} · ${cuantos}${ocupan.length ? ` (hoy ${EN_LISTA.format(ocupan)})` : ""}` };
}

/** La ayuda de la URL: sigue al nombre hasta que se escribe o se publica; después, el link viejo se pierde. */
function ayudaDeLaUrl(slug: string, slugPublicado: string | null) {
  const asi = `Así queda: /quienes-somos?persona=${slug || "…"}.`;
  if (slugPublicado === null) return `${asi} Sigue al nombre hasta que la escribas vos o se publique.`;
  return `${asi} Si la cambiás, el link viejo (?persona=${slugPublicado}) abre la página sin el perfil; cuando cada persona tenga su página propia, el viejo va a llevar al nuevo.`;
}

/**
 * La tarjeta y la URL de un perfil (SPEC §7.2 de `work/equipo/`): lo que se
 * ve en la grilla de Quiénes somos y la dirección del perfil. Con «Sin foto»,
 * el campo de la foto se va: la tarjeta es tipográfica.
 */
type Props = PropsDeBloque & {
  porNivel: Readonly<Record<Nivel, readonly string[]>>;
  slugPublicado: string | null;
};

export function BloqueDeLaTarjeta({ form, cambiar, errores, porNivel, slugPublicado }: Props) {
  const error = (camino: string) => errorDe(errores, camino);
  return (
    <>
      <Bloque id="bloque-tarjeta" titulo="La tarjeta">
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            <TextoCorto nombre="nombre" etiqueta="Nombre" ayuda="Como va en la tarjeta: el nombre y un apellido." maximo={TOPES.nombre} valor={form.nombre} alCambiar={(v) => cambiar("nombre", v)} error={error("nombre")} />
            <TextoCorto nombre="rol" etiqueta="Rol" ayuda="El de la tarjeta, corto: «Directora General»." maximo={TOPES.rol} valor={form.rol} alCambiar={(v) => cambiar("rol", v)} error={error("rol")} />
            <TextoCorto nombre="pais" etiqueta="País" maximo={TOPES.pais} valor={form.pais} alCambiar={(v) => cambiar("pais", v)} error={error("pais")} />
            <Seleccion
              nombre="nivel"
              etiqueta="Nivel"
              ayuda="Dónde va la tarjeta en Quiénes somos. La Dirección general y la Dirección tienen los lugares contados: una al centro y dos a los costados."
              opciones={NUMEROS_DE_NIVEL.map((n) => opcionDe(n, porNivel[n]))}
              sinElegir="Elegí el nivel"
              valor={form.nivel === null ? "" : String(form.nivel)}
              alCambiar={(v) => cambiar("nivel", NUMEROS_DE_NIVEL.find((n) => String(n) === v) ?? null)}
              error={error("nivel")}
            />
          </div>
        </div>
        <Casilla
          nombre="sinFoto"
          etiqueta="Sin foto"
          ayuda="La persona pidió no publicar su foto: la tarjeta va tipográfica, con sus iniciales."
          valor={form.sinFoto}
          alCambiar={(v) => cambiar("sinFoto", v)}
          error={error("sinFoto")}
        />
        {form.sinFoto ? null : (
          <>
            <CampoFoto
              nombre="foto"
              etiqueta="Foto de la tarjeta"
              ayuda="Cubre la tarjeta entera: el punto de foco deja el rostro a la vista. El texto alternativo lo lee un lector de pantalla: el nombre alcanza."
              valor={form.foto}
              alCambiar={(v) => cambiar("foto", v)}
              subir={subirFoto}
              elegir={fotosParaElegir}
              maximoBytes={MAXIMO_BYTES}
              error={error("foto")}
            />
            <TextoCorto
              nombre="acercamiento"
              etiqueta="Acercamiento"
              ayuda={`Entre ${ACERCAMIENTO.minimo} y ${String(ACERCAMIENTO.maximo).replace(".", ",")}: cuánto se acerca la foto para que el rostro pese lo mismo que el de las demás tarjetas del nivel. 1 es la foto tal cual.`}
              maximo={4}
              valor={form.acercamiento}
              alCambiar={(v) => cambiar("acercamiento", v.replace(/[^\d.,]/g, ""))}
              error={error("acercamiento")}
            />
          </>
        )}
      </Bloque>
      <Bloque id="bloque-url" titulo="La URL">
        <TextoCorto
          nombre="slug"
          etiqueta="URL del perfil"
          ayuda={ayudaDeLaUrl(form.slug, slugPublicado)}
          maximo={LARGO_MAXIMO}
          valor={form.slug}
          alCambiar={(v) => cambiar("slug", v)}
          error={error("slug")}
        />
      </Bloque>
    </>
  );
}
