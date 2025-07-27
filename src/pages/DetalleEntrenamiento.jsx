import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerEntrenamientos, actualizarEntrenamiento, obtenerJugadores } from "../hooks/useDB";
import { Table, Button, Form, Alert } from "react-bootstrap";

export default function DetalleEntrenamiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entrenamiento, setEntrenamiento] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [notasEntrenador, setNotasEntrenador] = useState("");
  const [editando, setEditando] = useState(false);
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    obtenerEntrenamientos().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setEntrenamiento(p);
      setAsistencias(p?.asistencias || []);
      setNotasEntrenador(p?.notasEntrenador || "");
    });
    obtenerJugadores().then(js => setJugadores(js));
  }, [id]);

  if (!entrenamiento) return <Alert variant="warning">Entrenamiento no encontrado</Alert>;

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
    await actualizarEntrenamiento(entrenamiento.id, {
      ...entrenamiento,
      asistencias,
      notasEntrenador
    });
    setEditando(false);
    obtenerEntrenamientos().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setEntrenamiento(p);
      setAsistencias(p?.asistencias || []);
      setNotasEntrenador(p?.notasEntrenador || "");
    });
  };

  return (
    <div className="container mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        ← Volver
      </Button>
      <h4 className="mb-3">Detalle de entrenamiento</h4>
      <div className="mb-3">
        <b>Fecha:</b> {entrenamiento.fecha} <br />
        <b>Hora:</b> {entrenamiento.hora} <br />
        <b>Lugar:</b> {entrenamiento.lugar}
      </div>

      <hr className="mb-4 mt-3" style={{ borderTop: "2px solid #888" }} />

      <h5>Asistencias</h5>
      <Table bordered hover size="sm" className="mb-4">
        <thead>
          <tr>
            <th style={{ width: "5%" }} className="text-center">#</th>
            <th style={{ width: "55%" }}>Jugador</th>
            <th style={{ width: "15%" }} className="text-center">Presente</th>
            <th style={{ width: "25%" }}>Motivo (si falta)</th>
          </tr>
        </thead>
        <tbody>
          {[...asistencias]
            .map((a) => {
              const jugador = jugadores.find(j => j.id === a.jugadorId);
              return {
                ...a,
                numero: jugador?.numero || 999,
                nombreCompleto: jugador
                  ? `#${jugador.numero || "--"} - ${jugador.nombre}`
                  : a.nombre,
              };
            })
            .sort((a, b) => {
              if (a.numero !== b.numero) return a.numero - b.numero;
              return a.nombreCompleto.localeCompare(b.nombreCompleto);
            })
            .map((a, i) => (
              <tr key={a.jugadorId || i}>
                <td className="text-center">{i + 1}</td>
                <td>{a.nombreCompleto}</td>
                <td className="text-center align-middle">
                  {editando ? (
                    <Form.Check
                      checked={a.presente}
                      className="m-0"
                      style={{ verticalAlign: "middle" }}
                      onChange={() => {
                        const idx = asistencias.findIndex(as => as.jugadorId === a.jugadorId);
                        if (idx !== -1) handleCheck(idx);
                      }}
                    />
                  ) : (
                    a.presente ? "✔️" : "❌"
                  )}
                </td>
                <td style={{ minWidth: 180 }}>
                  {editando ? (
                    !a.presente ? (
                      <Form.Control
                        size="sm"
                        value={a.motivo}
                        onChange={e => {
                          const idx = asistencias.findIndex(as => as.jugadorId === a.jugadorId);
                          if (idx !== -1) handleMotivo(idx, e.target.value);
                        }}
                        placeholder="Motivo"
                      />
                    ) : (
                      <div style={{ height: "31px" }} /> // misma altura que un input sm
                    )
                  ) : (
                    !a.presente ? a.motivo : ""
                  )}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-end">
              <b>Presentes:</b> {asistencias.filter(a => a.presente).length} / {asistencias.length}
            </td>
          </tr>
        </tfoot>
      </Table>

      <hr className="mb-4 mt-3" style={{ borderTop: "2px solid #888" }} />

      <Form.Group className="mb-4">
        <Form.Label>Notas del entrenador</Form.Label>
        {editando ? (
          <Form.Control
            as="textarea"
            rows={3}
            value={notasEntrenador}
            onChange={e => setNotasEntrenador(e.target.value)}
            placeholder="Anotaciones tácticas, incidencias, lesiones, etc."
          />
        ) : (
          <div className="border rounded p-2 bg-light-subtle" style={{ minHeight: 60 }}>
            {notasEntrenador || <span className="text-muted">Sin notas</span>}
          </div>
        )}
      </Form.Group>

      <div className="d-flex gap-2">
        {editando ? (
          <>
            <Button variant="success" onClick={handleSave}>
              Guardar cambios
            </Button>
            <Button variant="secondary" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <Button variant="warning" onClick={() => setEditando(true)}>
            Editar entrenamiento
          </Button>
        )}
      </div>
    </div>
  );
}
