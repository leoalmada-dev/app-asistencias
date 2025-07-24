// src/pages/Partidos.jsx
import { useEffect, useState } from "react";
import {
  obtenerPartidos,
  agregarPartido,
  actualizarPartido,
  eliminarPartido,
} from "../hooks/useDB";
import PartidoForm from "../components/PartidoForm";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Partidos() {
  const [partidos, setPartidos] = useState([]);
  const [editando, setEditando] = useState(null);

  const cargar = async () => {
    const lista = await obtenerPartidos();
    setPartidos(lista);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleGuardar = async (partido) => {
    if (editando) {
      await actualizarPartido(editando.id, partido);
      setEditando(null);
    } else {
      await agregarPartido(partido);
    }
    cargar();
  };

  const handleEliminar = async (id) => {
    if (confirm("¿Eliminar este partido?")) {
      await eliminarPartido(id);
      cargar();
    }
  };

  return (
    <div className="container mt-4">
      <h3>Partidos</h3>
      <PartidoForm onSave={handleGuardar} initialData={editando} modoEdicion={!!editando} />

      <Table striped bordered hover responsive className="mt-4">
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
          {partidos.map((p) => (
            <tr key={p.id}>
              <td>{p.fecha}</td>
              <td>{p.tipo}</td>
              <td>{p.rival}</td>
              <td>{p.golesFavor} - {p.golesContra}</td>
              <td>
                <Button variant="outline-warning" size="sm" onClick={() => setEditando(p)}>
                  <FaEdit />
                </Button>{" "}
                <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(p.id)}>
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
