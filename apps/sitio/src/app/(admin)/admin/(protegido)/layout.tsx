import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/datos/auth";
import { SalirDelAdmin } from "@/admin/armazon/SalirDelAdmin";

/**
 * **Acá se verifica la sesión de verdad.**
 *
 * El middleware solo mira que la cookie esté —corre en Edge y no puede
 * consultar la base—, así que este layout es el que pregunta si la sesión
 * existe, está firmada y no venció. Envuelve a todo lo que cuelga de `/admin`
 * menos entrar, olvidé y nueva contraseña, así que ninguna pantalla del admin
 * puede olvidarse de chequear: no hay dónde olvidarse.
 */
export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) redirect("/admin/entrar");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between border-b border-azul-claro pb-4">
        <div>
          <p className="font-[family-name:var(--font-manrope)] font-bold">Empoderamiento Docente</p>
          <p className="text-sm text-gris-texto">
            {sesion.user.name} · {String((sesion.user as { rol?: string }).rol ?? "")}
          </p>
        </div>
        <SalirDelAdmin />
      </header>
      {children}
    </div>
  );
}
