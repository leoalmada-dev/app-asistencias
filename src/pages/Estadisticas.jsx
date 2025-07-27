import { Tabs, Tab } from "react-bootstrap";
import { FaFutbol,  FaChartBar } from "react-icons/fa";
import PartidosStats from "../components/PartidosStats";
import EntrenamientosStats from "../components/EntrenamientosStats";
import { FaDumbbell } from "react-icons/fa6";

export default function Estadisticas() {
    return (
        <div className="container mt-4">
            <h3 className="mb-3 d-flex align-items-center">
                <FaChartBar className="me-2" />
                Estadísticas del equipo
            </h3>
            <Tabs defaultActiveKey="partidos" className="mb-4" fill>
                <Tab
                    eventKey="partidos"
                    title={<span><FaFutbol className="me-2 mb-1" />Partidos</span>}
                >
                    <PartidosStats />
                </Tab>
                <Tab
                    eventKey="entrenamientos"
                    title={<span><FaDumbbell className="me-2 mb-1" />Entrenamientos</span>}
                >
                    <EntrenamientosStats />
                </Tab>
            </Tabs>
        </div>
    );
}
