// Validaciones del formulario "Publicar proyecto" (tarea A-2).
// Los límites de longitud todavía no están en la spec: estos son una propuesta
// que hay que confirmar con el equipo (y con B, para que la base use los mismos).
import type { Category, ProjectInput, Skill } from "../../contracts/models";

export const CATEGORIAS: Category[] = [
  "Ciencia",
  "Tecnología",
  "Innovación",
  "Educación",
  "Medioambiente",
  "Impacto social",
];

export const HABILIDADES: Skill[] = [
  "Diseño gráfico",
  "Desarrollo web",
  "Desarrollo móvil",
  "Análisis de datos",
  "Investigación",
  "Comunicación y difusión",
  "Gestión de proyectos",
  "Educación y pedagogía",
  "Medioambiente y sostenibilidad",
  "Escritura y edición",
];

export const LIMITES = {
  title: { min: 5, max: 80 },
  problem: { min: 20, max: 500 },
  description: { min: 20, max: 2000 },
  supportNeed: { min: 10, max: 300 },
} as const;

export type CampoProyecto = Exclude<keyof ProjectInput, "coverImage">;
export type ErroresProyecto = Partial<Record<CampoProyecto, string>>;

/** Formulario a medio llenar: la categoría puede estar vacía. */
export type BorradorProyecto = Omit<ProjectInput, "category"> & { category: Category | "" };

export function validarProyecto(datos: BorradorProyecto): ErroresProyecto {
  const errores: ErroresProyecto = {};

  for (const campo of ["title", "problem", "description", "supportNeed"] as const) {
    const texto = datos[campo].trim();
    const { min, max } = LIMITES[campo];
    if (texto.length === 0) errores[campo] = "Este campo es obligatorio.";
    else if (texto.length < min) errores[campo] = `Escribe al menos ${min} caracteres.`;
    else if (texto.length > max) errores[campo] = `Máximo ${max} caracteres.`;
  }

  if (!CATEGORIAS.includes(datos.category as Category)) {
    errores.category = "Elige una categoría.";
  }

  if (datos.requiredSkills.length === 0) {
    errores.requiredSkills = "Elige al menos un perfil.";
  } else if (datos.requiredSkills.some((s) => !HABILIDADES.includes(s))) {
    errores.requiredSkills = "Hay un perfil que no es válido.";
  }

  return errores;
}

// Imagen de portada (opcional). Medidas y peso recomendados para que cargue rápido en celular.
export const IMAGEN = {
  tiposPermitidos: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 800 * 1024,
  recomendada: "1200 × 630 px (horizontal)",
} as const;

/** Devuelve un mensaje de error si el archivo no sirve, o "" si está bien. */
export function validarImagen(archivo: { type: string; size: number }): string {
  if (!(IMAGEN.tiposPermitidos as readonly string[]).includes(archivo.type)) {
    return "Usa una imagen JPG, PNG o WebP.";
  }
  if (archivo.size > IMAGEN.maxBytes) {
    return "La imagen pesa más de 800 KB. Reduce su tamaño e inténtalo de nuevo.";
  }
  return "";
}
