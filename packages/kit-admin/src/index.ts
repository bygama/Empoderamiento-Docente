// La superficie pública de @ed/kit-admin. Lo que no sale por acá es interno.
//
// Regla del paquete: **nada de dominio de ED adentro** (AGENTS.md §3, la
// primera frontera). Los controles y las piezas de una pantalla reciben por
// prop lo que muestran —la etiqueta, la ayuda, el tope, las opciones, los
// links— y lo que hacen afuera, como subir una foto o mover una fila. Los
// tokens de las clases los define la app (README).

export { AccionesDeLaFicha } from "./AccionesDeLaFicha";
export { Apartado } from "./Apartado";
export { Aviso } from "./Aviso";
export { AvisoDeLaAccion, type AvisoDelEditor } from "./AvisoDelEditor";
export { Bloque } from "./Bloque";
export { Boton, BotonEnlace } from "./Boton";
export { Buscador } from "./Buscador";
export { resolverCambio, type Cambio } from "./cambio";
export { CampoContrasena } from "./CampoContrasena";
export { CampoFoto, type ElegirFoto, type FotoElegible, type SubirFoto } from "./CampoFoto";
export { BotonDeAcceso, CampoSimple, ENLACE_DE_ACCESO } from "./Campos";
export { Casilla } from "./Casilla";
export { Cifra } from "./Cifra";
export { claseDeBoton, ENTRADA, type Variante } from "./clases";
export { Confirmacion } from "./Confirmacion";
export { Curva } from "./Curva";
export { diaLargo } from "./curva/calculos";
export { Encabezado } from "./Encabezado";
export { EstadoVacio } from "./EstadoVacio";
export { Fecha } from "./Fecha";
export { FilaDeAccion } from "./FilaDeAccion";
export { Filtro } from "./Filtro";
export { IndiceDeTarjetas } from "./IndiceDeTarjetas";
export { Insignia, type Tono } from "./Insignia";
export { estadoDelLargo, idsQueDescriben, type Largo, type Recomendado } from "./largo";
export { Desplegable, Fila, Lista } from "./Lista";
export { ListaFija, type ResumenDeItem } from "./ListaFija";
export { AvisosDelOrden, BotonesDeOrden } from "./ListaQueSeOrdena";
export { ListaVariable } from "./ListaVariable";
export { Numero, type Cuenta } from "./Numero";
export { Paginado } from "./Paginado";
export { Parrafo } from "./Parrafo";
export { Pestanas, type Pestana } from "./Pestanas";
export { Contador, PieDelCampo } from "./PieDelCampo";
export { Seleccion, type Opcion } from "./Seleccion";
export { SiONo, Tabla } from "./Tabla";
export { TextoCorto } from "./TextoCorto";
export { useFrenarSalida } from "./useFrenarSalida";
export { useMoverEnOrden } from "./useMoverEnOrden";
export { VistaPreviaFrenada } from "./VistaPreviaFrenada";
