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
  const [notasEntrenador, setNotasEntrenador] = useState("");

  useEffect(() => {
    obtenerPartidos().then(lista => {
      const partidoSel = lista.find(pr => pr.id === Number(id));
      setPartido(partidoSel);
      setParticipaciones(partidoSel?.participaciones || []);
      setCambios(partidoSel?.cambios || []);
      setNotasEntrenador(partidoSel?.notasEntrenador || "");
      // Filtrar jugadores por equipo del partido seleccionado
      obtenerJugadores().then(jugs => {
        const jugadoresEquipo = partidoSel ? jugs.filter(j => j.equipoId === partidoSel.equipoId) : [];
        setJugadores(jugadoresEquipo);
      });
    });
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
    setParticipaciones(part => [
      ...part,
      { jugadorId: "", minutoEntrada: 0, minutoSalida: 70, goles: 0 }
    ]);
  };
  const eliminarParticipacion = (i) => {
    setParticipaciones(part => part.filter((_, idx) => idx !== i));
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
    await actualizarPartido(partido.id, {
      ...partido,
      participaciones,
      cambios,
      notasEntrenador
    });
    setEditando(false);
    // Recargar
    obtenerPartidos().then(lista => {
      const partidoSel = lista.find(pr => pr.id === Number(id));
      setPartido(partidoSel);
      setParticipaciones(partidoSel?.participaciones || []);
      setCambios(partidoSel?.cambios || []);
      setNotasEntrenador(partidoSel?.notasEntrenador || "");
      // Filtrar jugadores por equipo del partido actualizado
      obtenerJugadores().then(jugs => {
        const jugadoresEquipo = partidoSel ? jugs.filter(j => j.equipoId === partidoSel.equipoId) : [];
        setJugadores(jugadoresEquipo);
      });
    });
  };

  // === RESUMEN DE PARTIDO ===
  const totalParticipantes = participaciones.filter(p => p.jugadorId).length;
  const minutosPromedio = participaciones.length
    ? Math.round(
      participaciones
        .map(p => (parseInt(p.minutoSalida) - parseInt(p.minutoEntrada)))
        .reduce((a, b) => a + b, 0) / participaciones.length
    )
    : 0;
  const goleadores = participaciones.filter(p => p.goles > 0);

  return (
    <div className="container mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>← Volver</Button>

      <div className="mb-4">
        <h4 className="mb-3">Detalle de partido</h4>
        <hr />
        <div className="mb-2">
          <b>Fecha:</b> {partido.fecha} <br />
          <b>Hora:</b> {partido.hora} <br />
          <b>Tipo:</b> {partido.tipo} <br />
          <b>Torneo:</b> {partido.torneo} <br />
          <b>Rival:</b> {partido.rival} <br />
          <b>Resultado:</b> {partido.golesFavor} - {partido.golesContra}
        </div>
      </div>

      <div className="mb-4">
        <h5>Participaciones</h5>
        <hr />
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Minuto entrada</th>
              <th>Minuto salida</th>
              <th>Goles</th>
              {editando && <th>Quitar</th>}
            </tr>
          </thead>
          <tbody>
            {participaciones.map((part, i) => (
              <tr key={i}>
                <td>
                  {editando ? (
                    <Form.Select
                      value={part.jugadorId}
                      onChange={e => handleParticipacion(i, "jugadorId", e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {jugadores.map(j => (
                        <option key={j.id} value={j.id}>{j.nombre}</option>
                      ))}
                    </Form.Select>
                  ) : (
                    jugadores.find(j => j.id === Number(part.jugadorId))?.nombre || "-"
                  )}
                </td>
                <td>
                  {editando ? (
                    <Form.Control
                      type="number"
                      value={part.minutoEntrada}
                      min={0}
                      onChange={e => handleParticipacion(i, "minutoEntrada", e.target.value)}
                    />
                  ) : (
                    part.minutoEntrada
                  )}
                </td>
                <td>
                  {editando ? (
                    <Form.Control
                      type="number"
                      value={part.minutoSalida}
                      min={0}
                      onChange={e => handleParticipacion(i, "minutoSalida", e.target.value)}
                    />
                  ) : (
                    part.minutoSalida
                  )}
                </td>
                <td>
                  {editando ? (
                    <Form.Control
                      type="number"
                      min={0}
                      value={part.goles || 0}
                      onChange={e => handleParticipacion(i, "goles", parseInt(e.target.value) || 0)}
                      style={{ width: 70 }}
                    />
                  ) : (
                    part.goles || 0
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
      </div>

      <div className="mb-4">
        <h5>Cambios</h5>
        <hr />
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
      </div>

      {/* SEPARADOR VISUAL */}
      <hr className="my-4" style={{ borderTop: "2px solid #888" }} />

      {/* RESUMEN DEL PARTIDO */}
      <div className="mb-4">
        <h5>Resumen del partido</h5>
        <hr />
        <ul>
          <li>
            <b>Jugadores utilizados:</b> {totalParticipantes}
          </li>
          <li>
            <b>Total de cambios realizados:</b> {cambios.length}
          </li>
          <li>
            <b>Minutos jugados promedio:</b> {minutosPromedio} min
          </li>
          {goleadores.length > 0 && (
            <li>
              <b>Goleadores:</b>
              <ul>
                {goleadores.map(g => (
                  <li key={g.jugadorId}>
                    {jugadores.find(j => j.id === Number(g.jugadorId))?.nombre || "Sin nombre"} — {g.goles} gol(es)
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>

      {/* SEPARADOR VISUAL */}
      <hr className="my-4" style={{ borderTop: "2px dashed #999" }} />

      {/* NOTAS DEL ENTRENADOR */}
      <div className="mb-4">
        <h5>Notas del entrenador</h5>
        <hr />
        <Form.Group>
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
      </div>

      <div className="mb-4">
        {editando ? (
          <>
            <Button variant="success" className="me-2" onClick={handleSave}>Guardar cambios</Button>
            <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          </>
        ) : (
          <Button variant="warning" onClick={() => setEditando(true)}>Editar partido</Button>
        )}
      </div>
    </div>
  );
}
