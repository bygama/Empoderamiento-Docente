// Los tipos de los imports estáticos de imágenes (`import foto from "./x.png"`),
// que Next publica en `next/image-types/global`. Los trae también
// `next-env.d.ts`, pero ese archivo lo genera `next dev`/`next build` y está en
// .gitignore: en un clon limpio no existe y `pnpm typecheck` fallaba (TS2307)
// antes del primer build. Este sí se commitea.
/// <reference types="next/image-types/global" />
