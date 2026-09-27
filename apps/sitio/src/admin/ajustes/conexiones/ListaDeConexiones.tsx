import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia, type Tono } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDeConexion, EstadoDeTarea } from "@/datos/conexiones";
import { VOLVER_A_AJUSTES } from "../pantallas";

/** «A, B y C». */
const enLista = (cosas: readonly string[]) => (cosas.length < 2 ? cosas.join("") : `${cosas.slice(0, -1).join(", ")} y ${cosas.at(-1)}`);

function insigniaDe(c: EstadoDeConexion): { tono: Tono; texto: string } {
  if (c.faltan.length) return { tono: "apagado", texto: "Sin configurar" };
  return c.conError ? { tono: "fuerte", texto: "Con error" } : { tono: "normal", texto: "Configurada" };
}

/** Una tarea, en una línea: cuándo corrió, si salió bien y por qué no; y si falló, cuándo fue la última correcta. */
function LineaDeTarea({ tarea }: { tarea: EstadoDeTarea }) {
  const { nombre, ultima, ultimaCorrecta } = tarea;
  if (!ultima) return <li>{nombre}: todavía no corrió.</li>;
  const cuando = <Momento iso={ultima.corridaEn.toISOString()} />;
  if (ultima.ok) {
    return (
      <li>
        {nombre}: la última corrida, el {cuando}, salió bien. {ultima.detalle}
      </li>
    );
  }
  return (
    <li>
      <span className="font-medium text-rojo-error">
        {nombre}: la última corrida, el {cuando}, falló. {ultima.detalle}
      </span>{" "}
      {ultimaCorrecta ? (
        <>
          La última correcta fue el <Momento iso={ultimaCorrecta.toISOString()} />.
        </>
      ) : (
        "Nunca salió bien."
      )}
    </li>
  );
}

/**
 * Ajustes › Conexiones (work/ajustes/SPEC.md §2.6): una `Lista` sin acciones,
 * porque se configuran en Vercel y no acá. Cada una dice para qué está, si
 * tiene sus variables (los nombres, nunca el valor) y cómo corrieron sus
 * tareas: así se ve por qué algo dejó de actualizarse sin llamar a quien
 * desarrolla.
 */
export function ListaDeConexiones({ conexiones }: { conexiones: readonly EstadoDeConexion[] }) {
  return (
    <div className="space-y-8">
      <Encabezado
        volver={VOLVER_A_AJUSTES}
        titulo="Conexiones"
        detalle="Los servicios de afuera de los que depende el sitio. Se configuran en Vercel, con sus variables; acá se ve si están y cómo anduvieron."
      />
      <Lista>
        {conexiones.map((c) => {
          const insignia = insigniaDe(c);
          return (
            <Fila
              key={c.clave}
              principal={c.nombre}
              detalle={
                <div className="space-y-1">
                  <p>{c.para}</p>
                  <p>{c.faltan.length ? `${c.faltan.length === 1 ? "Falta" : "Faltan"} ${enLista(c.faltan)}. ${c.sinConfigurar}` : "Tiene sus variables."}</p>
                  {c.tareasDeLaConexion.length ? (
                    <ul className="space-y-1">
                      {c.tareasDeLaConexion.map((t) => (
                        <LineaDeTarea key={t.clave} tarea={t} />
                      ))}
                    </ul>
                  ) : null}
                </div>
              }
              insignias={<Insignia tono={insignia.tono}>{insignia.texto}</Insignia>}
            />
          );
        })}
      </Lista>
    </div>
  );
}
