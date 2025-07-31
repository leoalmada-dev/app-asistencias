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
import html2canvas from "html2canvas";
import { FaImage } from "react-icons/fa6";


const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

// Para mantener el orden de posiciones
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

function getPosicionData(valor) {
    for (const cat of CATEGORIAS_POSICION) {
        const found = cat.posiciones.find(p => p.value === valor);
        if (found) return found;
    }
    return null;
}

const COLS = [
    { key: "nombre", label: "Jugador", width: "28%", align: "start", orderable: true },
    { key: "numero", label: "Nro", width: "8%", align: "center", orderable: true },
    { key: "posiciones", label: "Posiciones", width: "14%", align: "center", orderable: true },
    { key: "asistencias", label: "Asistencias", width: "9%", align: "center", orderable: true },
    { key: "faltas", label: "Faltas", width: "9%", align: "center", orderable: true },
    { key: "porcentaje", label: "% Asist.", width: "12%", align: "center", orderable: true },
    { key: "motivos", label: "Motivos", width: "7%", align: "center", orderable: false },
];

export default function EntrenamientosStats() {
    const tablaRef = useRef(null);
    const [estadisticas, setEstadisticas] = useState([]);
    const { equipoId } = useEquipo();

    const now = new Date();
    const [filtros, setFiltros] = useState({
        anio: now.getFullYear().toString(),
        mes: String(now.getMonth() + 1).padStart(2, '0'),
    });
    const [aniosDisponibles, setAniosDisponibles] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [sortBy, setSortBy] = useState("nombre");
    const [sortDir, setSortDir] = useState("asc");

    const graficoAsistenciasRef = useRef(null);

    useEffect(() => { obtenerEquipos().then(setEquipos); }, []);
    const equipoNombre = equipos.find(e => e.id === equipoId)?.nombre || "SinEquipo";
    const filtroMesNombre = filtros.mes ? NOMBRES_MESES[parseInt(filtros.mes, 10) - 1] : "Todos";
    const filtroAnio = filtros.anio || "Todos";
    const nombreArchivo = `Entrenamientos_${filtroMesNombre}_${filtroAnio}_${equipoNombre}`;
    const titulo = `Asistencias a Entrenamientos (${equipoNombre} - ${filtroMesNombre} ${filtroAnio})`;

    // Filtros año/mes
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
            const pa = a.posicion && POSICION_ORDEN[a.posicion] !== undefined ? POSICION_ORDEN[a.posicion] : 999;
            const sa = a.posicionSecundaria && POSICION_ORDEN[a.posicionSecundaria] !== undefined ? POSICION_ORDEN[a.posicionSecundaria] : 999;
            const pb = b.posicion && POSICION_ORDEN[b.posicion] !== undefined ? POSICION_ORDEN[b.posicion] : 999;
            const sb = b.posicionSecundaria && POSICION_ORDEN[b.posicionSecundaria] !== undefined ? POSICION_ORDEN[b.posicionSecundaria] : 999;
            valA = Math.min(pa, sa);
            valB = Math.min(pb, sb);
        } else if (sortBy === "asistencias" || sortBy === "faltas" || sortBy === "porcentaje") {
            valA = a[sortBy] ?? 0;
            valB = b[sortBy] ?? 0;
        } else {
            valA = 0; valB = 0;
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    // --- Para sincronizar select y headers ---
    const handleSelectOrden = (e) => setSortBy(e.target.value);

    useEffect(() => {
        // Si se cambia a asistencias/faltas/porcentaje, default desc, sino asc
        if (["asistencias", "faltas", "porcentaje"].includes(sortBy)) {
            setSortDir("desc");
        } else {
            setSortDir("asc");
        }
    }, [sortBy]);

    // --- Renderiza la flecha SOLO si es la columna activa ---
    const renderSortIcon = (colKey) => {
        if (sortBy !== colKey) return null;
        return (
            <span style={{ fontSize: "1em", marginLeft: 4, color: "#1976d2" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    // Para gráfico
    const datosGrafico = datosOrdenados.map(j => ({
        nombre: j.numero ? `#${j.numero} ${j.nombre}` : j.nombre,
        Asistencias: j.asistencias
    }));

    // Exportar tabla
    const handleExportarExcel = () => {
        // Armá la tabla igual a como la ves en pantalla
        const datosTabla = datosOrdenados.map((j, i) => ({
            "#": i + 1,
            "Jugador": j.nombre,
            "Nro": j.numero || "-",
            "Posición Principal": getPosicionData(j.posicion)?.label || "-",
            "Posición Secundaria": getPosicionData(j.posicionSecundaria)?.label || "-",
            "Asistencias": j.asistencias,
            "Faltas": j.faltas,
            "% Asistencia": `${j.porcentaje}%`,
            "Motivos": j.motivos.join("; ")
        }));

        // Resumen para arriba del archivo
        const totalJugadores = datosOrdenados.length;
        const totalAsistencias = datosOrdenados.reduce((acc, j) => acc + j.asistencias, 0);
        const totalFaltas = datosOrdenados.reduce((acc, j) => acc + j.faltas, 0);
        const resumen = {
            "Total de jugadores": totalJugadores,
            "Total de asistencias": totalAsistencias,
            "Total de faltas": totalFaltas
        };

        exportarEstadisticasAExcel({
            datosTabla,
            nombreArchivo,
            titulo,
            resumen
        });
    };

    const handleExportarImagen = async () => {
        if (!tablaRef.current) return;
        tablaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(async () => {
            const canvas = await html2canvas(tablaRef.current, {
                backgroundColor: "#fff",
                scale: 5
            });
            const link = document.createElement("a");
            link.download = `${nombreArchivo}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }, 400);
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
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />
            {/* Ordenamiento */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                {/* Título alineado a la izquierda */}
                <h5 className="mb-0" style={{ flex: 1 }}>Listado de jugadores</h5>
                {/* Botones a la derecha */}
                <div className="d-flex align-items-center gap-1">
                    <Button
                        size="sm"
                        variant="link"
                        className="p-0 me-2"
                        style={{ textDecoration: "none" }}
                        title="Exportar tabla como imagen PNG"
                        onClick={handleExportarImagen}
                    >
                        <FaImage size={25} className="text-primary" />
                    </Button>
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
            </div>

            {/* Tabla */}
            <div ref={tablaRef}>
                <Table striped bordered hover responsive size="sm" className="mt-2">
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
                                    <td className="text-center">
                                        <Badge bg="success" className="fs-6">{j.asistencias}</Badge>
                                    </td>
                                    <td className="text-center">
                                        {j.faltas > 0
                                            ? <Badge bg="danger" className="fs-6">{j.faltas}</Badge>
                                            : ""}
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
            </div>
            <div className="mt-3 small text-secondary">
                <span>
                    <b>Tip:</b> Hacé clic en los encabezados para ordenar la tabla. Filtrá por mes y año, exportá la tabla (Excel) y descargá el gráfico en PNG.
                </span>
            </div>
        </div>
    );
}
