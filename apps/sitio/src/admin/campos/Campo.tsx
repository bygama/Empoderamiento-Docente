import { use } from "react";
import { CampoFoto, ListaFija, Parrafo, resolverCambio, Seleccion, TextoCorto, type Cambio } from "@ed/kit-admin";
import { subirFoto } from "@/datos/acciones/fotos";
import { valorVacio, type Descripcion } from "@/lib/contenido/descripcion";
import { MAXIMO_BYTES, type ValorFoto } from "@/lib/contenido/fotos";
import { resumirItem } from "@/lib/contenido/resumen";
import { ContextoDeErrores, errorDe, estaEn } from "./errores";

export type PropsDeCampo = {
  /** Camino del campo («hero.tarjetas.0.foto»): solo para ids únicos. */
  nombre: string;
  descripcion: Descripcion;
  valor: unknown;
  alCambiar: (valor: Cambio<unknown>) => void;
  /** La raíz de una sección o de un ítem no lleva caja propia: ya la tiene su bloque. */
  raiz?: boolean;
  /**
   * La raíz de una sección o de un ítem de lista: sus campos van de a dos
   * cuando su contenedor (`@container`) tiene lugar, y las listas y los
   * párrafos a todo el ancho. La raíz de un opcional no la lleva: queda
   * apilada adentro de su columna.
   */
  columnas?: boolean;
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
 * Los controles son los de `@ed/kit-admin`, que no conocen este dibujante:
 * reciben props planas (etiqueta, ayuda, máximo, su `error`…) y la subida de
 * fotos por prop (AGENTS.md §12). Este archivo es el que conoce `Descripcion`,
 * `datos/` y los errores del último guardado (`errores.ts`), y se queda en la
 * app. Un control que cambia borra su error.
 */
export function Campo({ nombre, descripcion, valor, alCambiar, raiz = false, columnas = false }: PropsDeCampo) {
  const { errores, limpiar } = use(ContextoDeErrores);
  const texto = typeof valor === "string" ? valor : "";
  // Los controles de una hoja: su error y, al cambiar, lo borran.
  const hoja = {
    nombre,
    etiqueta: descripcion.etiqueta,
    ayuda: descripcion.ayuda,
    error: errorDe(errores, nombre),
    alCambiar: (v: Cambio<unknown>) => {
      limpiar(nombre);
      alCambiar(v);
    },
  };
  switch (descripcion.tipo) {
    case "textoCorto":
      return <TextoCorto {...hoja} maximo={descripcion.maximo} recomendado={descripcion.recomendado} valor={texto} />;
    case "parrafo":
      return <Parrafo {...hoja} maximo={descripcion.maximo} valor={texto} />;
    case "rutaInterna":
      // Una ruta se lee como es: la etiqueta de cada opción es la ruta misma.
      return <Seleccion {...hoja} opciones={descripcion.opciones.map((ruta) => ({ valor: ruta, etiqueta: ruta }))} sinElegir="Elegí una ruta" valor={texto} />;
    case "foto":
      // Si el valor no es un objeto (nulo, viejo, corrupto), lo reemplaza un
      // vacío del mismo tipo: los dos `as ValorFoto` son seguros porque acá
      // adentro `descripcion.tipo` ya es "foto".
      return (
        <CampoFoto
          {...hoja}
          valor={valor && typeof valor === "object" ? (valor as ValorFoto) : (valorVacio(descripcion) as ValorFoto)}
          subir={subirFoto}
          maximoBytes={MAXIMO_BYTES}
        />
      );
    case "listaFija":
      return (
        <ListaFija
          nombre={nombre}
          etiqueta={descripcion.etiqueta}
          etiquetaItem={descripcion.item.etiqueta}
          cantidad={descripcion.cantidad}
          ayuda={descripcion.ayuda}
          itemVacio={() => valorVacio(descripcion.item)}
          valor={Array.isArray(valor) ? valor : []}
          alCambiar={alCambiar}
          resumenDe={(item) => resumirItem(descripcion.item, item)}
          conError={(i) => Object.keys(errores).some((camino) => estaEn(camino, `${nombre}.${i}`))}
          porItem={(i, item, cambiarItem) => <Campo raiz columnas nombre={`${nombre}.${i}`} descripcion={descripcion.item} valor={item} alCambiar={cambiarItem} />}
        />
      );
    case "opcional":
      return <CampoOpcional nombre={nombre} descripcion={descripcion} valor={valor} alCambiar={alCambiar} />;
    case "grupo":
      return <CampoGrupo nombre={nombre} descripcion={descripcion} valor={valor} alCambiar={alCambiar} raiz={raiz} columnas={columnas} />;
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
      <label className="flex items-center gap-2 text-admin-meta font-medium">
        {/* El tilde en el azul de la marca, no en el del navegador. */}
        <input type="checkbox" className="size-4 accent-azul-principal" checked={activo} onChange={(e) => alCambiar(e.target.checked ? valorVacio(descripcion.de) : null)} />
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
  columnas: boolean;
};

/** Un grupo de campos: sin caja propia en la raíz de una sección o un ítem, con `fieldset` en cualquier otro lado. */
function CampoGrupo({ nombre, descripcion, valor, alCambiar, raiz, columnas }: PropsGrupo) {
  // El valor y la descripción salen del mismo esquema ya validado: un «grupo» siempre trae un objeto por clave.
  const grupo = (valor ?? {}) as Record<string, unknown>;
  const campos = descripcion.campos.map(({ clave, descripcion: d }) => {
    const campo = (
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
    );
    // En dos columnas, una lista o un párrafo ocupan todo el ancho: partidos a la mitad no se leen.
    return columnas && (d.tipo === "listaFija" || d.tipo === "parrafo") ? (
      <div key={clave} className="@2xl:col-span-2">
        {campo}
      </div>
    ) : (
      campo
    );
  });
  if (raiz) return <div className={columnas ? "grid items-start gap-5 @2xl:grid-cols-2" : "space-y-5"}>{campos}</div>;
  // Sin caja (SPEC §5 de `work/editor-sin-pared/`): el `legend` y sus campos
  // de a dos cuando su propio ancho lo permite. `min-w-0` le saca al
  // `fieldset` el ancho mínimo que el navegador le pone de fábrica.
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-display text-admin-seccion font-bold">{descripcion.etiqueta}</legend>
      {descripcion.ayuda ? <p className="text-admin-meta text-gris-texto">{descripcion.ayuda}</p> : null}
      <div className="@container">
        <div className="grid items-start gap-4 @md:grid-cols-2">{campos}</div>
      </div>
    </fieldset>
  );
}
