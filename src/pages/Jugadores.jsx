// src/pages/Jugadores.jsx
import { useEffect, useState } from "react";
import {
    obtenerJugadores,
    agregarJugador,
    actualizarJugador,
    eliminarJugador,
} from "../hooks/useDB";
import JugadorForm from "../components/JugadorForm";
import { Button, Table, Modal, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";

export default function Jugadores() {
    const [jugadores, setJugadores] = useState([]);
    const [editando, setEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const { equipoId } = useEquipo();

    const cargar = async () => {
        const lista = await obtenerJugadores();
        setJugadores(lista.filter(j => j.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    if (!equipoId) return <Alert variant="warning">Debes seleccionar un equipo para usar esta sección.</Alert>;

    const handleGuardar = async (jugador) => {
        if (editando) {
            await actualizarJugador(editando.id, { ...jugador, equipoId });
            setEditando(null);
        } else {
            await agregarJugador({ ...jugador, equipoId });
        }
        cargar();
    };

    const handleEliminar = async (id) => {
        if (confirm("¿Eliminar jugador?")) {
            await eliminarJugador(id);
            cargar();
        }
    };

    return (
        <div className="container mt-4">
            <h3>Jugadores</h3>
            <JugadorForm onSave={handleGuardar} initialData={editando} modoEdicion={!!editando} />

            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Nro</th>
                        <th>Categoría</th>
                        <th>Posición</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {jugadores.map((j) => (
                        <tr key={j.id}>
                            <td>{j.nombre}</td>
                            <td>{j.numero}</td>
                            <td>{j.categoria}</td>
                            <td>{j.posicion}</td>
                            <td>{j.activo ? "✔️" : "❌"}</td>
                            <td>
                                <Button variant="outline-warning" size="sm" onClick={() => setEditando(j)}>
                                    <FaEdit />
                                </Button>{" "}
                                <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(j.id)}>
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
