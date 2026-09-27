# ADR-0015: Llevar a la base lo que Ajustes edita, con el plazo prometido como techo de lo que se guarda

- **Status:** Accepted
- **Date:** 2026-09-27
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en `work/ajustes/`
- **Enmienda:** [ADR-0012](0012-mensajes-cv-privados-y-retencion.md), en los
  plazos: dejan de ser fijos en `config/privacidad.ts`
- **Related:** [ADR-0011](0011-search-console-y-un-solo-cron.md) (el cron único,
  donde corre la retención), AGENTS.md §5.3 (datos institucionales)

---

## Contexto

Lo que se configura una vez vivía en el código: el correo, el WhatsApp, la
oficina, los países y las redes de ED en `config/site.ts`, y los plazos de
retención (CV 12 meses, Contacto 24, spam 30 días) en `config/privacidad.ts`.
Cambiar un correo pedía un deploy, y Ajustes (SPEC padre §5.9) los quiere
editables por quien dirige o administra.

Los datos del sitio son de la marca y no tienen más vueltas. Los plazos, sí:

1. **Son una promesa.** Los formularios públicos le dicen a quien escribe
   «los borramos a los 24 meses», y el ADR-0012 hizo de eso algo que se cumple
   solo.
2. **La ley pide borrar cuando deja de ser necesario** (Argentina, Ley 25.326,
   art. 4 inc. 7) y da derechos de supresión en los tres países, pero no fija
   un número. El plazo lo elige ED y lo publica.
3. **Borrar no se deshace.** Acortar un plazo por error se lleva, en la
   limpieza de esa noche, lo que ya no vuelve.

## Decisión

**Los datos del sitio y los plazos pasan a la base, editables desde Ajustes, y
a lo que ya llegó se le aplica el menor entre el plazo que regía cuando llegó
y cualquiera posterior.**

- **Los datos del sitio** van en `datos_del_sitio`, una fila sola (un `CHECK`
  de la migración), cargada con los valores de hoy por la misma migración: el
  primer deploy ya los tiene. El sitio los lee por `datosDelSitio()`, con los
  valores iniciales de respaldo cuando no hay base, y guardar es publicar:
  revalida el layout del sitio. Lo de la marca —nombre, URL, descripción,
  frases pilares— sigue en `config/site.ts`.
- **Los plazos** van en `plazos_de_retencion`, **una fila por cambio**, con
  desde cuándo rige; nunca se edita una. Las funciones puras de
  `config/privacidad.ts` reciben ese historial:
  - **alargar** un plazo vale para lo que llegue desde ahora: lo ya recibido se
    borra cuando se le prometió;
  - **acortar** vale para todo, también para lo ya recibido;
  - el **spam** no es una promesa a nadie: su plazo de hoy vale para todo lo
    marcado, y nunca pasa el de su bandeja.
- **Topes:** CV de 1 a 24 meses, Contacto de 1 a 36, spam de 1 a 90 días. El
  mínimo evita borrar todo por un cero; el máximo, guardar para siempre.
- **Acortar pide confirmación** si borra algo: antes de guardar, la acción
  cuenta cuánto borraría de más la próxima limpieza y lo pregunta.
- **La retención lee los plazos sin respaldo:** si la base no contesta, la
  tarea falla y queda en su corrida. Borrar con un plazo supuesto borraría
  antes de lo prometido o guardaría de más.

## Consecuencias

### Positivas

- Cambiar el correo o un plazo no pide a quien desarrolla.
- La promesa de los formularios sigue siendo verdad aunque el plazo cambie: el
  historial dice qué se le prometió a cada quien, sin una columna por mensaje.
- Cada cambio queda en la actividad, con qué cambió («CV, de 12 meses a 6
  meses»).

### Negativas

- **Dos copias de los valores iniciales:** la migración los cargó y el código
  los guarda de respaldo. La migración no se edita nunca; el respaldo solo se
  usa sin base.
- **Contar lo vencido es una condición por tramo**, no un borde: con muchos
  cambios de plazo la consulta crece. Se cambia pocas veces en la vida del
  sitio.
- **Alargar no se nota enseguida:** lo que ya llegó se sigue borrando al
  plazo viejo, y quien alarga puede esperar lo contrario. La pantalla lo dice.

## Alternativas consideradas

### Alternativa A: el plazo nuevo vale para todo

- Qué hubiera implicado: un solo valor por plazo, sin historial.
- Por qué se descarta: alargarlo guarda lo ya recibido más de lo que se le
  prometió a quien lo mandó, y la promesa del ADR-0012 deja de ser verdad.

### Alternativa B: la fecha de borrado en cada mensaje

- Qué hubiera implicado: una columna en `mensajes`, fijada al llegar.
- Por qué se descarta: acortar obligaría a reescribir todas las filas, y el
  spam, que cuenta desde que se marca, necesitaría su propia lógica igual.

### Alternativa C: una tabla genérica de ajustes, clave y JSON

- Qué hubiera implicado: `ajustes(clave, valor)`, validada en código.
- Por qué se descarta: es la forma de los «globals» de Payload (AGENTS.md §12),
  pierde los tipos de la base y no da historial.

## Referencias

- `work/ajustes/SPEC.md` §3, §4 y §2.5, y su `DECISIONS.md`.
- [Ley 25.326, texto actualizado](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion)
