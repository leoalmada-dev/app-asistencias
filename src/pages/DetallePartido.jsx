import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPartidos, actualizarPartido } from "../hooks/useDB";
import { Table, Button, Form, Alert } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";

export default function DetallePartido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [editando, setEditando] = useState(false);
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    obtenerPartidos().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setPartido(p);
      setParticipaciones(p?.participaciones || []);
      setCambios(p?.cambios || []);
    });
    obtenerJugadores().then(setJugadores);
  }, [id]);

  if (!partido) return <Alert variant="warning">Partido no encontrado</Alert>;

  // Participaciones
  const handleParticipacion = (i, campo, valor) => {
    const nuevas = [...participaciones];
    nuevas[i][campo] = valor;
    setParticipaciones(nuevas);
  };

  // Cambios
  const handleCambio = (i, campo, valor) => {
    const nuevos = [...cambios];
    nuevos[i][campo] = valor;
    setCambios(nuevos);
  };

  const agregarParticipacion = () => {
    setParticipaciones(p => [
      ...p,
      { jugadorId: "", minutoEntrada: 0, minutoSalida: 70 }
    ]);
  };
  const eliminarParticipacion = (i) => {
    setParticipaciones(p => p.filter((_, idx) => idx !== i));
  };

  const agregarCambio = () => {
    setCambios(cs => [
      ...cs,
      { entra: "", sale: "", minuto: 0 }
    ]);
  };
  const eliminarCambio = (i) => {
    setCambios(cs => cs.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    await actualizarPartido(partido.id, { ...partido, participaciones, cambios });
    setEditando(false);
    // Recargar
    obtenerPartidos().then(lista => {
      const p = lista.find(pr => pr.id === Number(id));
      setPartido(p);
      setParticipaciones(p?.participaciones || []);
      setCambios(p?.cambios || []);
    });
  };

  return (
    <div className="container mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>← Volver</Button>
      <h4>Detalle de partido</h4>
      <p>
        <b>Fecha:</b> {partido.fecha} <br />
        <b>Hora:</b> {partido.hora} <br />
        <b>Tipo:</b> {partido.tipo} <br />
        <b>Torneo:</b> {partido.torneo} <br />
        <b>Rival:</b> {partido.rival} <br />
        <b>Resultado:</b> {partido.golesFavor} - {partido.golesContra}
      </p>

      <h5>Participaciones</h5>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Minuto entrada</th>
            <th>Minuto salida</th>
            {editando && <th>Quitar</th>}
          </tr>
        </thead>
        <tbody>
          {participaciones.map((p, i) => (
            <tr key={i}>
              <td>
                {editando ? (
                  <Form.Select
                    value={p.jugadorId}
                    onChange={e => handleParticipacion(i, "jugadorId", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {jugadores.map(j => (
                      <option key={j.id} value={j.id}>{j.nombre}</option>
                    ))}
                  </Form.Select>
                ) : (
                  jugadores.find(j => j.id === Number(p.jugadorId))?.nombre || "-"
                )}
              </td>
              <td>
                {editando ? (
                  <Form.Control
                    type="number"
                    value={p.minutoEntrada}
                    min={0}
                    onChange={e => handleParticipacion(i, "minutoEntrada", e.target.value)}
                  />
                ) : (
                  p.minutoEntrada
                )}
              </td>
              <td>
                {editando ? (
                  <Form.Control
                    type="number"
                    value={p.minutoSalida}
                    min={0}
                    onChange={e => handleParticipacion(i, "minutoSalida", e.target.value)}
                  />
                ) : (
                  p.minutoSalida
                )}
              </td>
              {editando && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => eliminarParticipacion(i)}>Quitar</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {editando && (
        <Button variant="outline-success" size="sm" className="mb-2" onClick={agregarParticipacion}>
          + Agregar participación
        </Button>
      )}

      <h5 className="mt-4">Cambios</h5>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Entra</th>
            <th>Sale</th>
            <th>Minuto</th>
            {editando && <th>Quitar</th>}
          </tr>
        </thead>
        <tbody>
          {cambios.map((c, i) => (
            <tr key={i}>
              <td>
                {editando ? (
                  <Form.Select
                    value={c.entra}
                    onChange={e => handleCambio(i, "entra", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {jugadores.map(j => (
                      <option key={j.id} value={j.id}>{j.nombre}</option>
                    ))}
                  </Form.Select>
                ) : (
                  jugadores.find(j => j.id === Number(c.entra))?.nombre || "-"
                )}
              </td>
              <td>
                {editando ? (
                  <Form.Select
                    value={c.sale}
                    onChange={e => handleCambio(i, "sale", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {jugadores.map(j => (
                      <option key={j.id} value={j.id}>{j.nombre}</option>
                    ))}
                  </Form.Select>
                ) : (
                  jugadores.find(j => j.id === Number(c.sale))?.nombre || "-"
                )}
              </td>
              <td>
                {editando ? (
                  <Form.Control
                    type="number"
                    value={c.minuto}
                    min={0}
                    onChange={e => handleCambio(i, "minuto", e.target.value)}
                  />
                ) : (
                  c.minuto
                )}
              </td>
              {editando && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => eliminarCambio(i)}>Quitar</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {editando && (
        <Button variant="outline-success" size="sm" className="mb-2" onClick={agregarCambio}>
          + Agregar cambio
        </Button>
      )}

      {editando ? (
        <>
          <Button variant="success" className="me-2" onClick={handleSave}>Guardar cambios</Button>
          <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
        </>
      ) : (
        <Button variant="warning" onClick={() => setEditando(true)}>Editar partido</Button>
      )}
    </div>
  );
}
