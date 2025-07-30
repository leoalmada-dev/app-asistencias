import { useEffect, useState, useRef } from "react";
import {
    obtenerEntrenamientos,
    agregarEntrenamiento,
    actualizarEntrenamiento,
    eliminarEntrenamiento,
} from "../hooks/useDB";
import EntrenamientoForm from "../components/EntrenamientoForm";
import { Table, Button, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaSortUp, FaSortDown, FaInfoCircle } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import { FaDumbbell } from "react-icons/fa6";
import AlertaFlotante from "../components/AlertaFlotante";
import ModalConfirmarEliminacion from "../components/ModalConfirmarEliminacion";

const COLS = [
    { key: "index", label: "#", width: "5%", orderable: false },
    { key: "fecha", label: "Fecha", width: "15%", orderable: true },
    { key: "hora", label: "Hora", width: "12%", orderable: true },
    { key: "lugar", label: "Lugar", width: "28%", orderable: true },
    { key: "duracion", label: "Duración", width: "12%", orderable: true },
    { key: "asistencias", label: "Asistieron", width: "13%", orderable: true },
    { key: "acciones", label: "Acciones", width: "15%", orderable: false },
];

function renderSortIcon(sortBy, sortDir, colKey) {
    if (sortBy !== colKey) return null;
    return sortDir === "asc"
        ? <FaSortUp className="ms-1 text-primary" style={{ position: "relative", top: -2 }} />
        : <FaSortDown className="ms-1 text-primary" style={{ position: "relative", top: 2 }} />;
}

export default function Entrenamientos() {
    const [entrenamientos, setEntrenamientos] = useState([]);
    const [editando, setEditando] = useState(null);
    const [sortBy, setSortBy] = useState("fecha");
    const [sortDir, setSortDir] = useState("desc");
    const { equipoId } = useEquipo();
    const formRef = useRef();

    const [mostrarModal, setMostrarModal] = useState(false);
    const [entrenamientoAEliminar, setEntrenamientoAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    // NUEVO: estado para las alertas flotantes
    const [alerta, setAlerta] = useState({ show: false, mensaje: "", tipo: "success" });

    const cargar = async () => {
        const lista = await obtenerEntrenamientos();
        setEntrenamientos(lista.filter(p => p.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    const handleGuardar = async (entrenamiento) => {
        if (editando) {
            await actualizarEntrenamiento(editando.id, { ...entrenamiento, equipoId });
            setEditando(null);
            setAlerta({
                show: true,
                mensaje: "¡Entrenamiento actualizado correctamente!",
                tipo: "success"
            });
        } else {
            await agregarEntrenamiento({ ...entrenamiento, equipoId });
            setAlerta({
                show: true,
                mensaje: "¡Entrenamiento registrado correctamente!",
                tipo: "success"
            });
        }
        cargar();
    };

    const handleCancelarEdicion = () => setEditando(null);

    const handleEditar = (entrenamiento) => {
        setEditando(entrenamiento);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const entrenamientosOrdenados = [...entrenamientos].sort((a, b) => {
        let valA, valB;
        if (sortBy === "fecha") {
            valA = a.fecha || "";
            valB = b.fecha || "";
        } else if (sortBy === "hora") {
            valA = a.hora || "";
            valB = b.hora || "";
        } else if (sortBy === "lugar") {
            valA = (a.lugar || "").toLowerCase();
            valB = (b.lugar || "").toLowerCase();
        } else if (sortBy === "duracion") {
            valA = Number(a.duracion) || 0;
            valB = Number(b.duracion) || 0;
        } else if (sortBy === "asistencias") {
            valA = (a.asistencias?.filter(x => x.presente).length) || 0;
            valB = (b.asistencias?.filter(x => x.presente).length) || 0;
        } else {
            valA = a.fecha || "";
            valB = b.fecha || "";
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const handleEliminar = (entrenamiento) => {
        setEntrenamientoAEliminar(entrenamiento);
        setMostrarModal(true);
    };

    const confirmarEliminacion = async () => {
        setEliminando(true);
        await eliminarEntrenamiento(entrenamientoAEliminar.id);
        setMostrarModal(false);
        setEliminando(false);
        setAlerta({
            show: true,
            mensaje: `Entrenamiento del ${entrenamientoAEliminar.fecha} eliminado correctamente.`,
            tipo: "success"
        });
        cargar();
    };

    const formatearFecha = (fechaStr) => {
        console.log(fechaStr)
        if (!fechaStr) return "";
        const fecha = new Date(fechaStr);
        return fecha.toISOString().split("T")[0]; // yyyy-mm-dd
    };


    if (!equipoId)
        return (
            <Alert variant="warning">
                Debes seleccionar un equipo para usar esta sección.
            </Alert>
        );

    return (
        <div className="container mt-4">
            <h3 className="mb-3 d-flex align-items-center">
                <FaDumbbell className="me-2" />
                Entrenamientos
            </h3>

            <div ref={formRef} className="mb-4">
                <EntrenamientoForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                />
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-2">Listado de entrenamientos</h5>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Hacé clic en los títulos de las columnas para ordenar la tabla.<br />
                                La columna “Asistieron” muestra solo los presentes registrados.<br />
                                Usá los íconos para ver detalle, editar o eliminar cada entrenamiento.
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
                        {entrenamientosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={COLS.length} className="text-center text-muted">
                                    No hay entrenamientos registrados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            entrenamientosOrdenados.map((p, idx) => {
                                const presentes = p.asistencias?.filter(a => a.presente).length || 0;
                                return (
                                    <tr key={p.id}>
                                        <td className="text-center align-middle">{idx + 1}</td>
                                        <td className="text-center align-middle">{p.fecha}</td>
                                        <td className="text-center align-middle">{p.hora}</td>
                                        <td className="text-center align-middle">{p.lugar}</td>
                                        <td className="text-center align-middle">{p.duracion || "-"}</td>
                                        <td className="text-center align-middle">{presentes}</td>
                                        <td className="text-center align-middle">
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalle</Tooltip>}>
                                                <span>
                                                    <Button
                                                        as={Link}
                                                        to={`/entrenamientos/${p.id}`}
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
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal Confirmación eliminación */}
            <ModalConfirmarEliminacion
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
                onConfirm={confirmarEliminacion}
                nombre={`el entrenamiento del día: ${formatearFecha(entrenamientoAEliminar?.fecha)}`}
                tipo="entrenamiento"
                loading={eliminando}
            />

            {/* Alerta flotante reutilizable */}
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
