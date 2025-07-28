// src/pages/Configuracion.jsx
import Jugadores from "./Jugadores";
import Equipos from "./Equipos";
import Campeonatos from "./Campeonatos"; // 👈 NUEVO
import { Tabs, Tab } from "react-bootstrap";
import { FaUserFriends, FaDatabase } from "react-icons/fa";
import { FaShirt, FaTrophy } from "react-icons/fa6";
import Backup from "../components/Backup";

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
        {/* ⬇️ Nueva Tab Campeonatos */}
        <Tab
          eventKey="campeonatos"
          title={
            <span className="d-flex align-items-center">
              <FaTrophy className="me-2" />
              Campeonatos
            </span>
          }
        >
          <Campeonatos />
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
