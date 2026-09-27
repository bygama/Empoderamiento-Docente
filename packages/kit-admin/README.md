# @ed/kit-admin

Los primitivos del admin: los controles de un formulario, los botones y el
aviso, y las piezas que arman una pantalla (el encabezado, las pestañas, la
lista, la tabla, el estado vacío, la confirmación…). Los controles nacieron
con el editor de páginas y con Novedades (fase 2 del spec del admin,
`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` §9); las piezas
de una pantalla vivían en `apps/sitio/src/admin/armazon/` y se mudaron acá
al cerrar el mapa del admin (2026-09-27, ADR-0014). Son lo que cada
entidad usa para escribir su formulario y su pantalla a mano. No hay un
generador de formularios acá: el de las páginas vive en la app
(`apps/sitio/src/admin/campos/Campo.tsx`) y usa estos controles.

## La frontera

**El kit no sabe nada de ED** (AGENTS.md §3). Ni una ruta del sitio, ni un
texto de ED, ni un `@/`: todo lo que un control muestra llega por prop (la
etiqueta, la ayuda, el tope, las opciones, los links) y todo lo que hace
afuera también (subir una foto es `subir`, una función que la app le pasa;
mover una fila es una acción que la app le da a `useMoverEnOrden`). Si
aparece «novedad» acá adentro, está mal puesto.

Lo que sabe de ED se queda en la app, en `admin/armazon/`: la sidebar y sus
módulos, la guarda y «Sin permiso», salir, el tema, la pantalla de acceso con
la marca, lo que depende de `lib/contenido/` (el momento, el encabezado de
la ficha, «Qué cambió», «Cómo se ve») y los errores del editor
(`useErroresDelEditor`), que conocen el generador de formularios de las
páginas.

Sí sabe de Next: `CampoFoto` y `ListaFija` usan `next/image`; `BotonEnlace`,
`Volver`, el `Encabezado` (sus migas), `Pestanas`, `Filtro`, `Buscador` e
`IndiceDeTarjetas` usan `next/link`; `Pestanas` lee la ruta con
`usePathname` y `useMoverEnOrden` refresca con `useRouter`. `react`,
`react-dom` y `next` son `peerDependencies`: los pone la app. Lo que sale
por el índice y usa estado o efectos lleva `"use client"`, hooks incluidos:
el índice lo importa también un componente de servidor.

## Qué exporta

Los controles de un formulario:

| Export | Qué es |
| --- | --- |
| `TextoCorto`, `Parrafo` | una línea o varias, con el tope a la vista y el contador |
| `Seleccion` | un valor de una lista cerrada, con `{ valor, etiqueta }` |
| `Casilla` | sí o no, con su etiqueta y lo que pasa si se marca |
| `Fecha` | año, y si se sabe, mes y día: `AAAA-MM-DD`, `AAAA-MM` o `AAAA` |
| `CampoFoto` | una foto: miniatura con el foco, alt obligatorio y la subida; con `elegir` (las fotos ya subidas, que trae la app), un panel para elegir una; con `conFoco={false}`, la foto entera y sin punto de foco (un logo, una lámina) |
| `ElegirFoto`, `FotoElegible`, `SubirFoto` | lo que `CampoFoto` le pide a la app: traer las fotos y subir una |
| `ListaFija` | exactamente N ítems, en una grilla de miniaturas |
| `ListaVariable` | ítems que se agregan, se quitan y se mueven, hasta un máximo; cada uno con una clave estable que da quien lo usa |
| `Contador`, `PieDelCampo`, `estadoDelLargo` | el largo de un texto y lo que se dice de él |
| `CampoSimple`, `CampoContrasena` | una caja de texto con su etiqueta, sin tope; y una contraseña con el botón para verla |
| `BotonDeAcceso`, `ENLACE_DE_ACCESO` | el CTA a todo el ancho de una pantalla de acceso, y la clase de sus links |
| `Boton`, `BotonEnlace`, `claseDeBoton`, `Variante` | los botones: primario, secundario, terciario y destructivo; el enlace, un link con cara de botón |
| `Aviso` | un banner de error o de confirmación, nunca un toast |
| `ENTRADA` | las clases de la caja de texto, para quien arma la suya |
| `Cambio`, `resolverCambio` | el `alCambiar` que acepta un valor o un armador contra el más fresco |

