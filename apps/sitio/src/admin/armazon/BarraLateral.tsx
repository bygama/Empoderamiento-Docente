import { puede } from "@ed/auth";
import { listaDeAliados } from "@/datos/consultas/aliados-del-admin";
import { listaDeCasos } from "@/datos/consultas/casos-del-admin";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";
import { cuantosLinksRotos } from "@/datos/consultas/materiales-del-admin";
import { nuevosPorBandeja } from "@/datos/consultas/mensajes";
import { ContenidoDeLaBarra, type Usuario } from "./barra-lateral/ContenidoDeLaBarra";
import { MODULOS } from "./barra-lateral/modulos";
import { PanelMovil } from "./barra-lateral/PanelMovil";
import type { Cuenta } from "./Numero";
import type { Tema } from "./tema";

/**
 * Si algo de Contenido (una página, un caso, un aliado) tiene cambios sin
 * publicar. Si la base no contestó, `false`: la sidebar nunca voltea el admin,
 * se dibuja igual sin el punto, y el error queda en el log.
 */
async function hayContenidoSinPublicar(): Promise<boolean> {
  try {
    const listas = await Promise.all([listaDePaginas(), listaDeCasos(), listaDeAliados()]);
    return listas.some((filas) => filas.some((f) => f.estado.borradorEn));
  } catch (e) {
    console.error("BarraLateral: sin el punto de «sin publicar»:", e);
    return false;
  }
}

/** Un número de la sidebar, aislado: si su consulta tira, la entrada va sin número y el error queda en el log. */
async function numero(modulo: string, contar: () => Promise<number>, que: string): Promise<Record<string, Cuenta>> {
  try {
    const cuantos = await contar();
    return cuantos ? { [modulo]: { cuantos, que } } : {};
  } catch (e) {
    console.error(`BarraLateral: sin el número de ${modulo}:`, e);
    return {};
  }
}

/**
 * Los números de la sidebar: en Mensajes, los sin leer de las bandejas que
 * ese rol ve; en Biblioteca, los publicados con el link roto. Como el punto,
 * si la base no contestó la sidebar se dibuja igual, sin número.
 */
async function numerosDe(rol: unknown): Promise<Record<string, Cuenta>> {
  const [mensajes, biblioteca] = await Promise.all([
    numero("mensajes", async () => Object.values(await nuevosPorBandeja(rol)).reduce((suma, n) => suma + n, 0), "sin leer"),
    puede(rol, "editarBiblioteca") ? numero("biblioteca", cuantosLinksRotos, "con el link roto") : {},
  ]);
  return { ...mensajes, ...biblioteca };
}

/**
 * La sidebar del admin: fija a la izquierda desde `lg` y, por debajo, el
 * panel del celular. Los dos muestran el mismo contenido; el que no
 * corresponde al ancho queda con `display: none`, fuera del árbol de
 * accesibilidad. Cada rol ve los módulos de sus capacidades (`modulos.ts`),
 * calculados acá, en el servidor. Esconder no es la seguridad: cada módulo
 * pasa por su guarda y cada acción verifica el permiso aparte. `data-barra`
 * es lo que el tema mixto pinta con el azul de la marca (globals.css).
 */
export async function BarraLateral({ usuario, tema }: { usuario: Usuario; tema: Tema }) {
  const visibles = MODULOS.filter((m) => !m.capacidad || puede(usuario.rol, m.capacidad)).map((m) => m.clave);
  const [sinPublicar, numeros] = await Promise.all([hayContenidoSinPublicar(), numerosDe(usuario.rol)]);
  const conPunto = sinPublicar ? ["contenido"] : [];
  const contenido = <ContenidoDeLaBarra usuario={usuario} tema={tema} visibles={visibles} conPunto={conPunto} numeros={numeros} />;
  return (
    <>
      <aside data-barra className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-gris-fondo lg:block">{contenido}</aside>
      <PanelMovil>{contenido}</PanelMovil>
    </>
  );
}
