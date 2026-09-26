import type { Metadata } from "next";
import { Suspense } from "react";
import { MINUTOS_DEL_CODIGO } from "@ed/auth/servidor";
import { Pantalla } from "@/admin/armazon/Pantalla";
import { FormularioCodigo } from "./FormularioCodigo";

export const metadata: Metadata = { title: "Código para entrar" };

// El segundo paso de entrar, para quien tiene el segundo factor (SPEC de
// work/cuentas §5.2). Sin sesión todavía: el proxy la deja abierta porque
// cuelga de /admin/entrar, y better-auth sabe de quién es por su cookie.
export default function CodigoParaEntrar() {
  return (
    <Pantalla titulo="Escribí el código">
      <Suspense>
        <FormularioCodigo minutosDeVigencia={MINUTOS_DEL_CODIGO} />
      </Suspense>
    </Pantalla>
  );
}
