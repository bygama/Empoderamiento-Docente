"use client";

import { useId, useState, type FormEvent } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Momento } from "@/admin/armazon/Momento";
import { useFrenarSalida } from "@/admin/armazon/useFrenarSalida";
import { CAMPOS_DEL_SITIO, type CampoDelSitio, type ValoresDelSitio } from "@/config/formulario-del-sitio";
import { guardarDatosDelSitio } from "@/datos/acciones/datos-del-sitio";
import { VOLVER_A_AJUSTES } from "../pantallas";
import { CamposDelSitio } from "./CamposDelSitio";

type Props = { inicial: ValoresDelSitio; cambiadoEn: string | null; cambiadoPor: string | null };

/** Cuándo y quién los cambió por última vez, en el detalle del encabezado. */
function UltimoCambio({ cambiadoEn, cambiadoPor }: Omit<Props, "inicial">) {
  if (!cambiadoEn) return <span>Todavía como se cargaron al empezar.</span>;
  return (
    <span>
      Cambiados el <Momento iso={cambiadoEn} dia />
      {cambiadoPor ? ` por ${cambiadoPor}` : ""}.
    </span>
  );
}

/**
 * Ajustes › Datos del sitio (work/ajustes/SPEC.md §2.2): un formulario partido
 * en apartados, con un solo primario en el encabezado fijo, porque guardar es
 * publicar. Con cambios sin guardar, el encabezado pasa a navy y salir
 * pregunta, como en el editor de páginas. Un error vuelve a su campo y se
 * borra en cuanto se edita (DESIGN.md §11).
 *
 * El estado guarda solo lo que se cambió sobre `inicial`, que es lo guardado:
 * al guardar, la acción revalida esta pantalla y `inicial` llega con lo nuevo,
 * como `cambiadoEn` y `cambiadoPor`.
 */
export function FormularioDelSitio({ inicial, cambiadoEn, cambiadoPor }: Props) {
  const idDelFormulario = useId();
  const [cambios, setCambios] = useState<Partial<ValoresDelSitio>>({});
  const valores: ValoresDelSitio = { ...inicial, ...cambios };
  const [errores, setErrores] = useState<Partial<Record<CampoDelSitio, string>>>({});
  const [resultado, setResultado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const haySinGuardar = CAMPOS_DEL_SITIO.some((c) => valores[c] !== inicial[c]);
  useFrenarSalida(haySinGuardar);

  function alCambiar(campo: CampoDelSitio, valor: string) {
    setCambios((c) => ({ ...c, [campo]: valor }));
    setErrores((e) => {
      if (!e[campo]) return e;
      const sinEse = { ...e };
      delete sinEse[campo];
      return sinEse;
    });
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setGuardando(true);
    const r = await guardarDatosDelSitio(valores);
    setGuardando(false);
    setResultado(r);
    if (r.ok) {
      setCambios({});
      setErrores({});
      return;
    }
    const errs = r.errores ?? {};
    setErrores(errs);
    const primero = CAMPOS_DEL_SITIO.find((c) => errs[c]);
    if (primero) document.getElementById(`sitio-${primero}-campo`)?.focus();
  }

  return (
    <div className="space-y-2 pb-28 lg:pb-0">
      <Encabezado
        fijo
        resaltado={haySinGuardar}
        volver={VOLVER_A_AJUSTES}
        titulo="Datos del sitio"
        detalle={
          <>
            <span>Se ven en el pie de todas las páginas, el menú del celular, Contacto y los formularios. Se publican al guardar.</span>
            <UltimoCambio cambiadoEn={cambiadoEn} cambiadoPor={cambiadoPor} />
          </>
        }
        acciones={
          // El único naranja de la pantalla: guardar es publicar.
          <Boton variante="primario" sobreAzul={haySinGuardar} type="submit" form={idDelFormulario} disabled={guardando} aria-busy={guardando || undefined}>
            {guardando ? "Publicando…" : "Guardar y publicar"}
          </Boton>
        }
        avisos={
          resultado ? (
            <Aviso tono={resultado.ok ? "bien" : "error"} alCerrar={() => setResultado(null)}>
              {resultado.detalle}
            </Aviso>
          ) : null
        }
      />
      <form id={idDelFormulario} onSubmit={guardar} noValidate>
        <CamposDelSitio valores={valores} errores={errores} alCambiar={alCambiar} />
      </form>
    </div>
  );
}
