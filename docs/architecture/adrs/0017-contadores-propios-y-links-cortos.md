# ADR-0017: Contar los eventos raros del sitio con contadores propios, sin nada de la persona, y medir los posteos con links cortos propios

- **Status:** Accepted
- **Date:** 2026-09-27
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en `work/metricas-completas/`
- **Related:** [ADR-0009](0009-analitica-de-vercel-con-copia-diaria.md) (la
  analítica de Vercel con copia diaria; este ADR suma lo que ella no cuenta),
  [ADR-0011](0011-search-console-y-un-solo-cron.md) (el cron único, donde
  entra el resumen semanal), [ADR-0012](0012-mensajes-cv-privados-y-retencion.md)
  (el tope por IP guardado como HMAC, que se reusa acá)

---

## Contexto

Métricas ya sabía cuánta gente entra y de dónde (la copia diaria de Vercel
Web Analytics, ADR-0009). ED quiere saber también **qué hace esa gente** —si
abre los materiales de la Biblioteca, si llega a mandar el CV, cuántos
contactos llegan— y **qué posteo trajo gente**: un link compartido en
LinkedIn o en WhatsApp.

El ADR-0009 dejó afuera los eventos propios porque el plan gratis de Vercel
no los tiene. Y la regla del módulo no cambió: **todo dato gratis y legal,
sin cookies, y nunca se identifica a una persona ni a una institución**
(SPEC del mapa del admin §1). El sitio no tiene banner de cookies y no va a
tener uno por una métrica.

## Decisión

**Dos piezas propias, sin dependencias nuevas:**

1. **Contadores propios** (tabla `contadores`): una **suma por día** de cada
   evento de una lista cerrada (`config/metricas.ts`): se abrió la página del
   CV, se empezó su formulario, se mandó, se mandó un contacto, se abrió un
   material, se tocó un link corto. El sitio avisa con un `POST /api/contar`;
   la fila guarda el día, el evento, el **canal** (Buscador · Redes ·
   Asistentes IA · Directo · Otros sitios) y, si hace falta, el id del
   material o del link. Nada más.
2. **Links cortos propios** (tabla `enlaces`, `/l/<codigo>`): se elige la
   página, dónde se comparte y un nombre; el link cuenta el clic en el
   servidor y redirige con un **307** a la página con
   `utm_source=<canal>&utm_medium=link&utm_campaign=<codigo>`, así la
   analítica de Vercel cuenta las visitas que trajo sin nada propio.

**Lo que no se guarda nunca**, y por qué alcanza igual:

- **Ni la IP, ni el navegador, ni la hora.** El canal se decide en el
  servidor con el host de donde vino la persona (`lib/metricas/canales.ts`,
  la lista de dominios en un solo lugar), y se guarda el canal, no el host.
  El `User-Agent` se lee para no contar a los robots y a las vistas previas
  de las redes, y no se guarda.
- **El tope por IP** (60 eventos por hora; 3 clics por hora por link) vive en
  `limites_por_ip` como el HMAC de «uso:IP» con el secreto de better-auth,
  con la poda diaria que ya existía: no se puede volver de la clave a la IP.
- **Nada en el navegador:** ni cookie, ni `localStorage`, ni
  `sessionStorage`. El aviso es un `fetch` con `keepalive` que no espera
  respuesta; la ruta contesta **siempre 204**, cuente o no.
- **El origen nunca viaja con un CV.** El formulario de CV manda sus eventos
  aparte, y `/api/cv` no recibe nada nuevo: en `mensajes` no queda de dónde
  vino nadie.
- **Eventos raros, nunca cada visita:** las visitas las cuenta Vercel.

**El límite de atribuir un CV a un link, aceptado a propósito.** Un CV cuenta
para un link solo si se manda en la misma carga en que se llegó por él: el
código viaja en la URL (`utm_campaign`) y el formulario lo lee de ahí. Si la
persona entra por el link, navega a otra página, se va y vuelve otro día por
Google, el CV cuenta en su canal pero no en el link. Saberlo pediría guardar
algo en su navegador o reconocerla entre visitas, que es exactamente lo que
este módulo no hace.

**Lo que ya existía se reusa:** las marcas automáticas de la curva salen de
`actividad` (publicar una página o una novedad) y no de una escritura nueva;
el resumen semanal por correo es una tarea más del cron diario, con el
registro de avisos (apagado de fábrica) y una clave de idempotencia por
persona y por lunes.

## Consecuencias

### Positivas

- ED sabe qué materiales se abren, cuánta gente llega hasta mandar el CV y
  por dónde, y qué posteo trajo gente, **sin aviso de cookies** y sin un
  tercero.
- El clic de un link se cuenta aunque la persona bloquee la analítica: se
  cuenta en el servidor.
- Tres tablas chicas (`contadores`, `enlaces`, `marcas`), una ruta pública,
  una página pública y ninguna dependencia.
- `contadores` no se poda: son sumas por día, sin nada que caduque.

### Negativas

- **Un evento que el navegador no manda se pierde:** si la persona cierra la
  pestaña antes, o un bloqueador frena el `fetch`, no suma. Los contadores
  dan un piso, no el número exacto.
- **La atribución de un CV a un link es corta** (arriba): la pantalla y el
  README lo dicen.
- **Las visitas de un link dependen de Vercel** (`utm_campaign`): sin la
  copia diaria, la pantalla las muestra «—».
- **Un script puede inflar los contadores** hasta el tope por IP. Es un costo
  aceptado: no hay nada que robar y el tope lo acota.

### Mitigaciones

- La ruta solo acepta la lista cerrada y valida con Zod; un material cuenta
  solo si existe y está publicado; un link, solo si existe.
- Los robots y las vistas previas no cuentan (`lib/metricas/robots.ts`).
- Lo que podría señalar a alguien en Origen (menos de 3) no se nombra.
- `/l/` no se indexa y no se cachea; un link borrado da el 404 del sitio.

## Alternativas consideradas

### Alternativa A: los eventos de Vercel (`track()`)

- Qué hubiera implicado: mandar cada evento a Web Analytics y copiarlo con
  la copia diaria.
- Por qué se descarta: no están en el plan gratis (ADR-0009), y el clic de
  un link seguiría perdiéndose con un bloqueador.

### Alternativa B: un acortador de afuera (Bitly y parecidos)

- Qué hubiera implicado: una cuenta nueva y los clics en otro panel.
- Por qué se descarta: cuenta nueva, datos de las personas en manos de un
  tercero, y el link ya no sería del dominio de ED.

### Alternativa C: guardar el origen en el navegador para atribuir mejor

- Qué hubiera implicado: el código del link en `sessionStorage` o en una
  cookie hasta que la persona manda el CV.
- Por qué se descarta: es guardar algo de la persona en su navegador, y el
  sitio no lo hace. El límite de arriba es su precio.

## Referencias

- Spec de la lane: `work/metricas-completas/SPEC.md`
- [Web Analytics API: aggregates](https://vercel.com/docs/rest-api/web-analytics/aggregates-page-views)
  (dimensiones, `by` y filtros, verificados el 2026-09-27)
