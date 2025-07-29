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
import { Table, Button, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

export default function Partidos() {
    const [partidos, setPartidos] = useState([]);
    const [editando, setEditando] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [partidoAEliminar, setPartidoAEliminar] = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);

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
        } else {
            await agregarPartido({ ...partido, equipoId });
        }
        cargar();
    };

    const handleCancelarEdicion = () => {
        setEditando(null);
    };

    // Nuevo: abrir el modal con el partido a eliminar
    const handleEliminar = (partido) => {
        setPartidoAEliminar(partido);
        setShowModal(true);
    };

    // Confirmar eliminación después del modal
    const confirmarEliminar = async () => {
        setLoadingEliminar(true);
        await eliminarPartido(partidoAEliminar.id);
        setLoadingEliminar(false);
        setShowModal(false);
        setPartidoAEliminar(null);
        cargar();
    };

    const handleEditar = (partido) => {
        setEditando(partido);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

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
                <h5 className="mb-3">Lista de partidos registrados</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Rival</th>
                            <th>Duración (min)</th>
                            <th>Resultado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">
                                    No hay partidos registrados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            partidos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.fecha}</td>
                                    <td>{p.tipo}</td>
                                    <td>{p.rival}</td>
                                    <td>{p.duracion || "-"}</td>
                                    <td>{p.golesFavor} - {p.golesContra}</td>
                                    <td>
                                        <Button as={Link} to={`/partidos/${p.id}`} variant="outline-info" size="sm"
                                            title="Ver detalle"
                                            className="me-2">
                                            <FaEye />
                                        </Button>
                                        <Button variant="outline-warning"
                                            className="me-2"
                                            size="sm" onClick={() => handleEditar(p)}>
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleEliminar(p)}
                                        >
                                            <FaTrash />
                                        </Button>
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
        </div>
    );
}
