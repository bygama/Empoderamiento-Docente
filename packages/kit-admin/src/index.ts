// La superficie pública de @ed/kit-admin. Lo que no sale por acá es interno.
//
// Regla del paquete: **nada de dominio de ED adentro** (AGENTS.md §3, la
// primera frontera). Los controles reciben por prop lo que muestran —la
// etiqueta, la ayuda, el tope, las opciones— y lo que hacen afuera, como
// subir una foto. Los tokens de las clases los define la app (README).

export { Aviso } from "./Aviso";
export { Boton } from "./Boton";
export { resolverCambio, type Cambio } from "./cambio";
export { CampoFoto, type SubirFoto } from "./CampoFoto";
export { claseDeBoton, ENTRADA, type Variante } from "./clases";
export { estadoDelLargo, idsQueDescriben, type Largo, type Recomendado } from "./largo";
export { ListaFija, type ResumenDeItem } from "./ListaFija";
export { Parrafo } from "./Parrafo";
export { Contador, PieDelCampo } from "./PieDelCampo";
export { Seleccion, type Opcion } from "./Seleccion";
export { TextoCorto } from "./TextoCorto";
