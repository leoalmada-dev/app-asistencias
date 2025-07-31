// src/components/PartidosStats.jsx
import { useEffect, useState, useRef } from "react";
import { obtenerJugadores, obtenerPartidos, obtenerEquipos } from "../hooks/useDB";
import { Table, Badge, Row, Col, Form, Button } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { exportarEstadisticasAExcel } from "../utils/exportarEstadisticas";
import { exportarGraficoComoPNG } from "../utils/exportarGraficoComoPNG";
import { FaFileExcel, FaDownload, } from "react-icons/fa6";
import { CATEGORIAS_POSICION } from "../data/posiciones";
import { FaChartBar } from "react-icons/fa";

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

const COLS = [
    { key: "index", label: "#", width: "5%", align: "center", orderable: false },
    { key: "jugador", label: "Jugador", width: "27%", align: "start", orderable: true },
    { key: "numero", label: "Nro", width: "7%", align: "center", orderable: true },
    { key: "posiciones", label: "Posiciones", width: "13%", align: "center", orderable: true },
    { key: "minutosTotales", label: "Minutos", width: "11%", align: "center", orderable: true },
    { key: "partidosJugados", label: "Partidos", width: "8%", align: "center", orderable: true },
    { key: "promedioMin", label: "min/partido", width: "12%", align: "center", orderable: true },
    { key: "goles", label: "Goles", width: "7%", align: "center", orderable: true },
    { key: "porcentaje", label: "%Jugados", width: "8%", align: "center", orderable: true }
];

