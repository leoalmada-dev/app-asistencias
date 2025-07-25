// src/components/PracticaForm.jsx
import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";

export default function PracticaForm({ onSave, initialData = {}, modoEdicion = false }) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        lugar: "",
        observaciones: "",
        asistencias: [],
    });

    const [jugadores, setJugadores] = useState([]);
    const { equipoId } = useEquipo();

    useEffect(() => {
        obtenerJugadores().then(js => {
            setJugadores(js.filter(j => j.equipoId === equipoId));
        });
    }, [equipoId]);

    useEffect(() => {
        if (initialData && initialData.asistencias) {
            setForm({ ...form, ...initialData });
        } else {
            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));
            setForm((f) => ({ ...f, asistencias: asistenciasIniciales }));
        }
    }, [jugadores]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const togglePresente = (index) => {
        const nuevas = [...form.asistencias];
        nuevas[index].presente = !nuevas[index].presente;
        setForm({ ...form, asistencias: nuevas });
    };

    const cambiarMotivo = (index, motivo) => {
        const nuevas = [...form.asistencias];
        nuevas[index].motivo = motivo;
        setForm({ ...form, asistencias: nuevas });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        setForm({ fecha: "", hora: "", lugar: "", observaciones: "", asistencias: [] });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleFormChange} required />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group className="mb-3">
                        <Form.Label>Hora</Form.Label>
                        <Form.Control type="time" name="hora" value={form.hora} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Lugar</Form.Label>
                        <Form.Control name="lugar" value={form.lugar} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control name="observaciones" value={form.observaciones} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
            </Row>

            <h5>Asistencias</h5>
            <Table size="sm" bordered hover>
                <thead>
                    <tr>
                        <th>Jugador</th>
                        <th>Presente</th>
                        <th>Motivo (si falta)</th>
                    </tr>
                </thead>
                <tbody>
                    {form.asistencias.map((a, i) => (
                        <tr key={i}>
                            <td>{a.nombre}</td>
                            <td>
                                <Form.Check
                                    type="checkbox"
                                    checked={a.presente}
                                    onChange={() => togglePresente(i)}
                                />
                            </td>
                            <td>
                                {!a.presente && (
                                    <Form.Control
                                        size="sm"
                                        placeholder="Motivo"
                                        value={a.motivo}
                                        onChange={(e) => cambiarMotivo(i, e.target.value)}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                {modoEdicion ? "Actualizar práctica" : "Registrar práctica"}
            </Button>
        </Form>
    );
}
