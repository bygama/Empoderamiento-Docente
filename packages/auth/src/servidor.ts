// La mitad de @ed/auth que solo corre en el servidor, en Node: arma la sesión
// y hashea con Argon2id, que es un módulo nativo.
//
// Va aparte de `index.ts` porque ese lo importan también el navegador (el
// cliente de auth, los permisos) y el proxy. Con `crearAuth` adentro, cada uno
// de esos bundles intentaba resolver `@node-rs/argon2` y el build se caía con
// «Can't resolve '@node-rs/argon2-wasm32-wasi'».

export { crearAuth } from "./config";
export type { Auth, OpcionesDeAuth } from "./config";
