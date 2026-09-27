import { Guarda } from "@/admin/armazon/Guarda";

// Ajustes es de quien dirige y quien administra. La guarda solo oculta la
// interfaz: cada página chequea `usarAjustes` otra vez antes de leer nada.
export default function LayoutDeAjustes({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="usarAjustes">{children}</Guarda>;
}
