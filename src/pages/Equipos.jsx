import { useEffect, useState, useRef } from "react";
import {
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
} from "../hooks/useDB";
import EquipoForm from "../components/EquipoForm";
import ModalConfirmarEliminacion from "../components/ModalConfirmarEliminacion";
import { Table, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaEdit, FaTrash, FaUsers } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import AlertaFlotante from "../components/AlertaFlotante";
import { useNavigate } from "react-router-dom";

const COLS = [
    { key: "index", label: "#", width: "10%", align: "center", orderable: false },
    { key: "nombre", label: "Nombre", width: "70%", align: "start", orderable: true },
    { key: "acciones", label: "Acciones", width: "20%", align: "center", orderable: false }
];

export default function Equipos() {
    const navigate = useNavigate();
    const [editando, setEditando] = useState(null);
    const [sortBy, setSortBy] = useState("nombre");
    const [sortDir, setSortDir] = useState("asc");
    const [showAlerta, setShowAlerta] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [equipoAEliminar, setEquipoAEliminar] = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const formRef = useRef(null);

    const { equipos, cargarEquipos, setEquipoId } = useEquipo();

    useEffect(() => {
        if (editando && formRef.current) {
            setTimeout(() => {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 80);
        }
    }, [editando]);

    const handleGuardar = async (equipo) => {
        let idNuevo = null;
        let msg = "";
        if (editando) {
            await actualizarEquipo(editando.id, equipo);
            setEditando(null);
            msg = "Equipo/categoría actualizado correctamente.";
        } else {
            idNuevo = await agregarEquipo(equipo); // Retorna el id insertado
            msg = "Equipo/categoría registrado correctamente.";
        }
        await cargarEquipos();
        if (idNuevo) {
            setEquipoId(idNuevo);
            setMensajeAlerta(
                `¡Equipo/categoría creado y seleccionado automáticamente! Ahora estás viendo "${equipo.nombre}".`
            );
            setShowAlerta(true);
        } else {
            setMensajeAlerta(msg);
            setShowAlerta(true);
        }
    };

    const handleCancelarEdicion = () => setEditando(null);

    // Mostrar el modal y el equipo a eliminar
    const handleEliminar = (equipo) => {
        setEquipoAEliminar(equipo);
        setShowModal(true);
    };

    // Eliminar después de confirmar en el modal
    const confirmarEliminar = async () => {
        setLoadingEliminar(true);
        await eliminarEquipo(equipoAEliminar.id);
        setLoadingEliminar(false);
        setShowModal(false);
        setMensajeAlerta("Equipo/categoría eliminado correctamente.");
        setShowAlerta(true);
        setEquipoAEliminar(null);
        cargarEquipos();
    };

    // Ordenamiento
    const equiposOrdenados = [...equipos].sort((a, b) => {
        let valA, valB;
        if (sortBy === "nombre") {
            valA = (a.nombre || "").toLowerCase();
            valB = (b.nombre || "").toLowerCase();
        } else {
            valA = a.nombre || "";
            valB = b.nombre || "";
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const renderSortIcon = (colKey) => {
        if (sortBy !== colKey) return null;
        return (
            <span style={{ fontSize: "1em", marginLeft: 4, color: "var(--bs-primary)" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Equipos / Categorías</h3>
            <div className="mb-4" ref={formRef}>
                <EquipoForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                    equipos={equipos}
                />
            </div>
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />
            <div>
                <h5 className="mb-3">Listado de equipos/categorías</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            {COLS.map((col, idx) => (
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
                        {equiposOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={COLS.length} className="text-center text-muted">
                                    No hay equipos/categorías registrados.
                                </td>
                            </tr>
                        ) : (
                            equiposOrdenados.map((e, idx) => (
                                <tr key={e.id}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="text-start">{e.nombre}</td>
                                    <td className="text-center">
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tt-edit-${e.id}`}>Editar equipo/categoría</Tooltip>
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="me-2 p-0 text-warning"
                                                    onClick={() => setEditando(e)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                            </span>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tt-users-${e.id}`}>
                                                    Ir a listado de jugadores de este equipo/categoría
                                                </Tooltip>
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="me-2 p-0 text-info"
                                                    onClick={() => {
                                                        setEquipoId(e.id);
                                                        navigate("/jugadores");
                                                    }}
                                                >
                                                    <FaUsers />
                                                </Button>
                                            </span>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tt-trash-${e.id}`}>
                                                    Eliminar equipo/categoría (esta acción es irreversible)
                                                </Tooltip>
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 text-danger"
                                                    onClick={() => handleEliminar(e)}
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
                <div className="text-secondary small mt-2">
                    <b>Tip:</b> Hacé clic en el nombre de columna para ordenar la tabla. Tras crear un equipo, el selector lo mostrará automáticamente.
                </div>
            </div>

            <AlertaFlotante
                show={showAlerta}
                mensaje={mensajeAlerta}
                tipo="success"
                onClose={() => setShowAlerta(false)}
                ms={2700}
            />

            <ModalConfirmarEliminacion
                show={showModal}
                onHide={() => setShowModal(false)}
                onConfirm={confirmarEliminar}
                nombre={equipoAEliminar?.nombre}
                loading={loadingEliminar}
                tipo="equipo/categoría"
            />
        </div>
    );
}
