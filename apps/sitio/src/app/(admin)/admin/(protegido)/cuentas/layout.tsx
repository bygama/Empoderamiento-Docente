import { Guarda } from "@/admin/armazon/Guarda";

export default function LayoutDeCuentas({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="usarCuentas">{children}</Guarda>;
}
