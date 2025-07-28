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

// --- Para mantener el orden de posiciones ---
const POSICION_ORDEN = (() => {
    let orden = {};
    let idx = 0;
    for (const cat of CATEGORIAS_POSICION) {
        for (const p of cat.posiciones) {
            orden[p.value] = idx++;
        }
    }
    return orden;
})();

const COLS = [
    { key: "nombre", label: "Jugador", width: "23%", align: "start", orderable: true },
    { key: "numero", label: "Nro", width: "7%", align: "center", orderable: true },
    { key: "posiciones", label: "Posiciones", width: "14%", align: "center", orderable: true },
    { key: "minutosTotales", label: "Minutos", width: "12%", align: "center", orderable: true },
    { key: "partidosJugados", label: "Partidos", width: "10%", align: "center", orderable: true },
    { key: "promedioMin", label: "Prom. min/partido", width: "13%", align: "center", orderable: true },
    { key: "goles", label: "Goles", width: "8%", align: "center", orderable: true },
    { key: "porcentaje", label: "% Jugados", width: "8%", align: "center", orderable: true },
];

export default function PartidosStats() {
    const [estadisticas, setEstadisticas] = useState([]);
    const [sortBy, setSortBy] = useState("nombre");
    const [sortDir, setSortDir] = useState("asc");
    const { equipoId } = useEquipo();

    const [resumen, setResumen] = useState({
        totalPartidos: 0,
        totalGoles: 0,
        totalGolesContra: 0,
    });

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

    // --- ORDENAMIENTO Y DATOS ORDENADOS ---
    const datosOrdenados = [...estadisticas].sort((a, b) => {
        let valA, valB;
        if (sortBy === "numero") {
            valA = parseInt(a.numero) || 999;
            valB = parseInt(b.numero) || 999;
        } else if (sortBy === "nombre") {
            valA = (a.nombre || "").toLowerCase();
            valB = (b.nombre || "").toLowerCase();
        } else if (sortBy === "posiciones") {
            // Ordenar por POSICION_ORDEN de la principal, o secundaria si no tiene principal
            const pa = a.posicion && POSICION_ORDEN[a.posicion] !== undefined ? POSICION_ORDEN[a.posicion] : 999;
            const sa = a.posicionSecundaria && POSICION_ORDEN[a.posicionSecundaria] !== undefined ? POSICION_ORDEN[a.posicionSecundaria] : 999;
            const pb = b.posicion && POSICION_ORDEN[b.posicion] !== undefined ? POSICION_ORDEN[b.posicion] : 999;
            const sb = b.posicionSecundaria && POSICION_ORDEN[b.posicionSecundaria] !== undefined ? POSICION_ORDEN[b.posicionSecundaria] : 999;
            valA = Math.min(pa, sa);
            valB = Math.min(pb, sb);
        } else if (sortBy === "minutosTotales" || sortBy === "promedioMin" || sortBy === "goles" || sortBy === "partidosJugados" || sortBy === "porcentaje") {
            valA = a[sortBy] ?? 0;
            valB = b[sortBy] ?? 0;
        } else {
            valA = 0; valB = 0;
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    // --- DATOS PARA LOS GRÁFICOS ORDENADOS SEGÚN LA TABLA ---
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
        exportarEstadisticasAExcel({
            datosTabla: datosOrdenados.map(j => ({
                Nombre: j.nombre,
                "Nro": j.numero || "-",
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

    // --- Renderiza la flecha SOLO si es la columna activa ---
    const renderSortIcon = (colKey) => {
        if (sortBy !== colKey) return null;
        return (
            <span style={{ fontSize: "1em", marginLeft: 4, color: "#1976d2" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    // --- Para sincronizar el select con los headers ---
    const handleSelectOrden = (e) => setSortBy(e.target.value);

    useEffect(() => {
        // Siempre que cambia sortBy desde el select, que sea asc por defecto (menos partidos/goles/minutos: desc)
        if (["minutosTotales", "goles", "partidosJugados", "porcentaje", "promedioMin"].includes(sortBy)) {
            setSortDir("desc");
        } else {
            setSortDir("asc");
        }
    }, [sortBy]);

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

            {/* Tabla ordenable */}
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

            <Table striped bordered hover responsive size="sm" className="mt-3">
                <thead>
                    <tr className="text-center">
                        <th style={{ width: "5%" }}>#</th>
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
                                    if (sortBy === col.key) {
                                        setSortDir(d => (d === "asc" ? "desc" : "asc"));
                                    } else {
                                        setSortBy(col.key);
                                        setSortDir(col.key === "nombre" ? "asc" : "desc");
                                    }
                                }}
                                role={col.orderable ? "button" : undefined}
                                tabIndex={col.orderable ? 0 : undefined}
                            >
                                {col.label}
                                {renderSortIcon(col.key)}
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
                                    <b>{j.nombre}</b>
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
                                            style={{ minWidth: 32, marginLeft: 2 }}
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
                    <b>Tip:</b> Hacé clic en los encabezados para ordenar la tabla. Podés filtrar por mes y año, exportar la tabla (Excel) y descargar cada gráfico en PNG.
                </span>
            </div>
        </div>
    );
}
