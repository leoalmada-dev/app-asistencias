import { useEffect, useState, useRef } from "react";
import {
    obtenerPartidos,
    agregarPartido,
    actualizarPartido,
    eliminarPartido,
    obtenerJugadores
} from "../hooks/useDB";
import PartidoForm from "../components/PartidoForm";
import ModalConfirmarEliminacion from "../components/ModalConfirmarEliminacion";
import { Table, Button, Alert, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaSortUp, FaSortDown, FaFutbol, FaInfoCircle } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import AlertaFlotante from "../components/AlertaFlotante";

// Paleta de colores personalizada para torneos
const TOURNAMENT_COLORS = [
    "primary",  // Azul
    "success",  // Verde
    "warning",  // Amarillo
    "dark",     // Gris oscuro
    "danger",   // Rojo
];

function colorDeTorneo(nombre) {
    if (!nombre || nombre.toLowerCase() === "amistoso") return "secondary";
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    const colores = TOURNAMENT_COLORS.filter(c => c !== "secondary");
    return colores[Math.abs(hash) % colores.length];
}

const COLS = [
    { key: "index", label: "#", width: "5%", orderable: false },
    { key: "fecha", label: "Fecha", width: "15%", orderable: true },
    { key: "torneo", label: "Torneo", width: "25%", orderable: true },
    { key: "rival", label: "Rival", width: "26%", orderable: true },
    { key: "resultado", label: "Resultado", width: "15%", orderable: false },
    { key: "acciones", label: "Acciones", width: "15%", orderable: false },
];

function renderSortIcon(sortBy, sortDir, colKey) {
    if (sortBy !== colKey) return null;
    return sortDir === "asc"
        ? <FaSortUp className="ms-1 text-primary" style={{ position: "relative", top: -2 }} />
        : <FaSortDown className="ms-1 text-primary" style={{ position: "relative", top: 2 }} />;
}

