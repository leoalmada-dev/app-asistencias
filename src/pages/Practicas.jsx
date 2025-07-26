import { useEffect, useState } from "react";
import {
    obtenerPracticas,
    agregarPractica,
    actualizarPractica,
    eliminarPractica,
} from "../hooks/useDB";
import PracticaForm from "../components/PracticaForm";
import { Table, Button, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import { FaDumbbell } from "react-icons/fa6";

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

    const handleCancelarEdicion = () => setEditando(null);

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar esta práctica?")) {
            await eliminarPractica(id);
            cargar();
        }
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
                Prácticas
            </h3>
            <div className="mb-4">
                <h5 className="mb-2">
                    {editando ? "Editar práctica" : "Registrar práctica"}
                </h5>
                <PracticaForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                />
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <h5 className="mb-3">Listado de prácticas</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Lugar</th>
                            <th>Asistieron</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {practicas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">
                                    No hay prácticas registradas para este equipo.
                                </td>
                            </tr>
                        ) : (
                            practicas.map((p) => {
                                const presentes = p.asistencias?.filter(a => a.presente).length || 0;
                                return (
                                    <tr key={p.id}>
                                        <td>{p.fecha}</td>
                                        <td>{p.hora}</td>
                                        <td>{p.lugar}</td>
                                        <td>{presentes}</td>
                                        <td>
                                            <Button
                                                as={Link}
                                                to={`/practicas/${p.id}`}
                                                variant="outline-info"
                                                size="sm"
                                                title="Ver detalle"
                                                className="me-2"
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => setEditando(p)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleEliminar(p.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
