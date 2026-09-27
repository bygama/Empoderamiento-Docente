# ADR-0016: Agregar un material pegando su DOI, su ISBN o su link, detrás de un pedido protegido contra SSRF, y chequear sus links una vez por semana

- **Status:** Accepted
- **Date:** 2026-09-27
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en `work/biblioteca/`
- **Related:** [ADR-0011](0011-search-console-y-un-solo-cron.md) (el cron
  único y `corridas_de_tareas`, donde entra la tarea nueva),
  [ADR-0014](0014-kit-admin-y-modelo-de-entidad.md) (el modelo de entidad que
  sigue `materiales`), [ADR-0006](0006-packages-reutilizables.md) (lo que no
  sabe de ED incuba en `lib/`)

---

## Contexto

La Biblioteca del sitio tenía 57 materiales escritos a mano en
`features/biblioteca/data/materiales.ts` (el diseño del admin decía 63; el
archivo tenía 57). Pasan a la base con la migración `biblioteca` y el admin los
edita con el molde de Novedades. Lo que este ADR decide es lo que Novedades
no tenía:

1. **Cargar un material es copiar datos que ya existen afuera.** Título,
   autores, año, revista, resumen: todo está en Crossref para un artículo con
   DOI, y en las etiquetas `citation_*` de la página de casi cualquier revista.
   Tipearlos a mano es lento y es donde entran los errores.
2. **Leer una página que pegó una persona es una puerta de SSRF.** El servidor
   pide lo que le escriben: un link a `169.254.169.254`, a `localhost` o a un
   nombre que resuelve a la red interna le haría leer lo que nadie de afuera
   puede leer. Chequear los links guardados tiene el mismo riesgo, sin que
   nadie mire.
3. **Un link roto en una biblioteca es un material que no existe.** Las
   revistas cambian de plataforma y los repositorios se mudan; nadie en ED
   revisa 57 links a mano.
4. **Sin dependencias nuevas**, como en el ADR-0011, y el chequeo tiene que
   entrar en los 50 segundos que el cron único le da a cada tarea.

## Decisión

### 1. Agregar en dos pasos, sin guardar nada hasta confirmar

`/admin/biblioteca/nuevo` pide una sola cosa: el DOI, el ISBN o el link. El
servidor reconoce qué es y busca, en orden:

| Lo que se pegó | Dónde se busca |
| --- | --- |
| DOI (`10.…` o un link de doi.org) | Crossref; si no está, OpenAlex |
| ISBN (10 o 13, con su dígito verificador) | Crossref |
| Un link `https` | La página: `citation_*` primero, Open Graph si no hay; si la página trae `citation_doi`, Crossref con ese DOI |

Lo que vuelve llena la ficha **sin guardarla**, y cada campo que vino de afuera
dice de dónde («De Crossref», «De la página»…) hasta que alguien lo toca.
Guardar es un clic aparte, con el material recién ahí creado como borrador.
Antes, un DOI que ya está en la Biblioteca lo dice con un link al material, y
un título parecido (el mismo, uno adentro del otro, o las mismas palabras en un
75 %) avisa «Se parece a…» sin frenar: puede ser otra edición.

Lo que lee Crossref, OpenAlex y las etiquetas vive en `lib/metadatos/` y no
sabe de ED: devuelve datos crudos (título, autores, fecha, fuente, resumen,
DOI). Pasarlos a un material —el tipo de Crossref a uno de los siete tipos, un
autor al perfil de alguien del equipo— es de `datos/biblioteca/`. Los tests
leen respuestas grabadas; ninguno sale a la red.

### 2. Todo pedido a un destino que eligió una persona pasa por `pedirProtegido`

`lib/red/pedido-protegido.ts` (sin ED, sin dependencias: `node:https` y
`node:dns`):

- **Solo `https:`, en el 443, sin usuario ni contraseña en la URL.**
- **La IP se chequea antes de conectar.** El host se resuelve —todas sus
  direcciones— y se rechaza si una sola no es pública: privada, local, de
  enlace local (la metadata de la nube), CGNAT, reservada, multicast, de
  documentación, o una IPv6 que esconde una IPv4 (mapeada, NAT64, 6to4,
  Teredo). En IPv6 se permite solo la unicast global, `2000::/3`, menos esos
  túneles. Un host que ya es una IP se chequea igual.
- **La conexión va a la IP chequeada**: el `lookup` de `https.request` es el
  nuestro, así que un DNS que contesta distinto entre el chequeo y la conexión
  (DNS rebinding) no cuela nada.
- **Cada redirección se chequea entera de nuevo** (esquema, puerto, IP), hasta
  5.
- **Topes**: 2 MB de cuerpo, que se corta al pasarse, y 8 segundos por pedido,
  redirecciones incluidas.
- **Sin cookies** y sin agente compartido: no manda ninguna ni guarda las que
  le den. Para leer etiquetas, solo `text/html`.

Las APIs de Crossref, OpenAlex y doi.org pasan por el mismo pedido: son
destinos fijos, pero un solo camino a la red es uno solo que auditar. Crossref
pide un `User-Agent` con un contacto para su «polite pool»: va el correo del
sitio, el de Ajustes › Datos del sitio.

### 3. La salud de los links: una tarea del cron diario, repartida en la semana

`salud-de-links` se suma a `TAREAS_DIARIAS` (ADR-0011: una tarea más, no un
cron). Cada corrida chequea los materiales publicados cuyo último chequeo tiene
más de 7 días, de los más viejos a los más nuevos, hasta 15, de a 5 a la vez y
sin empezar ninguno pasados 35 segundos. Cada link se chequea una vez por
semana, el día que le toca, y los 57 quedan al día en cuatro corridas.

