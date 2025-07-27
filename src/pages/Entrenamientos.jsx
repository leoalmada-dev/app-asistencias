import { useEffect, useState, useRef } from "react";
import {
    obtenerEntrenamientos,
    agregarEntrenamiento,
    actualizarEntrenamiento,
    eliminarEntrenamiento,
} from "../hooks/useDB";
import EntrenamientoForm from "../components/EntrenamientoForm";
import { Table, Button, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";
import { Link } from "react-router-dom";
import { FaDumbbell } from "react-icons/fa6";

export default function Entrenamientos() {
    const [entrenamientos, setEntrenamientos] = useState([]);
    const [editando, setEditando] = useState(null);
    const { equipoId } = useEquipo();

    const formRef = useRef(); // Referencia para scroll al formulario

    const cargar = async () => {
        const lista = await obtenerEntrenamientos();
        setEntrenamientos(lista.filter(p => p.equipoId === equipoId));
    };

    useEffect(() => {
        cargar();
    }, [equipoId]);

    const handleGuardar = async (entrenamiento) => {
        if (editando) {
            await actualizarEntrenamiento(editando.id, { ...entrenamiento, equipoId });
            setEditando(null);
        } else {
            await agregarEntrenamiento({ ...entrenamiento, equipoId });
        }
        cargar();
    };

    const handleCancelarEdicion = () => setEditando(null);

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar este entrenamiento?")) {
            await eliminarEntrenamiento(id);
            cargar();
        }
    };

    const handleEditar = (entrenamiento) => {
        setEditando(entrenamiento);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100); // retraso breve para asegurar render
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
                Entrenamiento
            </h3>

            <div ref={formRef} className="mb-4">
                <EntrenamientoForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                />
            </div>

            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

            <div>
                <h5 className="mb-3">Listado de entrenamientos</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Lugar</th>
                            <th>Duración (min)</th>
                            <th>Asistieron</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entrenamientos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">
                                    No hay entrenamientos registrados para este equipo.
                                </td>
                            </tr>
                        ) : (
                            entrenamientos.map((p) => {
                                const presentes = p.asistencias?.filter(a => a.presente).length || 0;
                                return (
                                    <tr key={p.id}>
                                        <td>{p.fecha}</td>
                                        <td>{p.hora}</td>
                                        <td>{p.lugar}</td>
                                        <td>{p.duracion || "-"}</td>
                                        <td>{presentes}</td>
                                        <td>
                                            <Button
                                                as={Link}
                                                to={`/entrenamientos/${p.id}`}
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
                                                onClick={() => handleEditar(p)}
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
