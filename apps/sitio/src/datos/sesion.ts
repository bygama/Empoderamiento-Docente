import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

/**
 * La sesión de este pedido, preguntada a la base una sola vez aunque la pidan
 * el layout protegido, la guarda de un módulo y la página. `cache` de React
 * vive lo que dura un render del servidor, así que no hay una sesión vieja
 * entre pedidos.
 *
 * Las Server Actions **no** la usan: cada una llama a `auth.api.getSession`
 * como primera cosa, y `acciones-con-sesion.test.ts` lo exige a la letra.
 *
 * Las dos llegan al mismo lugar, el vencimiento de la sesión en better-auth,
 * y ahí viven los topes: 12 horas sin uso y 7 días desde que se abrió, se use
 * o no (`@ed/auth`, vida-de-la-sesion.ts). Ni esto ni las acciones los miran
 * aparte.
 */
export const sesionActual = cache(async () => auth.api.getSession({ headers: await headers() }));
