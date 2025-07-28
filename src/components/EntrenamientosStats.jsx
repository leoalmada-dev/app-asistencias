// src/components/EntrenamientosStats.jsx
import { useEffect, useState, useRef } from "react";
import { obtenerJugadores, obtenerEntrenamientos, obtenerEquipos } from "../hooks/useDB";
import { Table, Badge, Row, Col, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { exportarEstadisticasAExcel } from "../utils/exportarEstadisticas";
import { exportarGraficoComoPNG } from "../utils/exportarGraficoComoPNG";
import { FaFileExcel, FaDownload } from "react-icons/fa6";
import { FaUserCheck, FaRegCommentDots } from "react-icons/fa";
import { CATEGORIAS_POSICION } from "../data/posiciones";

const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

function getPosicionData(valor) {
    for (const cat of CATEGORIAS_POSICION) {
        const found = cat.posiciones.find(p => p.value === valor);
        if (found) return found;
    }
    return null;
}

export default function EntrenamientosStats() {
    const [estadisticas, setEstadisticas] = useState([]);
    const { equipoId } = useEquipo();

    // Año y mes actual por defecto
    const now = new Date();
    const [filtros, setFiltros] = useState({
        anio: now.getFullYear().toString(),
        mes: String(now.getMonth() + 1).padStart(2, '0'),
    });
    const [aniosDisponibles, setAniosDisponibles] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [orden, setOrden] = useState("numero");

    const graficoAsistenciasRef = useRef(null);

    useEffect(() => {
        obtenerEquipos().then(setEquipos);
    }, []);

    const equipoNombre = equipos.find(e => e.id === equipoId)?.nombre || "SinEquipo";
    const filtroMesNombre = filtros.mes ? NOMBRES_MESES[parseInt(filtros.mes, 10) - 1] : "Todos";
    const filtroAnio = filtros.anio || "Todos";
    const nombreArchivo = `Entrenamientos_${filtroMesNombre}_${filtroAnio}_${equipoNombre}`;
    const titulo = `Asistencias a Entrenamientos (${equipoNombre} - ${filtroMesNombre} ${filtroAnio})`;

    // Actualiza filtros disponibles según los entrenamientos del equipo
    useEffect(() => {
        const cargarFiltros = async () => {
            const entrenamientos = (await obtenerEntrenamientos()).filter(p => p.equipoId === equipoId);
            const anios = Array.from(new Set(entrenamientos.map(p => (p.fecha || "").substring(0, 4)))).filter(a => a);
            setAniosDisponibles(anios);
            if (filtros.anio) {
                const meses = Array.from(new Set(
                    entrenamientos
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
            let entrenamientos = (await obtenerEntrenamientos()).filter(p => p.equipoId === equipoId);

            if (filtros.anio) {
                entrenamientos = entrenamientos.filter(p => (p.fecha || "").startsWith(filtros.anio));
            }
            if (filtros.mes) {
                entrenamientos = entrenamientos.filter(p => (p.fecha || "").substring(5, 7) === filtros.mes);
            }

            const totalEntrenamientos = entrenamientos.length;

            const datos = jugadores.map((jugador) => {
                let asistencias = 0;
                let faltas = 0;
                let motivos = [];

                entrenamientos.forEach((entrenamiento) => {
                    const a = (entrenamiento.asistencias || []).find(x => x.jugadorId === jugador.id);
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
                    numero: jugador.numero,
                    posicion: jugador.posicion,
                    posicionSecundaria: jugador.posicionSecundaria,
                    asistencias,
                    faltas,
                    porcentaje: totalEntrenamientos > 0 ? Math.round((asistencias / totalEntrenamientos) * 100) : 0,
                    motivos
                };
            });

            setEstadisticas(datos);
        };

        cargarEstadisticas();
    }, [equipoId, filtros]);

    // Ordenamiento avanzado
    const datosOrdenados = [...estadisticas].sort((a, b) => {
        if (orden === "numero") {
            const numA = parseInt(a.numero) || 999;
            const numB = parseInt(b.numero) || 999;
            return numA - numB;
        }
        if (orden === "asistencias") return b.asistencias - a.asistencias;
        if (orden === "faltas") return b.faltas - a.faltas;
        if (orden === "porcentaje") return b.porcentaje - a.porcentaje;
        return 0;
    });

    // Para gráfico
    const datosGrafico = datosOrdenados.map(j => ({
        nombre: j.nombre,
        Asistencias: j.asistencias
    }));

    // Exportar tabla
    const handleExportarExcel = () => {
        exportarEstadisticasAExcel({
            datosTabla: datosOrdenados.map(j => ({
                Nombre: j.nombre,
                Número: j.numero,
                Posición: j.posicion,
                "Posición secundaria": j.posicionSecundaria,
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
                <Col md={12} lg={12}>
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
                                <ChartTooltip />
                                <Legend />
                                <Bar dataKey="Asistencias" fill="#0d6efd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex justify-content-end align-items-center mb-2">
                    <Form.Label className="mb-0 me-2">Ordenar por:</Form.Label>
                    <Form.Select
                        size="sm"
                        style={{ width: 180 }}
                        value={orden}
                        onChange={e => setOrden(e.target.value)}
                    >
                        <option value="numero">Número de camiseta</option>
                        <option value="asistencias">Asistencias</option>
                        <option value="faltas">Faltas</option>
                        <option value="porcentaje">% de asistencia</option>
                    </Form.Select>
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

            <Table striped bordered hover responsive size="sm" className="mt-2">
                <thead>
                    <tr className="text-center">
                        <th style={{ width: "5%" }} >#</th>
                        <th style={{ width: "33%" }}>Jugador</th>
                        <th style={{ width: "15%" }} >Posiciones</th>
                        <th style={{ width: "8%" }} >Asistencias</th>
                        <th style={{ width: "8%" }} >Faltas</th>
                        <th style={{ width: "13%" }} >% Asist.</th>
                        <th style={{ width: "5%" }} >Motivos</th>
                    </tr>
                </thead>
                <tbody>
                    {datosOrdenados.map((j, i) => {
                        const numero = j.numero ? `#${j.numero}` : "";
                        const pos1 = getPosicionData(j.posicion);
                        const pos2 = getPosicionData(j.posicionSecundaria);
                        return (
                            <tr key={j.id}>
                                <td className="text-center">{i + 1}</td>
                                <td>
                                    <b>
                                        {numero && <span className="me-1">{numero}</span>}
                                        {j.nombre}
                                    </b>
                                </td>
                                <td className="text-center">
                                    {pos1 && (
                                        <Badge
                                            bg={pos1.color}
                                            className="me-1"
                                            title={pos1.label}
                                            style={{ minWidth: 32 }}
                                        >
                                            {pos1.value}
                                        </Badge>
                                    )}
                                    {pos2 && pos2.value !== pos1?.value && (
                                        <Badge
                                            bg={pos2.color}
                                            title={pos2.label}
                                            style={{ minWidth: 32 }}
                                        >
                                            {pos2.value}
                                        </Badge>
                                    )}
                                </td>
                                <td className="text-center">
                                    <Badge bg="success" className="fs-6">
                                        {j.asistencias}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    {j.faltas > 0 && (
                                        <Badge bg="danger" className="fs-6">
                                            {j.faltas}
                                        </Badge>
                                    )}
                                </td>
                                <td className="text-center">
                                    <Badge bg={j.porcentaje >= 80 ? "success" : j.porcentaje >= 50 ? "warning" : "secondary"}>
                                        {j.porcentaje}%
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    {j.motivos.length > 0 &&
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip>
                                                    {j.motivos.map((m, idx) => (
                                                        <div key={idx}>• {m}</div>
                                                    ))}
                                                </Tooltip>
                                            }
                                        >
                                            <span>
                                                <FaRegCommentDots style={{ cursor: "pointer" }} />
                                            </span>
                                        </OverlayTrigger>
                                    }
                                </td>
                            </tr>
                        );
                    })}
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
