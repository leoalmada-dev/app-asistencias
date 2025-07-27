import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";

export default function EntrenamientoForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        lugar: "",
        duracion: 60,
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
        if (modoEdicion && initialData && initialData.asistencias) {
            setForm({
                fecha: initialData.fecha || "",
                hora: initialData.hora || "",
                lugar: initialData.lugar || "",
                duracion: initialData.duracion || 60,
                asistencias: initialData.asistencias.map(a => ({
                    jugadorId: a.jugadorId,
                    nombre: a.nombre,
                    presente: a.presente ?? true,
                    motivo: a.motivo || ""
                }))
            });
        } else if (!modoEdicion && jugadores.length > 0) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraEntrenamiento") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionEntrenamiento")) || 60;

            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                lugar: "",
                duracion: ultimaDuracion,
                asistencias: asistenciasIniciales
            });
        }
        // eslint-disable-next-line
    }, [initialData, modoEdicion, jugadores]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: name === "duracion" ? parseInt(value) : value
        }));
    };

    const togglePresente = (index) => {
        setForm(f => {
            const nuevas = [...f.asistencias];
            nuevas[index].presente = !nuevas[index].presente;
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
        localStorage.setItem("ultimaHoraEntrenamiento", form.hora);
        localStorage.setItem("ultimaDuracionEntrenamiento", form.duracion.toString());

        if (!modoEdicion) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraEntrenamiento") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionEntrenamiento")) || 60;

            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                lugar: "",
                duracion: ultimaDuracion,
                asistencias: asistenciasIniciales
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <fieldset className={`rounded p-3 mb-4 ${modoEdicion ? "border border-warning" : "border"}`}>
                <legend className="float-none w-auto px-2 fs-5">
                    {modoEdicion ? "Editar entrenamiento" : "Registrar entrenamiento"}
                </legend>

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
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Duración (min)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duracion"
                                min={10}
                                step={5}
                                value={form.duracion}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
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

                <h5>Asistencias ({form.asistencias.length})</h5>
                <Table size="sm" bordered hover>
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }} className="text-center">#</th>
                            <th style={{ width: "55%" }}>Jugador</th>
                            <th style={{ width: "15%" }} className="text-center">Presente</th>
                            <th style={{ width: "25%" }}>Motivo (si falta)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.asistencias
                            .map((a) => {
                                const jugador = jugadores.find(j => j.id === a.jugadorId);
                                return {
                                    ...a,
                                    numero: jugador?.numero || 999,
                                    nombreCompleto: jugador?.numero
                                        ? `#${jugador.numero} - ${a.nombre}`
                                        : a.nombre
                                };
                            })
                            .sort((a, b) => {
                                const numA = parseInt(a.numero) || 999;
                                const numB = parseInt(b.numero) || 999;
                                if (numA !== numB) return numA - numB;
                                return a.nombreCompleto.localeCompare(b.nombreCompleto);
                            })
                            .map((a, index) => {
                                const i = form.asistencias.findIndex(as => as.jugadorId === a.jugadorId);
                                return (
                                    <tr key={a.jugadorId || index}>
                                        <td className="text-center align-middle">{index + 1}</td>
                                        <td className="align-middle">{a.nombreCompleto}</td>
                                        <td className="text-center align-middle">
                                            <Form.Check
                                                className="m-0"
                                                style={{ verticalAlign: "middle" }}
                                                type="checkbox"
                                                checked={a.presente}
                                                onChange={(e) => {
                                                    const nuevas = [...form.asistencias];
                                                    nuevas[i].presente = e.target.checked;
                                                    if (e.target.checked) nuevas[i].motivo = "";
                                                    setForm({ ...form, asistencias: nuevas });
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {!a.presente ? (
                                                <Form.Control
                                                    size="sm"
                                                    placeholder="Motivo"
                                                    value={a.motivo}
                                                    onChange={(e) => cambiarMotivo(i, e.target.value)}
                                                />
                                            ) : (
                                                <div style={{ height: "31px" }} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </Table>

                <div className="d-flex gap-2 align-items-center mt-3">
                    <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                        {modoEdicion ? "Actualizar" : "Registrar entrenamiento"}
                    </Button>
                    {modoEdicion && onCancel && (
                        <Button variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </fieldset>
        </Form>
    );
}