export default function Partidos() {
    const [partidos, setPartidos] = useState([]);
    const [editando, setEditando] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [partidoAEliminar, setPartidoAEliminar] = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const [sortBy, setSortBy] = useState("fecha");
    const [sortDir, setSortDir] = useState("desc");
    const [alerta, setAlerta] = useState({ show: false, mensaje: "", tipo: "success" }); // << NUEVO

    const { equipoId } = useEquipo();
    const formRef = useRef();

    const cargar = async () => {
        const listaPartidos = await obtenerPartidos();
        setPartidos(listaPartidos.filter(p => p.equipoId === equipoId));
        const listaJugadores = await obtenerJugadores();
        setJugadores(listaJugadores.filter(j => j.equipoId === equipoId));
    };

    useEffect(() => {
        if (equipoId) cargar();
    }, [equipoId]);

    const handleGuardar = async (partido) => {
        if (editando) {
            await actualizarPartido(editando.id, { ...partido, equipoId });
            setEditando(null);
            setAlerta({
                show: true,
                mensaje: "¡Partido actualizado correctamente!",
                tipo: "success"
            });
        } else {
            await agregarPartido({ ...partido, equipoId });
            setAlerta({
                show: true,
                mensaje: "¡Partido registrado correctamente!",
                tipo: "success"
            });
        }
        cargar();
    };

    const handleCancelarEdicion = () => {
        setEditando(null);
    };

    const handleEliminar = (partido) => {
        setPartidoAEliminar(partido);
        setShowModal(true);
    };

    const confirmarEliminar = async () => {
        setLoadingEliminar(true);
        await eliminarPartido(partidoAEliminar.id);
        setLoadingEliminar(false);
        setShowModal(false);
        setPartidoAEliminar(null);
        setAlerta({
            show: true,
            mensaje: "Partido eliminado correctamente.",
            tipo: "success"
        });
        cargar();
    };

    const handleEditar = (partido) => {
        setEditando(partido);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const partidosOrdenados = [...partidos].sort((a, b) => {
        let valA, valB;
        if (sortBy === "fecha") {
            valA = (a.fecha || "");
            valB = (b.fecha || "");
        } else if (sortBy === "torneo") {
            valA = (a.torneo || "").toLowerCase();
            valB = (b.torneo || "").toLowerCase();
        } else if (sortBy === "rival") {
            valA = (a.rival || "").toLowerCase();
            valB = (b.rival || "").toLowerCase();
        } else {
            valA = (a.fecha || "");
            valB = (b.fecha || "");
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    if (!equipoId) return <Alert variant="warning">Debes seleccionar un equipo para usar esta sección.</Alert>;
    const sinJugadores = jugadores.length === 0;

    return (
        <div className="container mt-4">
            <h3 className="mb-3 d-flex align-items-center">
                <FaFutbol className="me-2" />
                Partidos
            </h3>

            {sinJugadores && (
                <Alert variant="info" className="mb-4">
                    <strong>¡Atención!</strong> Para registrar un partido, primero debes agregar jugadores a este equipo.<br />
                    <span className="text-muted">
                        Ve a la sección <b>Jugadores</b> en el menú y carga la plantilla antes de registrar partidos.
                        Una vez agregados, podrás registrar participaciones y cambios correctamente.
                    </span>
                </Alert>
            )}

            <div ref={formRef} className="mb-4">
                {!sinJugadores && (
                    <PartidoForm
                        onSave={handleGuardar}
                        initialData={editando}
                        modoEdicion={!!editando}
                        onCancel={handleCancelarEdicion}
                    />
                )}
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-2">Lista de partidos registrados</h5>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Hacé clic en los títulos de las columnas para ordenar la tabla.<br />
                                El torneo puede ser un campeonato o simplemente “Amistoso”.<br />
                                El color del torneo ayuda a distinguir rápidamente.<br />
                                Usá los íconos para ver detalle, editar o eliminar cada partido.
                            </Tooltip>
                        }
                    >
                        <FaInfoCircle className="text-secondary" style={{ cursor: "pointer" }} />
                    </OverlayTrigger>
                </div>
                <Table striped bordered hover responsive size="sm" className="mb-4">
                    <thead>
                        <tr>
                            {COLS.map(col => (
                                <th
                                    key={col.key}
                                    style={{
                                        width: col.width,
                                        cursor: col.orderable ? "pointer" : "default",
                                        userSelect: "none",
                                        verticalAlign: "middle",
                                        textAlign: "center"
                                    }}
                                    className="align-middle bg-body-tertiary text-center"
                                    onClick={() => {
                                        if (!col.orderable) return;
                                        if (sortBy === col.key) {
                                            setSortDir(d => (d === "asc" ? "desc" : "asc"));
                                        } else {
                                            setSortBy(col.key);
                                            setSortDir("asc");
                                        }
                                    }}
                                    tabIndex={col.orderable ? 0 : undefined}
                                >
                                    {col.label}
                                    {col.orderable && renderSortIcon(sortBy, sortDir, col.key)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {partidosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={COLS.length} className="text-center text-muted">
                                    No hay partidos registrados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            partidosOrdenados.map((p, idx) => (
                                <tr key={p.id}>
                                    <td className="text-center align-middle">{idx + 1}</td>
                                    <td className="text-center align-middle">{p.fecha}</td>
                                    <td className="text-center align-middle">
                                        <Badge bg={colorDeTorneo(p.torneo)} style={{ fontSize: 13, minWidth: 70 }}>
                                            {p.torneo}
                                        </Badge>
                                    </td>
                                    <td className="text-center align-middle">{p.rival}</td>
                                    <td className="text-center align-middle">
                                        <Badge bg={
                                            p.golesFavor > p.golesContra
                                                ? "success"
                                                : p.golesFavor < p.golesContra
                                                    ? "danger"
                                                    : "secondary"
                                        } style={{ fontSize: 13 }}>
                                            {p.golesFavor} - {p.golesContra}
                                        </Badge>
                                    </td>
                                    <td className="text-center align-middle">
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalle</Tooltip>}>
                                            <span>
                                                <Button
                                                    as={Link}
                                                    to={`/partidos/${p.id}`}
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 me-2 text-info"
                                                    style={{ fontSize: 18 }}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </span>
                                        </OverlayTrigger>
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
                                            <span>
                                                <Button
                                                    variant="link"
                                                    className="p-0 me-2 text-warning"
                                                    size="sm"
                                                    style={{ fontSize: 18 }}
                                                    onClick={() => handleEditar(p)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                            </span>
                                        </OverlayTrigger>
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar</Tooltip>}>
                                            <span>
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-danger"
                                                    size="sm"
                                                    style={{ fontSize: 18 }}
                                                    onClick={() => handleEliminar(p)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </span>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal Confirmación eliminación */}
            <ModalConfirmarEliminacion
                show={showModal}
                onHide={() => setShowModal(false)}
                onConfirm={confirmarEliminar}
                nombre={partidoAEliminar?.rival || partidoAEliminar?.fecha}
                tipo="partido"
                loading={loadingEliminar}
            />

            {/* Alerta flotante de acciones */}
            <AlertaFlotante
                show={alerta.show}
                mensaje={alerta.mensaje}
                tipo={alerta.tipo}
                ms={2400}
                onClose={() => setAlerta(a => ({ ...a, show: false }))}
            />
        </div>
    );
}
