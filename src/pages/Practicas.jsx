// src/pages/Practicas.jsx
import { useEffect, useState } from "react";
import {
    obtenerPracticas,
    agregarPractica,
    actualizarPractica,
    eliminarPractica,
} from "../hooks/useDB";
import PracticaForm from "../components/PracticaForm";
import { Table, Button, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";

export default function Practicas() {
    const [practicas, setPracticas] = useState([]);
    const [editando, setEditando] = useState(null);
    const { equipoId } = useEquipo();

    const cargar = async () => {
        const lista = await obtenerPracticas();
        setPracticas(lista.filter(p => p.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    const handleGuardar = async (practica) => {
        if (editando) {
            await actualizarPractica(editando.id, { ...practica, equipoId });
            setEditando(null);
        } else {
            await agregarPractica({ ...practica, equipoId });
        }
        cargar();
    };

    const handleEliminar = async (id) => {
        if (confirm("¿Eliminar esta práctica?")) {
            await eliminarPractica(id);
            cargar();
        }
    };

    if (!equipoId) return <Alert variant="warning">Debes seleccionar un equipo para usar esta sección.</Alert>;

    return (
        <div className="container mt-4">
            <h3>Prácticas</h3>
            <PracticaForm onSave={handleGuardar} initialData={editando} modoEdicion={!!editando} />

            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Lugar</th>
                        <th>Observaciones</th>
                        <th>Asistieron</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {practicas.map((p) => {
                        const presentes = p.asistencias?.filter(a => a.presente).length || 0;
                        return (
                            <tr key={p.id}>
                                <td>{p.fecha}</td>
                                <td>{p.hora}</td>
                                <td>{p.lugar}</td>
                                <td>{p.observaciones}</td>
                                <td>{presentes}</td>
                                <td>
                                    <Button variant="outline-warning" size="sm" onClick={() => setEditando(p)}>
                                        <FaEdit />
                                    </Button>{" "}
                                    <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(p.id)}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}
