// Estructura general: menú lateral + barra superior + pantalla activa + panel derecho.
// Navegación simple por "#" en la URL para no agregar librerías.
import { useCallback, useEffect, useState } from "react";
import type { ProjectDetails } from "./contracts/models";
import { IconoExplorar, IconoPublicar, IconoSolicitudes } from "./components/Iconos";
import { PanelLateral, type Conteos } from "./components/PanelLateral";
import { Explorar } from "./features/explorar/Explorar";
import { Confirmacion } from "./features/publicar/Confirmacion";
import { PublicarProyecto } from "./features/publicar/PublicarProyecto";
import { MisSolicitudes } from "./features/solicitudes/MisSolicitudes";
import { services } from "./services";

type Ruta = "explorar" | "publicar" | "publicado" | "solicitudes";

const TITULO_RUTA: Record<Ruta, string> = {
  explorar: "Explorar proyectos",
  publicar: "Publicar proyecto",
  publicado: "Publicar proyecto",
  solicitudes: "Mis solicitudes",
};

function leerRuta(): Ruta {
  const r = window.location.hash.replace("#/", "");
  return (["explorar", "publicar", "publicado", "solicitudes"] as Ruta[]).includes(r as Ruta)
    ? (r as Ruta)
    : "explorar";
}

export default function App() {
  const [ruta, setRuta] = useState<Ruta>(leerRuta);
  const [publicado, setPublicado] = useState<ProjectDetails | null>(null);
  const [conteos, setConteos] = useState<Conteos>({
    enviadas: 0,
    recibidas: 0,
    pendientesPorResponder: 0,
  });

  // Vuelve a contar solicitudes. Se llama al abrir la app y cada vez que algo cambia
  // (enviar una solicitud, aceptar o rechazar), para que los contadores siempre suban o bajen.
  const refrescarConteos = useCallback(async () => {
    try {
      const [recibidas, enviadas] = await Promise.all([
        services.listReceivedRequests(),
        services.listSentRequests(),
      ]);
      setConteos({
        enviadas: enviadas.length,
        recibidas: recibidas.length,
        pendientesPorResponder: recibidas.filter((s) => s.status === "pending").length,
      });
    } catch {
      // Si falla, se mantienen los números anteriores.
    }
  }, []);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

  useEffect(() => {
    refrescarConteos();
  }, [ruta, refrescarConteos]);

  const ir = (r: Ruta) => {
    window.location.hash = `/${r}`;
    window.scrollTo(0, 0);
  };

  let pantalla;
  if (ruta === "publicado" && publicado) {
    pantalla = (
      <Confirmacion
        proyecto={publicado}
        onIrASolicitudes={() => ir("solicitudes")}
        onPublicarOtro={() => ir("publicar")}
      />
    );
  } else if (ruta === "solicitudes") {
    pantalla = (
      <MisSolicitudes
        onExplorar={() => ir("explorar")}
        onPublicar={() => ir("publicar")}
        onCambio={refrescarConteos}
      />
    );
  } else if (ruta === "explorar") {
    pantalla = <Explorar onPublicar={() => ir("publicar")} onSolicitudEnviada={refrescarConteos} />;
  } else {
    pantalla = (
      <PublicarProyecto
        onPublicado={(p) => {
          setPublicado(p);
          ir("publicado");
        }}
        onCancelar={() => ir("explorar")}
      />
    );
  }

  const activa = ruta === "publicado" ? "publicar" : ruta;

  return (
    <div className="app">
      <aside className="menu">
        <div className="marca">
          <span className="marca-logo" aria-hidden="true">
            W
          </span>
          <span className="marca-texto">
            <span className="marca-nombre">Warmi Connect</span>
            <span className="marca-lema">Conecta · Colabora · Impulsa</span>
          </span>
        </div>
        <nav aria-label="Menú principal">
          <a href="#/explorar" className={activa === "explorar" ? "activo" : ""}>
            <IconoExplorar clase="menu-icono" />
            Explorar proyectos
          </a>
          <a href="#/publicar" className={activa === "publicar" ? "activo" : ""}>
            <IconoPublicar clase="menu-icono" />
            Publicar proyecto
          </a>
          <a href="#/solicitudes" className={activa === "solicitudes" ? "activo" : ""}>
            <IconoSolicitudes clase="menu-icono" />
            Mis solicitudes
            {conteos.pendientesPorResponder > 0 && (
              <span className="insignia" aria-label={`${conteos.pendientesPorResponder} por responder`}>
                {conteos.pendientesPorResponder}
              </span>
            )}
          </a>
        </nav>
        <div className="menu-pie">
          <strong>Proyectos liderados por mujeres</strong>
          Visibiliza, conecta y potencia tu iniciativa.
        </div>
      </aside>

      <div className="principal">
        <header className="barra-superior">
          <span className="miga">
            Warmi Connect / <strong>{TITULO_RUTA[ruta]}</strong>
          </span>
          <span className="usuaria">
            <span className="avatar" aria-hidden="true">
              VM
            </span>
            Valeria Mendoza
          </span>
        </header>

        <div className="cuerpo">
          <main className="contenido">{pantalla}</main>
          <PanelLateral ruta={ruta} conteos={conteos} onIr={ir} />
        </div>
      </div>
    </div>
  );
}
