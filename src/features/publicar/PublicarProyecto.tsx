// Pantalla "Publicar proyecto" (tareas A-1, A-2 y A-3).
import { useRef, useState, type FormEvent } from "react";
import type { ProjectDetails, Skill } from "../../contracts/models";
import { WarmiError } from "../../contracts/services";
import { services } from "../../services";
import {
  CATEGORIAS,
  HABILIDADES,
  LIMITES,
  validarProyecto,
  type BorradorProyecto,
  type CampoProyecto,
  type ErroresProyecto,
} from "./validacion";

const VACIO: BorradorProyecto = {
  title: "",
  category: "",
  problem: "",
  description: "",
  requiredSkills: [],
  supportNeed: "",
};

const ORDEN_CAMPOS: CampoProyecto[] = [
  "title",
  "category",
  "problem",
  "description",
  "requiredSkills",
  "supportNeed",
];

interface Props {
  onPublicado: (proyecto: ProjectDetails) => void;
  onCancelar: () => void;
}

export function PublicarProyecto({ onPublicado, onCancelar }: Props) {
  const [datos, setDatos] = useState<BorradorProyecto>(VACIO);
  const [errores, setErrores] = useState<ErroresProyecto>({});
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function cambiar<K extends keyof BorradorProyecto>(campo: K, valor: BorradorProyecto[K]) {
    const nuevos = { ...datos, [campo]: valor };
    setDatos(nuevos);
    // Después del primer intento, los errores se actualizan mientras escribe.
    if (intentado) setErrores(validarProyecto(nuevos));
  }

  function alternarHabilidad(skill: Skill) {
    const ya = datos.requiredSkills.includes(skill);
    cambiar(
      "requiredSkills",
      ya ? datos.requiredSkills.filter((s) => s !== skill) : [...datos.requiredSkills, skill],
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setIntentado(true);
    setErrorGeneral("");
    const encontrados = validarProyecto(datos);
    setErrores(encontrados);

    const primero = ORDEN_CAMPOS.find((c) => encontrados[c]);
    if (primero) {
      formRef.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      const proyecto = await services.createProject({
        title: datos.title.trim(),
        category: datos.category as Exclude<BorradorProyecto["category"], "">,
        problem: datos.problem.trim(),
        description: datos.description.trim(),
        requiredSkills: datos.requiredSkills,
        supportNeed: datos.supportNeed.trim(),
      });
      onPublicado(proyecto);
    } catch (err) {
      setErrorGeneral(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pagina">
      <p className="eyebrow">Nueva iniciativa</p>
      <h1>Publicar proyecto</h1>
      <p className="subtitulo">
        Cuenta de qué trata tu proyecto y qué apoyo necesitas para que otras mujeres e
        instituciones puedan sumarse.
      </p>

      <form ref={formRef} className="tarjeta formulario" onSubmit={enviar} noValidate>
        <CampoTexto
          id="title"
          etiqueta="Nombre del proyecto"
          ayuda="Un título claro que identifique tu iniciativa."
          valor={datos.title}
          max={LIMITES.title.max}
          error={errores.title}
          onChange={(v) => cambiar("title", v)}
        />

        <fieldset className="campo">
          <legend>
            Categoría <span className="obligatorio">*</span>
          </legend>
          <p className="ayuda">El área principal, para que te encuentren en el catálogo.</p>
          <div className="opciones" role="radiogroup" aria-describedby="error-category">
            {CATEGORIAS.map((cat, i) => (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={datos.category === cat}
                data-campo={i === 0 ? "category" : undefined}
                className={`opcion ${datos.category === cat ? "activa" : ""}`}
                onClick={() => cambiar("category", cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <MensajeError id="error-category" texto={errores.category} />
        </fieldset>

        <CampoTexto
          id="problem"
          etiqueta="Problema u oportunidad"
          ayuda="¿Qué situación motiva tu proyecto?"
          valor={datos.problem}
          max={LIMITES.problem.max}
          error={errores.problem}
          multilinea
          onChange={(v) => cambiar("problem", v)}
        />

        <CampoTexto
          id="description"
          etiqueta="Descripción y objetivos"
          ayuda="Qué harás, tus avances y el impacto que esperas."
          valor={datos.description}
          max={LIMITES.description.max}
          error={errores.description}
          multilinea
          filas={6}
          onChange={(v) => cambiar("description", v)}
        />

        <fieldset className="campo">
          <legend>
            Perfiles que buscas <span className="obligatorio">*</span>
          </legend>
          <p className="ayuda">Elige uno o más tipos de colaboración.</p>
          <div className="opciones" aria-describedby="error-requiredSkills">
            {HABILIDADES.map((skill, i) => {
              const activa = datos.requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  aria-pressed={activa}
                  data-campo={i === 0 ? "requiredSkills" : undefined}
                  className={`opcion chip ${activa ? "activa" : ""}`}
                  onClick={() => alternarHabilidad(skill)}
                >
                  {activa ? "✓ " : "+ "}
                  {skill}
                </button>
              );
            })}
          </div>
          <MensajeError id="error-requiredSkills" texto={errores.requiredSkills} />
        </fieldset>

        <CampoTexto
          id="supportNeed"
          etiqueta="Apoyo que necesitas"
          ayuda="La tarea o entregable concreto que esperas de la colaboración."
          valor={datos.supportNeed}
          max={LIMITES.supportNeed.max}
          error={errores.supportNeed}
          onChange={(v) => cambiar("supportNeed", v)}
        />

        {errorGeneral && (
          <p className="alerta-error" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="acciones">
          <button type="button" className="boton secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="boton primario" disabled={enviando}>
            {enviando ? "Publicando…" : "Publicar proyecto"}
          </button>
        </div>
      </form>
    </section>
  );
}

interface CampoTextoProps {
  id: CampoProyecto;
  etiqueta: string;
  ayuda: string;
  valor: string;
  max: number;
  error?: string;
  multilinea?: boolean;
  filas?: number;
  onChange: (valor: string) => void;
}

function CampoTexto({ id, etiqueta, ayuda, valor, max, error, multilinea, filas = 4, onChange }: CampoTextoProps) {
  const props = {
    id,
    "data-campo": id,
    value: valor,
    "aria-invalid": Boolean(error),
    "aria-describedby": `ayuda-${id} error-${id}`,
    className: `entrada ${error ? "con-error" : ""}`,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  return (
    <div className="campo">
      <div className="campo-cabecera">
        <label htmlFor={id}>
          {etiqueta} <span className="obligatorio">*</span>
        </label>
        <span className={`contador ${valor.length > max ? "excedido" : ""}`}>
          {valor.length} / {max}
        </span>
      </div>
      <p className="ayuda" id={`ayuda-${id}`}>
        {ayuda}
      </p>
      {multilinea ? <textarea rows={filas} {...props} /> : <input type="text" {...props} />}
      <MensajeError id={`error-${id}`} texto={error} />
    </div>
  );
}

function MensajeError({ id, texto }: { id: string; texto?: string }) {
  return (
    <p id={id} className="error" aria-live="polite">
      {texto ?? ""}
    </p>
  );
}

export function mensajeDeError(err: unknown): string {
  if (err instanceof WarmiError) {
    switch (err.code) {
      case "UNAUTHENTICATED":
        return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo otra vez.";
      case "VALIDATION":
        return "Revisa los campos marcados: hay datos incompletos o inválidos.";
      case "FORBIDDEN":
        return "No tienes permiso para hacer esta acción.";
      case "NOT_FOUND":
        return "No encontramos lo que buscas. Puede que ya no exista.";
      case "INVALID_TRANSITION":
        return "Esta solicitud ya fue respondida.";
      case "NETWORK":
        return "No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.";
    }
  }
  return "Algo salió mal. Inténtalo de nuevo en unos segundos.";
}
