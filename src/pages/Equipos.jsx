// src/pages/Equipos.jsx
import { useEffect, useState } from "react";
import {
    obtenerEquipos,
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
} from "../hooks/useDB";
import EquipoForm from "../components/EquipoForm";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Equipos() {
    const [equipos, setEquipos] = useState([]);
    const [editando, setEditando] = useState(null);

    const cargar = async () => {
        const lista = await obtenerEquipos();
        setEquipos(lista);
    };

    useEffect(() => {
        cargar();
    }, []);

    const handleGuardar = async (equipo) => {
        if (editando) {
            await actualizarEquipo(editando.id, equipo);
            setEditando(null);
        } else {
            await agregarEquipo(equipo);
        }
        cargar();
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar equipo? (Esta acción es irreversible)")) {
            await eliminarEquipo(id);
            cargar();
        }
    };

    return (
        <div className="container mt-4">
            <h3>Equipos/Categorías</h3>
            <EquipoForm onSave={handleGuardar} initialData={editando} modoEdicion={!!editando} />

            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {equipos.map((e) => (
                        <tr key={e.id}>
                            <td>{e.nombre}</td>
                            <td>
                                <Button variant="outline-warning" size="sm" onClick={() => setEditando(e)}>
                                    <FaEdit />
                                </Button>{" "}
                                <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(e.id)}>
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
