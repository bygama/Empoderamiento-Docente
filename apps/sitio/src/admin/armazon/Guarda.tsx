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
 * **Es la guarda de la experiencia, no toda la seguridad.** Next no vuelve a
 * correr un layout al navegar entre las páginas que envuelve, así que lo que
 * escribe o lee algo delicado lo verifica otra vez donde pasa: cada Server
 * Action chequea su capacidad (`acciones-con-sesion.test.ts`).
 */
export async function Guarda({ capacidad, children }: { capacidad: Capacidad; children: React.ReactNode }) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  if (!puede(sesion.user.rol, capacidad)) return <SinPermiso capacidad={capacidad} rol={sesion.user.rol} />;
  return children;
}
