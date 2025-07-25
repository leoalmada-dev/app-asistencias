import { useEffect, useState } from "react";
import {
    obtenerJugadores,
    agregarJugador,
    actualizarJugador,
    eliminarJugador,
} from "../hooks/useDB";
import JugadorForm from "../components/JugadorForm";
import { Button, Table, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";

export default function Jugadores() {
    const [jugadores, setJugadores] = useState([]);
    const [editando, setEditando] = useState(null);
    const { equipoId } = useEquipo();

    const cargar = async () => {
        const lista = await obtenerJugadores();
        setJugadores(lista.filter(j => j.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    if (!equipoId)
        return (
            <Alert variant="warning">
                Debes seleccionar un equipo para usar esta sección.
            </Alert>
        );

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
        if (window.confirm("¿Eliminar jugador?")) {
            await eliminarJugador(id);
            cargar();
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Jugadores</h3>
            <div className="mb-4">
                <h5 className="mb-2">
                    {editando ? "Editar jugador" : "Nuevo jugador"}
                </h5>
                <JugadorForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                />
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <h5 className="mb-3">Listado de jugadores</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Nro</th>
                            <th>Posición</th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jugadores.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-muted">
                                    No hay jugadores cargados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            jugadores.map((j) => (
                                <tr key={j.id}>
                                    <td>{j.nombre}</td>
                                    <td>{j.numero}</td>
                                    <td>{j.posicion}</td>
                                    <td>{j.activo ? "✔️" : "❌"}</td>
                                    <td>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => setEditando(j)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleEliminar(j.id)}
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
        </div>
    );
}
