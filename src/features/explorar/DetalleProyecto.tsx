// Ventana de detalle de un proyecto + tarjeta creativa para solicitar colaboración.
import { useEffect, useState, type FormEvent } from "react";
import type { ProjectDetails } from "../../contracts/models";
import {
  IconoCorreo,
  IconoInstagram,
  IconoLinkedin,
  IlustracionCategoria,
} from "../../components/Ilustraciones";
import { services } from "../../services";
import { mensajeDeError } from "../publicar/PublicarProyecto";

const MIN = 20;
const MAX = 500;

interface Props {
  proyectoId: string;
  postulada: boolean;
  onCerrar: () => void;
  onEnviada: () => void;
  onIrASolicitudes?: () => void;
}

export function DetalleProyecto({ proyectoId, postulada, onCerrar, onEnviada, onIrASolicitudes }: Props) {
  const [proyecto, setProyecto] = useState<ProjectDetails | null>(null);
  const [miId, setMiId] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  useEffect(() => {
    Promise.all([services.getProject(proyectoId), services.getSession()])
      .then(([p, s]) => {
        setProyecto(p);
        setMiId(s?.id ?? "");
      })
      .catch((err) => setError(mensajeDeError(err)));
  }, [proyectoId]);

  // Escape cierra la ventana.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  const largo = mensaje.trim().length;
  const valido = largo >= MIN && largo <= MAX;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valido || !proyecto) return;
    setEnviando(true);
    setErrorEnvio("");
    try {
      await services.createRequest({ projectId: proyecto.id, message: mensaje.trim() });
      setEnviada(true);
      onEnviada();
    } catch (err) {
      setErrorEnvio(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  const ideas = proyecto
    ? [
        `Hola ${proyecto.creator.displayName.split(" ")[0]}, me interesa tu proyecto porque…`,
        "Puedo ayudarte con…",
        "Tengo ___ horas por semana para…",
      ]
    : [];

  return (
    <div className="fondo-modal" onClick={onCerrar} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del proyecto"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <div className="estado-centro" role="alert">
            <p>{error}</p>
            <button className="boton secundario" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        ) : !proyecto ? (
          <div className="estado-centro" aria-busy="true">
            Cargando detalle…
          </div>
        ) : (
          <>
            <div className="modal-cabecera">
              <div className="modal-arte" aria-hidden="true">
                {proyecto.coverImage ? (
                  <img src={proyecto.coverImage} alt="" />
                ) : (
                  <IlustracionCategoria categoria={proyecto.category} />
                )}
              </div>
              <button className="cerrar" onClick={onCerrar} aria-label="Cerrar">
                ✕
              </button>
              <div className="modal-titulos">
                <p className="eyebrow">Convocatoria abierta · {proyecto.category}</p>
                <h2>{proyecto.title}</h2>
              </div>
            </div>

            <div className="modal-cuerpo">
              <div>
                <div className="bloque">
                  <h3>El problema</h3>
                  <p>{proyecto.problem}</p>
                </div>
                <div className="bloque">
                  <h3>Qué haremos</h3>
                  <p>{proyecto.description}</p>
                </div>
                <div className="bloque">
                  <h3>Apoyo que necesitamos</h3>
                  <p>{proyecto.supportNeed}</p>
                </div>
                <div className="bloque">
                  <h3>Perfiles que buscamos</h3>
                  <div className="lista-etiquetas">
                    {proyecto.requiredSkills.map((s) => (
                      <span key={s} className="etiqueta">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="columna-derecha">
              <ConvocaPersona proyecto={proyecto} />
              <div className="solicitar">
                {proyecto.ownerId === miId ? (
                  <>
                    <h3>Este es tu proyecto</h3>
                    <p>
                      Así lo ven las demás mujeres. Cuando alguien quiera sumarse, su solicitud llegará a “Mis
                      solicitudes”, con su perfil y su mensaje.
                    </p>
                    {onIrASolicitudes && (
                      <button className="boton primario" onClick={onIrASolicitudes}>
                        Ver mis solicitudes
                      </button>
                    )}
                  </>
                ) : enviada || postulada ? (
                  <div className="exito-solicitud" role="status">
                    <div className="sello" aria-hidden="true">
                      ✓
                    </div>
                    <h3>{enviada ? "¡Solicitud enviada!" : "Ya postulaste a este proyecto"}</h3>
                    <p>
                      {proyecto.creator.displayName.split(" ")[0]} revisará tu mensaje. Verás la respuesta
                      en “Mis solicitudes”, pestaña Enviadas.
                    </p>
                    <button className="boton primario" onClick={onCerrar}>
                      Seguir explorando
                    </button>
                  </div>
                ) : (
                  <form onSubmit={enviar} noValidate>
                    <h3>Súmate a este proyecto</h3>
                    <p>
                      Cuéntale a {proyecto.creator.displayName.split(" ")[0]} quién eres y cómo puedes
                      ayudar. Un mensaje breve y concreto funciona mejor.
                    </p>
                    <div className="ideas" aria-label="Ideas para empezar">
                      {ideas.map((i) => (
                        <button
                          type="button"
                          key={i}
                          className="idea"
                          onClick={() => setMensaje((m) => (m ? `${m} ${i}` : i))}
                        >
                          + {i.length > 28 ? `${i.slice(0, 28)}…` : i}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="entrada"
                      rows={6}
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Ej.: Soy diseñadora gráfica y tengo 4 horas semanales. Puedo armar las etiquetas y el manual de identidad que necesitan."
                      aria-label="Mensaje para la creadora"
                    />
                    <p className={`contador ${largo > MAX ? "excedido" : ""}`}>
                      {largo} / {MAX} · mínimo {MIN} caracteres
                    </p>
                    {errorEnvio && (
                      <p className="alerta-error" role="alert">
                        {errorEnvio}
                      </p>
                    )}
                    <button type="submit" className="boton primario" disabled={!valido || enviando}>
                      {enviando ? "Enviando…" : "Enviar solicitud"}
                    </button>
                  </form>
                )}
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Quién convoca: perfil público y formas de contacto. */
function ConvocaPersona({ proyecto }: { proyecto: ProjectDetails }) {
  const c = proyecto.creator;
  const iniciales = c.displayName
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
  const instagram = c.contact?.instagram?.replace(/^@/, "");
  const sinContacto = !c.contact?.email && !c.contact?.linkedin && !instagram;
  return (
    <section className="convoca" aria-label="Quién convoca">
      <p className="eyebrow">Quién convoca</p>
      <div className="convoca-cabecera">
        <span className="avatar grande" aria-hidden="true">
          {iniciales}
        </span>
        <div>
          <h3>{c.displayName}</h3>
          <p className="especialidad">{c.specialty}</p>
        </div>
      </div>
      <p className="convoca-bio">{c.bio}</p>
      {c.skills.length > 0 && (
        <div className="lista-etiquetas">
          {c.skills.map((s) => (
            <span key={s} className="etiqueta suave">
              {s}
            </span>
          ))}
        </div>
      )}
      {sinContacto ? (
        <p className="nota">Para contactarla, envía tu solicitud: ella te responderá desde Warmi Connect.</p>
      ) : (
        <ul className="contactos">
          {c.contact?.email && (
            <li>
              <a href={`mailto:${c.contact.email}`}>
                <IconoCorreo clase="icono-contacto" /> {c.contact.email}
              </a>
            </li>
          )}
          {c.contact?.linkedin && (
            <li>
              <a href={c.contact.linkedin} target="_blank" rel="noopener noreferrer">
                <IconoLinkedin clase="icono-contacto" /> LinkedIn
              </a>
            </li>
          )}
          {instagram && (
            <li>
              <a href={`https://www.instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer">
                <IconoInstagram clase="icono-contacto" /> @{instagram}
              </a>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
