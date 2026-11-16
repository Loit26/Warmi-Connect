// Pantalla "Mis solicitudes" (tareas A-5 y A-6).
import { useCallback, useEffect, useState } from "react";
import type {
  Decision,
  ReceivedRequest,
  RequestStatus,
  SentRequest,
} from "../../contracts/models";
import { IconoCorreo, IconoInstagram, IconoLinkedin } from "../../components/Ilustraciones";
import { services } from "../../services";
import { mensajeDeError } from "../publicar/PublicarProyecto";

type Pestana = "recibidas" | "enviadas";
type Filtro = "todas" | RequestStatus;

export const TEXTO_ESTADO: Record<RequestStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "pending", texto: "Pendientes" },
  { valor: "accepted", texto: "Aceptadas" },
  { valor: "rejected", texto: "Rechazadas" },
];

interface Props {
  onExplorar: () => void;
  onPublicar: () => void;
  /** Avisa a la app que algo cambió, para actualizar los contadores del menú y del panel. */
  onCambio?: () => void;
}

export function MisSolicitudes({ onExplorar, onPublicar, onCambio }: Props) {
  const [pestana, setPestana] = useState<Pestana>("recibidas");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [recibidas, setRecibidas] = useState<ReceivedRequest[]>([]);
  const [enviadas, setEnviadas] = useState<SentRequest[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [r, e] = await Promise.all([
        services.listReceivedRequests(),
        services.listSentRequests(),
      ]);
      setRecibidas(r);
      setEnviadas(e);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = pestana === "recibidas" ? recibidas : enviadas;
  const visibles = filtro === "todas" ? lista : lista.filter((s) => s.status === filtro);

  return (
    <section className="pagina">
      <div className="portada">
        <p className="eyebrow">Panel de colaboración</p>
        <h1>
          Tus <em>solicitudes</em>
        </h1>
        <p className="subtitulo">
          En <strong>Recibidas</strong> ves quién quiere sumarse a tus proyectos, con su perfil, su mensaje
          y la fecha y hora en que escribió. En <strong>Enviadas</strong> sigues el estado de cada
          postulación que hiciste.
        </p>
      </div>

      <div className="barra-solicitudes">
        <div className="pestanas" role="tablist">
          <BotonPestana
            activa={pestana === "recibidas"}
            texto="Recibidas"
            total={recibidas.length}
            onClick={() => setPestana("recibidas")}
          />
          <BotonPestana
            activa={pestana === "enviadas"}
            texto="Enviadas"
            total={enviadas.length}
            onClick={() => setPestana("enviadas")}
          />
        </div>

        <div className="filtros" aria-label="Filtrar por estado">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              className={`filtro ${filtro === f.valor ? "activo" : ""}`}
              aria-pressed={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
            >
              {f.texto}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="tarjeta estado-centro" aria-busy="true">
          Cargando solicitudes…
        </div>
      ) : error ? (
        <div className="tarjeta estado-centro" role="alert">
          <p>{error}</p>
          <button className="boton secundario" onClick={cargar}>
            Reintentar
          </button>
        </div>
      ) : lista.length === 0 ? (
        <EstadoVacio pestana={pestana} onExplorar={onExplorar} onPublicar={onPublicar} />
      ) : visibles.length === 0 ? (
        <div className="tarjeta estado-centro">
          No tienes solicitudes {FILTROS.find((f) => f.valor === filtro)?.texto.toLowerCase()}.
        </div>
      ) : (
        <ul className="lista-solicitudes" role="tabpanel">
          {pestana === "recibidas"
            ? (visibles as ReceivedRequest[]).map((s) => (
                <TarjetaRecibida
                  key={s.id}
                  solicitud={s}
                  onActualizada={(nueva) => {
                    setRecibidas((prev) =>
                      prev.map((x) => (x.id === nueva.id ? { ...x, status: nueva.status } : x)),
                    );
                    onCambio?.();
                  }}
                />
              ))
            : (visibles as SentRequest[]).map((s) => <TarjetaEnviada key={s.id} solicitud={s} />)}
        </ul>
      )}
    </section>
  );
}

function BotonPestana(props: { activa: boolean; texto: string; total: number; onClick: () => void }) {
  return (
    <button
      role="tab"
      aria-selected={props.activa}
      className={`pestana ${props.activa ? "activa" : ""}`}
      onClick={props.onClick}
    >
      {props.texto} <span className="contador-pestana">{props.total}</span>
    </button>
  );
}

export function EtiquetaEstado({ estado }: { estado: RequestStatus }) {
  return <span className={`estado estado-${estado}`}>{TEXTO_ESTADO[estado]}</span>;
}

