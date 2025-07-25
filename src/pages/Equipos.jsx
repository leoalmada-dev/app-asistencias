import { useEffect, useState } from "react";
import {
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
} from "../hooks/useDB";
import EquipoForm from "../components/EquipoForm";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEquipo } from "../context/EquipoContext";

export default function Equipos() {
    const [editando, setEditando] = useState(null);
    const { equipos, cargarEquipos } = useEquipo();

    const handleGuardar = async (equipo) => {
        if (editando) {
            await actualizarEquipo(editando.id, equipo);
            setEditando(null);
        } else {
            await agregarEquipo(equipo);
        }
        cargarEquipos();
    };

    const handleCancelarEdicion = () => setEditando(null);

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar equipo? (Esta acción es irreversible)")) {
            await eliminarEquipo(id);
            cargarEquipos();
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Equipos / Categorías</h3>
            <div className="mb-4">
                {/* <h5 className="mb-2">{editando ? "Editar equipo/categoría" : "Nuevo equipo/categoría"}</h5> */}
                <EquipoForm
                    onSave={handleGuardar}
                    initialData={editando}
                    modoEdicion={!!editando}
                    onCancel={handleCancelarEdicion}
                />
            </div>
            <hr className="my-4" style={{ borderTop: "2px solid #888" }} />
            <div>
                <h5 className="mb-3">Listado de equipos/categorías</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipos.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center text-muted">
                                    No hay equipos/categorías registrados.
                                </td>
                            </tr>
                        ) : (
                            equipos.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.nombre}</td>
                                    <td>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => setEditando(e)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleEliminar(e.id)}
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
