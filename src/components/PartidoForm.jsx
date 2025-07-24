// src/components/PartidoForm.jsx
import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";

export default function PartidoForm({ onSave, initialData = {}, modoEdicion = false }) {
  const [form, setForm] = useState({
    fecha: "",
    hora: "",
    tipo: "amistoso",
    torneo: "",
    rival: "",
    golesFavor: 0,
    golesContra: 0,
    participaciones: [],
    cambios: [],
  });

  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    obtenerJugadores().then(setJugadores);
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({ ...form, ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleParticipacionChange = (index, campo, valor) => {
    const nuevas = [...form.participaciones];
    nuevas[index][campo] = valor;
    setForm({ ...form, participaciones: nuevas });
  };

  const agregarParticipante = () => {
    setForm((f) => ({
      ...f,
      participaciones: [...f.participaciones, { jugadorId: "", minutoEntrada: 0, minutoSalida: 70 }]
    }));
  };

  const eliminarParticipante = (index) => {
    const nuevas = [...form.participaciones];
    nuevas.splice(index, 1);
    setForm({ ...form, participaciones: nuevas });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({
      fecha: "",
      hora: "",
      tipo: "amistoso",
      torneo: "",
      rival: "",
      golesFavor: 0,
      golesContra: 0,
      participaciones: [],
      cambios: [],
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group className="mb-3">
            <Form.Label>Hora</Form.Label>
            <Form.Control type="time" name="hora" value={form.hora} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="amistoso">Amistoso</option>
              <option value="campeonato">Campeonato</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Torneo</Form.Label>
            <Form.Control name="torneo" value={form.torneo} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Rival</Form.Label>
            <Form.Control name="rival" value={form.rival} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Goles a favor</Form.Label>
            <Form.Control type="number" name="golesFavor" value={form.golesFavor} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Goles en contra</Form.Label>
            <Form.Control type="number" name="golesContra" value={form.golesContra} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>

      <h5>Participaciones</h5>
      <Button size="sm" onClick={agregarParticipante}>Agregar jugador</Button>

      <Table size="sm" bordered hover className="mt-2">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Minuto entrada</th>
            <th>Minuto salida</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {form.participaciones.map((p, i) => (
            <tr key={i}>
              <td>
                <Form.Select
                  value={p.jugadorId}
                  onChange={(e) => handleParticipacionChange(i, 'jugadorId', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {jugadores.map(j => (
                    <option key={j.id} value={j.id}>{j.nombre}</option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={p.minutoEntrada}
                  onChange={(e) => handleParticipacionChange(i, 'minutoEntrada', e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={p.minutoSalida}
                  onChange={(e) => handleParticipacionChange(i, 'minutoSalida', e.target.value)}
                />
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => eliminarParticipante(i)}>X</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
        {modoEdicion ? "Actualizar partido" : "Registrar partido"}
      </Button>
    </Form>
  );
}
