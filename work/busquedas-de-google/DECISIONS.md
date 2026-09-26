# DECISIONS — Búsquedas de Google

- 2026-09-26 — **SPEC aprobado por el padre**, con tablas y migración
  incluidas (Mateo le delegó las aprobaciones, DECISIONS del padre). Las
  lecturas de §9.2 a §9.11 van aprobadas en bloque.
- 2026-09-26 — **§9.1: opción A** (el padre). La migración se genera con
  `migrate dev --create-only`, se le suma el `INSERT … SELECT` del historial
  **antes de su primera aplicación**, y recién ahí `pnpm migrate`. Es la vía
  documentada por Prisma y no toca ninguna migración aplicada, que es lo que la
  regla protege. Condiciones:
  - En este PR se **precisa** (no se borra) la línea de AGENTS.md §12: una
    migración aplicada no se edita nunca; una nueva se puede completar con SQL
    de datos antes de su primera aplicación (`--create-only`). El padre
    autoriza tocar AGENTS.md para eso (§5.6).
  - El SQL de datos va comentado en el propio archivo de migración: qué mueve
    y por qué.
  - La prueba es la del criterio de cierre: aplicada sobre una base con filas
    en `metricas_sincronizaciones`, quedan las mismas filas en
    `corridas_de_tareas`; la salida va en PROGRESS.
  - El ADR-0011 lleva una sección corta con esto.
- 2026-09-26 — **§9.9, con una nota del padre:** la tabla alfa-3 → alfa-2 es
  un dato, no lógica. Compacta (una sola cadena o un objeto por línea larga)
  para no pasar el tope de 100 líneas, con un comentario que diga de qué
  versión de CLDR sale y cómo regenerarla. Sin dependencias.
- 2026-09-26 — **§9.6 cambia: gana la pestaña más específica, sin `exacta`**
  (el padre, al aprobar el SPEC de `paginas-inicio`, que también resuelve la
  pestaña activa). Se enciende la pestaña cuya `href` es el prefijo **más
  largo** de la ruta, cortando en un límite de segmento (`/admin/metricas` no
  es prefijo de `/admin/metricasx`): en `/admin/metricas/busquedas` gana
  Búsquedas y en `/admin/metricas`, Resumen. Se implementa acá, en
  `admin/armazon/Pestanas.tsx` (esta lane es la primera que la necesita), con
  un test de la función que elige la activa (ruta exacta, subruta, prefijo que
  no corta en segmento, sin coincidencia) y una línea en DESIGN.md §11. Si la
  4a llega antes, la implementa con el mismo algoritmo y el rebase las une.
- 2026-09-26 — **«Actualizar ahora» pasa al `Boton` secundario del armazón.**
  Su borde era `azul-claro` (1,77:1) y un control pide 3:1 (DESIGN.md §11,
  «Bordes y foco»); tampoco tenía el foco de la casa. Búsquedas lo muestra, y
  toda UI del admin sigue §11. Efecto de lado: en el Inicio, que esta lane no
  toca, el mismo botón del panel se ve con el borde `azul-principal`. El link
  «Ir a Páginas» del Inicio sigue con su estilo viejo: es de la lane 3.
- 2026-09-26 — **Los pasos del estado vacío son strings**, no nodos: la clave
  de cada `li` es el texto del paso. Con nodos, la única clave posible era el
  índice, que react-doctor marca, y el gate se arregla por código.
- 2026-09-26 — **Sin conexión, Búsquedas no muestra el aviso de la última
  corrida fallida:** sin variables, esa corrida siempre dice «no está
  conectado», y el estado vacío ya lo explica.
- 2026-09-26 — **La copia de Search Console reemplaza cada dimensión en su
  rango** (`deleteMany` + `createMany` en una transacción) en vez de un upsert
  por fila: la primera copia son 90 días y pueden ser miles de filas, y la
  función tiene 50 segundos. Idempotente igual.
