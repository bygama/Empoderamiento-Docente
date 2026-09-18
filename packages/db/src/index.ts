// La superficie pública de @ed/db. Lo que no sale por acá es interno.
//
// Regla del paquete: **nada de dominio de ED adentro.** Si alguna vez aparece
// la palabra «novedad», «material» o «caso» en este paquete, está mal puesto y
// va a `apps/sitio/src/datos/` (AGENTS.md §3, la primera frontera).

export { urlDeLaBase, adaptadorPostgres } from "./base";
export * as slug from "./slug";