- **Con DOI, en doi.org** (`doi.org/api/handles/{doi}`), no en la revista:
  registrado es `bien`, no registrado es `roto`. El DOI es el link que no se
  rompe; lo que se muda es la revista.
- **Con link `https` y sin DOI**, con `pedirProtegido`: `HEAD` y, si la
  respuesta no sirve, `GET`. Menos de 400, después de seguir las
  redirecciones, es `bien`; 404, 410 o un dominio que ya no existe es `roto`;
  403, 429, 5xx o un corte es `sin-respuesta`, que **no es roto**: muchas
  revistas frenan a los robots. Un link a una dirección interna no se pide:
  queda `sin-chequear`, con el motivo.
- **Con link `http`**, `sin-chequear`; **una ruta propia** (`/biblioteca/….pdf`),
  `bien` sin pedir nada, porque viaja con el deploy.

El resultado queda en el material (`chequeo_en`, `chequeo`, `chequeo_detalle`)
y la corrida en `corridas_de_tareas`, en llano. Solo `roto` prende la insignia
de la lista, el número de la sidebar y la fila «Materiales con el link roto»
del Inicio. Cambiar el link o el DOI al publicar borra el chequeo: el viejo ya
no dice nada.

## Consecuencias

### Positivas

- Cargar un artículo con DOI es pegar el DOI, mirar y guardar; la cita APA sale
  armada con el volumen, el número y las páginas de Crossref.
- Nadie tiene que revisar los links: la semana que uno se rompe, el Inicio lo
  dice con el título.
- El servidor no pide nada a la red interna ni a la metadata de la nube, ni al
  cargar ni al chequear, y eso está probado sin red: cada rango de IP, cada
  forma de URL, un host que resuelve a una IP privada, las redirecciones a
  `http:` y a la red interna, y los dos topes.
- `lib/red/` y `lib/metadatos/` no importan nada de la app: pasan a `packages/`
  sin cambios el día que los use un segundo proyecto.

### Negativas

- **Crossref se equivoca a veces al partir un nombre** (apellidos compuestos,
  iniciales pegadas). Lo que vuelve se revisa antes de guardar, y la pantalla
  lo pide con la marca de origen.
- **Un link puede estar roto sin que lo sepamos**: la revista que frena a los
  robots queda en `sin-respuesta` para siempre, y una página que responde 200
  con «no encontrado» se lee `bien`.
- **Un link de la revista cambia sin que el DOI se rompa**: si el material
  tiene DOI, la tarea mira doi.org y no la página a la que apunta.
- **`https.request` en vez de `fetch`**: 111 líneas propias donde `undici`
  daría un `lookup` en dos. Son las que hay que auditar.

### Mitigaciones

- `sin-respuesta` se ve en el panel del material con su detalle («Contestó
  403.»), y quien lo abre prueba el link.
- La insignia, el número y la fila del Inicio solo cuentan `roto`: un sitio
  lento no llena el Inicio de ruido.
- `pedirProtegido` es el único camino a la red de todo el módulo, y sus tests
  corren en `pnpm test` con el resolvedor y la conexión inyectados.

## Alternativas consideradas

### Alternativa A: `fetch` con un `Agent` de `undici`

- Qué hubiera implicado: `fetch` con un `connect.lookup` propio, y las
  redirecciones en modo `manual`.
- Por qué se descarta: `undici` no está en el lockfile y sumarlo es una
  dependencia (AGENTS.md §5.6). El `fetch` de Node no deja pasar un `lookup`
  sin ella.

### Alternativa B: un servicio de afuera que lea la página

- Qué hubiera implicado: mandar el link a un lector de metadatos o a un
  chequeador de links de terceros, que se ocupa de la red.
- Por qué se descarta: un servicio más, con su cuenta y su clave, que ve cada
  link que carga ED; y la defensa de SSRF sigue haciendo falta el día que el
  servidor pida algo por su cuenta.

### Alternativa C: chequear en la revista también los que tienen DOI

- Qué hubiera implicado: seguir el DOI hasta la página y mirar su respuesta.
- Por qué se descarta: muchas editoriales frenan a los robots (403 o un
  desafío de JavaScript), y la tarea viviría en `sin-respuesta`. Que el DOI
  esté registrado es lo que garantiza que el link del sitio lleva a algún lado.

### Alternativa D: chequear los 57 juntos una vez por semana

- Qué hubiera implicado: una tarea que corre un día fijo y los recorre a todos.
- Por qué se descarta: con 8 segundos de tope por link, 57 no entran en los 50
  segundos de una tarea. Repartidos por material, entran holgados y crecen
  solos: cuantos más materiales, más corridas para cerrar la semana, sin tocar
  nada.

## Referencias

- Spec de la lane: `work/biblioteca/SPEC.md` (§8 agregar, §10 la salud de los
  links, §11 la defensa de SSRF) y su `DECISIONS.md`.
- [OWASP: Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [IANA: IPv4](https://www.iana.org/assignments/iana-ipv4-special-registry/)
  y [IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/)
- [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
  (y su «polite pool») · [OpenAlex: works](https://docs.openalex.org/api-entities/works)
- [DOI Proxy Server REST API](https://www.doi.org/the-identifier/resources/factsheets/doi-resolution-documentation)
  (`/api/handles/{doi}`: `responseCode` 1 es registrado, 100 no)
- [Highwire Press tags (`citation_*`)](https://scholar.google.com/intl/es/scholar/inclusion.html#indexing)
