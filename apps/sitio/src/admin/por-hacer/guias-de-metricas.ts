import { PANTALLAS_DE_METRICAS } from "@/admin/metricas/pantallas";
import type { Guia, Pantalla } from "./guias";

// Lo que va a tener cada pestaña de Métricas que todavía no existe, bloque por
// bloque, sacado del SPEC padre §5.7 (`work/mapa-del-admin/`). Las construye
// la lane 11 y borra su entrada; el nombre y qué es salen de `pantallas.ts`,
// como la pestaña.

const PANTALLAS: Record<string, readonly Pantalla[]> = {
  origen: [
    { nombre: "Países", ruta: "/admin/metricas/origen#paises", que: "Chile, México y Argentina siempre arriba, y después el resto." },
    { nombre: "Regiones", ruta: "/admin/metricas/origen#regiones", que: "Por provincia o estado, nunca por ciudad. Las cifras menores a 3 no se muestran." },
    { nombre: "De dónde llegan", ruta: "/admin/metricas/origen#referidos", que: "Los sitios y las redes que traen gente." },
    { nombre: "Dispositivo, sistema y navegador", ruta: "/admin/metricas/origen#dispositivos", que: "Celular, computadora o tableta, y con qué navega la gente." },
    { nombre: "Página por país", ruta: "/admin/metricas/origen#pagina-por-pais", que: "Qué página mira la gente de cada país." },
    { nombre: "Mejor hora para publicar", ruta: "/admin/metricas/origen#mejor-hora", que: "Una grilla de días y horas con cuándo entra más gente." },
  ],
  acciones: [
    { nombre: "Materiales más consultados", ruta: "/admin/metricas/acciones#materiales", que: "Qué materiales de la Biblioteca se abren más." },
    { nombre: "El camino del CV", ruta: "/admin/metricas/acciones#cv", que: "Cuántas personas vieron la página, empezaron el formulario y lo mandaron, por canal." },
    { nombre: "Contactos enviados", ruta: "/admin/metricas/acciones#contactos", que: "Cuántos mensajes llegan por el formulario de contacto. Solo sumas por día, sin cookies." },
  ],
  enlaces: [
    { nombre: "Crear un link", ruta: "/admin/metricas/enlaces#crear", que: "Se elige la página, dónde se comparte y un nombre, y sale un link corto como …/l/taller-mty." },
    { nombre: "Tus links", ruta: "/admin/metricas/enlaces#links", que: "Cada link con sus clics, sus visitas y los CV que trajo, y «Copiar»." },
    { nombre: "El link corto", ruta: "/l/[codigo]", que: "En el sitio público: cuenta el clic en el servidor, sin cookies, y lleva a la página." },
  ],
};

/** La guía de una pestaña de Métricas por hacer, o `undefined` si esa clave no es una. */
export function guiaDeMetricas(clave: string): Guia | undefined {
  const pantalla = PANTALLAS_DE_METRICAS.find((p) => p.clave === clave);
  if (!pantalla || !Object.hasOwn(PANTALLAS, clave)) return undefined;
  return { nombre: pantalla.nombre, para: pantalla.que, pantallas: PANTALLAS[clave] };
}
