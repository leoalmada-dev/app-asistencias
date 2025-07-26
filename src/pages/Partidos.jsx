import { useEffect, useState } from "react";
import {
    obtenerPartidos,
    agregarPartido,
    actualizarPartido,
    eliminarPartido,
    obtenerJugadores
} from "../hooks/useDB";
import PartidoForm from "../components/PartidoForm";
import { Table, Button, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

export default function Partidos() {
    const [partidos, setPartidos] = useState([]);
    const [editando, setEditando] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const { equipoId } = useEquipo();

    // Carga partidos y jugadores del equipo actual
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

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar este partido?")) {
            await eliminarPartido(id);
            cargar();
        }
    };

    if (!equipoId) return <Alert variant="warning">Debes seleccionar un equipo para usar esta sección.</Alert>;
    const sinJugadores = jugadores.length === 0;

    return (
        <div className="container mt-4">
            <h3 className="mb-3 d-flex align-items-center">
                <FaFutbol className="me-2" />
                Prácticas
            </h3>

            {/* Alerta si NO hay jugadores */}
            {sinJugadores && (
                <Alert variant="info" className="mb-4">
                    <strong>¡Atención!</strong> Para registrar un partido, primero debes agregar jugadores a este equipo.<br />
                    <span className="text-muted">
                        Ve a la sección <b>Jugadores</b> en el menú y carga la plantilla antes de registrar partidos.
                        Una vez agregados, podrás registrar participaciones y cambios correctamente.
                    </span>
                </Alert>
            )}

            {/* Formulario de partido */}
            <div className="mb-4">
                <h5 className="mb-2">{editando ? "Editar partido" : "Registrar partido"}</h5>
                {!sinJugadores && (
                    <>
                        <PartidoForm
                            onSave={handleGuardar}
                            initialData={editando}
                            modoEdicion={!!editando}
                            onCancel={handleCancelarEdicion}
                        />
                    </>
                )}
                {/* Comentario sutil abajo del form */}
                <div className="mt-3 small text-secondary">
                    <span>
                        <b>Tip:</b> Cargá todos los jugadores antes de registrar partidos para poder asignar participaciones y cambios correctamente.
                    </span>
                </div>
            </div>

            {/* Separador visual */}
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            {/* Lista de partidos */}
            <div>
                <h5 className="mb-3">Lista de partidos registrados</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Rival</th>
                            <th>Resultado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidos.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-muted">
                                    No hay partidos registrados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            partidos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.fecha}</td>
                                    <td>{p.tipo}</td>
                                    <td>{p.rival}</td>
                                    <td>{p.golesFavor} - {p.golesContra}</td>
                                    <td>
                                        <Button as={Link} to={`/partidos/${p.id}`} variant="outline-info" size="sm"
                                            title="Ver detalle"
                                            className="me-2">
                                            <FaEye />
                                        </Button>
                                        <Button variant="outline-warning"
                                            className="me-2"
                                            size="sm" onClick={() => setEditando(p)}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="outline-danger"
                                            size="sm" onClick={() => handleEliminar(p.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
