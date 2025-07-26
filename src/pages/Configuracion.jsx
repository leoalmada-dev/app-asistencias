// src/pages/Configuracion.jsx
import Jugadores from "./Jugadores";
import Equipos from "./Equipos";
import { Tabs, Tab } from "react-bootstrap";
import { FaUserFriends, FaDatabase } from "react-icons/fa"; // Íconos
import Backup from "../components/Backup";
import { FaShirt } from "react-icons/fa6";

export default function Configuracion() {
  return (
    <div className="container mt-4">
      <h3>Configuración del equipo</h3>
      <Tabs defaultActiveKey="jugadores" className="mb-3">
        <Tab
          eventKey="jugadores"
          title={
            <span className="d-flex align-items-center">
              <FaUserFriends className="me-2" />
              Jugadores
            </span>
          }
        >
          <Jugadores />
        </Tab>
        <Tab
          eventKey="equipos"
          title={
            <span className="d-flex align-items-center">
              <FaShirt className="me-2" />
              Equipos/Categorías
            </span>
          }
        >
          <Equipos />
        </Tab>
        <Tab
          eventKey="backup"
          title={
            <span className="d-flex align-items-center">
              <FaDatabase className="me-2" />
              Backup y restauración
            </span>
          }
        >
          <Backup />
        </Tab>
      </Tabs>
    </div>
  );
}
