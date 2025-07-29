import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerEntrenamientos, actualizarEntrenamiento, obtenerJugadores } from "../hooks/useDB";
import { Table, Button, Form, Alert, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

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

  // Devuelve el objeto jugador para el id
  const getJugador = (jugadorId) => jugadores.find(j => j.id === jugadorId);

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
          <tr className="text-center">
            <th style={{ width: "5%" }}>#</th>
            <th style={{ width: "55%" }}>Jugador</th>
            <th style={{ width: "15%" }}>Presente</th>
            <th style={{ width: "25%" }}>Motivo (si falta)</th>
          </tr>
        </thead>
        <tbody>
          {[...asistencias]
            .map((a) => {
              const jugador = getJugador(a.jugadorId);
              return {
                ...a,
                inactivo: jugador && !jugador.activo,
                nombreCompleto: jugador
                  ? jugador.nombre
                  : a.nombre,
              };
            })
            // Ordenar: activos primero, inactivos después, luego por nombre
            .sort((a, b) => {
              if (a.inactivo !== b.inactivo) return a.inactivo ? 1 : -1;
              return (a.nombreCompleto || "").localeCompare(b.nombreCompleto || "");
            })
            .map((a, i) => {
              const rowInactiva = a.inactivo ? { opacity: 0.56, background: "#f2f2f2" } : {};
              return (
                <tr key={a.jugadorId || i} style={rowInactiva}>
                  <td className="text-center">{i + 1}</td>
                  <td className="ps-2 align-middle">
                    <span style={a.inactivo ? { color: "#888", fontStyle: "italic" } : {}}>
                      {a.nombreCompleto}
                    </span>
                    {a.inactivo &&
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Jugador inactivo (no aparece en nuevas asistencias)</Tooltip>}
                      >
                        <Badge bg="secondary" className="ms-2">inactivo</Badge>
                      </OverlayTrigger>
                    }
                  </td>
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
                        disabled={a.inactivo}
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
                          disabled={a.inactivo}
                        />
                      ) : (
                        <div style={{ height: "31px" }} />
                      )
                    ) : (
                      !a.presente ? a.motivo : ""
                    )}
                  </td>
                </tr>
              );
            })}
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
