import { Guarda } from "@/admin/armazon/Guarda";

export default function LayoutDeContenido({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="editarContenido">{children}</Guarda>;
}
