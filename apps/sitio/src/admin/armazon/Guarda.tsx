import { redirect } from "next/navigation";
import { puede, type Capacidad } from "@ed/auth";
import { sesionActual } from "@/datos/sesion";
import { SinPermiso } from "./SinPermiso";

/**
 * La guarda de un módulo: la llama el layout de cada uno con la capacidad que
 * le da `modulos.ts` (`guarda.test.ts` falla si un módulo no la llama, o la
 * llama con otra). Con la capacidad, dibuja el módulo; sin ella, «Sin
 * permiso».
 *
 * **En un layout, solo oculta la interfaz: no protege ningún dato.** Next
 * dibuja el layout y la página en paralelo, y la página viaja en el payload
 * aunque el layout muestre «Sin permiso»; tampoco vuelve a correr el layout al
 * navegar entre las páginas que envuelve. Lo que protege los datos es el
 * chequeo donde se leen o se escriben: cada página de un módulo que deja
 * afuera a algún rol chequea su capacidad antes de leer (`guarda.test.ts`),
 * las consultas de `datos/` que lo necesitan reciben el rol y no devuelven
 * nada sin ella, y cada Server Action chequea la suya
 * (`acciones-con-sesion.test.ts`). Envolviendo lo que lee adentro de una
 * página, como en Mensajes, sí corta: lo que no se dibuja no se lee.
 */
export async function Guarda({ capacidad, children }: { capacidad: Capacidad; children: React.ReactNode }) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, capacidad)) return <SinPermiso capacidad={capacidad} rol={sesion.user.rol} />;
  return children;
}