export default function PartidosStats() {
    const [estadisticas, setEstadisticas] = useState([]);
    const [orden, setOrden] = useState("jugador");
    const [sortDir, setSortDir] = useState("asc");
    const { equipoId } = useEquipo();

    const [resumen, setResumen] = useState({
        totalPartidos: 0,
        totalGoles: 0,
        totalGolesContra: 0,
    });

    // Año, mes y torneo actuales por defecto
    const now = new Date();
    const [filtros, setFiltros] = useState({
        anio: now.getFullYear().toString(),
        mes: String(now.getMonth() + 1).padStart(2, '0'),
    });
    const [filtroTorneo, setFiltroTorneo] = useState("");
    const [aniosDisponibles, setAniosDisponibles] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [torneosDisponibles, setTorneosDisponibles] = useState([]);
    const [equipos, setEquipos] = useState([]);

    const graficoMinutosRef = useRef(null);
    const graficoGolesRef = useRef(null);

    useEffect(() => {
        obtenerEquipos().then(setEquipos);
    }, []);

    const equipoNombre = equipos.find(e => e.id === equipoId)?.nombre || "SinEquipo";
    const filtroMesNombre = filtros.mes ? NOMBRES_MESES[parseInt(filtros.mes, 10) - 1] : "Todos";
    const filtroAnio = filtros.anio || "Todos";
    const filtroTorneoNombre = filtroTorneo || "Todos";
    const nombreArchivo = `Partidos_${filtroMesNombre}_${filtroAnio}_${filtroTorneoNombre}_${equipoNombre}`;
    const titulo = `Estadísticas de Partidos (${equipoNombre} - ${filtroMesNombre} ${filtroAnio}${filtroTorneo ? " - " + filtroTorneo : ""})`;

    // Filtros año/mes/campeonato
    useEffect(() => {
        const cargarFiltros = async () => {
            const partidos = (await obtenerPartidos()).filter(p => p.equipoId === equipoId);
            const anios = Array.from(new Set(partidos.map(p => (p.fecha || "").substring(0, 4)))).filter(a => a);
            setAniosDisponibles(anios);
            let partidosFiltrados = partidos;
            if (filtros.anio) {
                partidosFiltrados = partidosFiltrados.filter(p => (p.fecha || "").startsWith(filtros.anio));
            }
            if (filtros.mes) {
                partidosFiltrados = partidosFiltrados.filter(p => (p.fecha || "").substring(5, 7) === filtros.mes);
            }
            const meses = Array.from(new Set(
                partidos.filter(p => (p.fecha || "").startsWith(filtros.anio)).map(p => (p.fecha || "").substring(5, 7))
            ));
            setMesesDisponibles(meses.filter(m => m));
            const torneosUnicos = Array.from(new Set(partidosFiltrados.map(p => p.torneo).filter(Boolean)));
            setTorneosDisponibles(torneosUnicos);
        };
        cargarFiltros();
    }, [equipoId, filtros.anio, filtros.mes]);

    // Estadísticas filtradas y cálculo
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
            if (filtroTorneo) {
                partidos = partidos.filter(p => p.torneo === filtroTorneo);
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
    }, [equipoId, filtros, filtroTorneo]);

    // Ordenación
    const datosOrdenados = [...estadisticas].sort((a, b) => {
        if (orden === "numero") {
            const numA = parseInt(a.numero) || 999;
            const numB = parseInt(b.numero) || 999;
            return sortDir === "asc" ? numA - numB : numB - numA;
        }
        if (orden === "jugador") {
            return sortDir === "asc"
                ? (a.nombre || "").localeCompare(b.nombre || "")
                : (b.nombre || "").localeCompare(a.nombre || "");
        }
        if (orden === "minutosTotales") return sortDir === "asc" ? a.minutosTotales - b.minutosTotales : b.minutosTotales - a.minutosTotales;
        if (orden === "goles") return sortDir === "asc" ? a.goles - b.goles : b.goles - a.goles;
        if (orden === "porcentaje") return sortDir === "asc" ? a.porcentaje - b.porcentaje : b.porcentaje - a.porcentaje;
        if (orden === "partidosJugados") return sortDir === "asc" ? a.partidosJugados - b.partidosJugados : b.partidosJugados - a.partidosJugados;
        if (orden === "posiciones") {
            // Orden por posición principal (según el orden en CATEGORIAS_POSICION)
            const posA = getPosicionData(a.posicion);
            const posB = getPosicionData(b.posicion);
            if (!posA && !posB) return 0;
            if (!posA) return 1;
            if (!posB) return -1;
            const idxA = CATEGORIAS_POSICION.flatMap(cat => cat.posiciones).findIndex(p => p.value === posA.value);
            const idxB = CATEGORIAS_POSICION.flatMap(cat => cat.posiciones).findIndex(p => p.value === posB.value);
            return sortDir === "asc" ? idxA - idxB : idxB - idxA;
        }
        return 0;
    });

    // Para gráficos (ordenados igual que la tabla)
    const datosGraficoMinutos = datosOrdenados.map(j => ({
        nombre: j.numero ? `#${j.numero} ${j.nombre}` : j.nombre,
        Minutos: j.minutosTotales
    }));
    const datosGraficoGoles = datosOrdenados.map(j => ({
        nombre: j.numero ? `#${j.numero} ${j.nombre}` : j.nombre,
        Goles: j.goles
    }));

    // Exportar tabla
    const handleExportarExcel = () => {
        const datosTabla = datosOrdenados.map((j, i) => ({
            "#": i + 1,
            "Jugador": j.nombre,
            "Nro": j.numero || "-",
            "Posición Principal": getPosicionData(j.posicion)?.label || "-",
            "Posición Secundaria": getPosicionData(j.posicionSecundaria)?.label || "-",
            "Minutos Totales": j.minutosTotales,
            "Partidos Jugados": j.partidosJugados,
            "Promedio Min/Partido": j.promedioMin,
            "Goles": j.goles,
            "% Partidos Jugados": `${j.porcentaje}%`,
        }));

        exportarEstadisticasAExcel({
            datosTabla,
            nombreArchivo,
            titulo,
            resumen: {
                "Partidos Jugados": resumen.totalPartidos,
                "Goles a Favor": resumen.totalGoles,
                "Goles en Contra": resumen.totalGolesContra
            }
        });
    };

    // Exportar gráficos (por separado)
    const handleExportarGraficoMinutos = () => {
        exportarGraficoComoPNG(graficoMinutosRef, `Minutos_${equipoNombre}_${filtroMesNombre}_${filtroAnio}`);
    };
    const handleExportarGraficoGoles = () => {
        exportarGraficoComoPNG(graficoGolesRef, `Goles_${equipoNombre}_${filtroMesNombre}_${filtroAnio}`);
    };

    // Icono sort SOLO en la columna activa
    const renderSortIcon = (colKey) => {
        if (orden !== colKey) return null;
        return (
            <span style={{ fontSize: "1em", marginLeft: 3, color: "#0066cc" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div>
            <h4 className="mb-3 d-flex align-items-center">
                <FaChartBar className="me-2" />
                Estadísticas de partidos
            </h4>

            {/* Filtros */}
            <div className="row g-2 align-items-end mb-4">
                {/* Año */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column">
                        <Form.Label className="mb-1 text-secondary fw-semibold" style={{ opacity: 0.8, fontSize: "0.90em" }}>Año:</Form.Label>
                        <Form.Select
                            size="sm"
                            value={filtros.anio}
                            onChange={e => setFiltros(f => ({ ...f, anio: e.target.value, mes: "" }))}
                        >
                            <option value="">Todos</option>
                            {aniosDisponibles.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </Form.Select>
                    </div>
                </div>
                {/* Mes */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column">
                        <Form.Label className="mb-1 text-secondary fw-semibold" style={{ opacity: 0.8, fontSize: "0.90em" }}>Mes:</Form.Label>
                        <Form.Select
                            size="sm"
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
                </div>
                {/* Campeonato */}
                {torneosDisponibles.length > 0 && (
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-column mt-2 mt-md-0">
                            <Form.Label className="mb-1 text-secondary fw-semibold" style={{ opacity: 0.8, fontSize: "0.90em" }}>Campeonato:</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filtroTorneo}
                                onChange={e => setFiltroTorneo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {torneosDisponibles.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                )}
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
                            <BarChart data={datosGraficoMinutos} margin={{ left: -20 }}>
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
                            <BarChart data={datosGraficoGoles} margin={{ left: -20 }}>
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
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />
            {/* Tabla ajustada y ordenable */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0 me-3">Listado de jugadores</h5>
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
                    <tr>
                        {COLS.map(col => (
                            <th
                                key={col.key}
                                style={{
                                    width: col.width,
                                    cursor: col.orderable ? "pointer" : "default",
                                    userSelect: "none",
                                    background: "var(--bs-body-bg)",
                                    verticalAlign: "middle"
                                }}
                                className={
                                    "align-middle " +
                                    (
                                        col.align === "center"
                                            ? "text-center"
                                            : col.align === "start"
                                                ? "text-start"
                                                : ""
                                    ) +
                                    " bg-body-tertiary"
                                }
                                onClick={() => {
                                    if (!col.orderable) return;
                                    if (orden === col.key) {
                                        setSortDir(d => (d === "asc" ? "desc" : "asc"));
                                    } else {
                                        setOrden(col.key);
                                        setSortDir("asc");
                                    }
                                }}
                                role={col.orderable ? "button" : undefined}
                                tabIndex={col.orderable ? 0 : undefined}
                            >
                                {col.label}
                                {col.orderable && renderSortIcon(col.key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {datosOrdenados.map((j, i) => {
                        const pos1 = getPosicionData(j.posicion);
                        const pos2 = getPosicionData(j.posicionSecundaria);
                        return (
                            <tr key={j.id}>
                                <td className="text-center">{i + 1}</td>
                                <td className="text-start">
                                    <b>
                                        {j.nombre}
                                    </b>
                                </td>
                                <td className="text-center">
                                    {j.numero ? <b>#{j.numero}</b> : <span className="text-muted">–</span>}
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
                                <td className="text-center">{j.minutosTotales}</td>
                                <td className="text-center">{j.partidosJugados}</td>
                                <td className="text-center">{j.promedioMin}</td>
                                <td className="text-center">
                                    {j.goles > 0
                                        ? <Badge bg="success" className="fs-6">{j.goles} ⚽</Badge>
                                        : <span className="text-muted">-</span>}
                                </td>
                                <td className="text-center">
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
                    <b>Tip:</b> Hacé clic en el encabezado para ordenar la tabla. Exportá la tabla o los gráficos desde los íconos de la derecha.
                </span>
            </div>
        </div>
    );
}
