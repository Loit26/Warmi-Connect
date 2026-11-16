// Estructura general: menú lateral + pantalla activa.
// Navegación simple por "#" en la URL para no agregar librerías.
// "Explorar proyectos" es el módulo de C: aquí solo hay un espacio reservado.
import { useEffect, useState } from "react";
import type { ProjectDetails } from "./contracts/models";
import { Confirmacion } from "./features/publicar/Confirmacion";
import { PublicarProyecto } from "./features/publicar/PublicarProyecto";
import { MisSolicitudes } from "./features/solicitudes/MisSolicitudes";

type Ruta = "explorar" | "publicar" | "publicado" | "solicitudes";

function leerRuta(): Ruta {
  const r = window.location.hash.replace("#/", "");
  return (["explorar", "publicar", "publicado", "solicitudes"] as Ruta[]).includes(r as Ruta)
    ? (r as Ruta)
    : "publicar";
}

export default function App() {
  const [ruta, setRuta] = useState<Ruta>(leerRuta);
  const [publicado, setPublicado] = useState<ProjectDetails | null>(null);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

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
    pantalla = <MisSolicitudes onExplorar={() => ir("explorar")} onPublicar={() => ir("publicar")} />;
  } else if (ruta === "explorar") {
    pantalla = (
      <section className="pagina">
        <h1>Explorar proyectos</h1>
        <p className="subtitulo">Este módulo lo desarrolla C (catálogo, filtros y detalle).</p>
      </section>
    );
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
          <span className="marca-nombre">Warmi Connect</span>
          <span className="marca-lema">Conecta · Colabora · Impulsa</span>
        </div>
        <nav>
          <a href="#/explorar" className={activa === "explorar" ? "activo" : ""}>
            Explorar proyectos
          </a>
          <a href="#/publicar" className={activa === "publicar" ? "activo" : ""}>
            Publicar proyecto
          </a>
          <a href="#/solicitudes" className={activa === "solicitudes" ? "activo" : ""}>
            Mis solicitudes
          </a>
        </nav>
      </aside>
      <main className="contenido">{pantalla}</main>
    </div>
  );
}
