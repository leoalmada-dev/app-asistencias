import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPracticas, actualizarPractica } from "../hooks/useDB";
import { Table, Button, Form, Alert } from "react-bootstrap";

export default function DetallePractica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    obtenerPracticas().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setPractica(p);
      setAsistencias(p?.asistencias || []);
    });
  }, [id]);

  if (!practica) return <Alert variant="warning">Práctica no encontrada</Alert>;

  // Manejo de edición de asistencias:
  const handleCheck = (i) => {
    const nuevas = [...asistencias];
    nuevas[i].presente = !nuevas[i].presente;
    if (nuevas[i].presente) nuevas[i].motivo = "";
    setAsistencias(nuevas);
  };

  const handleMotivo = (i, motivo) => {
    const nuevas = [...asistencias];
    nuevas[i].motivo = motivo;
    setAsistencias(nuevas);
  };

  const handleSave = async () => {
    await actualizarPractica(practica.id, { ...practica, asistencias });
    setEditando(false);
    // Recargar
    obtenerPracticas().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setPractica(p);
      setAsistencias(p?.asistencias || []);
    });
  };

  return (
    <div className="container mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>← Volver</Button>
      <h4>Detalle de práctica</h4>
      <p>
        <b>Fecha:</b> {practica.fecha} <br />
        <b>Hora:</b> {practica.hora} <br />
        <b>Lugar:</b> {practica.lugar} <br />
        <b>Observaciones:</b> {practica.observaciones}
      </p>

      <h5>Asistencias</h5>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Presente</th>
            <th>Motivo (si falta)</th>
          </tr>
        </thead>
        <tbody>
          {asistencias.map((a, i) => (
            <tr key={i}>
              <td>{a.nombre}</td>
              <td>
                {editando ? (
                  <Form.Check
                    checked={a.presente}
                    onChange={() => handleCheck(i)}
                  />
                ) : (
                  a.presente ? "✔️" : "❌"
                )}
              </td>
              <td>
                {editando ? (
                  !a.presente && (
                    <Form.Control
                      size="sm"
                      value={a.motivo}
                      onChange={e => handleMotivo(i, e.target.value)}
                      placeholder="Motivo"
                    />
                  )
                ) : (
                  !a.presente ? a.motivo : ""
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editando ? (
        <>
          <Button variant="success" className="me-2" onClick={handleSave}>Guardar cambios</Button>
          <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
        </>
      ) : (
        <Button variant="warning" onClick={() => setEditando(true)}>Editar asistencias</Button>
      )}
    </div>
  );
}
