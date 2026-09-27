# DECISIONS — El Inicio del admin

- 2026-09-26 — **SPEC aprobado por el padre, con un cambio:** «quién ve cada
  tipo de actividad» no va en `datos/inicio/actividad-reciente.ts` sino junto
  a los tipos, en `datos/actividad.ts` (al lado de `TipoDeActividad`), porque
  la pantalla de Actividad de la 3b necesita la misma regla; `datos/inicio/`
  la consume. La frase de cada tipo queda en `admin/actividad/frase.ts`, como
  lugar compartido. El padre le avisa a la 3b que las reúse; el que se mergee
  segundo concilia.
- 2026-09-26 — **«Ver toda la actividad»** (padre): se pone si al rebasear la
  3b ya está en `main`; si no, lo suma la 3b con su pantalla.
- 2026-09-26 — **Lecturas del SPEC §8 aprobadas en bloque** (padre):
  «Visitantes» como en Métricas › Resumen; esta semana = los últimos 7 días
  con datos contra los 7 anteriores; lo publicado incluye lo propio; sin
  primario; «Todo al día» con el estado vacío; base de demo propia
  `ed_inicio`, que se borra al cerrar la lane.

## Durante la corrida

- 2026-09-26 — **«Sin datos previos» y no «Sin datos de la semana
  anterior»** en el Número (paso 1): la frase con el período por defecto
  diría «de el período anterior»; una sola frase en Métricas y en el Inicio.
  El SPEC §2.3 quedó al día.
- 2026-09-26 — **La última visita y la actividad, aisladas también** (paso
  6): el SPEC aísla las entradas de los registros; estas dos lecturas no son
  de un registro, pero si tiran se llevarían el Inicio entero. `oNull` en
  `datos/inicio/inicio.ts`: en `null`, su bloque dice que no se pudo leer.
- 2026-09-26 — **Sin «Ver toda la actividad»** (paso 6): la 3b no está en
  `main` (`git log HEAD..origin/main` vacío), así que lo suma ella, por la
  regla del padre. Se vuelve a mirar al rebasear.
- 2026-09-26 — **Lo que cambió al mirar las capturas** (`c7243fc`,
  `10a365a`): la semana va apilada en el celular y en la columna de la
  derecha (de a dos, «Materiales consultados» bajaba de línea y dejaba los
  números a distinta altura) y de a dos solo entre `sm` y `lg`; la segunda
  fila de la grilla es flexible (con quien edita, la semana es más alta que
  la izquierda y el sobrante se metía entre los pendientes y la actividad);
  «Pendientes» tiene 40 px de alto para quedar a la altura de «Esta semana»;
  el detalle de Search Console pasa a «Para ver qué busca la gente en
  Google.» para que su botón quede a la derecha. El boceto del SPEC §2 era
  indicativo («la dirección visual fina se decide al implementar»); DESIGN.md
  §11 describe lo que quedó.
- 2026-09-26 — **El build falló dos veces con la caché de `.next`
  inconsistente** («next/font/google queries have exactly one entry», en
  `(sitio)/layout.tsx`, que esta lane no toca): el primer build corrió con el
  dev server abierto sobre la misma carpeta. Con `.next` apartada a `%TEMP%`
  (no borrada) compiló; el build final se corrió con el dev server parado.
- 2026-09-26 — **Capturas:** la ventana de Orca estaba minimizada y
  `orca screenshot` no podía capturar. Con el OK del padre se restauró con
  `ShowWindow` de Win32, se sacaron las capturas y se volvió a minimizar. Una
  vez, con la pestaña como activa global, otro worker (el 3019, `mensajes`)
  la navegó con un `orca goto` sin `--page`: desde ahí todo va con `--page`.
- 2026-09-26 — **Rebase antes del PR, sobre la 4a mergeada** (`48ed711`):
  por la regla del padre, lo concilia el que se mergea segundo. Sus tres
  tipos (`publico-una-pagina`, `descarto-un-borrador`,
  `restauro-una-version`) van con `editarContenido` en `QUIEN_VE` —son
  contenido, y el SPEC padre §3 le da a quien edita el Inicio «sin filas de
  CV ni de ajustes», no sin contenido— y se leen «Raquel Ayala publicó
  Inicio», «… descartó el borrador de Inicio», «… restauró una versión de
  Inicio». «Lo nuevo desde tu visita» sigue leyendo `paginas.publicadoEn`
  (sigue siendo verdad y no depende de que cada acción anote).
