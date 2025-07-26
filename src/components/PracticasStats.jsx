// src/components/PracticasStats.jsx
import { useEffect, useState, useRef } from "react";
import { obtenerJugadores, obtenerPracticas, obtenerEquipos } from "../hooks/useDB";
import { Table, Badge, Row, Col, Form, Button } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { exportarEstadisticasAExcel } from "../utils/exportarEstadisticas";
import { exportarGraficoComoPNG } from "../utils/exportarGraficoComoPNG";
import { FaFileExcel, FaDownload } from "react-icons/fa6";
import { FaUserCheck } from "react-icons/fa";

const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function PracticasStats() {
    const [estadisticas, setEstadisticas] = useState([]);
    const { equipoId } = useEquipo();

    const [filtros, setFiltros] = useState({
        anio: "",
        mes: "",
    });
    const [aniosDisponibles, setAniosDisponibles] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [equipos, setEquipos] = useState([]);

    const graficoAsistenciasRef = useRef(null);

    useEffect(() => {
        obtenerEquipos().then(setEquipos);
    }, []);

    // Estos valores se deben definir antes de usarlos en nombreArchivo y titulo
    const equipoNombre = equipos.find(e => e.id === equipoId)?.nombre || "SinEquipo";
    const filtroMesNombre = filtros.mes ? NOMBRES_MESES[parseInt(filtros.mes, 10) - 1] : "Todos";
    const filtroAnio = filtros.anio || "Todos";
    const nombreArchivo = `Practicas_${filtroMesNombre}_${filtroAnio}_${equipoNombre}`;
    const titulo = `Asistencias a Prácticas (${equipoNombre} - ${filtroMesNombre} ${filtroAnio})`;

    // Actualiza filtros disponibles según las prácticas del equipo
    useEffect(() => {
        const cargarFiltros = async () => {
            const practicas = (await obtenerPracticas()).filter(p => p.equipoId === equipoId);
            const anios = Array.from(new Set(practicas.map(p => (p.fecha || "").substring(0, 4)))).filter(a => a);
            setAniosDisponibles(anios);
            if (filtros.anio) {
                const meses = Array.from(new Set(
                    practicas
                        .filter(p => (p.fecha || "").startsWith(filtros.anio))
                        .map(p => (p.fecha || "").substring(5, 7))
                ));
                setMesesDisponibles(meses.filter(m => m));
            }
        };
        cargarFiltros();
    }, [equipoId, filtros.anio]);

    useEffect(() => {
        const cargarEstadisticas = async () => {
            const jugadores = (await obtenerJugadores()).filter(j => j.equipoId === equipoId);
            let practicas = (await obtenerPracticas()).filter(p => p.equipoId === equipoId);

            if (filtros.anio) {
                practicas = practicas.filter(p => (p.fecha || "").startsWith(filtros.anio));
            }
            if (filtros.mes) {
                practicas = practicas.filter(p => (p.fecha || "").substring(5, 7) === filtros.mes);
            }

            const totalPracticas = practicas.length;

            const datos = jugadores.map((jugador) => {
                let asistencias = 0;
                let faltas = 0;
                let motivos = [];

                practicas.forEach((practica) => {
                    const a = (practica.asistencias || []).find(x => x.jugadorId === jugador.id);
                    if (a) {
                        if (a.presente) {
                            asistencias++;
                        } else {
                            faltas++;
                            if (a.motivo) motivos.push(a.motivo);
                        }
                    }
                });

                return {
                    id: jugador.id,
                    nombre: jugador.nombre,
                    posicion: jugador.posicion,
                    asistencias,
                    faltas,
                    porcentaje: totalPracticas > 0 ? Math.round((asistencias / totalPracticas) * 100) : 0,
                    motivos
                };
            });

            setEstadisticas(datos);
        };

        cargarEstadisticas();
    }, [equipoId, filtros]);

    // Para gráfico
    const datosGrafico = estadisticas.map(j => ({
        nombre: j.nombre,
        Asistencias: j.asistencias
    }));

    // Exportar tabla
    const handleExportarExcel = () => {
        exportarEstadisticasAExcel({
            datosTabla: estadisticas.map(j => ({
                Nombre: j.nombre,
                Posición: j.posicion,
                Asistencias: j.asistencias,
                Faltas: j.faltas,
                "% Asistencia": j.porcentaje + "%",
                Motivos: j.motivos.join("; "),
            })),
            nombreArchivo,
            titulo
        });
    };

    // Exportar gráfico
    const handleExportarGrafico = () => {
        exportarGraficoComoPNG(graficoAsistenciasRef, nombreArchivo);
    };

    return (
        <div>
            <h4 className="mb-3 d-flex align-items-center">
                <FaUserCheck className="me-2" />
                Asistencias
            </h4>

            {/* Filtros */}
            <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
                <Form.Label className="mb-0">Año:</Form.Label>
                <Form.Select
                    size="sm"
                    style={{ width: 120 }}
                    value={filtros.anio}
                    onChange={e => setFiltros(f => ({ ...f, anio: e.target.value, mes: "" }))}
                >
                    <option value="">Todos</option>
                    {aniosDisponibles.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </Form.Select>
                <Form.Label className="mb-0">Mes:</Form.Label>
                <Form.Select
                    size="sm"
                    style={{ width: 140 }}
                    value={filtros.mes}
                    onChange={e => setFiltros(f => ({ ...f, mes: e.target.value }))}
                    disabled={!filtros.anio}
                >
                    <option value="">Todos</option>
                    {mesesDisponibles.map(m => (
                        <option key={m} value={m}>
                            {NOMBRES_MESES[parseInt(m, 10) - 1] || m}
                        </option>
                    ))}
                </Form.Select>
            </div>

            {/* Gráfico */}
            <Row className="mb-4">
                <Col md={8} lg={6}>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">Asistencias por jugador</h6>
                        <Button
                            variant="link"
                            className="p-0 ms-2"
                            title="Descargar gráfico de asistencias"
                            onClick={handleExportarGrafico}
                        >
                            <FaDownload size={22} color="#0d6efd" />
                        </Button>
                    </div>
                    <div ref={graficoAsistenciasRef}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={datosGrafico} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Asistencias" fill="#0d6efd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            {/* Tabla + Exportar */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <Form.Label className="mb-0">Jugadores</Form.Label>
                </div>
                <Button
                    size="sm"
                    variant="link"
                    className="p-0"
                    style={{ textDecoration: "none" }}
                    title="Exportar tabla a Excel"
                    onClick={handleExportarExcel}
                >
                    <FaFileExcel size={26} color="#28a745" />
                </Button>
            </div>

            <Table striped bordered hover responsive className="mt-2">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Posición</th>
                        <th>Asistencias</th>
                        <th>Faltas</th>
                        <th>% Asistencia</th>
                        <th>Motivos de faltas</th>
                    </tr>
                </thead>
                <tbody>
                    {estadisticas.map((j) => (
                        <tr key={j.id}>
                            <td><b>{j.nombre}</b></td>
                            <td>{j.posicion}</td>
                            <td>
                                {j.asistencias > 0
                                    ? <Badge bg="primary" className="fs-6">{j.asistencias}</Badge>
                                    : <span className="text-muted">-</span>}
                            </td>
                            <td>
                                {j.faltas > 0
                                    ? <Badge bg="danger" className="fs-6">{j.faltas}</Badge>
                                    : <span className="text-muted">-</span>}
                            </td>
                            <td>
                                <Badge bg={j.porcentaje >= 80 ? "success" : j.porcentaje >= 50 ? "warning" : "secondary"}>
                                    {j.porcentaje}%
                                </Badge>
                            </td>
                            <td style={{ fontSize: "0.95em" }}>
                                {j.motivos.length > 0
                                    ? j.motivos.join("; ")
                                    : <span className="text-muted">-</span>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="mt-3 small text-secondary">
                <span>
                    <b>Tip:</b> Filtrá por mes y año, exportá la tabla (Excel) y descargá el gráfico en PNG.
                </span>
            </div>
        </div>
    );
}
