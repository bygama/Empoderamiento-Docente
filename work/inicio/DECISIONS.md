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
