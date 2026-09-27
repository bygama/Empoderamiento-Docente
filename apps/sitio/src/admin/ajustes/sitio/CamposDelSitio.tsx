import { Apartado, TextoCorto } from "@ed/kit-admin";
import { ETIQUETAS, type CampoDelSitio, type ValoresDelSitio } from "@/config/formulario-del-sitio";

type Props = {
  valores: ValoresDelSitio;
  errores: Partial<Record<CampoDelSitio, string>>;
  alCambiar: (campo: CampoDelSitio, valor: string) => void;
};

/** El largo de cada campo: lo que entra cómodo en su lugar del sitio. */
const MAXIMO: Record<CampoDelSitio, number> = {
  correo: 254,
  whatsapp: 20,
  calle: 120,
  complemento: 120,
  ciudad: 80,
  region: 80,
  pais: 60,
  paises: 450,
  instagram: 300,
  facebook: 300,
  linkedin: 300,
};

const AYUDA: Partial<Record<CampoDelSitio, string>> = {
  whatsapp: "Con el código de país y solo números: 56912345678. Vacío, Contacto no muestra el botón de WhatsApp.",
  complemento: "Opcional.",
  region: "Opcional.",
  paises: "Separados por coma, en el orden en que se muestran. De 1 a 10.",
  instagram: "La URL entera, con https://. Vacía, la red no aparece.",
  facebook: "La URL entera, con https://. Vacía, la red no aparece.",
  linkedin: "La URL entera, con https://. Vacía, la red no aparece.",
};

/** Cada apartado dice dónde se ve lo que tiene: es la consecuencia de tocarlo (DESIGN.md §11, «Apartado»). */
const APARTADOS: ReadonlyArray<{ id: string; titulo: string; descripcion: string; campos: readonly CampoDelSitio[] }> = [
  { id: "contacto", titulo: "Contacto", descripcion: "Se ven en Contacto, en el menú del celular y en los errores de los formularios.", campos: ["correo", "whatsapp"] },
  { id: "direccion", titulo: "Dirección", descripcion: "Se ve en Contacto, al lado del formulario.", campos: ["calle", "complemento", "ciudad", "region", "pais"] },
  {
    id: "paises",
    titulo: "Países",
    descripcion: "Se ven en el pie de todas las páginas y en el campo «País» de los formularios de Contacto y de CV, más «Otro».",
    campos: ["paises"],
  },
  { id: "redes", titulo: "Redes", descripcion: "Se ven en el pie, en el menú del celular y al final de Novedades.", campos: ["instagram", "facebook", "linkedin"] },
];

/** Los apartados de Datos del sitio, con sus campos. El estado lo lleva el formulario. */
export function CamposDelSitio({ valores, errores, alCambiar }: Props) {
  return (
    <div>
      {APARTADOS.map((a) => (
        <Apartado key={a.id} id={a.id} titulo={a.titulo} descripcion={a.descripcion}>
          <div className="max-w-md space-y-5">
            {a.campos.map((campo) => (
              <TextoCorto
                key={campo}
                nombre={`sitio-${campo}`}
                etiqueta={ETIQUETAS[campo]}
                maximo={MAXIMO[campo]}
                ayuda={AYUDA[campo]}
                valor={valores[campo]}
                alCambiar={(valor) => alCambiar(campo, valor)}
                error={errores[campo]}
              />
            ))}
          </div>
        </Apartado>
      ))}
    </div>
  );
}
