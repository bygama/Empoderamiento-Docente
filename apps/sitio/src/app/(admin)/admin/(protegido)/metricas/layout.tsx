import { Guarda } from "@/admin/armazon/Guarda";

export default function LayoutDeMetricas({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="verMetricas">{children}</Guarda>;
}
