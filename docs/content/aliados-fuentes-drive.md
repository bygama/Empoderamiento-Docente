# Aliados con logo — inventario de fuentes (2026-09-08)

Qué se revisó: la carpeta «LOGOS ALIANZAS» (`1PBNJ8FT0oDfH82xTYNx2yUb2bI2pidOS`, de Raquel,
dentro de «EQUIPO ALIANZAS CVS PAGINA»), la hoja ALIANZAS ED de `EQUIPO Y ALIANZAS.xlsx`
(Raquel, modificada 2026-09-05) y la carta de autorización de UNESCO que está en la misma
carpeta.

Regla: en la web van **solo** los logos que ED puso en esa carpeta (AGENTS.md §5.4). La lista
única vive en `src/config/aliados.ts` y la usan la tira de la home (`DatosDuros.tsx`) y el
Footer. Si ED suma un logo a la carpeta, se agrega ahí; si no está en la carpeta, no se publica.

## 1. Los cinco que están

| Organización | Qué dice la hoja ALIANZAS ED | Archivo en Drive | En la web |
|---|---|---|---|
| Grupo Techint | «logo solicitado» (la fila no se actualizó, pero el archivo está en la carpeta desde el 5 ago) | `Techint_logo_Black.svg` y `_White.svg`: la marca vertical del grupo (emblema + TECHINT) | `techint.svg` (el negro, tal cual) |
| UNESCO | no figura en la hoja. Carta del 26 ago 2026 de la Oficina Regional de UNESCO en Montevideo: autoriza el uso del logo «en los materiales informativos y de difusión vinculados a esta colaboración» | `LOGO UNESCO BLANCO (3).png` es el único con fondo transparente de verdad; `UNESCO_logo_hor_black (1).png` y `LOGO UNESCO AZUL (3).png` traen fondo blanco opaco y con el filtro de la tira saldrían como un rectángulo | `unesco.png` (el blanco, a la mitad: 1250×265) |
| Bloom (es «ser+») | «logo enviado/subido», bloomlat.com | carpeta «Bloom» → «Logo horizontal» y «Logo vertical», siete colores cada una | `bloom.png` (horizontal negro, recortado: 896×264) |
| UCSH — Universidad Católica Silva Henríquez | «logo enviado/subido» | `LOGO-UCSH_AZUL.png`, `_COLOR.png`, `_AMARILLO.png` (3300×1666) | `ucsh.png` (el azul, recortado y bajado a 400 de alto) |
| USACH — Science Up | «logo enviado/subido» | `Logotipo Science Up (2).png` | `science-up.png` (idéntico byte a byte al que ya estaba) |

Pendiente de confirmar con Raquel: que el logo de Techint ya esté aprobado (la hoja quedó
en «solicitado»). Mientras, va: ya estaba publicado antes y el archivo lo subió ED.

## 2. Los que salieron de la web

- **Buenos Aires Ciudad** (`buenos-aires.png`, `caba.svg`): la hoja dice del Ministerio de
  Educación «no se puede por contrato». No va, en ninguna versión.
- **Roberto Rocca** (`roberto-rocca.svg`): no está en la carpeta. Es parte del Grupo Techint,
  que ya tiene su logo.
- El `techint.png` anterior era el wordmark de **Techint Ingeniería y Construcción**, otra
  empresa del grupo, puesto por nosotros antes de tener el archivo de ED. Se reemplazó por la
  marca que mandaron.

Sin logo por ahora (la hoja dice «esperaría»): River Plate, Fundación Varkey.

## 3. Cómo se prepararon los archivos

Todos con fondo transparente y recortados al dibujo, sin aire alrededor: la altura CSS de la
tira es la del logo de verdad. La tira los pinta de blanco con `filter: brightness(0) invert(1)`,
así que el color del archivo no importa. Las alturas por logo (`alto` en `aliados.ts`)
compensan el ojo: la marca vertical de Techint y los lockups con texto chico (UCSH, Science Up)
van más altos que los wordmarks de una línea (UNESCO, Bloom).
