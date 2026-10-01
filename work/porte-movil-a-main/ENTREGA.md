# Porte de la versión de celular y tablet a `main`

2026-09-30. Pedido de Gastón: que estén en `main` todos los cambios de sus cuatro
ramas de celular y tablet, con las buenas prácticas del repo y react-doctor en
100/100.

## De dónde venía

Las cuatro ramas eran una sola cadena apilada, más la rama que estuvo en
producción (en Vercel, hasta que el dominio pasó al VPS):

| Rama | Qué era |
| --- | --- |
| `feat/mobile-tablet-secciones-restantes` | los primeros 59 commits |
| `design/que-hacemos-entrada-como-trabajamos` | la anterior + 3 |
| `design/inicio-quienes-movil` | la anterior + 1: la cadena entera (63) |
| `release/movil-2026-09-28` | la misma cadena sobre otra base, más 5 arreglos que la cadena no tenía |

La cadena salía de `main` del 2026-09-18. En el medio, `main` pasó el
contenido a la base (admin propio sobre Prisma) y partió varios componentes,
así que no se podía rebasar: hubo que portar.

## Cómo se portó

Ocho PRs por tema, en serie: cada una desde el `main` del momento, con
`cherry-pick -x` (cada commit dice de qué commit viene) y *rebase and merge*.

| PR | Tema | Commits |
| --- | --- | --- |
| #211 | Menú móvil (cortina) | 12 |
| #212 | Inicio | 13 |
| #215 | Qué hacemos | 14 |
| #217 | Biblioteca, Contacto y 404 | 10 |
| #222 | Novedades | 4 |
| #223 | Quiénes somos | 3 |
| #224 | Investigación | 5 |
| #225 | Arreglos de la rama de lanzamiento que faltaban | 5 |

Más esta, con la documentación de la lane de celular (auditoría, planes y
entrega) y este resumen.

Quedaron afuera, a propósito: un `fix` y su `revert` (se anulan) y dos `chore`
de rutas propios de la rama de lanzamiento, que en `main` no aplican.

## Reglas que se siguieron

- **El contenido es el de `main`.** Lo que la cadena tenía escrito en código
  (fotos del hero, textos, nombres cortos de las áreas, frases del faro, pasos
  de la historia) se lee del contenido editable. Lo que es estructura
  (geometría, focos de recorte por foto, cantidades fijas) vive en código, al
  lado de la geometría que ya tenía `main`. Ningún esquema cambió y no hubo
  migraciones.
- **Las piezas nuevas van en la carpeta que `main` ya tenía** para cada
  componente partido (`hero-quienes/`, `puente-investigacion/`,
  `lineas-investigacion/`, `cierre-investigacion/`…), no en carpetas paralelas.
- **Computadora igual a `main`**, salvo lo que la cadena cambiaba a propósito y
  ya estaba en producción: los filtros desplegables de Biblioteca y su columna
  con alto tope, el foco de «Hacer otra consulta» en Contacto y la tarjeta
  «Investigación aplicada» del hero. Cada PR lo dice.
- Cada commit adaptado lleva un párrafo «Portado a main: …» con lo que cambió
  respecto del original.

## Cómo se verificó cada PR

- Gate completo: typecheck, lint, react-doctor 100/100 sin diagnósticos en los
  cuatro proyectos, los tests y `pnpm build`, con la base local migrada.
- Computadora contra `main` sin tocar: las 7 páginas a 1280 y 1440, 14 pasos de
  scroll cada una, píxeles y geometría.
- Celular (390) y tablet (768) contra la cadena que estaba en producción, más
  las suites por página, la rotación y el menú.
- Una revisión independiente por tema. Lo que encontró quedó corregido en el
  commit que correspondía; lo que se dejó está anotado en la PR.

## Lo que queda anotado

- Contenido oculto para lectores de pantalla mientras una escena lo anima con
  `autoAlpha` (cierre, origen, historia de Investigación). Es el mismo patrón
  que escritorio y que la cadena.
- El modo de Niveles y Proyectos (Qué hacemos) no se recalcula si una tablet
  rota cruzando 1024 px. Venía de la cadena.
- `FaroEscena.tsx` ya estaba por encima del tope de 200 líneas en `main`; el
  porte le sumó 12.
- «Tarjetas (celular)» del hero conserva 8 lugares para no invalidar el
  contenido guardado, aunque la escena usa 4. Achicarla es una migración, para
  hablar con quien lleve el admin.
