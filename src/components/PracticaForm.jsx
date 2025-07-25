import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";

export default function PracticaForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        lugar: "",
        asistencias: [],
    });

    const [jugadores, setJugadores] = useState([]);
    const { equipoId } = useEquipo();

    // Cargar jugadores cuando cambia equipo
    useEffect(() => {
        obtenerJugadores().then(js => {
            setJugadores(js.filter(j => j.equipoId === equipoId));
        });
    }, [equipoId]);

    // Sincroniza formulario con datos iniciales (edición) o genera asistencias por defecto (nuevo)
    useEffect(() => {
        if (modoEdicion && initialData && initialData.asistencias) {
            setForm({
                fecha: initialData.fecha || "",
                hora: initialData.hora || "",
                lugar: initialData.lugar || "",
                asistencias: initialData.asistencias.map(a => ({
                    jugadorId: a.jugadorId,
                    nombre: a.nombre,
                    presente: a.presente ?? true,
                    motivo: a.motivo || ""
                }))
            });
        } else if (!modoEdicion && jugadores.length > 0) {
            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));
            setForm(f => ({
                ...f,
                asistencias: asistenciasIniciales
            }));
        }
    // eslint-disable-next-line
    }, [initialData, modoEdicion, jugadores]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const togglePresente = (index) => {
        setForm(f => {
            const nuevas = [...f.asistencias];
            nuevas[index].presente = !nuevas[index].presente;
            // Si se marca presente, limpia motivo
            if (nuevas[index].presente) nuevas[index].motivo = "";
            return { ...f, asistencias: nuevas };
        });
    };

    const cambiarMotivo = (index, motivo) => {
        setForm(f => {
            const nuevas = [...f.asistencias];
            nuevas[index].motivo = motivo;
            return { ...f, asistencias: nuevas };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        if (!modoEdicion) {
            setForm({
                fecha: "",
                hora: "",
                lugar: "",
                asistencias: jugadores.map((j) => ({
                    jugadorId: j.id,
                    nombre: j.nombre,
                    presente: true,
                    motivo: "",
                }))
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleFormChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Hora</Form.Label>
                        <Form.Control
                            type="time"
                            name="hora"
                            value={form.hora}
                            onChange={handleFormChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Lugar</Form.Label>
                        <Form.Control
                            name="lugar"
                            value={form.lugar}
                            onChange={handleFormChange}
                        />
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
                        <tr key={a.jugadorId || i}>
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

            <div className="d-flex gap-2 align-items-center mt-3">
                <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                    {modoEdicion ? "Actualizar" : "Registrar práctica"}
                </Button>
                {modoEdicion && onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </Form>
    );
}
