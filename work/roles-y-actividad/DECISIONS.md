# DECISIONS — Roles y actividad

- 2026-09-26 — **SPEC aprobado por el padre**, con siete rulings:
  1. **Tablas, tal cual:** `actividad` (`cuenta_id` con `ON DELETE
     RESTRICT`), `ciudad` y `pais` en `session`, y el índice único parcial
     `user_una_sola_dirige` escrito a mano con `--create-only`.
  2. **Las excepciones del test de capacidades**, por nombre y con motivo, y
     el motivo nombra la lane dueña. Cuando esta lane mergee, el padre les
     pide a 4a y a 5 que al rebasear saquen su excepción y sumen el chequeo y
     el registro de actividad.
  3. **El correo, solo lectura** en Mi cuenta.
  4. **Cambiar la contraseña por el cliente de better-auth**, cerrando las
     demás sesiones, con «Tu contraseña cambió» y 5 intentos cada 5 minutos.
  5. **Las 11 capacidades del §3**, la matriz entera en un solo lugar: es lo
     que evita que cada lane edite la política. Cada capacidad sin consumidor
     dice en un comentario de una línea qué lane la va a usar.
  6. **Los cuatro tipos de actividad** (`entro`, `salio`,
     `cambio-su-contrasena`, `cambio-su-nombre`).
  7. **Se suma `nombrar-direccion`**, un comando aparte: pasa a dirige una
     cuenta que ya existe y se niega (exit distinto de 0, mensaje en llano)
     si ya hay una dirige o si el correo no existe. `crear-cuenta` sigue solo
     dando de alta. Va en el README al lado de `crear-cuenta`, con el caso de
     producción: la persona de ED que ya tiene cuenta.
- 2026-09-26 — **El índice parcial, a mano y no con el preview feature.**
  Prisma 7.10 lo escribiría solo con `previewFeatures = ["partialIndexes"]`
  (probado: mismo SQL), pero el brief pide el camino a mano, y a mano no hay
  drift: `migrate diff` desde las migraciones contra el esquema da una
  migración vacía. Un preview feature cambia el cliente generado por un
  índice; no vale la pena.
- 2026-09-26 — **Rebase sobre `c957586` (el padre):** `configurarConexiones`
  pasa a dirige y administra, con el comentario de la lane 5; las dos acciones
  de «Actualizar ahora» (Métricas y Búsquedas) chequean `verMetricas` —la
  misma capacidad que ver el módulo: Métricas la ven y la actualizan los tres
  roles (SPEC §3)— y no se anotan en la actividad (el §5.8 no lista
  «actualizó métricas»); la poda de 12 meses es una tarea de `TAREAS_DIARIAS`.
  Las excepciones de la 4a quedan como estaban.
