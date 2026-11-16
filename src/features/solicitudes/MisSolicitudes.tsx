// Pantalla "Mis solicitudes" (tareas A-5 y A-6).
import { useCallback, useEffect, useState } from "react";
import type {
  Decision,
  ReceivedRequest,
  RequestStatus,
  SentRequest,
} from "../../contracts/models";
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
}

export function MisSolicitudes({ onExplorar, onPublicar }: Props) {
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
      <p className="eyebrow">Panel de colaboración</p>
      <h1>Mis solicitudes</h1>
      <p className="subtitulo">
        Revisa quién quiere sumarse a tus proyectos y en qué va cada postulación que enviaste.
      </p>

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
                  onActualizada={(nueva) =>
                    setRecibidas((prev) =>
                      prev.map((x) => (x.id === nueva.id ? { ...x, status: nueva.status } : x)),
                    )
                  }
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
    <li className="tarjeta solicitud">
      <div className="solicitud-cabecera">
        <Iniciales nombre={solicitud.sender.displayName} />
        <div className="solicitud-quien">
          <p className="nombre">
            {solicitud.sender.displayName}
            <span className="especialidad"> · {solicitud.sender.specialty}</span>
          </p>
          <p className="meta">
            Para <strong>{solicitud.project.title}</strong> · {fecha(solicitud.createdAt)}
          </p>
        </div>
        <EtiquetaEstado estado={solicitud.status} />
      </div>

      <blockquote className="mensaje">{solicitud.message}</blockquote>

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
    <li className="tarjeta solicitud">
      <div className="solicitud-cabecera">
        <div className="solicitud-quien">
          <p className="nombre">{solicitud.project.title}</p>
          <p className="meta">
            <span className="etiqueta suave">{solicitud.project.category}</span> · Enviada{" "}
            {fecha(solicitud.createdAt)}
          </p>
        </div>
        <EtiquetaEstado estado={solicitud.status} />
      </div>
      <blockquote className="mensaje">{solicitud.message}</blockquote>
      <p className="nota">{nota[solicitud.status]}</p>
    </li>
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

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
