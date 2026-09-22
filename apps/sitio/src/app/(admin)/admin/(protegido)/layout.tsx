import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROL_POR_DEFECTO } from "@ed/auth";
import { auth } from "@/datos/auth";
import { BarraLateral } from "@/admin/armazon/BarraLateral";

/**
 * **Acá se verifica la sesión de verdad.**
 *
 * El middleware solo mira que la cookie esté —corre en Edge y no puede
 * consultar la base—, así que este layout es el que pregunta si la sesión
 * existe, está firmada y no venció. Envuelve a todo lo que cuelga de `/admin`
 * menos entrar, olvidé y nueva contraseña, así que ninguna pantalla del admin
 * puede olvidarse de chequear: no hay dónde olvidarse.
 *
 * Y es el armazón: la sidebar a la izquierda (desde `lg`) y el contenido a la
 * derecha (SPEC §2 de work/armazon-del-admin).
 */
export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) redirect("/admin/entrar");

  return (
    <div className="min-h-dvh bg-white lg:pl-72">
      <BarraLateral usuario={{ nombre: sesion.user.name, rol: sesion.user.rol ?? ROL_POR_DEFECTO }} />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
