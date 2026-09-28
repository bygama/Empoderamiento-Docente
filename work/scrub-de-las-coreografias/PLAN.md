# PLAN — El scrub de las coreografías

Lane chica, un solo implementador, sin sub-lanes. Del SPEC salen dos pasos
de código y uno de verificación que corre entre los dos y al final.

## Paso 0 — La línea base (hecho)

Antes de tocar nada: `capturar.mjs` recorre las 6 páginas afectadas a 13
alturas cada una y saca la captura con el scroll quieto (900 ms después
de posarse), 78 en total. Se corrió **dos veces sobre el mismo código**
para medir el ruido del método: **70 de 78 son idénticas píxel a píxel**;
las 8 que varían (`inicio-00`, `inicio-03`, `investigacion-10`,
`novedades-00`, `quienes-somos-00/06/07/10`) tienen animaciones autónomas
en cuadro y se leen a ojo, no por diff.

`comparar.mjs` (sharp, que ya es dependencia de `apps/sitio`) da el % de
píxeles distintos por captura; el umbral es 0,05 %.

Los dos scripts viven en el scratchpad de la sesión, no en el repo: son de
esta lane y no hay un segundo consumidor.

## Paso 1 — Los 20 de los grupos 1, 2 y 3

`scrub: true` → `scrub: 0.5` en 20 líneas de 16 archivos. La única
excepción al 0.5: en `hero-quienes/` los dos triggers sin animación llevan
`0.6`, el valor que ya usa su vecino `progreso-quienes.ts` (es inerte en
los tres, ver SPEC §3; se elige por coherencia de carpeta).

Cuidado con el repo en CRLF: `sed -i` deja LF. Después de editar, devolver
los archivos a CRLF (python con `newline=''`) y comprobar que `git diff`
no avise.

**Verificación:** captura «después» y diff contra la línea base. Con el
scroll quieto, cero diferencias fuera de las 8 posiciones ruidosas.

## Paso 2 — Los 2 del grupo 4, por código

- `destacados/coreografia-destacados.ts` (fase 3, barrido): el `clipPath`
  deja de ser un `fromTo` con scrub. Un `ScrollTrigger.create` sin
  animación, con el mismo `start`/`end`, y en `onUpdate`/`onRefresh` el
  recorte se escribe desde `self.progress`, que en un trigger sin
  animación es el progreso crudo del scroll de ese rango (SPEC §3): el
  borde queda **donde está la línea**, no donde un tween con demora cree
  que está.
- `lineas-investigacion/coreografia-lineas.ts`: la rotación deja de ser un
  timeline con scrub. Un `ScrollTrigger.create` sin animación y, en
  `onUpdate`/`onRefresh`, la rotación se calcula a mano desde
  `self.progress` con las mismas curvas del timeline: `power2.out` hasta
  0.42, derecha hasta 0.58, `power2.in` hasta 1. Ojo: en GSAP `power2` es
  **cúbica** (`p ** 3`, `gsap-core.js:1068`), no cuadrática.

Los dos llevan `scrub: 0.5`, inerte por no tener animación atada, y dejan
de necesitar `invalidateOnRefresh`: ese flag recalcula valores de tween, y
ya no hay tween. Los `start`/`end` por función los re-evalúa ScrollTrigger
solo en cada refresh.

**Verificación:** además del diff quieto, las dos con el scroll en
movimiento, a ojo: el borde del recorte pegado a la divisoria y la
carpeta derecha justo en el centro.

## Paso 3 — El cierre

1. `grep -rnE "scrub:[[:space:]]*true" apps/sitio/src` sin líneas de código.
2. Gate: `pnpm typecheck`, `pnpm lint`, `pnpm react-doctor`, `pnpm test`,
   `pnpm build`.
3. `PROGRESS.md` de esta lane con la evidencia; la nota «11 coreografías
   de 8 archivos» del `PROGRESS` del mapa del admin apunta acá.
4. Commits (con OK): uno por paso de código, `refactor(sitio)` los dos.
5. PR con las capturas de las dos del grupo 4 en movimiento.
