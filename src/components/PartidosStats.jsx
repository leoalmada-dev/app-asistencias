import { useEffect, useState, useRef } from "react";
import { obtenerJugadores, obtenerPartidos, obtenerEquipos } from "../hooks/useDB";
import { Table, Badge, Row, Col, Form, Button } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { exportarEstadisticasAExcel } from "../utils/exportarEstadisticas";
import { exportarGraficoComoPNG } from "../utils/exportarGraficoComoPNG";
import { FaFileExcel, FaDownload, FaChartBar } from "react-icons/fa6";
import { CATEGORIAS_POSICION } from "../data/posiciones";

const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function PartidosStats() {
    const [estadisticas, setEstadisticas] = useState([]);
    const [orden, setOrden] = useState("numero");
    const { equipoId } = useEquipo();

    const [resumen, setResumen] = useState({
        totalPartidos: 0,
        totalGoles: 0,
        totalGolesContra: 0,
    });

    // Selección automática de año y mes actual
    const now = new Date();
    const [filtros, setFiltros] = useState({
        anio: now.getFullYear().toString(),
        mes: String(now.getMonth() + 1).padStart(2, '0'),
    });
    const [aniosDisponibles, setAniosDisponibles] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [equipos, setEquipos] = useState([]);

    const graficoMinutosRef = useRef(null);
    const graficoGolesRef = useRef(null);

    useEffect(() => {
        obtenerEquipos().then(setEquipos);
    }, []);

    const equipoNombre = equipos.find(e => e.id === equipoId)?.nombre || "SinEquipo";
    const filtroMesNombre = filtros.mes ? NOMBRES_MESES[parseInt(filtros.mes, 10) - 1] : "Todos";
    const filtroAnio = filtros.anio || "Todos";
    const nombreArchivo = `Partidos_${filtroMesNombre}_${filtroAnio}_${equipoNombre}`;
    const titulo = `Estadísticas de Partidos (${equipoNombre} - ${filtroMesNombre} ${filtroAnio})`;

    useEffect(() => {
        const cargarFiltros = async () => {
            const partidos = (await obtenerPartidos()).filter(p => p.equipoId === equipoId);
            const anios = Array.from(new Set(partidos.map(p => (p.fecha || "").substring(0, 4)))).filter(a => a);
            setAniosDisponibles(anios);
            if (filtros.anio) {
                const meses = Array.from(new Set(
                    partidos
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
            let partidos = (await obtenerPartidos()).filter(p => p.equipoId === equipoId);

            if (filtros.anio) {
                partidos = partidos.filter(p => (p.fecha || "").startsWith(filtros.anio));
            }
            if (filtros.mes) {
                partidos = partidos.filter(p => (p.fecha || "").substring(5, 7) === filtros.mes);
            }

            let totalGoles = 0;
            let totalGolesContra = 0;

            partidos.forEach((partido) => {
                totalGoles += Number(partido.golesFavor) || 0;
                totalGolesContra += Number(partido.golesContra) || 0;
            });

            const totalPartidos = partidos.length;

            const datos = jugadores.map((jugador) => {
                let minutosTotales = 0;
                let partidosJugados = 0;
                let goles = 0;

                partidos.forEach((partido) => {
                    let jugoEste = false;
                    partido.participaciones?.forEach((p) => {
                        if (parseInt(p.jugadorId) === jugador.id) {
                            const entrada = parseInt(p.minutoEntrada) || 0;
                            const salida = parseInt(p.minutoSalida) || 0;
                            minutosTotales += Math.max(0, salida - entrada);
                            if (!jugoEste) partidosJugados++;
                            jugoEste = true;
                            if (p.goles) goles += parseInt(p.goles) || 0;
                        }
                    });
                });

                return {
                    id: jugador.id,
                    nombre: jugador.nombre,
                    numero: jugador.numero,
                    posicion: jugador.posicion,
                    posicionSecundaria: jugador.posicionSecundaria,
                    minutosTotales,
                    partidosJugados,
                    promedioMin: partidosJugados ? Math.round(minutosTotales / partidosJugados) : 0,
                    goles,
                    porcentaje: totalPartidos ? Math.round((partidosJugados / totalPartidos) * 100) : 0,
                };
            });

            setEstadisticas(datos);

            setResumen({
                totalPartidos,
                totalGoles,
                totalGolesContra
            });
        };

        cargarEstadisticas();
    }, [equipoId, filtros]);

    const datosOrdenados = [...estadisticas].sort((a, b) => {
        if (orden === "numero") {
            const numA = parseInt(a.numero) || 999;
            const numB = parseInt(b.numero) || 999;
            return numA - numB;
        }
        if (orden === "minutosTotales") return b.minutosTotales - a.minutosTotales;
        if (orden === "goles") return b.goles - a.goles;
        if (orden === "porcentaje") return b.porcentaje - a.porcentaje;
        return b.partidosJugados - a.partidosJugados;
    });

    // Exportar tabla
    const handleExportarExcel = () => {
        exportarEstadisticasAExcel({
            datosTabla: datosOrdenados.map(j => ({
                Nombre: j.nombre,
                Posición: j.posicion,
                Minutos: j.minutosTotales,
                Partidos: j.partidosJugados,
                "Prom. min/partido": j.promedioMin,
                Goles: j.goles,
                "% Partidos jugados": j.porcentaje + "%",
            })),
            nombreArchivo,
            titulo
        });
    };

    // Exportar gráficos (por separado)
    const handleExportarGraficoMinutos = () => {
        exportarGraficoComoPNG(graficoMinutosRef, `Minutos_${equipoNombre}_${filtroMesNombre}_${filtroAnio}`);
    };
    const handleExportarGraficoGoles = () => {
        exportarGraficoComoPNG(graficoGolesRef, `Goles_${equipoNombre}_${filtroMesNombre}_${filtroAnio}`);
    };

    function getPosicionData(valor) {
        for (const cat of CATEGORIAS_POSICION) {
            const found = cat.posiciones.find(p => p.value === valor);
            if (found) return found;
        }
        return null;
    }

    return (
        <div>
            <h4 className="mb-3 d-flex align-items-center">
                <FaChartBar className="me-2" />
                Estadísticas de partidos
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

            {/* Resumen */}
            <Row className="mb-4">
                <Col md={4}>
                    <Badge bg="primary" className="fs-6 p-2 w-100 my-1">
                        Partidos jugados: <b>{resumen.totalPartidos}</b>
                    </Badge>
                </Col>
                <Col md={4}>
                    <Badge bg="success" className="fs-6 p-2 w-100 my-1">
                        Goles a favor: <b>{resumen.totalGoles}</b>
                    </Badge>
                </Col>
                <Col md={4}>
                    <Badge bg="danger" className="fs-6 p-2 w-100 my-1">
                        Goles en contra: <b>{resumen.totalGolesContra}</b>
                    </Badge>
                </Col>
            </Row>

            {/* Gráficos */}
            <Row className="mb-4">
                <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">Minutos jugados por jugador</h6>
                        <Button
                            variant="link"
                            className="p-0 ms-2"
                            title="Descargar gráfico de minutos"
                            onClick={handleExportarGraficoMinutos}
                        >
                            <FaDownload size={22} color="#0d6efd" />
                        </Button>
                    </div>
                    <div ref={graficoMinutosRef}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={estadisticas.map(j => ({ nombre: j.nombre, Minutos: j.minutosTotales }))} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Minutos" fill="#0d6efd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">Goles por jugador</h6>
                        <Button
                            variant="link"
                            className="p-0 ms-2"
                            title="Descargar gráfico de goles"
                            onClick={handleExportarGraficoGoles}
                        >
                            <FaDownload size={22} color="#20c997" />
                        </Button>
                    </div>
                    <div ref={graficoGolesRef}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={estadisticas.map(j => ({ nombre: j.nombre, Goles: j.goles }))} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Goles" fill="#20c997" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            {/* Tabla ajustada y numerada */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <Form.Label className="mb-0">Ordenar por:</Form.Label>
                    <Form.Select
                        size="sm"
                        style={{ width: 180, display: "inline-block", marginLeft: 8 }}
                        value={orden}
                        onChange={e => setOrden(e.target.value)}
                    >
                        <option value="numero">Número de camiseta</option>
                        <option value="minutosTotales">Minutos jugados</option>
                        <option value="goles">Goles convertidos</option>
                        <option value="partidosJugados">Partidos jugados</option>
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

            <Table striped bordered hover responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th style={{ width: "5%" }} className="text-center">#</th>
                        <th style={{ width: "22%" }}>Jugador</th>
                        <th style={{ width: "18%" }}>Posiciones</th>
                        <th style={{ width: "11%" }}>Minutos</th>
                        <th style={{ width: "9%" }}>Partidos</th>
                        <th style={{ width: "12%" }}>Prom. min/partido</th>
                        <th style={{ width: "8%" }}>Goles</th>
                        <th style={{ width: "12%" }}>% Jugados</th>
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
                                <td>
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
                                <td>{j.minutosTotales}</td>
                                <td>{j.partidosJugados}</td>
                                <td>{j.promedioMin}</td>
                                <td>
                                    {j.goles > 0
                                        ? <Badge bg="success" className="fs-6">{j.goles} ⚽</Badge>
                                        : <span className="text-muted">-</span>}
                                </td>
                                <td>
                                    <Badge bg={j.porcentaje >= 80 ? "success" : j.porcentaje >= 50 ? "warning" : "secondary"}>
                                        {j.porcentaje}%
                                    </Badge>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <div className="mt-3 small text-secondary">
                <span>
                    <b>Tip:</b> Podés filtrar por mes y año, exportar la tabla (Excel) y descargar cada gráfico en PNG.
                </span>
            </div>
        </div>
    );
}
