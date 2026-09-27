# @ed/kit-admin

Los primitivos del admin: los controles de un formulario, los botones y el
aviso. Nacieron con el editor de páginas y con Novedades (fase 2 del spec del
admin, `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md` §9), y
son lo que cada entidad usa para escribir su formulario a mano. No hay un
generador de formularios acá: el de las páginas vive en la app
(`apps/sitio/src/admin/campos/Campo.tsx`) y usa estos controles.

## La frontera

**El kit no sabe nada de ED** (AGENTS.md §3). Ni una ruta del sitio, ni un
texto de ED, ni un `@/`: todo lo que un control muestra llega por prop (la
etiqueta, la ayuda, el tope, las opciones) y todo lo que hace afuera también
(subir una foto es `subir`, una función que la app le pasa). Si aparece
«novedad» acá adentro, está mal puesto.

Sí sabe de Next: `CampoFoto` y `ListaFija` usan `next/image`. `react`,
`react-dom` y `next` son `peerDependencies`: los pone la app.

## Qué exporta

| Export | Qué es |
| --- | --- |
| `TextoCorto`, `Parrafo` | una línea o varias, con el tope a la vista y el contador |
| `Seleccion` | un valor de una lista cerrada, con `{ valor, etiqueta }` |
| `CampoFoto` | una foto: miniatura con el foco, alt obligatorio y la subida |
| `ListaFija` | exactamente N ítems, en una grilla de miniaturas |
| `Contador`, `PieDelCampo`, `estadoDelLargo` | el largo de un texto y lo que se dice de él |
| `Boton`, `claseDeBoton`, `Variante` | los botones: primario, secundario, terciario y destructivo |
| `Aviso` | un banner de error o de confirmación, nunca un toast |
| `ENTRADA` | las clases de la caja de texto, para quien arma la suya |
| `Cambio`, `resolverCambio` | el `alCambiar` que acepta un valor o un armador contra el más fresco |
| `@ed/kit-admin/foto` | `Foco`, `ValorDeFoto` y `posicionDelFoco`, sin React: para dibujar una foto fuera del admin |

## Los tokens son de la app

El kit usa clases de Tailwind con nombre de token y **no define ninguno**. La
app que lo usa tiene que:

1. **Definir estos tokens** en su `@theme`:
   - Colores: `azul-principal`, `azul-medio`, `azul-claro`, `gris-texto`,
     `gris-fondo`, `rojo-error`, `naranja-accion`, `verde-concepto` y `white`
     (la superficie, que cada tema del admin redefine).
   - Tipo: `text-admin-seccion`, `text-admin-cuerpo` y `text-admin-meta`, y
     `font-display` para los títulos.
   - La variante `dark:`, para lo que la inversión de un tema oscuro no cubre
     (el texto del botón primario).
2. **Escanear el kit** con `@source`, porque Tailwind v4 no mira fuera de la
   app: en ED, `@source "../../../../packages/kit-admin/src";` en
   `apps/sitio/src/app/globals.css`.

Los contrastes que dicen los comentarios (4,83:1, 13,63:1…) son los de los
valores de ED, medidos en DESIGN.md §11. Con otros valores hay que volver a
medirlos.
