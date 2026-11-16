// Pantalla de confirmación de publicación (tarea A-4).
import type { ProjectDetails } from "../../contracts/models";

interface Props {
  proyecto: ProjectDetails;
  onIrASolicitudes: () => void;
  onPublicarOtro: () => void;
}

export function Confirmacion({ proyecto, onIrASolicitudes, onPublicarOtro }: Props) {
  return (
    <section className="pagina">
      <div className="tarjeta confirmacion" role="status">
        <div className="sello" aria-hidden="true">
          ✓
        </div>
        <h1>¡Tu proyecto ya está publicado!</h1>
        <p className="subtitulo">
          <strong>{proyecto.title}</strong> ya aparece en el catálogo para que posibles
          colaboradoras puedan postular.
        </p>

        <dl className="ficha">
          <div>
            <dt>Categoría</dt>
            <dd>
              <span className="etiqueta">{proyecto.category}</span>
            </dd>
          </div>
          <div>
            <dt>Perfiles que buscas</dt>
            <dd className="lista-etiquetas">
              {proyecto.requiredSkills.map((s) => (
                <span key={s} className="etiqueta suave">
                  {s}
                </span>
              ))}
            </dd>
          </div>
          <div className="ancho">
            <dt>Apoyo que necesitas</dt>
            <dd>{proyecto.supportNeed}</dd>
          </div>
        </dl>

        <div className="acciones centradas">
          <button className="boton primario" onClick={onIrASolicitudes}>
            Ir a Mis solicitudes
          </button>
          <button className="boton secundario" onClick={onPublicarOtro}>
            Publicar otro proyecto
          </button>
        </div>
      </div>
    </section>
  );
}
