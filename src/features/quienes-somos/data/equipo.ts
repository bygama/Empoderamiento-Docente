/**
 * EQUIPO ED — fuente única de datos de las personas que sostienen ED.
 *
 * Centraliza el roster que antes vivía inline en ImpulsanEd.tsx para que las
 * tarjetas y el perfil full-screen (shell) consuman la misma estructura y sea
 * reutilizable en la Parte 2 (recorrido inmersivo por persona).
 *
 * JERARQUÍA institucional del cliente (Equipo ED.docx + planilla EQUIPO Y
 * ALIANZAS) — `tier`:
 *   1. Dirección General            → Daniela (nivel exclusivo)
 *   2. Dirección                    → Karla (académica) · Raquel (institucional)
 *   3. Líderes de área y proyecto   → Iván · Judith · Gabriela · Marcela ·
 *                                     Luis López · Andrea
 *   4. Facilitación y diseño         → las seis restantes
 *
 * El nivel 2 se llamaba «Dirección académica» cuando lo ocupaba solo Karla. La
 * planilla del cliente suma a Raquel Ayala en gestión institucional, así que el
 * rótulo del nivel pasó a «Dirección» y el cargo puntual lo dice cada ficha.
 * OJO: en esa planilla su cargo figura literalmente como «"Directora" a
 * confirmar de Gestión Institucional» — el título está PENDIENTE de validar.
 *
 * `imagePosition`: object-position individual por foto (encuadres reales muy
 * dispares: retratos, selfies, planos enteros y una landscape). Ubica el rostro
 * sin recortarlo mal. Afinado sobre las fotos reales de /public/equipo.
 *
 * DATOS REALES ÚNICAMENTE. Campos pendientes del cliente (no inventar):
 *   - `linkedin`: solo quienes lo aportaron en su ficha de julio 2026.
 *   - `pubs`: solo quienes ya las aportaron.
 *   - Andrea Vergara PIDIÓ no publicar foto («preferiría no incorporar una foto
 *     por el momento»): va con `sinFoto` y la card se resuelve tipográfica.
 *   - Trayectoria / investigaciones / materiales: Parte 2 (no en esta etapa).
 */

export type Publicacion = { titulo: string; url?: string };

export type Tier = 1 | 2 | 3 | 4;

/* ─────────────────────────────────────────────────────────────────────────
 * PERFIL INMERSIVO (Parte 2) — motor de datos reutilizable.
 *
 * `Persona.profile` es OPCIONAL: solo las personas con recorrido desarrollado
 * lo tienen. Hoy únicamente Daniela (caso modelo). El resto conserva el shell
 * básico de la Parte 1. Para sumar otra persona luego alcanza con cargar su
 * `Profile`: el mismo componente (ImmersiveProfile) se adapta a la cantidad
 * real de etapas, hitos y publicaciones — sin duplicar animación ni layout.
 *
 * Familias de color (acento, nunca fondo por etapa — ver DESIGN.md §manual):
 *   verde   → aula / origen / concepto (empoderamiento) / convergencia
 *   azul    → investigación y saber
 *   naranja → transformación y política (acento puntual, uso mínimo)
 * ──────────────────────────────────────────────────────────────────────── */

export type ProfileColor = "verde" | "azul" | "naranja";

/** Hito puntual dentro de una etapa (cargo, tesis, diseño…). */
export type Milestone = {
  period?: string;
  title: string;
  detail?: string;
  /** Se destaca por sobre el resto (p. ej. Directora General de ED). */
  primary?: boolean;
};

/** Ramificación menor de una etapa (estancias internacionales, señales). */
export type Branch = {
  period?: string;
  place: string;
  detail: string;
};

/** Pieza de producción. Sin portada real → card tipográfica (no inventar portada). */
export type ProfilePublication = {
  year?: string;
  kind: "Libro" | "Artículo" | "Colección" | "Materiales";
  title: string;
  meta?: string;
  /** Conceptos representativos (colección de materiales), no ISBN ni catálogo. */
  concepts?: string[];
  featured?: boolean;
};

/** Categoría lateral persistente (orientación durante el recorrido). */
export type ProfileCategory = { id: string; label: string; color: ProfileColor };

/**
 * Composición visual de la etapa dentro del recorrido (variedad editorial,
 * no "otra card blanca más"):
 *   editorial → bloque amplio sin chrome: título grande + texto + lista mínima.
 *   ficha     → panel breve y acotado (títulos académicos) + ramas satélite.
 *   concepto  → tratamiento tipográfico: cita destacada + línea sostenida.
 *   hitos     → 1-2 hitos primarios con aire + secundarios en línea compacta.
 *   mapa      → etiquetas territoriales sueltas (constelación, no lista).
 *   ramas     → piezas editoriales como ramificaciones del camino.
 *   sintesis  → hito primario protagonista + roles actuales compactos.
 */
export type StageVariant =
  | "editorial"
  | "ficha"
  | "concepto"
  | "hitos"
  | "mapa"
  | "ramas"
  | "sintesis";

/** Una de las etapas del recorrido (7 en Daniela; variable en otras personas). */
export type ProfileStage = {
  id: string;
  /** Número de etapa 1..N — se muestra y ancla el nodo del camino. */
  n: number;
  /** Categoría lateral que se activa al entrar a esta etapa. */
  categoryId: string;
  eyebrow: string;
  color: ProfileColor;
  period?: string;
  title: string;
  body: string;
  /** Composición visual de la etapa. Default: "editorial". */
  variant?: StageVariant;
  /** Cita textual REAL destacable (p. ej. título validado de la tesis). */
  quote?: string;
  milestones?: Milestone[];
  branches?: Branch[];
  /** Etiquetas sintéticas (p. ej. países de la etapa internacional). */
  tags?: string[];
  publications?: ProfilePublication[];
};

/**
 * Recorrido inmersivo completo de una persona. `identity` (nombre, cargo, país)
 * vive en la `Persona`; acá se agrega la narrativa, la fotografía recortada y
 * las etapas. Estructura pensada para reutilizar: cargar datos → elegir etapas
 * → asignar imagen → mismo motor.
 */
export type Profile = {
  /** Nombre completo validado (difiere del `nombre` corto de la card). */
  fullName: string;
  role: string;
  location: string;
  origin?: string;
  /**
   * Tratamiento de la fotografía dentro del recorrido:
   *   "recorte" → figura sin fondo, parada sobre el borde de la página. Pide un
   *               PNG recortado a mano; hoy solo existe el de Daniela.
   *   "marco"   → la foto tal cual, dentro de un marco redondeado. Es lo que
   *               corresponde cuando no hay recorte hecho: una foto rectangular
   *               "parada" sobre el papel se lee como un error, no como figura.
   *   "sin"     → no hay foto y no la va a haber (decisión de la persona); el
   *               recorrido se resuelve tipográfico, sin hueco ni marcador.
   * Default: "recorte" (el caso original).
   */
  figura?: "recorte" | "marco" | "sin";
  /** Imagen de la figura. Opcional: con `figura: "sin"` no existe. */
  cutout?: string;
  cutoutPosition?: string;
  headline: string;
  intro: string;
  formation: string[];
  categories: ProfileCategory[];
  stages: ProfileStage[];
  closing: { title: string; body: string; body2?: string };
};

export type Persona = {
  /** slug — coincide con el archivo /public/equipo/{key}.jpg */
  key: string;
  nombre: string;
  rol: string;
  pais: string;
  tier: Tier;
  /** Bio oficial. Se preserva del sistema anterior; se muestra en el perfil (Parte 2). */
  bio: string;
  /** object-position del <img> para encuadrar el rostro según la foto real. */
  imagePosition: string;
  /**
   * Acercamiento propio de esta foto (1 = la foto tal cual; nunca menor a 1,
   * porque dejaría de cubrir la card).
   *
   * Las fotos reales van del selfie de primer plano al plano de medio cuerpo.
   * Con un solo encuadre para todas, quien fue retratado de lejos aparece con
   * la cara mucho más chica dentro de una card del mismo tamaño y termina
   * leyéndose como si pesara menos que sus pares — una jerarquía accidental que
   * la sacó el fotógrafo, no el organigrama. Este zoom empareja el TAMAÑO DE
   * LOS ROSTROS dentro de cada nivel; no toca el tamaño de la card.
   */
  imageZoom?: number;
  /**
   * La persona pidió NO publicar foto. La card se resuelve con una superficie
   * tipográfica de marca en vez de dejar un hueco o un ícono de "falta algo":
   * no tener retrato es una decisión, no un dato pendiente.
   */
  sinFoto?: boolean;
  linkedin?: string;
  pubs?: Publicacion[];
  /** Recorrido inmersivo (Parte 2). Solo quienes lo tienen desarrollado. */
  profile?: Profile;
};

/** Rótulo institucional por nivel jerárquico. */
export const TIER_ROTULO: Record<Tier, string> = {
  1: "Dirección general",
  2: "Dirección",
  3: "Líderes de área y proyecto",
  4: "Facilitación y diseño de materiales",
};