Las piezas de una pantalla:

| Export | Qué es |
| --- | --- |
| `Encabezado` | el `h1` con su estado, el detalle, las acciones, los avisos y las pestañas; «← volver» o migas arriba; fijo y en azul cuando hay cambios sin guardar |
| `Pestanas`, `Pestana` | las pantallas de un módulo, como links; la activa sale de la ruta |
| `Filtro` | la misma lista recortada por un valor de la URL, en píldoras |
| `Buscador` | la caja de búsqueda de una lista larga: un formulario GET, sin JavaScript |
| `Paginado` | más nuevas, dónde estás y más viejas, como links |
| `Lista`, `Fila`, `Desplegable` | una lista de filas con su acción, y lo que se despliega debajo sin JavaScript |
| `Tabla`, `SiONo` | lo que se lee cruzando filas y columnas, y un sí o un no dibujado y dicho |
| `Insignia`, `Tono` | una pastilla de estado en tres tonos, siempre con texto |
| `Numero`, `Cuenta` | cuántos esperan, en una pastilla que se anuncia entera |
| `EstadoVacio` | lo que se ve donde todavía no hay nada, con su acción o sus pasos |
| `IndiceDeTarjetas` | la puerta de un módulo con varias pantallas |
| `Apartado`, `Bloque`, `FilaDeAccion` | un apartado de ajustes en dos columnas, un bloque de una ficha, y una acción al pie de una ficha |
| `AccionesDeLaFicha` | guardar borrador, vista previa y publicar |
| `AvisoDeLaAccion`, `AvisoDelEditor` | el aviso de la última acción de un editor, con «Recargar» si otra persona guardó |
| `VistaPreviaFrenada` | el link a la vista previa cuando el navegador frena la pestaña nueva |
| `Confirmacion` | confirmar en el lugar lo que no se deshace, con el foco en «Cancelar» |
| `BotonesDeOrden`, `AvisosDelOrden`, `useMoverEnOrden` | «Subir» y «Bajar» en una lista que se ordena, lo que se anuncia y el paso con su foco |
| `useFrenarSalida` | frenar la salida de un editor con cambios sin guardar |
| `Cifra` | una cifra con su comparación contra el período anterior |
| `Curva`, `diaLargo` | una curva diaria de una serie, dibujada en el servidor, con su tabla plegada; y el día como se lee |

Y `@ed/kit-admin/foto`: `Foco`, `ValorDeFoto` y `posicionDelFoco`, sin
React, para dibujar una foto fuera del admin.

## Los tokens son de la app

El kit usa clases de Tailwind con nombre de token y **no define ninguno**. La
app que lo usa tiene que:

1. **Definir estos tokens** en su `@theme`:
   - Colores: `azul-principal`, `azul-medio`, `azul-claro`, `gris-texto`,
     `gris-fondo`, `rojo-error`, `naranja-accion`, `verde-concepto` y `white`
     (la superficie, que cada tema del admin redefine).
   - Tipo: `text-admin-titulo`, `text-admin-seccion`, `text-admin-cuerpo` y
     `text-admin-meta`, y `font-display` para los títulos.
   - La variante `dark:`, para lo que la inversión de un tema oscuro no cubre
     (el texto del botón primario).
2. **Escanear el kit** con `@source`, porque Tailwind v4 no mira fuera de la
   app: en ED, `@source "../../../../packages/kit-admin/src";` en
   `apps/sitio/src/app/globals.css`.

Los contrastes que dicen los comentarios (4,83:1, 13,63:1…) son los de los
valores de ED, medidos en DESIGN.md §11, que describe cada pieza como patrón.
Con otros valores hay que volver a medirlos.
