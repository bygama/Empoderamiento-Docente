import { hostDelBlob } from "@/lib/contenido/host-del-blob";
import { validarComoAlGuardar } from "@/lib/contenido/fotos";

/**
 * Valida lo que el admin guarda con la regla de guardar: de Blob, solo las
 * fotos del store de este sitio, el de su token (`esSrcDeFoto`). Al leer, el
 * mismo esquema acepta cualquier store, para que un cambio de token no
 * esconda lo publicado. Lo usa cada `editar-*.ts`; fotos-de-otro-store.test.ts
 * lo exige.
 */
export function validarAlGuardar<T>(validar: () => T): T {
  return validarComoAlGuardar(hostDelBlob(process.env.BLOB_READ_WRITE_TOKEN), validar);
}
