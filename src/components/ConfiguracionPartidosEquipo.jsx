// src/components/ConfiguracionPartidosEquipo.jsx
import { useEquipo } from "../context/EquipoContext";
import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function ConfiguracionPartidosEquipo() {
    const { equipos, equipoId, setEquipos } = useEquipo();
    const equipo = equipos.find(e => e.id === equipoId);

    // Estado local del form (se inicializa cuando cambia el equipo)
    const [form, setForm] = useState({
        duracion: 60,
        cambios: 7,
        puedeReingresar: true,
        jugadoresEnCancha: 9
    });
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        if (equipo && equipo.configPartidos) {
            setForm({
                duracion: equipo.configPartidos.duracion ?? 60,
                cambios: equipo.configPartidos.cambios ?? 7,
                puedeReingresar: equipo.configPartidos.puedeReingresar ?? true,
                jugadoresEnCancha: equipo.configPartidos.jugadoresEnCancha ?? 9
            });
        } else {
            setForm({ duracion: 60, cambios: 7, puedeReingresar: true, jugadoresEnCancha: 9 });
        }
    }, [equipoId, equipos]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : Number(value)
        }));
    };

    const handleGuardar = () => {
        // Actualiza la configuración en memoria
        setEquipos(eqs =>
            eqs.map(eq =>
                eq.id === equipoId
                    ? { ...eq, configPartidos: { ...form } }
                    : eq
            )
        );
        // TODO: persistir en la DB si corresponde (agregá lógica en hooks/useDB si guardás el objeto completo)
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2000);
    };

    if (!equipo) return <Alert variant="info">Seleccioná un equipo para editar su configuración.</Alert>;

    return (
        <Form className="mt-2">
            <Row>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Duración (min)</Form.Label>
                        <Form.Control
                            type="number"
                            name="duracion"
                            value={form.duracion}
                            min={10}
                            max={150}
                            step={5}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Cambios permitidos</Form.Label>
                        <Form.Control
                            type="number"
                            name="cambios"
                            value={form.cambios}
                            min={0}
                            max={22}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Jugadores en cancha</Form.Label>
                        <Form.Control
                            type="number"
                            name="jugadoresEnCancha"
                            value={form.jugadoresEnCancha}
                            min={5}
                            max={22}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                    <Form.Check
                        label="Permitir reingreso"
                        name="puedeReingresar"
                        checked={form.puedeReingresar}
                        onChange={handleChange}
                        type="checkbox"
                    />
                </Col>
            </Row>
            <Button className="mt-3" onClick={handleGuardar}>Guardar configuración</Button>
            {guardado && <div className="text-success mt-2">¡Configuración guardada!</div>}
        </Form>
    );
}
