import { auth } from "@/datos/auth";

// El endpoint HTTP de better-auth: entrar, salir, pedir contraseña nueva.
//
// Tiene que existir aunque las pantallas todavía no: el rate limit por IP vive
// acá, no en las llamadas `auth.api.*` del servidor, que lo saltean por diseño
// porque son código nuestro. Sin esta ruta, el límite no se puede probar y por
// lo tanto no es un límite.
//
// Se usa el handler crudo y no `toNextJsHandler`: ese adaptador vive en
// `better-auth/next-js`, y traerlo obligaría a que la app dependa de
// better-auth directo en vez de pasar por `@ed/auth`. Lo único que hace es
// esto mismo.
const manejar = (req: Request) => auth.handler(req);

export { manejar as GET, manejar as POST };