export const EQUIPO: Persona[] = [
  {
    key: "daniela-reyes",
    nombre: "Daniela Reyes",
    rol: "Directora General",
    pais: "Argentina",
    tier: 1,
    imagePosition: "50% 20%",
    bio: "Especialista en desarrollo profesional docente y desarrollo del pensamiento matemático. Profesora de Matemática. Doctora en Ciencias con especialidad en Matemática Educativa.",
    profile: {
      fullName: "Daniela Reyes-Gasperini",
      role: "Dirección General",
      location: "Santiago de Chile, Chile",
      origin: "Buenos Aires, Argentina",
      figura: "recorte",
      cutout: "/equipo/daniela-reyes-cutout.webp",
      cutoutPosition: "50% 22%",
      headline:
        "Del aula a la investigación. De la investigación, a la transformación educativa.",
      intro:
        "Profesora de Matemática, investigadora y asesora educativa. Su recorrido conecta la práctica docente, la Matemática Educativa, el diseño curricular y las políticas de transformación.",
      formation: [
        "Profesora de Matemática",
        "Magíster en Ciencias — Matemática Educativa",
        "Doctora en Ciencias — Matemática Educativa",
        "Especialista en Política y Gestión Educativa",
      ],
      categories: [
        { id: "matematica-educativa", label: "Matemática educativa", color: "azul" },
        { id: "empoderamiento-docente", label: "Empoderamiento docente", color: "verde" },
        { id: "investigacion-aplicada", label: "Investigación aplicada", color: "azul" },
        { id: "desarrollo-profesional", label: "Desarrollo profesional docente", color: "verde" },
        { id: "politica-transformacion", label: "Política y transformación educativa", color: "naranja" },
      ],
      stages: [
        {
          id: "aula",
          n: 1,
          categoryId: "matematica-educativa",
          color: "verde",
          eyebrow: "El aula como origen",
          period: "2008 – 2009",
          variant: "editorial",
          title: "Todo comenzó enseñando Matemática.",
          body: "Daniela comenzó su recorrido como profesora de Matemática en escuelas secundarias de Buenos Aires. La práctica docente fue el punto de partida de una pregunta que atravesaría toda su trayectoria: cómo transformar la relación entre el profesorado, el saber matemático y el aula.",
          milestones: [
            { title: "Colegio Francesco Faà di Bruno", detail: "Profesora de Matemática — Buenos Aires" },
            { title: "Instituto William C. Morris", detail: "Profesora de Matemática — Buenos Aires" },
            {
              title: "Instituto Superior del Profesorado «Dr. Joaquín V. González»",
              detail: "Formación y docencia — Buenos Aires",
            },
          ],
        },
        {
          id: "mexico",
          n: 2,
          categoryId: "investigacion-aplicada",
          color: "azul",
          eyebrow: "Investigar la práctica",
          period: "2009 – 2016",
          variant: "ficha",
          title: "Del aula a la Matemática Educativa.",
          body: "En México, su experiencia docente se convirtió en investigación. Cursó la maestría y el doctorado en Matemática Educativa en el Cinvestav-IPN, profundizando en la socioepistemología y en los procesos de transformación de la práctica docente.",
          milestones: [
            { period: "2009 – 2011", title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN, México" },
            { period: "2012 – 2016", title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN, México" },
          ],
          branches: [
            { period: "2015", place: "Francia", detail: "Estancia doctoral — Université Paris Diderot · Paris 7" },
            { period: "2015", place: "Portugal", detail: "Estancia doctoral — Instituto de Educação, Universidad de Lisboa" },
          ],
        },
        {
          id: "empoderamiento",
          n: 3,
          categoryId: "empoderamiento-docente",
          color: "verde",
          eyebrow: "Una idea toma forma",
          period: "2011 – 2016",
          variant: "concepto",
          title: "Empoderamiento docente desde la socioepistemología.",
          body: "Durante su maestría y doctorado desarrolló una línea de investigación centrada en el empoderamiento docente: no como poder sobre otras personas, sino como la construcción de saber, convicción y herramientas para transformar la práctica educativa.",
          // Título REAL de la línea de tesis (maestría → doctorado) — se muestra
          // UNA vez como cita destacada; los tres trabajos van como línea sostenida.
          quote:
            "Empoderamiento docente desde una visión Socioepistemológica: una alternativa de intervención para el cambio y la mejora educativa.",
          milestones: [
            {
              period: "2011",
              title: "Tesis de maestría",
              detail: "«Empoderamiento docente desde una visión Socioepistemológica: estudio de los factores de cambio en las prácticas del profesor de matemáticas.»",
            },
            {
              period: "2013",
              title: "Memoria predoctoral",
              detail: "«Empoderamiento docente desde una visión Socioepistemológica: una alternativa de intervención para el cambio y la mejora educativa.»",
            },
            {
              period: "2016",
              title: "Tesis doctoral",
              detail: "«Empoderamiento docente desde una visión Socioepistemológica: una alternativa de intervención para el cambio y la mejora educativa.»",
            },
          ],
          publications: [
            {
              year: "2016",
              kind: "Libro",
              title: "Empoderamiento docente y Socioepistemología",
              meta: "Un estudio sobre la transformación educativa en Matemáticas · Editorial Gedisa",
              featured: true,
            },
          ],
        },
        {
          id: "formacion",
          n: 4,
          categoryId: "desarrollo-profesional",
          color: "naranja",
          eyebrow: "De la investigación a la acción",
          period: "2012 – 2020",
          variant: "hitos",
          title: "La investigación se convirtió en trabajo institucional.",
          body: "Su trabajo se expandió hacia la formación de docentes, el diseño curricular, la innovación educativa y la construcción de políticas públicas en Matemáticas.",
          milestones: [
            { period: "2014 – 2017", title: "Diseño del currículo de Matemáticas — Educación Media Superior", detail: "México", primary: true },
            { period: "2018", title: "Dirección Académica e Innovación Educativa", detail: "Secretaría de Educación Pública de México", primary: true },
            { period: "2012 – 2014", title: "Docencia de posgrado para formación docente", detail: "Oaxaca, México" },
            { period: "2016 – 2018", title: "Coordinación académica — Desarrollo Profesional Docente en Matemáticas", detail: "Programa Interdisciplinario, Cinvestav-IPN" },
            { period: "2017 – 2018", title: "Dirección de área y asesoría académica", detail: "Construye T" },
            { period: "2020 – 2023", title: "Consejo Técnico de los Exámenes Nacionales de Ingreso", detail: "CENEVAL" },
          ],
        },
        {
          id: "internacional",
          n: 5,
          categoryId: "politica-transformacion",
          color: "azul",
          eyebrow: "Una mirada que cruza contextos",
          variant: "mapa",
          title: "Argentina, México y Chile: una trayectoria regional.",
          body: "Su recorrido se construyó entre aulas, universidades, ministerios, organizaciones y equipos de distintos países. Esa experiencia regional permitió conectar investigación, práctica docente y transformación institucional.",
          tags: [
            "Argentina",
            "México",
            "Chile",
            "Estancias en Francia y Portugal",
            "Publicación internacional · UNESCO y educación inclusiva",
          ],
        },
        {
          id: "produccion",
          n: 6,
          categoryId: "investigacion-aplicada",
          color: "azul",
          eyebrow: "Investigación, libros y materiales",
          variant: "ramas",
          title: "Investigar para construir herramientas.",
          body: "Su producción articula investigación, formación docente y materiales destinados a transformar la enseñanza de la Matemática.",
          publications: [
            { year: "2013", kind: "Libro", title: "La transversalidad de la proporcionalidad", meta: "Secretaría de Educación Pública de México" },
            { year: "2016", kind: "Libro", title: "Empoderamiento docente y Socioepistemología", meta: "Editorial Gedisa", featured: true },
            { year: "2023", kind: "Artículo", title: "Aprendizaje de las matemáticas: ¿qué, para qué, para quién?", meta: "Con Karla Gómez-Osalde" },
            { year: "2024", kind: "Colección", title: "Matemática en Red", meta: "Coordinación de publicaciones · Ministerio de Educación de la Ciudad de Buenos Aires" },
            { year: "2025", kind: "Artículo", title: "Problematizar la matemática escolar: ¿cómo contribuye al desarrollo profesional docente?" },
            {
              year: "2019",
              kind: "Materiales",
              title: "Plan Nacional Aprender Matemática",
              meta: "Colección de materiales para el desarrollo del pensamiento matemático",
              concepts: ["Inferir", "Medir", "Aproximar", "Comparar", "Equivaler", "Predecir", "Visualizar"],
            },
          ],
        },
        {
          id: "convergencia",
          n: 7,
          categoryId: "empoderamiento-docente",
          color: "verde",
          eyebrow: "La convergencia",
          period: "2020 – actualidad",
          variant: "sintesis",
          title: "Una trayectoria que converge en ED.",
          body: "Empoderamiento Docente reúne los distintos planos de su recorrido: aula, investigación, formación docente, diseño curricular, materiales, políticas educativas y liderazgo institucional.",
          milestones: [
            { period: "2020 – actualidad", title: "Directora General de Empoderamiento Docente", primary: true },
            { period: "2020 – actualidad", title: "Fundadora de Casa Bosque – Escuela Montessori", detail: "Chile" },
            { period: "2021 – actualidad", title: "Asesora global en Matemáticas", detail: "Techint Group" },
            { period: "2022 – 2024", title: "Profesora del Diplomado en Matemática Educativa", detail: "UDLA Chile" },
            { period: "2023", title: "Profesora honoraria de Didáctica de la Matemática", detail: "UMCE" },
            { period: "2023 – actualidad", title: "Asesora ministerial en Matemáticas", detail: "Plan Estratégico Buenos Aires Aprende" },
          ],
        },
      ],
      closing: {
        title: "Del recorrido individual a una construcción colectiva.",
        body: "Desde la Dirección General, Daniela articula investigación, asesoría, formación docente, diseño de materiales y construcción de equipos para transformar contextos educativos concretos.",
        body2: "ED es el punto donde su trayectoria entre aula, saber, política educativa y transformación se convierte en acción colectiva.",
      },
    },
  },
  {
    key: "karla-gomez",
    nombre: "Karla Gómez",
    rol: "Directora Académica",
    pais: "México",
    tier: 2,
    imagePosition: "50% 16%",
    bio: "Especialista en desarrollo del pensamiento matemático y en el diseño de tareas. Licenciada en Enseñanza de las Matemáticas. Doctora en Ciencias con especialidad en Matemática Educativa.",
    // Las dos que ella misma eligió mostrar (ficha de julio 2026), en lugar de
    // las que estaban antes.
    pubs: [
      { titulo: "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente (2025)" },
      { titulo: "Aprendizaje de las matemáticas: ¿qué, para qué, para quién? (2022)" },
    ],
    profile: {
      fullName: "Karla Gómez Osalde",
      role: "Dirección Académica",
      location: "Chile",
      origin: "Mérida, Yucatán, México",
      figura: "marco",
      cutout: "/equipo/karla-gomez.jpg",
      cutoutPosition: "50% 16%",
      headline: "Una tarea bien diseñada cambia la conversación del aula.",
      intro:
        "Profesora de matemáticas y doctora en Matemática Educativa. Trabaja sobre el desarrollo del pensamiento geométrico y el diseño de tareas que hacen hablar a la matemática escolar. Desde la Dirección Académica de ED tiene a su cargo los materiales que median el aprendizaje.",
      formation: [
        "Licenciada en Enseñanza de las Matemáticas — UADY",
        "Maestra en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Doctora en Ciencias — Matemática Educativa, Cinvestav-IPN",
      ],
      categories: [
        { id: "pensamiento-geometrico", label: "Pensamiento geométrico", color: "verde" },
        { id: "diseno-tareas", label: "Diseño de tareas", color: "naranja" },
        { id: "desarrollo-profesional", label: "Desarrollo profesional docente", color: "verde" },
        { id: "investigacion", label: "Investigación en Matemática Educativa", color: "azul" },
      ],
      stages: [
        {
          id: "formacion",
          n: 1,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "De Yucatán al Cinvestav",
          period: "2007 – 2015",
          variant: "ficha",
          title: "Ocho años de formación seguidos.",
          body: "Se recibió de Licenciada en Enseñanza de las Matemáticas en la Universidad Autónoma de Yucatán y siguió, sin pausa, con la maestría y el doctorado en Matemática Educativa en el Cinvestav-IPN.",
          milestones: [
            { period: "2007", title: "Licenciatura en Enseñanza de las Matemáticas", detail: "Universidad Autónoma de Yucatán" },
            { period: "2009", title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
            { period: "2015", title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
          ],
        },
        {
          id: "uady",
          n: 2,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "Profesora de carrera",
          period: "2015 – 2021",
          variant: "hitos",
          title: "Seis años en la Facultad de Matemáticas.",
          body: "Fue Profesora de Carrera en Educación Superior en la UADY: docencia en didáctica de las matemáticas, dirección de tesis y trabajo dentro del cuerpo académico.",
          milestones: [
            {
              period: "2015 – 2021",
              title: "Profesora de Carrera en Educación Superior",
              detail: "Facultad de Matemáticas, Universidad Autónoma de Yucatán",
              primary: true,
            },
            { title: "Integrante del Cuerpo Académico Enseñanza de las Matemáticas" },
            { title: "Miembro del grupo formulador del plan de estudios de la maestría en Docencia Matemática" },
            { title: "Dirección de proyectos de tesis a nivel licenciatura" },
          ],
        },
        {
          id: "talleres",
          n: 3,
          categoryId: "desarrollo-profesional",
          color: "naranja",
          eyebrow: "Del aula universitaria a la escuela",
          period: "2018",
          variant: "editorial",
          title: "Talleres en los municipios de Yucatán.",
          body: "Coordinó el diseño y la implementación de los talleres de didáctica de las matemáticas para clubes de primaria alta y secundaria, en convenio con la Secretaría de Educación del estado, y acompañó a docentes en la puesta en marcha de los materiales.",
          milestones: [
            {
              period: "2018",
              title: "Coordinación de diseño e implementación de talleres didácticos en educación básica",
              detail: "Facultad de Matemáticas UADY, con la Secretaría de Educación de Yucatán",
            },
            { title: "Acompañamiento a docentes del estado en la implementación de materiales" },
            { title: "Capacitación y asesoría al equipo de instructores" },
          ],
        },
        {
          id: "geometria",
          n: 4,
          categoryId: "pensamiento-geometrico",
          color: "azul",
          eyebrow: "La línea de trabajo",
          variant: "ramas",
          title: "Reconceptualizar la geometría escolar.",
          body: "Su investigación estudia el desarrollo del pensamiento geométrico y el diseño de tareas que promuevan la comunicación de la matemática escolar: no la geometría como catálogo de figuras, sino como algo que se construye conversando.",
          publications: [
            {
              year: "2025",
              kind: "Artículo",
              title: "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente",
              meta: "Revista Latinoamericana de Investigación en Matemática Educativa",
              featured: true,
            },
            {
              // El año difiere del que figura en el perfil de Daniela (2023):
              // acá va el de la ficha y el CVU de Karla. Si se corrige, hay que
              // corregir los dos lados.
              year: "2022",
              kind: "Artículo",
              title: "Aprendizaje de las matemáticas: ¿qué, para qué, para quién?",
              meta: "Con Daniela Reyes-Gasperini · Propuesta Educativa",
            },
            {
              year: "2020",
              kind: "Artículo",
              title: "Reflexive Conversation: Approach to the Professional Learning of Pre-service Mathematics Teachers",
              meta: "Universal Journal of Educational Research",
            },
            {
              year: "2018",
              kind: "Libro",
              title: "Reconceptualización del saber matemático en educación básica",
              meta: "Universidad Autónoma de Yucatán",
            },
          ],
        },
        {
          id: "convergencia",
          n: 5,
          categoryId: "diseno-tareas",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Dirección Académica en ED.",
          body: "Desde Chile dirige el trabajo académico de Empoderamiento Docente: el diseño de ambientes de desarrollo profesional en Matemáticas y de los materiales que median el aprendizaje.",
          milestones: [
            { title: "Directora Académica — Empoderamiento Docente", primary: true },
            { title: "Diseño de materiales mediadores del aprendizaje" },
            { title: "Programas de desarrollo profesional en Latinoamérica" },
          ],
        },
      ],
      closing: {
        title: "Del pensamiento geométrico al material que llega al aula.",
        body: "Investigación sobre cómo se construye el pensamiento geométrico, seis años formando profesorado en la universidad y talleres en escuelas de todo un estado.",
        body2: "En ED, ese recorrido decide qué tarea se pone sobre la mesa.",
      },
    },
  },
  {
    // Fuentes: ficha «Raquel Ayala.docx» y CV, ambos enviados por ella para la
    // página (jul 2026). Cargo según la planilla EQUIPO Y ALIANZAS, donde
    // figura como «"Directora" a confirmar de Gestión Institucional»: acá va el
    // área, no el título, hasta que el cliente lo confirme.
    key: "raquel-ayala",
    nombre: "Raquel Ayala",
    rol: "Gestión institucional",
    pais: "Argentina",
    tier: 2,
    // Foto apaisada (1600×1068) con el rostro al centro: el recorte 4/5 de la
    // card se lleva la franja central y el eje vertical no interviene.
    imagePosition: "50% 50%",
    bio: "Licenciada en Psicología y perita grafóloga superior. Diplomada en Estudios de Género. Su recorrido cruza la administración de personal, la clínica en el sistema público de salud y la consultoría en recursos humanos.",
    profile: {
      fullName: "Raquel Ayala",
      role: "Gestión institucional",
      location: "Buenos Aires, Argentina",
      figura: "marco",
      cutout: "/equipo/raquel-ayala.jpg",
      headline: "De administrar personas a sostener una organización educativa.",
      intro:
        "Licenciada en Psicología, perita grafóloga superior y diplomada en Estudios de Género. Antes de ED trabajó más de una década en administración —forestal, de personal y logística—, se formó en clínica dentro del sistema público de salud y fue socia de una consultora de recursos humanos.",
      formation: [
        "Licenciada en Psicología — Universidad de Buenos Aires",
        "Perita Grafóloga Superior — ICEA Altos Estudios",
        "Diplomada en Estudios de Género — Universidad Tecnológica Nacional",
        "Concurrencia en Psicología Clínica — GCBA",
      ],
      categories: [
        { id: "gestion-institucional", label: "Gestión institucional", color: "azul" },
        { id: "equipos-y-personas", label: "Equipos y personas", color: "azul" },
        { id: "psicologia", label: "Psicología", color: "verde" },
        { id: "genero-y-cuidados", label: "Género y cuidados", color: "naranja" },
      ],
      stages: [
        {
          id: "administracion",
          n: 1,
          categoryId: "equipos-y-personas",
          color: "azul",
          eyebrow: "El punto de partida",
          period: "2003 – 2015",
          variant: "hitos",
          title: "Administrar es ordenar lo que sostiene a una organización.",
          body: "Su recorrido laboral empezó lejos del aula y cerca de lo que hace que una organización funcione: administración forestal primero, administración de personal y logística después.",
          milestones: [
            { period: "2003 – 2010", title: "Papel Prensa S.A.", detail: "Administración forestal", primary: true },
            { period: "2010 – 2012", title: "Oil Quality S.A.", detail: "Administración de personal" },
            { period: "2013 – 2015", title: "Establecimientos Caporaso", detail: "Administración de personal y logística" },
          ],
        },
        {
          id: "psicologia",
          n: 2,
          categoryId: "psicologia",
          color: "verde",
          eyebrow: "Una formación en paralelo",
          period: "2005 – 2013",
          variant: "ficha",
          title: "La psicología, cursada mientras trabajaba.",
          body: "En paralelo al trabajo administrativo se formó como perita grafóloga y se recibió de Licenciada en Psicología en la Universidad de Buenos Aires.",
          milestones: [
            { period: "2005 – 2007", title: "Perita Grafóloga Superior", detail: "ICEA Altos Estudios" },
            { period: "2006 – 2013", title: "Licenciatura en Psicología", detail: "Universidad de Buenos Aires" },
          ],
        },
        {
          id: "clinica",
          n: 3,
          categoryId: "psicologia",
          color: "verde",
          eyebrow: "El sistema público",
          period: "2015 – 2020",
          variant: "editorial",
          title: "Cinco años de clínica en hospitales de la Ciudad.",
          body: "Hizo la concurrencia en Psicología Clínica en el Hospital Pirovano y el CeSAC N° 2, dentro del sistema público de salud porteño. En esos años se formó en atención primaria, salud sexual y reproductiva y abordajes comunitarios.",
          milestones: [
            { period: "2015 – 2020", title: "Concurrencia en Psicología Clínica", detail: "Hospital Pirovano y CeSAC N° 2 — GCBA" },
            { period: "2016 – 2017", title: "Problemáticas actuales intra y extramuro en atención primaria", detail: "Participante y docente — Hospital Pirovano" },
            { period: "2017", title: "Jornadas «Devenir de la Atención Comunitaria»", detail: "Secretaría administrativa del comité — Hospital Pirovano" },
          ],
        },
        {
          id: "consultoria",
          n: 4,
          categoryId: "equipos-y-personas",
          color: "azul",
          eyebrow: "Del caso a la organización",
          period: "2016 – 2022",
          variant: "hitos",
          title: "Consultoría en recursos humanos, como socia.",
          body: "Durante seis años fue socia en NGA: la mirada psicológica puesta a trabajar sobre equipos y organizaciones enteras, no sobre casos individuales.",
          milestones: [
            {
              period: "2016 – 2022",
              title: "Socia en NGA",
              detail: "Consultoría y asesoramiento integral en Recursos Humanos",
              primary: true,
            },
          ],
        },
        {
          id: "genero",
          n: 5,
          categoryId: "genero-y-cuidados",
          color: "naranja",
          eyebrow: "Una perspectiva que ordena el resto",
          period: "2021 – 2023",
          variant: "concepto",
          title: "Género, diversidad y cuidados como criterio de gestión.",
          body: "Se formó en estudios de género y en gestión de igualdad, diversidad y cuidados. Es una perspectiva que atraviesa cómo se arman los equipos y cómo se sostienen los procesos, no un tema aparte.",
          milestones: [
            {
              period: "2021",
              title: "Formadora de evaluadores — Premio Nacional a la Calidad",
              detail: "Gestión de igualdad de género, diversidad y cuidados",
            },
            { period: "2022", title: "Diplomatura en Estudios de Género", detail: "Universidad Tecnológica Nacional" },
            {
              period: "2023",
              title: "ONU Mujeres",
              detail: "Igualdad de género en empresas públicas · corresponsabilidad y cuidados · masculinidades",
            },
          ],
        },
        {
          id: "guardia",
          n: 6,
          categoryId: "psicologia",
          color: "verde",
          eyebrow: "En ejercicio",
          period: "2023 – actualidad",
          variant: "editorial",
          title: "La clínica sigue abierta.",
          body: "Trabaja como psicóloga de guardia suplente en el Hospital General de Agudos Juan A. Fernández.",
          milestones: [
            {
              period: "2023 – actualidad",
              title: "Hospital Gral. de Agudos Juan A. Fernández",
              detail: "Psicóloga de guardia suplente",
            },
          ],
        },
        {
          id: "convergencia",
          n: 7,
          categoryId: "gestion-institucional",
          color: "azul",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Gestión institucional en ED.",
          body: "En Empoderamiento Docente está a cargo de la gestión institucional.",
          milestones: [
            { title: "Gestión institucional — Empoderamiento Docente", detail: "Argentina", primary: true },
          ],
        },
      ],
      closing: {
        title: "Un recorrido que llega a la gestión.",
        body: "Administración, psicología clínica, consultoría de recursos humanos y perspectiva de género convergen en el trabajo de sostener una organización que trabaja en cinco países.",
      },
    },
  },
  {
    key: "ivan-perez",
    nombre: "Iván Pérez",
    rol: "Líder de Modelación y Tecnologías",
    pais: "Chile",
    tier: 3,
    imagePosition: "50% 22%",
    bio: "Académico del Departamento de Matemática de la Universidad Metropolitana de Ciencias de la Educación (UMCE), responsable de proyectos de investigación y de vinculación con el medio escolar.",
  },
  {
    key: "judith-hernandez",
    nombre: "Judith Hernández",
    rol: "Líder de proyecto · Currículum",
    pais: "México",
    tier: 3,
    imagePosition: "50% 25%",
    imageZoom: 1.1,
    bio: "Especialista en análisis y diseño del currículum en Matemáticas y desarrollo profesional docente. Doctora en Ciencias con especialidad en Matemática Educativa.",
    pubs: [
      { titulo: "Hernández, Páez y Aké (2026)" },
      { titulo: "Rodríguez, Briceño y Hernández (2026)" },
      { titulo: "Valero y Hernández (2024)" },
      { titulo: "Hernández, Padilla y Briceño (2023)" },
    ],
    profile: {
      fullName: "Judith Alejandra Hernández Sánchez",
      role: "Líder de proyecto · Currículum",
      location: "Zacatecas, México",
      figura: "marco",
      cutout: "/equipo/judith-hernandez.jpg",
      cutoutPosition: "50% 25%",
      headline: "El currículum de matemáticas, mirado como objeto de estudio.",
      intro:
        "Doctora en Matemática Educativa y docente investigadora de tiempo completo en la Universidad Autónoma de Zacatecas. Investiga las dimensiones del currículum en matemáticas, la enseñanza del cálculo y el álgebra, y la formación de quienes se dedican a la matemática educativa.",
      formation: [
        "Maestría en Matemática Aplicada — Universidad Autónoma de Zacatecas",
        "Doctorado en Ciencias con especialidad en Matemática Educativa — Universidad Autónoma de Guerrero",
      ],
      categories: [
        { id: "curriculum", label: "Currículum en matemáticas", color: "naranja" },
        { id: "desarrollo-profesional", label: "Formación de profesionales", color: "verde" },
        { id: "investigacion", label: "Investigación en Matemática Educativa", color: "azul" },
      ],
      stages: [
        {
          id: "formacion",
          n: 1,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "La formación",
          variant: "ficha",
          title: "De la matemática aplicada a la matemática educativa.",
          body: "Se formó como maestra en Matemática Aplicada en la propia Universidad Autónoma de Zacatecas y se doctoró en Ciencias con especialidad en Matemática Educativa en la Universidad Autónoma de Guerrero.",
          milestones: [
            { title: "Maestría en Matemática Aplicada", detail: "Universidad Autónoma de Zacatecas" },
            {
              title: "Doctorado en Ciencias — Matemática Educativa",
              detail: "Universidad Autónoma de Guerrero",
            },
          ],
        },
        {
          id: "uaz",
          n: 2,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "Una sola casa",
          period: "1993 – actualidad",
          variant: "hitos",
          title: "Más de treinta años en la Universidad Autónoma de Zacatecas.",
          body: "Es docente investigadora de tiempo completo, titular C, en la Unidad Académica de Matemáticas. Ahí sostiene la docencia, la investigación y el trabajo del cuerpo académico.",
          milestones: [
            {
              period: "1993 – actualidad",
              title: "Docente investigadora de tiempo completo, titular C",
              detail: "Unidad Académica de Matemáticas, Universidad Autónoma de Zacatecas",
              primary: true,
            },
            {
              title: "Cuerpo Académico Consolidado «Matemática Educativa en la Profesionalización Docente»",
            },
            { period: "2015", title: "Reconocimiento a perfil deseable", detail: "PRODEP" },
            { period: "2018", title: "Sistema Nacional de Investigadores" },
          ],
        },
        {
          id: "curriculum",
          n: 3,
          categoryId: "curriculum",
          color: "naranja",
          eyebrow: "Las líneas de investigación",
          variant: "editorial",
          title: "Qué se enseña, cómo se aprende y quién lo enseña.",
          body: "Sus tres líneas de trabajo se sostienen desde hace años y se cruzan entre sí: el currículum, el cálculo y el álgebra, y la formación de quienes trabajan en el campo.",
          milestones: [
            { title: "El análisis de las dimensiones del currículum en matemáticas" },
            { title: "La enseñanza y el aprendizaje del cálculo y el álgebra" },
            { title: "La formación y el desarrollo de los profesionales de la matemática educativa" },
          ],
        },
        {
          id: "produccion",
          n: 4,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "Producción reciente",
          period: "2023 – 2024",
          variant: "ramas",
          title: "Los libros de texto y la planeación de clase.",
          body: "Dos investigaciones recientes, escritas con colegas de la propia unidad académica, miran de cerca dos objetos cotidianos de la enseñanza: la tarea del libro de texto y la planeación con la que un profesor entra al aula.",
          publications: [
            {
              year: "2024",
              kind: "Artículo",
              title: "¿Qué significados de la derivada favorece un profesor en su planeación de clase?",
              meta: "Con Eduardo Briceño · Revista de Investigación Educativa de la REDIECH",
              featured: true,
            },
            {
              year: "2023",
              kind: "Artículo",
              title: "Dimensiones tecnológicas en tareas de libros de texto de matemáticas",
              meta: "Con C. Padilla y Eduardo Briceño · Revista Electrónica de Investigación Educativa",
            },
          ],
        },
        {
          id: "convergencia",
          n: 5,
          categoryId: "curriculum",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Currículum en ED.",
          body: "En Empoderamiento Docente lidera proyectos desde el análisis y el diseño del currículum en matemáticas.",
          milestones: [
            { title: "Líder de proyecto · Currículum — Empoderamiento Docente", detail: "México", primary: true },
            { title: "Red Cimates · CLAME · SOMIDEM" },
          ],
        },
      ],
      closing: {
        title: "Treinta años mirando la misma pregunta desde adentro.",
        body: "Docencia e investigación en una sola universidad, con el currículum de matemáticas como objeto de estudio permanente.",
      },
    },
  },
  {
    key: "gabriela-buendia",
    nombre: "Gabriela Buendía",
    rol: "Líder de proyecto · Facilitadora",
    pais: "México",
    tier: 3,
    imagePosition: "50% 22%",
    imageZoom: 1.1,
    bio: "Doctora en Ciencias con especialidad en Matemática Educativa. Especialista en desarrollo del pensamiento matemático. Facilitadora y diseñadora de material didáctico.",
  },
  {
    key: "marcela-cano",
    nombre: "Marcela Cano",
    rol: "Líder de proyecto · Evaluación",
    pais: "México",
    tier: 3,
    imagePosition: "50% 20%",
    bio: "Especialista en evaluación educativa a gran escala: diseño, implementación y coordinación de evaluaciones en todos los niveles. Ex directora del programa de evaluación del desempeño docente y del área EGEL. Estudios en Psicología por la UNAM.",
  },
  {
    // Fuentes: ficha «Lopez Luis.docx» (rol, redes, publicaciones elegidas por
    // él) y su CV completo, ambos de julio 2026.
    key: "luis-lopez",
    nombre: "Luis López",
    rol: "Líder de Pensamiento Aritmético y Algebraico",
    pais: "Costa Rica",
    tier: 3,
    // Retrato vertical 814×1080, rostro alto en el cuadro.
    imagePosition: "50% 16%",
    bio: "Licenciado en Enseñanza de las Matemáticas. Doctor en Ciencias con especialidad en Matemática Educativa. Académico del Departamento de Educación Secundaria de la Escuela de Formación Docente de la Universidad de Costa Rica.",
    linkedin: "https://www.linkedin.com/in/luis-alberto-l%C3%B3pez-acosta-ba02a71bb/",
    profile: {
      fullName: "Luis Alberto López Acosta",
      role: "Líder de Pensamiento Aritmético y Algebraico",
      location: "San José, Costa Rica",
      origin: "Mérida, Yucatán, México",
      figura: "marco",
      cutout: "/equipo/luis-lopez.jpg",
      headline: "Del álgebra que se enseña, al álgebra que se construye.",
      intro:
        "Profesor de matemáticas e investigador en Matemática Educativa. Estudia cómo se construye socialmente el lenguaje algebraico y lleva esa investigación al aula, a la formación docente y a los libros de texto con los que se estudia.",
      formation: [
        "Licenciado en Enseñanza de las Matemáticas — UADY",
        "Maestro en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Doctor en Ciencias — Matemática Educativa, Cinvestav-IPN",
      ],
      categories: [
        { id: "pensamiento-algebraico", label: "Pensamiento aritmético y algebraico", color: "verde" },
        { id: "investigacion", label: "Investigación en Matemática Educativa", color: "azul" },
        { id: "desarrollo-profesional", label: "Desarrollo profesional docente", color: "verde" },
        { id: "curriculo-materiales", label: "Currículo y materiales", color: "naranja" },
      ],
      stages: [
        {
          id: "aula",
          n: 1,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "El aula como origen",
          period: "2011 – 2014",
          variant: "editorial",
          title: "Primero, enseñar matemáticas en secundaria.",
          body: "Se recibió de Licenciado en Enseñanza de las Matemáticas en la Universidad Autónoma de Yucatán y dio clases en secundaria y bachillerato. En paralelo ya diseñaba currículo para su propia facultad.",
          milestones: [
            { period: "2011", title: "Licenciatura en Enseñanza de las Matemáticas", detail: "Universidad Autónoma de Yucatán" },
            { period: "2012 – 2014", title: "Profesor de matemáticas de secundaria y bachillerato", detail: "Club Preparatoriano, Yucatán" },
            {
              period: "2011 – 2014",
              title: "Asesoría pedagógica y diseño curricular",
              detail: "Facultad de Matemáticas UADY, en convenio con la Secretaría de Educación de Yucatán",
            },
          ],
        },
        {
          id: "formacion",
          n: 2,
          categoryId: "desarrollo-profesional",
          color: "naranja",
          eyebrow: "Formar a quienes enseñan",
          period: "2015 – 2018",
          variant: "hitos",
          title: "El programa que formó a miles de docentes en México.",
          body: "En el Programa Interdisciplinario para el Desarrollo Profesional Docente en Matemáticas (SEP-Cinvestav) diseñó e impartió cursos de formación. Entre ellos, «Empoderamiento docente»: la misma línea de trabajo que después le daría nombre a ED.",
          milestones: [
            {
              period: "2016",
              title: "Curso «Empoderamiento docente: proceso de desarrollo profesional»",
              detail: "Coordinación académica, diseño e instrucción — SEP-Cinvestav",
              primary: true,
            },
            {
              period: "2016",
              title: "Curso «Problematización de la Matemática Escolar»",
              detail: "Diseño e instrucción — SEP-Cinvestav",
            },
            {
              period: "2015 – 2016",
              title: "Talleres de desarrollo profesional docente en Matemáticas",
              detail: "Tres generaciones, educación media superior — SEP-Cinvestav",
            },
            {
              period: "2016 – 2017",
              title: "Programa PODER",
              detail: "Diseño e instrucción — atención a la deserción escolar en media superior",
            },
            {
              period: "2017 – 2018",
              title: "Diplomado Sentido Numérico y Pensamiento Algebraico",
              detail: "Instructor — IPN-SEP",
            },
          ],
        },
        {
          id: "posgrado",
          n: 3,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "Investigar el lenguaje del álgebra",
          period: "2014 – 2023",
          variant: "ficha",
          title: "Maestría y doctorado en Matemática Educativa.",
          body: "Cursó ambos posgrados en el Cinvestav-IPN con beca del Conacyt. Su investigación cruza la socioepistemología con la lingüística sistémico-funcional para estudiar cómo se construyó el lenguaje algebraico —de Viète y Descartes en adelante— y qué implica eso para enseñarlo.",
          milestones: [
            { period: "2016", title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
            { period: "2023", title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
          ],
          branches: [
            {
              period: "2018 – 2019",
              place: "UNAM",
              detail: "Formación en Lingüística Sistémico-Funcional, Maestría en Lingüística Aplicada",
            },
          ],
        },
        {
          id: "materiales",
          n: 4,
          categoryId: "curriculo-materiales",
          color: "naranja",
          eyebrow: "Escribir para el aula",
          period: "2015 – actualidad",
          variant: "ramas",
          title: "Los libros con los que se estudia.",
          body: "Es coautor de los libros de Matemáticas de primero a cuarto grado de primaria de la Secretaría de Educación de Yucatán, escribió un capítulo de la colección Matemática en Red que coordinó Daniela Reyes para el Ministerio de Educación porteño, y desde 2023 asesora los contenidos de los libros de texto de ese mismo ministerio.",
          publications: [
            {
              year: "2024",
              kind: "Libro",
              title: "Producción de fórmulas",
              meta: "Capítulo — Colección Matemática en Red, Tomo I · Ministerio de Educación de la Ciudad de Buenos Aires",
              featured: true,
            },
            {
              year: "2015 – 2017",
              kind: "Materiales",
              title: "Matemáticas, 1.º a 4.º grado de primaria",
              meta: "Coautoría — Secretaría de Educación del Gobierno del Estado de Yucatán",
            },
            {
              year: "2026",
              kind: "Artículo",
              title: "Estudios histórico-epistemológicos en matemática educativa: tendencias metodológicas en Latinoamérica",
              meta: "Con F. Romero · Cuadernos de Investigación y Formación en Educación Matemática",
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "La Geometría Analítica y su Transposición Didáctica Externa",
              meta: "Revista Venezolana de Investigación en Educación Matemática",
            },
            {
              year: "2024",
              kind: "Artículo",
              title: "Lingüística Sistémico-Funcional en el estudio del Lenguaje Matemático",
              meta: "Cuadernos de Investigación y Formación en Educación Matemática",
            },
            {
              year: "2022",
              kind: "Artículo",
              title: "Emergencia de las ecuaciones paramétricas en Viète y Descartes",
              meta: "Con G. Montiel · Góndola, Enseñanza y Aprendizaje de las Ciencias",
            },
          ],
        },
        {
          id: "costa-rica",
          n: 5,
          categoryId: "desarrollo-profesional",
          color: "azul",
          eyebrow: "Formación docente en Costa Rica",
          period: "2021 – actualidad",
          variant: "hitos",
          title: "De Yucatán a la Universidad de Costa Rica.",
          body: "Es profesor de la Escuela de Formación Docente de la Universidad de Costa Rica, donde dirige trabajos finales de graduación y coordina las actividades académicas de enseñanza de la matemática.",
          milestones: [
            {
              period: "2024 – actualidad",
              title: "Profesor de tiempo completo — Escuela de Formación Docente",
              detail: "Universidad de Costa Rica",
              primary: true,
            },
            { period: "2023 – 2024", title: "Profesor visitante", detail: "Universidad de Costa Rica" },
            { period: "2021 – 2022", title: "Profesor de carrera de enseñanza superior", detail: "Universidad Autónoma de Yucatán" },
            {
              period: "2024",
              title: "Coordinación de la I Escuela de Verano de Enseñanza de la Matemática",
              detail: "Universidad de Costa Rica",
            },
            {
              period: "2023",
              title: "Coordinación del IV Día de la Enseñanza de la Matemática",
              detail: "Universidad de Costa Rica",
            },
          ],
        },
        {
          id: "convergencia",
          n: 6,
          categoryId: "pensamiento-algebraico",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Pensamiento aritmético y algebraico en ED.",
          body: "En Empoderamiento Docente lidera la línea de pensamiento aritmético y algebraico: el punto donde su investigación sobre el lenguaje del álgebra se encuentra con el trabajo con docentes.",
          milestones: [
            {
              title: "Líder de Pensamiento Aritmético y Algebraico — Empoderamiento Docente",
              primary: true,
            },
            {
              period: "desde 2017",
              title: "Miembro asociado del Comité Latinoamericano de Matemática Educativa",
            },
            {
              period: "desde 2019",
              title: "Miembro de ALSFAL",
              detail: "Asociación de Lingüística Sistémico-Funcional de América Latina",
            },
          ],
        },
      ],
      closing: {
        title: "Investigar el lenguaje para enseñar mejor.",
        body: "Su recorrido conecta el aula de secundaria, la formación de docentes en México, la investigación sobre pensamiento y lenguaje algebraico y la escritura de materiales para primaria y secundaria.",
        body2: "En ED esa trayectoria se pone al servicio de una pregunta concreta: cómo se construye el pensamiento aritmético y algebraico en la escuela.",
      },
    },
  },
  {
    // Fuentes: ficha «Vergara Andrea.docx» (jul 2026) y su ORCID
    // 0000-0001-6388-8412, que ella misma indicó como referencia porque no
    // maneja redes. En esa misma ficha pidió no publicar foto.
    key: "andrea-vergara",
    nombre: "Andrea Vergara",
    rol: "Líder de Pensamiento Estadístico",
    pais: "Chile",
    tier: 3,
    sinFoto: true,
    // Sin foto: el valor no se usa, se conserva por contrato del tipo.
    imagePosition: "50% 50%",
    bio: "Profesora de Matemática. Magíster y Doctora en Didáctica de la Matemática. Académica e investigadora del CIEMAE, Centro de Investigación en Educación Matemática y Estadística de la Universidad Católica del Maule.",
    profile: {
      fullName: "Andrea Vergara-Gómez",
      role: "Líder de Pensamiento Estadístico",
      location: "Talca, Chile",
      figura: "sin",
      headline: "Decidir con incertidumbre también se aprende.",
      intro:
        "Profesora de Matemática, magíster y doctora en Didáctica de la Matemática. Investiga la toma de decisiones en contextos de riesgo e incertidumbre como un saber matemático escolar, y forma profesorado en la Universidad Católica del Maule.",
      formation: [
        "Profesora de Matemáticas y Licenciada en Educación — PUCV",
        "Magíster en Didáctica de la Matemática — PUCV",
        "Doctora en Didáctica de la Matemática — PUCV",
      ],
      categories: [
        { id: "pensamiento-estadistico", label: "Pensamiento estadístico y probabilístico", color: "verde" },
        { id: "formacion-docente", label: "Formación del profesorado", color: "azul" },
        { id: "investigacion", label: "Investigación en educación matemática", color: "azul" },
      ],
      stages: [
        {
          id: "valparaiso",
          n: 1,
          categoryId: "formacion-docente",
          color: "verde",
          eyebrow: "Valparaíso",
          period: "2003 – 2007",
          variant: "ficha",
          title: "Profesora de Matemáticas, primero.",
          body: "Se formó en el Instituto de Matemáticas de la Pontificia Universidad Católica de Valparaíso, la casa donde después investigaría y enseñaría durante más de una década.",
          milestones: [
            {
              period: "2003 – 2007",
              title: "Profesora de Matemáticas y Licenciada en Educación",
              detail: "Pontificia Universidad Católica de Valparaíso",
            },
          ],
        },
        {
          id: "docencia",
          n: 2,
          categoryId: "formacion-docente",
          color: "azul",
          eyebrow: "Enseñar a enseñar",
          period: "2012 – 2021",
          variant: "hitos",
          title: "Casi diez años formando profesorado.",
          body: "Fue docente del Instituto de Matemáticas de la PUCV y, más tarde, de la Facultad de Pedagogía de la Universidad Academia de Humanismo Cristiano, en Santiago.",
          milestones: [
            {
              period: "2012 – 2020",
              title: "Docente — Instituto de Matemáticas, Facultad de Ciencias",
              detail: "Pontificia Universidad Católica de Valparaíso",
              primary: true,
            },
            {
              period: "2019 – 2021",
              title: "Docente — Facultad de Pedagogía",
              detail: "Universidad Academia de Humanismo Cristiano, Santiago",
            },
          ],
        },
        {
          id: "posgrado",
          n: 3,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "La didáctica como campo",
          period: "2013 – 2020",
          variant: "ficha",
          title: "Magíster y doctora en Didáctica de la Matemática.",
          body: "Cursó los dos posgrados en el Instituto de Matemáticas de la PUCV mientras seguía dando clases.",
          milestones: [
            { period: "2013 – 2015", title: "Magíster en Didáctica de la Matemática", detail: "PUCV" },
            { period: "2016 – 2020", title: "Doctora en Didáctica de la Matemática", detail: "PUCV" },
          ],
        },
        {
          id: "ucm",
          n: 4,
          categoryId: "formacion-docente",
          color: "verde",
          eyebrow: "Investigación con nombre propio",
          period: "2021 – actualidad",
          variant: "editorial",
          title: "Universidad Católica del Maule.",
          body: "Es Profesora Auxiliar de la Facultad de Ciencias Básicas e investigadora del CIEMAE, el Centro de Investigación en Educación Matemática y Estadística.",
          milestones: [
            {
              period: "2021 – actualidad",
              title: "Profesora Auxiliar — Departamento de Matemática, Física y Estadística",
              detail: "Facultad de Ciencias Básicas, Universidad Católica del Maule",
              primary: true,
            },
            { title: "Académica e investigadora", detail: "CIEMAE — Centro de Investigación en Educación Matemática y Estadística" },
          ],
        },
        {
          id: "incertidumbre",
          n: 5,
          categoryId: "pensamiento-estadistico",
          color: "azul",
          eyebrow: "La línea de trabajo",
          variant: "ramas",
          title: "Decidir en contextos de riesgo e incertidumbre.",
          body: "Su investigación toma la decisión bajo incertidumbre como un saber matemático escolar: qué se pone en juego al decidir, cómo se evalúa y con qué situaciones —un dilema clásico, un juego de mesa— se puede enseñar.",
          publications: [
            {
              year: "2024",
              kind: "Artículo",
              title: "Decision-Making in Situations of Uncertainty as School Mathematical Knowledge",
              meta: "Acta Scientiae",
              featured: true,
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "Decision-making in contexts of risk and uncertainty: An instrument for secondary education",
              meta: "Eurasia Journal of Mathematics, Science and Technology Education",
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "Pensamiento probabilístico o intuición en el dilema de Monty Hall",
              meta: "Horizontes. Revista de Investigación en Ciencias de la Educación",
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "¿Juguemos CATAN? Explorando el desarrollo de los pensamientos probabilístico y estratégico en estudiantes universitarios",
              meta: "Revista de Estudios y Experiencias en Educación",
            },
          ],
        },
        {
          id: "convergencia",
          n: 6,
          categoryId: "pensamiento-estadistico",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Pensamiento estadístico en ED.",
          body: "En Empoderamiento Docente lidera la línea de pensamiento estadístico: lo que la investigación sabe sobre azar, riesgo y decisión, puesto a trabajar con docentes.",
          milestones: [
            { title: "Líder de Pensamiento Estadístico — Empoderamiento Docente", detail: "Chile", primary: true },
          ],
        },
      ],
      closing: {
        title: "De la formación inicial a la investigación aplicada.",
        body: "Veinte años en la misma pregunta, vista desde el aula universitaria, el posgrado y la investigación: cómo se enseña a razonar cuando no hay certeza.",
      },
    },
  },
  {
    key: "wendolyne-rios",
    nombre: "Wendolyne Ríos",
    rol: "Facilitadora y diseñadora de material didáctico",
    pais: "México",
    tier: 4,
    imagePosition: "50% 20%",
    bio: "Licenciada en Física y Matemáticas. Maestra en Ciencias con especialidad en Matemática Educativa. Especialista en pensamiento y lenguaje variacional.",
    linkedin: "https://www.linkedin.com/in/wendolyne-r%C3%ADos-jarqu%C3%ADn-542044212/",
    profile: {
      fullName: "Diana Wendolyne Ríos Jarquín",
      role: "Facilitadora y diseñadora de material didáctico",
      location: "Ciudad de México, México",
      origin: "Nezahualcóyotl, Estado de México",
      figura: "marco",
      cutout: "/equipo/wendolyne-rios.jpg",
      cutoutPosition: "50% 20%",
      headline: "Formar a quienes forman, desde el saber matemático transversal.",
      intro:
        "Licenciada en Física y Matemáticas y maestra en Matemática Educativa. Investiga la formación de formadores y la transversalidad del saber matemático, edita la principal revista de investigación del campo en la región y diseña los materiales que llegan al aula.",
      formation: [
        "Licenciada en Física y Matemáticas — ESFM del IPN",
        "Maestra en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Doctorado en Ciencias — Matemática Educativa, Cinvestav-IPN (en curso)",
        "Diplomado en Edición de Revistas Académicas — IISUE, UNAM",
      ],
      categories: [
        { id: "transversalidad", label: "Transversalidad del saber matemático", color: "verde" },
        { id: "formacion-formadores", label: "Formación de formadores", color: "verde" },
        { id: "edicion", label: "Edición científica", color: "azul" },
        { id: "materiales", label: "Materiales para el aula", color: "naranja" },
      ],
      stages: [
        {
          id: "formacion",
          n: 1,
          categoryId: "transversalidad",
          color: "azul",
          eyebrow: "De la física a la matemática educativa",
          period: "2013 – actualidad",
          variant: "ficha",
          title: "Una pregunta que se fue haciendo más grande.",
          body: "Estudió Física y Matemáticas en la ESFM del IPN y siguió con la maestría en el Cinvestav. Su tesis de licenciatura miró las dificultades comunes con la noción de función; la de maestría, la transversalidad de tres teoremas fundamentales.",
          milestones: [
            { period: "2013 – 2017", title: "Licenciatura en Física y Matemáticas", detail: "ESFM del Instituto Politécnico Nacional" },
            { period: "2017 – 2020", title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
            { period: "2020 – actualidad", title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN, en curso" },
          ],
        },
        {
          id: "relime",
          n: 2,
          categoryId: "edicion",
          color: "azul",
          eyebrow: "La revista del campo",
          period: "2016 – actualidad",
          variant: "hitos",
          title: "Casi diez años haciendo RELIME.",
          body: "Entró a la Coordinación Técnica de la Revista Latinoamericana de Investigación en Matemática Educativa y desde 2019 es editora. En el camino se formó en edición de revistas académicas en la UNAM.",
          milestones: [
            {
              period: "2019 – actualidad",
              title: "Editora — Revista Latinoamericana de Investigación en Matemática Educativa",
              detail: "Comité Latinoamericano de Matemática Educativa",
              primary: true,
            },
            { period: "2016 – 2019", title: "Coordinación Técnica de RELIME" },
            { period: "2018 – 2019", title: "Diplomado en Edición de Revistas Académicas", detail: "IISUE, UNAM" },
            {
              period: "2025 – actualidad",
              title: "Coordinación de Comunicación y Redes",
              detail: "Red de Centros de Investigación en Matemática Educativa",
            },
            { period: "2015 – 2017", title: "Becaria ayudante de investigador", detail: "Cinvestav-IPN" },
          ],
        },
        {
          id: "materiales",
          n: 3,
          categoryId: "materiales",
          color: "naranja",
          eyebrow: "Escribir para el aula",
          period: "2017 – 2019",
          variant: "ramas",
          title: "Los cuadernos del Plan Nacional Aprender Matemática.",
          body: "Fue asesora, facilitadora y diseñadora en el Programa Interdisciplinario para el Desarrollo Profesional Docente en Matemáticas y después tutora y diseñadora de materiales del Plan Nacional Aprender Matemática, en Argentina.",
          publications: [
            {
              year: "2019",
              kind: "Materiales",
              title: "Plan Nacional Aprender Matemática",
              meta: "Coautoría de la colección · Ministerio de Educación, Cultura, Ciencia y Tecnología de Argentina",
              concepts: ["Aproximar y optimizar", "Medir", "Comparar y equivaler", "Inferir"],
              featured: true,
            },
            {
              year: "2020",
              kind: "Artículo",
              title: "Matemática Educativa, transversalidad y COVID-19",
              meta: "Con R. Cantoral y otros · Revista Latinoamericana de Investigación en Matemática Educativa",
            },
          ],
        },
        {
          id: "docencia",
          n: 4,
          categoryId: "formacion-formadores",
          color: "verde",
          eyebrow: "Enseñar a enseñar",
          period: "2020 – actualidad",
          variant: "hitos",
          title: "Especialidad, diplomado y seis tesis dirigidas.",
          body: "Da clases en la Especialidad en Matemática Educativa de la Benemérita Escuela Normal Veracruzana y en el Diplomado en Matemática Educativa de la UDLA en Chile, y dirige los trabajos de graduación de docentes en ejercicio.",
          milestones: [
            {
              period: "2020 – actualidad",
              title: "Tutora y profesora — Especialidad en Matemática Educativa",
              detail: "Benemérita Escuela Normal Veracruzana",
              primary: true,
            },
            {
              period: "2022 – 2024",
              title: "Desarrollo del Pensamiento y Lenguaje Variacional",
              detail: "Diplomado en Matemática Educativa — Universidad De Las Américas, Chile",
            },
            { period: "2022 – 2025", title: "Dirección de seis tesis de especialidad", detail: "Veracruz, México" },
          ],
        },
        {
          id: "doctorado",
          n: 5,
          categoryId: "formacion-formadores",
          color: "verde",
          eyebrow: "La investigación en curso",
          variant: "concepto",
          title: "Qué le pasa a quien forma a otros.",
          body: "Su proyecto doctoral estudia el proceso de empoderamiento en la formación de formadores: no el de quien aprende matemática por primera vez, sino el de quien tiene que enseñar a enseñarla.",
          quote:
            "Formación de formadores: un estudio del proceso de empoderamiento desde el saber matemático transversal.",
          milestones: [
            { period: "2017", title: "Tesis de licenciatura — la noción de función en estudiantes de Física y Matemáticas" },
            { period: "2020", title: "Tesis de maestría — Socioepistemología y transversalidad" },
            { period: "en desarrollo", title: "Proyecto doctoral — formación de formadores y empoderamiento" },
          ],
        },
        {
          id: "convergencia",
          n: 6,
          categoryId: "materiales",
          color: "verde",
          eyebrow: "La convergencia",
          period: "2021 – actualidad",
          variant: "sintesis",
          title: "Fortalecimiento en Matemáticas, en ED.",
          body: "Desde 2021 es profesora y diseñadora del Proyecto de Fortalecimiento en Matemáticas de Empoderamiento Docente.",
          milestones: [
            {
              period: "2021 – actualidad",
              title: "Profesora y diseñadora — Proyecto de Fortalecimiento en Matemáticas, Empoderamiento Docente",
              primary: true,
            },
            { title: "Facilitadora y diseñadora de material didáctico" },
          ],
        },
      ],
      closing: {
        title: "Editar, diseñar y enseñar la misma matemática.",
        body: "La revista donde se publica la investigación del campo, los materiales que llegan al aula y las clases con docentes en ejercicio son tres caras del mismo trabajo.",
      },
    },
  },
  {
    key: "pedro-vidal-szabo",
    nombre: "Pedro Vidal-Szabo",
    rol: "Facilitador · Pensamiento estocástico",
    pais: "Chile",
    tier: 4,
    imagePosition: "50% 12%",
    imageZoom: 1.22,
    bio: "Especialista en pensamiento estocástico. Investigador y académico. Magíster y Doctor en Didáctica de la Matemática. Profesor de Matemática, mención Estadística Educacional.",
  },
  {
    key: "paola-balda",
    nombre: "Paola Balda",
    rol: "Facilitadora · Pensamiento proporcional",
    pais: "Colombia",
    tier: 4,
    imagePosition: "50% 28%",
    bio: "Especialista en pensamiento proporcional y formación docente. Licenciada en Matemáticas. Doctora en Educación. Magíster en Docencia de las Matemáticas y especialista en Gerencia Educativa.",
    linkedin: "https://www.linkedin.com/in/paola-alejandra-balda-alvarez-37037747/",
    profile: {
      fullName: "Paola Alejandra Balda Álvarez",
      role: "Facilitadora · Pensamiento proporcional",
      location: "Soacha, Cundinamarca, Colombia",
      figura: "marco",
      cutout: "/equipo/paola-balda.jpg",
      cutoutPosition: "50% 28%",
      headline: "Veinte años en la misma escuela, investigando desde adentro.",
      intro:
        "Licenciada en Matemáticas y doctora en Educación, con tesis laureada sobre los usos de lo proporcional. Da clases en una escuela pública de Soacha desde hace dos décadas y desde ahí investiga, forma profesorado y organiza festivales matemáticos.",
      formation: [
        "Licenciada en Matemáticas — Universidad Distrital Francisco José de Caldas",
        "Magíster en Docencia de las Matemáticas — Universidad Pedagógica Nacional",
        "Doctora en Educación — Universidad Santo Tomás",
        "Especialista en Gerencia Educativa — Universidad San Buenaventura",
      ],
      categories: [
        { id: "pensamiento-proporcional", label: "Pensamiento proporcional", color: "verde" },
        { id: "aula", label: "El aula como escenario", color: "verde" },
        { id: "formacion-docente", label: "Formación docente", color: "azul" },
        { id: "justicia-social", label: "Matemáticas y justicia social", color: "naranja" },
      ],
      stages: [
        {
          id: "aula",
          n: 1,
          categoryId: "aula",
          color: "verde",
          eyebrow: "El punto fijo",
          period: "2005 – actualidad",
          variant: "hitos",
          title: "Dos décadas en la Institución Educativa General Santander.",
          body: "Todo su recorrido tiene el mismo punto fijo: el aula de una escuela pública de Soacha. Ahí nacieron sus proyectos, ahí se probaron y desde ahí se investigaron.",
          milestones: [
            {
              period: "2005 – actualidad",
              title: "Profesora de matemáticas — I.E. General Santander, Soacha",
              detail: "Docente de planta, Secretaría de Educación de Soacha",
              primary: true,
            },
            { period: "2006 – 2011", title: "Club de Matemáticas", detail: "Experiencia significativa, segundo lugar en el Foro Municipal de Educación" },
            { period: "2018 – 2024", title: "«Las mates con humor entran»", detail: "Experiencia significativa · primer lugar en la 31.ª RELME" },
          ],
        },
        {
          id: "formacion",
          n: 2,
          categoryId: "formacion-docente",
          color: "azul",
          eyebrow: "Formación",
          period: "2004 – 2026",
          variant: "ficha",
          title: "Licenciatura, maestría, doctorado y dos posdoctorados.",
          body: "Se formó sin dejar la escuela: la licenciatura en la Universidad Distrital, la maestría en la Pedagógica Nacional, el doctorado en la Santo Tomás y una especialización en gerencia educativa.",
          milestones: [
            { period: "2004", title: "Licenciatura en Matemáticas", detail: "Universidad Distrital Francisco José de Caldas" },
            { period: "2010", title: "Magíster en Docencia de las Matemáticas", detail: "Universidad Pedagógica Nacional" },
            { period: "2019", title: "Doctora en Educación", detail: "Universidad Santo Tomás — tesis laureada" },
            { period: "2022", title: "Especialista en Gerencia Educativa", detail: "Universidad San Buenaventura" },
          ],
          branches: [
            { period: "2016", place: "Universidad de Guadalajara", detail: "Estancia doctoral — México" },
            { period: "2017", place: "Universidad Autónoma de Chiapas", detail: "Estancia doctoral con Gabriela Buendía" },
            { period: "2019", place: "Universidad Autónoma de Chiapas", detail: "Estancia posdoctoral en Didáctica de las Matemáticas" },
            { period: "2026", place: "Universidad Distrital", detail: "Estancia posdoctoral — mirar profesionalmente" },
          ],
        },
        {
          id: "proporcionalidad",
          n: 3,
          categoryId: "pensamiento-proporcional",
          color: "azul",
          eyebrow: "La tesis laureada",
          period: "2019",
          variant: "concepto",
          title: "Lo proporcional, estudiado en una huerta escolar.",
          body: "Su doctorado estudió los usos y resignificados de la proporcionalidad en un contexto que existía de verdad: la huerta de la escuela. La tesis recibió el reconocimiento de laureada por sus aportes a la teoría socioepistemológica.",
          quote:
            "Usos y resignificados de la proporcionalidad en el contexto de la huerta escolar. Un estudio socioepistemológico.",
          milestones: [
            { period: "2010", title: "Tesis de maestría — la modelación para resignificar la función" },
            { period: "2019", title: "Tesis doctoral laureada — una epistemología de usos de lo proporcional" },
            { period: "2026", title: "Investigación posdoctoral — mirar profesionalmente en la formación continua" },
          ],
          publications: [
            {
              year: "2024",
              kind: "Artículo",
              title: "La periodicidad: significados desde su uso en la huerta escolar para la matemática escolar",
              meta: "Con Gabriela Buendía · Revista Venezolana de Investigación en Educación Matemática",
              featured: true,
            },
          ],
        },
        {
          id: "festivales",
          n: 4,
          categoryId: "justicia-social",
          color: "naranja",
          eyebrow: "Sacar la matemática del aula",
          period: "2018 – actualidad",
          variant: "hitos",
          title: "Festivales, memes y humor como recurso serio.",
          body: "Creó y preside la red de festivales matemáticos de Colombia y lideró seis versiones del festival en Soacha. Su trabajo con memes y humor en el aula es también una investigación sobre qué imaginario tienen las y los estudiantes de la matemática.",
          milestones: [
            {
              title: "Creadora y presidenta de la Red de Festivales Matemáticos de Colombia",
              primary: true,
            },
            { period: "2024", title: "Festival Matemático Santanderista", detail: "Mejor proyecto de matemáticas del municipio de Soacha" },
            { period: "2019", title: "Reconocimiento «Mujeres Matemáticas»", detail: "Sociedad Colombiana de Matemáticas" },
            { period: "2022", title: "Mejor docente innovador del municipio de Soacha" },
            { period: "2023", title: "Profesora destacada y egresada distinguida", detail: "Universidad Pedagógica Nacional" },
            { period: "2012", title: "Formadora del Programa Todos a Aprender", detail: "Ministerio de Educación Nacional de Colombia" },
          ],
        },
        {
          id: "universidad",
          n: 5,
          categoryId: "formacion-docente",
          color: "azul",
          eyebrow: "La cátedra",
          period: "2022 – actualidad",
          variant: "hitos",
          title: "De la escuela al posgrado, sin dejar la escuela.",
          body: "Da cátedra en la Universidad Pedagógica Nacional, dicta el módulo de proporcionalidad del Diplomado en Matemática Educativa de la UDLA en Chile y evalúa proyectos doctorales en varias universidades colombianas.",
          milestones: [
            {
              title: "Profesora de cátedra — Maestría en Docencia de las Matemáticas y Licenciatura en Matemáticas",
              detail: "Universidad Pedagógica Nacional de Colombia",
              primary: true,
            },
            {
              period: "2022 – actualidad",
              title: "Módulo de proporcionalidad — Diplomado en Matemática Educativa",
              detail: "Universidad De Las Américas, Santiago de Chile",
            },
            { period: "2023 – 2024", title: "Docente asesora del Doctorado en Educación", detail: "Universidad San Buenaventura, Cali" },
            { period: "2025", title: "Evaluadora de proyectos doctorales", detail: "U. de Antioquia · U. de La Salle · U. de Cundinamarca" },
            { title: "Investigadora Junior reconocida por Minciencias" },
          ],
        },
        {
          id: "produccion",
          n: 6,
          categoryId: "justicia-social",
          color: "naranja",
          eyebrow: "Producción reciente",
          period: "2025 – 2026",
          variant: "ramas",
          title: "Ciudadanía, contextos y empoderamiento.",
          body: "Sus publicaciones más recientes cruzan la formación ciudadana, los contextos de significación y el empoderamiento docente en la formación de posgrado.",
          publications: [
            {
              year: "2026",
              kind: "Artículo",
              title: "Un ejercicio de empoderamiento docente en un curso de formación posgradual",
              meta: "Con L. A. Bohórquez · Revista Venezolana de Investigación en Educación Matemática",
              featured: true,
            },
            {
              year: "2026",
              kind: "Artículo",
              title: "La formación ciudadana en las prácticas educativas con las matemáticas",
              meta: "Con E. Torres y C. Salazar · Revista Pedagogía y Saberes",
            },
            {
              year: "2026",
              kind: "Artículo",
              title: "Contextos de significación como herramienta para la construcción de conocimiento matemático",
              meta: "Con I. Tuyub y Gabriela Buendía · Tecné, Episteme y Didaxis",
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "¿Es posible formar ciudadanos críticos en las aulas colombianas de matemáticas?",
              meta: "Con J. Sánchez · Revista Papeles",
            },
          ],
        },
        {
          id: "convergencia",
          n: 7,
          categoryId: "pensamiento-proporcional",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Pensamiento proporcional en ED.",
          body: "En Empoderamiento Docente crea situaciones de aprendizaje y facilita procesos en la línea de pensamiento proporcional.",
          milestones: [
            {
              title: "Facilitadora y creadora de situaciones de aprendizaje — Empoderamiento Docente",
              detail: "Colombia",
              primary: true,
            },
            { title: "Comité Latinoamericano de Matemática Educativa · Comisión de Equidad y Género" },
            { title: "Sociedad Colombiana de Matemáticas · grupos MESCUD y DIME" },
          ],
        },
      ],
      closing: {
        title: "La investigación no salió del aula: empezó ahí.",
        body: "Veinte años de escuela pública, un doctorado laureado sobre la huerta escolar, una red de festivales y cátedra de posgrado en tres países.",
        body2: "Su línea en ED —lo proporcional— es la misma que estudió en la huerta de su escuela.",
      },
    },
  },
  {
    key: "darly-ku-euan",
    nombre: "Darly Ku-Euan",
    rol: "Diseñadora de material didáctico",
    pais: "México",
    tier: 4,
    imagePosition: "50% 45%",
    bio: "Especialista en pensamiento matemático y desarrollo profesional docente. Profesora de Matemáticas. Doctora en Ciencias con especialidad en Matemática Educativa.",
    profile: {
      fullName: "Darly Alina Ku-Euan",
      role: "Diseñadora de material didáctico",
      location: "Zacatecas, México",
      figura: "marco",
      cutout: "/equipo/darly-ku-euan.jpg",
      cutoutPosition: "50% 45%",
      headline: "Investigar cómo se aprende, para poder diseñar cómo se enseña.",
      intro:
        "Profesora de matemáticas y doctora en Matemática Educativa. Es profesora investigadora de tiempo completo en la Universidad Autónoma de Zacatecas, donde dirige tesis de maestría y trabaja sobre cognición, afecto e inclusión en el aprendizaje de las matemáticas.",
      formation: [
        "Licenciada en Enseñanza de las Matemáticas — UADY",
        "Maestra en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Doctora en Ciencias — Matemática Educativa, Cinvestav-IPN",
      ],
      categories: [
        { id: "pensamiento-matematico", label: "Pensamiento matemático", color: "verde" },
        { id: "investigacion", label: "Cognición, afecto e inclusión", color: "azul" },
        { id: "desarrollo-profesional", label: "Desarrollo profesional docente", color: "verde" },
      ],
      stages: [
        {
          id: "formacion",
          n: 1,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "La formación",
          period: "2004 – 2012",
          variant: "ficha",
          title: "De Yucatán al Cinvestav, ocho años.",
          body: "Se recibió de Licenciada en Enseñanza de las Matemáticas en la Universidad Autónoma de Yucatán y siguió con la maestría y el doctorado en Matemática Educativa en el Cinvestav-IPN.",
          milestones: [
            { period: "2004", title: "Licenciatura en Enseñanza de las Matemáticas", detail: "Universidad Autónoma de Yucatán" },
            { period: "2007", title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
            { period: "2012", title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
          ],
        },
        {
          id: "uaz",
          n: 2,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "Zacatecas",
          period: "2010 – actualidad",
          variant: "hitos",
          title: "De tutora de diplomado a profesora investigadora de base.",
          body: "Entró como tutora de un diplomado para profesorado de educación básica y hoy es profesora investigadora de tiempo completo de base en la Universidad Autónoma de Zacatecas.",
          milestones: [
            {
              period: "2017 – actualidad",
              title: "Profesora investigadora de tiempo completo de base",
              detail: "Universidad Autónoma de Zacatecas",
              primary: true,
            },
            { period: "2013 – 2017", title: "Profesora de tiempo completo", detail: "Universidad Autónoma de Zacatecas" },
            { period: "2010 – 2011", title: "Tutora de diplomado para profesorado de educación básica" },
            { period: "2015 · 2018", title: "Reconocimiento a perfil deseable", detail: "Secretaría de Educación Pública" },
          ],
        },
        {
          id: "linea",
          n: 3,
          categoryId: "investigacion",
          color: "azul",
          eyebrow: "Las investigaciones",
          period: "2013 – 2022",
          variant: "concepto",
          title: "Cognición, afecto e inclusión en el aula de matemáticas.",
          body: "Sus proyectos van del análisis cognitivo del aprendizaje al lugar del afecto y de la inclusión. Uno de ellos, sobre laboratorios experimentales como estrategia de inclusión, incluyó una estancia académica en un centro de estudios del mar.",
          milestones: [
            { period: "2013 – 2014", title: "Tópicos de álgebra elemental con base en la teoría APOE" },
            { period: "2015 – 2016", title: "Laboratorios experimentales: estrategia didáctica de inclusión" },
            { period: "2015 – 2017", title: "La cognición y el afecto en la enseñanza y el aprendizaje de la matemática" },
            { period: "2020 – 2022", title: "Estudios sobre y con el profesor de matemáticas" },
          ],
          publications: [
            {
              year: "2023",
              kind: "Libro",
              title: "Interpretación del movimiento, ¿gráficas cartesianas o trayectorias?",
              meta: "Capítulo — Perspectivas de Investigación e Innovación en Matemática Educativa · Universidad Autónoma de Coahuila",
              featured: true,
            },
          ],
        },
        {
          id: "tesis",
          n: 4,
          categoryId: "desarrollo-profesional",
          color: "naranja",
          eyebrow: "Formar investigadoras e investigadores",
          period: "2021 – 2022",
          variant: "editorial",
          title: "Tres tesis de maestría dirigidas, sobre el propio profesorado.",
          body: "Las tesis que dirigió tienen algo en común: miran al profesor de matemáticas como sujeto de estudio, sus actitudes, sus interacciones y su conocimiento didáctico.",
          milestones: [
            { period: "2021", title: "Caracterización de las actitudes del profesor de matemáticas en el nivel superior" },
            {
              period: "2022",
              title: "Interacciones que promueven la construcción de conocimiento sobre el concepto de variable",
            },
            {
              period: "2022",
              title: "El conocimiento didáctico del contenido en profesores de educación primaria",
            },
          ],
        },
        {
          id: "convergencia",
          n: 5,
          categoryId: "pensamiento-matematico",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Diseño de material didáctico en ED.",
          body: "En Empoderamiento Docente diseña material didáctico desde el pensamiento matemático y el desarrollo profesional docente.",
          milestones: [
            { title: "Diseñadora de material didáctico — Empoderamiento Docente", detail: "México", primary: true },
          ],
        },
      ],
      closing: {
        title: "La investigación puesta a diseñar.",
        body: "Quince años de investigación sobre cómo se aprende matemática —y sobre quién la enseña— sostienen el material que después llega al aula.",
      },
    },
  },
  {
    key: "luis-cabrera",
    nombre: "Luis Cabrera Chim",
    rol: "Facilitador · Evaluación educativa",
    pais: "México",
    tier: 4,
    imagePosition: "50% 15%",
    imageZoom: 1.34,
    bio: "Especialista en desarrollo profesional docente, pensamiento y lenguaje variacional y evaluación educativa. Doctor en Ciencias con especialidad en Matemática Educativa.",
    linkedin: "https://www.linkedin.com/in/luis-manuel-cabrera-chim-214abb227/",
    profile: {
      fullName: "Luis Manuel Cabrera Chim",
      role: "Facilitador · Evaluación educativa",
      location: "San Pedro Cholula, Puebla, México",
      figura: "marco",
      cutout: "/equipo/luis-cabrera.jpg",
      cutoutPosition: "50% 15%",
      headline: "Quince años enseñándole matemática a quienes enseñan matemática.",
      intro:
        "Doctor en Matemática Educativa y profesor-investigador posdoctorante en el INAOE. Diseña, coordina e imparte programas de formación docente —de talleres de actualización a posgrados— y desarrolló un esquema teórico propio para el pensamiento y lenguaje variacional.",
      formation: [
        "Doctor en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Profesor-Investigador Posdoctorante — INAOE",
        "Candidato al Sistema Nacional de Investigadoras e Investigadores",
      ],
      categories: [
        { id: "variacional", label: "Pensamiento y lenguaje variacional", color: "verde" },
        { id: "formacion-docente", label: "Formación docente", color: "verde" },
        { id: "evaluacion", label: "Evaluación educativa", color: "naranja" },
        { id: "materiales", label: "Libros de texto y materiales", color: "azul" },
      ],
      stages: [
        {
          id: "programas",
          n: 1,
          categoryId: "formacion-docente",
          color: "verde",
          eyebrow: "El oficio",
          period: "2019 – 2022",
          variant: "hitos",
          title: "De la secretaría académica al taller con docentes en servicio.",
          body: "Fue Secretario Académico del Programa Interdisciplinario para el Desarrollo Profesional Docente en Matemáticas del Cinvestav-SEP y después dictó más de cien horas de talleres de actualización para profesorado en servicio de educación básica y media superior.",
          milestones: [
            {
              period: "2019 – 2020",
              title: "Secretario Académico — Programa Interdisciplinario para el Desarrollo Profesional Docente en Matemáticas",
              detail: "Cinvestav-SEP",
              primary: true,
            },
            {
              period: "2021 – 2022",
              title: "Talleres de actualización para profesorado en servicio",
              detail: "UASLP con la Secretaría de Educación de San Luis Potosí · más de 100 horas",
            },
            {
              period: "2021 – 2022",
              title: "Seminarios en la Maestría en Educación",
              detail: "Facultad de Psicología, UASLP",
            },
          ],
        },
        {
          id: "posgrado",
          n: 2,
          categoryId: "formacion-docente",
          color: "azul",
          eyebrow: "El posgrado",
          period: "2022 – 2028",
          variant: "hitos",
          title: "Profesor en tres posgrados a la vez.",
          body: "Da clases en la Maestría en Enseñanza de Ciencias Exactas del INAOE, en la Especialidad en Matemática Educativa y en el Doctorado en Investigación en Aprendizaje y Docencia de la Benemérita Escuela Normal Veracruzana. También diseñó dos planes de estudio completos.",
          milestones: [
            {
              period: "2022 – actualidad",
              title: "Profesor-Investigador — Maestría en Enseñanza de Ciencias Exactas",
              detail: "Instituto Nacional de Astrofísica, Óptica y Electrónica",
              primary: true,
            },
            {
              period: "2025 – 2028",
              title: "Profesor invitado — Doctorado en Investigación en Aprendizaje y Docencia",
              detail: "Benemérita Escuela Normal Veracruzana",
            },
            {
              period: "2023 – 2024",
              title: "Diseño de Situaciones de Aprendizaje — Especialidad en Matemática Educativa",
              detail: "Benemérita Escuela Normal Veracruzana",
            },
            {
              title: "Diseño curricular de la Maestría en Enseñanza de Ciencias Exactas y de la Licenciatura en Psicopedagogía",
              detail: "INAOE y UASLP",
            },
            {
              title: "Dirección de nueve tesis y sinodalías en más de veinte exámenes de grado",
            },
          ],
        },
        {
          id: "variacional",
          n: 3,
          categoryId: "variacional",
          color: "verde",
          eyebrow: "Un esquema propio",
          variant: "concepto",
          title: "Cómo se desarrolla el pensamiento variacional, y cómo se evalúa.",
          body: "Su aporte teórico es un esquema para el desarrollo del pensamiento y lenguaje variacional: qué se pone en juego cuando alguien piensa el cambio, cómo diseñar situaciones que lo provoquen y con qué criterios evaluarlo.",
          milestones: [
            { period: "2024", title: "Rúbrica para evaluar el desarrollo del pensamiento y lenguaje variacional" },
            { period: "2025", title: "Referentes teóricos para el diseño de situaciones variacionales" },
            { title: "Más de 30 publicaciones arbitradas y más de 60 ponencias" },
          ],
          publications: [
            {
              year: "2025",
              kind: "Libro",
              title: "Referentes teóricos para el diseño de situaciones variacionales",
              meta: "Capítulo — Tendencias en la Educación Matemática 2025 · Editorial SOMIDEM",
              featured: true,
            },
          ],
        },
        {
          id: "materiales",
          n: 4,
          categoryId: "materiales",
          color: "azul",
          eyebrow: "Escribir para el aula",
          period: "2015 – 2019",
          variant: "ramas",
          title: "Libros de texto de secundaria y materiales para docentes.",
          body: "Es coautor de un libro de texto de matemáticas de secundaria y de su libro de recursos para el profesor, revisó técnicamente libros aprobados por la SEP y participó en la colección para docentes del Plan Nacional Aprender Matemática en Argentina.",
          publications: [
            {
              year: "2019",
              kind: "Materiales",
              title: "Plan Nacional Aprender Matemática",
              meta: "Coautoría de la colección para el profesor · Ministerio de Educación, Cultura, Ciencia y Tecnología de Argentina",
              featured: true,
            },
            {
              year: "2015",
              kind: "Libro",
              title: "Matemáticas 2, Serie espiral del saber",
              meta: "Coautoría, con su Libro de Recursos para el Profesor · Editorial Santillana",
            },
            {
              year: "2025",
              kind: "Artículo",
              title: "Una aproximación variacional",
              meta: "Avances de Investigación en Educación Matemática",
            },
            {
              year: "2026",
              kind: "Artículo",
              title: "Taller del sistema solar",
              meta: "Revista Mexicana de Física E",
            },
          ],
        },
        {
          id: "comunidad",
          n: 5,
          categoryId: "evaluacion",
          color: "naranja",
          eyebrow: "La comunidad del campo",
          period: "2023 – 2030",
          variant: "hitos",
          title: "Presidir la red y representar a la región.",
          body: "Fue elegido presidente de la Red de Centros de Investigación en Matemática Educativa y vocal por Norteamérica del Consejo Directivo del Comité Latinoamericano de Matemática Educativa.",
          milestones: [
            {
              period: "2026 – 2028",
              title: "Presidente de la Red de Centros de Investigación en Matemática Educativa",
              primary: true,
            },
            {
              period: "2026 – 2030",
              title: "Vocal Norteamérica — Consejo Directivo del Comité Latinoamericano de Matemática Educativa",
            },
            { period: "2023 – 2026", title: "Candidato al Sistema Nacional de Investigadoras e Investigadores" },
            { title: "Revisor de Educación Matemática, RELIME e IE-REDIECH" },
          ],
        },
        {
          id: "convergencia",
          n: 6,
          categoryId: "evaluacion",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Evaluación educativa en ED.",
          body: "En Empoderamiento Docente facilita procesos y diseña materiales desde el desarrollo profesional docente, el pensamiento variacional y la evaluación.",
          milestones: [
            {
              title: "Facilitador y diseñador de materiales educativos — Empoderamiento Docente",
              detail: "México",
              primary: true,
            },
            { title: "AMIUTEM · SOMIDEM · CLAME" },
          ],
        },
      ],
      closing: {
        title: "Un esquema teórico que termina siendo una rúbrica.",
        body: "Investigar cómo se piensa el cambio, escribir los libros con los que se estudia y formar al profesorado que los va a usar son, en su recorrido, el mismo trabajo.",
      },
    },
  },
  {
    key: "eduardo-briceno",
    nombre: "Eduardo Briceño",
    rol: "Diseñador de material didáctico",
    pais: "México",
    tier: 4,
    imagePosition: "50% 14%",
    imageZoom: 1.3,
    bio: "Especialista en la construcción social del conocimiento y el uso de tecnología en la enseñanza de las matemáticas. Doctor en Ciencias con especialidad en Matemática Educativa.",
    pubs: [
      { titulo: "Rodríguez, Briceño y Hernández (2026)" },
      { titulo: "Hernández, Padilla y Briceño (2023)" },
    ],
    linkedin: "https://www.linkedin.com/in/eduardo-carlos-brice%C3%B1o-solis-81a83a29",
    profile: {
      fullName: "Eduardo Carlos Briceño Solís",
      role: "Diseñador de material didáctico",
      location: "Zacatecas, México",
      origin: "Yucatán, México",
      figura: "marco",
      cutout: "/equipo/eduardo-briceno.jpg",
      cutoutPosition: "50% 14%",
      headline: "Qué aprendemos mirando cómo nuestros estudiantes usan una gráfica.",
      intro:
        "Doctor en Matemática Educativa y profesor-investigador titular en la Universidad Autónoma de Zacatecas. Investiga la construcción social del conocimiento matemático y el uso de la tecnología en la enseñanza, con las gráficas y el movimiento como terreno de trabajo.",
      formation: [
        "Licenciado en Enseñanza de las Matemáticas — UADY",
        "Maestro en Ciencias — Matemática Educativa, Cinvestav-IPN",
        "Doctor en Ciencias — Matemática Educativa, Cinvestav-IPN",
      ],
      categories: [
        { id: "graficas", label: "Gráficas y modelación", color: "verde" },
        { id: "tecnologia", label: "Tecnología en la enseñanza", color: "azul" },
        { id: "desarrollo-profesional", label: "Profesionalización docente", color: "verde" },
      ],
      stages: [
        {
          id: "formacion",
          n: 1,
          categoryId: "graficas",
          color: "azul",
          eyebrow: "La formación",
          variant: "ficha",
          title: "De Yucatán al Cinvestav.",
          body: "Se recibió de Licenciado en Enseñanza de las Matemáticas en la Universidad Autónoma de Yucatán y obtuvo la maestría y el doctorado en Ciencias con especialidad en Matemática Educativa en el Cinvestav-IPN.",
          milestones: [
            { title: "Licenciatura en Enseñanza de las Matemáticas", detail: "Universidad Autónoma de Yucatán" },
            { title: "Maestría en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
            { title: "Doctorado en Ciencias — Matemática Educativa", detail: "Cinvestav-IPN" },
          ],
        },
        {
          id: "quintana-roo",
          n: 2,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "El posgrado profesionalizante",
          variant: "editorial",
          title: "Formar docentes que ya están dando clase.",
          body: "Antes de Zacatecas fue profesor investigador en la Maestría Profesionalizante en Matemática Educativa de la Universidad de Quintana Roo: un posgrado pensado para docentes en ejercicio, no para futuros investigadores.",
          milestones: [
            {
              title: "Profesor investigador — Maestría Profesionalizante en Matemática Educativa",
              detail: "Universidad de Quintana Roo",
            },
          ],
        },
        {
          id: "uaz",
          n: 3,
          categoryId: "desarrollo-profesional",
          color: "verde",
          eyebrow: "Zacatecas",
          period: "2018 – actualidad",
          variant: "hitos",
          title: "Profesor titular y líder de un cuerpo académico consolidado.",
          body: "Es profesor-investigador de tiempo completo titular C en la Unidad Académica de Matemáticas de la Universidad Autónoma de Zacatecas y lidera el cuerpo académico consolidado «La matemática educativa en la profesionalización docente».",
          milestones: [
            {
              period: "2022 – actualidad",
              title: "Profesor-Investigador de tiempo completo titular C",
              detail: "Unidad Académica de Matemáticas, Universidad Autónoma de Zacatecas",
              primary: true,
            },
            {
              title: "Líder del cuerpo académico consolidado UAZ-CA-243",
              detail: "«La matemática educativa en la profesionalización docente»",
            },
            { period: "2023", title: "Sistema Nacional de Investigadores, nivel 1" },
            { period: "2023", title: "Sistema Estatal de Investigadores", detail: "Consejo Zacatecano de Ciencia y Tecnología" },
            { period: "2018 · 2022 · 2025", title: "Reconocimiento a perfil deseable", detail: "PRODEP" },
          ],
        },
        {
          id: "lineas",
          n: 4,
          categoryId: "tecnologia",
          color: "azul",
          eyebrow: "Las líneas de trabajo",
          variant: "concepto",
          title: "Las gráficas no ilustran: construyen conocimiento.",
          body: "Sus tres líneas se cruzan en un mismo punto: cómo se construye socialmente el conocimiento matemático cuando entran en juego el movimiento, la gráfica y la tecnología.",
          milestones: [
            { title: "Uso de tecnología en los procesos de enseñanza y aprendizaje de las matemáticas" },
            { title: "Desarrollo profesional docente en matemáticas" },
            { title: "Estudios socioculturales en educación matemática" },
          ],
          publications: [
            {
              year: "2019",
              kind: "Artículo",
              title: "¿Qué podemos aprender de nuestros estudiantes? Reflexiones en torno al uso de las gráficas",
              meta: "Educación Matemática",
              featured: true,
            },
          ],
        },
        {
          id: "produccion",
          n: 5,
          categoryId: "graficas",
          color: "azul",
          eyebrow: "Producción",
          period: "2020 – 2024",
          variant: "ramas",
          title: "Del teorema de Pitágoras a la planeación de clase.",
          body: "Quince artículos arbitrados, la mitad de ellos destacados. Los más recientes miran de cerca lo que hace el profesorado: qué significados pone en juego al planear y qué tecnología traen las tareas de los libros de texto.",
          publications: [
            {
              year: "2024",
              kind: "Artículo",
              title: "¿Qué significados de la derivada favorece un profesor en su planeación de clase?",
              meta: "Con Judith Hernández · Revista de Investigación Educativa de la REDIECH",
              featured: true,
            },
            {
              year: "2023",
              kind: "Artículo",
              title: "Dimensiones tecnológicas en tareas de libros de texto de matemáticas",
              meta: "Revista Electrónica de Investigación Educativa",
            },
            {
              year: "2022",
              kind: "Artículo",
              title: "Análisis de interpretaciones de gráficas de movimiento y sus implicaciones didácticas",
              meta: "Innovación Educativa",
            },
            {
              year: "2021",
              kind: "Artículo",
              title: "Análisis de la resolución de un problema de cinemática mediante el mapa conceptual híbrido",
              meta: "Enseñanza de las Ciencias",
            },
          ],
        },
        {
          id: "convergencia",
          n: 6,
          categoryId: "graficas",
          color: "verde",
          eyebrow: "La convergencia",
          period: "actualidad",
          variant: "sintesis",
          title: "Diseño de material didáctico en ED.",
          body: "En Empoderamiento Docente diseña material didáctico desde la construcción social del conocimiento y el uso de tecnología en la enseñanza de las matemáticas.",
          milestones: [
            { title: "Diseñador de material didáctico — Empoderamiento Docente", detail: "México", primary: true },
            { period: "2020 – 2022", title: "Consejo directivo de la Red de Centros de Investigación en Matemática Educativa" },
          ],
        },
      ],
      closing: {
        title: "Mirar lo que el estudiante hace, no lo que debería hacer.",
        body: "Investigación sobre gráficas, movimiento y tecnología, un cuerpo académico consolidado y quince artículos arbitrados sostienen los materiales que diseña.",
      },
    },
  },
];

/** Ruta de la foto real aprobada de una persona. */
export const fotoDe = (key: string) => `/equipo/${key}.jpg`;

/** Personas de un nivel jerárquico, en el orden del array. */
export const porTier = (tier: Tier) => EQUIPO.filter((p) => p.tier === tier);

/** Dirección General (nivel 1) — persona que abre el recorrido. */
export const DANIELA = EQUIPO[0];

/** Busca una persona por su slug. */
export const personaPorKey = (key: string) => EQUIPO.find((p) => p.key === key);
