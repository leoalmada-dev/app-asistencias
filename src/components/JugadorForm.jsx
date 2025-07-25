import { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function JugadorForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [form, setForm] = useState({
        nombre: "",
        numero: "",
        posicion: "",
        activo: true
    });

    // Autocompletar en edición
    useEffect(() => {
        if (modoEdicion && initialData) {
            setForm({
                nombre: initialData.nombre || "",
                numero: initialData.numero || "",
                posicion: initialData.posicion || "",
                activo: initialData.activo ?? true
            });
        } else if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                activo: true
            });
        }
    }, [initialData, modoEdicion]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                activo: true
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nro</Form.Label>
                        <Form.Control
                            name="numero"
                            value={form.numero}
                            onChange={handleChange}
                            type="number"
                            min="1"
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Posición</Form.Label>
                        <Form.Control
                            name="posicion"
                            value={form.posicion}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group className="mb-3">
                        <Form.Label>Activo</Form.Label>
                        <Form.Check
                            type="checkbox"
                            name="activo"
                            label="Sí"
                            checked={form.activo}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-flex gap-2 align-items-center mt-3">
                <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                    {modoEdicion ? "Actualizar" : "Agregar jugador"}
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
