// Pantalla "Publicar proyecto" (tareas A-1, A-2 y A-3).
import { useRef, useState, type FormEvent, type ReactNode } from "react";
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

// Ayuda concreta para cada campo: cómo escribirlo, un ejemplo y qué evitar.
interface Guia {
  consejo: string;
  ejemplo: string;
  evita?: string;
}

const GUIAS: Record<CampoProyecto, Guia> = {
  title: {
    consejo: "Di qué haces y para quién, en pocas palabras.",
    ejemplo: "BioTintes: pigmentos naturales andinos",
    evita: "Títulos vagos como “Mi proyecto” o “Idea nueva”.",
  },
  category: {
    consejo: "Elige el área que mejor describe tu proyecto. Así te encuentran en el catálogo.",
    ejemplo: "Un proyecto de tintes con plantas nativas → Medioambiente",
  },
  problem: {
    consejo: "Describe la situación que quieres cambiar. Si puedes, incluye un dato o un caso real.",
    ejemplo: "Los colorantes sintéticos contaminan las fuentes de agua de comunidades campesinas.",
    evita: "Hablar de tu solución aquí: eso va en la descripción.",
  },
  description: {
    consejo: "Cuenta qué harás, qué has avanzado y qué impacto esperas lograr.",
    ejemplo:
      "Producimos tintes con plantas nativas cultivadas por mujeres campesinas. Ya tenemos 5 colores y buscamos llegar a 20 familias.",
  },
  requiredSkills: {
    consejo: "Marca los perfiles que más te ayudarían. Entre 1 y 4 suele ser lo ideal.",
    ejemplo: "Para etiquetas y difusión → Diseño gráfico + Comunicación y difusión",
  },
  supportNeed: {
    consejo: "Pide una tarea o entregable concreto, con un resultado claro.",
    ejemplo: "Diseñar 3 etiquetas ecológicas y un manual de identidad básico.",
    evita: "Pedidos generales como “Necesito ayuda con todo”.",
  },
};

const PLACEHOLDERS: Partial<Record<CampoProyecto, string>> = {
  title: "Ej.: BioTintes: pigmentos naturales andinos",
  problem: "Ej.: Los colorantes sintéticos contaminan las fuentes de agua de comunidades campesinas…",
  description:
    "Ej.: Producimos tintes con plantas nativas cultivadas por mujeres campesinas. Ya tenemos 5 colores y buscamos llegar a 20 familias…",
  supportNeed: "Ej.: Diseñar 3 etiquetas ecológicas y un manual de identidad básico.",
};

function GuiaCampo({ campo }: { campo: CampoProyecto }) {
  const g = GUIAS[campo];
  return (
    <div className="guia" id={`guia-${campo}`}>
      <span>
        <b>Cómo escribirlo:</b> {g.consejo}
      </span>
      <span className="ejemplo">
        <b>Ejemplo:</b> {g.ejemplo}
      </span>
      {g.evita && (
        <span>
          <b>Evita:</b> {g.evita}
        </span>
      )}
    </div>
  );
}

function Paso({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="paso-formulario">
      <span className="paso-numero" aria-hidden="true">
        {n}
      </span>
      <div className="paso-cuerpo">{children}</div>
    </div>
  );
}

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

  const completos = [
    datos.title.trim().length >= LIMITES.title.min,
    datos.category !== "",
    datos.problem.trim().length >= LIMITES.problem.min,
    datos.description.trim().length >= LIMITES.description.min,
    datos.requiredSkills.length > 0,
    datos.supportNeed.trim().length >= LIMITES.supportNeed.min,
  ].filter(Boolean).length;

  return (
    <section className="pagina">
      <div className="portada">
        <p className="eyebrow">Nueva iniciativa</p>
        <h1>
          Publica tu proyecto y <em>suma aliadas</em>
        </h1>
        <p className="subtitulo">
          Tu proyecto aparecerá como una convocatoria abierta. Responde en 6 pasos cortos: cada uno
          trae un ejemplo para que sepas qué escribir.
        </p>
      </div>

      <div className="barra-progreso" aria-hidden="true">
        <span style={{ width: `${(completos / 6) * 100}%` }} />
      </div>
      <p className="progreso-texto">{completos} de 6 pasos completos</p>

      <form ref={formRef} className="tarjeta formulario" onSubmit={enviar} noValidate>
        <Paso n={1}>
        <CampoTexto
          id="title"
          etiqueta="Nombre del proyecto"
          ayuda="Un título claro que identifique tu iniciativa."
          valor={datos.title}
          max={LIMITES.title.max}
          error={errores.title}
          onChange={(v) => cambiar("title", v)}
        />
        </Paso>

        <Paso n={2}>
        <fieldset className="campo">
          <legend>
            Categoría <span className="obligatorio">*</span>
          </legend>
          <p className="ayuda">El área principal, para que te encuentren en el catálogo.</p>
          <GuiaCampo campo="category" />
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
        </Paso>

        <Paso n={3}>
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
        </Paso>

        <Paso n={4}>
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
        </Paso>

        <Paso n={5}>
        <fieldset className="campo">
          <legend>
            Perfiles que buscas <span className="obligatorio">*</span>
          </legend>
          <p className="ayuda">Elige uno o más tipos de colaboración.</p>
          <GuiaCampo campo="requiredSkills" />
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
        </Paso>

        <Paso n={6}>
        <CampoTexto
          id="supportNeed"
          etiqueta="Apoyo que necesitas"
          ayuda="La tarea o entregable concreto que esperas de la colaboración."
          valor={datos.supportNeed}
          max={LIMITES.supportNeed.max}
          error={errores.supportNeed}
          onChange={(v) => cambiar("supportNeed", v)}
        />
        </Paso>

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
    "aria-describedby": `ayuda-${id} guia-${id} error-${id}`,
    placeholder: PLACEHOLDERS[id],
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
      <GuiaCampo campo={id} />
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
      case "DUPLICATE_REQUEST":
        return "Ya enviaste una solicitud a este proyecto. Revisa su estado en Mis solicitudes.";
      case "SELF_REQUEST":
        return "No puedes postular a tu propio proyecto.";
      case "INVALID_TRANSITION":
        return "Esta solicitud ya fue respondida.";
      case "NETWORK":
        return "No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.";
    }
  }
  return "Algo salió mal. Inténtalo de nuevo en unos segundos.";
}
