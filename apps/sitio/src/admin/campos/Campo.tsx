import { subirFoto } from "@/datos/acciones/fotos";
import { valorVacio, type Descripcion } from "@/lib/contenido/descripcion";
import type { ValorFoto } from "@/lib/contenido/fotos";
import { resolverCambio, type Cambio } from "./cambio";
import { CampoFoto } from "./CampoFoto";
import { ListaFija } from "./ListaFija";
import { Parrafo } from "./Parrafo";
import { RutaInterna } from "./RutaInterna";
import { TextoCorto } from "./TextoCorto";

export type PropsDeCampo = {
  /** Camino del campo («hero.tarjetas.0.foto»): solo para ids únicos. */
  nombre: string;
  descripcion: Descripcion;
  valor: unknown;
  alCambiar: (valor: Cambio<unknown>) => void;
  /** La raíz de una sección o de un ítem no lleva caja propia: ya la tiene su bloque. */
  raiz?: boolean;
};

/**
 * Dibuja un campo según su descripción (SPEC §4.1: el formulario sale del
 * esquema, sin JSX por sección; excepción acotada a AGENTS.md §12). Los
 * `typeof`/`Array.isArray` cubren un valor a medias o con la forma vieja;
 * cada `as` de abajo tiene su propio comentario porque TypeScript no puede
 * inferir solo que el valor calza con el tipo de su rama. «opcional» y
 * «grupo» tienen su propia lógica (activarse, ser o no la raíz) y salen a
 * `CampoOpcional`/`CampoGrupo`: react-doctor marcaba a `Campo` con los siete
 * casos inline como difícil de seguir (complejidad ciclomática 17, AGENTS.md
 * §5.8). `alCambiar` acepta un valor o un `Cambio<T>` (un armador contra el
 * valor más fresco): lo necesitan los campos con algo asíncrono adentro
 * (`CampoFoto`) y los que arman un valor compuesto (`CampoGrupo`,
 * `ListaFija`), para no pisar una edición hecha en otro campo mientras algo
 * todavía no resolvió.
 *
 * Es el único archivo de `admin/campos/` que conoce `Descripcion` y la app:
 * los controles reciben props planas (etiqueta, ayuda, máximo…) y la subida
 * de fotos por prop, para mudarse a `packages/kit-admin` en la fase 2 sin
 * llevarse este dibujante (AGENTS.md §12).
 */
export function Campo({ nombre, descripcion, valor, alCambiar, raiz = false }: PropsDeCampo) {
  const texto = typeof valor === "string" ? valor : "";
  switch (descripcion.tipo) {
    case "textoCorto":
      return <TextoCorto nombre={nombre} etiqueta={descripcion.etiqueta} maximo={descripcion.maximo} ayuda={descripcion.ayuda} valor={texto} alCambiar={alCambiar} />;
    case "parrafo":
      return <Parrafo nombre={nombre} etiqueta={descripcion.etiqueta} maximo={descripcion.maximo} ayuda={descripcion.ayuda} valor={texto} alCambiar={alCambiar} />;
    case "rutaInterna":
      return <RutaInterna nombre={nombre} etiqueta={descripcion.etiqueta} opciones={descripcion.opciones} ayuda={descripcion.ayuda} valor={texto} alCambiar={alCambiar} />;
    case "foto":
      // Si el valor no es un objeto (nulo, viejo, corrupto), lo reemplaza un
      // vacío del mismo tipo: los dos `as ValorFoto` son seguros porque acá
      // adentro `descripcion.tipo` ya es "foto".
      return (
        <CampoFoto
          nombre={nombre}
          etiqueta={descripcion.etiqueta}
          ayuda={descripcion.ayuda}
          valor={valor && typeof valor === "object" ? (valor as ValorFoto) : (valorVacio(descripcion) as ValorFoto)}
          alCambiar={alCambiar}
          subir={subirFoto}
        />
      );
    case "listaFija":
      return (
        <ListaFija
          etiqueta={descripcion.etiqueta}
          etiquetaItem={descripcion.item.etiqueta}
          cantidad={descripcion.cantidad}
          ayuda={descripcion.ayuda}
          itemVacio={() => valorVacio(descripcion.item)}
          valor={Array.isArray(valor) ? valor : []}
          alCambiar={alCambiar}
          porItem={(i, item, cambiarItem) => <Campo raiz nombre={`${nombre}.${i}`} descripcion={descripcion.item} valor={item} alCambiar={cambiarItem} />}
        />
      );
    case "opcional":
      return <CampoOpcional nombre={nombre} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />;
    case "grupo":
      return <CampoGrupo nombre={nombre} descripcion={descripcion} valor={valor} alCambiar={alCambiar} raiz={raiz} />;
  }
}

type PropsOpcional = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "opcional" }>;
  valor: unknown;
  alCambiar: (valor: Cambio<unknown>) => void;
};

/** Un campo que puede no llevarse: la casilla decide, y su control solo aparece si está activa. */
function CampoOpcional({ nombre, descripcion, valor, alCambiar }: PropsOpcional) {
  const activo = valor !== null && valor !== undefined;
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={activo} onChange={(e) => alCambiar(e.target.checked ? valorVacio(descripcion.de) : null)} />
        Lleva {descripcion.etiqueta.toLowerCase()}
      </label>
      {activo ? <Campo raiz nombre={nombre} descripcion={descripcion.de} valor={valor} alCambiar={alCambiar} /> : null}
    </div>
  );
}

type PropsGrupo = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "grupo" }>;
  valor: unknown;
  alCambiar: (valor: Cambio<unknown>) => void;
  raiz: boolean;
};

/** Un grupo de campos: sin caja propia en la raíz de una sección o un ítem, con `fieldset` en cualquier otro lado. */
function CampoGrupo({ nombre, descripcion, valor, alCambiar, raiz }: PropsGrupo) {
  // El valor y la descripción salen del mismo esquema ya validado: un «grupo» siempre trae un objeto por clave.
  const grupo = (valor ?? {}) as Record<string, unknown>;
  const campos = descripcion.campos.map(({ clave, descripcion: d }) => (
    <Campo
      key={clave}
      nombre={`${nombre}.${clave}`}
      descripcion={d}
      valor={grupo[clave]}
      alCambiar={(v) =>
        // El merge se arma contra el grupo más fresco (`actual`), no contra
        // el `grupo` de este render: si `v` llega tarde (una foto que
        // termina de subir), no pisa lo que se haya tocado en otro campo
        // del mismo grupo mientras tanto.
        alCambiar((actual: unknown) => {
          // Mismo supuesto que `grupo` arriba: el valor de un «grupo» siempre es un objeto por clave.
          const base = (actual ?? {}) as Record<string, unknown>;
          return { ...base, [clave]: resolverCambio(v, base[clave]) };
        })
      }
    />
  ));
  if (raiz) return <div className="space-y-5">{campos}</div>;
  return (
    <fieldset className="space-y-4 rounded-lg border border-azul-claro/60 p-4">
      <legend className="px-1 text-sm font-medium">{descripcion.etiqueta}</legend>
      {descripcion.ayuda ? <p className="text-xs text-gris-texto">{descripcion.ayuda}</p> : null}
      {campos}
    </fieldset>
  );
}
