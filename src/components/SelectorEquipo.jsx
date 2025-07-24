// src/components/SelectorEquipo.jsx
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";
import { obtenerEquipos } from "../hooks/useDB";

export default function SelectorEquipo() {
  const { equipoId, setEquipoId } = useEquipo();
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    obtenerEquipos().then(setEquipos);
  }, []);

  return (
    <Form.Group className="mb-3">
      <Form.Label>Seleccionar equipo</Form.Label>
      <Form.Select value={equipoId || ""} onChange={(e) => setEquipoId(parseInt(e.target.value))}>
        <option value="">-- Elegí un equipo --</option>
        {equipos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
