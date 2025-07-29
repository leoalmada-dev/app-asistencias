import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Form, Alert, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaTimes, FaFutbol, FaEdit, FaInfoCircle } from "react-icons/fa";
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
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
      .map(j => ({
        jugadorId: j.id,
        minutoEntrada: 0,
        minutoSalida: partido?.duracion || 70,
        goles: 0
      }));
    // Ordenar todas las participaciones por nombre
    const todas = [
      ...participaciones,
      ...nuevos
    ].map(p => ({
      ...p,
      jugador: jugadores.find(j => j.id === Number(p.jugadorId)) || {}
    }))
      .sort((a, b) => (a.jugador.nombre || "").localeCompare(b.jugador.nombre || ""))
      .map(({ jugador, ...resto }) => resto);
    setParticipaciones(todas);
  };

  // Ordena jugadores para selects
  const jugadoresOrdenados = [...jugadores].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

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

  // Solo jugadores que participaron o están ya en el cambio (aunque hayan sido quitados luego)
  const jugadoresParticipantes = participaciones
    .filter(p => p.jugadorId)
    .map(p => Number(p.jugadorId));
  function opcionesCambio(actualId) {
    // Devuelve [{id, label, inactivo}]
    return jugadores
      .filter(j =>
        jugadoresParticipantes.includes(j.id) ||
        actualId === String(j.id) // Asegura mostrar aunque ya no esté en participaciones (siendo editado)
      )
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
      .map(j => ({
        id: j.id,
        label: j.nombre + (j.numero ? ` - #${j.numero}` : ""),
        inactivo: !j.activo
      }));
  }

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

  // -- Nueva utilidad para marcar inactivos --
  const esInactivo = (jugadorId) => {
    const jug = jugadores.find(j => j.id === Number(jugadorId));
    return jug && !jug.activo;
  };

  return (
    <div className="container mt-4">
      <Button
        variant="outline-secondary"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </Button>

      <h4 className="mb-3 d-flex align-items-center">
        <FaFutbol className="me-2" size={22} />
        Detalle de partido
      </h4>

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
        <div className="d-flex align-items-center mb-2">
          <h5 className="mb-0">
            Participaciones{" "}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  Solo los jugadores activos pueden seleccionarse.<br />
                  Los inactivos aparecen apagados y no se pueden agregar a nuevos partidos.
                </Tooltip>
              }
            >
              <FaInfoCircle className="ms-1 text-secondary" style={{ fontSize: 16, cursor: "pointer" }} />
            </OverlayTrigger>
          </h5>
        </div>
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
            <tr  className="text-center">
              <th style={{ width: "5%" }}>#</th>
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
              const nombre = jugador ? `${jugador.nombre}${jugador.numero ? ` - #${jugador.numero}` : ""}` : "Sin nombre";
              const estaInactivo = jugador && !jugador.activo;
              return (
                <tr key={i} style={estaInactivo ? { color: "#888", background: "#f8f9fa", opacity: 0.7, fontStyle: "italic" } : {}}>
                  <td className="text-center">{i + 1}</td>
                  <td>
                    {editando ? (
                      <div className="d-flex align-items-center">
                        <Form.Select
                          value={p.jugadorId}
                          onChange={e => handleParticipacion(i, "jugadorId", e.target.value)}
                          style={estaInactivo ? { color: "#aaa", fontStyle: "italic" } : {}}
                        >
                          <option value="">Seleccionar</option>
                          {jugadoresOrdenados
                            .filter(j => j.activo || p.jugadorId === j.id) // Solo activos y el ya seleccionado
                            .map(j => {
                              const yaUsado = participaciones.some((x, idx) =>
                                idx !== i && x.jugadorId === j.id
                              );
                              const label = j.nombre + (j.numero ? ` - #${j.numero}` : "");
                              return (
                                <option
                                  key={j.id}
                                  value={j.id}
                                  disabled={yaUsado || (!j.activo && p.jugadorId !== j.id)}
                                  style={!j.activo ? { color: "#aaa", fontStyle: "italic" } : {}}
                                >
                                  {label}{!j.activo ? " (inactivo)" : ""}
                                </option>
                              );
                            })}
                        </Form.Select>
                        {estaInactivo && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Jugador inactivo (no se puede asignar a nuevos partidos)</Tooltip>}
                          >
                            <Badge bg="secondary" className="ms-2">inactivo</Badge>
                          </OverlayTrigger>
                        )}
                      </div>
                    ) : (
                      <span>
                        {nombre}
                        {estaInactivo && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Jugador inactivo en este partido</Tooltip>}
                          >
                            <Badge bg="secondary" className="ms-2">inactivo</Badge>
                          </OverlayTrigger>
                        )}
                      </span>
                    )}
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
        <div className="d-flex align-items-center mb-2">
          <h5 className="mb-0">
            Cambios{" "}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  Solo pueden seleccionarse jugadores que participaron en este partido.<br />
                  Los inactivos aparecen apagados y no pueden asignarse nuevos cambios.
                </Tooltip>
              }
            >
              <FaInfoCircle className="ms-1 text-secondary" style={{ fontSize: 16, cursor: "pointer" }} />
            </OverlayTrigger>
          </h5>
        </div>
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
                      {opcionesCambio(c.entra).map(j => (
                        <option
                          key={j.id}
                          value={j.id}
                          style={j.inactivo ? { color: "#aaa", fontStyle: "italic" } : {}}
                        >
                          {j.label}{j.inactivo ? " (inactivo)" : ""}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    (() => {
                      const j = jugadores.find(jg => jg.id === Number(c.entra));
                      return j ? `${j.nombre}${j.numero ? ` - #${j.numero}` : ""}` : "-";
                    })()
                  )}
                </td>
                <td>
                  {editando ? (
                    <Form.Select
                      value={c.sale}
                      onChange={e => handleCambio(i, "sale", e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {opcionesCambio(c.sale).map(j => (
                        <option
                          key={j.id}
                          value={j.id}
                          style={j.inactivo ? { color: "#aaa", fontStyle: "italic" } : {}}
                        >
                          {j.label}{j.inactivo ? " (inactivo)" : ""}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    (() => {
                      const j = jugadores.find(jg => jg.id === Number(c.sale));
                      return j ? `${j.nombre}${j.numero ? ` - #${j.numero}` : ""}` : "-";
                    })()
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
        <ul className="mb-2">
          <li>
            <b>Jugadores utilizados:</b> {totalParticipantes}
          </li>
          <li>
            <b>Total de cambios realizados:</b> {cambios.length}
          </li>
          <li>
            <b>Minutos promedio jugados:</b> {minutosPromedio} min
          </li>
          {goleadores.length > 0 && (
            <li>
              <b>Goleadores:</b>
              <ul style={{ marginBottom: 0 }}>
                {goleadores.map(g => {
                  const j = jugadores.find(jg => jg.id === Number(g.jugadorId));
                  return (
                    <li key={g.jugadorId}>
                      {j ? `${j.nombre}${j.numero ? ` - #${j.numero}` : ""}` : "Sin nombre"} — {g.goles}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}
        </ul>
      </div>

      <hr />

      <div className="mb-4">
        <h5>
          Notas del entrenador{" "}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Agregá observaciones tácticas, incidencias, lesiones, etc.</Tooltip>}
          >
            <FaInfoCircle className="ms-1 text-secondary" style={{ fontSize: 16, cursor: "pointer" }} />
          </OverlayTrigger>
        </h5>
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
            <Button variant="success" onClick={handleSave} className="me-2">
              <FaEdit className="me-1" />Guardar
            </Button>
            <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          </>
        ) : (
          <Button variant="warning" onClick={() => setEditando(true)}>
            <FaEdit className="me-1" />Editar partido
          </Button>
        )}
      </div>
    </div>
  );
}
