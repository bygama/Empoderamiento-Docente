import { TextoCorto } from "@ed/kit-admin";
import type { Aliado } from "@/features/aliados/contenido/aliado";
import { TOPES } from "@/features/aliados/contenido/modelo";
import { LogoYNombre } from "./EstadoDeLaMarca";

type Props = {
  /** Para quien no puede autorizar: solo la nota, de lectura. */
  bloqueada: boolean;
  notaGuardada: string;
  /** Lo que autorizaría el botón, si se muestra: marcado y todavía no autorizado así. */
  aAutorizar: Aliado | null;
  mostrarQueSeAutoriza: boolean;
  /** Por qué todavía no se puede autorizar. */
  falta: string | null;
  nota: string;
  alCambiarNota: (nota: string) => void;
};

/** Lo que ve quien puede autorizar: qué logo y qué nombre autoriza, por qué no todavía, y la nota. Quien no puede, solo la nota. */
export function CamposDeLaMarca({ bloqueada, notaGuardada, aAutorizar, mostrarQueSeAutoriza, falta, nota, alCambiarNota }: Props) {
  if (bloqueada) return notaGuardada ? <p className="text-admin-cuerpo">Consta en: {notaGuardada}</p> : null;
  return (
    <>
      {mostrarQueSeAutoriza && aAutorizar ? (
        <LogoYNombre titulo="Se va a autorizar" src={aAutorizar.logo.src} nombre={aAutorizar.nombre} tamano={aAutorizar.tamano} />
      ) : null}
      {falta ? <p className="text-admin-meta text-gris-texto">{falta}</p> : null}
      <TextoCorto
        nombre="autorizacion"
        etiqueta="Dónde consta la autorización"
        ayuda="La carta, el mail o la carpeta de Drive. Obligatorio para marcarlo."
        maximo={TOPES.autorizacion}
        valor={nota}
        alCambiar={alCambiarNota}
      />
    </>
  );
}
