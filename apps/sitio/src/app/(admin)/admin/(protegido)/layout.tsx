import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROL_POR_DEFECTO } from "@ed/auth";
import { auth } from "@/datos/auth";
import { BarraLateral } from "@/admin/armazon/BarraLateral";
import { COOKIE_DEL_TEMA, temaDe } from "@/admin/armazon/tema";

/**
 * **Acá se verifica la sesión de verdad.**
 *
 * El middleware solo mira que la cookie esté —corre en Edge y no puede
 * consultar la base—, así que este layout es el que pregunta si la sesión
 * existe, está firmada y no venció. Envuelve a todo lo que cuelga de `/admin`
 * menos entrar, olvidé y nueva contraseña, así que ninguna pantalla del admin
 * puede olvidarse de chequear: no hay dónde olvidarse.
 *
 * Y es el armazón: la sidebar a la izquierda (desde `lg`) y el contenido en
 * una tarjeta que toca arriba, abajo y a la derecha de la ventana. Solo las
 * dos esquinas que dan a la sidebar son redondas, y la tarjeta scrollea por
 * dentro para que esas curvas queden siempre a la vista. En el celular la
 * tarjeta ocupa todo el ancho, debajo de la barra del menú, y scrollea la
 * página. `data-tema` elige el tema (globals.css); el color y el fondo se
 * repiten acá porque los del `body` se calcularon con la paleta clara, y en el
 * mixto el fondo es el azul de la sidebar, que es lo que asoma detrás de las
 * esquinas redondas.
 */
export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) redirect("/admin/entrar");
  const tema = temaDe((await cookies()).get(COOKIE_DEL_TEMA)?.value);

  return (
    <div data-tema={tema} className="flex min-h-dvh flex-col bg-gris-fondo text-azul-principal mixto:bg-azul-principal lg:h-dvh lg:pl-72">
      <BarraLateral usuario={{ nombre: sesion.user.name, rol: sesion.user.rol ?? ROL_POR_DEFECTO }} tema={tema} />
      <main className="flex-1 bg-white lg:overflow-y-auto lg:rounded-l-2xl">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
