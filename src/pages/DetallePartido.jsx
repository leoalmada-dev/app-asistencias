import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Form, Alert } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import {
  obtenerPartidos,
  actualizarPartido,
  obtenerJugadores
} from "../hooks/useDB";

export default function DetallePartido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partido, setPartido] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [editando, setEditando] = useState(false);
  const [notasEntrenador, setNotasEntrenador] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, [id]);

  const cargarDatos = async () => {
    const lista = await obtenerPartidos();
    const partidoSel = lista.find(p => p.id === Number(id));
    setPartido(partidoSel);
    setParticipaciones(partidoSel?.participaciones || []);
    setCambios(partidoSel?.cambios || []);
    setNotasEntrenador(partidoSel?.notasEntrenador || "");

    const js = await obtenerJugadores();
    const jugadoresEquipo = partidoSel ? js.filter(j => j.equipoId === partidoSel.equipoId) : [];
    setJugadores(jugadoresEquipo);
  };

  if (!partido) return <Alert variant="warning">Partido no encontrado</Alert>;

  const handleParticipacion = (index, campo, valor) => {
    setParticipaciones(prev => {
      const nuevas = [...prev];
      nuevas[index][campo] = valor;
      return nuevas;
    });
  };

  const agregarParticipacion = () => {
    setParticipaciones(prev => [
      ...prev,
      {
        jugadorId: "",
        minutoEntrada: 0,
        minutoSalida: partido?.duracion || 70,
        goles: 0
      }
    ]);
  };

  const eliminarParticipacion = (index) => {
    setParticipaciones(prev => prev.filter((_, i) => i !== index));
  };

  const completarParticipaciones = () => {
    const existentes = participaciones.map(p => p.jugadorId);
    const nuevos = jugadores
      .filter(j => !existentes.includes(j.id))
      .map(j => ({
        jugadorId: j.id,
        minutoEntrada: 0,
        minutoSalida: partido?.duracion || 70,
        goles: 0
      }));
    setParticipaciones(prev => [...prev, ...nuevos]);
  };

  const jugadoresOrdenados = [...jugadores].sort((a, b) => {
    const na = parseInt(a.numero) || 999;
    const nb = parseInt(b.numero) || 999;
    if (na !== nb) return na - nb;
    return a.nombre.localeCompare(b.nombre);
  });

  const handleCambio = (index, campo, valor) => {
    setCambios(prev => {
      const nuevos = [...prev];
      nuevos[index][campo] = valor;
      return nuevos;
    });
  };

  const agregarCambio = () => {
    setCambios(prev => [
      ...prev,
      {
        entra: "",
        sale: "",
        minuto: 0
      }
    ]);
  };

  const eliminarCambio = (index) => {
    setCambios(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await actualizarPartido(partido.id, {
      ...partido,
      participaciones,
      cambios,
      notasEntrenador
    });
    setEditando(false);
    await cargarDatos();
  };

  const totalParticipantes = participaciones.filter(p => p.jugadorId).length;
  const minutosPromedio = participaciones.length
    ? Math.round(participaciones
        .map(p => (parseInt(p.minutoSalida) - parseInt(p.minutoEntrada)))
        .reduce((a, b) => a + b, 0) / participaciones.length)
    : 0;
  const goleadores = participaciones.filter(p => p.goles > 0);

  return (
    <div className="container mt-4">
      <Button
        variant="outline-secondary"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </Button>

      <h4 className="mb-3">Detalle de partido</h4>

      <div className="mb-3">
        <b>Fecha:</b> {partido.fecha} <br />
        <b>Hora:</b> {partido.hora} <br />
        <b>Tipo:</b> {partido.tipo} <br />
        <b>Torneo:</b> {partido.torneo} <br />
        <b>Rival:</b> {partido.rival} <br />
        <b>Resultado:</b> {partido.golesFavor} - {partido.golesContra}
      </div>

      <hr />

      <div className="mb-4">
        <h5>Participaciones</h5>
        {editando && (
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Button
              variant="outline-success"
              size="sm"
              onClick={agregarParticipacion}
              disabled={participaciones.length >= jugadores.length}
            >
              + Agregar participación
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={completarParticipaciones}
              disabled={participaciones.length >= jugadores.length}
            >
              + Completar jugadores
            </Button>
          </div>
        )}

        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: "5%" }} className="text-center">#</th>
              <th style={{ width: "40%" }}>Jugador</th>
              <th style={{ width: "15%" }}>Entrada</th>
              <th style={{ width: "15%" }}>Salida</th>
              <th style={{ width: "15%" }}>Goles</th>
              {editando && <th style={{ width: "5%" }}></th>}
            </tr>
          </thead>
          <tbody>
            {participaciones.map((p, i) => {
              const jugador = jugadores.find(j => j.id === Number(p.jugadorId));
              const numero = jugador?.numero || 999;
              const nombre = jugador ? `#${numero} - ${jugador.nombre}` : "Sin nombre";

              return (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>
                    {editando ? (
                      <Form.Select
                        value={p.jugadorId}
                        onChange={e => handleParticipacion(i, "jugadorId", e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        {jugadoresOrdenados.map(j => {
                          const yaUsado = participaciones.some((x, idx) =>
                            idx !== i && x.jugadorId === j.id
                          );
                          return (
                            <option
                              key={j.id}
                              value={j.id}
                              disabled={yaUsado}
                            >
                              {j.numero ? `#${j.numero} - ${j.nombre}` : j.nombre}
                            </option>
                          );
                        })}
                      </Form.Select>
                    ) : nombre}
                  </td>
                  <td>
                    {editando ? (
                      <Form.Control
                        type="number"
                        min={0}
                        value={p.minutoEntrada}
                        onChange={e => handleParticipacion(i, "minutoEntrada", e.target.value)}
                      />
                    ) : p.minutoEntrada}
                  </td>
                  <td>
                    {editando ? (
                      <Form.Control
                        type="number"
                        min={0}
                        value={p.minutoSalida}
                        onChange={e => handleParticipacion(i, "minutoSalida", e.target.value)}
                      />
                    ) : p.minutoSalida}
                  </td>
                  <td>
                    {editando ? (
                      <Form.Control
                        type="number"
                        min={0}
                        value={p.goles || 0}
                        onChange={e => handleParticipacion(i, "goles", parseInt(e.target.value) || 0)}
                      />
                    ) : p.goles || 0}
                  </td>
                  {editando && (
                    <td className="text-center">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => eliminarParticipacion(i)}
                      >
                        <FaTimes />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <div className="mb-4">
        <h5>Cambios</h5>
        {editando && (
          <Button variant="outline-success" size="sm" onClick={agregarCambio}>
            + Agregar cambio
          </Button>
        )}
        <Table bordered hover size="sm" className="mt-2">
          <thead>
            <tr>
              <th style={{ width: "45%" }}>Entra</th>
              <th style={{ width: "45%" }}>Sale</th>
              <th style={{ width: "10%" }}>Minuto</th>
              {editando && <th style={{ width: "5%" }}></th>}
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
                      {jugadoresOrdenados.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.numero ? `#${j.numero} - ${j.nombre}` : j.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  ) : jugadores.find(j => j.id === Number(c.entra))?.nombre || "-"}
                </td>
                <td>
                  {editando ? (
                    <Form.Select
                      value={c.sale}
                      onChange={e => handleCambio(i, "sale", e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {jugadoresOrdenados.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.numero ? `#${j.numero} - ${j.nombre}` : j.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  ) : jugadores.find(j => j.id === Number(c.sale))?.nombre || "-"}
                </td>
                <td>
                  {editando ? (
                    <Form.Control
                      type="number"
                      value={c.minuto}
                      min={0}
                      onChange={e => handleCambio(i, "minuto", e.target.value)}
                    />
                  ) : c.minuto}
                </td>
                {editando && (
                  <td className="text-center">
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => eliminarCambio(i)}
                    >
                      <FaTimes />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <hr />

      <div className="mb-4">
        <h5>Resumen del partido</h5>
        <ul>
          <li><b>Jugadores utilizados:</b> {totalParticipantes}</li>
          <li><b>Total de cambios realizados:</b> {cambios.length}</li>
          <li><b>Minutos promedio jugados:</b> {minutosPromedio} min</li>
          {goleadores.length > 0 && (
            <li><b>Goleadores:</b>
              <ul>
                {goleadores.map(g => (
                  <li key={g.jugadorId}>
                    {jugadores.find(j => j.id === Number(g.jugadorId))?.nombre || "Sin nombre"} — {g.goles}
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>

      <hr />

      <div className="mb-4">
        <h5>Notas del entrenador</h5>
        <Form.Group>
          {editando ? (
            <Form.Control
              as="textarea"
              rows={3}
              value={notasEntrenador}
              onChange={e => setNotasEntrenador(e.target.value)}
              placeholder="Anotaciones tácticas, incidencias, etc."
            />
          ) : (
            <div className="border p-2 bg-light-subtle rounded" style={{ minHeight: 60 }}>
              {notasEntrenador || <span className="text-muted">Sin notas</span>}
            </div>
          )}
        </Form.Group>
      </div>

      <div className="mb-4">
        {editando ? (
          <>
            <Button variant="success" onClick={handleSave} className="me-2">Guardar</Button>
            <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          </>
        ) : (
          <Button variant="warning" onClick={() => setEditando(true)}>Editar partido</Button>
        )}
      </div>
    </div>
  );
}
