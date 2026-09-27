import { propioDe, type RegistroDePaginas } from "./documento";

// Lo que dos páginas muestran igual vive en UNA de ellas, la dueña, como una
// sección más: así le sirven sin cambios el borrador, las versiones, «Qué
// cambió» y el aviso de choque, que funcionan por página. La otra lo anota
// del lado de quien usa (`usa` en su sección del registro) y de esa única
// anotación sale todo lo demás: qué rutas regenera publicar la dueña y qué
// avisa el editor en las dos puntas. Sin dominio de ED.

/**
 * Lo que una sección muestra de otra página, que se edita allá. `que` es lo
 * que se comparte, en plural («Las siete áreas»): arma los avisos de las dos
 * puntas.
 */
export type Compartido = { pagina: string; seccion: string; que: string };

/**
 * Las rutas que muestran algo de esta página: la suya y la de cada página que
 * usa alguna de sus secciones. Es lo que publicarla tiene que regenerar.
 */
export function rutasQueMuestran(registro: RegistroDePaginas, slug: string): string[] {
  const pagina = propioDe(registro, slug);
  if (!pagina) return [];
  const otras = Object.values(registro)
    .filter((otra) => Object.values(otra.secciones).some((s) => s.usa?.pagina === slug))
    .map((otra) => otra.ruta);
  return [...new Set([pagina.ruta, ...otras])];
}

/** Las páginas que muestran esta sección de la dueña, con lo que toman de ella. */
export function quienesUsan(registro: RegistroDePaginas, slug: string, seccion: string): Array<{ slug: string; nombre: string; que: string }> {
  return Object.entries(registro).flatMap(([otroSlug, otra]) =>
    Object.values(otra.secciones).flatMap((s) =>
      s.usa?.pagina === slug && s.usa.seccion === seccion ? [{ slug: otroSlug, nombre: otra.nombre, que: s.usa.que }] : [],
    ),
  );
}

/**
 * Lo que está mal anotado: un `usa` que apunta a una página o sección que no
 * existe, a la propia página, o a una sección que a su vez usa otra (sin
 * cadenas: lo compartido vive en un solo lugar). Lo mira el test del registro.
 */
export function problemasDeCompartidos(registro: RegistroDePaginas): string[] {
  return Object.entries(registro).flatMap(([slug, pagina]) =>
    Object.entries(pagina.secciones).flatMap(([clave, s]) => {
      if (!s.usa) return [];
      const donde = `${slug}.${clave}`;
      if (s.usa.pagina === slug) return [`${donde} usa una sección de su propia página`];
      const duena = propioDe(registro, s.usa.pagina);
      const seccion = duena ? propioDe(duena.secciones, s.usa.seccion) : undefined;
      if (!seccion) return [`${donde} usa ${s.usa.pagina}.${s.usa.seccion}, que no existe`];
      return seccion.usa ? [`${donde} usa ${s.usa.pagina}.${s.usa.seccion}, que a su vez usa otra`] : [];
    }),
  );
}
