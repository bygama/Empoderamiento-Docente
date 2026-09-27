import { Aviso } from "@/admin/armazon/Campos";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import type { FichaDeFoto as Ficha } from "@/datos/consultas/fotos";
import { FormularioDelAlt } from "./FormularioDelAlt";
import { peso, tipo, tituloDeLaFoto } from "./formato";
import { MiniaturaDeFoto } from "./MiniaturaDeFoto";
import { SalidaDeLaFoto } from "./SalidaDeLaFoto";
import { UsosDeLaFoto } from "./UsosDeLaFoto";

/** Quién la subió y cuándo, o que llegó con el sitio (las de `public/`, que cargó la migración). */
function QuienLaSubio({ ficha }: { ficha: Ficha }) {
  if (!ficha.subidaPor) return <span>Llegó con el sitio.</span>;
  return (
    <span>
      Subida por {ficha.subidaPor}, <Momento iso={ficha.subidaEn} relativo />.
    </span>
  );
}

/** Lo que le falta a la foto pide atención; que no se use es un dato, apagado; usada y con alt, nada. */
function EstadoDeLaFoto({ ficha }: { ficha: Ficha }) {
  if (!ficha.alt) return <Insignia tono="fuerte">Sin texto alternativo</Insignia>;
  return ficha.usos.length ? null : <Insignia tono="apagado">Sin usar</Insignia>;
}

/**
 * La ficha de una foto (SPEC §7.3 de `work/casos-aliados-fotos/`): «← Fotos»,
 * el alt como título con lo que le falta en la insignia, y en el detalle las
 * medidas, el peso, el tipo y quién la subió. Debajo, la foto entera al lado
 * de su texto alternativo, «Se usa en» y, al pie, reemplazar o borrar.
 */
export function FichaDeFoto({ ficha, subida }: { ficha: Ficha; subida: boolean }) {
  return (
    <div className="space-y-10">
      <Encabezado
        volver={{ href: "/admin/contenido/fotos", etiqueta: "Fotos" }}
        titulo={tituloDeLaFoto(ficha.alt)}
        estado={<EstadoDeLaFoto ficha={ficha} />}
        detalle={
          <>
            <span>
              {ficha.ancho} × {ficha.alto} px · {peso(ficha.bytes)} · {tipo(ficha.tipo)}
            </span>
            <QuienLaSubio ficha={ficha} />
          </>
        }
        avisos={subida ? <Aviso tono="bien">Se subió la foto: ya está en la biblioteca.</Aviso> : undefined}
      />
      <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <MiniaturaDeFoto src={ficha.src} tipo={ficha.tipo} sizes="(min-width: 1024px) 480px, 100vw" className="border border-azul-claro/60" />
        <FormularioDelAlt id={ficha.id} alt={ficha.alt} />
      </div>
      <UsosDeLaFoto usos={ficha.usos} />
      <SalidaDeLaFoto
        id={ficha.id}
        usos={ficha.usos.length}
        enElCodigo={ficha.usos.filter((u) => u.en === "codigo").length}
        delRepositorio={ficha.delRepositorio}
      />
    </div>
  );
}