function TarjetaRecibida({
  solicitud,
  onActualizada,
}: {
  solicitud: ReceivedRequest;
  onActualizada: (s: { id: string; status: RequestStatus }) => void;
}) {
  const [enviando, setEnviando] = useState<Decision | null>(null);
  const [error, setError] = useState("");

  async function responder(decision: Decision) {
    setEnviando(decision);
    setError("");
    try {
      const actualizada = await services.respondToRequest(solicitud.id, decision);
      onActualizada(actualizada);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(null);
    }
  }

  return (
    <li className={`tarjeta solicitud estado-borde-${solicitud.status}`}>
      <div className="solicitud-cabecera">
        <Iniciales nombre={solicitud.sender.displayName} />
        <div className="solicitud-quien">
          <p className="nombre">
            {solicitud.sender.displayName}
            <span className="especialidad"> · {solicitud.sender.specialty}</span>
          </p>
          <p className="meta">Quiere sumarse a tu proyecto</p>
        </div>
        <EtiquetaEstado estado={solicitud.status} />
      </div>

      <dl className="detalle-solicitud">
        <div>
          <dt>Proyecto</dt>
          <dd>{solicitud.project.title}</dd>
        </div>
        <div>
          <dt>Recibida</dt>
          <dd>{fechaCompleta(solicitud.createdAt)}</dd>
        </div>
        {solicitud.sender.skills && solicitud.sender.skills.length > 0 && (
          <div>
            <dt>Habilidades</dt>
            <dd>{solicitud.sender.skills.join(", ")}</dd>
          </div>
        )}
        {solicitud.sender.bio && (
          <div>
            <dt>Sobre ella</dt>
            <dd>{solicitud.sender.bio}</dd>
          </div>
        )}
      </dl>

      <div>
        <p className="mensaje-titulo">Su mensaje</p>
        <blockquote className="mensaje">{solicitud.message}</blockquote>
      </div>

      {solicitud.status === "accepted" && solicitud.sender.contact && (
        <ContactoAceptada contacto={solicitud.sender.contact} nombre={solicitud.sender.displayName} />
      )}

      {error && (
        <p className="alerta-error" role="alert">
          {error}
        </p>
      )}

      {solicitud.status === "pending" && (
        <div className="acciones">
          <button
            className="boton texto-peligro"
            disabled={enviando !== null}
            onClick={() => responder("rejected")}
          >
            {enviando === "rejected" ? "Rechazando…" : "Rechazar"}
          </button>
          <button
            className="boton primario"
            disabled={enviando !== null}
            onClick={() => responder("accepted")}
          >
            {enviando === "accepted" ? "Aceptando…" : "Aceptar colaboración"}
          </button>
        </div>
      )}
    </li>
  );
}

function TarjetaEnviada({ solicitud }: { solicitud: SentRequest }) {
  const nota: Record<RequestStatus, string> = {
    pending: "La creadora todavía no responde.",
    accepted: "¡Te aceptaron! Coordina los siguientes pasos con la creadora.",
    rejected: "Esta vez no fue posible. Sigue explorando otros proyectos.",
  };
  return (
    <li className={`tarjeta solicitud estado-borde-${solicitud.status}`}>
      <div className="solicitud-cabecera">
        <div className="solicitud-quien">
          <p className="nombre">{solicitud.project.title}</p>
          <p className="meta">
            <span className="etiqueta suave">{solicitud.project.category}</span> · Postulaste a este
            proyecto
          </p>
        </div>
        <EtiquetaEstado estado={solicitud.status} />
      </div>

      <dl className="detalle-solicitud">
        {solicitud.creator && (
          <div>
            <dt>Creadora</dt>
            <dd>
              {solicitud.creator.displayName} · {solicitud.creator.specialty}
            </dd>
          </div>
        )}
        <div>
          <dt>Enviada</dt>
          <dd>{fechaCompleta(solicitud.createdAt)}</dd>
        </div>
        {solicitud.supportNeed && (
          <div>
            <dt>Apoyo que piden</dt>
            <dd>{solicitud.supportNeed}</dd>
          </div>
        )}
      </dl>

      <div>
        <p className="mensaje-titulo">Tu mensaje</p>
        <blockquote className="mensaje">{solicitud.message}</blockquote>
      </div>
      <p className="nota">{nota[solicitud.status]}</p>
    </li>
  );
}

/** Los datos de contacto solo se muestran cuando aceptas la colaboración. */
function ContactoAceptada({
  contacto,
  nombre,
}: {
  contacto: NonNullable<ReceivedRequest["sender"]["contact"]>;
  nombre: string;
}) {
  const instagram = contacto.instagram?.replace(/^@/, "");
  return (
    <div className="contacto-aceptada">
      <p className="mensaje-titulo">Contacta a {nombre.split(" ")[0]}</p>
      <ul className="contactos">
        {contacto.email && (
          <li>
            <a href={`mailto:${contacto.email}`}>
              <IconoCorreo clase="icono-contacto" /> {contacto.email}
            </a>
          </li>
        )}
        {contacto.linkedin && (
          <li>
            <a href={contacto.linkedin} target="_blank" rel="noopener noreferrer">
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
    </div>
  );
}

function EstadoVacio({
  pestana,
  onExplorar,
  onPublicar,
}: {
  pestana: Pestana;
  onExplorar: () => void;
  onPublicar: () => void;
}) {
  return (
    <div className="tarjeta estado-centro vacio">
      <h2>
        {pestana === "recibidas"
          ? "Aún no recibes solicitudes"
          : "Aún no has enviado solicitudes"}
      </h2>
      <p>
        {pestana === "recibidas"
          ? "Cuando alguien quiera sumarse a tus proyectos, aparecerá aquí con su mensaje."
          : "Explora proyectos y postula a los que te interesen. Aquí verás su estado."}
      </p>
      <div className="acciones centradas">
        <button className="boton primario" onClick={onExplorar}>
          Explorar proyectos
        </button>
        <button className="boton secundario" onClick={onPublicar}>
          Publicar proyecto
        </button>
      </div>
    </div>
  );
}

function Iniciales({ nombre }: { nombre: string }) {
  const ini = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span className="avatar" aria-hidden="true">
      {ini}
    </span>
  );
}

function fechaCompleta(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
