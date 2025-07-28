import { useEffect, useState, useRef } from "react";
import {
    obtenerJugadores,
    agregarJugador,
    actualizarJugador,
    eliminarJugador,
} from "../hooks/useDB";
import JugadorForm from "../components/JugadorForm";
import { Button, Table, Alert, Badge, Form, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { FaBan, FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { getPosData } from "../utils/posiciones";
import { CATEGORIAS_POSICION } from "../data/posiciones";
import AlertaFlotante from "../components/AlertaFlotante";

const COLS = [
    { key: "index", label: "#", width: "5%", align: "center", orderable: false },
    { key: "nombre", label: "Nombre", width: "30%", align: "start", orderable: true },
    { key: "numero", label: "Nro", width: "10%", align: "center", orderable: true },
    { key: "posiciones", label: "Posiciones", width: "15%", align: "center", orderable: true },
    { key: "estado", label: "Estado", width: "15%", align: "center", orderable: true },
    { key: "acciones", label: "Acciones", width: "8%", align: "center", orderable: false }
];

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

export default function Jugadores() {
    const [jugadores, setJugadores] = useState([]);
    const [editando, setEditando] = useState(null);
    const [mostrarSoloActivos, setMostrarSoloActivos] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [jugadorAEliminar, setJugadorAEliminar] = useState(null);
    const [sortBy, setSortBy] = useState("nombre");
    const [sortDir, setSortDir] = useState("asc");
    const [alerta, setAlerta] = useState({ show: false, mensaje: "", tipo: "success" });
    const { equipoId } = useEquipo();

    const formRef = useRef(null);

    const cargar = async () => {
        const lista = await obtenerJugadores();
        setJugadores(lista.filter(j => j.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    useEffect(() => {
        if (editando && formRef.current) {
            setTimeout(() => {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 80);
        }
    }, [editando]);

    const handleGuardar = async (jugador) => {
        if (editando) {
            await actualizarJugador(editando.id, { ...jugador, equipoId });
            setEditando(null);
        } else {
            await agregarJugador({ ...jugador, equipoId });
        }
        cargar();
    };

    const handleCancelarEdicion = () => setEditando(null);

    const handleEliminar = async (id) => {
        setShowModal(false);
        const eliminado = jugadores.find(j => j.id === id);
        await eliminarJugador(id);
        setAlerta({
            show: true,
            mensaje: <span><b>{eliminado?.nombre || "Jugador"}</b> eliminado correctamente.</span>,
            tipo: "success"
        });
        cargar();
    };

    const handleToggleActivo = async (jugador) => {
        await actualizarJugador(jugador.id, { ...jugador, activo: !jugador.activo });
        if (editando?.id === jugador.id && !jugador.activo) setEditando(null);
        cargar();
    };

    const renderPosiciones = (principal, secundaria, apagado = false) => {
        const posPrincipal = getPosData(principal);
        const posSecundaria = getPosData(secundaria);
        return (
            <span className="d-inline-flex align-items-center">
                {posPrincipal && (
                    <Badge
                        bg={posPrincipal.color}
                        className={`me-1${apagado ? " opacity-50" : ""}`}
                        title={posPrincipal.label}
                    >
                        {posPrincipal.value}
                    </Badge>
                )}
                {posSecundaria && posSecundaria.value !== posPrincipal?.value && (
                    <Badge
                        bg={posSecundaria.color}
                        className={apagado ? "opacity-50" : ""}
                        style={{ marginLeft: posPrincipal ? 2 : 0 }}
                        title={posSecundaria.label}
                    >
                        {posSecundaria.value}
                    </Badge>
                )}
            </span>
        );
    };

    const jugadoresFiltrados = jugadores.filter(j => mostrarSoloActivos ? j.activo : true);

    const jugadoresOrdenados = [...jugadoresFiltrados].sort((a, b) => {
        let valA, valB;
        if (sortBy === "nombre") {
            valA = (a.nombre || "").toLowerCase();
            valB = (b.nombre || "").toLowerCase();
        } else if (sortBy === "numero") {
            valA = parseInt(a.numero) || 999;
            valB = parseInt(b.numero) || 999;
        } else if (sortBy === "posiciones") {
            const pa = a.posicion && POSICION_ORDEN[a.posicion] !== undefined ? POSICION_ORDEN[a.posicion] : 999;
            const sa = a.posicionSecundaria && POSICION_ORDEN[a.posicionSecundaria] !== undefined ? POSICION_ORDEN[a.posicionSecundaria] : 999;
            const pb = b.posicion && POSICION_ORDEN[b.posicion] !== undefined ? POSICION_ORDEN[b.posicion] : 999;
            const sb = b.posicionSecundaria && POSICION_ORDEN[b.posicionSecundaria] !== undefined ? POSICION_ORDEN[b.posicionSecundaria] : 999;
            valA = Math.min(pa, sa);
            valB = Math.min(pb, sb);
        } else if (sortBy === "estado") {
            valA = a.activo ? 1 : 0;
            valB = b.activo ? 1 : 0;
        } else {
            valA = (a.nombre || "").toLowerCase();
            valB = (b.nombre || "").toLowerCase();
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const textDeshabilitado = {
        color: "#888",
        opacity: 0.6,
        fontStyle: "italic",
    };

    const ModalEliminar = () => (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar jugador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <b>¿Seguro que deseas eliminar permanentemente a este jugador?</b>
                </p>
                <p className="mb-2 text-danger">
                    Esta acción <b>no se puede deshacer</b> y se perderán todos sus registros asociados.
                </p>
                <ul style={{ fontSize: "0.98em" }}>
                    <li>
                        <b>Dejar "inactivo"</b> se recomienda si el jugador puede volver al plantel en el futuro (por lesión, ausencia temporal, u otros motivos).
                    </li>
                    <li>
                        <b>Eliminar</b> solo si es una baja definitiva, egreso del club o error de carga.
                    </li>
                </ul>
                <div className="mt-3">
                    <b>Jugador:</b> <span className="text-secondary">{jugadorAEliminar?.nombre}</span>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={() => handleEliminar(jugadorAEliminar.id)}>
                    Eliminar definitivamente
                </Button>
            </Modal.Footer>
        </Modal>
    );

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
            <h3 className="mb-3">Jugadores</h3>
            <div className="mb-4" ref={formRef}>
                <fieldset className={`rounded p-3 ${editando ? "border border-warning" : "border"}`}>
                    <legend className="float-none w-auto px-2 fs-5 mb-0">
                        {editando ? "Editar jugador" : "Nuevo jugador"}
                    </legend>
                    <JugadorForm
                        onSave={handleGuardar}
                        initialData={editando}
                        modoEdicion={!!editando}
                        onCancel={handleCancelarEdicion}
                        jugadores={jugadores}
                    />
                </fieldset>
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <div className="d-flex align-items-center mb-3">
                    <h5 className="mb-0 me-3">Listado de jugadores</h5>
                    <Button
                        variant={mostrarSoloActivos ? "success" : "outline-secondary"}
                        size="sm"
                        className="ms-auto"
                        onClick={() => setMostrarSoloActivos(a => !a)}
                    >
                        {mostrarSoloActivos ? "Mostrar todos" : "Mostrar solo activos"}
                    </Button>
                </div>
                <Table striped bordered hover responsive>
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
                        {jugadoresOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    No hay jugadores cargados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            jugadoresOrdenados.map((j, idx) => {
                                const isInactive = !j.activo;
                                return (
                                    <tr key={j.id} style={isInactive ? textDeshabilitado : {}}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td className="text-start">{j.nombre}</td>
                                        <td className="text-center">{j.numero}</td>
                                        <td className="text-center">{renderPosiciones(j.posicion, j.posicionSecundaria, isInactive)}</td>
                                        <td className="text-center">
                                            <Badge
                                                bg={j.activo ? "success" : "danger"}
                                                className={isInactive ? "opacity-50" : ""}
                                            >
                                                {j.activo ? "Activo" : "No activo"}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    isInactive
                                                        ? <Tooltip id={`tooltip-edit-${j.id}`}>No se puede editar un jugador inactivo</Tooltip>
                                                        : <Tooltip id={`tooltip-edit-${j.id}`}>Editar jugador</Tooltip>
                                                }
                                            >
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="me-2 p-0 text-warning"
                                                        onClick={() => j.activo && setEditando(j)}
                                                        disabled={isInactive}
                                                        style={{
                                                            opacity: isInactive ? 0.4 : 1
                                                        }}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    isInactive
                                                        ? <Tooltip id={`tooltip-del-${j.id}`}>No se puede eliminar un jugador inactivo</Tooltip>
                                                        :  <Tooltip id={`tooltip-edit-${j.id}`}>Eliminar jugador</Tooltip>
                                                }
                                            >
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="me-2 p-0 text-danger"
                                                        onClick={() => {
                                                            if (j.activo) {
                                                                setJugadorAEliminar(j);
                                                                setShowModal(true);
                                                            }
                                                        }}
                                                        disabled={isInactive}
                                                        style={{
                                                            opacity: isInactive ? 0.4 : 1
                                                        }}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        {j.activo ? "Desactivar jugador" : "Activar jugador"}
                                                    </Tooltip>
                                                }
                                            >
                                                <span>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className={`p-0 ${j.activo ? "text-success" : "text-secondary"}`}
                                                        onClick={() => handleToggleActivo(j)}
                                                        style={{ opacity: isInactive ? 0.6 : 1 }}
                                                    >
                                                        {j.activo ? <FaCheckCircle /> : <FaBan />}
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
                <div className="text-secondary small mt-2">
                    <b>Tip:</b> Hacé clic en los títulos de las columnas para ordenar la tabla. Usá el ícono de <span className="text-success"><FaCheckCircle style={{ verticalAlign: "-2px" }} /></span> o <span className="text-secondary"><FaBan style={{ verticalAlign: "-2px" }} /></span> para activar o desactivar jugadores rápidamente. Los jugadores inactivos se ven apagados, no pueden ser seleccionados, editados ni eliminados.
                </div>
            </div>
            <AlertaFlotante
                show={alerta.show}
                mensaje={alerta.mensaje}
                tipo={alerta.tipo}
                onClose={() => setAlerta({ ...alerta, show: false })}
                ms={2500}
            />
            <ModalEliminar />
        </div>
    );
}
