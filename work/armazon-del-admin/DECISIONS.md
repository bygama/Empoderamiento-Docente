# DECISIONS — El armazón del admin

<!-- Append-only: fecha — decisión — por qué. -->

- 2026-09-22 — Tier M para esta lane, aunque el pedido entero se triageó L
  — El L cubría el pedido completo, con el alcance de la seguridad abierto.
  El shaping lo cerró y lo partió en dos lanes. Esta tiene todos los
  archivos listados de antemano (§2 y §3 del SPEC) y entra en una sesión,
  que es la definición de M (`reference/task-tiers.md`). La lane 2 se
  triagea sola cuando se abra.
- 2026-09-22 — La lane se abre con `work/edicion-de-paginas/`,
  `work/metricas/` y `work/primer-deploy/` en el árbol, aunque sus PRs
  (#171, #168 y #167) están MERGED — Son lanes de Facundo de varios PRs, y
  su propio SPEC declara trabajo que sigue en la misma lane: fases B a D,
  fases B y C, y Tasks 3, 5 y 6. Es el mismo criterio que usó
  `condiciones-de-la-revision` (en la historia, `91e300d`). Si el owner lo
  ve distinto, se cierran con `work-handoff`.
- 2026-09-22 — El hover del CTA aclara 10 % en vez de oscurecerlo, y
  `DESIGN.md` §7 lo dice — Con el texto `azul-principal` (paso 1),
  oscurecer 10 % da 3,75:1 y rompe AA; aclarar da 5,07:1. Es la misma
  regla de §7 que el owner aprobó cambiar, pero no estaba en la lista de
  commits: el cambio queda sin commitear hasta el cierre, donde se pide el
  OK junto con los otros commits extra.
- 2026-09-22 — El borde de los inputs de acceso pasa de `azul-claro` a
  `gris-texto`, y el texto del aviso de error de `naranja-accion-texto` a
  `azul-principal`, con un borde naranja — Medidos: `azul-claro` sobre
  blanco da 1,77:1 (un control pide 3:1) y el error daba 4,33:1 sobre su
  fondo (el texto pide 4,5:1). `Aviso` lo usa todo el admin, así que el
  arreglo alcanza también al editor y a las métricas.
- 2026-09-22 — Las acciones de páginas (guardar, publicar y descartar)
  revalidan el layout protegido — El layout no se vuelve a pedir al navegar,
  así que el punto de «sin publicar» (SPEC §2) quedaba viejo hasta
  recargar. Revalidar desde la Server Function actualiza la pantalla en el
  acto (doc de Next 16, `revalidatePath`). El editor no pierde lo escrito
  porque su `key` sigue siendo el slug. Toca `datos/acciones/paginas.ts`,
  que el PLAN no nombraba.
- 2026-09-22 — La sidebar suma «Todas las páginas» arriba del árbol — La
  pantalla «Páginas» se queda como vista general (SPEC §2) y necesita una
  entrada; el boceto aprobado no la dibujaba.
- 2026-09-22 — El botón «Publicar» del editor pasa a texto
  `azul-principal` — Blanco sobre `naranja-accion` da 3,00:1, y `DESIGN.md`
  §7 ahora dice que el admin usa el texto azul. No estaba en la lista de
  commits: queda sin commitear hasta el cierre, junto con el hover de §7.
- 2026-09-22 — La revisión de cierre es un solo revisor, en Opus 5.5, con
  el lente de todo el cambio contra el SPEC — Decisión del owner, textual:
  «1 revisor, Opus 5.5». El default de las marcas eran cuatro (sumaba
  fallas silenciosas para el paso 6, impacto en la documentación para el 1
  y accesibilidad para el 7); esos tres lentes no se compran.
- 2026-09-22 — `ArbolDelSitio` lleva `"use client"`, aunque el SPEC §2
  decía «solo el panel móvil» (hallazgo Important 3 de la revisión) — El
  ítem activo y la página abierta salen de la ruta actual. El layout no la
  recibe y **no se vuelve a renderizar en la navegación del cliente**: un
  valor armado en el servidor (por ejemplo, una cabecera puesta por el
  middleware) quedaría viejo al pasar de una página del admin a otra. Solo
  `usePathname` se entera. El componente no pide datos: los recibe ya
  armados de `BarraLateral`, que sigue siendo Server Component, así que lo
  que viaja al navegador es el árbol y nada más.
- 2026-09-22 — Desvíos chicos que la revisión pidió dejar escritos —
  - «Inicio · métricas» en vez de «Inicio»: el admin y la página Inicio
    del sitio se llamaban igual en la misma lista (el boceto aprobado ya
    decía «Inicio · métricas»).
  - La bajada de «Nueva contraseña» pasa a «Es la que vas a usar para
    entrar al admin.», porque la de antes («Doce caracteres o más.») ahora
    es la ayuda del campo.
  - La grilla de puntos es la utilidad `pattern-dots-inverse` de
    `globals.css` (13 %). El SPEC decía 12 %; `DESIGN.md` §6 pide del 10
    al 15 %, y usar la utilidad evita un valor nuevo.
  - La barra del celular no es `sticky`: la barra de acciones del editor
    ya lo es, y dos barras pegadas se pisan. Para abrir el menú desde
    abajo de un editor largo hay que subir. Queda anotado como posible
    mejora.
- 2026-09-22 — Los errores del acceso usan `naranja-accion-texto` en el
  borde del campo rechazado y `naranja-accion` en el borde del aviso,
  aunque el SPEC §3 dice que el CTA es el único naranja — La paleta de
  `DESIGN.md` no tiene color de error. El admin ya marcaba los errores en
  naranja antes de esta lane (el `Aviso` de la fase A), y el estado de
  error solo aparece después de un rechazo, nunca junto al CTA en reposo.
  Si ED quiere un color de error propio, se define en `DESIGN.md` y se
  cambia en un solo lugar (`ENTRADA_DE_ACCESO` y `Aviso`).
