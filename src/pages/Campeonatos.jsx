// src/pages/Campeonatos.jsx
import { useEffect, useState, useRef } from "react";
import {
    obtenerCampeonatos,
    agregarCampeonato,
    actualizarCampeonato,
    eliminarCampeonato
} from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";
import { Table, Button, Form, OverlayTrigger, Tooltip, Modal, Badge } from "react-bootstrap";
import { FaEdit, FaTrash, FaCheckCircle, FaBan } from "react-icons/fa";
import AlertaFlotante from "../components/AlertaFlotante";

const COLS = [
    { key: "index", label: "#", width: "5%", align: "center", orderable: false },
    { key: "nombre", label: "Nombre", width: "35%", align: "start", orderable: true },
    { key: "anio", label: "Año", width: "20%", align: "center", orderable: true },
    { key: "estado", label: "Estado", width: "15%", align: "center", orderable: true },
    { key: "acciones", label: "Acciones", width: "25%", align: "center", orderable: false }
];

export default function Campeonatos() {
    const { equipoId } = useEquipo();
    const [campeonatos, setCampeonatos] = useState([]);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState({ nombre: "", anio: "", activo: true });
    const [showAlerta, setShowAlerta] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [campeonatoAEliminar, setCampeonatoAEliminar] = useState(null);
    const [sortBy, setSortBy] = useState("nombre");
    const [sortDir, setSortDir] = useState("asc");
    const formRef = useRef(null);

    // Cargar campeonatos solo del equipo seleccionado
    const cargar = async () => {
        if (equipoId) {
            const lista = await obtenerCampeonatos(equipoId);
            setCampeonatos(lista);
        } else {
            setCampeonatos([]);
        }
    };

    useEffect(() => { cargar(); }, [equipoId]);

    useEffect(() => {
        if (editando && formRef.current) {
            setTimeout(() => {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [editando]);

    const resetForm = () => setForm({ nombre: "", anio: "", activo: true });

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim() || !form.anio.trim()) return;
        const data = { ...form, nombre: form.nombre.trim(), anio: form.anio.trim(), equipoId };
        if (editando) {
            await actualizarCampeonato(editando.id, data);
            setEditando(null);
            setMensajeAlerta("Campeonato actualizado correctamente.");
        } else {
            await agregarCampeonato(data);
            setMensajeAlerta("Campeonato agregado correctamente.");
        }
        setShowAlerta(true);
        resetForm();
        cargar();
    };

    const handleEditar = (c) => {
        setEditando(c);
        setForm({
            nombre: c.nombre,
            anio: c.anio,
            activo: c.activo
        });
    };

    const handleCancelar = () => {
        setEditando(null);
        resetForm();
    };

    const handleEliminar = async (id) => {
        setShowModal(false);
        await eliminarCampeonato(id);
        setMensajeAlerta("Campeonato eliminado correctamente.");
        setShowAlerta(true);
        cargar();
    };

    const handleToggleActivo = async (c) => {
        await actualizarCampeonato(c.id, { ...c, activo: !c.activo });
        cargar();
    };

    // ORDENAMIENTO
    const campeonatosOrdenados = [...campeonatos].sort((a, b) => {
        let valA, valB;
        if (sortBy === "nombre") {
            valA = (a.nombre || "").toLowerCase();
            valB = (b.nombre || "").toLowerCase();
        } else if (sortBy === "anio") {
            valA = parseInt(a.anio) || 0;
            valB = parseInt(b.anio) || 0;
        } else if (sortBy === "estado") {
            valA = a.activo ? 1 : 0;
            valB = b.activo ? 1 : 0;
        } else {
            valA = a.nombre || "";
            valB = b.nombre || "";
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    // Flecha solo en la columna activa
    const renderSortIcon = (colKey) => {
        if (sortBy !== colKey) return null;
        return (
            <span style={{ fontSize: "1em", marginLeft: 4, color: "var(--bs-primary)" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    const textDisabled = {
        color: "#888",
        opacity: 0.6,
        fontStyle: "italic",
    };

    return (
        <div className="container mt-4">
                <h3 className="mb-3">Campeonatos</h3>
            <div ref={formRef} className="mb-4">
                <fieldset className={`rounded p-3 ${editando ? "border border-warning" : "border"}`}>
                    <legend className="float-none w-auto px-2 fs-5 mb-0">
                        {editando ? "Editar campeonato" : "Nuevo campeonato"}
                    </legend>
                    <Form onSubmit={handleGuardar}>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        value={form.nombre}
                                        maxLength={40}
                                        required
                                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                        placeholder="Ej: Liga AUFI, Copa Nacional, etc."
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>Año</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={2000}
                                        max={2100}
                                        required
                                        value={form.anio}
                                        onChange={e => setForm(f => ({ ...f, anio: e.target.value }))}
                                        placeholder="Ej: 2025"
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        {/* Botones en fila separada */}
                        <div className="d-flex gap-2 align-items-center mt-3">
                            <Button type="submit" variant={editando ? "warning" : "primary"} className="me-2">
                                {editando ? "Actualizar" : "Agregar"}
                            </Button>
                            {editando && (
                                <Button variant="secondary" onClick={handleCancelar}>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </Form>
                    <div className="text-secondary small mt-2">
                        <b>Tip:</b> Los campeonatos se asocian sólo al equipo/categoría seleccionado.
                    </div>
                </fieldset>
            </div>
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />
            <div>
                <h5 className="mb-3">Listado de Campeonatos</h5>
                <Table striped bordered hover responsive size="sm">
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
                        {campeonatosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={COLS.length} className="text-center text-muted">
                                    No hay campeonatos registrados para este equipo/categoría.
                                </td>
                            </tr>
                        ) : (
                            campeonatosOrdenados.map((c, i) => {
                                const isInactive = !c.activo;
                                return (
                                    <tr key={c.id} style={isInactive ? textDisabled : {}}>
                                        <td className="text-center">{i + 1}</td>
                                        <td className="text-start">{c.nombre}</td>
                                        <td className="text-center">{c.anio}</td>
                                        <td className="text-center">
                                            <Badge bg={c.activo ? "success" : "secondary"} className={isInactive ? "opacity-50" : ""}>
                                                {c.activo ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <OverlayTrigger placement="top" overlay={
                                                isInactive
                                                    ? <Tooltip id={`tooltip-del-${c.id}`}>No se puede editar un campeonato inactivo</Tooltip>
                                                    : <Tooltip id={`tooltip-edit-${c.id}`}>Editar campeonato</Tooltip>
                                            }>
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 me-2 text-warning"
                                                        onClick={() => handleEditar(c)}
                                                        disabled={isInactive}
                                                        style={isInactive ? { pointerEvents: "none", opacity: 0.4 } : {}}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top"
                                                overlay={
                                                    isInactive
                                                        ? <Tooltip id={`tooltip-del-${c.id}`}>No se puede eliminar un campeonato inactivo</Tooltip>
                                                        : <Tooltip id={`tooltip-edit-${c.id}`}>Eliminar campeonato</Tooltip>
                                                }>
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 me-2 text-danger"
                                                        onClick={() => { setCampeonatoAEliminar(c); setShowModal(true); }}
                                                        disabled={isInactive}
                                                        style={isInactive ? { pointerEvents: "none", opacity: 0.4 } : {}}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        {c.activo ? "Desactivar campeonato" : "Activar campeonato"}
                                                    </Tooltip>
                                                }
                                            >
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className={`p-0 ${c.activo ? "text-success" : "text-secondary"}`}
                                                        onClick={() => handleToggleActivo(c)}
                                                    >
                                                        {c.activo ? <FaCheckCircle /> : <FaBan />}
                                                    </Button>
                                                </span>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </Table>

                <div className="text-secondary small mt-2">
                    <b>Tip:</b> Ordená la tabla haciendo clic en los títulos de las columnas. Usá los íconos <span className="text-success"><FaCheckCircle style={{ verticalAlign: "-2px" }} /></span> y <span className="text-secondary"><FaBan style={{ verticalAlign: "-2px" }} /></span> para activar y desactivar campeonatos. Los campeonatos inactivos aparecen apagados y no podrán seleccionarse para nuevos partidos.
                </div>
            </div>
            <AlertaFlotante
                show={showAlerta}
                mensaje={mensajeAlerta}
                tipo="success"
                onClose={() => setShowAlerta(false)}
                ms={2300}
            />

            {/* Modal de confirmación para eliminar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar campeonato</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Seguro que deseas eliminar este campeonato? Esta acción no puede deshacerse.
                    <div className="mt-2">
                        <b>Campeonato:</b> <span className="text-secondary">{campeonatoAEliminar?.nombre} ({campeonatoAEliminar?.anio})</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => handleEliminar(campeonatoAEliminar.id)}>
                        Eliminar definitivamente
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
