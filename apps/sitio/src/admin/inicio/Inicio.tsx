import { puede } from "@ed/auth";
import { BotonEnlace } from "@ed/kit-admin";
import { MODULOS } from "@/admin/armazon/barra-lateral/modulos";
import { Encabezado } from "@/admin/armazon/Encabezado";
import type { DatosDelInicio } from "@/datos/inicio/inicio";
import { ActividadReciente } from "./ActividadReciente";
import { DesdeTuVisita } from "./DesdeTuVisita";
import { EstaSemana } from "./EstaSemana";
import { Pendientes } from "./Pendientes";

/** El primer nombre de la cuenta, para el saludo: «Daniela Reyes-Gasperini» → «Daniela». */
function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? "";
}

/**
 * El Inicio del admin (DESIGN.md §11): responde «¿qué tengo que hacer?» y
 * «¿cómo va el sitio?» de un vistazo. Arriba, el saludo con lo que pasó desde
 * tu última visita y los accesos rápidos de los módulos que usás; abajo, en
 * el orden en que se lee, los pendientes, los números de la semana y la
 * actividad. Desde `lg` van en dos columnas: lo que hay que hacer a la
 * izquierda y cómo va a la derecha, las dos arriba del pliegue. Sin primario:
 * nada es «la» acción de esta pantalla.
 */
export function Inicio({ datos, rol }: { datos: DatosDelInicio; rol: unknown }) {
  const nombre = primerNombre(datos.nombre);
  const accesos = MODULOS.flatMap((m) => (m.accesoRapido && (!m.capacidad || puede(rol, m.capacidad)) ? [m.accesoRapido] : []));
  return (
    <>
      <Encabezado
        titulo={nombre ? `Hola, ${nombre}` : "Hola"}
        detalle={<DesdeTuVisita visita={datos.desdeTuVisita} />}
        acciones={
          accesos.length
            ? accesos.map((a) => (
                <BotonEnlace key={a.href} variante="secundario" href={a.href}>
                  {a.etiqueta}
                </BotonEnlace>
              ))
            : undefined
        }
      />
      {/*
        Esta semana ocupa las dos filas de la derecha: en el DOM (y en el
        celular) va entre los pendientes y la actividad. La segunda fila es
        flexible para que, si la semana es más alta que la columna de la
        izquierda, el sobrante vaya abajo y no entre los pendientes y la
        actividad.
      */}
      <div className="mt-8 grid gap-10 lg:grid-cols-5 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8">
        <div className="lg:col-span-3">
          <Pendientes filas={datos.pendientes} />
        </div>
        <div className="lg:col-span-2 lg:row-span-2">
          <EstaSemana numeros={datos.numeros} verMetricas={datos.verMetricas} />
        </div>
        <div className="lg:col-span-3">
          <ActividadReciente eventos={datos.actividad} verActividad={datos.verActividad} />
        </div>
      </div>
    </>
  );
}
